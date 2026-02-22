/**
 * Firebase Trainers Utility
 * Handles Firestore operations for trainers collection
 */

import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'

/**
 * Get all trainers from Firestore
 * @returns {Promise<Array>} Array of trainer documents
 */
export const getAllTrainers = async () => {
  try {
    const trainersRef = collection(db, 'trainers')
    const q = query(trainersRef, orderBy('trainerName', 'asc'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching trainers:', error)
    throw error
  }
}

/**
 * Get a single trainer by ID
 * @param {string} trainerId - Trainer document ID
 * @returns {Promise<Object|null>} Trainer document or null if not found
 */
export const getTrainerById = async (trainerId) => {
  try {
    const trainerRef = doc(db, 'trainers', trainerId)
    const trainerSnap = await getDoc(trainerRef)
    
    if (trainerSnap.exists()) {
      return {
        id: trainerSnap.id,
        ...trainerSnap.data()
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching trainer:', error)
    throw error
  }
}

/**
 * Get a trainer by name
 * @param {string} trainerName - Trainer name
 * @returns {Promise<Object|null>} Trainer document or null if not found
 */
export const getTrainerByName = async (trainerName) => {
  try {
    const trainersRef = collection(db, 'trainers')
    const q = query(trainersRef, where('trainerName', '==', trainerName))
    const snapshot = await getDocs(q)
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data()
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching trainer by name:', error)
    throw error
  }
}

/**
 * Save a trainer to Firestore
 * @param {Object} trainerData - Trainer data object
 * @returns {Promise<string>} Document ID of saved trainer
 */
export const saveTrainer = async (trainerData) => {
  try {
    const trainersRef = collection(db, 'trainers')
    const docRef = await addDoc(trainersRef, {
      ...trainerData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error('Error saving trainer:', error)
    throw error
  }
}

/**
 * Update a trainer in Firestore
 * @param {string} trainerId - Trainer document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateTrainer = async (trainerId, updates) => {
  try {
    const trainerRef = doc(db, 'trainers', trainerId)
    await updateDoc(trainerRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating trainer:', error)
    throw error
  }
}
