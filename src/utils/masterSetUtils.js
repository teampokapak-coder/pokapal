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
  serverTimestamp,
  arrayUnion
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
      // Use cardId (API ID like "me02-013") instead of id (Firestore document ID)
      // ChallengeDetails.vue queries by the 'id' field in documents, which is the API ID
      return result.data.map(card => card.cardId || card.id || card.apiId)
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
      // Use cardId (API ID like "me02-013") instead of id (Firestore document ID)
      // ChallengeDetails.vue queries by the 'id' field in documents, which is the API ID
      const cardId = card.cardId || card.id || card.apiId
      if (card.language === 'en' && languages.includes('en')) {
        card_en.push(cardId)
      } else if (card.language === 'ja' && languages.includes('ja')) {
        card_ja.push(cardId)
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

/**
 * Sync cards for a Pokemon master set - adds any missing cards that have been added since creation
 * @param {string} masterSetId - Master set ID
 * @returns {Promise<{success: boolean, addedCards?: number, error?: string}>}
 */
export const syncPokemonMasterSetCards = async (masterSetId) => {
  try {
    // 1. Get the master set
    const masterSetRef = doc(db, 'masterSets', masterSetId)
    const masterSetDoc = await getDoc(masterSetRef)
    
    if (!masterSetDoc.exists()) {
      return { success: false, error: 'Master set not found' }
    }
    
    const masterSetData = masterSetDoc.data()
    
    // 2. Only sync Pokemon master sets
    if (masterSetData.type !== 'pokemon' || !masterSetData.targetPokemonId) {
      return { success: false, error: 'This master set is not a Pokemon master set' }
    }
    
    // 3. Get the Pokemon's national dex number
    const nationalDexNumber = parseInt(masterSetData.targetPokemonId)
    if (isNaN(nationalDexNumber)) {
      return { success: false, error: 'Invalid Pokemon ID' }
    }
    
    // 4. Get current full card list for this Pokemon
    const languages = masterSetData.languages || ['en', 'ja']
    const currentCardIds = await getCardIdsForPokemon(nationalDexNumber, languages)
    
    // 5. Get all assignments for this master set
    const assignmentsRef = collection(db, 'assignments')
    const assignmentsQuery = query(
      assignmentsRef,
      where('masterSetId', '==', masterSetId)
    )
    const assignmentsSnapshot = await getDocs(assignmentsQuery)
    
    if (assignmentsSnapshot.empty) {
      return { success: false, error: 'No assignments found for this master set' }
    }
    
    let totalAddedCards = 0
    
    // 6. Update each assignment with missing cards
    for (const assignmentDoc of assignmentsSnapshot.docs) {
      const assignmentData = assignmentDoc.data()
      const assignmentRef = doc(db, 'assignments', assignmentDoc.id)
      
      const existingCardEn = new Set(assignmentData.card_en || [])
      const existingCardJa = new Set(assignmentData.card_ja || [])
      
      // Find missing cards
      const missingCardEn = currentCardIds.card_en.filter(id => !existingCardEn.has(id))
      const missingCardJa = currentCardIds.card_ja.filter(id => !existingCardJa.has(id))
      
      if (missingCardEn.length > 0 || missingCardJa.length > 0) {
        const updateData = {
          updatedAt: serverTimestamp()
        }
        
        // Add missing cards using arrayUnion (works even if array doesn't exist yet)
        if (missingCardEn.length > 0) {
          // arrayUnion can take multiple arguments
          updateData.card_en = arrayUnion(...missingCardEn)
        }
        if (missingCardJa.length > 0) {
          updateData.card_ja = arrayUnion(...missingCardJa)
        }
        
        // Calculate new total cards count
        // Note: After arrayUnion, the arrays will have the new cards added
        const currentTotalEn = (assignmentData.card_en || []).length
        const currentTotalJa = (assignmentData.card_ja || []).length
        const newTotalEn = currentTotalEn + missingCardEn.length
        const newTotalJa = currentTotalJa + missingCardJa.length
        updateData.totalCards = newTotalEn + newTotalJa
        
        await updateDoc(assignmentRef, updateData)
        
        totalAddedCards += missingCardEn.length + missingCardJa.length
        
        // Update assignment stats (will recalculate progress)
        await updateAssignmentStats(assignmentDoc.id)
      }
    }
    
    // 7. Update master set timestamp
    await updateDoc(masterSetRef, {
      updatedAt: serverTimestamp()
    })
    
    return { 
      success: true, 
      addedCards: totalAddedCards,
      message: totalAddedCards > 0 
        ? `Added ${totalAddedCards} new card(s) to all assignments` 
        : 'All cards are already up to date'
    }
  } catch (error) {
    console.error('Error syncing Pokemon master set cards:', error)
    return { success: false, error: error.message }
  }
}
