// Firebase Pokemon Data Management Utilities
// Updated for simplified collection structure

import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  doc, 
  query, 
  where,
  orderBy,
  limit,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '../config/firebase'

// ============================================
// POKEMON (Base Pokemon Data)
// ============================================

export const getPokemon = async (pokemonId) => {
  try {
    // First try as document ID
    const pokemonRef = doc(db, 'pokemon', pokemonId)
    const docSnap = await getDoc(pokemonRef)
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } }
    }
    
    // If not found, try as nationalDexNumber
    const dexNumber = parseInt(pokemonId)
    if (!isNaN(dexNumber)) {
      const pokemonQuery = query(collection(db, 'pokemon'), where('nationalDexNumber', '==', dexNumber))
      const querySnapshot = await getDocs(pokemonQuery)
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        return { success: true, data: { id: doc.id, ...doc.data() } }
      }
    }
    
    return { success: false, error: 'Pokemon not found' }
  } catch (error) {
    console.error('Error getting Pokemon:', error)
    return { success: false, error: error.message }
  }
}

export const getPokemonByDexNumber = async (nationalDexNumber) => {
  try {
    const pokemonQuery = query(collection(db, 'pokemon'), where('nationalDexNumber', '==', nationalDexNumber))
    const querySnapshot = await getDocs(pokemonQuery)
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return { success: true, data: { id: doc.id, ...doc.data() } }
    }
    return { success: false, error: 'Pokemon not found' }
  } catch (error) {
    console.error('Error getting Pokemon by dex number:', error)
    return { success: false, error: error.message }
  }
}

export const getAllPokemon = async (filters = {}) => {
  try {
    const pokemonRef = collection(db, 'pokemon')
    let q = query(pokemonRef)
    
    // Server-side filtering for types (if single type)
    if (filters.type && typeof filters.type === 'string') {
      q = query(pokemonRef, where('types', 'array-contains', filters.type))
    }
    
    // Order by nationalDexNumber if available
    try {
      q = query(q, orderBy('nationalDexNumber', 'asc'))
    } catch (e) {
      // If ordering fails (no index), continue without ordering
    }
    
    // Apply limit server-side if specified (more efficient than client-side)
    if (filters.limit && filters.limit > 0) {
      q = query(q, limit(filters.limit))
    }
    
    const snapshot = await getDocs(q)
    let pokemon = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // Client-side filtering for multiple types (Firestore doesn't support array-contains-any easily)
    if (filters.types && Array.isArray(filters.types) && filters.types.length > 0) {
      pokemon = pokemon.filter(p => 
        p.types && p.types.some(type => filters.types.includes(type))
      )
    }
    
    return { success: true, data: pokemon }
  } catch (error) {
    console.error('Error getting Pokemon:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// CARDS (card_en and card_ja)
// ============================================

export const getCard = async (cardId, language = 'en') => {
  try {
    const collectionName = `card_${language}`
    const cardRef = doc(db, collectionName, cardId)
    const docSnap = await getDoc(cardRef)
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } }
    } else {
      return { success: false, error: 'Card not found' }
    }
  } catch (error) {
    console.error('Error getting card:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get card counts by nationalDexNumber (lightweight - only loads IDs and dex numbers)
 * Much faster than loading all card data when you only need counts
 */
export const getCardCountsByDexNumber = async (language = 'all') => {
  try {
    const collections = []
    if (language === 'all' || language === 'en') {
      collections.push(collection(db, 'card_en'))
    }
    if (language === 'all' || language === 'ja') {
      collections.push(collection(db, 'card_ja'))
    }
    
    const countsByDex = new Map()
    
    // Query each collection and count by nationalDexNumber
    // Note: We still need to load all cards, but this is much faster than loading full card data
    // and doing N separate queries per Pokemon
    for (const cardsRef of collections) {
      const q = query(cardsRef)
      const snapshot = await getDocs(q)
      
      snapshot.docs.forEach(doc => {
        const data = doc.data()
        // Only count cards that have a nationalDexNumber
        if (data.nationalDexNumber != null) {
          countsByDex.set(
            data.nationalDexNumber,
            (countsByDex.get(data.nationalDexNumber) || 0) + 1
          )
        }
      })
    }
    
    return { success: true, data: countsByDex }
  } catch (error) {
    console.error('Error getting card counts:', error)
    return { success: false, error: error.message }
  }
}

export const getAllPokemonCards = async (filters = {}) => {
  try {
    const language = filters.language || 'all' // 'en', 'ja', or 'all'
    
    // Extract search filter (client-side only)
    const searchFilter = filters.search
    delete filters.search // Remove from query filters
    
    const collections = []
    
    if (language === 'all' || language === 'en') {
      collections.push({ ref: collection(db, 'card_en'), name: 'card_en' })
    }
    if (language === 'all' || language === 'ja') {
      collections.push({ ref: collection(db, 'card_ja'), name: 'card_ja' })
    }
    
    if (collections.length === 0) {
      return { success: true, data: [] }
    }
    
    // Build queries for each collection
    const queries = collections.map(({ ref }) => {
      let q = query(ref)
      
      // Apply filters
      if (filters.setId) {
        q = query(q, where('setId', '==', filters.setId))
      }
      if (filters.apiSetId) {
        q = query(q, where('setApiId', '==', filters.apiSetId))
      }
      if (filters.nationalDexNumber !== undefined && filters.nationalDexNumber !== null) {
        // Ensure nationalDexNumber is a number for consistent querying
        const dexNumber = typeof filters.nationalDexNumber === 'string' 
          ? parseInt(filters.nationalDexNumber) 
          : filters.nationalDexNumber
        if (!isNaN(dexNumber)) {
          q = query(q, where('nationalDexNumber', '==', dexNumber))
        }
      }
      if (filters.rarity) {
        q = query(q, where('rarity', '==', filters.rarity))
      }
      if (filters.type) {
        // Use array-contains for single type filter (server-side)
        q = query(q, where('types', 'array-contains', filters.type))
      }
      if (filters.category) {
        q = query(q, where('category', '==', filters.category))
      }
      if (filters.setApiId) {
        q = query(q, where('setApiId', '==', filters.setApiId))
      }
      if (filters.setName) {
        // Note: setName filtering requires loading all cards (no index on set name)
        // This is less efficient but sometimes necessary
        q = query(q)
      }
      
      // Order by localId if available (API field name)
      try {
        q = query(q, orderBy('localId', 'asc'))
      } catch (e) {
        // If ordering fails, continue without ordering
      }
      
      // Apply limit at query level
      if (filters.limit && filters.limit > 0) {
        q = query(q, limit(filters.limit))
      }
      
      return getDocs(q)
    })
    
    // Execute all queries in parallel
    const snapshots = await Promise.all(queries)
    
    // Combine results from all collections
    let cards = []
    snapshots.forEach((snapshot, index) => {
      const collectionCards = snapshot.docs.map(doc => {
        const cardData = doc.data()
        // Preserve API ID before overwriting with Firestore document ID
        const apiId = cardData.id || cardData.apiId || cardData.cardId
        // Ensure Firestore document ID is preserved (don't let cardData.id overwrite it)
        return {
          ...cardData,
          id: doc.id, // Firestore document ID - must be last to override any id field in cardData
          cardId: apiId, // Preserve API ID (like "me02-013") for userCards collection lookups
          collection: collections[index].name,
          language: collections[index].name === 'card_ja' ? 'ja' : 'en'
        }
      })
      cards = cards.concat(collectionCards)
    })
    
    // Apply in-memory filters (for filters that can't be done server-side)
    if (filters.setName) {
      cards = cards.filter(card => {
        // Handle both string set name and set object
        const cardSetName = typeof card.set === 'string' ? card.set : card.set?.name
        return cardSetName === filters.setName
      })
    }
    if (searchFilter) {
      const searchLower = searchFilter.toLowerCase()
      cards = cards.filter(card =>
        card.name?.toLowerCase().includes(searchLower) ||
        card.localId?.toLowerCase().includes(searchLower)
      )
    }
    
    // Sort by nationalDexNumber or setNumber
    cards.sort((a, b) => {
      if (a.nationalDexNumber && b.nationalDexNumber && a.nationalDexNumber !== b.nationalDexNumber) {
        return a.nationalDexNumber - b.nationalDexNumber
      }
      if (a.setNumber && b.setNumber) {
        return a.setNumber.localeCompare(b.setNumber, undefined, { numeric: true })
      }
      return (a.name || '').localeCompare(b.name || '')
    })
    
    // Apply limit after combining if querying multiple collections
    if (filters.limit && filters.limit > 0 && language === 'all') {
      cards = cards.slice(0, filters.limit)
    }
    
    return { success: true, data: cards }
  } catch (error) {
    console.error('Error getting Pokemon cards:', error)
    return { success: false, error: error.message }
  }
}

export const getCardsBySet = async (setId, language = 'en') => {
  // setId should be the Firestore document ID (e.g., "dC3hFxfrIOMQ9dApPqPC")
  // Query cards by both setId (Firestore doc ID) and setApiId (API ID) to ensure we get all cards
  try {
    const collectionName = `set_${language}`
    const setRef = doc(db, collectionName, setId)
    const setDoc = await getDoc(setRef)
    
    if (setDoc.exists()) {
      const setData = setDoc.data()
      const apiId = setData.apiId // Set's API ID (e.g., "swsh3")
      
      // Query by setId (Firestore document ID) - primary method
      const resultByDocId = await getAllPokemonCards({ setId: setId, language })
      
      // Also query by setApiId (API ID) as fallback to catch any cards
      let resultByApiId = { data: [] }
      if (apiId) {
        resultByApiId = await getAllPokemonCards({ apiSetId: apiId, language })
      }
      
      // Combine and deduplicate by card ID
      const allCards = [...(resultByDocId.data || []), ...(resultByApiId.data || [])]
      const uniqueCards = Array.from(
        new Map(allCards.map(card => [card.id, card])).values()
      )
      
      return { success: true, data: uniqueCards }
    } else {
      // If set not found, try querying by setId directly (in case it's a card query)
      return getAllPokemonCards({ setId: setId, language })
    }
  } catch (error) {
    console.error('Error in getCardsBySet:', error)
    // Fallback: try querying by setId directly
    return getAllPokemonCards({ setId: setId, language })
  }
}

export const getCardsByPokemon = async (nationalDexNumber, language = 'all') => {
  return getAllPokemonCards({ nationalDexNumber, language })
}

// ============================================
// SETS (set_en and set_ja)
// ============================================

export const getSet = async (setId, language = 'en') => {
  try {
    const collectionName = `set_${language}`
    const setRef = doc(db, collectionName, setId)
    const docSnap = await getDoc(setRef)
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } }
    } else {
      return { success: false, error: 'Set not found' }
    }
  } catch (error) {
    console.error('Error getting set:', error)
    return { success: false, error: error.message }
  }
}

export const getAllSets = async (filters = {}) => {
  try {
    const language = filters.language || 'all' // 'en', 'ja', or 'all'
    const collections = []
    
    if (language === 'all' || language === 'en') {
      collections.push({ ref: collection(db, 'set_en'), name: 'set_en' })
    }
    if (language === 'all' || language === 'ja') {
      collections.push({ ref: collection(db, 'set_ja'), name: 'set_ja' })
    }
    
    if (collections.length === 0) {
      return { success: true, data: [] }
    }
    
    // Query all collections in parallel
    const queries = collections.map(({ ref }) => {
      try {
        return getDocs(query(ref, orderBy('releaseDate', 'desc')))
      } catch (error) {
        // If ordering fails (no index), try without ordering
        return getDocs(query(ref))
      }
    })
    
    const snapshots = await Promise.all(queries)
    
    // Combine results from all collections
    let allSets = []
    snapshots.forEach((snapshot, index) => {
      const sets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        language: collections[index].name === 'set_ja' ? 'ja' : 'en'
      }))
      allSets = allSets.concat(sets)
    })
    
    // Sort combined results by releaseDate descending
    allSets.sort((a, b) => {
      const dateA = a.releaseDate?.toMillis?.() || (a.releaseDate?.seconds ? a.releaseDate.seconds * 1000 : 0)
      const dateB = b.releaseDate?.toMillis?.() || (b.releaseDate?.seconds ? b.releaseDate.seconds * 1000 : 0)
      return dateB - dateA
    })
    
    return { success: true, data: allSets }
  } catch (error) {
    console.error('Error getting sets:', error)
    return { success: false, error: error.message }
  }
}
