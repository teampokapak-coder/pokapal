/**
 * Seed Trainers from CSV
 * Usage: node scripts/seedTrainers.js <path-to-csv-file>
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, query, where, writeBatch, doc, serverTimestamp } from 'firebase/firestore'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env file manually
function loadEnvFile() {
  try {
    const envPath = join(__dirname, '..', '.env')
    const envContent = readFileSync(envPath, 'utf-8')
    const envVars = {}
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '') // Remove quotes
          envVars[key.trim()] = value.trim()
        }
      }
    })
    
    // Set environment variables
    Object.keys(envVars).forEach(key => {
      if (!process.env[key]) {
        process.env[key] = envVars[key]
      }
    })
    
    return true
  } catch (error) {
    console.log('Could not load .env file:', error.message)
    return false
  }
}

// Load environment variables
loadEnvFile()

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
}

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Error: Firebase configuration missing!')
  console.error('Please set the following environment variables:')
  console.error('  VITE_FIREBASE_API_KEY')
  console.error('  VITE_FIREBASE_AUTH_DOMAIN')
  console.error('  VITE_FIREBASE_PROJECT_ID')
  console.error('  VITE_FIREBASE_STORAGE_BUCKET')
  console.error('  VITE_FIREBASE_MESSAGING_SENDER_ID')
  console.error('  VITE_FIREBASE_APP_ID')
  process.exit(1)
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

/**
 * Parse CSV text into array of objects
 */
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim())
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header and one data row')
  }
  
  const headers = lines[0].split(',').map(h => h.trim())
  const data = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    const row = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    if (row['Trainer Name'] && row['Sprite URL']) {
      data.push(row)
    }
  }
  
  return data
}

/**
 * Seed trainers to Firestore
 */
async function seedTrainers(trainersData) {
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
    
    for (const trainerRow of batchTrainers) {
      try {
        const trainerName = trainerRow['Trainer Name']
        const spriteUrl = trainerRow['Sprite URL']
        
        if (!trainerName || !spriteUrl) {
          console.warn(`⚠️ Skipping trainer with missing data:`, trainerRow)
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
        console.error(`Error processing trainer ${trainerRow['Trainer Name']}:`, error)
        errors++
      }
    }
    
    await batch.commit()
    console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(trainersData.length / batchSize)}`)
  }
  
  console.log(`✨ Seeded trainers: ${added} added, ${updated} updated, ${errors} errors`)
  return { success: true, added, updated, errors, total: trainersData.length }
}

/**
 * Main function
 */
async function main() {
  const csvPath = process.argv[2]
  
  if (!csvPath) {
    console.error('Usage: node scripts/seedTrainers.js <path-to-csv-file>')
    console.error('Example: node scripts/seedTrainers.js ~/Downloads/pokemon_trainer_sprites.csv')
    process.exit(1)
  }
  
  try {
    console.log(`Reading CSV file: ${csvPath}`)
    const csvText = readFileSync(csvPath, 'utf-8')
    const trainersData = parseCSV(csvText)
    console.log(`Parsed ${trainersData.length} trainers from CSV`)
    
    const result = await seedTrainers(trainersData)
    
    if (result.success) {
      console.log('\n✅ Seeding completed successfully!')
      console.log(`   Added: ${result.added}`)
      console.log(`   Updated: ${result.updated}`)
      console.log(`   Errors: ${result.errors}`)
      process.exit(0)
    } else {
      console.error('\n❌ Seeding failed:', result.error)
      process.exit(1)
    }
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
