/**
 * Pokemon Grouping Utility
 * Groups Pokemon variations by nationalDexNumber and returns only base Pokemon
 * Uses pokemonList.json as the source of truth for base Pokemon names
 */

import pokemonListData from '../data/pokemonList.json'
import { getPokemonDBSprites } from './pokemondb'
import { getRecommendedGeneration } from './spriteValidator'

/**
 * Normalize Pokemon name (remove card variations like "Mega", "EX", "Light", "Dark", "Erika's", etc.)
 * @param {string} name - The Pokemon name
 * @returns {string} - Normalized name
 */
export function normalizePokemonName(name) {
  if (!name) return ''
  
  const variations = [
    /^Mega\s+/i,
    /^Light\s+/i,
    /^Dark\s+/i,
    /^Shining\s+/i,
    /^Giovanni's\s+/i,
    /^Erika's\s+/i,
    /^Blaine's\s+/i,
    /^Koga's\s+/i,
    /^Sabrina's\s+/i,
    /^Misty's\s+/i,
    /^Brock's\s+/i,
    /^Lt\.\s*Surge's\s+/i,
    /^Cynthia's\s+/i,
    /\s+EX$/i,
    /\s+GX$/i,
    /\s+V$/i,
    /\s+VMAX$/i,
    /\s+VSTAR$/i,
    /\s+Prime$/i,
    /\s+LV\.?\s*X$/i,
    /\s+LV\.?\s*\d+$/i,
    /\s+Break$/i,
    /\s+Tag Team$/i,
    /\s+&.*$/i,
    /\s+\(.*\)$/i,
  ]
  
  let normalized = name
  variations.forEach(pattern => {
    normalized = normalized.replace(pattern, '')
  })
  
  return normalized.trim() || name
}

/**
 * Generate PokemonList document ID (consistent with seeder)
 * @param {number} nationalDexNumber - National dex number
 * @param {string} name - Pokemon name
 * @returns {string|null} - Document ID or null
 */
export function generatePokemonListDocId(nationalDexNumber, name) {
  if (!nationalDexNumber || !name) return null
  const normalized = normalizePokemonName(name).toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return `dex-${nationalDexNumber}-${normalized}`
}

/**
 * Group Pokemon variations by nationalDexNumber and return only base Pokemon
 * Uses pokemonList.json as the source of truth for base names
 * @param {Array} enrichedPokemon - Array of Pokemon from Firestore (may include variations)
 * @returns {Array} - Array of base Pokemon with aggregated data
 */
export function groupPokemonByBase(enrichedPokemon = []) {
  // Start with the base Pokemon list (all Pokemon from national dex)
  const basePokemonMap = new Map()
  pokemonListData.forEach(p => {
    basePokemonMap.set(p.nationalDexNumber, {
      nationalDexNumber: p.nationalDexNumber,
      name: p.name,
      displayName: p.name,
      cardCount: 0,
      types: [],
      sets: [],
      cardIds: []
    })
  })

  // Group enriched Pokemon by national dex number (to handle variations)
  const enrichedByDex = new Map()
  enrichedPokemon.forEach(enriched => {
    const dexNum = enriched.nationalDexNumber
    if (dexNum) {
      if (!enrichedByDex.has(dexNum)) {
        enrichedByDex.set(dexNum, [])
      }
      enrichedByDex.get(dexNum).push(enriched)
    }
  })

  // Merge grouped enriched data with base list
  enrichedByDex.forEach((variations, dexNum) => {
    if (!basePokemonMap.has(dexNum)) return
    
    const base = basePokemonMap.get(dexNum)
    
    // Aggregate data from all variations
    let totalCardCount = 0
    let allCardIds = new Set()
    let allSets = new Set()
    let allTypes = new Set()
    let bestSpriteUrl = null
    let bestImageUrl = null
    
    variations.forEach(variation => {
      // Aggregate card counts
      const cardCount = variation.cardCount || variation.cardIds?.length || 0
      totalCardCount += cardCount
      
      // Aggregate card IDs
      if (variation.cardIds && Array.isArray(variation.cardIds)) {
        variation.cardIds.forEach(id => allCardIds.add(id))
      }
      
      // Aggregate sets
      if (variation.sets && Array.isArray(variation.sets)) {
        variation.sets.forEach(set => allSets.add(set))
      }
      
      // Aggregate types
      if (variation.types && Array.isArray(variation.types)) {
        variation.types.forEach(type => allTypes.add(type))
      }
      
      // Prefer entries with sprites/images
      // IMPORTANT: Only use sprites from variations if they match the base Pokemon name
      if (!bestSpriteUrl) {
        const spriteUrl = variation.spriteUrl || 
                         variation.spriteUrls?.normal || 
                         variation.spriteUrls?.spriteUrl
        
        // Validate: sprite URL should contain the base Pokemon name (normalized)
        // This prevents using sprites generated from variation names
        if (spriteUrl) {
          const normalizedBaseName = normalizePokemonName(base.name).toLowerCase()
          const spriteUrlLower = spriteUrl.toLowerCase()
          
          // Check if sprite URL contains the base Pokemon name
          if (spriteUrlLower.includes(normalizedBaseName)) {
            bestSpriteUrl = spriteUrl
            bestImageUrl = variation.imageUrl
          }
        }
      }
    })
    
    // If no sprite found in variations, generate one using PokemonDB
    if (!bestSpriteUrl && base.name) {
      try {
        const normalizedName = normalizePokemonName(base.name)
        const generation = getRecommendedGeneration(base.nationalDexNumber)
        const sprites = getPokemonDBSprites(normalizedName, base.nationalDexNumber, generation)
        bestSpriteUrl = sprites.spriteUrl
      } catch (error) {
        console.warn(`Could not generate sprite for ${base.name}:`, error)
      }
    }
    
    // Get best spriteUrls object (prefer one with normal field)
    const bestSpriteUrls = variations.find(v => v.spriteUrls?.normal)?.spriteUrls || 
                          variations.find(v => v.spriteUrls)?.spriteUrls || 
                          null
    
    // Always generate ID from base name (not variation name)
    const correctId = generatePokemonListDocId(base.nationalDexNumber, base.name)
    
    // Update base Pokemon with aggregated data
    const mergedPokemon = {
      ...base,
      // Always use base name from pokemonList.json
      name: base.name,
      displayName: base.name,
      // Aggregated counts
      cardCount: totalCardCount,
      cardIds: Array.from(allCardIds),
      sets: Array.from(allSets),
      types: Array.from(allTypes),
      // Best available sprite/image
      spriteUrl: bestSpriteUrl || base.spriteUrl || null,
      imageUrl: bestImageUrl || base.imageUrl || null,
      // Preserve spriteUrls object
      spriteUrls: bestSpriteUrls || base.spriteUrls || null,
      // Always use ID generated from base name
      id: correctId
    }
    
    // Ensure spriteUrls is a plain object (not a Firestore object) for Vue reactivity
    if (mergedPokemon.spriteUrls && typeof mergedPokemon.spriteUrls === 'object') {
      mergedPokemon.spriteUrls = { ...mergedPokemon.spriteUrls }
    }
    
    basePokemonMap.set(dexNum, mergedPokemon)
  })

  // Convert map to array, generate IDs and sprites for Pokemon without them
  const allPokemon = Array.from(basePokemonMap.values()).map(p => {
    // Generate ID if missing
    if (!p.id && p.nationalDexNumber && p.name) {
      p.id = generatePokemonListDocId(p.nationalDexNumber, p.name)
    }
    
    // Generate sprite if missing
    if (!p.spriteUrl && p.nationalDexNumber && p.name) {
      try {
        const normalizedName = normalizePokemonName(p.name)
        const generation = getRecommendedGeneration(p.nationalDexNumber)
        const sprites = getPokemonDBSprites(normalizedName, p.nationalDexNumber, generation)
        p.spriteUrl = sprites.spriteUrl
      } catch (error) {
        console.warn(`Could not generate sprite for ${p.name}:`, error)
      }
    }
    
    return p
  })

  return allPokemon
}

