/**
 * Simplified Seeder for New Collection Structure
 * 
 * Collections:
 * - pokemon: Base Pokemon data from pokemonList.json
 * - set_en: English sets from TCGdx
 * - set_ja: Japanese sets from TCGdx
 * - card_en: English cards from TCGdx
 * - card_ja: Japanese cards from TCGdx
 * 
 * All images use .webp extension
 */

import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  query, 
  where,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from '../config/firebase'
import pokemonListData from '../data/pokemonList.json'
import { 
  fetchAllSets as fetchAllTCGdxSets,
  fetchSetById as fetchTCGdxSetById,
  fetchCardById as fetchTCGdxCardById,
  fetchCardsBySet,
  mapTCGdxSetToSchema,
  mapTCGdxCardToSchema
} from './tcgdxAPI'

/**
 * Normalize Pokemon name for matching (remove variants like "Mega", "EX", etc.)
 */
function normalizePokemonName(name) {
  if (!name) return ''
  
  return name
    .replace(/^Mega\s+/i, '')
    .replace(/\s+EX$/i, '')
    .replace(/\s+GX$/i, '')
    .replace(/\s+V$/i, '')
    .replace(/\s+VMAX$/i, '')
    .replace(/\s+VSTAR$/i, '')
    .replace(/\s+Prime$/i, '')
    .replace(/\s+LV\.?\s*X$/i, '')
    .replace(/\s+LV\.?\s*\d+$/i, '')
    .replace(/\s+Break$/i, '')
    .replace(/\s+Tag Team$/i, '')
    .replace(/\s+&.*$/i, '')
    .replace(/\s+\(.*\)$/i, '')
    .replace(/^.*'s\s+/i, '') // Remove trainer names like "Erika's"
    .trim()
}

/**
 * Match card name to Pokemon to get nationalDexNumber
 */
function findPokemonDexNumber(cardName, pokemonMap) {
  if (!cardName) return null
  
  // Normalize card name
  const normalized = normalizePokemonName(cardName)
  
  // Try exact match first
  if (pokemonMap[normalized.toLowerCase()]) {
    return pokemonMap[normalized.toLowerCase()].nationalDexNumber
  }
  
  // Try partial match (card name contains Pokemon name)
  for (const [pokemonName, pokemonData] of Object.entries(pokemonMap)) {
    if (normalized.toLowerCase().includes(pokemonName) || pokemonName.includes(normalized.toLowerCase())) {
      return pokemonData.nationalDexNumber
    }
  }
  
  return null
}

/**
 * Seed pokemon collection from pokemonList.json
 */
export const seedPokemonCollection = async () => {
  try {
    console.log('🌱 Seeding pokemon collection...')
    const pokemonRef = collection(db, 'pokemon')
    const existingSnapshot = await getDocs(pokemonRef)
    const existing = new Map()
    
    existingSnapshot.docs.forEach(doc => {
      const data = doc.data()
      if (data.nationalDexNumber) {
        existing.set(data.nationalDexNumber, doc.id)
      }
    })
    
    let added = 0
    let updated = 0
    
    // Process in batches
    const batchSize = 500
    for (let i = 0; i < pokemonListData.length; i += batchSize) {
      const batch = writeBatch(db)
      const batchData = pokemonListData.slice(i, i + batchSize)
      
      for (const pokemon of batchData) {
        const existingDocId = existing.get(pokemon.nationalDexNumber)
        
        const pokemonData = {
          nationalDexNumber: pokemon.nationalDexNumber,
          name: pokemon.name,
          name_ja: pokemon.name_ja || null, // Will be populated later
          spriteUrl: pokemon.spriteUrl || null,
          gifUrl: pokemon.gifUrl || null,
          types: pokemon.types || [],
          updatedAt: serverTimestamp()
        }
        
        if (existingDocId) {
          // Update existing
          const docRef = doc(db, 'pokemon', existingDocId)
          batch.update(docRef, pokemonData)
          updated++
        } else {
          // Add new
          const newDocRef = doc(pokemonRef)
          batch.set(newDocRef, {
            ...pokemonData,
            createdAt: serverTimestamp()
          })
          added++
        }
      }
      
      await batch.commit()
      console.log(`✅ Processed ${Math.min(i + batchSize, pokemonListData.length)}/${pokemonListData.length}`)
    }
    
    console.log(`✨ Seeded pokemon collection: ${added} added, ${updated} updated`)
    return { success: true, added, updated, total: pokemonListData.length }
  } catch (error) {
    console.error('Error seeding pokemon collection:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Seed sets for a language
 */
export const seedSets = async (language = 'en') => {
  try {
    console.log(`🌱 Seeding ${language} sets...`)
    const collectionName = `set_${language}`
    const setsRef = collection(db, collectionName)
    
    // Fetch from TCGdx API
    const apiResult = await fetchAllTCGdxSets(language)
    if (!apiResult.success) {
      return { success: false, error: apiResult.error }
    }
    
    const apiSets = apiResult.data
    console.log(`📦 Found ${apiSets.length} sets from API`)
    
    // Get existing sets
    const existingSnapshot = await getDocs(setsRef)
    const existing = new Map()
    existingSnapshot.docs.forEach(doc => {
      const data = doc.data()
      if (data.apiId) {
        existing.set(data.apiId, doc.id)
      }
    })
    
    let added = 0
    let updated = 0
    let errors = 0
    
    // Process sets
    for (const apiSet of apiSets) {
      try {
        // Fetch individual set for complete data (logo, symbol, etc.)
        const setDetailResult = await fetchTCGdxSetById(apiSet.id, language)
        const fullSetData = setDetailResult.success ? setDetailResult.data : apiSet
        
        // Map to schema with .webp extension
        const setData = mapTCGdxSetToSchema(fullSetData, language)
        
        // Ensure .webp extension for logo and symbol
        if (setData.logo && !setData.logo.endsWith('.webp')) {
          setData.logo = setData.logo.replace(/\.(png|jpg|jpeg)$/i, '.webp')
        }
        if (setData.symbol && !setData.symbol.endsWith('.webp')) {
          setData.symbol = setData.symbol.replace(/\.(png|jpg|jpeg)$/i, '.webp')
        }
        
        const existingDocId = existing.get(setData.apiId)
        
        const finalData = {
          ...setData,
          language,
          updatedAt: serverTimestamp()
        }
        
        if (existingDocId) {
          await updateDoc(doc(db, collectionName, existingDocId), finalData)
          updated++
        } else {
          await addDoc(setsRef, {
            ...finalData,
            createdAt: serverTimestamp()
          })
          added++
        }
      } catch (error) {
        console.error(`Error processing set ${apiSet.id}:`, error)
        errors++
      }
    }
    
    console.log(`✨ Seeded ${language} sets: ${added} added, ${updated} updated, ${errors} errors`)
    return { success: true, added, updated, errors, total: apiSets.length }
  } catch (error) {
    console.error(`Error seeding ${language} sets:`, error)
    return { success: false, error: error.message }
  }
}

/**
 * Seed cards for a set
 */
export const seedCardsForSet = async (setId, language = 'en') => {
  try {
    console.log(`🌱 Seeding ${language} cards for set ${setId}...`)
    const collectionName = `card_${language}`
    const cardsRef = collection(db, collectionName)
    const setsCollectionName = `set_${language}`
    
    // Find set document
    const setsRef = collection(db, setsCollectionName)
    const setQuery = query(setsRef, where('apiId', '==', setId))
    const setSnapshot = await getDocs(setQuery)
    
    if (setSnapshot.empty) {
      return { success: false, error: `Set ${setId} not found in ${setsCollectionName}` }
    }
    
    const setDoc = setSnapshot.docs[0]
    const setData = setDoc.data()
    
    // Build Pokemon map for dex number matching
    const pokemonRef = collection(db, 'pokemon')
    const pokemonSnapshot = await getDocs(pokemonRef)
    const pokemonMap = {}
    
    pokemonSnapshot.docs.forEach(doc => {
      const data = doc.data()
      if (data.name) {
        pokemonMap[data.name.toLowerCase()] = data
        // Also add normalized version
        const normalized = normalizePokemonName(data.name).toLowerCase()
        if (normalized && normalized !== data.name.toLowerCase()) {
          pokemonMap[normalized] = data
        }
      }
      if (data.name_ja) {
        pokemonMap[data.name_ja.toLowerCase()] = data
        // Also add normalized version
        const normalized = normalizePokemonName(data.name_ja).toLowerCase()
        if (normalized && normalized !== data.name_ja.toLowerCase()) {
          pokemonMap[normalized] = data
        }
      }
    })
    
    // Fetch cards from TCGdx API
    const cardsResult = await fetchCardsBySet(setId, language)
    let apiCards = []
    
    if (cardsResult.success && cardsResult.data && cardsResult.data.length > 0) {
      apiCards = cardsResult.data
    } else {
      // Try fetching individual set to get cards
      const setDetailResult = await fetchTCGdxSetById(setId, language)
      if (setDetailResult.success && setDetailResult.data.cards) {
        apiCards = setDetailResult.data.cards
      }
    }
    
    if (apiCards.length === 0) {
      return { success: false, error: `No cards found for set ${setId}` }
    }
    
    console.log(`📦 Found ${apiCards.length} cards from API`)
    
    // Get existing cards - query by both setId (Firestore doc ID) and setApiId (API ID) to catch all
    const existingQueryBySetId = query(cardsRef, where('setId', '==', setDoc.id))
    const existingQueryByApiId = query(cardsRef, where('setApiId', '==', setId))
    const [existingSnapshotById, existingSnapshotByApiId] = await Promise.all([
      getDocs(existingQueryBySetId),
      getDocs(existingQueryByApiId)
    ])
    
    const existing = new Map()
    // Combine results from both queries
    const allExistingDocs = [...existingSnapshotById.docs, ...existingSnapshotByApiId.docs]
    allExistingDocs.forEach(doc => {
      const data = doc.data()
      if (data.id) { // Use 'id' field (API card ID like 'swsh3-136')
        existing.set(data.id, doc.id)
      }
    })
    
    let added = 0
    let updated = 0
    let errors = 0
    
    // Process cards
    for (const apiCard of apiCards) {
      try {
        // Always fetch full card details to get complete data (rarity, abilities, attacks, etc.)
        // Brief cards from set.cards array may be missing important fields
        let fullCardData = apiCard
        const cardDetailResult = await fetchTCGdxCardById(apiCard.id, language)
        if (cardDetailResult.success) {
          fullCardData = cardDetailResult.data
        } else {
          console.warn(`⚠️ Could not fetch full details for card ${apiCard.id}, using brief card data`)
        }
        
        // Ensure setData has required fields for mapping
        // If setData doesn't have id, use setId from the query
        const setDataForMapping = {
          ...setData,
          id: setData.apiId || setId
        }
        
        // Map to schema (already uses .webp by default)
        const cardData = mapTCGdxCardToSchema(fullCardData, setDataForMapping, language, setDoc.id)
        
        // Try to match Pokemon name for nationalDexNumber
        if (!cardData.nationalDexNumber && cardData.name) {
          const dexNumber = findPokemonDexNumber(cardData.name, pokemonMap)
          if (dexNumber) {
            cardData.nationalDexNumber = dexNumber
          }
        }
        
        const existingDocId = existing.get(cardData.id) // Use 'id' field (API card ID)
        
        // Remove undefined values (Firestore doesn't allow undefined)
        const cleanCardData = {}
        for (const [key, value] of Object.entries(cardData)) {
          if (value !== undefined) {
            cleanCardData[key] = value
          }
        }
        
        const finalData = {
          ...cleanCardData,
          language,
          setId: setDoc.id, // Reference to set document
          updatedAt: serverTimestamp()
        }
        
        if (existingDocId) {
          await updateDoc(doc(db, collectionName, existingDocId), finalData)
          updated++
        } else {
          await addDoc(cardsRef, {
            ...finalData,
            createdAt: serverTimestamp()
          })
          added++
        }
      } catch (error) {
        console.error(`Error processing card ${apiCard.id}:`, error)
        errors++
      }
    }
    
    // Update set document with card count
    const finalCardCount = added + updated + existing.size
    try {
      await updateDoc(doc(db, setsCollectionName, setDoc.id), {
        cardCount: finalCardCount,
        updatedAt: serverTimestamp()
      })
      console.log(`📊 Updated set ${setId} with card count: ${finalCardCount}`)
    } catch (error) {
      console.warn(`Warning: Could not update card count for set ${setId}:`, error)
    }
    
    console.log(`✨ Seeded ${language} cards: ${added} added, ${updated} updated, ${errors} errors`)
    return { success: true, added, updated, errors, total: apiCards.length, cardCount: finalCardCount }
  } catch (error) {
    console.error(`Error seeding ${language} cards:`, error)
    return { success: false, error: error.message }
  }
}

