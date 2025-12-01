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
                    v-if="getSetLogoUrl(set)" 
                    :src="getSetLogoUrl(set)" 
                    :alt="formatSetDisplayName(set)"
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
                  <h1 class="text-xl mb-1 leading-tight">{{ formatSetDisplayName(set) }}</h1>
                  <div v-if="set.series">
                    <span class="text-xs" style="color: var(--color-text-secondary);">{{ formatSeriesDisplayName(set) }}</span>
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
                  v-if="getSetLogoUrl(set)" 
                  :src="getSetLogoUrl(set)" 
                  :alt="formatSetDisplayName(set)"
                  class="w-full h-full object-contain p-4"
                />
                <div v-else class="text-center w-full h-full flex flex-col items-center justify-center" style="color: var(--color-text-tertiary); background: linear-gradient(135deg, var(--color-bg-tertiary), var(--color-bg-secondary));">
                  <div class="text-4xl font-bold mb-2">
                    {{ getSetIdInitials(set.apiId || set.code || set.id) }}
                  </div>
                  <div class="text-sm" style="color: var(--color-text-tertiary);">{{ set.code || set.apiId }}</div>
                </div>
              </div>

              <!-- Set Info -->
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h1>{{ formatSetDisplayName(set) }}</h1>
                </div>

                <div v-if="set.series" class="mb-4">
                  <span class="text-sm" style="color: var(--color-text-secondary);">{{ formatSeriesDisplayName(set) }}</span>
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

          <!-- Start Master Set Button -->
          <div v-if="user" class="mb-6">
            <button
              @click="showStartMasterSetModal = true"
              class="btn btn-h4 btn-primary"
            >
              Start Master Set
            </button>
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
            <h3 style="color: var(--color-text-primary);">Start Master Set</h3>
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
                :placeholder="`${set?.name || 'Set'} Master Set`"
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
                    :disabled="set?.language === 'ja'"
                  />
                  <span style="color: var(--color-text-primary);">English</span>
                  <span v-if="set?.language === 'en' && cards.length > 0" class="text-xs" style="color: var(--color-text-tertiary);">
                    ({{ cards.length }} cards)
                  </span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="masterSetForm.languages"
                    value="ja"
                    class="w-4 h-4"
                    :disabled="set?.language === 'en'"
                  />
                  <span style="color: var(--color-text-primary);">Japanese</span>
                  <span v-if="set?.language === 'ja' && cards.length > 0" class="text-xs" style="color: var(--color-text-tertiary);">
                    ({{ cards.length }} cards)
                  </span>
                </label>
              </div>
              <p v-if="masterSetForm.languages.length === 0" class="text-xs text-red-500 mt-1">
                Please select at least one language
              </p>
              <p v-if="set?.language" class="text-xs mt-1" style="color: var(--color-text-tertiary);">
                This set contains {{ set.language === 'en' ? 'English' : 'Japanese' }} cards
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
                {{ set?.name }}
              </p>
              <p class="text-xs mt-1">
                {{ cards.length }} cards will be included
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
                @click="createMasterSetFromSet"
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

    <!-- Success Notification -->
    <SuccessNotification
      :show="showSuccessNotification"
      title="Master Set Created!"
      message="Redirecting to your master set..."
      @close="showSuccessNotification = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { doc, getDoc, Timestamp, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { getAllPokemonCards, getSet, getCardsBySet } from '../utils/firebasePokemon'
import { useAuth } from '../composables/useAuth'
import { toggleCardCollected, getCollectedCardIds } from '../utils/userCards'
import PokemonCard from '../components/PokemonCard.vue'
import { getSetLogoUrl, formatSetDisplayName, formatSeriesDisplayName } from '../utils/setDisplayHelper'
import { getSetIdInitials } from '../utils/cardImageFallback'
import CardModal from '../components/CardModal.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import SuccessNotification from '../components/SuccessNotification.vue'
import { createMasterSet, createAssignment, getCardIdsForSet } from '../utils/masterSetUtils'

const route = useRoute()
const router = useRouter()
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
const showStartMasterSetModal = ref(false)
const isCreatingMasterSet = ref(false)
const masterSetForm = ref({
  name: '',
  description: '',
  languages: [],
  invites: []
})

// Poké Ball icon paths (static assets from public folder)
const pokeballIconPath = '/pokeball.svg'

const getOrdinalSuffix = (day) => {
  if (day > 3 && day < 21) return 'th'
  switch (day % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  
  let dateObj
  if (date instanceof Timestamp) {
    dateObj = date.toDate()
  } else if (date instanceof Date) {
    dateObj = date
  } else {
    return date
  }
  
  const month = dateObj.toLocaleDateString('en-US', { month: 'short' })
  const day = dateObj.getDate()
  const year = dateObj.getFullYear()
  const ordinal = getOrdinalSuffix(day)
  
  return `${month} ${day}${ordinal} ${year}`
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
    filtered = filtered.filter(card => card.category === filterCardType.value)
  }

  // Sort by set number if available
  filtered.sort((a, b) => {
    if (a.localId && b.localId) {
      const numA = parseInt(a.localId.split('/')[0]) || 0
      const numB = parseInt(b.localId.split('/')[0]) || 0
      return numA - numB
    }
    return 0
  })

  return filtered
})

const loadSet = async () => {
  isLoading.value = true
  try {
    // Try English sets collection first
    let result = await getSet(setId, 'en')
    let setLanguage = 'en'
    
    // If not found, try Japanese sets collection
    if (!result.success) {
      result = await getSet(setId, 'ja')
      setLanguage = 'ja'
    }
    
    if (result.success) {
      // Ensure language is set on the set object
      set.value = {
        ...result.data,
        language: result.data.language || setLanguage
      }
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
    // Determine language from set - ensure we query the correct collection
    // English sets should query card_en, Japanese sets should query card_ja
    const language = set.value.language || 'en'
    
    // Load cards by setId (Firestore document ID) and language
    // getCardsBySet will query card_en for 'en' language, card_ja for 'ja' language
    const result = await getCardsBySet(set.value.id, language)
    
    if (result.success) {
      cards.value = result.data || []
    } else {
      cards.value = []
    }
    
    // Load collected cards
    await loadCollectedCards()
  } catch (error) {
    console.error('Error loading cards:', error)
    cards.value = []
  } finally {
    isLoadingCards.value = false
  }
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

// Create master set from Set page
const createMasterSetFromSet = async () => {
  if (!user.value) {
    alert('Please log in to create a master set')
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

  if (!set.value || !set.value.id) {
    alert('No set data found')
    return
  }

  isCreatingMasterSet.value = true

  try {
    // Get card IDs for selected languages
    const cardIds = { card_en: [], card_ja: [] }
    
    for (const lang of masterSetForm.value.languages) {
      const ids = await getCardIdsForSet(set.value.id, lang)
      if (lang === 'en') {
        cardIds.card_en = ids
      } else if (lang === 'ja') {
        cardIds.card_ja = ids
      }
    }

    if (cardIds.card_en.length === 0 && cardIds.card_ja.length === 0) {
      alert('No cards found for this set in the selected languages')
      isCreatingMasterSet.value = false
      return
    }

    // Create master set
    const masterSetData = {
      name: masterSetForm.value.name.trim(),
      description: masterSetForm.value.description.trim() || null,
      type: 'set',
      targetSetId: set.value.id,
      targetSetCollection: `set_${set.value.language || 'en'}`,
      targetSetName: set.value.name,
      targetPokemonId: null,
      targetPokemonName: null,
      languages: masterSetForm.value.languages,
      createdBy: user.value.uid
    }

    const masterSetResult = await createMasterSet(masterSetData)
    if (!masterSetResult.success) {
      throw new Error(masterSetResult.error)
    }

    const masterSetId = masterSetResult.data.id

    // Create assignment for creator
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

    // Create assignments for invitees
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
  if (isOpen && set.value) {
    masterSetForm.value.name = `${set.value.name} Master Set`
    masterSetForm.value.description = ''
    // Default to set's language
    masterSetForm.value.languages = set.value.language === 'ja' ? ['ja'] : ['en']
    masterSetForm.value.invites = []
  }
})

onMounted(() => {
  loadSet()
})
</script>

