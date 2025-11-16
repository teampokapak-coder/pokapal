// User Cards utility - tracks cards a user has collected globally
// Independent of master sets/challenges

import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'

/**
 * Mark a card as collected for a user
 * @param {string} userId - User ID
 * @param {string} cardId - Pokemon card document ID
 * @param {number} quantity - Number of copies (default: 1)
 * @param {string} notes - Optional notes
 */
export const markCardAsCollected = async (userId, cardId, quantity = 1, notes = '') => {
  try {
    if (!userId || !cardId) {
      return { success: false, error: 'userId and cardId are required' }
    }

    const userCardId = `${userId}_${cardId}`
    const userCardRef = doc(db, 'userCards', userCardId)
    
    await setDoc(userCardRef, {
      userId,
      cardId,
      quantity,
      notes,
      collectedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true })

    return { success: true, id: userCardId }
  } catch (error) {
    console.error('Error marking card as collected:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Remove a card from user's collection
 * @param {string} userId - User ID
 * @param {string} cardId - Pokemon card document ID
 */
export const removeCardFromCollection = async (userId, cardId) => {
  try {
    if (!userId || !cardId) {
      return { success: false, error: 'userId and cardId are required' }
    }

    const userCardId = `${userId}_${cardId}`
    const userCardRef = doc(db, 'userCards', userCardId)
    await deleteDoc(userCardRef)

    return { success: true }
  } catch (error) {
    console.error('Error removing card from collection:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Check if a card is collected by a user
 * @param {string} userId - User ID
 * @param {string} cardId - Pokemon card document ID
 * @returns {Promise<boolean>}
 */
export const isCardCollected = async (userId, cardId) => {
  try {
    if (!userId || !cardId) return false

    const userCardId = `${userId}_${cardId}`
    const userCardRef = doc(db, 'userCards', userCardId)
    const userCardSnap = await getDoc(userCardRef)
    
    return userCardSnap.exists()
  } catch (error) {
    console.error('Error checking if card is collected:', error)
    return false
  }
}

/**
 * Get all collected cards for a user
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export const getUserCollectedCards = async (userId) => {
  try {
    if (!userId) {
      return { success: false, error: 'userId is required' }
    }

    const userCardsRef = collection(db, 'userCards')
    const q = query(userCardsRef, where('userId', '==', userId))
    const snapshot = await getDocs(q)
    
    const collectedCards = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return { success: true, data: collectedCards }
  } catch (error) {
    console.error('Error getting user collected cards:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get collected status for multiple cards (batch check)
 * @param {string} userId - User ID
 * @param {string[]} cardIds - Array of card IDs
 * @returns {Promise<Set<string>>} - Set of collected card IDs
 */
export const getCollectedCardIds = async (userId, cardIds) => {
  try {
    if (!userId || !cardIds || cardIds.length === 0) {
      return new Set()
    }

    const userCardsRef = collection(db, 'userCards')
    const collectedSet = new Set()
    
    // Check cards in batches (Firestore 'in' query limit is 10)
    const batchSize = 10
    for (let i = 0; i < cardIds.length; i += batchSize) {
      const batch = cardIds.slice(i, i + batchSize)
      const userCardIds = batch.map(cardId => `${userId}_${cardId}`)
      
      // Fetch documents directly by ID
      const promises = userCardIds.map(id => getDoc(doc(db, 'userCards', id)))
      const docs = await Promise.all(promises)
      
      docs.forEach((docSnap, index) => {
        if (docSnap.exists()) {
          collectedSet.add(batch[index])
        }
      })
    }

    return collectedSet
  } catch (error) {
    console.error('Error getting collected card IDs:', error)
    return new Set()
  }
}

/**
 * Toggle card collected status
 * @param {string} userId - User ID
 * @param {string} cardId - Pokemon card document ID
 * @param {number} quantity - Number of copies (default: 1)
 * @returns {Promise<{success: boolean, isCollected: boolean, error?: string}>}
 */
export const toggleCardCollected = async (userId, cardId, quantity = 1) => {
  try {
    const isCollected = await isCardCollected(userId, cardId)
    
    if (isCollected) {
      const result = await removeCardFromCollection(userId, cardId)
      return { ...result, isCollected: false }
    } else {
      const result = await markCardAsCollected(userId, cardId, quantity)
      return { ...result, isCollected: true }
    }
  } catch (error) {
    console.error('Error toggling card collected status:', error)
    return { success: false, error: error.message, isCollected: false }
  }
}

