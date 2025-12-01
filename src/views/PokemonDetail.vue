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
                  <div v-if="pokemon.types && pokemon.types.length > 0" class="flex gap-1 mb-2 flex-wrap">
                    <span
                      v-for="type in pokemon.types"
                      :key="type"
                      :class="getTypeColor(type)"
                    >
                      {{ type }}
                    </span>
                  </div>

                  <!-- Start Master Set Button - Compact with light text -->
                  <div v-if="user">
                    <button
                      @click="showStartMasterSetModal = true"
                      class="btn btn-h5 btn-primary text-sm py-1.5 px-3"
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
                <div v-if="cards.length > 0" class="card">
                  <div class="card-body p-2 sm:p-3">
                    <p class="text-[10px] sm:text-xs uppercase tracking-wide mb-0.5 sm:mb-1" style="color: var(--color-text-tertiary);">English</p>
                    <p class="text-lg sm:text-xl font-bold" style="color: var(--color-text-primary);">{{ cards.length }}</p>
                  </div>
                </div>
                <div v-if="japaneseCards.length > 0" class="card">
                  <div class="card-body p-2 sm:p-3">
                    <p class="text-[10px] sm:text-xs uppercase tracking-wide mb-0.5 sm:mb-1" style="color: var(--color-text-tertiary);">Japanese</p>
                    <p class="text-lg sm:text-xl font-bold" style="color: var(--color-text-primary);">{{ japaneseCards.length }}</p>
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
                  <div v-if="cards.length > 0" class="card">
                    <div class="card-body p-4">
                      <p class="text-xs uppercase tracking-wide mb-1" style="color: var(--color-text-tertiary);">English Cards</p>
                      <p class="text-2xl font-bold" style="color: var(--color-text-primary);">{{ cards.length }}</p>
                    </div>
                  </div>
                  <div v-if="japaneseCards.length > 0" class="card">
                    <div class="card-body p-4">
                      <p class="text-xs uppercase tracking-wide mb-1" style="color: var(--color-text-tertiary);">Japanese Cards</p>
                      <p class="text-2xl font-bold" style="color: var(--color-text-primary);">{{ japaneseCards.length }}</p>
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
                v-model="filterLanguage"
                class="px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-2 flex-1 sm:flex-none min-w-0"
                style="border-color: var(--color-border);"
              >
                <option value="all">All Languages</option>
                <option value="en">English</option>
                <option value="ja">Japanese</option>
              </select>
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

    <!-- Success Notification -->
    <SuccessNotification
      :show="showSuccessNotification"
      title="Master Set Created!"
      message="Redirecting to your master set..."
      @close="showSuccessNotification = false"
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
                Master Set Name
              </label>
              <input
                v-model="masterSetForm.name"
                type="text"
                :placeholder="`${pokemon?.displayName || pokemon?.name} Master Set`"
                class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
                style="border-color: var(--color-border); background-color: var(--color-bg-primary); color: var(--color-text-primary);"
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
                style="border-color: var(--color-border); background-color: var(--color-bg-primary); color: var(--color-text-primary);"
              ></textarea>
            </div>

            <!-- Language Selection -->
            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--color-text-primary);">
                Languages
              </label>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="masterSetForm.languages"
                    value="en"
                    class="w-4 h-4"
                  />
                  <span style="color: var(--color-text-primary);">English</span>
                  <span v-if="cards.length > 0" class="text-xs" style="color: var(--color-text-tertiary);">
                    ({{ cards.length }} cards)
                  </span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="masterSetForm.languages"
                    value="ja"
                    class="w-4 h-4"
                  />
                  <span style="color: var(--color-text-primary);">Japanese</span>
                  <span v-if="japaneseCards.length > 0" class="text-xs" style="color: var(--color-text-tertiary);">
                    ({{ japaneseCards.length }} cards)
                  </span>
                </label>
              </div>
              <p v-if="masterSetForm.languages.length === 0" class="text-xs text-red-500 mt-1">
                Please select at least one language
              </p>
            </div>

            <!-- Invite Users -->
            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--color-text-primary);">
                Invite Friends (Optional)
              </label>
              <div class="space-y-2">
                <div v-for="(invite, index) in masterSetForm.invites" :key="index" class="flex gap-2">
                  <input
                    v-model="invite.email"
                    type="email"
                    placeholder="friend@example.com"
                    class="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
                    style="border-color: var(--color-border); background-color: var(--color-bg-primary); color: var(--color-text-primary);"
                    @input="searchUserForInvite(invite, index)"
                  />
                  <button
                    @click="removeInvite(index)"
                    class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    ✕
                  </button>
                </div>
                <button
                  @click="addInvite"
                  class="btn btn-h5 btn-secondary w-full text-sm"
                >
                  + Add Friend
                </button>
              </div>
            </div>

            <div class="text-sm" style="color: var(--color-text-secondary);">
              <p class="mb-2">This will create a master set for:</p>
              <p class="font-medium" style="color: var(--color-text-primary);">
                {{ pokemon?.displayName || pokemon?.name }}
              </p>
              <p class="text-xs mt-1">
                {{ getTotalCardCount() }} cards will be included
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
                :disabled="!masterSetForm.name.trim() || masterSetForm.languages.length === 0 || isCreatingMasterSet"
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
import { getAllPokemonCards, getPokemon, getAllPokemon, getPokemonByDexNumber } from '../utils/firebasePokemon'
import { useAuth } from '../composables/useAuth'
import { toggleCardCollected, getCollectedCardIds } from '../utils/userCards'
import PokemonCard from '../components/PokemonCard.vue'
import CardModal from '../components/CardModal.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import SuccessNotification from '../components/SuccessNotification.vue'
import { getTypeColorClass } from '../utils/pokemonTypes'
import { createMasterSet, createAssignment, getCardIdsForPokemon } from '../utils/masterSetUtils'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const pokemonId = route.params.pokemonId
const pokemon = ref(null)
const cards = ref([])
const isLoading = ref(false)
const isLoadingCards = ref(false)
const selectedCard = ref(null)
const filterLanguage = ref('all')
const filterSet = ref('')
const filterRarity = ref('')
const collectedCards = ref(new Set())
const japaneseCards = ref([])
const showStartMasterSetModal = ref(false)
const isCreatingMasterSet = ref(false)
const showSuccessNotification = ref(false)
const masterSetForm = ref({
  name: '',
  description: '',
  languages: ['en'], // Default to English
  invites: []
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
    const setName = typeof card.set === 'object' ? card.set?.name : card.set
    if (setName) sets.add(setName)
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
  // Combine English and Japanese cards
  let allCards = [...cards.value, ...japaneseCards.value]

  // Filter by language
  if (filterLanguage.value === 'en') {
    allCards = allCards.filter(card => card.language === 'en' || !card.language)
  } else if (filterLanguage.value === 'ja') {
    allCards = allCards.filter(card => card.language === 'ja')
  }
  // If 'all', keep all cards

  // Filter by set
  if (filterSet.value) {
    allCards = allCards.filter(card => {
      const setName = typeof card.set === 'object' ? card.set?.name : card.set
      return setName === filterSet.value
    })
  }

  // Filter by rarity
  if (filterRarity.value) {
    allCards = allCards.filter(card => card.rarity === filterRarity.value)
  }

  // Sort by set number if available
  allCards.sort((a, b) => {
    if (a.setNumber && b.setNumber) {
      const numA = parseInt(a.setNumber.split('/')[0]) || 0
      const numB = parseInt(b.setNumber.split('/')[0]) || 0
      return numA - numB
    }
    return 0
  })

  return allCards
})

const loadPokemon = async () => {
  isLoading.value = true
  try {
    // Try to parse as nationalDexNumber first (preferred)
    const dexNumber = parseInt(pokemonId)
    let result = null
    
    if (!isNaN(dexNumber)) {
      // Try to get by nationalDexNumber first (most common case)
      result = await getPokemonByDexNumber(dexNumber)
    }
    
    // If not found by dex number, try as document ID
    if (!result || !result.success) {
      result = await getPokemon(pokemonId)
    }
    
    if (result.success) {
      pokemon.value = result.data
      await loadCards()
    } else {
      // Fallback: try to find in pokemonList.json if not in Firestore
      if (!isNaN(dexNumber)) {
        const basePokemon = pokemonListData.find(p => p.nationalDexNumber === dexNumber)
        if (basePokemon) {
          pokemon.value = {
            nationalDexNumber: basePokemon.nationalDexNumber,
            name: basePokemon.name,
            displayName: basePokemon.name,
            types: basePokemon.types || [],
            spriteUrl: basePokemon.spriteUrl,
            gifUrl: basePokemon.gifUrl
          }
          await loadCards()
        } else {
          pokemon.value = null
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
  if (!pokemon.value || !pokemon.value.nationalDexNumber) {
    return
  }
  
  isLoadingCards.value = true
  try {
    const dexNumber = pokemon.value.nationalDexNumber
    
    // Load cards by nationalDexNumber from both collections
    const cardsResult = await getAllPokemonCards({ 
      nationalDexNumber: dexNumber,
      language: 'all'
    })
    
    if (cardsResult.success) {
      const allCards = cardsResult.data || []
      
      // Separate English and Japanese cards
      cards.value = allCards.filter(card => card.language === 'en' || !card.language)
      japaneseCards.value = allCards.filter(card => card.language === 'ja')
    }
    
    // Update card counts
    if (pokemon.value) {
      pokemon.value.cardCount = cards.value.length + japaneseCards.value.length
    }
    
    // Load collected status for all cards
    if (user.value && (cards.value.length > 0 || japaneseCards.value.length > 0)) {
      await loadCollectedStatus()
    }
  } catch (error) {
    console.error('Error loading cards:', error)
  } finally {
    isLoadingCards.value = false
  }
}

const loadCollectedStatus = async () => {
  if (!user.value || (cards.value.length === 0 && japaneseCards.value.length === 0)) return
  
  try {
    const allCardIds = [...cards.value.map(card => card.id), ...japaneseCards.value.map(card => card.id)]
    const collectedSet = await getCollectedCardIds(user.value.uid, allCardIds)
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

// Add invite
const addInvite = () => {
  masterSetForm.value.invites.push({ email: '', userId: null, userName: null })
}

// Remove invite
const removeInvite = (index) => {
  masterSetForm.value.invites.splice(index, 1)
}

// Search for user by email (optional - can enhance later)
const searchUserForInvite = async (invite, index) => {
  // TODO: Implement user search by email
  // For now, just store the email
}

// Get total card count based on selected languages
const getTotalCardCount = () => {
  let count = 0
  if (masterSetForm.value.languages.includes('en')) {
    count += cards.value.length
  }
  if (masterSetForm.value.languages.includes('ja')) {
    count += japaneseCards.value.length
  }
  return count
}

// Create master set from Pokemon page
const createMasterSetFromPokemon = async () => {
  if (!user.value) {
    alert('Please log in to create a master set')
    router.push('/login')
    return
  }

  if (!masterSetForm.value.name.trim()) {
    alert('Please enter a master set name')
    return
  }

  if (masterSetForm.value.languages.length === 0) {
    alert('Please select at least one language')
    return
  }

  if (!pokemon.value || !pokemon.value.nationalDexNumber) {
    alert('No Pokemon data found')
    return
  }

  isCreatingMasterSet.value = true

  try {
    // 1. Get card IDs for selected languages
    const cardIds = await getCardIdsForPokemon(
      pokemon.value.nationalDexNumber,
      masterSetForm.value.languages
    )

    if (cardIds.card_en.length === 0 && cardIds.card_ja.length === 0) {
      alert('No cards found for this Pokemon in the selected languages')
      isCreatingMasterSet.value = false
      return
    }

    // 2. Create master set
    const masterSetData = {
      name: masterSetForm.value.name.trim(),
      description: masterSetForm.value.description.trim() || null,
      type: 'pokemon',
      targetPokemonId: String(pokemon.value.nationalDexNumber),
      targetPokemonName: pokemon.value.displayName || pokemon.value.name,
      targetSetId: null,
      targetSetCollection: null,
      targetSetName: null,
      languages: masterSetForm.value.languages,
      createdBy: user.value.uid
    }

    const masterSetResult = await createMasterSet(masterSetData)
    if (!masterSetResult.success) {
      throw new Error(masterSetResult.error)
    }

    const masterSetId = masterSetResult.data.id

    // 3. Create assignment for creator
    const creatorAssignment = await createAssignment({
      masterSetId,
      userId: user.value.uid,
      userEmail: user.value.email,
      userName: user.value.displayName || user.value.email,
      card_en: cardIds.card_en,
      card_ja: cardIds.card_ja,
      assignmentType: null,
      assignmentSetId: null,
      assignmentPokemonId: null,
      status: 'accepted',
      createdBy: user.value.uid
    })

    if (!creatorAssignment.success) {
      throw new Error(creatorAssignment.error)
    }

    // 4. Create assignments for invitees
    for (const invite of masterSetForm.value.invites) {
      if (invite.email && invite.email.includes('@')) {
        await createAssignment({
          masterSetId,
          userId: invite.userId || null,
          userEmail: invite.email,
          userName: invite.userName || null,
          card_en: cardIds.card_en,
          card_ja: cardIds.card_ja,
          assignmentType: null,
          assignmentSetId: null,
          assignmentPokemonId: null,
          status: 'pending',
          createdBy: user.value.uid
        })
      }
    }

    // Close modal and show success
    showStartMasterSetModal.value = false
    showSuccessNotification.value = true
    setTimeout(() => {
      router.push(`/master-set/${masterSetId}`)
    }, 1500) // Redirect after 1.5 seconds
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
    masterSetForm.value.name = `${pokemon.value.displayName || pokemon.value.name} Master Set`
    masterSetForm.value.description = ''
    masterSetForm.value.languages = ['en'] // Default to English
    masterSetForm.value.invites = []
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

