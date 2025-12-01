<template>
  <div class="min-h-screen" style="background-color: var(--color-bg-primary);">
    <section class="section section-spacing-md">
      <div class="section-container">
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-12">
          <p class="text-gray-600">Loading challenge details...</p>
        </div>

        <!-- Challenge Not Found -->
        <div v-else-if="!challengeData" class="card">
          <div class="card-body text-center py-12">
            <h2 class="mb-4">Challenge Not Found</h2>
            <p class="text-gray-600 mb-6">The challenge you're looking for doesn't exist.</p>
            <router-link to="/profile" class="btn btn-h4 btn-primary">Back to Profile</router-link>
          </div>
        </div>

        <!-- Challenge Details -->
        <div v-else>
          <!-- Header -->
          <div class="section-header mb-6">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div v-if="!isEditingName" class="flex items-center gap-3">
                  <h2>{{ challengeData.name }}</h2>
                  <button
                    v-if="isCreator"
                    @click="isEditingName = true"
                    class="text-gray-400 hover:text-gray-600"
                    title="Edit challenge name"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
                <div v-else class="flex items-center gap-2">
                  <input
                    v-model="editingName"
                    type="text"
                    class="text-2xl border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    @keyup.enter="saveChallengeName"
                    @keyup.esc="cancelEditName"
                  />
                  <button
                    @click="saveChallengeName"
                    class="text-green-600 hover:text-green-700"
                    title="Save"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    @click="cancelEditName"
                    class="text-gray-400 hover:text-gray-600"
                    title="Cancel"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div v-if="!isEditingDescription" class="mt-2">
                  <p class="section-subtitle" v-if="challengeData.description">{{ challengeData.description }}</p>
                  <button
                    v-if="isCreator && !challengeData.description"
                    @click="isEditingDescription = true"
                    class="text-sm text-gray-400 hover:text-gray-600 mt-1"
                  >
                    + Add description
                  </button>
                  <button
                    v-else-if="isCreator"
                    @click="isEditingDescription = true"
                    class="text-gray-400 hover:text-gray-600 ml-2"
                    title="Edit description"
                  >
                    <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
                <div v-else class="mt-2">
                  <textarea
                    v-model="editingDescription"
                    rows="2"
                    class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="Add a description..."
                    @keyup.ctrl.enter="saveChallengeDescription"
                    @keyup.esc="cancelEditDescription"
                  ></textarea>
                  <div class="mt-1 flex gap-2">
                    <button
                      @click="saveChallengeDescription"
                      class="text-sm text-green-600 hover:text-green-700"
                    >
                      Save
                    </button>
                    <button
                      @click="cancelEditDescription"
                      class="text-sm text-gray-400 hover:text-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                <div class="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div class="flex gap-2">
                    <button
                      v-if="isCreator"
                      @click="showInviteModal = true"
                      class="btn btn-h4 btn-primary"
                    >
                      + Invite
                    </button>
                    <router-link to="/profile" class="btn btn-h4 btn-ghost hidden sm:inline-flex">
                      ← Back
                    </router-link>
                  </div>
                </div>
              </div>
              <div class="flex gap-2 ml-4 hidden sm:flex">
                <router-link to="/profile" class="btn btn-h4 btn-ghost">
                  ← Back
                </router-link>
              </div>
            </div>
          </div>

          <!-- Invite Modal -->
          <div v-if="showInviteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="showInviteModal = false">
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" @click.stop>
              <h3 class="mb-4">Invite to Challenge</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    v-model="inviteEmail"
                    type="email"
                    placeholder="friend@example.com"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    @keyup.enter="sendInvite"
                  />
                </div>
                <div class="flex gap-2 justify-end">
                  <button
                    @click="showInviteModal = false"
                    class="btn btn-h5 btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    @click="sendInvite"
                    class="btn btn-h5 btn-primary"
                    :disabled="!inviteEmail || isSendingInvite"
                  >
                    {{ isSendingInvite ? 'Sending...' : 'Send Invite' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Master Set Summary -->
          <div class="card mb-6">
            <div class="card-body">
              <h3 class="mb-4">Master Set Summary</h3>
              <div v-if="challengeData.type === 'set' && challengeData.targetSetName" class="mb-4">
                <p class="text-lg font-medium">Set: {{ challengeData.targetSetName }}</p>
              </div>
              <div v-else-if="challengeData.type === 'pokemon' && challengeData.targetPokemonName" class="mb-4">
                <p class="text-lg font-medium">Pokemon: {{ challengeData.targetPokemonName }}</p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="assignment in memberAssignments"
                  :key="assignment.id"
                  class="border border-gray-200 rounded-lg p-4"
                >
                  <div class="flex items-start justify-between mb-2">
                    <p class="font-medium text-gray-900 dark:text-gray-100">
                      {{ assignment.userName || assignment.email || 'Unknown User' }}
                    </p>
                    <span v-if="assignment.userId === user?.uid" class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">You</span>
                  </div>
                  <div class="mt-2">
                    <div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{{ assignment.progress || 0 }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        class="bg-gray-900 dark:bg-green-500 h-2 rounded-full transition-all duration-300"
                        :style="{ width: `${assignment.progress || 0}%` }"
                      ></div>
                    </div>
                    <div class="flex items-center justify-between text-xs text-gray-500 mt-1">
                      <span>{{ assignment.collected || 0 }} / {{ assignment.total || 0 }} cards</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Swimlanes: Cards Progress -->
          <div class="card">
            <div class="card-body">
              <h3 class="mb-6">Card Progress</h3>
              
              <!-- Each member gets a swimlane -->
              <div
                v-for="assignment in memberAssignments"
                :key="assignment.id"
                class="mb-8 last:mb-0"
              >
                <!-- Member Header -->
                <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                  <div>
                    <h4>
                      {{ assignment.userName || assignment.email || 'Unknown User' }}
                      <span v-if="assignment.userId === user?.uid" class="text-sm font-normal text-gray-500">(You)</span>
                    </h4>
                    <p class="text-sm text-gray-600 mt-1">
                      <span v-if="assignment.type === 'pokemon' && assignment.pokemonName">
                        Master Setting: {{ assignment.pokemonName }}
                      </span>
                      <span v-else-if="assignment.type === 'set' && assignment.setName">
                        Master Setting: {{ assignment.setName }}
                      </span>
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-2xl font-bold text-gray-900">
                      {{ assignment.collected || 0 }} / {{ assignment.total || 0 }}
                    </p>
                    <p class="text-sm text-gray-600">{{ assignment.progress || 0 }}% Complete</p>
                  </div>
                </div>

                <!-- Filters (only show for your own assignment) -->
                <div v-if="assignment.userId === user?.uid && assignment.cards && assignment.cards.length > 0" class="mb-4 flex gap-4 flex-wrap">
                  <select
                    v-model="filterStatus[assignment.id]"
                    class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="all">All Cards</option>
                    <option value="checked">Have</option>
                    <option value="unchecked">Need</option>
                  </select>
                  <input
                    v-model="searchQuery[assignment.id]"
                    type="text"
                    placeholder="Search cards..."
                    class="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <!-- Cards Grid Container (scrollable, max 4 rows) -->
                  <div
                  v-if="getFilteredCards(assignment).length > 0" 
                  class="cards-scroll-container max-h-[600px] sm:max-h-[500px] overflow-y-auto overflow-x-hidden pr-2"
                >
                  <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3 pb-2">
                    <PokemonCardMS
                    v-for="card in getFilteredCards(assignment)"
                    :key="card.id"
                      :card="card"
                      :is-collected="card.isCollected"
                      :show-collection-button="assignment.userId === user?.uid"
                      :show-name-tooltip="true"
                      @click="selectCard(card)"
                      @toggle-collected="assignment.userId === user?.uid ? toggleCard(card, assignment) : null"
                    />
                  </div>
                </div>
                <div v-else class="text-center py-8 text-gray-500">
                  <p v-if="assignment.cards && assignment.cards.length > 0">No cards match your filters.</p>
                  <p v-else>No cards available yet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Card Detail Modal -->
    <CardModal
      v-if="selectedCard"
      :card="selectedCard"
      :is-collected="selectedCard ? memberAssignments.find(a => a.userId === user?.uid)?.cards?.find(c => c.id === selectedCard.id)?.isCollected || false : false"
      @close="selectedCard = null"
      @toggle-collected="selectedCard ? toggleCard(selectedCard, memberAssignments.find(a => a.userId === user?.uid)) : null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { collection, getDocs, query, where, doc, getDoc, setDoc, addDoc, updateDoc, serverTimestamp, FieldPath } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../composables/useAuth'
import { getCollectedCardIds, toggleCardCollected } from '../utils/userCards'
import PokemonCardMS from '../components/PokemonCardMS.vue'
import CardModal from '../components/CardModal.vue'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()

const challengeId = route.params.challengeId || route.params.masterSetId
const isMasterSet = !!route.params.masterSetId
const challengeData = ref(null)
const memberAssignments = ref([])
const isLoading = ref(false)
const filterStatus = ref({}) // Per assignment: { assignmentId: 'all' | 'checked' | 'unchecked' }
const searchQuery = ref({}) // Per assignment: { assignmentId: 'search term' }
const isEditingName = ref(false)
const editingName = ref('')
const isEditingDescription = ref(false)
const editingDescription = ref('')
const showInviteModal = ref(false)
const inviteEmail = ref('')
const isSendingInvite = ref(false)

// Poké Ball icon paths (static assets from public folder)
const pokeballIconPath = '/pokeball.svg'
const pokeballWhiteIconPath = '/pokeball_white.svg'
const pokeballFillIconPath = '/pokeball_fill.svg'

// Check for dark mode preference
const isDarkMode = ref(false)

// Check for dark mode preference on mount
onMounted(() => {
  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
  isDarkMode.value = darkModeQuery.matches
  
  // Listen for changes
  darkModeQuery.addEventListener('change', (e) => {
    isDarkMode.value = e.matches
  })
})

// Computed property for pokeball icon based on collection status and dark mode
const getPokeballIcon = (isCollected) => {
  if (isCollected) {
    return pokeballFillIconPath
  }
  return isDarkMode.value ? pokeballWhiteIconPath : pokeballIconPath
}

const isCreator = computed(() => {
  return challengeData.value?.createdBy === user.value?.uid
})

const loadChallengeDetails = async () => {
  if (!challengeId) return
  
  isLoading.value = true
  try {
    // Load master set or challenge data
    const collectionName = isMasterSet ? 'masterSets' : 'challenges'
    const dataRef = doc(db, collectionName, challengeId)
    const dataSnap = await getDoc(dataRef)
    
    if (!dataSnap.exists()) {
      challengeData.value = null
      isLoading.value = false
      return
    }
    
    challengeData.value = { id: dataSnap.id, ...dataSnap.data() }
    
    // Load ALL assignments for this master set/challenge
    const assignmentsRef = collection(db, 'assignments')
    const assignmentsQuery = query(
      assignmentsRef, 
      where(isMasterSet ? 'masterSetId' : 'challengeId', '==', challengeId)
    )
    const assignmentsSnapshot = await getDocs(assignmentsQuery)
    
    const assignments = []
    
    // Process each assignment document (one per member)
    for (const assignmentDoc of assignmentsSnapshot.docs) {
      const assignmentData = assignmentDoc.data()
      
      // Get user name if userId exists
      let userName = null
      if (assignmentData.userId) {
        try {
          const userRef = doc(db, 'users', assignmentData.userId)
          const userSnap = await getDoc(userRef)
          if (userSnap.exists()) {
            userName = userSnap.data().displayName || userSnap.data().email
          }
        } catch (error) {
          console.error('Error loading user:', error)
        }
      }
      
      // Get Pokemon/Set name (use stored name or fetch)
      let pokemonName = assignmentData.pokemonName || null
      let setName = assignmentData.setName || null
      
      if (!pokemonName && assignmentData.type === 'pokemon' && assignmentData.pokemonId) {
        try {
          const pokemonListRef = doc(db, 'pokemonList', assignmentData.pokemonId)
          const pokemonListSnap = await getDoc(pokemonListRef)
          if (pokemonListSnap.exists()) {
            pokemonName = pokemonListSnap.data().name
          }
        } catch (error) {
          console.error('Error loading Pokemon:', error)
        }
      }
      
      if (!setName && assignmentData.type === 'set' && assignmentData.setId) {
        try {
          const setRef = doc(db, 'sets', assignmentData.setId)
          const setSnap = await getDoc(setRef)
          if (setSnap.exists()) {
            setName = setSnap.data().name
          }
        } catch (error) {
          console.error('Error loading Set:', error)
        }
      }
      
      // Load cards using pre-calculated card IDs from assignment
      // Assignments store card_en and card_ja arrays with Firestore document IDs
      let allCards = []
      
      const cardEnIds = assignmentData.card_en || []
      const cardJaIds = assignmentData.card_ja || []
      
      // Debug: Log what we're working with
      console.log(`Assignment ${assignmentDoc.id} card IDs:`, {
        cardEnIds: cardEnIds.slice(0, 5), // First 5 for debugging
        cardEnTotal: cardEnIds.length,
        cardJaIds: cardJaIds.slice(0, 5),
        cardJaTotal: cardJaIds.length
      })
      
      // Fallback: check for old cardIds format
      const hasOldFormat = cardEnIds.length === 0 && cardJaIds.length === 0 && assignmentData.cardIds
      
      if (cardEnIds.length > 0 || cardJaIds.length > 0 || hasOldFormat) {
        // Load English cards from card_en collection
        // card_en array stores the 'id' field values (like "me02-045"), not Firestore document IDs
        if (cardEnIds.length > 0) {
          const cardEnRef = collection(db, 'card_en')
          
          // Query in batches (Firestore 'in' query limit is 10)
          const batchSize = 10
          let foundCount = 0
          let notFoundCount = 0
          
          for (let i = 0; i < cardEnIds.length; i += batchSize) {
            const batch = cardEnIds.slice(i, i + batchSize)
            try {
              // Query by 'id' field
              const q = query(cardEnRef, where('id', 'in', batch))
              const snapshot = await getDocs(q)
              
              const batchCards = snapshot.docs.map(doc => {
                foundCount++
                const cardData = doc.data()
                // Preserve the original id field value before overriding
                const originalCardId = cardData.id || cardData.apiId
                return {
                  ...cardData,
                  id: doc.id, // Override with Firestore document ID (for consistency with rest of app)
                  cardId: originalCardId, // Preserve original card id field (like "me02-045")
                  language: 'en'
                }
              })
              
              allCards.push(...batchCards)
              
              // Track which IDs weren't found (compare card's original 'id' field value)
              const foundCardIds = new Set(batchCards.map(c => c.cardId || c.id || c.apiId).filter(Boolean))
              batch.forEach(cardId => {
                if (!foundCardIds.has(cardId)) {
                  notFoundCount++
                  console.warn(`Card not found in card_en with id="${cardId}"`)
                }
              })
            } catch (error) {
              console.error(`Error querying batch of English cards:`, error)
              notFoundCount += batch.length
            }
          }
          console.log(`Loaded ${foundCount} English cards, ${notFoundCount} not found`)
        }
        
        // Load Japanese cards from card_ja collection
        // card_ja array stores the 'id' field values, not Firestore document IDs
        if (cardJaIds.length > 0) {
          const cardJaRef = collection(db, 'card_ja')
          
          // Query in batches (Firestore 'in' query limit is 10)
          const batchSize = 10
          let foundCount = 0
          let notFoundCount = 0
          
          for (let i = 0; i < cardJaIds.length; i += batchSize) {
            const batch = cardJaIds.slice(i, i + batchSize)
            try {
              // Query by 'id' field
              const q = query(cardJaRef, where('id', 'in', batch))
              const snapshot = await getDocs(q)
              
              const batchCards = snapshot.docs.map(doc => {
                foundCount++
                const cardData = doc.data()
                // Preserve the original id field value before overriding
                const originalCardId = cardData.id || cardData.apiId
                return {
                  ...cardData,
                  id: doc.id, // Override with Firestore document ID (for consistency with rest of app)
                  cardId: originalCardId, // Preserve original card id field
                  language: 'ja'
                }
              })
          
          allCards.push(...batchCards)
              
              // Track which IDs weren't found (compare card's original 'id' field value)
              const foundCardIds = new Set(batchCards.map(c => c.cardId || c.id || c.apiId).filter(Boolean))
              batch.forEach(cardId => {
                if (!foundCardIds.has(cardId)) {
                  notFoundCount++
                  console.warn(`Card not found in card_ja with id="${cardId}"`)
                }
              })
            } catch (error) {
              console.error(`Error querying batch of Japanese cards:`, error)
              notFoundCount += batch.length
            }
          }
          console.log(`Loaded ${foundCount} Japanese cards, ${notFoundCount} not found`)
        }
        
        // Fallback for old format
        if (hasOldFormat && assignmentData.cardIds.length > 0) {
          const batchSize = 50
          for (let i = 0; i < assignmentData.cardIds.length; i += batchSize) {
            const batch = assignmentData.cardIds.slice(i, i + batchSize)
            const batchPromises = batch.map(async (cardId) => {
              // Try card_en first, then card_ja
              let cardRef = doc(db, 'card_en', cardId)
              let cardSnap = await getDoc(cardRef)
              let language = 'en'
              
              if (!cardSnap.exists()) {
                cardRef = doc(db, 'card_ja', cardId)
                cardSnap = await getDoc(cardRef)
                language = 'ja'
              }
              
              if (cardSnap.exists()) {
                return {
                  id: cardSnap.id,
                  language,
                  ...cardSnap.data()
                }
              }
              return null
            })
            const batchCards = (await Promise.all(batchPromises)).filter(card => card !== null)
            allCards.push(...batchCards)
          }
        }
      } else {
        // Fallback for old assignments that don't have card_en/card_ja stored
        // Try to query by assignment type
        if (assignmentData.type === 'set' && assignmentData.setId) {
          // Query card_en collection
          const cardEnRef = collection(db, 'card_en')
          const qEn = query(cardEnRef, where('setId', '==', assignmentData.setId))
          const snapshotEn = await getDocs(qEn)
          const cardsEn = snapshotEn.docs.map(doc => ({
            id: doc.id,
            language: 'en',
            ...doc.data()
          }))
          
          // Query card_ja collection
          const cardJaRef = collection(db, 'card_ja')
          const qJa = query(cardJaRef, where('setId', '==', assignmentData.setId))
          const snapshotJa = await getDocs(qJa)
          const cardsJa = snapshotJa.docs.map(doc => ({
            id: doc.id,
            language: 'ja',
            ...doc.data()
          }))
          
          allCards = [...cardsEn, ...cardsJa]
        } else if (assignmentData.type === 'pokemon' && assignmentData.assignmentPokemonId) {
          // Query by nationalDexNumber
          const cardEnRef = collection(db, 'card_en')
          const qEn = query(cardEnRef, where('nationalDexNumber', '==', parseInt(assignmentData.assignmentPokemonId)))
          const snapshotEn = await getDocs(qEn)
          const cardsEn = snapshotEn.docs.map(doc => ({
            id: doc.id,
            language: 'en',
            ...doc.data()
          }))
          
          const cardJaRef = collection(db, 'card_ja')
          const qJa = query(cardJaRef, where('nationalDexNumber', '==', parseInt(assignmentData.assignmentPokemonId)))
          const snapshotJa = await getDocs(qJa)
          const cardsJa = snapshotJa.docs.map(doc => ({
                id: doc.id,
            language: 'ja',
                ...doc.data()
              }))
          
          allCards = [...cardsEn, ...cardsJa]
        }
      }
      
      // Load global collected status from userCards for this user
      // userCards stores cardId as API ID (like "me02-013"), not Firestore document ID
      let collectedCardFirestoreIds = new Set()
      if (assignmentData.userId && allCards.length > 0) {
        // Get API IDs from cards (the cardId field we preserved, or fallback to id/apiId)
        const apiIds = allCards.map(c => {
          // Use the card's API ID field (the original id field we preserved as cardId)
          return c.cardId || c.id || c.apiId
        }).filter(Boolean)
        
        console.log(`Querying userCards for userId: ${assignmentData.userId}, API IDs:`, apiIds.slice(0, 5))
        
        // Query userCards collection by userId and cardId field (which stores API IDs)
        const userCardsRef = collection(db, 'userCards')
        const collectedApiIds = new Set()
        
        // Query in batches (Firestore 'in' query limit is 10)
        const batchSize = 10
        for (let i = 0; i < apiIds.length; i += batchSize) {
          const batch = apiIds.slice(i, i + batchSize)
          try {
            const q = query(
              userCardsRef,
          where('userId', '==', assignmentData.userId),
              where('cardId', 'in', batch)
        )
            const snapshot = await getDocs(q)
            snapshot.docs.forEach(doc => {
          const data = doc.data()
              if (data.cardId) {
                collectedApiIds.add(data.cardId)
              }
            })
          } catch (error) {
            console.error(`Error querying userCards batch:`, error)
          }
        }
        
        console.log(`Found ${collectedApiIds.size} collected cards out of ${apiIds.length} total`)
        console.log(`Collected API IDs:`, Array.from(collectedApiIds).slice(0, 5))
        
        // Map collected API IDs back to Firestore document IDs for card matching
        allCards.forEach(card => {
          const apiId = card.cardId || card.id || card.apiId
          if (apiId && collectedApiIds.has(apiId)) {
            collectedCardFirestoreIds.add(card.id) // card.id is Firestore document ID
          }
        })
      }
      
      // Debug logging
      console.log(`Assignment ${assignmentDoc.id}:`, {
        cardEnCount: cardEnIds.length,
        cardJaCount: cardJaIds.length,
        loadedCardsCount: allCards.length,
        collectedCount: collectedCardFirestoreIds.size,
        userId: assignmentData.userId
      })
      
      // Merge card data with collected status
      const cards = allCards.map(card => {
        const isCollected = collectedCardFirestoreIds.has(card.id)
        if (isCollected) {
          console.log(`Card ${card.id} (${card.name || card.cardId}) is collected`)
        }
        return {
        ...card,
          isCollected
        }
      })
      
      // Sort cards: uncollected first, then by set number
      cards.sort((a, b) => {
        if (a.isCollected !== b.isCollected) {
          return a.isCollected ? 1 : -1 // Uncollected first
        }
        const numA = parseInt(a.localId || a.setNumber || a.number || '0') || 0
        const numB = parseInt(b.localId || b.setNumber || b.number || '0') || 0
        return numA - numB
      })
      
      const total = cards.length
      const collected = cards.filter(c => c.isCollected).length
      const progress = total > 0 ? Math.round((collected / total) * 100) : 0
      
      console.log(`Final assignment stats: ${collected} / ${total} cards collected (${progress}%)`)
      
      assignments.push({
        id: assignmentDoc.id,
        userId: assignmentData.userId,
        email: assignmentData.email,
        userName: userName || assignmentData.email || 'Unknown User',
        type: assignmentData.type,
        pokemonId: assignmentData.pokemonId,
        pokemonName,
        setId: assignmentData.setId,
        setName,
        cards,
        collected,
        total,
        progress
      })
    }
    
    memberAssignments.value = assignments
  } catch (error) {
    console.error('Error loading challenge details:', error)
  } finally {
    isLoading.value = false
  }
}

const getFilteredCards = (assignment) => {
  if (!assignment.cards || assignment.cards.length === 0) return []
  
  let filtered = assignment.cards
  
  // Status filter
  const status = filterStatus.value[assignment.id] || 'all'
  if (status === 'checked') {
    filtered = filtered.filter(c => c.isCollected)
  } else if (status === 'unchecked') {
    filtered = filtered.filter(c => !c.isCollected)
  }
  
  // Search filter
  const query = searchQuery.value[assignment.id] || ''
  if (query) {
    const lowerQuery = query.toLowerCase()
    filtered = filtered.filter(card =>
      card.name?.toLowerCase().includes(lowerQuery) ||
      card.localId?.toLowerCase().includes(lowerQuery)
    )
  }
  
  return filtered
}

const toggleCard = async (card, assignment) => {
  if (!user.value || assignment.userId !== user.value.uid) {
    alert('You can only update your own collection')
    return
  }
  
  try {
    // Toggle card in global userCards collection
    const result = await toggleCardCollected(user.value.uid, card.id)
    
    if (result.success) {
      // Update local state
      card.isCollected = result.isCollected
    
    // Update progress
      if (result.isCollected) {
      assignment.collected = (assignment.collected || 0) + 1
    } else {
      assignment.collected = Math.max(0, (assignment.collected || 0) - 1)
    }
    assignment.progress = assignment.total > 0 
      ? Math.round((assignment.collected / assignment.total) * 100) 
      : 0
    } else {
      alert('Error: ' + result.error)
    }
  } catch (error) {
    console.error('Error toggling card:', error)
    alert('Error updating collection')
  }
}

const saveChallengeName = async () => {
  if (!isCreator.value || !editingName.value.trim()) return
  
  try {
    const challengeRef = doc(db, 'challenges', challengeId)
    await updateDoc(challengeRef, {
      name: editingName.value.trim(),
      updatedAt: serverTimestamp()
    })
    challengeData.value.name = editingName.value.trim()
    isEditingName.value = false
  } catch (error) {
    console.error('Error updating challenge name:', error)
    alert('Error updating challenge name: ' + error.message)
  }
}

const cancelEditName = () => {
  editingName.value = challengeData.value?.name || ''
  isEditingName.value = false
}

const saveChallengeDescription = async () => {
  if (!isCreator.value) return
  
  try {
    const challengeRef = doc(db, 'challenges', challengeId)
    await updateDoc(challengeRef, {
      description: editingDescription.value.trim(),
      updatedAt: serverTimestamp()
    })
    challengeData.value.description = editingDescription.value.trim()
    isEditingDescription.value = false
  } catch (error) {
    console.error('Error updating challenge description:', error)
    alert('Error updating challenge description: ' + error.message)
  }
}

const cancelEditDescription = () => {
  editingDescription.value = challengeData.value?.description || ''
  isEditingDescription.value = false
}

const sendInvite = async () => {
  if (!inviteEmail.value || !inviteEmail.value.includes('@')) {
    alert('Please enter a valid email address')
    return
  }
  
  if (!user.value || !isCreator.value) {
    alert('Only the challenge creator can invite members')
    return
  }
  
  isSendingInvite.value = true
  try {
    // Check if user already exists
    const usersRef = collection(db, 'users')
    const userQuery = query(usersRef, where('email', '==', inviteEmail.value))
    const userSnapshot = await getDocs(userQuery)
    
    let existingUserId = null
    if (!userSnapshot.empty) {
      existingUserId = userSnapshot.docs[0].id
    }
    
    // Check if already invited or member
    const invitesRef = collection(db, 'invites')
    const existingInviteQuery = query(
      invitesRef,
      where('challengeId', '==', challengeId),
      where('email', '==', inviteEmail.value)
    )
    const existingInviteSnapshot = await getDocs(existingInviteQuery)
    
    if (!existingInviteSnapshot.empty) {
      alert('This email has already been invited to this challenge')
      isSendingInvite.value = false
      return
    }
    
    // Check if already a member
    if (challengeData.value.members && challengeData.value.members.includes(inviteEmail.value)) {
      alert('This email is already a member of this challenge')
      isSendingInvite.value = false
      return
    }
    
    if (existingUserId && challengeData.value.members && challengeData.value.members.includes(existingUserId)) {
      alert('This user is already a member of this challenge')
      isSendingInvite.value = false
      return
    }
    
    // Create invite
    await addDoc(invitesRef, {
      challengeId,
      challengeName: challengeData.value.name,
      invitedBy: user.value.uid,
      invitedByName: user.value.displayName || user.value.email,
      email: inviteEmail.value,
      userId: existingUserId || null,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      acceptedAt: null
    })
    
    alert(`Invite sent to ${inviteEmail.value}!`)
    inviteEmail.value = ''
    showInviteModal.value = false
  } catch (error) {
    console.error('Error sending invite:', error)
    alert('Error sending invite: ' + error.message)
  } finally {
    isSendingInvite.value = false
  }
}


const selectedCard = ref(null)

const selectCard = (card) => {
  selectedCard.value = card
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

onMounted(() => {
  loadChallengeDetails()
})
</script>

<style scoped>
/* Custom scrollbar styling for cards grid */
.cards-scroll-container {
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

.cards-scroll-container::-webkit-scrollbar {
  width: 8px;
}

.cards-scroll-container::-webkit-scrollbar-track {
  background: transparent;
}

.cards-scroll-container::-webkit-scrollbar-thumb {
  background-color: var(--color-border);
  border-radius: 4px;
}

.cards-scroll-container::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-border-hover);
}
</style>

