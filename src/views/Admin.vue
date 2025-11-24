<template>
  <div class="min-h-screen" style="background-color: var(--color-bg-primary);">
    <section class="section section-spacing-md">
      <div class="section-container">
        <div class="section-header">
          <h2>Admin Dashboard</h2>
          <p class="section-subtitle">Manage Pokemon sets and cards</p>
        </div>

        <div class="max-w-6xl mx-auto">
          <!-- Admin Navigation -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <router-link to="/admin/pokemon" class="card hover:shadow-lg transition-shadow cursor-pointer">
              <div class="card-body text-center">
                <h3 class="card-title mb-2">Pokemon Cards</h3>
                <p class="card-content text-sm">Add and manage individual Pokemon cards</p>
              </div>
            </router-link>

            <router-link to="/admin/sets" class="card hover:shadow-lg transition-shadow cursor-pointer">
              <div class="card-body text-center">
                <h3 class="card-title mb-2">Sets</h3>
                <p class="card-content text-sm">Manage card sets and releases</p>
              </div>
            </router-link>

            <div class="card hover:shadow-lg transition-shadow">
              <div class="card-body text-center">
                <h3 class="card-title mb-2">Firebase Status</h3>
                <p class="card-content text-sm">{{ firebaseConnected ? 'Connected' : 'Not Connected' }}</p>
              </div>
            </div>
          </div>

          <!-- Firebase Status -->
          <div class="card mb-6">
            <div class="card-header">
              <h3 class="card-title">Firebase Status</h3>
            </div>
            <div class="card-body">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p class="text-sm text-gray-600 mb-2">Connection Status</p>
                  <p :class="firebaseConnected ? 'text-green-600' : 'text-red-600'">
                    {{ firebaseConnected ? '✓ Connected' : '✗ Not Connected' }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-gray-600 mb-2">Sets in Firebase</p>
                  <p class="text-lg font-semibold">{{ setsCount }} sets</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600 mb-2">Pokemon Cards</p>
                  <p class="text-lg font-semibold">{{ pokemonCount }} cards</p>
                </div>
              </div>
            </div>
          </div>

          <!-- One-Time API Pulls (Collapsible) -->
          <div class="card mb-6">
            <div class="card-header">
              <div class="flex items-center justify-between">
                <h3 class="card-title">One-Time API Pulls</h3>
                <button
                  @click="showOneTimePulls = !showOneTimePulls"
                  class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {{ showOneTimePulls ? '▼ Hide' : '▶ Show' }}
                </button>
              </div>
            </div>
            <div v-show="showOneTimePulls" class="card-body space-y-6">
              <p class="text-xs italic" style="color: var(--color-text-tertiary);">
                These are one-time setup operations. You typically only need to run these once when first setting up the database.
              </p>

              <!-- Seed Sets from API -->
              <div class="p-4 rounded-lg border" style="background-color: var(--color-bg-tertiary); border-color: var(--color-border);">
                <div class="space-y-3">
                  <div>
                    <p class="text-sm font-medium mb-1" style="color: var(--color-text-primary);">Fetch All Sets from API</p>
                    <p class="text-xs mb-3" style="color: var(--color-text-secondary);">
                      Fetch all sets from the Pokemon TCG API and store them in Firestore. 
                      This populates the <code class="text-xs px-1 py-0.5 rounded" style="background-color: var(--color-bg-secondary); color: var(--color-text-primary);">sets</code> collection.
                    </p>
                    <button 
                      @click="seedSetsFromAPI"
                      class="btn btn-h4 btn-primary"
                      :disabled="isSeedingSets"
                    >
                      {{ isSeedingSets ? 'Fetching...' : 'Fetch All Sets from API' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Seed Metadata -->
              <div class="p-4 rounded-lg border" style="background-color: var(--color-bg-tertiary); border-color: var(--color-border);">
                <div class="space-y-3">
                  <div>
                    <p class="text-sm font-medium mb-1" style="color: var(--color-text-primary);">Fetch Metadata from API</p>
                    <p class="text-xs mb-3" style="color: var(--color-text-secondary);">
                      Fetch types, subtypes, supertypes, and rarities from the Pokemon TCG API 
                      and store them in the <code class="text-xs px-1 py-0.5 rounded" style="background-color: var(--color-bg-secondary); color: var(--color-text-primary);">metadata</code> collection.
                    </p>
                    <button 
                      @click="seedMetadataFromAPI"
                      class="btn btn-h4 btn-secondary"
                      :disabled="isSeedingMetadata"
                    >
                      {{ isSeedingMetadata ? 'Fetching...' : 'Fetch Metadata from API' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Update Sprites -->
              <div class="p-4 rounded-lg border" style="background-color: var(--color-bg-tertiary); border-color: var(--color-border);">
                <div class="space-y-3">
                  <div>
                    <p class="text-sm font-medium mb-1" style="color: var(--color-text-primary);">
                      Update PokemonDB Sprites
                    </p>
                    <p class="text-xs mb-3" style="color: var(--color-text-secondary);">
                      Updates Pokemon sprite URLs from <a href="https://pokemondb.net/sprites" target="_blank" style="color: var(--color-accent); text-decoration: underline;">PokemonDB</a>. 
                      Format: <code class="text-xs px-1 py-0.5 rounded" style="background-color: var(--color-bg-secondary);">img.pokemondb.net/sprites/{generation}/{variant}/{name}.png</code>
                      URLs are validated before storing. Uses recommended generation per Pokemon (Gen 9 → Scarlet/Violet, Gen 8 → Sword/Shield, etc.) for best results.
                    </p>
                    <div class="mb-3 space-y-2">
                      <label class="flex items-center gap-2 text-xs" style="color: var(--color-text-secondary);">
                        <input 
                          type="checkbox" 
                          v-model="useRecommendedGeneration"
                          class="rounded"
                        />
                        <span>Use recommended generation per Pokemon (Gen 9 → Scarlet/Violet, Gen 8 → Sword/Shield, etc.)</span>
                      </label>
                      <select 
                        v-model="selectedPokemonDBGeneration"
                        class="px-3 py-1.5 text-sm border rounded-md w-full"
                        style="background-color: var(--color-bg-secondary); border-color: var(--color-border); color: var(--color-text-primary);"
                        :disabled="useRecommendedGeneration"
                      >
                        <option value="sword-shield">Sword & Shield (Gen 8)</option>
                        <option value="scarlet-violet">Scarlet & Violet (Gen 9)</option>
                        <option value="black-white">Black & White (Gen 5)</option>
                        <option value="x-y">X & Y (Gen 6)</option>
                        <option value="diamond-pearl">Diamond & Pearl (Gen 4)</option>
                        <option value="ultra-sun-ultra-moon">Ultra Sun & Moon (Gen 7)</option>
                      </select>
                    </div>
                    <button 
                      @click="updateSpritesFromDB"
                      class="btn btn-h4 btn-primary"
                      :disabled="isUpdatingSpritesDB"
                    >
                      {{ isUpdatingSpritesDB ? 'Updating...' : 'Update Sprite URLs' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- PokemonDB Animated GIFs -->
              <div class="p-4 rounded-lg border" style="background-color: var(--color-bg-tertiary); border-color: var(--color-border);">
                <div class="space-y-3">
                  <div>
                    <p class="text-sm font-medium mb-1" style="color: var(--color-text-primary);">
                      🎬 PokemonDB Animated GIFs
                    </p>
                    <p class="text-xs mb-3" style="color: var(--color-text-secondary);">
                      Updates Pokemon with animated GIF URLs from <a href="https://pokemondb.net/sprites" target="_blank" style="color: var(--color-accent); text-decoration: underline;">PokemonDB</a>.
                      Format: <code class="text-xs px-1 py-0.5 rounded" style="background-color: var(--color-bg-secondary);">img.pokemondb.net/sprites/{generation}/anim/{variant}/{name}.gif</code>
                    </p>
                    <div class="mb-3">
                      <select 
                        v-model="selectedGifGeneration"
                        class="px-3 py-1.5 text-sm border rounded-md w-full"
                        style="background-color: var(--color-bg-secondary); border-color: var(--color-border); color: var(--color-text-primary);"
                      >
                        <option value="black-white">Black & White (Gen 5) - Best GIF coverage</option>
                        <option value="black-2-white-2">Black 2 & White 2</option>
                        <option value="x-y">X & Y (Gen 6)</option>
                        <option value="diamond-pearl">Diamond & Pearl (Gen 4)</option>
                      </select>
                    </div>
                    <button 
                      @click="updateGifsFromDB"
                      class="btn btn-h4 btn-primary w-full"
                      :disabled="isUpdatingGifs"
                    >
                      {{ isUpdatingGifs ? 'Updating...' : 'Add Animated GIFs' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Cleanup Invalid URLs -->
              <div class="p-4 rounded-lg border" style="background-color: var(--color-bg-tertiary); border-color: var(--color-border);">
                <div class="space-y-3">
                  <div>
                    <p class="text-sm font-medium mb-1" style="color: var(--color-text-primary);">
                      🧹 Cleanup Invalid Sprite URLs
                    </p>
                    <p class="text-xs mb-3" style="color: var(--color-text-secondary);">
                      Remove invalid or broken sprite URLs from all Pokemon entries. This helps keep the database clean.
                    </p>
                    <button 
                      @click="cleanupSprites"
                      class="btn btn-h4 btn-secondary"
                      :disabled="isCleaningSprites"
                    >
                      {{ isCleaningSprites ? 'Cleaning...' : 'Cleanup Invalid URLs' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Build Pokemon List -->
          <div class="card mb-6">
            <div class="card-header">
              <h3 class="card-title">Pokemon List Collection</h3>
            </div>
            <div class="card-body">
              <div class="space-y-4">
                <div class="flex items-center justify-between mb-2">
                  <p class="text-sm" style="color: var(--color-text-secondary);">
                    Manage the <code class="text-xs px-1 py-0.5 rounded" style="background-color: var(--color-bg-tertiary); color: var(--color-text-primary);">pokemonList</code> collection.
                  </p>
                  <span v-if="pokemonListCount > 0" class="text-xs" style="color: var(--color-text-tertiary);">
                    {{ pokemonListCount }} entries
                  </span>
                </div>
                
                <!-- Seed from JSON (only show if no entries exist) -->
                <div v-if="pokemonListCount === 0" class="space-y-3 p-4 rounded-lg border" style="background-color: var(--color-bg-tertiary); border-color: var(--color-border);">
                  <div>
                    <p class="text-sm font-medium mb-1" style="color: var(--color-text-primary);">Initial Setup: Seed Base List</p>
                    <p class="text-xs mb-3" style="color: var(--color-text-secondary);">
                      Creates base entries for all Pokemon (1-1025) with names and national dex numbers. 
                      This is a one-time setup step.
                    </p>
                    <button 
                      @click="seedPokemonListFromJSONData"
                      class="btn btn-h4 btn-primary"
                      :disabled="isSeedingPokemonListJSON"
                    >
                      {{ isSeedingPokemonListJSON ? 'Seeding...' : 'Seed Base List from JSON' }}
                    </button>
                  </div>
                </div>

                <!-- Build from Cards (always available) -->
                <div class="space-y-3 p-4 rounded-lg border" style="background-color: var(--color-bg-tertiary); border-color: var(--color-border);">
                  <div>
                    <p class="text-sm font-medium mb-1" style="color: var(--color-text-primary);">
                      Update with Card Data: Build from Cards
                    </p>
                    <p class="text-xs mb-3" style="color: var(--color-text-secondary);">
                      <strong>Updates the existing pokemonList collection</strong> by grouping card variations together 
                      (e.g., "Mega Charizard", "Charizard EX" → "Charizard") and enriching entries with:
                      card images, types, card counts, set information, and card IDs.
                    </p>
                    <button 
                      @click="buildPokemonListFromCards"
                      class="btn btn-h4 btn-primary"
                      :disabled="isBuildingPokemonList"
                    >
                      {{ isBuildingPokemonList ? 'Building...' : 'Build/Update from Cards' }}
                    </button>
                  </div>
                </div>

                <p class="text-xs italic" style="color: var(--color-text-tertiary);">
                  💡 <strong>Workflow:</strong> First seed the base list (if needed), then fetch cards from sets below. After cards are fetched, click "Build/Update from Cards" to group card variations together and add them under each Pokemon entry.
                </p>
              </div>
            </div>
          </div>

          <!-- Fetch Cards by Set -->
          <div class="card mb-6">
            <div class="card-header">
              <div class="flex items-center justify-between">
                <h3 class="card-title">Fetch Cards by Set</h3>
                <button
                  @click="updateSetCardCounts"
                  class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  :disabled="isUpdatingCardCounts"
                  title="Recalculate card counts for all sets"
                >
                  {{ isUpdatingCardCounts ? 'Updating...' : '🔄 Update Counts' }}
                </button>
              </div>
            </div>
            <div class="card-body">
              <!-- Search/Filter -->
              <div class="mb-6">
                <div class="flex gap-4">
                  <input 
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search sets by name..."
                    class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                  <select 
                    v-model="filterSeries"
                    class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="">All Series</option>
                    <option value="Base">Base</option>
                    <option value="Jungle">Jungle</option>
                    <option value="Fossil">Fossil</option>
                    <option value="Neo">Neo</option>
                    <option value="EX">EX</option>
                    <option value="Diamond & Pearl">Diamond & Pearl</option>
                    <option value="Black & White">Black & White</option>
                    <option value="XY">XY</option>
                    <option value="Sun & Moon">Sun & Moon</option>
                    <option value="Sword & Shield">Sword & Shield</option>
                    <option value="Scarlet & Violet">Scarlet & Violet</option>
                  </select>
                </div>
              </div>

              <!-- Sets Grid -->
              <div v-if="isLoadingSets" class="text-center py-12">
                <p class="text-gray-600">Loading sets...</p>
              </div>
              
              <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div 
                  v-for="set in filteredSets" 
                  :key="set.id"
                  class="card"
                >
                  <div class="card-body">
                    <h4 class="card-title mb-2">{{ set.name }}</h4>
                    <p class="text-sm text-gray-600 mb-2">{{ set.code }}</p>
                    <p class="text-xs text-gray-500 mb-4">
                      <span v-if="set.totalCardsInSet">{{ set.totalCardsInSet }} total</span>
                      <span v-if="set.totalCardsInSet && set.cardCount > 0"> • </span>
                      <span v-if="set.cardCount > 0" class="text-green-600 font-medium">
                        {{ set.cardCount }} fetched
                      </span>
                      <span v-if="!set.totalCardsInSet && !set.cardCount">No cards info</span>
                      • {{ formatDate(set.releaseDate) }}
                    </p>
                    
                    <div class="flex items-center justify-between">
                      <div class="text-sm">
                        <span v-if="set.cardCount > 0" class="text-green-600 font-medium">
                          {{ set.cardCount }} / {{ set.totalCardsInSet || '?' }} fetched
                        </span>
                        <span v-else class="text-gray-400">
                          No cards fetched yet
                        </span>
                      </div>
                      <button 
                        @click="fetchCardsForSet(set)"
                        class="btn btn-h5 btn-primary"
                        :disabled="isFetching[set.id]"
                      >
                        {{ isFetching[set.id] ? 'Fetching...' : 'Fetch Cards' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-if="!isLoadingSets && filteredSets.length === 0" class="text-center py-12">
                <p class="text-gray-600">No sets found. Fetch sets from API first.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, query, where, updateDoc, serverTimestamp, getCountFromServer } from 'firebase/firestore'
import { db } from '../config/firebase'
import { seedSetsFromAPI as seedSetsFromAPIFunc, seedCardsFromSet, seedMetadata, buildPokemonList, seedPokemonListFromJSON, updatePokemonSpritesFromDB, updatePokemonGifsFromDB, cleanupInvalidSpriteUrls, updateAllSetCardCounts } from '../utils/pokemonTCGSeeder'
import { searchSets, fetchSetById } from '../utils/pokemonTCGAPI'
import { Timestamp } from 'firebase/firestore'

const firebaseConnected = ref(false)
const setsCount = ref(0)
const pokemonCount = ref(0)
const isSeedingSets = ref(false)
const isLoadingSets = ref(false)
const searchQuery = ref('')
const filterSeries = ref('')
const isFetching = ref({})
const isSeedingMetadata = ref(false)
const isBuildingPokemonList = ref(false)
const isSeedingPokemonListJSON = ref(false)
const isUpdatingSpritesDB = ref(false)
const isUpdatingGifs = ref(false)
const isCleaningSprites = ref(false)
const isUpdatingCardCounts = ref(false)
const selectedPokemonDBGeneration = ref('sword-shield')
const selectedGifGeneration = ref('black-white')
const useRecommendedGeneration = ref(true)
const pokemonListCount = ref(0)
const sets = ref([])
const showOneTimePulls = ref(false)
const setIdToCheck = ref('')
const setCheckResult = ref(null)
const isCheckingSet = ref(false)

const formatDate = (date) => {
  if (!date) return 'N/A'
  if (date instanceof Timestamp) {
    return date.toDate().toLocaleDateString()
  }
  if (date instanceof Date) {
    return date.toLocaleDateString()
  }
  return date
}

const filteredSets = computed(() => {
  let filtered = sets.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(set => 
      set.name.toLowerCase().includes(query) ||
      set.code.toLowerCase().includes(query)
    )
  }

  if (filterSeries.value) {
    filtered = filtered.filter(set => 
      set.series && set.series.includes(filterSeries.value)
    )
  }

  return filtered.sort((a, b) => {
    const dateA = a.releaseDate instanceof Timestamp ? a.releaseDate.toDate() : new Date(a.releaseDate || 0)
    const dateB = b.releaseDate instanceof Timestamp ? b.releaseDate.toDate() : new Date(b.releaseDate || 0)
    return dateB - dateA // Newest first
  })
})

const checkFirebaseStatus = async () => {
  try {
    const setsRef = collection(db, 'sets')
    const setsSnapshot = await getDocs(setsRef)
    setsCount.value = setsSnapshot.size
    
    // Don't fetch all pokemon cards just to count - too expensive!
    // Instead, calculate from sets' totalCards or use a metadata document
    // For now, we'll skip pokemon count to avoid quota issues
    pokemonCount.value = 0 // Set to 0 or calculate from sets if needed
    
    const pokemonListRef = collection(db, 'pokemonList')
    const pokemonListSnapshot = await getDocs(pokemonListRef)
    pokemonListCount.value = pokemonListSnapshot.size
    
    firebaseConnected.value = true
  } catch (error) {
    console.log('Firebase not configured:', error.message)
    firebaseConnected.value = false
    setsCount.value = 0
    pokemonCount.value = 0
    pokemonListCount.value = 0
  }
}

const loadSets = async () => {
  isLoadingSets.value = true
  try {
    const setsRef = collection(db, 'sets')
    const snapshot = await getDocs(setsRef)
    const pokemonRef = collection(db, 'pokemon')
    
    // Use fetchedCardsCount (actual cards in database) instead of totalCards (API total)
    // This shows how many cards have actually been fetched and stored
    const setsData = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const setData = { id: doc.id, ...doc.data() }
        const apiSetId = setData.apiId
        
        // If fetchedCardsCount is missing, calculate it on-the-fly
        let fetchedCount = setData.fetchedCardsCount
        if (fetchedCount === undefined || fetchedCount === null) {
          if (apiSetId) {
            try {
              const apiSetIdQuery = query(pokemonRef, where('apiSetId', '==', apiSetId))
              const countSnapshot = await getCountFromServer(apiSetIdQuery)
              fetchedCount = countSnapshot.data().count
              
              // Update the set document with the calculated count
              await updateDoc(doc.ref, {
                fetchedCardsCount: fetchedCount,
                updatedAt: serverTimestamp()
              })
            } catch (error) {
              console.error(`Error calculating count for set ${apiSetId}:`, error)
              fetchedCount = 0
            }
          } else {
            fetchedCount = 0
          }
        }
        
        setData.cardCount = fetchedCount
        setData.fetchedCardsCount = fetchedCount // Ensure it's set
        setData.totalCardsInSet = setData.totalCards || 0 // Keep API total for reference
        
        return setData
      })
    )
    
    // Debug logging for first few sets
    if (setsData.length > 0) {
      console.log('Sample sets after loading:', setsData.slice(0, 3).map(s => ({
        name: s.name,
        apiId: s.apiId,
        fetchedCardsCount: s.fetchedCardsCount,
        cardCount: s.cardCount,
        totalCards: s.totalCards
      })))
    }
    
    sets.value = setsData
  } catch (error) {
    console.error('Error loading sets:', error)
  } finally {
    isLoadingSets.value = false
  }
}

const seedSetsFromAPI = async () => {
  isSeedingSets.value = true
  try {
    const result = await seedSetsFromAPIFunc()
    if (result.success) {
      alert(`Success! ${result.message}`)
      await checkFirebaseStatus()
      await loadSets() // Reload sets to show in grid
    } else {
      alert(`Error: ${result.error}`)
    }
  } catch (error) {
    alert(`Error seeding: ${error.message}`)
  } finally {
    isSeedingSets.value = false
  }
}

const checkSetId = async () => {
  if (!setIdToCheck.value.trim()) return
  
  isCheckingSet.value = true
  setCheckResult.value = null
  
  try {
    // First try to fetch by exact ID
    const result = await fetchSetById(setIdToCheck.value.trim())
    
    if (result.success) {
      setCheckResult.value = { success: true, data: result.data }
    } else {
      // Try searching for similar sets
      const searchResult = await searchSets(setIdToCheck.value.trim())
      if (searchResult.success && searchResult.data.length > 0) {
        setCheckResult.value = { 
          success: false, 
          error: `Set ID '${setIdToCheck.value}' not found. Found ${searchResult.totalCount} similar sets. Did you mean: ${searchResult.data.slice(0, 3).map(s => s.id).join(', ')}?` 
        }
      } else {
        setCheckResult.value = { 
          success: false, 
          error: `Set ID '${setIdToCheck.value}' not found in the API. It may not exist, be misspelled, or the API may not have this set yet.` 
        }
      }
    }
  } catch (error) {
    setCheckResult.value = { success: false, error: error.message }
  } finally {
    isCheckingSet.value = false
  }
}

const fetchCardsForSet = async (set) => {
  if (!confirm(`Fetch all cards from "${set.name}"? This may take a few minutes.`)) {
    return
  }

  isFetching.value[set.id] = true
  
  try {
    const result = await seedCardsFromSet(set.apiId, set.apiId)
    
    if (result.success) {
      alert(`Success! ${result.message}`)
      // Reload sets to update card counts
      await loadSets()
      await checkFirebaseStatus()
    } else {
      alert(`Error: ${result.error}`)
    }
  } catch (error) {
    alert(`Error: ${error.message}`)
  } finally {
    isFetching.value[set.id] = false
  }
}

const seedMetadataFromAPI = async () => {
  isSeedingMetadata.value = true
  try {
    const result = await seedMetadata()
    if (result.success) {
      const counts = Object.entries(result.results)
        .filter(([_, r]) => r.success)
        .map(([key, r]) => `${key}: ${r.count}`)
        .join(', ')
      alert(`Success! Seeded metadata: ${counts}`)
    } else {
      alert(`Error: ${result.error}`)
    }
  } catch (error) {
    alert(`Error: ${error.message}`)
  } finally {
    isSeedingMetadata.value = false
  }
}

const seedPokemonListFromJSONData = async () => {
  if (!confirm('Seed base Pokemon list from JSON? This will create entries for all Pokemon (1-1025) with names and national dex numbers. This is a one-time setup step.')) {
    return
  }

  isSeedingPokemonListJSON.value = true
  try {
    const result = await seedPokemonListFromJSON()
    if (result.success) {
      alert(`Success! ${result.message}\n\nNext step: Click "Build/Update from Cards" to enrich these entries with card data.`)
      await checkFirebaseStatus()
    } else {
      alert(`Error: ${result.error}`)
    }
  } catch (error) {
    alert(`Error: ${error.message}`)
  } finally {
    isSeedingPokemonListJSON.value = false
  }
}

const buildPokemonListFromCards = async () => {
  if (!confirm('Build/Update Pokemon list from existing cards? This will:\n\n• Group card variations together (e.g., "Mega Charizard" → "Charizard")\n• Update existing pokemonList entries with card images, types, counts, and sets\n• Create new entries for Pokemon found in cards but not in the base list')) {
    return
  }

  isBuildingPokemonList.value = true
  try {
    const result = await buildPokemonList()
    if (result.success) {
      alert(`Success! ${result.message}\n\n${result.added > 0 ? `Added ${result.added} new entries. ` : ''}${result.updated > 0 ? `Updated ${result.updated} existing entries.` : ''}`)
      await checkFirebaseStatus()
    } else {
      alert(`Error: ${result.error}`)
    }
  } catch (error) {
    alert(`Error: ${error.message}`)
  } finally {
    isBuildingPokemonList.value = false
  }
}

const updateSpritesFromDB = async () => {
  const generation = useRecommendedGeneration.value ? null : selectedPokemonDBGeneration.value
  const genText = useRecommendedGeneration.value ? 'recommended generations per Pokemon' : generation
  if (!confirm(`Update all Pokemon entries with PokemonDB sprites (${genText})? This will add sprite URLs to Pokemon that don't already have PokemonDB sprites. URLs will be validated before storing.`)) {
    return
  }

  isUpdatingSpritesDB.value = true
  try {
    const result = await updatePokemonSpritesFromDB(generation, false, useRecommendedGeneration.value)
    if (result.success) {
      alert(`Success! ${result.message}\n\n${result.updated > 0 ? `Updated ${result.updated} Pokemon with sprites. ` : ''}${result.skipped > 0 ? `${result.skipped} already had sprites. ` : ''}${result.errors > 0 ? `${result.errors} errors. ` : ''}${result.invalidUrls > 0 ? `${result.invalidUrls} invalid URLs skipped.` : ''}`)
      await checkFirebaseStatus()
    } else {
      alert(`Error: ${result.error}`)
    }
  } catch (error) {
    alert(`Error: ${error.message}`)
  } finally {
    isUpdatingSpritesDB.value = false
  }
}

const updateGifsFromDB = async () => {
  const genText = selectedGifGeneration.value
  if (!confirm(`Update all Pokemon entries with PokemonDB animated GIFs (${genText})? This will add GIF URLs to Pokemon that don't already have GIFs.`)) {
    return
  }

  isUpdatingGifs.value = true
  try {
    const result = await updatePokemonGifsFromDB(selectedGifGeneration.value, false)
    if (result.success) {
      alert(`Success! ${result.message}\n\n${result.updated > 0 ? `Updated ${result.updated} Pokemon with GIFs. ` : ''}${result.skipped > 0 ? `${result.skipped} already had GIFs. ` : ''}${result.errors > 0 ? `${result.errors} errors.` : ''}`)
      await checkFirebaseStatus()
    } else {
      alert(`Error: ${result.error}`)
    }
  } catch (error) {
    alert(`Error: ${error.message}`)
  } finally {
    isUpdatingGifs.value = false
  }
}

const cleanupSprites = async () => {
  if (!confirm('Clean up invalid sprite URLs? This will remove broken or incorrectly formatted sprite URLs from all Pokemon entries.')) {
    return
  }

  isCleaningSprites.value = true
  try {
    const result = await cleanupInvalidSpriteUrls()
    if (result.success) {
      alert(`Success! ${result.message}\n\n${result.cleaned > 0 ? `Cleaned ${result.cleaned} entries. ` : ''}${result.removed > 0 ? `Removed ${result.removed} invalid URLs.` : ''}`)
      await checkFirebaseStatus()
    } else {
      alert(`Error: ${result.error}`)
    }
  } catch (error) {
    alert(`Error: ${error.message}`)
  } finally {
    isCleaningSprites.value = false
  }
}

const updateSetCardCounts = async () => {
  if (!confirm('Recalculate card counts for all sets? This will update the "fetched cards" count based on actual cards in the database.')) {
    return
  }

  isUpdatingCardCounts.value = true
  try {
    console.log('Starting updateSetCardCounts...')
    const result = await updateAllSetCardCounts()
    console.log('Update result:', result)
    if (result.success) {
      alert(`Success! ${result.message}`)
      // Wait a moment for Firestore to propagate the updates
      await new Promise(resolve => setTimeout(resolve, 500))
      await loadSets() // Reload sets to show updated counts
    } else {
      alert(`Error: ${result.error}`)
    }
  } catch (error) {
    console.error('Error in updateSetCardCounts:', error)
    alert(`Error: ${error.message}`)
  } finally {
    isUpdatingCardCounts.value = false
  }
}

onMounted(() => {
  checkFirebaseStatus()
  loadSets()
})
</script>
