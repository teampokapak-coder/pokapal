<template>
  <div class="min-h-screen" style="background-color: var(--color-bg-primary);">
    <section class="section section-spacing-md">
      <div class="section-container">
        <!-- Loading State -->
        <div v-if="isLoading" class="w-full">
          <LoadingSpinner
            :variant="isAppShell ? 'brand' : 'default'"
            full-viewport
          />
        </div>

        <!-- Trainer Not Found -->
        <div v-else-if="!trainer" class="text-center py-12">
          <h2 class="mb-4">Trainer Not Found</h2>
          <p class="text-gray-600 mb-6">The trainer you're looking for doesn't exist.</p>
          <router-link to="/" class="btn btn-h4 btn-primary">Go Home</router-link>
        </div>

        <!-- Trainer Detail -->
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
            
            <!-- Mobile Layout: Image left, name/button right -->
            <div class="md:hidden">
              <div class="grid grid-cols-3 gap-2 mb-3">
                <!-- Trainer Image - Left Side (1/3 width) -->
                <div class="pokemon-image-bg rounded-lg flex items-center justify-center overflow-hidden aspect-square">
                  <img 
                    v-if="trainer.icon" 
                    :src="trainer.icon" 
                    :alt="trainer.trainerName"
                    class="w-full h-full object-contain p-1 sm:p-2"
                    @error="handleImageError"
                  />
                  <div v-else class="text-xl sm:text-2xl font-bold text-gray-400">
                    {{ getTrainerInitial(trainer.trainerName) }}
                  </div>
                </div>
                
                <!-- Trainer Name & Button - Right Side (2/3 width) -->
                <div class="col-span-2 min-w-0">
                  <!-- Trainer Name -->
                  <div class="flex items-center gap-2 flex-wrap mb-2">
                    <h1 class="text-xl sm:text-2xl font-bold truncate">
                      {{ trainer.trainerName }}
                    </h1>
                  </div>

                  <!-- Start Master Set Button -->
                  <div class="mb-2">
                    <button
                      @click="handleStartMasterSetClick"
                      class="btn btn-h5 btn-primary text-sm py-1.5 px-3"
                      :title="!user ? 'Log in to start your master set' : ''"
                    >
                      Start Battleset
                    </button>
                  </div>
                </div>
              </div>

              <!-- Stats - Compact Grid -->
              <div class="grid grid-cols-3 gap-2">
                <div class="card">
                  <div class="card-body p-2 sm:p-3">
                    <p class="text-[10px] sm:text-xs uppercase tracking-wide mb-0.5 sm:mb-1" style="color: var(--color-text-tertiary);">Cards</p>
                    <p class="text-lg sm:text-xl font-bold" style="color: var(--color-text-primary);">{{ cards.length + japaneseCards.length }}</p>
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
              <!-- Trainer Image -->
              <div class="w-48 h-48 pokemon-image-bg rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                <img 
                  v-if="trainer.icon" 
                  :src="trainer.icon" 
                  :alt="trainer.trainerName"
                  class="w-full h-full object-contain p-4"
                  @error="handleImageError"
                />
                <div v-else class="text-6xl font-bold text-gray-400">
                  {{ getTrainerInitial(trainer.trainerName) }}
                </div>
              </div>

              <!-- Trainer Info -->
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h1>
                    {{ trainer.trainerName }}
                  </h1>
                </div>

                <!-- Start Master Set Button -->
                <div class="mb-4">
                  <button
                    @click="handleStartMasterSetClick"
                    class="btn btn-h4 btn-primary"
                    :title="!user ? 'Log in to start your master set' : ''"
                  >
                    Start Battleset
                  </button>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  <div class="card">
                    <div class="card-body p-4">
                      <p class="text-xs uppercase tracking-wide mb-1" style="color: var(--color-text-tertiary);">Total Cards</p>
                      <p class="text-2xl font-bold" style="color: var(--color-text-primary);">{{ cards.length + japaneseCards.length }}</p>
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
                v-model="filterCardType"
                class="px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-2 flex-1 sm:flex-none min-w-0"
                style="border-color: var(--color-border);"
              >
                <option value="all">All Cards</option>
                <option value="trainer">Trainers Only</option>
              </select>
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
            <div v-if="isLoadingCards && isAppShell" class="py-10 flex justify-center">
              <LoadingSpinner variant="brand" text="Loading cards…" container-class="w-full max-w-sm" />
            </div>
            <div v-else-if="isLoadingCards" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-1.5 sm:gap-2 md:gap-4">
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
              <p class="text-gray-600">No cards found for this trainer.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Card Detail Modal -->
    <CardModal
      :card="selectedCard"
      @close="selectedCard = null"
      @toggle-collected="(card) => toggleCollected(card.id)"
      @login="promptCardLogin"
    />

    <!-- Success Notification -->
    <SuccessNotification
      :show="showSuccessNotification"
      title="Master Set Created!"
      message="Redirecting to your master set..."
      @close="showSuccessNotification = false"
    />

    <!-- Login Modal -->
    <LoginModal
      :show="showLoginModal"
      :show-master-set-on-success="loginFromMasterSetButton"
      @close="showLoginModal = false; loginFromMasterSetButton = false"
      @success-with-master-set="handleLoginSuccess"
      @success="loginFromMasterSetButton = false"
    />

    <!-- Start Master Set Modal -->
    <StartMasterSetModal
      :show="showStartMasterSetModal"
      type="trainer"
      :trainer="trainer"
      :english-card-count="cards.length"
      :japanese-card-count="japaneseCards.length"
      :is-creating="isCreatingMasterSet"
      @close="showStartMasterSetModal = false"
      @create="handleCreateMasterSet"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { getTrainerById } from '../utils/firebaseTrainers'
import { useAuth } from '../composables/useAuth'
import { useAppShell } from '../app/composables/useAppShell'
import {
  useLoginPrompt,
  consumeMasterSetLoginIntent,
  MASTER_SET_LOGIN_INTENT_KEY
} from '../app/composables/useLoginPrompt'
import { getIsNativeApp } from '../app/composables/useIsNativeApp'
import { toggleCardCollected, getCollectedCardIds } from '../utils/userCards'
import PokemonCard from '../components/PokemonCard.vue'
import CardModal from '../components/CardModal.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import SuccessNotification from '../components/SuccessNotification.vue'
import LoginModal from '../components/LoginModal.vue'
import StartMasterSetModal from '../components/StartMasterSetModal.vue'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const { isAppShell } = useAppShell()
const { requestLogin } = useLoginPrompt()

const promptCardLogin = () => {
  if (!requestLogin()) showLoginModal.value = true
}
const trainerId = route.params.trainerId
const trainer = ref(null)
const cards = ref([])
const isLoading = ref(false)
const isLoadingCards = ref(false)
const selectedCard = ref(null)
const filterCardType = ref('all')
const filterLanguage = ref('all')
const filterSet = ref('')
const filterRarity = ref('')
const collectedCards = ref(new Set())
const japaneseCards = ref([])
const showStartMasterSetModal = ref(false)
const loginFromMasterSetButton = ref(false)
const showLoginModal = ref(false)
const isCreatingMasterSet = ref(false)
const showSuccessNotification = ref(false)

const getTrainerInitial = (name) => {
  return name?.charAt(0).toUpperCase() || '?'
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

const selectCard = (card) => {
  selectedCard.value = card
}

// Check if trainer name appears as a standalone word in text
const containsTrainerName = (text, trainerName) => {
  if (!text || !trainerName) return false
  
  // Create a regex that matches the trainer name as a whole word
  // Use word boundaries to ensure it's not part of another word
  const regex = new RegExp(`\\b${trainerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
  return regex.test(text)
}

const uniqueSets = computed(() => {
  const sets = new Set()
  cards.value.forEach(card => {
    const setName = typeof card.set === 'object' ? card.set?.name : card.set
    if (setName) sets.add(setName)
  })
  japaneseCards.value.forEach(card => {
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
  japaneseCards.value.forEach(card => {
    if (card.rarity) rarities.add(card.rarity)
  })
  return Array.from(rarities).sort()
})

const filteredCards = computed(() => {
  // Combine English and Japanese cards
  let allCards = [...cards.value, ...japaneseCards.value]

  // Filter by card type (Trainer vs All)
  if (filterCardType.value === 'trainer') {
    allCards = allCards.filter(card => {
      const category = card.category || card.cardType || card.supertype
      return category === 'Trainer'
    })
  }
  // If 'all', keep all cards

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

const loadTrainer = async () => {
  isLoading.value = true
  try {
    const trainerData = await getTrainerById(trainerId)
    
    if (trainerData) {
      trainer.value = trainerData
      await loadCards()
    } else {
      trainer.value = null
    }
  } catch (error) {
    console.error('Error loading trainer:', error)
    trainer.value = null
  } finally {
    isLoading.value = false
  }
}

const loadCards = async () => {
  if (!trainer.value || !trainer.value.trainerName) {
    return
  }
  
  isLoadingCards.value = true
  try {
    const trainerName = trainer.value.trainerName
    
    // Load all cards from both collections
    const [cardsEnSnapshot, cardsJaSnapshot] = await Promise.all([
      getDocs(collection(db, 'card_en')),
      getDocs(collection(db, 'card_ja'))
    ])
    
    // Filter cards that contain the trainer name as a standalone word
    const allCardsEn = cardsEnSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      language: 'en',
      collection: 'card_en'
    }))
    
    const allCardsJa = cardsJaSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      language: 'ja',
      collection: 'card_ja'
    }))
    
    // Filter cards where trainer name appears in card name, illustrator, or artist fields
    cards.value = allCardsEn.filter(card => {
      return containsTrainerName(card.name, trainerName) ||
             containsTrainerName(card.illustrator, trainerName) ||
             containsTrainerName(card.artist, trainerName)
    })
    
    japaneseCards.value = allCardsJa.filter(card => {
      return containsTrainerName(card.name, trainerName) ||
             containsTrainerName(card.illustrator, trainerName) ||
             containsTrainerName(card.artist, trainerName)
    })
    
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

// Handle master set creation from modal
const handleCreateMasterSet = async (formData) => {
  if (!user.value) {
    alert('Please log in to create a master set')
    router.push('/login')
    return
  }

  if (!formData.name.trim()) {
    alert('Please enter a master set name')
    return
  }

  if (formData.languages.length === 0) {
    alert('Please select at least one language')
    return
  }

  if (!trainer.value || !trainer.value.id) {
    alert('No trainer data found')
    return
  }

  isCreatingMasterSet.value = true

  try {
    // Get card IDs for selected languages
    const cardIds = {
      card_en: cards.value.filter(c => formData.languages.includes('en')).map(c => c.id),
      card_ja: japaneseCards.value.filter(c => formData.languages.includes('ja')).map(c => c.id)
    }

    if (cardIds.card_en.length === 0 && cardIds.card_ja.length === 0) {
      alert('No cards found for this trainer in the selected languages')
      isCreatingMasterSet.value = false
      return
    }

    // Create master set (simplified - you may need to update masterSetUtils to support trainers)
    // For now, we'll create a basic master set structure
    const masterSetData = {
      name: formData.name,
      description: formData.description,
      type: 'trainer',
      targetTrainerId: trainer.value.id,
      targetTrainerName: trainer.value.trainerName,
      languages: formData.languages,
      createdBy: user.value.uid
    }

    // TODO: Update masterSetUtils to support trainer master sets
    // For now, show a message
    alert('Trainer master sets coming soon!')
    isCreatingMasterSet.value = false
    showStartMasterSetModal.value = false
  } catch (error) {
    console.error('Error creating master set:', error)
    alert('Error creating master set: ' + error.message)
  } finally {
    isCreatingMasterSet.value = false
  }
}

const handleStartMasterSetClick = () => {
  if (!user.value) {
    if (getIsNativeApp()) {
      sessionStorage.setItem(MASTER_SET_LOGIN_INTENT_KEY, '1')
      router.push({ path: '/login', query: { redirect: route.fullPath } })
      return
    }
    loginFromMasterSetButton.value = true
    showLoginModal.value = true
    return
  }
  showStartMasterSetModal.value = true
}

const handleLoginSuccess = async () => {
  // Refresh page data after login
  if (trainer.value) {
    await loadCards()
    await loadCollectedStatus()
  }
  // Now show the master set modal
  showStartMasterSetModal.value = true
}

// Update page title when trainer loads
watch(trainer, (newTrainer) => {
  if (newTrainer) {
    const trainerName = newTrainer.trainerName || 'Trainer'
    document.title = `${trainerName} — PULL TCG`
  }
}, { immediate: true })

// Watch for user changes
watch(() => user.value, async (newUser) => {
  if (newUser && consumeMasterSetLoginIntent()) {
    showStartMasterSetModal.value = true
  }
  if (newUser && cards.value.length > 0) {
    await loadCollectedStatus()
  } else {
    collectedCards.value.clear()
  }
})

// Watch for route parameter changes to scroll to top when navigating between trainers
watch(() => route.params.trainerId, () => {
  window.scrollTo(0, 0)
})

onMounted(() => {
  // Scroll to top when component mounts
  window.scrollTo(0, 0)
  loadTrainer()
})
</script>
