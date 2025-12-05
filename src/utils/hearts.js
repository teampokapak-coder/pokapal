// Hearts/Favorites Utility Functions
// Manages user favorites for Pokemon and Cards

import { db } from '../config/firebase'
import { collection, addDoc, deleteDoc, getDocs, query, where, doc, getDoc } from 'firebase/firestore'

const HEARTS_COLLECTION = 'hearts'

/**
 * Heart a Pokemon
 * @param {string} userId - User ID
 * @param {number} nationalDexNumber - Pokemon National Dex Number
 * @param {string} pokemonName - Pokemon name
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const heartPokemon = async (userId, nationalDexNumber, pokemonName) => {
  try {
    if (!userId || !nationalDexNumber) {
      return { success: false, error: 'Missing required fields' }
    }

    // Check if already hearted
    const existingHeart = await getHeart(userId, 'pokemon', nationalDexNumber.toString())
    if (existingHeart) {
      return { success: false, error: 'Already hearted' }
    }

    // Create heart document
    const heartRef = collection(db, HEARTS_COLLECTION)
    await addDoc(heartRef, {
      userId,
      type: 'pokemon',
      pokemonId: nationalDexNumber.toString(),
      nationalDexNumber,
      pokemonName: pokemonName || '',
      createdAt: new Date()
    })

    return { success: true }
  } catch (error) {
    console.error('Error hearting Pokemon:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Unheart a Pokemon
 * @param {string} userId - User ID
 * @param {number} nationalDexNumber - Pokemon National Dex Number
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const unheartPokemon = async (userId, nationalDexNumber) => {
  try {
    const heart = await getHeart(userId, 'pokemon', nationalDexNumber.toString())
    if (!heart) {
      return { success: false, error: 'Not hearted' }
    }

    await deleteDoc(doc(db, HEARTS_COLLECTION, heart.id))
    return { success: true }
  } catch (error) {
    console.error('Error unhearting Pokemon:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Heart a Card
 * @param {string} userId - User ID
 * @param {string} cardId - Card Firestore document ID
 * @param {string} cardApiId - Card API ID (e.g., "me02-013")
 * @param {string} cardName - Card name
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const heartCard = async (userId, cardId, cardApiId, cardName) => {
  try {
    if (!userId || !cardId) {
      return { success: false, error: 'Missing required fields' }
    }

    // Check if already hearted
    const existingHeart = await getHeart(userId, 'card', cardId)
    if (existingHeart) {
      return { success: false, error: 'Already hearted' }
    }

    // Create heart document
    const heartRef = collection(db, HEARTS_COLLECTION)
    await addDoc(heartRef, {
      userId,
      type: 'card',
      cardId,
      cardApiId: cardApiId || '',
      cardName: cardName || '',
      createdAt: new Date()
    })

    return { success: true }
  } catch (error) {
    console.error('Error hearting card:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Unheart a Card
 * @param {string} userId - User ID
 * @param {string} cardId - Card Firestore document ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const unheartCard = async (userId, cardId) => {
  try {
    const heart = await getHeart(userId, 'card', cardId)
    if (!heart) {
      return { success: false, error: 'Not hearted' }
    }

    await deleteDoc(doc(db, HEARTS_COLLECTION, heart.id))
    return { success: true }
  } catch (error) {
    console.error('Error unhearting card:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get a specific heart document
 * @param {string} userId - User ID
 * @param {string} type - 'pokemon' or 'card'
 * @param {string} itemId - Pokemon dex number or card ID
 * @returns {Promise<{id: string, ...data} | null>}
 */
const getHeart = async (userId, type, itemId) => {
  try {
    const heartsRef = collection(db, HEARTS_COLLECTION)
    const q = query(
      heartsRef,
      where('userId', '==', userId),
      where('type', '==', type),
      where(type === 'pokemon' ? 'pokemonId' : 'cardId', '==', itemId)
    )
    const snapshot = await getDocs(q)
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() }
    }
    return null
  } catch (error) {
    console.error('Error getting heart:', error)
    return null
  }
}

/**
 * Check if a Pokemon is hearted
 * @param {string} userId - User ID
 * @param {number} nationalDexNumber - Pokemon National Dex Number
 * @returns {Promise<boolean>}
 */
export const isPokemonHearted = async (userId, nationalDexNumber) => {
  if (!userId) return false
  const heart = await getHeart(userId, 'pokemon', nationalDexNumber.toString())
  return heart !== null
}

/**
 * Check if a Card is hearted
 * @param {string} userId - User ID
 * @param {string} cardId - Card Firestore document ID
 * @returns {Promise<boolean>}
 */
export const isCardHearted = async (userId, cardId) => {
  if (!userId) return false
  const heart = await getHeart(userId, 'card', cardId)
  return heart !== null
}

/**
 * Get all hearted Pokemon for a user
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export const getHeartedPokemon = async (userId) => {
  try {
    if (!userId) {
      return { success: true, data: [] }
    }

    const heartsRef = collection(db, HEARTS_COLLECTION)
    const q = query(
      heartsRef,
      where('userId', '==', userId),
      where('type', '==', 'pokemon')
    )
    const snapshot = await getDocs(q)
    
    const hearts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return { success: true, data: hearts }
  } catch (error) {
    console.error('Error getting hearted Pokemon:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get all hearted Cards for a user
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export const getHeartedCards = async (userId) => {
  try {
    if (!userId) {
      return { success: true, data: [] }
    }

    const heartsRef = collection(db, HEARTS_COLLECTION)
    const q = query(
      heartsRef,
      where('userId', '==', userId),
      where('type', '==', 'card')
    )
    const snapshot = await getDocs(q)
    
    const hearts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return { success: true, data: hearts }
  } catch (error) {
    console.error('Error getting hearted cards:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get hearted status for multiple Pokemon
 * @param {string} userId - User ID
 * @param {Array<number>} nationalDexNumbers - Array of National Dex Numbers
 * @returns {Promise<Set<number>>} - Set of hearted dex numbers
 */
export const getHeartedPokemonSet = async (userId, nationalDexNumbers) => {
  try {
    if (!userId || !nationalDexNumbers || nationalDexNumbers.length === 0) {
      return new Set()
    }

    const heartsRef = collection(db, HEARTS_COLLECTION)
    const pokemonIds = nationalDexNumbers.map(n => n.toString())
    
    // Firestore 'in' query limit is 10, so batch if needed
    const heartedSet = new Set()
    const batchSize = 10
    
    for (let i = 0; i < pokemonIds.length; i += batchSize) {
      const batch = pokemonIds.slice(i, i + batchSize)
      const q = query(
        heartsRef,
        where('userId', '==', userId),
        where('type', '==', 'pokemon'),
        where('pokemonId', 'in', batch)
      )
      const snapshot = await getDocs(q)
      
      snapshot.docs.forEach(doc => {
        const data = doc.data()
        if (data.nationalDexNumber) {
          heartedSet.add(data.nationalDexNumber)
        }
      })
    }

    return heartedSet
  } catch (error) {
    console.error('Error getting hearted Pokemon set:', error)
    return new Set()
  }
}

/**
 * Get hearted status for multiple Cards
 * @param {string} userId - User ID
 * @param {Array<string>} cardIds - Array of Card Firestore document IDs
 * @returns {Promise<Set<string>>} - Set of hearted card IDs
 */
export const getHeartedCardsSet = async (userId, cardIds) => {
  try {
    if (!userId || !cardIds || cardIds.length === 0) {
      return new Set()
    }

    const heartsRef = collection(db, HEARTS_COLLECTION)
    
    // Firestore 'in' query limit is 10, so batch if needed
    const heartedSet = new Set()
    const batchSize = 10
    
    for (let i = 0; i < cardIds.length; i += batchSize) {
      const batch = cardIds.slice(i, i + batchSize)
      const q = query(
        heartsRef,
        where('userId', '==', userId),
        where('type', '==', 'card'),
        where('cardId', 'in', batch)
      )
      const snapshot = await getDocs(q)
      
      snapshot.docs.forEach(doc => {
        const data = doc.data()
        if (data.cardId) {
          heartedSet.add(data.cardId)
        }
      })
    }

    return heartedSet
  } catch (error) {
    console.error('Error getting hearted cards set:', error)
    return new Set()
  }
}

