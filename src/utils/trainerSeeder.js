/**
 * Trainer Seeder Utility
 * Seeds trainers collection from CSV data
 */

import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  updateDoc,
  doc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { saveTrainer } from './firebaseTrainers'

/**
 * Seed trainers from CSV data
 * @param {Array} trainersData - Array of {trainerName, spriteUrl} objects
 * @returns {Promise<{success: boolean, added: number, updated: number, errors: number}>}
 */
export const seedTrainers = async (trainersData) => {
  try {
    console.log(`🌱 Seeding ${trainersData.length} trainers...`)
    const trainersRef = collection(db, 'trainers')
    
    // Get existing trainers
    const existingSnapshot = await getDocs(trainersRef)
    const existing = new Map()
    existingSnapshot.docs.forEach(doc => {
      const data = doc.data()
      if (data.trainerName) {
        existing.set(data.trainerName.toLowerCase(), doc.id)
      }
    })
    
    let added = 0
    let updated = 0
    let errors = 0
    
    // Process trainers in batches
    const batchSize = 50
    for (let i = 0; i < trainersData.length; i += batchSize) {
      const batch = writeBatch(db)
      const batchTrainers = trainersData.slice(i, i + batchSize)
      
      for (const trainerData of batchTrainers) {
        try {
          const trainerName = trainerData.trainerName || trainerData['Trainer Name']
          const spriteUrl = trainerData.spriteUrl || trainerData['Sprite URL']
          
          if (!trainerName || !spriteUrl) {
            console.warn(`⚠️ Skipping trainer with missing data:`, trainerData)
            errors++
            continue
          }
          
          const trainerDoc = {
            trainerName: trainerName.trim(),
            icon: spriteUrl.trim(),
            artistCreditUrl: 'https://play.pokemonshowdown.com/sprites/trainers/?filter=credited',
            updatedAt: serverTimestamp()
          }
          
          const existingDocId = existing.get(trainerName.toLowerCase())
          
          if (existingDocId) {
            const trainerRef = doc(db, 'trainers', existingDocId)
            batch.update(trainerRef, trainerDoc)
            updated++
          } else {
            const trainerRef = doc(trainersRef)
            batch.set(trainerRef, {
              ...trainerDoc,
              createdAt: serverTimestamp()
            })
            added++
          }
        } catch (error) {
          console.error(`Error processing trainer ${trainerData.trainerName}:`, error)
          errors++
        }
      }
      
      await batch.commit()
      console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(trainersData.length / batchSize)}`)
    }
    
    console.log(`✨ Seeded trainers: ${added} added, ${updated} updated, ${errors} errors`)
    return { success: true, added, updated, errors, total: trainersData.length }
  } catch (error) {
    console.error('Error seeding trainers:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Parse CSV data and seed trainers
 * @param {string} csvText - CSV text content
 * @returns {Promise<{success: boolean, added: number, updated: number, errors: number}>}
 */
export const seedTrainersFromCSV = async (csvText) => {
  try {
    const lines = csvText.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim())
    
    const trainersData = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const trainer = {}
      headers.forEach((header, index) => {
        trainer[header] = values[index] || ''
      })
      trainersData.push(trainer)
    }
    
    return await seedTrainers(trainersData)
  } catch (error) {
    console.error('Error parsing CSV:', error)
    return { success: false, error: error.message }
  }
}
