/**
 * Script to add Japanese names (name_ja) to pokemonList.json
 * Matches English names from japanesePokemonNames.json
 * 
 * Usage: node scripts/addJapaneseNamesToPokemonList.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Add Japanese names to pokemonList.json
 */
async function addJapaneseNames() {
  const pokemonListPath = path.join(__dirname, '../src/data/pokemonList.json')
  const japaneseNamesPath = path.join(__dirname, '../src/data/japanesePokemonNames.json')
  
  // Read both files
  console.log('📖 Reading files...')
  const pokemonListContent = fs.readFileSync(pokemonListPath, 'utf-8')
  const japaneseNamesContent = fs.readFileSync(japaneseNamesPath, 'utf-8')
  
  const pokemonList = JSON.parse(pokemonListContent)
  const japaneseNames = JSON.parse(japaneseNamesContent)
  
  console.log(`📊 Found ${pokemonList.length} Pokemon`)
  console.log(`📊 Found ${Object.keys(japaneseNames).length} Japanese name mappings`)
  
  // Create reverse mapping: English name -> Japanese name
  // Also create mapping by nationalDexNumber for more reliable matching
  const englishToJapanese = {}
  const dexToJapanese = {}
  
  for (const [japaneseName, data] of Object.entries(japaneseNames)) {
    // Handle both old format (string) and new format (object)
    if (typeof data === 'string') {
      // Old format: "Japanese": "English"
      const englishName = data
      if (!englishToJapanese[englishName]) {
        englishToJapanese[englishName] = japaneseName
      }
    } else if (data && typeof data === 'object') {
      // New format: "Japanese": { "name": "English", "nationalDexNumber": 1 }
      const englishName = data.name
      const dexNumber = data.nationalDexNumber
      
      if (englishName && !englishToJapanese[englishName]) {
        englishToJapanese[englishName] = japaneseName
      }
      
      if (dexNumber) {
        dexToJapanese[dexNumber] = japaneseName
      }
    }
  }
  
  console.log(`🔄 Created ${Object.keys(englishToJapanese).length} English->Japanese mappings`)
  console.log(`🔄 Created ${Object.keys(dexToJapanese).length} DexNumber->Japanese mappings`)
  
  // Update pokemonList with name_ja
  let updated = 0
  let notFound = []
  
  const updatedPokemonList = pokemonList.map(pokemon => {
    // Try matching by English name first
    let japaneseName = englishToJapanese[pokemon.name]
    
    // If not found by name, try matching by nationalDexNumber (more reliable)
    if (!japaneseName && pokemon.nationalDexNumber) {
      japaneseName = dexToJapanese[pokemon.nationalDexNumber]
    }
    
    if (japaneseName) {
      // Always update if mapping exists (even if name_ja was already set)
      updated++
      return {
        ...pokemon,
        name_ja: japaneseName
      }
    } else {
      // No mapping found - keep existing name_ja if present, otherwise null
      if (!pokemon.name_ja) {
        notFound.push(pokemon.name)
      }
      return {
        ...pokemon,
        name_ja: pokemon.name_ja || null
      }
    }
  })
  
  // Write updated JSON
  console.log('\n💾 Writing updated pokemonList.json...')
  fs.writeFileSync(pokemonListPath, JSON.stringify(updatedPokemonList, null, 2) + '\n', 'utf-8')
  
  // Summary
  console.log('\n✨ Update complete!')
  console.log(`✅ Updated ${updated} Pokemon with Japanese names`)
  console.log(`⚠️  ${notFound.length} Pokemon without Japanese names`)
  
  if (notFound.length > 0 && notFound.length <= 20) {
    console.log('\n📋 Pokemon without Japanese names:')
    notFound.forEach(name => console.log(`   - ${name}`))
  } else if (notFound.length > 20) {
    console.log(`\n📋 ${notFound.length} Pokemon without Japanese names (showing first 20):`)
    notFound.slice(0, 20).forEach(name => console.log(`   - ${name}`))
    console.log(`   ... and ${notFound.length - 20} more`)
  }
  
  // Show sample of updated data
  const sampleWithJa = updatedPokemonList.find(p => p.name_ja)
  if (sampleWithJa) {
    console.log('\n📋 Sample updated entry:')
    console.log(JSON.stringify(sampleWithJa, null, 2))
  }
}

// Run the update
addJapaneseNames().catch(error => {
  console.error('❌ Error:', error)
  process.exit(1)
})

