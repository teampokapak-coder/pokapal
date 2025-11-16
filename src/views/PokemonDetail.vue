<template>
  <div class="min-h-screen" style="background-color: var(--color-bg-primary);">
    <section class="section section-spacing-md">
      <div class="section-container">
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-12">
          <div class="animate-pulse space-y-4">
            <div class="h-12 bg-gray-200 rounded w-1/3 mx-auto"></div>
            <div class="h-64 bg-gray-200 rounded w-1/4 mx-auto"></div>
          </div>
        </div>

        <!-- Pokemon Not Found -->
        <div v-else-if="!pokemon" class="text-center py-12">
          <h2 class="mb-4">Pokemon Not Found</h2>
          <p class="text-gray-600 mb-6">The Pokemon you're looking for doesn't exist.</p>
          <router-link to="/" class="btn btn-h4 btn-primary">Go Home</router-link>
        </div>

        <!-- Pokemon Detail -->
        <div v-else>
          <!-- Header -->
          <div class="mb-8">
            <router-link 
              to="/" 
              class="text-sm mb-4 inline-block transition-colors"
              style="color: var(--color-text-secondary);"
              @mouseenter="$event.target.style.color = 'var(--color-text-primary)'"
              @mouseleave="$event.target.style.color = 'var(--color-text-secondary)'"
            >
              ← Back to Home
            </router-link>
            <div class="flex items-start gap-6">
              <!-- Pokemon Image -->
              <div class="w-48 h-48 pokemon-image-bg rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                <img 
                  v-if="pokemon.imageUrl || pokemon.spriteUrl" 
                  :src="pokemon.imageUrl || pokemon.spriteUrl" 
                  :alt="pokemon.displayName || pokemon.name"
                  class="w-full h-full object-contain p-4"
                />
                <div v-else class="text-6xl font-bold text-gray-400">
                  {{ getPokemonInitial(pokemon.displayName || pokemon.name) }}
                </div>
              </div>

              <!-- Pokemon Info -->
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h1>
                    {{ pokemon.displayName || pokemon.name }}
                  </h1>
                  <span v-if="pokemon.nationalDexNumber" class="text-xl" style="color: var(--color-text-tertiary);">
                    #{{ String(pokemon.nationalDexNumber).padStart(3, '0') }}
                  </span>
                </div>

                <!-- Types -->
                <div v-if="pokemon.types && pokemon.types.length > 0" class="flex gap-2 mb-4">
                  <span
                    v-for="type in pokemon.types"
                    :key="type"
                    :class="getTypeColor(type)"
                    class="px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {{ type }}
                  </span>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div class="card">
                    <div class="card-body p-4">
                      <p class="text-xs uppercase tracking-wide mb-1" style="color: var(--color-text-tertiary);">Total Cards</p>
                      <p class="text-2xl font-bold" style="color: var(--color-text-primary);">{{ pokemon.cardCount || 0 }}</p>
                    </div>
                  </div>
                  <div v-if="pokemon.sets && pokemon.sets.length > 0" class="card">
                    <div class="card-body p-4">
                      <p class="text-xs uppercase tracking-wide mb-1" style="color: var(--color-text-tertiary);">Sets</p>
                      <p class="text-2xl font-bold" style="color: var(--color-text-primary);">{{ pokemon.sets.length }}</p>
                    </div>
                  </div>
                  <div v-if="pokemon.cardIds && pokemon.cardIds.length > 0" class="card">
                    <div class="card-body p-4">
                      <p class="text-xs uppercase tracking-wide mb-1" style="color: var(--color-text-tertiary);">Variations</p>
                      <p class="text-2xl font-bold" style="color: var(--color-text-primary);">{{ pokemon.cardIds.length }}</p>
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
            <div class="mb-6 flex gap-4 flex-wrap">
              <select
                v-model="filterSet"
                class="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option value="">All Sets</option>
                <option v-for="set in uniqueSets" :key="set" :value="set">
                  {{ set }}
                </option>
              </select>
              <select
                v-model="filterRarity"
                class="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option value="">All Rarities</option>
                <option v-for="rarity in uniqueRarities" :key="rarity" :value="rarity">
                  {{ rarity }}
                </option>
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
                icon-size="w-8 h-8"
                @click="selectCard"
                @toggle-collected="(card) => toggleCollected(card.id)"
              />
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-12">
              <p class="text-gray-600">No cards found for this Pokemon.</p>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../config/firebase'
import { getAllPokemonCards } from '../utils/firebasePokemon'
import { useAuth } from '../composables/useAuth'
import { toggleCardCollected, getCollectedCardIds } from '../utils/userCards'
import PokemonCard from '../components/PokemonCard.vue'
import CardModal from '../components/CardModal.vue'

const route = useRoute()
const { user } = useAuth()
const pokemonId = route.params.pokemonId
const pokemon = ref(null)
const cards = ref([])
const isLoading = ref(false)
const isLoadingCards = ref(false)
const selectedCard = ref(null)
const filterSet = ref('')
const filterRarity = ref('')
const collectedCards = ref(new Set())

// Poké Ball icon paths (static assets from public folder)
const pokeballIconPath = '/pokeball.svg'

// Normalize Pokemon name (same function as in seeder)
const normalizePokemonName = (name) => {
  if (!name) return ''
  const variations = [
    /^Mega\s+/i, /\s+EX$/i, /\s+GX$/i, /\s+V$/i, /\s+VMAX$/i, /\s+VSTAR$/i,
    /\s+Prime$/i, /\s+LV\.?\s*X$/i, /\s+LV\.?\s*\d+$/i, /\s+Break$/i,
    /\s+Tag Team$/i, /\s+&.*$/i, /\s+\(.*\)$/i,
  ]
  let normalized = name
  variations.forEach(pattern => { normalized = normalized.replace(pattern, '') })
  return normalized.trim() || name
}

const getPokemonInitial = (name) => {
  return name?.charAt(0).toUpperCase() || '?'
}

const getTypeColor = (type) => {
  const colors = {
    Fire: 'bg-red-100 text-red-800',
    Water: 'bg-blue-100 text-blue-800',
    Grass: 'bg-green-100 text-green-800',
    Electric: 'bg-yellow-100 text-yellow-800',
    Psychic: 'bg-purple-100 text-purple-800',
    Fighting: 'bg-orange-100 text-orange-800',
    Darkness: 'bg-gray-800 text-white',
    Metal: 'bg-gray-300 text-gray-800',
    Fairy: 'bg-pink-100 text-pink-800',
    Dragon: 'bg-indigo-100 text-indigo-800',
    Colorless: 'bg-gray-100 text-gray-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

const selectCard = (card) => {
  selectedCard.value = card
}

const uniqueSets = computed(() => {
  const sets = new Set()
  cards.value.forEach(card => {
    if (card.set) sets.add(card.set)
  })
  return Array.from(sets).sort()
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

  if (filterSet.value) {
    filtered = filtered.filter(card => card.set === filterSet.value)
  }

  if (filterRarity.value) {
    filtered = filtered.filter(card => card.rarity === filterRarity.value)
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

const loadPokemon = async () => {
  isLoading.value = true
  try {
    const pokemonDoc = doc(db, 'pokemonList', pokemonId)
    const pokemonSnap = await getDoc(pokemonDoc)
    
    if (pokemonSnap.exists()) {
      pokemon.value = {
        id: pokemonSnap.id,
        ...pokemonSnap.data()
      }
      
      // Load cards for this Pokemon
      await loadCards()
    } else {
      pokemon.value = null
    }
  } catch (error) {
    console.error('Error loading Pokemon:', error)
    pokemon.value = null
  } finally {
    isLoading.value = false
  }
}

const loadCards = async () => {
  if (!pokemon.value) return
  
  isLoadingCards.value = true
  try {
    // Get all cards and filter by this Pokemon
    const result = await getAllPokemonCards({})
    if (!result.success) {
      console.error('Failed to load cards:', result.error)
      return
    }

    const allCards = result.data || []
    const normalizedName = normalizePokemonName(pokemon.value.name || pokemon.value.displayName)
    
    // Filter cards that match this Pokemon
    // Match by normalized name or nationalDexNumber
    cards.value = allCards.filter(card => {
      const cardNormalizedName = normalizePokemonName(card.name)
      const matchesName = cardNormalizedName === normalizedName
      const matchesDex = pokemon.value.nationalDexNumber && 
                        card.nationalDexNumber === pokemon.value.nationalDexNumber
      return matchesName || matchesDex
    })
    
    console.log(`Found ${cards.value.length} cards for ${pokemon.value.name}`)
    
    // Load collected status for these cards
    if (user.value && cards.value.length > 0) {
      await loadCollectedStatus()
    }
  } catch (error) {
    console.error('Error loading cards:', error)
  } finally {
    isLoadingCards.value = false
  }
}

const loadCollectedStatus = async () => {
  if (!user.value || cards.value.length === 0) return
  
  try {
    const cardIds = cards.value.map(card => card.id)
    const collectedSet = await getCollectedCardIds(user.value.uid, cardIds)
    collectedCards.value = collectedSet
  } catch (error) {
    console.error('Error loading collected status:', error)
  }
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
    alert('Error updating collection: ' + error.message)
  }
}

// Watch for user changes
watch(() => user.value, async (newUser) => {
  if (newUser && cards.value.length > 0) {
    await loadCollectedStatus()
  } else {
    collectedCards.value.clear()
  }
})

onMounted(() => {
  loadPokemon()
})
</script>

