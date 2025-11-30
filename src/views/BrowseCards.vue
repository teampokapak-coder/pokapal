<template>
  <div class="min-h-screen" style="background-color: var(--color-bg-primary);">
    <section class="section section-spacing-md">
      <div class="section-container">
        <div class="section-header">
          <h2>Browse Cards</h2>
          <p class="section-subtitle">Search and explore Pokemon cards</p>
        </div>

        <!-- Mobile Filter Toggle Button -->
        <div class="mb-4 md:hidden">
          <button
            @click="showMobileFilters = !showMobileFilters"
            class="btn btn-h5 btn-primary w-full flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {{ showMobileFilters ? 'Hide Filters' : 'Show Filters' }}
            <span v-if="hasActiveFilters" class="ml-1 px-2 py-0.5 rounded-full text-xs" style="background-color: var(--color-accent); color: white;">
              {{ activeFilterCount }}
            </span>
          </button>
        </div>

        <!-- Mobile Filter Overlay -->
        <div 
          v-if="showMobileFilters"
          class="fixed inset-0 bg-black bg-opacity-50 z-[100] md:hidden"
          @click="showMobileFilters = false"
        ></div>

        <div class="flex flex-col md:flex-row gap-4 md:gap-6">
          <!-- Filters Sidebar -->
          <aside 
            :class="[
              'w-full md:w-64 flex-shrink-0 transition-all duration-300',
              showMobileFilters ? 'fixed top-0 left-0 h-full z-[101] overflow-y-auto md:relative md:z-auto md:h-auto' : 'hidden md:block'
            ]"
          >
            <div class="card md:sticky md:top-4 h-full md:h-auto" style="background-color: var(--color-bg-primary);">
              <div class="card-header flex items-center justify-between">
                <h3 class="card-title">Filters</h3>
                <button
                  @click="showMobileFilters = false"
                  class="md:hidden p-1 rounded transition-colors"
                  style="color: var(--color-text-secondary);"
                  @mouseenter="$event.target.style.backgroundColor = 'var(--color-bg-secondary)'"
                  @mouseleave="$event.target.style.backgroundColor = 'transparent'"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="card-body space-y-4">
                <!-- Search -->
                <div>
                  <label class="block text-sm font-medium mb-2" style="color: var(--color-text-primary);">
                    Search
                  </label>
                  <input
                    v-model="filters.search"
                    type="text"
                    placeholder="Card name..."
                    class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                    style="border-color: var(--color-border);"
                    @input="debouncedSearch"
                  />
                </div>

                <!-- Set Filter -->
                <div>
                  <label class="block text-sm font-medium mb-2" style="color: var(--color-text-primary);">
                    Set
                  </label>
                  <select
                    v-model="filters.set"
                    class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                    style="border-color: var(--color-border);"
                    @change="applyFilters"
                  >
                    <option value="">All Sets</option>
                    <option v-for="set in availableSets" :key="set.id" :value="set.name">
                      {{ set.name }}
                    </option>
                  </select>
                </div>

                <!-- Type Filter -->
                <div>
                  <label class="block text-sm font-medium mb-2" style="color: var(--color-text-primary);">
                    Type
                  </label>
                  <select
                    v-model="filters.type"
                    class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                    style="border-color: var(--color-border);"
                    @change="applyFilters"
                  >
                    <option value="">All Types</option>
                    <option value="Fire">Fire</option>
                    <option value="Water">Water</option>
                    <option value="Grass">Grass</option>
                    <option value="Electric">Electric</option>
                    <option value="Psychic">Psychic</option>
                    <option value="Fighting">Fighting</option>
                    <option value="Darkness">Darkness</option>
                    <option value="Metal">Metal</option>
                    <option value="Fairy">Fairy</option>
                    <option value="Dragon">Dragon</option>
                    <option value="Colorless">Colorless</option>
                  </select>
                </div>

                <!-- Rarity Filter -->
                <div>
                  <label class="block text-sm font-medium mb-2" style="color: var(--color-text-primary);">
                    Rarity
                  </label>
                  <select
                    v-model="filters.rarity"
                    class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                    style="border-color: var(--color-border);"
                    @change="applyFilters"
                  >
                    <option value="">All Rarities</option>
                    <option value="Common">Common</option>
                    <option value="Uncommon">Uncommon</option>
                    <option value="Rare">Rare</option>
                    <option value="Rare Holo">Rare Holo</option>
                    <option value="Rare Holo EX">Rare Holo EX</option>
                    <option value="Ultra Rare">Ultra Rare</option>
                  </select>
                </div>

                <!-- Card Type Filter -->
                <div>
                  <label class="block text-sm font-medium mb-2" style="color: var(--color-text-primary);">
                    Card Type
                  </label>
                  <select
                    v-model="filters.cardType"
                    class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                    style="border-color: var(--color-border);"
                    @change="applyFilters"
                  >
                    <option value="">All</option>
                    <option value="Pokemon">Pokemon</option>
                    <option value="Trainer">Trainer</option>
                    <option value="Energy">Energy</option>
                  </select>
                </div>

                <!-- Clear Filters -->
                <button
                  @click="clearFilters"
                  class="btn btn-h5 btn-ghost w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </aside>

          <!-- Cards Grid -->
          <main class="flex-1 min-w-0">
            <!-- Results Count -->
            <div class="mb-3 sm:mb-4">
              <p class="text-xs sm:text-sm" style="color: var(--color-text-secondary);">
                Showing {{ filteredCards.length }} of {{ cards.length }} cards
              </p>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="text-center py-12">
              <p style="color: var(--color-text-secondary);">Loading cards...</p>
            </div>

            <!-- Cards Grid -->
            <div v-else-if="filteredCards.length > 0" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-1.5 sm:gap-2 md:gap-3">
              <PokemonCard
                v-for="card in filteredCards"
                :key="card.id"
                :card="card"
                :is-collected="collectedCards.has(card.id)"
                :show-collection-icon="true"
                :show-types="true"
                :compact="true"
                icon-size="w-6 h-6 sm:w-8 sm:h-8"
                @click="selectCard"
                @toggle-collected="(card) => toggleCollected(card.id)"
              />
            </div>

            <!-- Empty State -->
            <div v-else class="card">
              <div class="card-body text-center py-12">
                <p>No cards found matching your filters.</p>
                <button
                  @click="clearFilters"
                  class="btn btn-h4 btn-primary mt-4"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>

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
import { ref, computed, onMounted, watch } from 'vue'
import { getAllPokemonCards } from '../utils/firebasePokemon'
import { getAllSets } from '../utils/firebasePokemon'
import { useAuth } from '../composables/useAuth'
import { getCollectedCardIds, toggleCardCollected } from '../utils/userCards'
import PokemonCard from '../components/PokemonCard.vue'
import CardModal from '../components/CardModal.vue'

const { user } = useAuth()
const cards = ref([])
const availableSets = ref([])
const isLoading = ref(false)
const selectedCard = ref(null)
const searchTimeout = ref(null)
const collectedCards = ref(new Set())

const showMobileFilters = ref(false)

const filters = ref({
  search: '',
  set: '',
  type: '',
  rarity: '',
  cardType: ''
})

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return !!(filters.value.search || filters.value.set || filters.value.type || filters.value.rarity || filters.value.cardType)
})

// Count active filters
const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.search) count++
  if (filters.value.set) count++
  if (filters.value.type) count++
  if (filters.value.rarity) count++
  if (filters.value.cardType) count++
  return count
})

const filteredCards = computed(() => {
  let filtered = cards.value

  // Search filter
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(card =>
      card.name?.toLowerCase().includes(search) ||
      card.localId?.toLowerCase().includes(search)
    )
  }

  // Set filter
  if (filters.value.set) {
    filtered = filtered.filter(card => card.set === filters.value.set)
  }

  // Type filter
  if (filters.value.type) {
    filtered = filtered.filter(card =>
      card.types && card.types.includes(filters.value.type)
    )
  }

  // Rarity filter
  if (filters.value.rarity) {
    filtered = filtered.filter(card =>
      card.rarity?.includes(filters.value.rarity)
    )
  }

  // Card type filter
  if (filters.value.cardType) {
    filtered = filtered.filter(card => card.category === filters.value.cardType)
  }

  return filtered
})

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

const debouncedSearch = () => {
  clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    applyFilters()
  }, 300)
}

const applyFilters = () => {
  // Filters are reactive, no action needed
}

const clearFilters = () => {
  filters.value = {
    search: '',
    set: '',
    type: '',
    rarity: '',
    cardType: ''
  }
  // Close mobile filters after clearing
  showMobileFilters.value = false
}

const selectCard = (card) => {
  selectedCard.value = card
}

const loadCards = async () => {
  isLoading.value = true
  try {
    // Load initial batch of cards (500 at a time for better performance)
    const result = await getAllPokemonCards({ limit: 500 })
    if (result.success) {
      cards.value = result.data
      // Load collected cards after cards are loaded
      if (user.value) {
        await loadCollectedCards()
      }
    } else {
      console.error('Failed to load cards:', result.error)
    }
  } catch (error) {
    console.error('Error loading cards:', error)
  } finally {
    isLoading.value = false
  }
}

const loadSets = async () => {
  try {
    const result = await getAllSets()
    if (result.success) {
      availableSets.value = result.data
    }
  } catch (error) {
    console.error('Error loading sets:', error)
  }
}

// Watch for user changes to reload collected cards
watch(() => user.value?.uid, async (newUid) => {
  if (newUid && cards.value.length > 0) {
    await loadCollectedCards()
  } else {
    collectedCards.value.clear()
  }
})

onMounted(() => {
  loadCards()
  loadSets()
})
</script>

