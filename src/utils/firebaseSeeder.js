// Firebase Seeder Utility
// Run this to seed Firebase with Pokemon sets data

import { collection, addDoc, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { allSets } from '../data/pokemonSets'

export const seedFirebaseSets = async () => {
  try {
    // Check if sets already exist
    const setsRef = collection(db, 'sets')
    const snapshot = await getDocs(setsRef)
    
    if (snapshot.size > 0) {
      console.log('Sets already exist in Firebase. Skipping seed.')
      return { success: true, message: 'Sets already exist' }
    }

    // Add all sets to Firebase with proper structure
    const promises = allSets.map(set => {
      // Convert year to releaseDate (use January 1st of that year)
      const releaseDate = set.year 
        ? Timestamp.fromDate(new Date(set.year, 0, 1))
        : null

      return addDoc(setsRef, {
        name: set.name,
        code: set.setCode || set.code || '',
        releaseDate: releaseDate,
        series: set.series || set.type || '',
        totalCards: set.totalCards || 0,
        logo: set.logo || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    })

    await Promise.all(promises)
    console.log(`Successfully seeded ${allSets.length} sets to Firebase!`)
    return { success: true, message: `Seeded ${allSets.length} sets` }
  } catch (error) {
    console.error('Error seeding Firebase:', error)
    return { success: false, error: error.message }
  }
}

// Function to seed from browser console or component
export const seedSets = async () => {
  const result = await seedFirebaseSets()
  if (result.success) {
    alert(result.message)
  } else {
    alert(`Error: ${result.error}`)
  }
}

// Make it available globally for console use
if (typeof window !== 'undefined') {
  window.seedFirebaseSets = seedSets
}

