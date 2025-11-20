<template>
  <div class="h-screen flex flex-col overflow-hidden" style="background-color: var(--color-bg-primary);">
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar: Trending Master Sets (Desktop Only) -->
      <aside class="hidden lg:flex w-64 sidebar flex-col overflow-hidden">
        <div class="p-4 overflow-y-auto flex-1">
          <h6 class="mb-4">Trending to Master</h6>
          
          <!-- Trending Sets -->
          <div class="mb-6">
            <h6 class="section-label mb-3">Popular Sets</h6>
            <div class="space-y-1">
              <button
                v-for="set in trendingSets"
                :key="set.id"
                @click="handleSetClick(set)"
                class="w-full text-left px-3 py-2 text-sm rounded sidebar-hover transition-colors"
              >
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded flex-shrink-0 flex items-center justify-center text-xs font-medium" style="background-color: var(--color-bg-tertiary); color: var(--color-text-secondary);">
                    {{ set.code?.substring(0, 2).toUpperCase() || '?' }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="truncate list-item-title">{{ set.name }}</p>
                    <p class="text-xs truncate">{{ set.series }}</p>
                  </div>
                </div>
              </button>
            </div>
            <div v-if="trendingSets.length === 0" class="text-center py-4">
              <p class="text-xs">Loading sets...</p>
            </div>
          </div>

          <!-- Trending Pokemon -->
          <div class="mb-6">
            <h6 class="section-label mb-3">Popular Pokemon</h6>
            <div class="space-y-1">
              <button
                v-for="pokemon in trendingPokemon"
                :key="pokemon.id || pokemon.name"
                @click="handlePokemonClick(pokemon)"
                class="w-full text-left px-3 py-2 text-sm rounded sidebar-hover transition-colors"
              >
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 pokemon-image-bg rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <img 
                      v-if="pokemon.imageUrl || pokemon.spriteUrl" 
                      :src="pokemon.imageUrl || pokemon.spriteUrl" 
                      :alt="pokemon.name"
                      class="w-full h-full object-contain p-1"
                    />
                    <span v-else class="text-xs font-medium">
                      {{ getPokemonInitial(pokemon.displayName || pokemon.name) }}
                    </span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="truncate list-item-title">{{ pokemon.displayName || pokemon.name }}</p>
                    <p v-if="pokemon.cardCount" class="text-xs">
                      {{ pokemon.cardCount }} {{ pokemon.cardCount === 1 ? 'card' : 'cards' }}
                    </p>
                  </div>
                </div>
              </button>
            </div>
            <div v-if="trendingPokemon.length === 0 && !isLoadingPokemon" class="text-center py-4">
              <p class="text-xs">No Pokemon yet</p>
            </div>
          </div>

          <!-- Trending Types -->
          <div class="mb-6">
            <h6 class="section-label mb-3">By Type</h6>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="type in trendingTypes"
                :key="type"
                @click="handleTypeClick(type)"
                class="px-3 py-1.5 text-xs font-medium rounded-full sidebar-button transition-colors"
              >
                {{ type }}
              </button>
            </div>
            <div v-if="trendingTypes.length === 0 && !isLoadingPokemon" class="text-center py-4">
              <p class="text-xs">Loading types...</p>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto">
        <!-- Hero Banner -->
        <div class="relative bg-cover bg-center bg-no-repeat overflow-hidden" style="background-image: url('/pokabanner.png');">
          <div class="relative section-container py-6 sm:py-8 md:py-12">
            <div class="max-w-3xl">
              <img src="/pokapal_white.svg" alt="Pokapal" class="h-8 md:h-12 w-auto mb-4" />
              <p class="text-base md:text-lg text-white mb-6 max-w-xl md:max-w-2xl" style="text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);">
                Your collection companion for Pokémon TCG master sets. Track progress, compete with friends, and celebrate every card.
              </p>
              <div v-if="!user" class="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <router-link to="/login" class="btn btn-h4 btn-primary">
                  Create Account
                </router-link>
                <router-link to="/browse" class="btn btn-h4 btn-secondary">
                  Browse Cards
                </router-link>
              </div>
              <div v-else class="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <router-link to="/start" class="btn btn-h4 btn-primary">
                  Start Master Set
                </router-link>
                <router-link to="/profile" class="btn btn-h4 btn-secondary">
                  My Profile
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Featured Sets Grid -->
        <div class="section-container py-4 sm:py-6 md:py-8">
          <!-- Section Header -->
          <div class="section-header flex justify-between items-center">
            <div>
              <h2>Featured Sets</h2>
              <p class="section-subtitle">Discover sets to master</p>
            </div>
            <router-link to="/sets" class="btn btn-h5 btn-primary">
              View All
            </router-link>
          </div>

          <!-- Sets Grid -->
          <div v-if="isLoadingSets" class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            <div v-for="i in 8" :key="i" class="card animate-pulse">
              <div class="aspect-square bg-gray-200 rounded-t-lg"></div>
              <div class="card-body p-2 sm:p-4">
                <div class="h-4 bg-gray-200 rounded mb-2"></div>
                <div class="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>

          <div v-else-if="displaySets.length > 0" class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            <div
              v-for="set in displaySets"
              :key="set.id"
              class="card hover:shadow-lg transition-all cursor-pointer group"
              @click="handleSetClick(set)"
            >
              <!-- Set Image Placeholder -->
              <div class="aspect-square pokemon-image-bg rounded-t-lg flex items-center justify-center overflow-hidden">
                <div v-if="set.logo" class="w-full h-full flex items-center justify-center">
                  <img :src="set.logo" :alt="set.name" class="max-w-full max-h-full object-contain" />
                </div>
                <div v-else class="text-6xl font-bold" style="color: var(--color-text-tertiary);">
                  {{ set.code?.substring(0, 2).toUpperCase() || '?' }}
                </div>
              </div>
              
              <div class="card-body p-2 sm:p-4">
                <h3 class="card-title mb-1 text-sm sm:text-base">{{ set.name }}</h3>
                <p class="text-xs mb-2" style="color: var(--color-text-tertiary);">{{ set.series }}</p>
                <div class="flex justify-between items-center text-xs sm:text-sm">
                  <span style="color: var(--color-text-secondary);">{{ set.totalCards || 0 }} cards</span>
                  <span v-if="set.releaseDate" style="color: var(--color-text-tertiary);">
                    {{ formatDate(set.releaseDate) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <p style="color: var(--color-text-secondary);">No sets available</p>
            <p class="text-sm mt-2" style="color: var(--color-text-tertiary);">Sets will appear here once they've been added to the database.</p>
          </div>
        </div>

        <!-- Featured Pokemon -->
        <div class="section-container py-4 sm:py-6 md:py-8" style="border-top: 1px solid var(--color-border);">
          <!-- Section Header -->
          <div class="section-header flex justify-between items-center">
            <div>
              <h2>Featured Pokemon</h2>
              <p class="section-subtitle">Discover Pokemon to collect</p>
            </div>
            <router-link to="/browse" class="btn btn-h5 btn-primary">
              View All
            </router-link>
          </div>

          <!-- Pokemon Grid -->
          <div v-if="isLoadingPokemon" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            <div v-for="i in 10" :key="i" class="card animate-pulse">
              <div class="aspect-square bg-gray-200 rounded-t-lg"></div>
              <div class="card-body p-2 sm:p-3">
                <div class="h-3 bg-gray-200 rounded mb-1"></div>
                <div class="h-2 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>

          <div v-else-if="featuredPokemon.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            <div
              v-for="pokemon in featuredPokemon"
              :key="pokemon.name + (pokemon.nationalDexNumber || '')"
              class="card hover:shadow-lg transition-all cursor-pointer group"
              @click="handlePokemonClick(pokemon)"
            >
              <!-- Pokemon Image -->
              <div class="aspect-square pokemon-image-bg rounded-t-lg flex items-center justify-center overflow-hidden p-2">
                <img 
                  v-if="pokemon.imageUrl || pokemon.spriteUrl" 
                  :src="pokemon.imageUrl || pokemon.spriteUrl" 
                  :alt="pokemon.name" 
                  class="w-full h-full object-contain"
                  @error="handleImageError"
                />
                <div v-else class="text-4xl font-bold" style="color: var(--color-text-tertiary);">
                  {{ getPokemonInitial(pokemon.name) }}
                </div>
              </div>
              
              <div class="card-body p-2 sm:p-3">
                <h6 class="mb-1 truncate text-xs sm:text-sm">
                  {{ pokemon.displayName || pokemon.name }}
                </h6>
                <div class="flex items-center gap-1 flex-wrap">
                  <span 
                    v-for="type in pokemon.types?.slice(0, 2)" 
                    :key="type"
                    class="text-xs px-1 py-0.5 rounded"
                    style="background-color: var(--color-bg-tertiary); color: var(--color-text-primary);"
                  >
                    {{ type }}
                  </span>
                  <span v-if="pokemon.cardCount > 1" class="text-xs" style="color: var(--color-text-tertiary);">
                    {{ pokemon.cardCount }} cards
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <p style="color: var(--color-text-secondary);">No Pokemon cards have been loaded yet.</p>
            <p class="text-sm mt-2" style="color: var(--color-text-tertiary);">Cards will appear here once they've been added to the database.</p>
          </div>
        </div>

        <!-- Trending Collections (if user has collections) -->
        <div v-if="user && userCollections.length > 0" class="section-container py-8" style="border-top: 1px solid var(--color-border);">
          <div class="mb-6">
            <h2>Your Collections</h2>
            <p class="text-sm mt-1" style="color: var(--color-text-secondary);">Continue your master sets</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <router-link
              v-for="collection in userCollections.slice(0, 6)"
              :key="collection.id"
              :to="collection.challengeId ? `/challenge/${collection.challengeId}` : `/profile`"
              class="card hover:shadow-lg transition-all cursor-pointer"
            >
              <div class="card-body">
                <h3 class="card-title mb-2">{{ collection.name }}</h3>
                <p class="text-sm mb-3">{{ collection.targetSetName || 'Custom Collection' }}</p>
                <div class="mb-2">
                  <div class="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{{ collection.progress || 0 }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-gray-900 h-2 rounded-full transition-all"
                      :style="{ width: `${collection.progress || 0}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../composables/useAuth'
import { getAllSets } from '../utils/firebasePokemon'

const router = useRouter()
const { user } = useAuth()

const sets = ref([])
const isLoadingSets = ref(false)
const userCollections = ref([])
const featuredPokemon = ref([])
const isLoadingPokemon = ref(false)
const trendingSets = ref([])
const trendingPokemon = ref([])
const trendingTypes = ref([])

const displaySets = computed(() => {
  // Show featured sets (first 10)
  return sets.value.slice(0, 10)
})

const handleTypeClick = (type) => {
  router.push(`/browse?type=${encodeURIComponent(type)}`)
}

const handleSetClick = (set) => {
  // Navigate to set detail page
  router.push(`/set/${set.id}`)
}

const handlePokemonClick = (pokemon) => {
  // Navigate to Pokemon detail page using pokemonList document ID
  if (pokemon.id) {
    router.push(`/pokemon/${pokemon.id}`)
  } else {
    // Fallback: try to find by name or navigate to browse
    const searchName = pokemon.displayName || pokemon.name
    router.push(`/browse?name=${encodeURIComponent(searchName)}`)
  }
}

const getPokemonInitial = (name) => {
  return name?.charAt(0).toUpperCase() || '?'
}

const handleImageError = (event) => {
  // Hide broken image and show placeholder
  event.target.style.display = 'none'
  const parent = event.target.parentElement
  if (parent && !parent.querySelector('.placeholder')) {
    const placeholder = document.createElement('div')
    placeholder.className = 'placeholder text-4xl font-bold text-gray-400'
    placeholder.textContent = getPokemonInitial(event.target.alt)
    parent.appendChild(placeholder)
  }
}

// Normalize Pokemon name to extract base name (removes variations like "Mega", "EX", "GX", etc.)
const normalizePokemonName = (name) => {
  if (!name) return ''
  
  // Remove common variation suffixes/prefixes
  const variations = [
    /^Mega\s+/i,
    /\s+EX$/i,
    /\s+GX$/i,
    /\s+V$/i,
    /\s+VMAX$/i,
    /\s+VSTAR$/i,
    /\s+Prime$/i,
    /\s+LV\.?\s*X$/i,
    /\s+LV\.?\s*\d+$/i,
    /\s+Break$/i,
    /\s+Tag Team$/i,
    /\s+&.*$/i, // Remove "& Partner" or similar
    /\s+\(.*\)$/i, // Remove parenthetical text like "(Full Art)"
  ]
  
  let normalized = name
  variations.forEach(pattern => {
    normalized = normalized.replace(pattern, '')
  })
  
  // Trim whitespace
  normalized = normalized.trim()
  
  return normalized || name // Fallback to original if empty
}

const formatDate = (date) => {
  if (!date) return ''
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.getFullYear()
}

const loadSets = async () => {
  isLoadingSets.value = true
  try {
    const result = await getAllSets()
    if (result.success) {
      sets.value = result.data || []
      // Set trending sets (popular classic sets)
      const popularSetNames = ['Base Set', 'Jungle', 'Fossil', 'Base Set 2', 'Team Rocket', 'Gym Heroes', 'Gym Challenge']
      trendingSets.value = sets.value
        .filter(set => popularSetNames.includes(set.name))
        .slice(0, 6)
        .sort((a, b) => {
          // Sort by release date (newest first) or by name
          const dateA = a.releaseDate?.toDate ? a.releaseDate.toDate() : new Date(a.releaseDate || 0)
          const dateB = b.releaseDate?.toDate ? b.releaseDate.toDate() : new Date(b.releaseDate || 0)
          return dateB - dateA
        })
    }
  } catch (error) {
    console.error('Error loading sets:', error)
  } finally {
    isLoadingSets.value = false
  }
}

const loadFeaturedPokemon = async () => {
  isLoadingPokemon.value = true
  try {
    // Query pokemonList collection directly
    const pokemonListRef = collection(db, 'pokemonList')
    
    // Try to order by nationalDexNumber, fallback to name if index doesn't exist
    let q
    try {
      q = query(pokemonListRef, orderBy('nationalDexNumber', 'asc'))
    } catch (e) {
      // If ordering fails (no index), just get all without ordering
      q = query(pokemonListRef)
    }
    
    const snapshot = await getDocs(q)
    const allPokemon = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    console.log(`Loaded ${allPokemon.length} Pokemon from pokemonList collection`)
    
    // Sort by nationalDexNumber if available, otherwise alphabetically
    allPokemon.sort((a, b) => {
      if (a.nationalDexNumber && b.nationalDexNumber) {
        return a.nationalDexNumber - b.nationalDexNumber
      }
      if (a.nationalDexNumber) return -1
      if (b.nationalDexNumber) return 1
      return (a.displayName || a.name).localeCompare(b.displayName || a.name)
    })

    // Take first 10 Pokemon for featured section
    featuredPokemon.value = allPokemon.slice(0, 10)
    
    // Set trending Pokemon (popular/iconic Pokemon with most cards)
    trendingPokemon.value = allPokemon
      .filter(p => p.cardCount > 0) // Only show Pokemon that have cards
      .sort((a, b) => {
        // Sort by card count (most cards first), then by dex number
        if (b.cardCount !== a.cardCount) {
          return b.cardCount - a.cardCount
        }
        if (a.nationalDexNumber && b.nationalDexNumber) {
          return a.nationalDexNumber - b.nationalDexNumber
        }
        return 0
      })
      .slice(0, 6) // Top 6 most popular
    
    // Set trending types (most common Pokemon types)
    const typeCounts = new Map()
    allPokemon.forEach(p => {
      if (p.types && Array.isArray(p.types)) {
        p.types.forEach(type => {
          typeCounts.set(type, (typeCounts.get(type) || 0) + 1)
        })
      }
    })
    trendingTypes.value = Array.from(typeCounts.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by count
      .slice(0, 8) // Top 8 types
      .map(([type]) => type) // Extract just the type names
  } catch (error) {
    console.error('Error loading featured Pokemon:', error)
  } finally {
    isLoadingPokemon.value = false
  }
}

const loadUserCollections = async () => {
  if (!user.value) return
  
  try {
    // Use assignments instead of old collections structure
    const assignmentsRef = collection(db, 'assignments')
    const q = query(
      assignmentsRef,
      where('userId', '==', user.value.uid),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    
    userCollections.value = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = { id: docSnap.id, ...docSnap.data() }
        
        // Calculate progress from collectorList
        const collectorListRef = collection(db, 'collectorList')
        const collectorListQuery = query(
          collectorListRef,
          where('userId', '==', user.value.uid),
          where('assignmentId', '==', docSnap.id)
        )
        const collectorListSnapshot = await getDocs(collectorListQuery)
        
        // Get total cards for this assignment
        let totalCards = 0
        if (data.type === 'set' && data.setId) {
          const setRef = doc(db, 'sets', data.setId)
          const setDoc = await getDoc(setRef)
          if (setDoc.exists()) {
            totalCards = setDoc.data().totalCards || 0
          }
        } else if (data.type === 'pokemon' && data.pokemonId) {
          const pokemonListRef = doc(db, 'pokemonList', data.pokemonId)
          const pokemonListDoc = await getDoc(pokemonListRef)
          if (pokemonListDoc.exists()) {
            const cardIds = pokemonListDoc.data().cardIds || []
            totalCards = cardIds.length
          }
        }
        
        const checkedCards = collectorListSnapshot.docs.filter(d => d.data().checkedOff).length
        data.progress = totalCards > 0 ? Math.round((checkedCards / totalCards) * 100) : 0
        
        return data
      })
    )
  } catch (error) {
    console.error('Error loading user collections:', error)
  }
}

onMounted(() => {
  loadSets()
  loadFeaturedPokemon()
  if (user.value) {
    loadUserCollections()
  }
})
</script>

