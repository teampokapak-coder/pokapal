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
              <PokemonListItem
                v-for="pokemon in trendingPokemon"
                :key="pokemon.id || pokemon.name"
                :pokemon="pokemon"
                mode="list"
                @click="handlePokemonClick"
              />
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
          <div class="relative section-container py-6 sm:py-8 md:py-12 min-h-[280px] sm:min-h-[320px] md:min-h-[400px] flex flex-col">
            <div class="max-w-3xl flex-1 flex flex-col">
              <div class="flex-shrink-0">
                <img src="/pokapal_white.svg" alt="Pokapal" class="h-8 md:h-12 w-auto mb-4" />
              </div>
              <div class="mt-auto">
                <p class="hero-subtitle mb-4 sm:mb-5 md:mb-6 max-w-[400px] leading-tight sm:leading-normal">
                  <span class="font-bold">Your collection companion for Pokémon TCG master sets.</span> Track progress, compete with friends, and celebrate every card.
                </p>
                <div class="flex flex-row gap-2 sm:gap-4">
                  <div v-if="!user" class="flex flex-row gap-2 sm:gap-4 w-full">
                    <router-link to="/login" class="btn btn-h4 btn-primary flex-1 sm:flex-none">
                      Create Account
                    </router-link>
                    <router-link to="/browse" class="btn btn-h4 btn-secondary flex-1 sm:flex-none">
                      Browse Cards
                    </router-link>
                  </div>
                  <div v-else class="flex flex-row gap-2 sm:gap-4 w-full">
                    <router-link to="/start" class="btn btn-h4 btn-primary flex-1 sm:flex-none">
                      Start Master Set
                    </router-link>
                    <router-link to="/profile" class="btn btn-h4 btn-secondary flex-1 sm:flex-none">
                      My Profile
                    </router-link>
                  </div>
                </div>
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
            <div v-for="i in 10" :key="i" class="card animate-pulse">
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
                <div v-if="getSetLogoUrl(set)" class="w-full h-full flex items-center justify-center">
                  <img :src="getSetLogoUrl(set)" :alt="formatSetDisplayName(set)" class="max-w-full max-h-full object-contain" />
                </div>
                <div v-else class="text-6xl font-bold flex items-center justify-center w-full h-full" style="color: var(--color-text-tertiary); background: linear-gradient(135deg, var(--color-bg-tertiary), var(--color-bg-secondary));">
                  {{ getSetIdInitials(set.apiId || set.code || set.id) }}
                </div>
              </div>
              
              <div class="card-body p-2 sm:p-4">
                <h3 class="card-title mb-1 text-sm sm:text-base">{{ formatSetDisplayName(set) }}</h3>
                <p class="text-xs mb-2" style="color: var(--color-text-tertiary);">{{ formatSeriesDisplayName(set) }}</p>
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

        <!-- Trending Pokemon -->
        <div class="section-container py-4 sm:py-6 md:py-8" style="border-top: 1px solid var(--color-border);">
          <!-- Section Header -->
          <div class="section-header flex justify-between items-center">
            <div>
              <h2>Trending Pokemon</h2>
              <p class="section-subtitle">Popular Pokemon to collect</p>
            </div>
            <router-link to="/browse-pokemon" class="btn btn-h5 btn-primary">
              View All
            </router-link>
          </div>

          <!-- Pokemon Grid -->
          <div v-if="isLoadingPokemon" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 sm:gap-2 md:gap-3">
            <div v-for="i in 12" :key="i" class="card animate-pulse">
              <div class="aspect-square bg-gray-200 rounded-t-lg"></div>
              <div class="card-body p-1.5 sm:p-2">
                <div class="h-3 bg-gray-200 rounded mb-1"></div>
                <div class="h-2 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>

          <div v-else-if="trendingPokemon.length > 0" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 sm:gap-2 md:gap-3">
            <PokemonListItem
              v-for="pokemon in displayPokemon"
              :key="pokemon.name + (pokemon.nationalDexNumber || '')"
              :pokemon="pokemon"
              mode="card"
              @click="handlePokemonClick"
            />
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <p style="color: var(--color-text-secondary);">No Pokemon cards have been loaded yet.</p>
            <p class="text-sm mt-2" style="color: var(--color-text-tertiary);">Cards will appear here once they've been added to the database.</p>
          </div>
        </div>

        <!-- Trending Cards -->
        <div class="section-container py-4 sm:py-6 md:py-8" style="border-top: 1px solid var(--color-border);">
          <!-- Section Header -->
          <div class="section-header flex justify-between items-center">
            <div>
              <h2>Trending Cards</h2>
              <p class="section-subtitle">Explore popular Pokemon cards</p>
            </div>
            <router-link to="/browse" class="btn btn-h5 btn-primary">
              View All
            </router-link>
          </div>

          <!-- Cards Grid -->
          <div v-if="isLoadingCards" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            <div v-for="i in 10" :key="i" class="card animate-pulse">
              <div class="aspect-square bg-gray-200 rounded-t-lg"></div>
              <div class="card-body p-2 sm:p-3">
                <div class="h-3 bg-gray-200 rounded mb-1"></div>
                <div class="h-2 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>

          <div v-else-if="trendingCards.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            <PokemonCard
              v-for="card in displayCards"
              :key="card.id"
              :card="card"
              :is-collected="collectedCards.has(card.id)"
              :show-collection-icon="true"
              :show-types="true"
              icon-size="w-8 h-8"
              @click="selectCard"
              @toggle-collected="(card) => toggleCollected(card.id)"
            />
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <p style="color: var(--color-text-secondary);">No cards have been loaded yet.</p>
            <p class="text-sm mt-2" style="color: var(--color-text-tertiary);">Cards will appear here once they've been added to the database.</p>
          </div>
        </div>

      </main>
    </div>

    <!-- Card Detail Modal -->
    <CardModal
      :card="selectedCard"
      :is-collected="selectedCard ? collectedCards.has(selectedCard.id) : false"
      @close="selectedCard = null"
      @toggle-collected="selectedCard ? toggleCollected(selectedCard.id) : null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../config/firebase'
import { useAuth } from '../composables/useAuth'
import { getAllSets, getAllPokemonCards, getAllPokemon } from '../utils/firebasePokemon'
import { getCollectedCardIds, toggleCardCollected } from '../utils/userCards'
import PokemonCard from '../components/PokemonCard.vue'
import CardModal from '../components/CardModal.vue'
import { groupPokemonByBase } from '../utils/pokemonGrouping'
import PokemonListItem from '../components/PokemonListItem.vue'
import { getSetLogoUrl, formatSetDisplayName, formatSeriesDisplayName } from '../utils/setDisplayHelper'
import { getSetIdInitials } from '../utils/cardImageFallback'

const router = useRouter()
const { user } = useAuth()

const sets = ref([])
const isLoadingSets = ref(false)
const featuredPokemon = ref([])
const isLoadingPokemon = ref(false)
const trendingSets = ref([])
const trendingPokemon = ref([])
const trendingTypes = ref([])
const trendingCards = ref([])
const isLoadingCards = ref(false)
const selectedCard = ref(null)
const collectedCards = ref(new Set())
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 768)

// Update window width on resize
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

// Window resize handler setup
onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize)
  }
  loadSets()
  loadFeaturedPokemon()
  loadTrendingCards()
  if (user.value) {
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
  }
})

const displaySets = computed(() => {
  // Show 4 on mobile, 10 on desktop
  const isMobile = windowWidth.value < 768 // md breakpoint
  return sets.value.slice(0, isMobile ? 4 : 10)
})

const displayPokemon = computed(() => {
  // Show 6 on mobile (3x2 grid), 12 on desktop (6x2 grid)
  const isMobile = windowWidth.value < 768 // md breakpoint
  return trendingPokemon.value.slice(0, isMobile ? 6 : 12)
})

const displayCards = computed(() => {
  // Show 4 on mobile, 10 on desktop
  const isMobile = windowWidth.value < 768 // md breakpoint
  return trendingCards.value.slice(0, isMobile ? 4 : 10)
})

const handleTypeClick = (type) => {
  router.push(`/browse?type=${encodeURIComponent(type)}`)
}

const handleSetClick = (set) => {
  // Navigate to set detail page
  router.push(`/set/${set.id}`)
}

const handlePokemonClick = (pokemon) => {
  // Navigate to Pokemon detail page using nationalDexNumber (preferred)
  if (pokemon.nationalDexNumber) {
    router.push(`/pokemon/${pokemon.nationalDexNumber}`)
  } else if (pokemon.id) {
    // Fallback: use document ID if no nationalDexNumber
    router.push(`/pokemon/${pokemon.id}`)
  } else {
    // Last resort: try to find by name or navigate to browse
    const searchName = pokemon.displayName || pokemon.name
    router.push(`/browse?name=${encodeURIComponent(searchName)}`)
  }
}

const selectCard = (card) => {
  selectedCard.value = card
}

const toggleCollected = async (cardId) => {
  if (!user.value) {
    alert('Please log in to mark cards as collected')
    return
  }
  
  try {
    const result = await toggleCardCollected(user.value.uid, cardId)
    if (result.success) {
      if (result.isCollected) {
        collectedCards.value.add(cardId)
      } else {
        collectedCards.value.delete(cardId)
      }
    } else {
      alert('Error: ' + result.error)
    }
  } catch (error) {
    console.error('Error toggling collected status:', error)
    alert('Error updating collection status')
  }
}

const loadCollectedCards = async () => {
  if (!user.value || trendingCards.value.length === 0) return
  
  try {
    // Load collected status for all trending cards (up to 10)
    const cardIds = trendingCards.value.slice(0, 10).map(card => card.id)
    const collectedSet = await getCollectedCardIds(user.value.uid, cardIds)
    collectedCards.value = collectedSet
  } catch (error) {
    console.error('Error loading collected cards:', error)
  }
}

const loadTrendingCards = async () => {
  isLoadingCards.value = true
  try {
    // Load a sample of cards (limit to 50 for performance)
    const result = await getAllPokemonCards({ limit: 50 })
    if (result.success) {
      // Sort by rarity or popularity (you can adjust this logic)
      const sorted = result.data.sort((a, b) => {
        // Prioritize rare cards
        const rarityOrder = {
          'Ultra Rare': 5,
          'Rare Holo EX': 4,
          'Rare Holo': 3,
          'Rare': 2,
          'Uncommon': 1,
          'Common': 0
        }
        const aRarity = rarityOrder[a.rarity] || 0
        const bRarity = rarityOrder[b.rarity] || 0
        if (bRarity !== aRarity) {
          return bRarity - aRarity
        }
        // Then by name
        return (a.name || '').localeCompare(b.name || '')
      })
      trendingCards.value = sorted
      
      // Load collected cards after cards are loaded
      if (user.value) {
        await loadCollectedCards()
      }
    } else {
      console.error('Failed to load cards:', result.error)
    }
  } catch (error) {
    console.error('Error loading trending cards:', error)
  } finally {
    isLoadingCards.value = false
  }
}



const formatDate = (date) => {
  if (!date) return ''
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.getFullYear()
}

const loadSets = async () => {
  isLoadingSets.value = true
  try {
    // Load only English sets for featured sets (classic English sets)
    const result = await getAllSets({ language: 'en' })
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
    // Query pokemon collection
    const result = await getAllPokemon()
    if (!result.success) {
      console.error('Failed to load Pokemon:', result.error)
      return
    }
    
    const allPokemonRaw = result.data || []
    console.log(`Loaded ${allPokemonRaw.length} Pokemon from pokemon collection`)
    
    // Use the grouping utility to get only base Pokemon (no variations like "Erika's Pikachu")
    const allPokemon = groupPokemonByBase(allPokemonRaw)

    // Shuffle Pokemon array randomly for trending section (lightweight)
    const shuffledPokemon = [...allPokemon].sort(() => Math.random() - 0.5)
    
    // Take first 6 Pokemon for featured section (random)
    featuredPokemon.value = shuffledPokemon.slice(0, 6)
    
    // Set trending Pokemon (random 12 Pokemon)
    trendingPokemon.value = shuffledPokemon.slice(0, 12)
    
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


// Watch for user changes to reload collected cards
watch(() => user.value?.uid, async (newUid) => {
  if (newUid && trendingCards.value.length > 0) {
    await loadCollectedCards()
  } else {
    collectedCards.value.clear()
  }
})

</script>

