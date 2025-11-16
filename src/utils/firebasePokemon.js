// Firebase Pokemon Data Management Utilities

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
// POKEMON CARDS
// ============================================

export const addPokemonCard = async (pokemonData) => {
  try {
    const pokemonRef = collection(db, 'pokemon')
    const docRef = await addDoc(pokemonRef, {
      ...pokemonData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error('Error adding Pokemon card:', error)
    return { success: false, error: error.message }
  }
}

export const updatePokemonCard = async (pokemonId, updates) => {
  try {
    const pokemonRef = doc(db, 'pokemon', pokemonId)
    await updateDoc(pokemonRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    return { success: true }
  } catch (error) {
    console.error('Error updating Pokemon card:', error)
    return { success: false, error: error.message }
  }
}

export const deletePokemonCard = async (pokemonId) => {
  try {
    const pokemonRef = doc(db, 'pokemon', pokemonId)
    await deleteDoc(pokemonRef)
    return { success: true }
  } catch (error) {
    console.error('Error deleting Pokemon card:', error)
    return { success: false, error: error.message }
  }
}

export const getPokemonCard = async (pokemonId) => {
  try {
    const pokemonRef = doc(db, 'pokemon', pokemonId)
    const docSnap = await getDoc(pokemonRef)
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } }
    } else {
      return { success: false, error: 'Card not found' }
    }
  } catch (error) {
    console.error('Error getting Pokemon card:', error)
    return { success: false, error: error.message }
  }
}

export const getAllPokemonCards = async (filters = {}) => {
  try {
    const pokemonRef = collection(db, 'pokemon')
    let q = query(pokemonRef)
    
    // Only order by nationalDexNumber if we're not filtering (to avoid index issues)
    // If filtering, we'll sort in memory
    if (!filters.set && !filters.setCode && !filters.rarity && !filters.limit) {
      try {
        q = query(pokemonRef, orderBy('nationalDexNumber', 'asc'))
      } catch (e) {
        // If ordering fails (no index), just get all without ordering
        q = query(pokemonRef)
      }
    }
    
    if (filters.set) {
      q = query(q, where('set', '==', filters.set))
    }
    if (filters.setCode) {
      q = query(q, where('setCode', '==', filters.setCode))
    }
    if (filters.rarity) {
      q = query(q, where('rarity', '==', filters.rarity))
    }
    
    // Apply limit at query level for better performance
    if (filters.limit && filters.limit > 0) {
      q = query(q, limit(filters.limit))
    }
    
    const snapshot = await getDocs(q)
    const cards = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // Sort in memory if we didn't order by nationalDexNumber
    if (filters.set || filters.setCode || filters.rarity) {
      cards.sort((a, b) => {
        if (a.nationalDexNumber && b.nationalDexNumber) {
          return a.nationalDexNumber - b.nationalDexNumber
        }
        if (a.nationalDexNumber) return -1
        if (b.nationalDexNumber) return 1
        return (a.name || '').localeCompare(b.name || '')
      })
    }
    
    return { success: true, data: cards }
  } catch (error) {
    console.error('Error getting Pokemon cards:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// SETS
// ============================================

export const addSet = async (setData) => {
  try {
    const setsRef = collection(db, 'sets')
    const docRef = await addDoc(setsRef, {
      ...setData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error('Error adding set:', error)
    return { success: false, error: error.message }
  }
}

export const updateSet = async (setId, updates) => {
  try {
    const setRef = doc(db, 'sets', setId)
    await updateDoc(setRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    return { success: true }
  } catch (error) {
    console.error('Error updating set:', error)
    return { success: false, error: error.message }
  }
}

export const deleteSet = async (setId) => {
  try {
    const setRef = doc(db, 'sets', setId)
    await deleteDoc(setRef)
    return { success: true }
  } catch (error) {
    console.error('Error deleting set:', error)
    return { success: false, error: error.message }
  }
}

export const getAllSets = async () => {
  try {
    const setsRef = collection(db, 'sets')
    const q = query(setsRef, orderBy('releaseDate', 'desc'))
    const snapshot = await getDocs(q)
    const sets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    return { success: true, data: sets }
  } catch (error) {
    console.error('Error getting sets:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// BULK OPERATIONS
// ============================================

export const bulkAddPokemonCards = async (cardsArray) => {
  try {
    const pokemonRef = collection(db, 'pokemon')
    const batch = []
    
    for (const card of cardsArray) {
      batch.push(addDoc(pokemonRef, {
        ...card,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }))
    }
    
    const results = await Promise.all(batch)
    return { 
      success: true, 
      count: results.length,
      ids: results.map(r => r.id)
    }
  } catch (error) {
    console.error('Error bulk adding Pokemon cards:', error)
    return { success: false, error: error.message }
  }
}

