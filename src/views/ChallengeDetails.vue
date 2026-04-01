<template>
  <div class="min-h-screen" style="background-color: var(--color-bg-primary);">
    <section class="section section-spacing-md challenge-details-section">
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
            <!-- Mobile: stack Back then actions — same rules as desktop (Invite = creator, Delete = admin); avoids clipping under MobileShell overflow-x-hidden -->
            <div class="sm:hidden mb-3 flex flex-col gap-2 mobile-header-actions">
              <router-link to="/profile" class="btn btn-h5 btn-ghost self-start shrink-0">
                ← Back
              </router-link>
              <div class="flex flex-wrap items-center justify-end gap-2">
                <!--
                <button
                  v-if="(isCreator || isAdmin) && challengeData.type === 'pokemon'"
                  @click="syncCards"
                  class="btn btn-h5 btn-secondary"
                  :disabled="isSyncingCards"
                  title="Sync cards - add any new cards that have been added for this Pokemon"
                >
                  {{ isSyncingCards ? 'Syncing...' : '🔄 Sync' }}
                </button>
                -->
                <button
                  v-if="isCreator"
                  type="button"
                  @click="showInviteModal = true"
                  class="btn btn-h5 btn-primary shrink-0"
                >
                  + Invite
                </button>
                <button
                  v-if="isAdmin"
                  type="button"
                  class="btn btn-h5 challenge-detail-delete-btn shrink-0"
                  :disabled="isDeletingChallenge"
                  title="Delete this challenge and related battle data (not your profile card collection)"
                  @click="deleteChallenge"
                >
                  {{ isDeletingChallenge ? 'Deleting…' : 'Delete' }}
                </button>
              </div>
            </div>
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
                  type="button"
                  @click="showInviteModal = true"
                  class="hidden sm:inline-flex btn btn-h4 btn-primary"
                >
                  + Invite
                </button>
                <button
                  v-if="isAdmin"
                  type="button"
                  class="hidden sm:inline-flex btn btn-h4 challenge-detail-delete-btn"
                  :disabled="isDeletingChallenge"
                  title="Delete this challenge and related battle data (not your profile card collection)"
                  @click="deleteChallenge"
                >
                  {{ isDeletingChallenge ? 'Deleting…' : 'Delete' }}
                </button>
                  </div>
                </div>
              </div>
              <div class="hidden sm:flex gap-2 ml-4 flex-shrink-0">
                <router-link to="/profile" class="btn btn-h4 btn-ghost">
                  ← Back
                </router-link>
              </div>
            </div>
          </div>

          <!-- Invite Modal -->
          <div v-if="showInviteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="showInviteModal = false">
            <div
              class="rounded-lg p-6 max-w-md w-full mx-4 border"
              style="background-color: var(--color-bg-secondary); border-color: var(--color-border);"
              @click.stop
            >
              <h3 class="mb-4">Invite to Challenge</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-2" style="color: var(--color-text-primary);">Email Address</label>
                  <input
                    v-model="inviteEmail"
                    type="email"
                    placeholder="friend@example.com"
                    class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
                    style="background-color: var(--color-bg-primary); color: var(--color-text-primary); border-color: var(--color-border);"
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
          <div class="mb-6">
              <!-- Sync (web + app): temporarily hidden — restore block below when re-enabling
                <div class="flex items-start justify-between gap-4 mb-4 flex-wrap">
                  <div class="flex-1 min-w-0"></div>
                  <button v-if="(isCreator || isAdmin) && challengeData.type === 'pokemon'" ...>Sync Cards</button>
                </div>
              -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="assignment in memberAssignments"
                  :key="assignment.id"
                  class="summary-member-card rounded-lg p-4"
                >
                  <div class="flex items-start justify-between mb-2">
                    <div class="min-w-0">
                      <p class="font-medium text-gray-900 dark:text-gray-100">
                        {{ assignment.userName || assignment.email || 'Unknown User' }}
                      </p>
                      <p
                        v-if="assignment.isShared && assignment.sharedMemberNames && assignment.sharedMemberNames.length > 0"
                        class="text-xs mt-0.5 text-gray-600 dark:text-gray-400 truncate"
                      >
                        {{ assignment.sharedMemberNames.join(' · ') }}
                      </p>
                    </div>
                    <span v-if="assignment.userId === user?.uid" class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">You</span>
                  </div>
                  <div class="flex items-center gap-2 min-h-[1.25rem]">
                    <div class="summary-progress-track flex-1 min-w-0 rounded-full h-2">
                      <div
                        class="bg-gray-900 dark:bg-green-500 h-2 rounded-full transition-all duration-300"
                        :style="{ width: `${assignment.progress || 0}%` }"
                      ></div>
                    </div>
                    <span class="text-[0.625rem] sm:text-xs tabular-nums text-gray-600 dark:text-gray-400 shrink-0 leading-none self-center">
                      {{ assignment.collected || 0 }} / {{ assignment.total || 0 }}
                    </span>
                  </div>
                </div>
              </div>
          </div>

          <!-- Swimlanes: Cards Progress -->
          <div>
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
                    <p
                      v-if="assignment.isShared && assignment.sharedMemberNames && assignment.sharedMemberNames.length > 0"
                      class="text-xs text-gray-600 mt-1"
                    >
                      {{ assignment.sharedMemberNames.join(' · ') }}
                    </p>
                    <p class="text-sm text-gray-600 mt-1">
                      <span v-if="assignment.type === 'pokemon' && assignment.pokemonName">
                        Chosen Pokémon: {{ assignment.pokemonName }}
                      </span>
                      <span v-else-if="assignment.type === 'set' && assignment.setName">
                        Chosen Set: {{ assignment.setName }}
                      </span>
                      <span v-else-if="assignment.type === 'generation' && assignment.generationLabel">
                        Chosen Generation: {{ assignment.generationLabel }}
                      </span>
                      <span v-else-if="assignment.type === 'illustrator' && assignment.illustratorName">
                        Chosen Illustrator: {{ assignment.illustratorName }} (illustrator)
                      </span>
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">
                      {{ assignment.collected || 0 }} / {{ assignment.total || 0 }}
                    </p>
                    <p class="text-sm text-gray-600">{{ assignment.progress || 0 }}% Complete</p>
                  </div>
                </div>

                <!-- Filters (only show when you can edit this assignment) -->
                <div v-if="canEditAssignment(assignment) && assignment.cards && assignment.cards.length > 0" class="mb-4 flex items-center gap-2 sm:gap-4 flex-nowrap">
                  <select
                    v-model="filterStatus[assignment.id]"
                    class="w-32 sm:w-auto shrink-0 px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="all">All Cards</option>
                    <option value="checked">Have</option>
                    <option value="unchecked">Need</option>
                  </select>
                  <input
                    v-model="searchQuery[assignment.id]"
                    type="text"
                    placeholder="Search cards..."
                    class="flex-1 min-w-0 px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <!-- Cards: vertical mini-scroll (all breakpoints); multi-column grid -->
                  <div
                  v-if="getFilteredCards(assignment).length > 0"
                  class="cards-scroll-container max-md:max-h-[min(52vh,24rem)] max-md:overflow-y-auto max-md:overflow-x-hidden max-md:px-1 max-md:-mx-1 max-md:touch-pan-y max-md:overscroll-y-contain md:mx-0 md:max-h-[600px] md:overflow-y-auto md:overflow-x-hidden md:px-0 md:touch-auto pr-2"
                >
                  <div
                    class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-8 gap-2 sm:gap-3 pb-2 min-w-0"
                  >
                    <div
                      v-for="card in getFilteredCards(assignment)"
                      :key="card.id"
                      class="challenge-card-slot min-w-0"
                    >
                      <PokemonCardMS
                        :card="card"
                        :is-collected="card.isCollected"
                        :is-globally-collected="Boolean(card.isGloballyCollected)"
                        :show-collection-button="canEditAssignment(assignment)"
                        :show-name-tooltip="true"
                        @click="selectCard(card)"
                        @toggle-collected="canEditAssignment(assignment) ? toggleCard(card, assignment) : null"
                      />
                    </div>
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
    </section>

    <!-- Card Detail Modal -->
    <CardModal
      v-if="selectedCard"
      :card="selectedCard"
      @close="selectedCard = null"
      @collection-changed="handleModalCollectionChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { collection, getDocs, query, where, doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../composables/useAuth'
import { useAdmin } from '../composables/useAdmin'
import { toggleCardCollected } from '../utils/userCards'
import { syncPokemonMasterSetCards, getSharedCollectedCardIds, toggleSharedAssignmentCard } from '../utils/masterSetUtils'
import PokemonCardMS from '../components/PokemonCardMS.vue'
import CardModal from '../components/CardModal.vue'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const { isAdmin } = useAdmin()

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
const isSyncingCards = ref(false)
const isDeletingChallenge = ref(false)

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

/** Challenge doc `targetSetName` is copied from the first player only; battles can use different sets per person. */
const summarySetDisplay = computed(() => {
  const cd = challengeData.value
  if (!cd || cd.type !== 'set') return null
  const assignments = memberAssignments.value || []
  const names = []
  const seen = new Set()
  for (const a of assignments) {
    if (a.type !== 'set' || !a.setName) continue
    const n = String(a.setName).trim()
    if (!n || seen.has(n)) continue
    seen.add(n)
    names.push(n)
  }
  if (names.length === 0) {
    return cd.targetSetName ? { mode: 'single', value: cd.targetSetName } : null
  }
  if (names.length === 1) return { mode: 'single', value: names[0] }
  return { mode: 'multiple', values: names }
})

/** Same idea for Pokémon / trainer master battles with different targets per player. */
const summaryPokemonDisplay = computed(() => {
  const cd = challengeData.value
  if (!cd || cd.type !== 'pokemon') return null
  const assignments = memberAssignments.value || []
  const names = []
  const seen = new Set()
  for (const a of assignments) {
    if (a.type !== 'pokemon' || !a.pokemonName) continue
    const n = String(a.pokemonName).trim()
    if (!n || seen.has(n)) continue
    seen.add(n)
    names.push(n)
  }
  if (names.length === 0) {
    return cd.targetPokemonName ? { mode: 'single', value: cd.targetPokemonName } : null
  }
  if (names.length === 1) return { mode: 'single', value: names[0] }
  return { mode: 'multiple', values: names }
})

const canEditAssignment = (assignment) => {
  if (!user.value || !assignment) return false
  if (assignment.isShared) {
    const memberIds = assignment.memberIds || challengeData.value?.memberIds || []
    return memberIds.includes(user.value.uid)
  }
  return assignment.userId === user.value.uid
}

const getCollectedApiIdsForUser = async (userId, apiIds) => {
  if (!userId || !apiIds?.length) return new Set()
  const userCardsRef = collection(db, 'userCards')
  const collectedApiIds = new Set()
  const batchSize = 10

  for (let i = 0; i < apiIds.length; i += batchSize) {
    const batch = apiIds.slice(i, i + batchSize)
    try {
      const q = query(
        userCardsRef,
        where('userId', '==', userId),
        where('cardId', 'in', batch)
      )
      const snapshot = await getDocs(q)
      snapshot.docs.forEach((snap) => {
        const data = snap.data()
        if (data.cardId) collectedApiIds.add(data.cardId)
      })
    } catch (error) {
      console.error('Error querying userCards batch:', error)
    }
  }

  return collectedApiIds
}

const loadChallengeDetails = async () => {
  if (!challengeId) return
  
  isLoading.value = true
  try {
    const userNameCache = new Map()
    const getUserDisplayName = async (uid) => {
      if (!uid) return null
      if (userNameCache.has(uid)) return userNameCache.get(uid)
      try {
        const userRef = doc(db, 'users', uid)
        const userSnap = await getDoc(userRef)
        const value = userSnap.exists()
          ? (userSnap.data().displayName || userSnap.data().email || null)
          : null
        userNameCache.set(uid, value)
        return value
      } catch (error) {
        console.error('Error loading user:', error)
        userNameCache.set(uid, null)
        return null
      }
    }

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
        userName = await getUserDisplayName(assignmentData.userId)
      }

      let sharedMemberNames = []
      if (assignmentData.isShared) {
        const ids = assignmentData.memberIds || challengeData.value?.memberIds || []
        const resolved = await Promise.all(ids.map((uid) => getUserDisplayName(uid)))
        sharedMemberNames = Array.from(new Set(resolved.filter(Boolean)))
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
          // Query by both direct nationalDexNumber and dexId[] to include multi-Pokemon cards (Tag Team, etc.)
          const dexNumber = parseInt(assignmentData.assignmentPokemonId)

          if (!isNaN(dexNumber)) {
            const loadCardsForLanguage = async (collectionName, language) => {
              const cardsRef = collection(db, collectionName)
              const [directSnapshot, multiSnapshot] = await Promise.all([
                getDocs(query(cardsRef, where('nationalDexNumber', '==', dexNumber))),
                getDocs(query(cardsRef, where('dexId', 'array-contains', dexNumber)))
              ])

              const uniqueCards = Array.from(
                new Map(
                  [...directSnapshot.docs, ...multiSnapshot.docs].map((docSnap) => [docSnap.id, docSnap])
                ).values()
              )

              return uniqueCards.map((docSnap) => ({
                id: docSnap.id,
                language,
                ...docSnap.data()
              }))
            }

            const [cardsEn, cardsJa] = await Promise.all([
              loadCardsForLanguage('card_en', 'en'),
              loadCardsForLanguage('card_ja', 'ja')
            ])

            allCards = [...cardsEn, ...cardsJa]
          } else {
            allCards = []
          }
        }
      }
      
      const apiIds = allCards.map((c) => c.cardId || c.id || c.apiId).filter(Boolean)

      // Load collected status from shared assignment context OR assignment owner's userCards
      let collectedCardFirestoreIds = new Set()
      if (assignmentData.isShared && allCards.length > 0) {
        const sharedCollectedApiIds = await getSharedCollectedCardIds(assignmentDoc.id)

        allCards.forEach(card => {
          const apiId = card.cardId || card.id || card.apiId
          if (apiId && sharedCollectedApiIds.has(apiId)) {
            collectedCardFirestoreIds.add(card.id)
          }
        })
      } else if (assignmentData.userId && allCards.length > 0) {
        const collectedApiIds = await getCollectedApiIdsForUser(assignmentData.userId, apiIds)

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
      
      // Also load signed-in user's global collection so card tiles can show personal state
      const myGlobalCollectedApiIds = user.value?.uid && apiIds.length > 0
        ? await getCollectedApiIdsForUser(user.value.uid, apiIds)
        : new Set()

      // Merge card data with collected status
      // Use reactive refs to ensure Vue tracks changes
      const cards = allCards.map(card => {
        const cardApiId = card.cardId || card.id || card.apiId
        const isCollected = collectedCardFirestoreIds.has(card.id)
        // Create a new object with isCollected property to ensure reactivity
        return {
          ...card,
          isCollected,
          isGloballyCollected: Boolean(cardApiId && myGlobalCollectedApiIds.has(cardApiId))
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
        userName: assignmentData.isShared ? 'Shared Checklist' : (userName || assignmentData.email || 'Unknown User'),
        isShared: Boolean(assignmentData.isShared),
        memberIds: assignmentData.memberIds || [],
        sharedMemberNames,
        type: assignmentData.type,
        pokemonId: assignmentData.pokemonId,
        pokemonName,
        setId: assignmentData.setId,
        setName,
        generationKey: assignmentData.generationKey || null,
        generationLabel: assignmentData.generationLabel || null,
        illustratorName: assignmentData.illustratorName || null,
        cards,
        collected,
        total,
        progress
      })
    }
    
    memberAssignments.value = assignments
    // Ensure filter dropdowns always render with a visible default value.
    const nextFilterStatus = {}
    assignments.forEach((assignment) => {
      nextFilterStatus[assignment.id] = filterStatus.value[assignment.id] || 'all'
    })
    filterStatus.value = nextFilterStatus
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
  if (!user.value || !canEditAssignment(assignment)) {
    alert('You do not have permission to update this checklist')
    return
  }
  
  try {
    const cardApiId = card.cardId || card.apiId || card.id
    let result
    if (assignment.isShared) {
      result = await toggleSharedAssignmentCard({
        assignmentId: assignment.id,
        masterSetId: challengeId,
        userId: user.value.uid,
        cardId: cardApiId,
        cardCollection: card.language === 'ja' ? 'card_ja' : 'card_en',
        language: card.language || 'en'
      })
    } else {
      result = await toggleCardCollected(user.value.uid, cardApiId)
    }
    
    if (result.success) {
      // Update local state - ensure reactivity by updating the card object
      // Find the card in the assignment's cards array and update it
      const cardIndex = assignment.cards.findIndex(c => c.id === card.id)
      if (cardIndex !== -1) {
        // Update the card in the array to trigger reactivity
        assignment.cards[cardIndex].isCollected = result.isCollected
        // Also update the card reference passed to component
        card.isCollected = result.isCollected
      } else {
        // Fallback: update card directly
        card.isCollected = result.isCollected
      }

      // Keep personal/global icon in sync across all lanes for this card
      memberAssignments.value.forEach((lane) => {
        lane.cards?.forEach((laneCard) => {
          const laneCardApiId = laneCard.cardId || laneCard.apiId || laneCard.id
          if (laneCardApiId === cardApiId) {
            laneCard.isGloballyCollected = result.isCollected
          }
        })
      })
    
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

const syncCards = async () => {
  if ((!isCreator.value && !isAdmin.value) || !challengeId || challengeData.value?.type !== 'pokemon') {
    return
  }
  
  if (!confirm('This will sync all cards for this Pokemon master set. Any new cards that have been added will be added to all assignments. Continue?')) {
    return
  }
  
  isSyncingCards.value = true
  try {
    const result = await syncPokemonMasterSetCards(challengeId)
    
    if (result.success) {
      if (result.addedCards > 0) {
        alert(`Successfully synced cards! Added ${result.addedCards} new card(s) to all assignments.`)
        // Reload the challenge data to show new cards
        await loadChallengeDetails()
      } else {
        alert('All cards are already up to date!')
      }
    } else {
      alert('Error syncing cards: ' + result.error)
    }
  } catch (error) {
    console.error('Error syncing cards:', error)
    alert('Error syncing cards: ' + error.message)
  } finally {
    isSyncingCards.value = false
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
    
    // Check if already a member (legacy + masterSet together fields)
    const memberEmails = challengeData.value.memberEmails || challengeData.value.members || []
    if (memberEmails.includes(inviteEmail.value)) {
      alert('This email is already a member of this challenge')
      isSendingInvite.value = false
      return
    }
    
    const memberIds = challengeData.value.memberIds || []
    if (existingUserId && memberIds.includes(existingUserId)) {
      alert('This user is already a member of this challenge')
      isSendingInvite.value = false
      return
    }
    
    // Create invite
    await addDoc(invitesRef, {
      masterSetId: isMasterSet ? challengeId : null,
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

const deleteChallenge = async () => {
  if (!isAdmin.value || !challengeId) return

  const label = isMasterSet ? 'master set' : 'challenge'
  const confirmed = confirm(
    `Delete this ${label}? This removes the ${label}, assignments, invites, and battle progress for this ${label}. ` +
      'Cards in your personal collection (profile) are not removed. This cannot be undone.'
  )
  if (!confirmed) return

  isDeletingChallenge.value = true
  try {
    // Remove assignments and challenge-scoped collectedCards only. userCards (global profile collection) is never deleted.
    const assignmentsRef = collection(db, 'assignments')
    const assignmentsQuery = query(
      assignmentsRef,
      where(isMasterSet ? 'masterSetId' : 'challengeId', '==', challengeId)
    )
    const assignmentsSnapshot = await getDocs(assignmentsQuery)

    for (const assignmentDoc of assignmentsSnapshot.docs) {
      const collectedRef = collection(db, 'collectedCards')
      const collectedQuery = query(collectedRef, where('assignmentId', '==', assignmentDoc.id))
      const collectedSnapshot = await getDocs(collectedQuery)
      await Promise.all(collectedSnapshot.docs.map((snap) => deleteDoc(doc(db, 'collectedCards', snap.id))))
      await deleteDoc(doc(db, 'assignments', assignmentDoc.id))
    }

    // Remove collectedCards linked directly by masterSet/challenge id
    const collectedRef = collection(db, 'collectedCards')
    const collectedMasterSetQuery = query(collectedRef, where('masterSetId', '==', challengeId))
    const collectedMasterSetSnapshot = await getDocs(collectedMasterSetQuery)
    await Promise.all(collectedMasterSetSnapshot.docs.map((snap) => deleteDoc(doc(db, 'collectedCards', snap.id))))

    // Remove invites linked to this challenge/master set
    const invitesRef = collection(db, 'invites')
    const inviteQueries = [
      query(invitesRef, where('challengeId', '==', challengeId)),
      query(invitesRef, where('masterSetId', '==', challengeId))
    ]
    const [invitesByChallenge, invitesByMasterSet] = await Promise.all(inviteQueries.map((q) => getDocs(q)))
    const inviteIds = new Set([
      ...invitesByChallenge.docs.map((d) => d.id),
      ...invitesByMasterSet.docs.map((d) => d.id)
    ])
    await Promise.all(Array.from(inviteIds).map((inviteId) => deleteDoc(doc(db, 'invites', inviteId))))

    // Remove the main challenge/master set document
    await deleteDoc(doc(db, isMasterSet ? 'masterSets' : 'challenges', challengeId))

    alert(`${label.charAt(0).toUpperCase() + label.slice(1)} deleted.`)
    router.push('/profile')
  } catch (error) {
    console.error(`Error deleting ${label}:`, error)
    alert(`Error deleting ${label}: ${error.message}`)
  } finally {
    isDeletingChallenge.value = false
  }
}


const selectedCard = ref(null)

const selectCard = (card) => {
  selectedCard.value = card
}

const handleModalCollectionChange = ({ card, isCollected }) => {
  // CardModal only toggles global userCards — it must not update another player's
  // challenge row. Previously we updated the *first* assignment containing the card,
  // which could be someone else's swimlane.
  const cardApiId = card.cardId || card.apiId || card.id

  // Modal toggles global userCards, so update personal icon everywhere this card appears
  memberAssignments.value.forEach((assignment) => {
    assignment.cards?.forEach((assignmentCard) => {
      const assignmentCardApiId = assignmentCard.cardId || assignmentCard.apiId || assignmentCard.id
      if (assignmentCardApiId === cardApiId) {
        assignmentCard.isGloballyCollected = isCollected
      }
    })
  })

  for (const assignment of memberAssignments.value) {
    if (assignment.isShared) {
      // Shared checklist uses collectedCards, not global userCards — modal Collect does not change it
      continue
    }
    if (assignment.userId !== user.value?.uid) continue

    const cardIndex = assignment.cards.findIndex(c =>
      c.id === card.id ||
      (c.cardId || c.apiId) === cardApiId ||
      c.id === cardApiId
    )

    if (cardIndex === -1) continue

    assignment.cards[cardIndex].isCollected = isCollected
    const collected = assignment.cards.filter((c) => c.isCollected).length
    assignment.collected = collected
    assignment.progress = assignment.total > 0
      ? Math.round((collected / assignment.total) * 100)
      : 0

    if (selectedCard.value) {
      const selectedCardApiId = selectedCard.value.cardId || selectedCard.value.apiId || selectedCard.value.id
      if (selectedCard.value.id === card.id || selectedCardApiId === cardApiId) {
        selectedCard.value.isCollected = isCollected
      }
    }
    break
  }
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

onMounted(() => {
  loadChallengeDetails()
})
</script>

<style scoped>
.challenge-details-section :deep(.section-container) {
  padding-left: 1rem !important;
  padding-right: 1rem !important;
}

@media (min-width: 640px) {
  .challenge-details-section :deep(.section-container) {
    padding-left: 1.25rem !important;
    padding-right: 1.25rem !important;
  }
}

.challenge-detail-delete-btn {
  background-color: transparent;
  color: #dc2626;
  border: 1.5px solid #dc2626;
  box-shadow: none;
}

.challenge-detail-delete-btn:hover:not(:disabled) {
  background-color: rgba(220, 38, 38, 0.08);
  color: #b91c1c;
  border-color: #b91c1c;
}

.challenge-detail-delete-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.28);
}

:global(html.dark) .challenge-detail-delete-btn {
  color: #f87171;
  border-color: #f87171;
}

:global(html.dark) .challenge-detail-delete-btn:hover:not(:disabled) {
  background-color: rgba(248, 113, 113, 0.12);
  color: #fca5a5;
  border-color: #fca5a5;
}

.summary-progress-track {
  background-color: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
}

:global(html.dark) .summary-progress-track {
  background-color: rgb(55 65 81); /* gray-700 */
  border-color: transparent;
}

/* Custom scrollbar styling for cards grid */
.cards-scroll-container {
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
  -webkit-overflow-scrolling: touch;
}

.cards-scroll-container::-webkit-scrollbar {
  width: 8px;
  height: 6px;
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

.summary-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
  background: color-mix(in srgb, var(--color-bg-tertiary) 95%, var(--color-accent) 5%);
  border: 1px solid color-mix(in srgb, var(--color-border) 88%, var(--color-accent) 12%);
}

.summary-member-card {
  background: color-mix(in srgb, var(--color-bg-tertiary) 97%, var(--color-accent) 3%);
  border: 1px solid color-mix(in srgb, var(--color-border) 92%, var(--color-accent) 8%);
}

@media (max-width: 640px) {
  .mobile-header-actions .btn {
    padding: 0.35rem 0.65rem !important;
    font-size: 0.84rem !important;
    line-height: 1.1 !important;
    min-height: 2rem;
  }

  .summary-member-card {
    padding: 0.85rem;
    border-width: 1px;
  }
}
</style>

