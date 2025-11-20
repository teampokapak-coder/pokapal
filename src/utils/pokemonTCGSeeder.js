// Pokemon TCG API Seeder
// Fetches data from Pokemon TCG API and seeds Firestore

import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  query, 
  where,
  limit,
  serverTimestamp,
  Timestamp,
  doc,
  setDoc,
  updateDoc,
  getCountFromServer
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { 
  fetchAllSets, 
  fetchAllCardsBySet, 
  mapAPICardToSchema, 
  mapAPISetToSchema,
  fetchTypes,
  fetchSubtypes,
  fetchSupertypes,
  fetchRarities
} from './pokemonTCGAPI'
import { getAllPokemonCards } from './firebasePokemon'
import pokemonListData from '../data/pokemonList.json'
import { getPokemonSprites } from './pokesprite'

// Seed all sets from Pokemon TCG API
export const seedSetsFromAPI = async () => {
  try {
    console.log('Fetching sets from Pokemon TCG API...')
    const setsResult = await fetchAllSets()
    
    if (!setsResult.success) {
      return { success: false, error: setsResult.error }
    }
    
    const apiSets = setsResult.data
    console.log(`Found ${apiSets.length} sets from API`)
    
    // Check existing sets
    const setsRef = collection(db, 'sets')
    const existingSnapshot = await getDocs(setsRef)
    const existingApiIds = new Set(
      existingSnapshot.docs.map(doc => doc.data().apiId).filter(Boolean)
    )
    
    let added = 0
    let skipped = 0
    
    for (const apiSet of apiSets) {
      // Skip if already exists
      if (existingApiIds.has(apiSet.id)) {
        skipped++
        continue
      }
      
      const setData = {
        ...mapAPISetToSchema(apiSet),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      // Convert releaseDate to Timestamp
      if (setData.releaseDate instanceof Date) {
        setData.releaseDate = Timestamp.fromDate(setData.releaseDate)
      }
      
      await addDoc(setsRef, setData)
      added++
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    console.log(`Seeded ${added} new sets, skipped ${skipped} existing`)
    return { 
      success: true, 
      message: `Seeded ${added} sets (${skipped} already existed)`,
      added,
      skipped
    }
  } catch (error) {
    console.error('Error seeding sets from API:', error)
    return { success: false, error: error.message }
  }
}

// Seed cards from a specific set
export const seedCardsFromSet = async (setId, setApiId = null) => {
  try {
    console.log(`Fetching cards for set: ${setId}...`)
    
    // Find the Firestore set document
    const setsRef = collection(db, 'sets')
    let setDoc = null
    let apiSetId = setApiId
    
    if (apiSetId) {
      // If API ID provided, find by apiId
      const q = query(setsRef, where('apiId', '==', apiSetId))
      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        setDoc = snapshot.docs[0]
        apiSetId = setDoc.data().apiId
      }
    } else {
      // Try to find by code or apiId matching setId
      const q = query(setsRef, where('apiId', '==', setId))
      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        setDoc = snapshot.docs[0]
        apiSetId = setDoc.data().apiId
      } else {
        // Try by code
        const q2 = query(setsRef, where('code', '==', setId))
        const snapshot2 = await getDocs(q2)
        if (!snapshot2.empty) {
          setDoc = snapshot2.docs[0]
          apiSetId = setDoc.data().apiId
        }
      }
    }
    
    if (!setDoc || !apiSetId) {
      return { success: false, error: `Set ${setId} not found in Firestore` }
    }
    
    const firestoreSetId = setDoc.id // Firestore document ID
    const setData = setDoc.data()
    console.log(`Found set document: ${firestoreSetId} (API ID: ${apiSetId}, Name: ${setData.name})`)
    
    // Verify set exists in API first (strict verification - no auto-matching)
    const { fetchSetById } = await import('./pokemonTCGAPI.js')
    let setVerified = false
    
    try {
      // Try to verify the set exists with exact ID match
      const verifyPromise = fetchSetById(apiSetId)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Verification timeout')), 30000)
      )
      
      const setVerify = await Promise.race([verifyPromise, timeoutPromise])
      if (setVerify.success) {
        console.log(`✓ Verified set: ${setVerify.data.name} (ID: ${apiSetId})`)
        setVerified = true
      } else {
        // Set ID doesn't exist in API
        return { 
          success: false, 
          error: `Set ID '${apiSetId}' not found in Pokemon TCG API. The set may not exist, the ID may be incorrect, or the API may not have this set yet. Please verify the set ID is correct or refresh sets from the API.` 
        }
      }
    } catch (verifyError) {
      // Verification failed - could be timeout or set doesn't exist
      if (verifyError.message.includes('timeout')) {
        console.warn(`⚠️ Set verification timed out for '${apiSetId}'. Proceeding with caution...`)
        // Continue but warn user
      } else {
        // Set not found
        return { 
          success: false, 
          error: `Set ID '${apiSetId}' not found in Pokemon TCG API. The set may not exist, the ID may be incorrect, or the API may not have this set yet. Please verify the set ID is correct or refresh sets from the API.` 
        }
      }
    }
    
    // Fetch cards from API using the exact set ID (no substitutions)
    const cardsResult = await fetchAllCardsBySet(apiSetId)
    
    if (!cardsResult.success) {
      // Provide more helpful error message
      if (cardsResult.error.includes('not found')) {
        const errorMsg = setVerified 
          ? `Set '${apiSetId}' verified but has no cards in API. This may be a new set or the API may not have card data yet.`
          : `Set '${apiSetId}' not found in API. The set ID may be incorrect or the set may not exist in the API. Please verify the set ID is correct or refresh sets from the API.`
        return { success: false, error: errorMsg }
      }
      return { success: false, error: cardsResult.error }
    }
    
    const apiCards = cardsResult.data
    console.log(`Found ${apiCards.length} cards from API for set ${setId}`)
    
    if (apiCards.length === 0) {
      return { success: true, message: `No cards found for set ${setId}`, added: 0, skipped: 0 }
    }
    
    // Check existing cards
    const pokemonRef = collection(db, 'pokemon')
    const existingSnapshot = await getDocs(query(pokemonRef, where('apiSetId', '==', apiSetId)))
    const existingApiIds = new Set(
      existingSnapshot.docs.map(doc => doc.data().apiId).filter(Boolean)
    )
    
    console.log(`Found ${existingApiIds.size} existing cards, ${apiCards.length} total from API`)
    
    let added = 0
    let skipped = 0
    let errors = 0
    
    for (const apiCard of apiCards) {
      // Skip if already exists
      if (existingApiIds.has(apiCard.id)) {
        skipped++
        continue
      }
      
      try {
        const cardData = {
          ...mapAPICardToSchema(apiCard),
          setId: firestoreSetId, // Reference to Firestore set document ID
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
        
        await addDoc(pokemonRef, cardData)
        added++
        
        // Log progress every 50 cards
        if (added % 50 === 0) {
          console.log(`Progress: Added ${added} cards, skipped ${skipped}...`)
        }
        
        // Small delay to avoid rate limits
        if (added % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      } catch (error) {
        console.error(`Error adding card ${apiCard.id}:`, error)
        errors++
      }
    }
    
    // Update the set document with the actual count of fetched cards
    const totalFetchedCards = existingApiIds.size + added
    const setDocRef = doc(db, 'sets', firestoreSetId)
    await updateDoc(setDocRef, {
      fetchedCardsCount: totalFetchedCards,
      updatedAt: serverTimestamp()
    })
    
    console.log(`Seeded ${added} new cards, skipped ${skipped} existing, ${errors} errors`)
    console.log(`Updated set document with fetchedCardsCount: ${totalFetchedCards}`)
    
    return { 
      success: true, 
      message: `Seeded ${added} cards from ${setId} (${skipped} already existed${errors > 0 ? `, ${errors} errors` : ''})`,
      added,
      skipped,
      errors,
      totalFetched: totalFetchedCards
    }
  } catch (error) {
    console.error('Error seeding cards from API:', error)
    return { success: false, error: error.message }
  }
}

// Seed cards from multiple sets
export const seedCardsFromSets = async (setApiIds = []) => {
  const results = []
  
  console.log(`Starting to seed cards from ${setApiIds.length} sets...`)
  
  for (let i = 0; i < setApiIds.length; i++) {
    const apiId = setApiIds[i]
    console.log(`[${i + 1}/${setApiIds.length}] Processing set: ${apiId}`)
    
    const result = await seedCardsFromSet(apiId, apiId)
    results.push({ setId: apiId, ...result })
    
    console.log(`Set ${apiId}: ${result.added || 0} added, ${result.skipped || 0} skipped`)
    
    // Delay between sets to avoid rate limits
    // Increase delay if we encountered errors (might be rate limited)
    if (i < setApiIds.length - 1) {
      const baseDelay = 2000 // 2 seconds base delay between sets
      const errorDelay = result.error && result.error.includes('rate limit') ? 10000 : 0 // Extra 10s if rate limited
      const delay = baseDelay + errorDelay
      
      if (errorDelay > 0) {
        console.log(`⏸️ Rate limit detected, waiting ${delay / 1000}s before next set...`)
      }
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  const totalAdded = results.reduce((sum, r) => sum + (r.added || 0), 0)
  const totalSkipped = results.reduce((sum, r) => sum + (r.skipped || 0), 0)
  const totalErrors = results.reduce((sum, r) => sum + (r.errors || 0), 0)
  
  console.log(`Completed! Total: ${totalAdded} added, ${totalSkipped} skipped, ${totalErrors} errors`)
  
  return {
    success: true,
    message: `Seeded ${totalAdded} cards from ${setApiIds.length} sets (${totalSkipped} already existed${totalErrors > 0 ? `, ${totalErrors} errors` : ''})`,
    results,
    totalAdded,
    totalSkipped,
    totalErrors
  }
}

// Seed popular sets (Base Set, Jungle, Fossil)
export const seedPopularSets = async () => {
  const popularSetCodes = ['base1', 'base2', 'base3', 'base4', 'base5', 'base6']
  
  // Check if sets exist first, only seed if needed
  const setsRef = collection(db, 'sets')
  const setsSnapshot = await getDocs(setsRef)
  
  if (setsSnapshot.size === 0) {
    // No sets exist, seed them first
    const setsResult = await seedSetsFromAPI()
    if (!setsResult.success) {
      return setsResult
    }
  }
  
  // Then seed cards from popular sets
  return await seedCardsFromSets(popularSetCodes)
}

// Seed ALL cards from ALL sets (this will take a while!)
export const seedAllCards = async () => {
  try {
    // First, make sure sets are seeded
    const setsResult = await seedSetsFromAPI()
    if (!setsResult.success && setsResult.error !== 'Sets already exist') {
      return setsResult
    }
    
    // Get all sets from Firestore
    const setsRef = collection(db, 'sets')
    const snapshot = await getDocs(setsRef)
    const allSets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    if (allSets.length === 0) {
      return { success: false, error: 'No sets found. Please seed sets first.' }
    }
    
    // Extract API IDs
    const setApiIds = allSets
      .map(set => set.apiId)
      .filter(Boolean)
    
    console.log(`Found ${setApiIds.length} sets. Starting to seed all cards...`)
    
    // Seed cards from all sets
    return await seedCardsFromSets(setApiIds)
  } catch (error) {
    console.error('Error seeding all cards:', error)
    return { success: false, error: error.message }
  }
}

// Seed types, subtypes, supertypes, rarities from API
export const seedMetadata = async () => {
  try {
    const results = {
      types: { success: false },
      subtypes: { success: false },
      supertypes: { success: false },
      rarities: { success: false }
    }

    // Seed Types
    console.log('Fetching types from API...')
    const typesResult = await fetchTypes()
    if (typesResult.success) {
      const metadataRef = doc(db, 'metadata', 'types')
      await setDoc(metadataRef, {
        data: typesResult.data,
        updatedAt: serverTimestamp()
      }, { merge: true })
      results.types = { success: true, count: typesResult.data.length }
      console.log(`✓ Seeded ${typesResult.data.length} types`)
    }

    // Seed Subtypes
    console.log('Fetching subtypes from API...')
    const subtypesResult = await fetchSubtypes()
    if (subtypesResult.success) {
      const metadataRef = doc(db, 'metadata', 'subtypes')
      await setDoc(metadataRef, {
        data: subtypesResult.data,
        updatedAt: serverTimestamp()
      }, { merge: true })
      results.subtypes = { success: true, count: subtypesResult.data.length }
      console.log(`✓ Seeded ${subtypesResult.data.length} subtypes`)
    }

    // Seed Supertypes
    console.log('Fetching supertypes from API...')
    const supertypesResult = await fetchSupertypes()
    if (supertypesResult.success) {
      const metadataRef = doc(db, 'metadata', 'supertypes')
      await setDoc(metadataRef, {
        data: supertypesResult.data,
        updatedAt: serverTimestamp()
      }, { merge: true })
      results.supertypes = { success: true, count: supertypesResult.data.length }
      console.log(`✓ Seeded ${supertypesResult.data.length} supertypes`)
    }

    // Seed Rarities
    console.log('Fetching rarities from API...')
    const raritiesResult = await fetchRarities()
    if (raritiesResult.success) {
      const metadataRef = doc(db, 'metadata', 'rarities')
      await setDoc(metadataRef, {
        data: raritiesResult.data,
        updatedAt: serverTimestamp()
      }, { merge: true })
      results.rarities = { success: true, count: raritiesResult.data.length }
      console.log(`✓ Seeded ${raritiesResult.data.length} rarities`)
    }

    const allSuccess = Object.values(results).every(r => r.success)
    return {
      success: allSuccess,
      message: 'Metadata seeded successfully',
      results
    }
  } catch (error) {
    console.error('Error seeding metadata:', error)
    return { success: false, error: error.message }
  }
}

// Normalize Pokemon name (same function as in Home.vue)
const normalizePokemonName = (name) => {
  if (!name) return ''
  
  const variations = [
    /^Mega\s+/i,
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

// Generate consistent document ID for pokemonList entries
const generatePokemonListDocId = (nationalDexNumber, name) => {
  // Normalize the name and create a URL-safe ID
  const normalized = normalizePokemonName(name).toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return nationalDexNumber 
    ? `dex-${nationalDexNumber}-${normalized}`
    : `name-${normalized}`
}

// Build pokemonList collection from existing cards
export const buildPokemonList = async () => {
  try {
    console.log('Building Pokemon list from existing cards...')
    
    // Get all Pokemon cards
    const cardsResult = await getAllPokemonCards({})
    if (!cardsResult.success) {
      return { success: false, error: cardsResult.error }
    }

    const allCards = cardsResult.data || []
    console.log(`Found ${allCards.length} total cards in pokemon collection`)
    
    // Filter for Pokemon cards - check multiple indicators
    const pokemonCards = allCards.filter(card => {
      // Check explicit type fields
      if (card.cardType === 'Pokemon' || card.supertype === 'Pokemon') {
        return true
      }
      // If card has types array or nationalDexNumber, it's likely a Pokemon card
      if (card.types && Array.isArray(card.types) && card.types.length > 0) {
        return true
      }
      if (card.nationalDexNumber) {
        return true
      }
      // Exclude Trainer and Energy cards explicitly
      if (card.cardType === 'Trainer' || card.cardType === 'Energy' || 
          card.supertype === 'Trainer' || card.supertype === 'Energy') {
        return false
      }
      // If we can't determine, skip it
      return false
    })

    console.log(`Processing ${pokemonCards.length} Pokemon cards (filtered from ${allCards.length} total cards)...`)
    
    if (pokemonCards.length === 0 && allCards.length > 0) {
      console.warn('⚠️ No Pokemon cards found, but cards exist. Sample card fields:', {
        cardType: allCards[0]?.cardType,
        supertype: allCards[0]?.supertype,
        types: allCards[0]?.types,
        nationalDexNumber: allCards[0]?.nationalDexNumber,
        name: allCards[0]?.name
      })
    }

    // Group by normalized name + nationalDexNumber
    const pokemonMap = new Map()
    
    pokemonCards.forEach(card => {
      const normalizedName = normalizePokemonName(card.name)
      const key = card.nationalDexNumber 
        ? `#${card.nationalDexNumber}-${normalizedName}` 
        : normalizedName
      
      if (!pokemonMap.has(key)) {
        pokemonMap.set(key, {
          name: normalizedName,
          displayName: card.name, // Start with first card's name
          nationalDexNumber: card.nationalDexNumber,
          types: card.types || [],
          imageUrl: card.imageUrl || card.thumbnailUrl || null,
          cardCount: 0,
          cardIds: [],
          sets: new Set()
        })
      }
      
      const pokemon = pokemonMap.get(key)
      pokemon.cardCount++
      pokemon.cardIds.push(card.id)
      if (card.set) pokemon.sets.add(card.set)
      
      // Prefer non-variant names for display
      if (!card.name.match(/^(Mega|EX|GX|V|VMAX|VSTAR|Prime|LV\.|Break|Tag Team)/i)) {
        pokemon.displayName = card.name
      }
      
      // Prefer cards with images
      if (!pokemon.imageUrl && (card.imageUrl || card.thumbnailUrl)) {
        pokemon.imageUrl = card.imageUrl || card.thumbnailUrl
      }
    })

    // Write to pokemonList collection
    const pokemonListRef = collection(db, 'pokemonList')
    let added = 0
    let updated = 0

    for (const [key, pokemon] of pokemonMap.entries()) {
      const docId = generatePokemonListDocId(pokemon.nationalDexNumber, pokemon.displayName)
      
      const pokemonDoc = doc(db, 'pokemonList', docId)
      const existingDocSnap = await getDoc(pokemonDoc)
      const isNew = !existingDocSnap.exists()
      
      // Generate sprite URLs from PokéSprite
      const sprites = getPokemonSprites(pokemon.displayName || pokemon.name, pokemon.nationalDexNumber)
      
      // Build the document data - only include createdAt for new documents
      const docData = {
        ...pokemon,
        sets: Array.from(pokemon.sets),
        spriteUrl: sprites.spriteUrl, // Primary sprite URL
        spriteUrls: sprites, // All sprite variants
        // Keep existing imageUrl if available (from TCG cards), otherwise use sprite
        imageUrl: pokemon.imageUrl || sprites.spriteUrl,
        updatedAt: serverTimestamp()
      }
      
      // Only add createdAt if it's a new document
      if (isNew) {
        docData.createdAt = serverTimestamp()
      }
      
      await setDoc(pokemonDoc, docData, { merge: true })
      
      if (isNew) {
        added++
      } else {
        updated++
      }
    }

    console.log(`✓ Built Pokemon list: ${pokemonMap.size} unique Pokemon (${added} new, ${updated} updated)`)
    
    return {
      success: true,
      message: `Built Pokemon list with ${pokemonMap.size} unique Pokemon`,
      count: pokemonMap.size,
      added,
      updated
    }
  } catch (error) {
    console.error('Error building Pokemon list:', error)
    return { success: false, error: error.message }
  }
}

// Seed pokemonList collection from JSON data (reliable base list)
export const seedPokemonListFromJSON = async () => {
  try {
    console.log('Seeding Pokemon list from JSON...')
    
    const pokemonListRef = collection(db, 'pokemonList')
    let added = 0
    let updated = 0
    
    for (const pokemon of pokemonListData) {
      const docId = generatePokemonListDocId(pokemon.nationalDexNumber, pokemon.name)
      const pokemonDoc = doc(db, 'pokemonList', docId)
      const existingDocSnap = await getDoc(pokemonDoc)
      const isNew = !existingDocSnap.exists()
      
      // Generate sprite URLs from PokéSprite
      const sprites = getPokemonSprites(pokemon.name, pokemon.nationalDexNumber)
      
      // Build the document data - only include createdAt for new documents
      const docData = {
        name: pokemon.name,
        displayName: pokemon.name,
        nationalDexNumber: pokemon.nationalDexNumber,
        types: [], // Will be populated from cards later
        imageUrl: null, // Will be populated from cards later (TCG card images)
        spriteUrl: sprites.spriteUrl, // PokéSprite sprite URL
        spriteUrls: sprites, // All sprite variants
        cardCount: 0, // Will be updated when cards are loaded
        cardIds: [],
        sets: [],
        updatedAt: serverTimestamp()
      }
      
      // Only add createdAt if it's a new document
      if (isNew) {
        docData.createdAt = serverTimestamp()
      }
      
      await setDoc(pokemonDoc, docData, { merge: true })
      
      if (isNew) {
        added++
      } else {
        updated++
      }
      
      // Small delay to avoid overwhelming Firestore
      if ((added + updated) % 50 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    console.log(`✓ Seeded Pokemon list from JSON: ${pokemonListData.length} Pokemon (${added} new, ${updated} updated)`)
    
    return {
      success: true,
      message: `Seeded ${pokemonListData.length} Pokemon from JSON`,
      count: pokemonListData.length,
      added,
      updated
    }
  } catch (error) {
    console.error('Error seeding Pokemon list from JSON:', error)
    return { success: false, error: error.message }
  }
}

// Update existing pokemonList entries with PokéSprite sprite URLs
export const updatePokemonSprites = async () => {
  try {
    console.log('Updating Pokemon sprites from PokéSprite...')
    
    const pokemonListRef = collection(db, 'pokemonList')
    const snapshot = await getDocs(pokemonListRef)
    
    let updated = 0
    let skipped = 0
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data()
      
      // Skip if already has spriteUrl
      if (data.spriteUrl) {
        skipped++
        continue
      }
      
      // Generate sprite URLs
      const sprites = getPokemonSprites(
        data.displayName || data.name, 
        data.nationalDexNumber
      )
      
      // Update document with sprite URLs
      await setDoc(docSnap.ref, {
        spriteUrl: sprites.spriteUrl,
        spriteUrls: sprites,
        // Use sprite as fallback image if no TCG image exists
        imageUrl: data.imageUrl || sprites.spriteUrl,
        updatedAt: serverTimestamp()
      }, { merge: true })
      
      updated++
      
      // Small delay to avoid overwhelming Firestore
      if (updated % 50 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    console.log(`✓ Updated ${updated} Pokemon with sprites (${skipped} already had sprites)`)
    
    return {
      success: true,
      message: `Updated ${updated} Pokemon with PokéSprite sprites`,
      updated,
      skipped
    }
  } catch (error) {
    console.error('Error updating Pokemon sprites:', error)
    return { success: false, error: error.message }
  }
}

// Update fetchedCardsCount for all sets by counting actual cards in database
// This is lightweight - uses count queries instead of fetching all card documents
export const updateAllSetCardCounts = async () => {
  try {
    console.log('🔄 Starting updateAllSetCardCounts...')
    
    const setsRef = collection(db, 'sets')
    const setsSnapshot = await getDocs(setsRef)
    console.log(`Found ${setsSnapshot.size} sets to process`)
    
    const pokemonRef = collection(db, 'pokemon')
    
    // First, let's check if we have any cards at all
    const allCardsQuery = query(pokemonRef)
    const allCardsCount = await getCountFromServer(allCardsQuery)
    console.log(`📊 Total cards in pokemon collection: ${allCardsCount.data().count}`)
    
    // Get a sample of cards to see what apiSetId values exist
    const sampleCardsSnapshot = await getDocs(query(pokemonRef, limit(10)))
    if (!sampleCardsSnapshot.empty) {
      const sampleApiSetIds = sampleCardsSnapshot.docs.map(doc => doc.data().apiSetId).filter(Boolean)
      console.log(`📋 Sample apiSetId values from cards:`, [...new Set(sampleApiSetIds)])
    } else {
      console.log('⚠️ No cards found in pokemon collection!')
    }
    
    let updated = 0
    let skipped = 0
    
    for (const setDoc of setsSnapshot.docs) {
      const setData = setDoc.data()
      const apiSetId = setData.apiId
      
      // Count cards by apiSetId (API set ID) - this is the consistent identifier
      if (!apiSetId) {
        console.log(`⚠️ Skipping set "${setData.name}" (${setDoc.id}) - no apiId field`)
        skipped++
        continue
      }
      
      try {
        // Query cards where apiSetId matches the set's apiId
        const apiSetIdQuery = query(pokemonRef, where('apiSetId', '==', apiSetId))
        const countSnapshot = await getCountFromServer(apiSetIdQuery)
        const totalCount = countSnapshot.data().count
        
        console.log(`Set "${setData.name}": apiId="${apiSetId}", found ${totalCount} cards (previous: ${setData.fetchedCardsCount ?? 'undefined'})`)
        
        // Always update, even if count is 0 - this ensures the field exists
        // Use setDoc with merge to ensure the field is always set
        await setDoc(setDoc.ref, {
          fetchedCardsCount: totalCount, // Explicitly set to 0 if no cards
          updatedAt: serverTimestamp()
        }, { merge: true })
        
        // Verify the update worked by reading it back
        const verifyDoc = await getDoc(setDoc.ref)
        const verifyData = verifyDoc.data()
        const verifiedCount = verifyData.fetchedCardsCount
        
        if (verifiedCount === totalCount) {
          if (setData.fetchedCardsCount !== totalCount) {
            updated++
            console.log(`✓ Updated ${setData.name} (${apiSetId}): ${totalCount} cards`)
          } else {
            skipped++
          }
        } else {
          console.error(`❌ Update failed for ${setData.name}: Expected ${totalCount}, got ${verifiedCount}`)
          // Force update one more time
          await setDoc(setDoc.ref, {
            fetchedCardsCount: totalCount,
            updatedAt: serverTimestamp()
          }, { merge: true })
          updated++
          console.log(`✓ Force updated ${setData.name} using setDoc`)
        }
      } catch (error) {
        console.error(`❌ Error counting cards for set "${setData.name}" (apiId: ${apiSetId}):`, error.message)
        // Try to get a sample card to debug
        try {
          const sampleQuery = query(pokemonRef, where('apiSetId', '==', apiSetId))
          const sampleSnapshot = await getDocs(sampleQuery)
          if (!sampleSnapshot.empty) {
            const sampleCard = sampleSnapshot.docs[0].data()
            console.log(`  Sample card apiSetId: "${sampleCard.apiSetId}"`)
          } else {
            console.log(`  No cards found with apiSetId="${apiSetId}"`)
          }
        } catch (debugError) {
          console.log(`  Could not fetch sample card:`, debugError.message)
        }
        // Continue with next set
      }
      
      // Small delay to avoid overwhelming Firestore
      if ((updated + skipped) % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    }
    
    console.log(`✓ Updated ${updated} sets, ${skipped} already correct`)
    
    return {
      success: true,
      message: `Updated card counts for ${updated} sets (${skipped} already correct)`,
      updated,
      skipped
    }
  } catch (error) {
    console.error('Error updating set card counts:', error)
    return { success: false, error: error.message }
  }
}

