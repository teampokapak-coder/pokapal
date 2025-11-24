<template>
  <div class="min-h-screen" style="background-color: var(--color-bg-primary);">
    <section class="section section-spacing-md">
      <div class="section-container">
        <!-- Loading State -->
        <div v-if="isLoading" class="w-full">
          <LoadingSpinner />
        </div>

        <!-- Set Not Found -->
        <div v-else-if="!set" class="text-center py-12">
          <h2 class="mb-4">Set Not Found</h2>
          <p class="text-gray-600 mb-6">The set you're looking for doesn't exist.</p>
          <router-link to="/" class="btn btn-h4 btn-primary">Go Home</router-link>
        </div>

        <!-- Set Detail -->
        <div v-else>
          <!-- Header -->
          <div class="mb-6 md:mb-8">
            <router-link 
              to="/" 
              class="text-sm mb-4 inline-block transition-colors"
              style="color: var(--color-text-secondary);"
              @mouseenter="$event.target.style.color = 'var(--color-text-primary)'"
              @mouseleave="$event.target.style.color = 'var(--color-text-secondary)'"
            >
              ← Back to Home
            </router-link>
            
            <!-- Mobile Layout: Side by Side -->
            <div class="md:hidden">
              <div class="flex items-start gap-4 mb-4">
                <!-- Set Logo/Image -->
                <div class="w-24 h-24 flex-shrink-0 pokemon-image-bg rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    v-if="set.logo" 
                    :src="set.logo" 
                    :alt="set.name"
                    class="w-full h-full object-contain p-2"
                  />
                  <div v-else class="text-center">
                    <div class="text-2xl font-bold mb-0.5" style="color: var(--color-text-tertiary);">
                      {{ set.code?.substring(0, 2).toUpperCase() || '?' }}
                    </div>
                    <div class="text-[10px]" style="color: var(--color-text-tertiary);">{{ set.code }}</div>
                  </div>
                </div>

                <!-- Set Name and Series -->
                <div class="flex-1 min-w-0">
                  <h1 class="text-xl mb-1 leading-tight">{{ set.name }}</h1>
                  <div v-if="set.series">
                    <span class="text-xs" style="color: var(--color-text-secondary);">{{ set.series }}</span>
                  </div>
                </div>
              </div>

              <!-- Stats - All in one row below image/name -->
              <div class="grid grid-cols-3 gap-1.5">
                <div class="card">
                  <div class="card-body p-2">
                    <p class="text-[9px] uppercase tracking-wide mb-0.5" style="color: var(--color-text-tertiary);">Cards</p>
                    <p class="text-base font-bold leading-tight" style="color: var(--color-text-primary);">{{ set.totalCards || cards.length }}</p>
                  </div>
                </div>
                <div v-if="set.releaseDate" class="card">
                  <div class="card-body p-2">
                    <p class="text-[9px] uppercase tracking-wide mb-0.5" style="color: var(--color-text-tertiary);">Release</p>
                    <p class="text-xs font-bold leading-tight" style="color: var(--color-text-primary);">{{ formatDate(set.releaseDate) }}</p>
                  </div>
                </div>
                <div v-else-if="set.releaseYear" class="card">
                  <div class="card-body p-2">
                    <p class="text-[9px] uppercase tracking-wide mb-0.5" style="color: var(--color-text-tertiary);">Year</p>
                    <p class="text-base font-bold leading-tight" style="color: var(--color-text-primary);">{{ set.releaseYear }}</p>
                  </div>
                </div>
                <div v-if="set.code" class="card">
                  <div class="card-body p-2">
                    <p class="text-[9px] uppercase tracking-wide mb-0.5" style="color: var(--color-text-tertiary);">Code</p>
                    <p class="text-xs font-bold leading-tight" style="color: var(--color-text-primary);">{{ set.code }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Desktop Layout: Side by Side -->
            <div class="hidden md:flex items-start gap-6">
              <!-- Set Logo/Image -->
              <div class="w-48 h-48 pokemon-image-bg rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                <img 
                  v-if="set.logo" 
                  :src="set.logo" 
                  :alt="set.name"
                  class="w-full h-full object-contain p-4"
                />
                <div v-else class="text-center">
                  <div class="text-4xl font-bold mb-2" style="color: var(--color-text-tertiary);">
                    {{ set.code?.substring(0, 2).toUpperCase() || '?' }}
                  </div>
                  <div class="text-sm" style="color: var(--color-text-tertiary);">{{ set.code }}</div>
                </div>
              </div>

              <!-- Set Info -->
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h1>{{ set.name }}</h1>
                </div>

                <div v-if="set.series" class="mb-4">
                  <span class="text-sm" style="color: var(--color-text-secondary);">{{ set.series }}</span>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  <div class="card">
                    <div class="card-body p-4">
                      <p class="text-xs uppercase tracking-wide mb-1" style="color: var(--color-text-tertiary);">Total Cards</p>
                      <p class="text-2xl font-bold" style="color: var(--color-text-primary);">{{ set.totalCards || cards.length }}</p>
                    </div>
                  </div>
                  <div v-if="set.releaseDate" class="card">
                    <div class="card-body p-4">
                      <p class="text-xs uppercase tracking-wide mb-1" style="color: var(--color-text-tertiary);">Release Date</p>
                      <p class="text-lg font-bold" style="color: var(--color-text-primary);">{{ formatDate(set.releaseDate) }}</p>
                    </div>
                  </div>
                  <div v-if="set.releaseYear" class="card">
                    <div class="card-body p-4">
                      <p class="text-xs uppercase tracking-wide mb-1" style="color: var(--color-text-tertiary);">Year</p>
                      <p class="text-lg font-bold" style="color: var(--color-text-primary);">{{ set.releaseYear }}</p>
                    </div>
                  </div>
                  <div v-if="set.code" class="card">
                    <div class="card-body p-4">
                      <p class="text-xs uppercase tracking-wide mb-1" style="color: var(--color-text-tertiary);">Set Code</p>
                      <p class="text-lg font-bold" style="color: var(--color-text-primary);">{{ set.code }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Cards Section -->
          <div class="mt-8">
            <div class="flex justify-between items-center mb-6">
              <h2>All Cards</h2>
              <div class="text-sm text-gray-600">
                {{ filteredCards.length }} {{ filteredCards.length === 1 ? 'card' : 'cards' }}
              </div>
            </div>

            <!-- Filters -->
            <div class="mb-4 md:mb-6 flex flex-wrap gap-2 md:gap-4">
              <select
                v-model="filterType"
                class="filter-input flex-1 md:flex-none min-w-[calc(50%-0.25rem)] md:min-w-0"
              >
                <option value="">All Types</option>
                <option v-for="type in uniqueTypes" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
              <select
                v-model="filterRarity"
                class="filter-input flex-1 md:flex-none min-w-[calc(50%-0.25rem)] md:min-w-0"
              >
                <option value="">All Rarities</option>
                <option v-for="rarity in uniqueRarities" :key="rarity" :value="rarity">
                  {{ rarity }}
                </option>
              </select>
              <select
                v-model="filterCardType"
                class="filter-input flex-1 md:flex-none min-w-[calc(50%-0.25rem)] md:min-w-0"
              >
                <option value="">All Card Types</option>
                <option value="Pokemon">Pokemon</option>
                <option value="Trainer">Trainer</option>
                <option value="Energy">Energy</option>
              </select>
            </div>

            <!-- Cards Grid -->
            <div v-if="isLoadingCards" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              <div v-for="i in 12" :key="i" class="card animate-pulse">
                <div class="aspect-square bg-gray-200 rounded-t-lg"></div>
                <div class="card-body p-3">
                  <div class="h-3 bg-gray-200 rounded mb-1"></div>
                  <div class="h-2 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>

            <div v-else-if="filteredCards.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              <PokemonCard
                v-for="card in filteredCards"
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
              <p class="text-gray-600">No cards found for this set.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Card Detail Modal -->
    <CardModal
      :card="selectedCard"
      :is-collected="selectedCard ? collectedCards.has(selectedCard.id) : false"
      @close="selectedCard = null"
      @toggle-collected="(card) => toggleCollected(card.id)"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { doc, getDoc, Timestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { getAllPokemonCards } from '../utils/firebasePokemon'
import { useAuth } from '../composables/useAuth'
import { toggleCardCollected, getCollectedCardIds } from '../utils/userCards'
import PokemonCard from '../components/PokemonCard.vue'
import CardModal from '../components/CardModal.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const route = useRoute()
const { user } = useAuth()
const setId = route.params.setId

const set = ref(null)
const cards = ref([])
const isLoading = ref(true)
const isLoadingCards = ref(false)
const selectedCard = ref(null)
const filterType = ref('')
const filterRarity = ref('')
const filterCardType = ref('')
const collectedCards = ref(new Set())

// Poké Ball icon paths (static assets from public folder)
const pokeballIconPath = '/pokeball.svg'

const formatDate = (date) => {
  if (!date) return 'N/A'
  if (date instanceof Timestamp) {
    return date.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }
  if (date instanceof Date) {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }
  return date
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
  if (!user.value || cards.value.length === 0) return
  
  try {
    const cardIds = cards.value.map(card => card.id)
    const collectedSet = await getCollectedCardIds(user.value.uid, cardIds)
    collectedCards.value = collectedSet
  } catch (error) {
    console.error('Error loading collected cards:', error)
  }
}

const uniqueTypes = computed(() => {
  const types = new Set()
  cards.value.forEach(card => {
    if (card.types && Array.isArray(card.types)) {
      card.types.forEach(type => types.add(type))
    }
  })
  return Array.from(types).sort()
})

const uniqueRarities = computed(() => {
  const rarities = new Set()
  cards.value.forEach(card => {
    if (card.rarity) rarities.add(card.rarity)
  })
  return Array.from(rarities).sort()
})

const filteredCards = computed(() => {
  let filtered = cards.value

  if (filterType.value) {
    filtered = filtered.filter(card =>
      card.types && card.types.includes(filterType.value)
    )
  }

  if (filterRarity.value) {
    filtered = filtered.filter(card => card.rarity === filterRarity.value)
  }

  if (filterCardType.value) {
    filtered = filtered.filter(card => card.cardType === filterCardType.value || card.supertype === filterCardType.value)
  }

  // Sort by set number if available
  filtered.sort((a, b) => {
    if (a.setNumber && b.setNumber) {
      const numA = parseInt(a.setNumber.split('/')[0]) || 0
      const numB = parseInt(b.setNumber.split('/')[0]) || 0
      return numA - numB
    }
    return 0
  })

  return filtered
})

const loadSet = async () => {
  isLoading.value = true
  try {
    const setDoc = doc(db, 'sets', setId)
    const setSnap = await getDoc(setDoc)
    
    if (setSnap.exists()) {
      set.value = {
        id: setSnap.id,
        ...setSnap.data()
      }
      
      // Load cards for this set
      await loadCards()
    } else {
      set.value = null
    }
  } catch (error) {
    console.error('Error loading set:', error)
    set.value = null
  } finally {
    isLoading.value = false
  }
}

const loadCards = async () => {
  if (!set.value) return
  
  isLoadingCards.value = true
  try {
    // Get all cards and filter by this set
    const result = await getAllPokemonCards({})
    if (!result.success) {
      console.error('Failed to load cards:', result.error)
      return
    }

    const allCards = result.data || []
    
    // Filter cards that belong to this set
    // Match by setId (Firestore document ID) or set name
    cards.value = allCards.filter(card => {
      return card.setId === set.value.id || 
             card.set === set.value.name ||
             card.setCode === set.value.code ||
             card.apiSetId === set.value.apiId
    })
    
    console.log(`Found ${cards.value.length} cards for set ${set.value.name}`)
    
    // Load collected cards
    await loadCollectedCards()
  } catch (error) {
    console.error('Error loading cards:', error)
  } finally {
    isLoadingCards.value = false
  }
}

onMounted(() => {
  loadSet()
})
</script>

