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
                <p class="text-sm text-gray-600 mt-2">
                  Invite Code: <span class="font-mono font-bold">{{ challengeData.inviteCode }}</span>
                  <button
                    @click="copyInviteCode"
                    class="ml-2 text-xs text-gray-500 hover:text-gray-700"
                  >
                    Copy
                  </button>
                </p>
              </div>
              <div class="flex gap-2 ml-4">
                <button
                  v-if="isCreator"
                  @click="showInviteModal = true"
                  class="btn btn-h4 btn-primary"
                >
                  + Invite
                </button>
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

          <!-- Members & Assignments Overview -->
          <div class="card mb-6">
            <div class="card-body">
              <h3 class="mb-4">Members & Assignments</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="assignment in memberAssignments"
                  :key="assignment.id"
                  class="border border-gray-200 rounded-lg p-4"
                >
                  <div class="flex items-start justify-between mb-2">
                    <p class="font-medium text-gray-900">
                      {{ assignment.userName || assignment.email || 'Unknown User' }}
                    </p>
                    <span v-if="assignment.userId === user?.uid" class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">You</span>
                  </div>
                  <div v-if="assignment.type === 'pokemon' && assignment.pokemonName" class="text-sm text-gray-600 mb-2">
                    <span class="font-medium">Pokemon:</span> {{ assignment.pokemonName }}
                  </div>
                  <div v-else-if="assignment.type === 'set' && assignment.setName" class="text-sm text-gray-600 mb-2">
                    <span class="font-medium">Set:</span> {{ assignment.setName }}
                  </div>
                  <div class="mt-2">
                    <div class="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{{ assignment.progress || 0 }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div
                        class="bg-gray-900 h-2 rounded-full transition-all duration-300"
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

                <!-- Cards Grid -->
                <div v-if="getFilteredCards(assignment).length > 0" class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                  <div
                    v-for="card in getFilteredCards(assignment)"
                    :key="card.id"
                    class="relative aspect-square bg-gray-100 rounded overflow-hidden border-2 transition-all"
                    :class="[
                      card.checkedOff ? 'border-gray-400 opacity-60' : 'border-gray-200',
                      assignment.userId === user?.uid ? 'cursor-pointer hover:border-gray-400' : ''
                    ]"
                    :title="card.name"
                    @click="assignment.userId === user?.uid ? toggleCard(card, assignment) : null"
                  >
                    <img
                      v-if="card.imageUrl || card.thumbnailUrl"
                      :src="card.imageUrl || card.thumbnailUrl"
                      :alt="card.name"
                      class="w-full h-full object-contain"
                      @error="handleImageError"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <!-- Checkmark Overlay (assignment-specific) -->
                    <div
                      v-if="card.checkedOff"
                      class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                    >
                      <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <!-- Card Number Badge -->
                    <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 text-center truncate flex items-center justify-center">
                      <span class="flex-1">{{ card.localId || card.number || '' }}</span>
                      <!-- Poké Ball Icon (always show for your assignment) -->
                      <div
                        v-if="assignment.userId === user?.uid"
                        class="cursor-pointer hover:scale-110 transition-transform ml-1"
                        @click.stop="toggleGlobalCollected(card.id)"
                        :title="card.isCollected ? 'In your collection - Click to remove' : 'Click to add to collection'"
                      >
                        <img
                          :src="getPokeballIcon(card.isCollected)"
                          alt="Poké Ball"
                          class="w-3 h-3"
                        />
                      </div>
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
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { collection, getDocs, query, where, doc, getDoc, setDoc, addDoc, updateDoc, serverTimestamp, FieldPath } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../composables/useAuth'
import { getCollectedCardIds, toggleCardCollected } from '../utils/userCards'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()

const challengeId = route.params.challengeId
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
    // Load challenge data
    const challengeRef = doc(db, 'challenges', challengeId)
    const challengeSnap = await getDoc(challengeRef)
    
    if (!challengeSnap.exists()) {
      challengeData.value = null
      isLoading.value = false
      return
    }
    
    challengeData.value = { id: challengeSnap.id, ...challengeSnap.data() }
    
    // Load ALL assignments for this challenge
    const assignmentsRef = collection(db, 'assignments')
    const assignmentsQuery = query(assignmentsRef, where('challengeId', '==', challengeId))
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
      
      // Load cards using pre-calculated cardIds from assignment
      const pokemonRef = collection(db, 'pokemon')
      let allCards = []
      
      // Use stored cardIds if available (new assignments), otherwise fallback to querying
      const cardIds = assignmentData.cardIds || []
      
      if (cardIds.length > 0) {
        // Use pre-calculated cardIds - fetch documents directly by ID
        // This is more efficient than queries and avoids rate limits
        // Process in batches to avoid overwhelming Firestore
        const batchSize = 50 // Process 50 at a time
        const batches = []
        for (let i = 0; i < cardIds.length; i += batchSize) {
          batches.push(cardIds.slice(i, i + batchSize))
        }
        
        // Process batches sequentially to avoid quota issues
        for (const batch of batches) {
          const batchPromises = batch.map(cardId => {
            const cardRef = doc(db, 'pokemon', cardId)
            return getDoc(cardRef)
          })
          
          const batchSnapshots = await Promise.all(batchPromises)
          const batchCards = batchSnapshots
            .filter(snap => snap.exists())
            .map(snap => ({
              id: snap.id,
              ...snap.data()
            }))
          
          allCards.push(...batchCards)
        }
      } else {
        // Fallback for old assignments that don't have cardIds stored
        if (assignmentData.type === 'set' && assignmentData.setId) {
          const q = query(pokemonRef, where('setId', '==', assignmentData.setId))
          const snapshot = await getDocs(q)
          allCards = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        } else if (assignmentData.type === 'pokemon' && assignmentData.pokemonId) {
          const pokemonListRef = doc(db, 'pokemonList', assignmentData.pokemonId)
          const pokemonListDoc = await getDoc(pokemonListRef)
          
          if (pokemonListDoc.exists()) {
            const pokemonListData = pokemonListDoc.data()
            const fallbackCardIds = pokemonListData.cardIds || []
            
            const chunks = []
            for (let i = 0; i < fallbackCardIds.length; i += 10) {
              chunks.push(fallbackCardIds.slice(i, i + 10))
            }
            
            const cardPromises = chunks.map(chunk => {
              const q = query(pokemonRef, where(FieldPath.documentId(), 'in', chunk))
              return getDocs(q)
            })
            
            const cardSnapshots = await Promise.all(cardPromises)
            allCards = cardSnapshots.flatMap(snapshot => 
              snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }))
            )
          }
        }
      }
      
      // Load checked cards from collectorList (assignment-specific)
      let checkedCards = new Map()
      if (assignmentData.userId) {
        const collectorListRef = collection(db, 'collectorList')
        const collectorListQuery = query(
          collectorListRef,
          where('userId', '==', assignmentData.userId),
          where('assignmentId', '==', assignmentDoc.id)
        )
        const collectorListSnapshot = await getDocs(collectorListQuery)
        collectorListSnapshot.docs.forEach(doc => {
          const data = doc.data()
          checkedCards.set(data.cardId, data.checkedOff)
        })
      }
      
      // Load global collected status from userCards (if viewing own assignment)
      let globalCollectedCards = new Set()
      if (assignmentData.userId === user.value?.uid && allCards.length > 0) {
        const cardIds = allCards.map(c => c.id)
        globalCollectedCards = await getCollectedCardIds(assignmentData.userId, cardIds)
      }
      
      // Merge card data with checked status (assignment) and global collected status
      const cards = allCards.map(card => ({
        ...card,
        checkedOff: checkedCards.get(card.id) || false, // Assignment-specific
        isCollected: globalCollectedCards.has(card.id) // Global collection
      }))
      
      // Sort cards: unchecked first, then by set number
      cards.sort((a, b) => {
        if (a.checkedOff !== b.checkedOff) {
          return a.checkedOff ? 1 : -1 // Unchecked first
        }
        const numA = parseInt(a.setNumber || a.number || '0') || 0
        const numB = parseInt(b.setNumber || b.number || '0') || 0
        return numA - numB
      })
      
      const total = cards.length
      const collected = cards.filter(c => c.checkedOff).length
      const progress = total > 0 ? Math.round((collected / total) * 100) : 0
      
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
    filtered = filtered.filter(c => c.checkedOff)
  } else if (status === 'unchecked') {
    filtered = filtered.filter(c => !c.checkedOff)
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
  if (!user.value || !assignment.id) {
    alert('Please log in to update your collection')
    return
  }
  
  const newCheckedState = !card.checkedOff
  
  try {
    // Update local state immediately
    card.checkedOff = newCheckedState
    
    // Update progress
    if (newCheckedState) {
      assignment.collected = (assignment.collected || 0) + 1
    } else {
      assignment.collected = Math.max(0, (assignment.collected || 0) - 1)
    }
    assignment.progress = assignment.total > 0 
      ? Math.round((assignment.collected / assignment.total) * 100) 
      : 0
    
    // Create or update collectorList entry
    const collectorListRef = collection(db, 'collectorList')
    const collectorListQuery = query(
      collectorListRef,
      where('userId', '==', user.value.uid),
      where('assignmentId', '==', assignment.id),
      where('cardId', '==', card.id)
    )
    const collectorListSnapshot = await getDocs(collectorListQuery)
    
    const collectorData = {
      userId: user.value.uid,
      assignmentId: assignment.id,
      challengeId: challengeId,
      cardId: card.id,
      checkedOff: newCheckedState,
      checkedOffAt: newCheckedState ? serverTimestamp() : null,
      quantity: newCheckedState ? 1 : 0,
      notes: '',
      updatedAt: serverTimestamp()
    }
    
    if (!collectorListSnapshot.empty) {
      // Update existing entry
      const collectorDoc = collectorListSnapshot.docs[0]
      await setDoc(doc(db, 'collectorList', collectorDoc.id), collectorData, { merge: true })
    } else {
      // Create new entry
      collectorData.createdAt = serverTimestamp()
      await addDoc(collectorListRef, collectorData)
    }
    
    // Also update global userCards collection if marking as collected
    if (newCheckedState) {
      try {
        const { markCardAsCollected } = await import('../utils/userCards')
        await markCardAsCollected(user.value.uid, card.id, 1)
        // Update local isCollected status
        card.isCollected = true
      } catch (error) {
        console.error('Error updating global collection:', error)
        // Don't fail the whole operation if global update fails
      }
    }
  } catch (error) {
    console.error('Error updating card:', error)
    // Revert on error
    card.checkedOff = !newCheckedState
    alert('Error updating card: ' + error.message)
  }
}

const toggleGlobalCollected = async (cardId) => {
  if (!user.value) {
    alert('Please log in to update your collection')
    return
  }
  
  try {
    const result = await toggleCardCollected(user.value.uid, cardId)
    if (result.success) {
      // Update the card's isCollected status in all assignments
      memberAssignments.value.forEach(assignment => {
        if (assignment.cards) {
          const card = assignment.cards.find(c => c.id === cardId)
          if (card) {
            card.isCollected = result.isCollected
          }
        }
      })
    } else {
      alert('Error: ' + result.error)
    }
  } catch (error) {
    console.error('Error toggling global collected status:', error)
    alert('Error updating collection: ' + error.message)
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

const copyInviteCode = async () => {
  if (challengeData.value?.inviteCode) {
    try {
      await navigator.clipboard.writeText(challengeData.value.inviteCode)
      alert('Invite code copied to clipboard!')
    } catch (error) {
      console.error('Error copying invite code:', error)
    }
  }
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

onMounted(() => {
  loadChallengeDetails()
})

// Watch for editing state changes
watch(() => challengeData.value?.name, (newName) => {
  if (newName) {
    editingName.value = newName
  }
})

watch(() => challengeData.value?.description, (newDesc) => {
  if (newDesc !== undefined) {
    editingDescription.value = newDesc || ''
  }
})
</script>

