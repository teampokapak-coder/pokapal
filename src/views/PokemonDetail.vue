<template>
  <div class="min-h-screen" style="background-color: var(--color-bg-primary);">
    <section class="section section-spacing-md">
      <div class="section-container">
        <!-- Loading State -->
        <div v-if="isLoading" class="w-full">
          <LoadingSpinner />
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
          <div class="mb-6 sm:mb-8">
            <button 
              @click="$router.back()"
              class="text-xs sm:text-sm mb-3 sm:mb-4 inline-block transition-colors"
              style="color: var(--color-text-secondary);"
              @mouseenter="$event.target.style.color = 'var(--color-text-primary)'"
              @mouseleave="$event.target.style.color = 'var(--color-text-secondary)'"
            >
              ← Back
            </button>
            
            <!-- Mobile Layout: Image left, name/type/button right -->
            <div class="md:hidden">
              <div class="grid grid-cols-3 gap-2 mb-3">
                <!-- Pokemon Image/GIF - Left Side (1/3 width) -->
                <div class="pokemon-image-bg rounded-lg flex items-center justify-center overflow-hidden aspect-square">
                  <img 
                    v-if="getPokemonImageUrl(pokemon)" 
                    :src="getPokemonImageUrl(pokemon)" 
                    :alt="pokemon.displayName || pokemon.name"
                    class="w-full h-full object-contain p-1 sm:p-2"
                    :class="{ 'pokemon-gif': isGifUrl(getPokemonImageUrl(pokemon)) }"
                    @error="handleImageError"
                  />
                  <div v-else class="text-xl sm:text-2xl font-bold text-gray-400">
                    {{ getPokemonInitial(pokemon.displayName || pokemon.name) }}
                  </div>
                </div>
                
                <!-- Pokemon Name, Type & Button - Right Side (2/3 width) -->
                <div class="col-span-2 min-w-0">
                  <!-- Pokemon Name & Dex Number -->
                  <div class="flex items-center gap-2 flex-wrap mb-2">
                    <h1 class="text-xl sm:text-2xl font-bold truncate">
                      {{ pokemon.displayName || pokemon.name }}
                    </h1>
                    <span v-if="pokemon.nationalDexNumber" class="text-base sm:text-lg whitespace-nowrap" style="color: var(--color-text-tertiary);">
                      #{{ String(pokemon.nationalDexNumber).padStart(3, '0') }}
                    </span>
                  </div>

                  <!-- Types -->
                  <div v-if="pokemon.types && pokemon.types.length > 0" class="flex gap-1.5 mb-2 flex-wrap">
                    <span
                      v-for="type in pokemon.types"
                      :key="type"
                      :class="getTypeColor(type)"
                      class="px-2 py-0.5 rounded-full text-xs font-medium"
                    >
                      {{ type }}
                    </span>
                  </div>

                  <!-- Start Master Set Button - Compact with light text -->
                  <div v-if="user">
                    <button
                      @click="showStartMasterSetModal = true"
                      class="btn btn-h5 btn-primary text-sm py-1.5 px-3"
                      style="color: white;"
                    >
                      Start Master Set
                    </button>
                  </div>
                </div>
              </div>

              <!-- Stats - Compact Grid -->
              <div class="grid grid-cols-3 gap-2">
                <div class="card">
                  <div class="card-body p-2 sm:p-3">
                    <p class="text-[10px] sm:text-xs uppercase tracking-wide mb-0.5 sm:mb-1" style="color: var(--color-text-tertiary);">Cards</p>
                    <p class="text-lg sm:text-xl font-bold" style="color: var(--color-text-primary);">{{ pokemon.cardCount || 0 }}</p>
                  </div>
                </div>
                <div v-if="pokemon.sets && pokemon.sets.length > 0" class="card">
                  <div class="card-body p-2 sm:p-3">
                    <p class="text-[10px] sm:text-xs uppercase tracking-wide mb-0.5 sm:mb-1" style="color: var(--color-text-tertiary);">Sets</p>
                    <p class="text-lg sm:text-xl font-bold" style="color: var(--color-text-primary);">{{ pokemon.sets.length }}</p>
                  </div>
                </div>
                <div v-if="pokemon.cardIds && pokemon.cardIds.length > 0" class="card">
                  <div class="card-body p-2 sm:p-3">
                    <p class="text-[10px] sm:text-xs uppercase tracking-wide mb-0.5 sm:mb-1" style="color: var(--color-text-tertiary);">Vars</p>
                    <p class="text-lg sm:text-xl font-bold" style="color: var(--color-text-primary);">{{ pokemon.cardIds.length }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Desktop Layout: Image left, info right -->
            <div class="hidden md:flex items-start gap-6">
              <!-- Pokemon Image/GIF -->
              <div class="w-48 h-48 pokemon-image-bg rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                <img 
                  v-if="getPokemonImageUrl(pokemon)" 
                  :src="getPokemonImageUrl(pokemon)" 
                  :alt="pokemon.displayName || pokemon.name"
                  class="w-full h-full object-contain p-4"
                  :class="{ 'pokemon-gif': isGifUrl(getPokemonImageUrl(pokemon)) }"
                  @error="handleImageError"
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

                <!-- Start Master Set Button -->
                <div v-if="user" class="mb-4">
                  <button
                    @click="showStartMasterSetModal = true"
                    class="btn btn-h4 btn-primary"
                  >
                    Start Master Set
                  </button>
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
          <div class="mt-6 sm:mt-8">
            <div class="flex justify-between items-center mb-4 sm:mb-6">
              <h2 class="text-lg sm:text-2xl">All Cards</h2>
              <div class="text-xs sm:text-sm" style="color: var(--color-text-secondary);">
                {{ filteredCards.length }} {{ filteredCards.length === 1 ? 'card' : 'cards' }}
              </div>
            </div>

            <!-- Filters -->
            <div class="mb-4 sm:mb-6 flex gap-2 sm:gap-4 flex-wrap">
              <select
                v-model="filterSet"
                class="px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-2 flex-1 sm:flex-none min-w-0"
                style="border-color: var(--color-border);"
              >
                <option value="">All Sets</option>
                <option v-for="set in uniqueSets" :key="set" :value="set">
                  {{ set }}
                </option>
              </select>
              <select
                v-model="filterRarity"
                class="px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-2 flex-1 sm:flex-none min-w-0"
                style="border-color: var(--color-border);"
              >
                <option value="">All Rarities</option>
                <option v-for="rarity in uniqueRarities" :key="rarity" :value="rarity">
                  {{ rarity }}
                </option>
              </select>
            </div>

            <!-- Cards Grid -->
            <div v-if="isLoadingCards" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-1.5 sm:gap-2 md:gap-4">
              <div v-for="i in 12" :key="i" class="card animate-pulse">
                <div class="aspect-square bg-gray-200 rounded-t-lg"></div>
                <div class="card-body p-2 sm:p-3">
                  <div class="h-3 bg-gray-200 rounded mb-1"></div>
                  <div class="h-2 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>

            <div v-else-if="filteredCards.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              <PokemonCard
                v-for="card in filteredCards"
                :key="card.id"
                :card="card"
                :is-collected="collectedCards.has(card.id)"
                :show-collection-icon="true"
                :show-types="true"
                icon-size="w-6 h-6 sm:w-8 sm:h-8"
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

    <!-- Start Master Set Modal -->
    <div
      v-if="showStartMasterSetModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click="showStartMasterSetModal = false"
    >
      <div
        class="rounded-lg max-w-md w-full"
        style="background-color: var(--color-bg-secondary);"
        @click.stop
      >
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <h3>Start Master Set</h3>
            <button
              @click="showStartMasterSetModal = false"
              style="color: var(--color-text-tertiary);"
            >
              ✕
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--color-text-primary);">
                Challenge Name
              </label>
              <input
                v-model="masterSetForm.challengeName"
                type="text"
                :placeholder="`${pokemon?.displayName || pokemon?.name} Master Set`"
                class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
                style="border-color: var(--color-border);"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--color-text-primary);">
                Description (Optional)
              </label>
              <textarea
                v-model="masterSetForm.description"
                rows="3"
                placeholder="Add a description for your master set..."
                class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
                style="border-color: var(--color-border);"
              ></textarea>
            </div>

            <div class="text-sm" style="color: var(--color-text-secondary);">
              <p class="mb-2">This will create a master set for:</p>
              <p class="font-medium" style="color: var(--color-text-primary);">
                {{ pokemon?.displayName || pokemon?.name }}
              </p>
              <p class="text-xs mt-1">
                {{ pokemon?.cardIds?.length || 0 }} cards will be included
              </p>
            </div>

            <div class="flex gap-3 pt-4">
              <button
                @click="showStartMasterSetModal = false"
                class="btn btn-h4 btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                @click="createMasterSetFromPokemon"
                class="btn btn-h4 btn-primary flex-1"
                :disabled="!masterSetForm.challengeName.trim() || isCreatingMasterSet"
              >
                {{ isCreatingMasterSet ? 'Creating...' : 'Create Master Set' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc, collection, getDocs, query, where, addDoc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore'
import pokemonListData from '../data/pokemonList.json'
import { db } from '../config/firebase'
import { getAllPokemonCards } from '../utils/firebasePokemon'
import { useAuth } from '../composables/useAuth'
import { toggleCardCollected, getCollectedCardIds } from '../utils/userCards'
import PokemonCard from '../components/PokemonCard.vue'
import CardModal from '../components/CardModal.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { getTypeColorClass } from '../utils/pokemonTypes'

const route = useRoute()
const router = useRouter()
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
const showStartMasterSetModal = ref(false)
const isCreatingMasterSet = ref(false)
const masterSetForm = ref({
  challengeName: '',
  description: ''
})

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

// Get the best image/GIF/sprite URL for a Pokemon with fallbacks
const getPokemonImageUrl = (pokemon) => {
  if (!pokemon) return null
  
  // Priority order:
  // 1. Animated GIF (most engaging)
  // 2. Sprite URL (top-level)
  // 3. Nested spriteUrls.spriteUrl
  // 4. Nested spriteUrls.normal
  // 5. Card image (imageUrl)
  // 6. Alternative GIF generations
  // 7. Alternative sprite generations
  
  if (pokemon.gifUrl) {
    return pokemon.gifUrl
  }
  
  if (pokemon.spriteUrl) {
    return pokemon.spriteUrl
  }
  
  if (pokemon.spriteUrls?.spriteUrl) {
    return pokemon.spriteUrls.spriteUrl
  }
  
  if (pokemon.spriteUrls?.normal) {
    return pokemon.spriteUrls.normal
  }
  
  // Try alternative GIF generations
  if (pokemon.gifUrls?.gifUrl) {
    return pokemon.gifUrls.gifUrl
  }
  
  if (pokemon.gifUrls?.normal) {
    return pokemon.gifUrls.normal
  }
  
  if (pokemon.gifUrls?.alternateGenerations) {
    const altGifs = pokemon.gifUrls.alternateGenerations
    // Try black-white first (best coverage), then others
    if (altGifs['black-white']) return altGifs['black-white']
    if (altGifs['black-2-white-2']) return altGifs['black-2-white-2']
    if (altGifs['x-y']) return altGifs['x-y']
    if (altGifs['diamond-pearl']) return altGifs['diamond-pearl']
  }
  
  // Try alternative sprite generations
  if (pokemon.spriteUrls?.alternateGenerations) {
    const altSprites = pokemon.spriteUrls.alternateGenerations
    // Try recommended generations first
    if (altSprites['scarlet-violet']) return altSprites['scarlet-violet']
    if (altSprites['sword-shield']) return altSprites['sword-shield']
    if (altSprites['diamond-pearl']) return altSprites['diamond-pearl']
    if (altSprites['x-y']) return altSprites['x-y']
    if (altSprites['black-white']) return altSprites['black-white']
  }
  
  // Last resort: card image
  return pokemon.imageUrl || null
}

// Check if the URL is a GIF
const isGifUrl = (url) => {
  return url && url.toLowerCase().endsWith('.gif')
}

const getTypeColor = (type) => {
  return getTypeColorClass(type)
}

const handleImageError = (event) => {
  // Try fallback if primary image failed
  const currentUrl = event.target.src
  const pokemonData = pokemon.value
  
  if (!pokemonData) {
    event.target.style.display = 'none'
    return
  }
  
  // If GIF failed, try sprite
  if (isGifUrl(currentUrl) && pokemonData.spriteUrl) {
    event.target.src = pokemonData.spriteUrl
    event.target.classList.remove('pokemon-gif')
    return
  }
  
  // If sprite failed, try alternative sprite generations
  if (pokemonData.spriteUrls?.alternateGenerations) {
    const altSprites = pokemonData.spriteUrls.alternateGenerations
    // Try next generation
    if (currentUrl.includes('scarlet-violet') && altSprites['sword-shield']) {
      event.target.src = altSprites['sword-shield']
      return
    }
    if (currentUrl.includes('sword-shield') && altSprites['diamond-pearl']) {
      event.target.src = altSprites['diamond-pearl']
      return
    }
    if (currentUrl.includes('diamond-pearl') && altSprites['x-y']) {
      event.target.src = altSprites['x-y']
      return
    }
    if (currentUrl.includes('x-y') && altSprites['black-white']) {
      event.target.src = altSprites['black-white']
      return
    }
  }
  
  // If sprite failed, try card image
  if (pokemonData.imageUrl && !currentUrl.includes(pokemonData.imageUrl)) {
    event.target.src = pokemonData.imageUrl
    return
  }
  
  // All fallbacks failed - hide image
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
    // First try to load by document ID
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
      // If not found by ID, try to find by national dex number
      const dexNumber = parseInt(pokemonId)
      if (!isNaN(dexNumber)) {
        const pokemonListRef = collection(db, 'pokemonList')
        const q = query(pokemonListRef, where('nationalDexNumber', '==', dexNumber))
        const snapshot = await getDocs(q)
        
        if (!snapshot.empty) {
          // Found by dex number
          const docSnap = snapshot.docs[0]
          pokemon.value = {
            id: docSnap.id,
            ...docSnap.data()
          }
          await loadCards()
        } else {
          // Not in pokemonList collection, but might be in base list
          const basePokemon = pokemonListData.find(p => p.nationalDexNumber === dexNumber)
          if (basePokemon) {
            // Create a basic Pokemon entry from base data
            pokemon.value = {
              nationalDexNumber: basePokemon.nationalDexNumber,
              name: basePokemon.name,
              displayName: basePokemon.name,
              cardCount: 0,
              types: [],
              sets: [],
              cardIds: []
            }
            // Still try to load cards (might find some)
            await loadCards()
          } else {
            pokemon.value = null
          }
        }
      } else {
        pokemon.value = null
      }
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

// Generate invite code helper
const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// Create master set from Pokemon page
const createMasterSetFromPokemon = async () => {
  if (!user.value) {
    alert('Please log in to create a master set')
    router.push('/login')
    return
  }

  if (!masterSetForm.value.challengeName.trim()) {
    alert('Please enter a challenge name')
    return
  }

  if (!pokemon.value || !pokemon.value.cardIds || pokemon.value.cardIds.length === 0) {
    alert('No cards found for this Pokemon')
    return
  }

  isCreatingMasterSet.value = true

  try {
    // 1. Create challenge document
    const challengesRef = collection(db, 'challenges')
    const inviteCode = generateInviteCode()

    const challengeData = {
      name: masterSetForm.value.challengeName.trim(),
      description: masterSetForm.value.description.trim() || '',
      inviteCode,
      createdBy: user.value.uid,
      members: [user.value.uid], // Solo challenge initially
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const challengeDoc = await addDoc(challengesRef, challengeData)
    const challengeId = challengeDoc.id

    // Update user's challenges array
    const userRef = doc(db, 'users', user.value.uid)
    await updateDoc(userRef, {
      challenges: arrayUnion(challengeId),
      updatedAt: serverTimestamp()
    })

    // 2. Create assignment document
    const assignmentsRef = collection(db, 'assignments')
    const cardIds = pokemon.value.cardIds || []

    const assignmentData = {
      challengeId: challengeId,
      userId: user.value.uid,
      email: null,
      type: 'pokemon',
      setId: null,
      setName: null,
      pokemonId: pokemonId,
      pokemonName: pokemon.value.displayName || pokemon.value.name,
      totalCards: cardIds.length, // Store total for quick reference
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const assignmentDoc = await addDoc(assignmentsRef, assignmentData)
    const assignmentId = assignmentDoc.id

    // 3. Create cards sub-collection (one document per card)
    const cardsRef = collection(db, 'assignments', assignmentId, 'cards')
    
    // Batch create card documents (limit to 500 per batch to avoid Firestore limits)
    const batchSize = 500
    for (let i = 0; i < cardIds.length; i += batchSize) {
      const batch = cardIds.slice(i, i + batchSize)
      const promises = batch.map(cardId => 
        addDoc(cardsRef, { cardId })
      )
      await Promise.all(promises)
    }

    // Close modal and redirect to challenge
    showStartMasterSetModal.value = false
    router.push(`/challenge/${challengeId}`)
  } catch (error) {
    console.error('Error creating master set:', error)
    alert('Error creating master set: ' + error.message)
  } finally {
    isCreatingMasterSet.value = false
  }
}

// Initialize form when modal opens
watch(showStartMasterSetModal, (isOpen) => {
  if (isOpen && pokemon.value) {
    masterSetForm.value.challengeName = `${pokemon.value.displayName || pokemon.value.name} Master Set`
    masterSetForm.value.description = ''
  }
})

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

