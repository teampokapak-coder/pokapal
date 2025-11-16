<template>
  <div class="min-h-screen" style="background-color: var(--color-bg-primary);">
    <section class="section section-spacing-md">
      <div class="section-container">
        <div class="section-header">
          <h2>Browse Cards</h2>
          <p class="section-subtitle">Search and explore Pokemon cards</p>
        </div>

        <div class="flex gap-6">
          <!-- Filters Sidebar -->
          <aside class="w-64 flex-shrink-0">
            <div class="card sticky top-4">
              <div class="card-header">
                <h3 class="card-title">Filters</h3>
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
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
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
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
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
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
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
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
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
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
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
          <main class="flex-1">
            <!-- Results Count -->
            <div class="mb-4">
              <p class="text-sm">
                Showing {{ filteredCards.length }} of {{ cards.length }} cards
              </p>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="text-center py-12">
              <p>Loading cards...</p>
            </div>

            <!-- Cards Grid -->
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

const filters = ref({
  search: '',
  set: '',
  type: '',
  rarity: '',
  cardType: ''
})

const filteredCards = computed(() => {
  let filtered = cards.value

  // Search filter
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(card =>
      card.name?.toLowerCase().includes(search) ||
      card.setNumber?.toLowerCase().includes(search)
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
    filtered = filtered.filter(card => card.cardType === filters.value.cardType)
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

