/**
 * Script to update pokemonList.json with sprite URLs, GIF URLs, and types
 * 
 * Usage: node scripts/updatePokemonListWithSpritesAndTypes.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
// Import utilities - need to use .js extension for ES modules
import { getPokemonDBSprites, getPokemonDBGifs } from '../src/utils/pokemondb.js'
import { getRecommendedGeneration } from '../src/utils/spriteValidator.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// PokeAPI base URL
const POKEAPI_BASE = 'https://pokeapi.co/api/v2'

/**
 * Fetch Pokemon types from PokeAPI
 */
async function fetchPokemonTypes(nationalDexNumber) {
  try {
    const response = await fetch(`${POKEAPI_BASE}/pokemon/${nationalDexNumber}`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const data = await response.json()
    
    // Extract types and capitalize them
    const types = data.types.map(typeInfo => {
      const typeName = typeInfo.type.name
      // Capitalize first letter
      return typeName.charAt(0).toUpperCase() + typeName.slice(1)
    })
    
    return types
  } catch (error) {
    console.error(`Error fetching types for #${nationalDexNumber}:`, error.message)
    return null
  }
}

/**
 * Generate sprite URL for a Pokemon
 */
function generateSpriteUrl(pokemonName, nationalDexNumber) {
  try {
    const generation = getRecommendedGeneration(nationalDexNumber)
    const sprites = getPokemonDBSprites(pokemonName, nationalDexNumber, generation)
    return sprites.spriteUrl
  } catch (error) {
    console.error(`Error generating sprite for ${pokemonName}:`, error.message)
    return null
  }
}

/**
 * Generate GIF URL for a Pokemon
 */
function generateGifUrl(pokemonName, nationalDexNumber) {
  try {
    // Use 'black-white' generation for best GIF coverage
    const gifs = getPokemonDBGifs(pokemonName, nationalDexNumber, 'black-white')
    return gifs.gifUrl
  } catch (error) {
    console.error(`Error generating GIF for ${pokemonName}:`, error.message)
    return null
  }
}

/**
 * Update pokemonList.json with sprites and types
 */
async function updatePokemonList() {
  const jsonPath = path.join(__dirname, '../src/data/pokemonList.json')
  
  // Read current JSON
  console.log('📖 Reading pokemonList.json...')
  const jsonContent = fs.readFileSync(jsonPath, 'utf-8')
  const pokemonList = JSON.parse(jsonContent)
  
  console.log(`📊 Found ${pokemonList.length} Pokemon`)
  console.log('🔄 Updating with sprites, GIFs, and types...\n')
  
  const updated = []
  let processed = 0
  let spriteErrors = 0
  let gifErrors = 0
  let typeErrors = 0
  
  // Process in batches to avoid overwhelming PokeAPI
  const batchSize = 10
  const delayBetweenBatches = 1000 // 1 second delay
  
  for (let i = 0; i < pokemonList.length; i += batchSize) {
    const batch = pokemonList.slice(i, i + batchSize)
    
    // Process batch
    const batchPromises = batch.map(async (pokemon) => {
      const { nationalDexNumber, name } = pokemon
      
      // Generate sprite URL
      let spriteUrl = pokemon.spriteUrl // Keep existing if present
      if (!spriteUrl) {
        spriteUrl = generateSpriteUrl(name, nationalDexNumber)
        if (!spriteUrl) spriteErrors++
      }
      
      // Generate GIF URL
      let gifUrl = pokemon.gifUrl // Keep existing if present
      if (!gifUrl) {
        gifUrl = generateGifUrl(name, nationalDexNumber)
        if (!gifUrl) gifErrors++
      }
      
      // Fetch types
      let types = pokemon.types // Keep existing if present
      if (!types || types.length === 0) {
        types = await fetchPokemonTypes(nationalDexNumber)
        if (!types) {
          typeErrors++
          types = [] // Default to empty array
        }
      }
      
      return {
        ...pokemon,
        spriteUrl: spriteUrl || null,
        gifUrl: gifUrl || null,
        types: types || []
      }
    })
    
    const batchResults = await Promise.all(batchPromises)
    updated.push(...batchResults)
    
    processed += batch.length
    const percentage = ((processed / pokemonList.length) * 100).toFixed(1)
    console.log(`✅ Processed ${processed}/${pokemonList.length} (${percentage}%)`)
    
    // Delay between batches (except for last batch)
    if (i + batchSize < pokemonList.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
    }
  }
  
  // Write updated JSON
  console.log('\n💾 Writing updated pokemonList.json...')
  fs.writeFileSync(jsonPath, JSON.stringify(updated, null, 2) + '\n', 'utf-8')
  
  // Summary
  console.log('\n✨ Update complete!')
  console.log(`📊 Total Pokemon: ${updated.length}`)
  console.log(`🖼️  Sprites: ${updated.filter(p => p.spriteUrl).length} with URLs`)
  console.log(`🎬 GIFs: ${updated.filter(p => p.gifUrl).length} with URLs`)
  console.log(`🎨 Types: ${updated.filter(p => p.types && p.types.length > 0).length} with types`)
  if (spriteErrors > 0) {
    console.log(`⚠️  Sprite errors: ${spriteErrors}`)
  }
  if (gifErrors > 0) {
    console.log(`⚠️  GIF errors: ${gifErrors}`)
  }
  if (typeErrors > 0) {
    console.log(`⚠️  Type errors: ${typeErrors}`)
  }
  
  // Show sample of updated data
  console.log('\n📋 Sample updated entry:')
  const sample = updated.find(p => p.spriteUrl && p.gifUrl && p.types && p.types.length > 0) || updated[0]
  console.log(JSON.stringify(sample, null, 2))
}

// Run the update
updatePokemonList().catch(error => {
  console.error('❌ Error:', error)
  process.exit(1)
})

