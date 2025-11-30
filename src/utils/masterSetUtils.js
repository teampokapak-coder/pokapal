/**
 * Master Set Utilities
 * Functions for creating and managing master sets, assignments, and collected cards
 */

import {
  collection,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  doc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { getAllPokemonCards } from './firebasePokemon'

/**
 * Create a master set
 * @param {Object} masterSetData - Master set data
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const createMasterSet = async (masterSetData) => {
  try {
    const masterSetRef = collection(db, 'masterSets')
    const docRef = await addDoc(masterSetRef, {
      ...masterSetData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active',
      totalAssignments: 0,
      totalCardsCollected: 0
    })
    
    return { success: true, data: { id: docRef.id, ...masterSetData } }
  } catch (error) {
    console.error('Error creating master set:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Create an assignment for a master set
 * @param {Object} assignmentData - Assignment data
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const createAssignment = async (assignmentData) => {
  try {
    const assignmentsRef = collection(db, 'assignments')
    
    // Calculate total cards
    const totalCards = (assignmentData.card_en?.length || 0) + (assignmentData.card_ja?.length || 0)
    
    const assignmentDoc = {
      ...assignmentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      totalCards,
      collectedCards: 0,
      progress: 0,
      rejectedAt: null
    }
    
    // Set acceptedAt if status is accepted
    if (assignmentData.status === 'accepted') {
      assignmentDoc.acceptedAt = serverTimestamp()
    } else {
      assignmentDoc.acceptedAt = null
    }
    
    const docRef = await addDoc(assignmentsRef, assignmentDoc)
    
    // Update master set totalAssignments count
    if (assignmentData.masterSetId) {
      await updateMasterSetStats(assignmentData.masterSetId)
    }
    
    return { success: true, data: { id: docRef.id, ...assignmentData } }
  } catch (error) {
    console.error('Error creating assignment:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Update master set statistics
 * @param {string} masterSetId - Master set ID
 */
export const updateMasterSetStats = async (masterSetId) => {
  try {
    // Get all active assignments
    const assignmentsRef = collection(db, 'assignments')
    const assignmentsQuery = query(
      assignmentsRef,
      where('masterSetId', '==', masterSetId),
      where('status', 'in', ['accepted', 'active'])
    )
    const assignmentsSnapshot = await getDocs(assignmentsQuery)
    
    const totalAssignments = assignmentsSnapshot.size
    
    // Count total collected cards across all assignments
    const collectedCardsRef = collection(db, 'collectedCards')
    const collectedQuery = query(
      collectedCardsRef,
      where('masterSetId', '==', masterSetId)
    )
    const collectedSnapshot = await getDocs(collectedQuery)
    const totalCardsCollected = collectedSnapshot.size
    
    // Update master set
    const masterSetRef = doc(db, 'masterSets', masterSetId)
    await updateDoc(masterSetRef, {
      totalAssignments,
      totalCardsCollected,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating master set stats:', error)
  }
}

/**
 * Get card IDs for a set
 * @param {string} setId - Set Firestore document ID
 * @param {string} language - 'en' or 'ja'
 * @returns {Promise<string[]>} - Array of card IDs
 */
export const getCardIdsForSet = async (setId, language) => {
  try {
    const result = await getAllPokemonCards({
      setId: setId,
      language: language
    })
    
    if (result.success && result.data) {
      return result.data.map(card => card.id)
    }
    
    return []
  } catch (error) {
    console.error('Error getting card IDs for set:', error)
    return []
  }
}

/**
 * Get card IDs for a Pokemon
 * @param {number} nationalDexNumber - Pokemon national dex number
 * @param {string[]} languages - Array of languages ['en', 'ja']
 * @returns {Promise<{card_en: string[], card_ja: string[]}>}
 */
export const getCardIdsForPokemon = async (nationalDexNumber, languages = ['en', 'ja']) => {
  try {
    const result = await getAllPokemonCards({
      nationalDexNumber: nationalDexNumber,
      language: 'all'
    })
    
    if (!result.success || !result.data) {
      return { card_en: [], card_ja: [] }
    }
    
    const card_en = []
    const card_ja = []
    
    result.data.forEach(card => {
      if (card.language === 'en' && languages.includes('en')) {
        card_en.push(card.id)
      } else if (card.language === 'ja' && languages.includes('ja')) {
        card_ja.push(card.id)
      }
    })
    
    return { card_en, card_ja }
  } catch (error) {
    console.error('Error getting card IDs for Pokemon:', error)
    return { card_en: [], card_ja: [] }
  }
}

/**
 * Accept an assignment invite
 * @param {string} assignmentId - Assignment ID
 * @param {string} userId - User ID (if user just created account)
 * @param {string} userName - User name (if user just created account)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const acceptAssignment = async (assignmentId, userId = null, userName = null) => {
  try {
    const assignmentRef = doc(db, 'assignments', assignmentId)
    const updateData = {
      status: 'accepted',
      acceptedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    if (userId) {
      updateData.userId = userId
    }
    if (userName) {
      updateData.userName = userName
    }
    
    await updateDoc(assignmentRef, updateData)
    
    // Update master set stats
    const assignmentDoc = await getDoc(assignmentRef)
    if (assignmentDoc.exists()) {
      const assignmentData = assignmentDoc.data()
      await updateMasterSetStats(assignmentData.masterSetId)
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error accepting assignment:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Reject an assignment invite
 * @param {string} assignmentId - Assignment ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const rejectAssignment = async (assignmentId) => {
  try {
    const assignmentRef = doc(db, 'assignments', assignmentId)
    await updateDoc(assignmentRef, {
      status: 'rejected',
      rejectedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error rejecting assignment:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Collect a card (general collection or for assignment)
 * @param {Object} cardData - Card collection data
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const collectCard = async (cardData) => {
  try {
    const collectedCardsRef = collection(db, 'collectedCards')
    
    // Check if card already collected in this context
    let existingQuery = query(
      collectedCardsRef,
      where('userId', '==', cardData.userId),
      where('cardId', '==', cardData.cardId),
      where('cardCollection', '==', cardData.cardCollection)
    )
    
    if (cardData.assignmentId) {
      existingQuery = query(
        existingQuery,
        where('assignmentId', '==', cardData.assignmentId)
      )
    } else {
      existingQuery = query(
        existingQuery,
        where('assignmentId', '==', null)
      )
    }
    
    const existingSnapshot = await getDocs(existingQuery)
    
    if (!existingSnapshot.empty) {
      // Update existing collection
      const existingDoc = existingSnapshot.docs[0]
      await updateDoc(doc(db, 'collectedCards', existingDoc.id), {
        quantity: (existingDoc.data().quantity || 1) + (cardData.quantity || 1),
        updatedAt: serverTimestamp()
      })
      
      return { success: true, data: { id: existingDoc.id, updated: true } }
    } else {
      // Create new collection
      const docRef = await addDoc(collectedCardsRef, {
        ...cardData,
        collectedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      // Update assignment stats if collected for assignment
      if (cardData.assignmentId) {
        await updateAssignmentStats(cardData.assignmentId)
      }
      
      return { success: true, data: { id: docRef.id, updated: false } }
    }
  } catch (error) {
    console.error('Error collecting card:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Update assignment statistics
 * @param {string} assignmentId - Assignment ID
 */
export const updateAssignmentStats = async (assignmentId) => {
  try {
    const assignmentRef = doc(db, 'assignments', assignmentId)
    const assignmentDoc = await getDoc(assignmentRef)
    
    if (!assignmentDoc.exists()) return
    
    const assignmentData = assignmentDoc.data()
    
    // Count collected cards for this assignment
    const collectedCardsRef = collection(db, 'collectedCards')
    const collectedQuery = query(
      collectedCardsRef,
      where('assignmentId', '==', assignmentId)
    )
    const collectedSnapshot = await getDocs(collectedQuery)
    const collectedCards = collectedSnapshot.size
    
    // Calculate progress
    const totalCards = assignmentData.totalCards || 0
    const progress = totalCards > 0 ? Math.round((collectedCards / totalCards) * 100) : 0
    
    // Update assignment
    await updateDoc(assignmentRef, {
      collectedCards,
      progress,
      updatedAt: serverTimestamp()
    })
    
    // Update master set stats
    if (assignmentData.masterSetId) {
      await updateMasterSetStats(assignmentData.masterSetId)
    }
  } catch (error) {
    console.error('Error updating assignment stats:', error)
  }
}
