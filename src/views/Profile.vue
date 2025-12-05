<template>
  <div class="min-h-screen" style="background-color: var(--color-bg-primary);">
    <section class="section section-spacing-md">
      <div class="section-container">
        <div class="section-header">
          <div class="flex justify-between items-start">
            <div>
              <h2>Profile</h2>
              <p class="section-subtitle">{{ user?.displayName || user?.email || 'Your profile' }}</p>
            </div>
            <router-link to="/start" class="btn btn-h4 btn-primary">
              + Start New Master Set
            </router-link>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Master Set Challenges -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Master Set Challenges</h3>
              </div>
              <div class="">
                <div v-if="isLoadingAssignments" class="text-center py-8">
                  <p class="text-gray-600">Loading master sets...</p>
                </div>

                <div v-else-if="allMasterSets.length > 0" class="space-y-4">
                  <div
                    v-for="masterSet in allMasterSets"
                    :key="masterSet.id"
                    class="card card-flat"
                  >
                    <div class="card-body">
                      <!-- Header (always visible) -->
                      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-3">
                        <div class="flex-1 cursor-pointer" @click="toggleMasterSetExpand(masterSet.id)">
                          <div class="flex items-center gap-2">
                            <svg 
                              class="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transition-transform flex-shrink-0"
                              :class="{ 'rotate-90': expandedMasterSets[masterSet.id] }"
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                            <div class="min-w-0 flex-1">
                              <h4 class="text-base sm:text-lg font-semibold mb-0.5 sm:mb-1 truncate">{{ masterSet.name }}</h4>
                              <p class="text-xs sm:text-sm text-gray-600 truncate">
                                <span v-if="masterSet.type === 'set'">{{ masterSet.targetSetName || 'Set' }}</span>
                                <span v-else-if="masterSet.type === 'pokemon'">{{ masterSet.targetPokemonName || 'Pokemon' }}</span>
                                <span v-else>Custom Collection</span>
                              </p>
                            </div>
                          </div>
                        </div>
                        <router-link
                          :to="`/master-set/${masterSet.id}`"
                          class="btn btn-h5 btn-primary w-full sm:w-auto flex-shrink-0"
                          @click.stop
                        >
                          View Details
                        </router-link>
                      </div>
                      
                      <!-- Progress (always visible) -->
                      <div class="mb-3">
                        <div class="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Your Progress</span>
                          <span>{{ masterSet.progress || 0 }}%</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            class="bg-gray-900 dark:bg-green-500 h-2 rounded-full transition-all"
                            :style="{ width: `${masterSet.progress || 0}%` }"
                          ></div>
                        </div>
                        <div class="text-xs text-gray-500 mt-1">
                          {{ masterSet.collected || 0 }} / {{ masterSet.total || 0 }} cards
                        </div>
                      </div>

                      <!-- Cards Preview (collapsible, scrollable, max 4 rows) -->
                      <div 
                        v-if="expandedMasterSets[masterSet.id]"
                        v-show="masterSet.cards && masterSet.cards.length > 0"
                        class="cards-scroll-container max-h-[600px] sm:max-h-[500px] overflow-y-auto overflow-x-hidden pr-2 mt-4"
                      >
                        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3 pb-2">
                          <PokemonCardMS
                            v-for="card in masterSet.cards"
                            :key="card.id"
                            :card="card"
                            :is-collected="card.isCollected"
                            :show-collection-button="true"
                            :show-name-tooltip="true"
                            @click="selectCard(card)"
                            @toggle-collected="(card) => toggleCard(card, masterSet)"
                          />
                        </div>
                      </div>
                      <div v-else-if="expandedMasterSets[masterSet.id] && (!masterSet.cards || masterSet.cards.length === 0)" class="text-center py-4 text-gray-500 text-sm">
                        <p>Loading cards...</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Empty State -->
                <div v-else class="text-center py-8">
                  <p class="text-gray-600 mb-4">No master sets yet</p>
                  <router-link to="/start" class="btn btn-h4 btn-primary">
                    Start Your First Master Set
                  </router-link>
                </div>
              </div>
            </div>

            <!-- My Collection -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">My Collection</h3>
                <p class="card-subtitle">All cards you've marked as collected</p>
              </div>
              <div class="card-body">
                <div v-if="isLoadingCollection" class="text-center py-8">
                  <p class="text-gray-600">Loading collection...</p>
                </div>

                <div v-else-if="collectedCards.length > 0" class="space-y-4">
                  <div class="mb-4">
                    <div class="flex flex-col sm:flex-row gap-2 mb-2">
                      <input
                        v-model="collectionSearchQuery"
                        type="text"
                        placeholder="Search cards..."
                        class="w-full px-3 sm:px-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2"
                        style="border-color: var(--color-border); background-color: var(--color-bg-secondary); color: var(--color-text-primary);"
                      />
                      <select
                        v-model="collectionFilterSet"
                        class="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2"
                        style="border-color: var(--color-border); background-color: var(--color-bg-secondary); color: var(--color-text-primary);"
                      >
                        <option value="">All Sets</option>
                        <option v-for="set in uniqueCollectionSets" :key="set" :value="set">
                          {{ set }}
                        </option>
                      </select>
                    </div>
                    <p class="text-xs text-gray-600 text-right">
                      {{ collectedCards.length }} {{ collectedCards.length === 1 ? 'card' : 'cards' }} collected
                    </p>
                  </div>

                  <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    <PokemonCard
                      v-for="card in filteredCollectionCards"
                      :key="card.id"
                      :card="card"
                      :is-collected="true"
                      :show-collection-icon="false"
                      :show-collected-indicator="true"
                      :compact="true"
                      :show-name-tooltip="true"
                      icon-size="w-6 h-6"
                      @click="selectCard"
                    />
                  </div>
                </div>

                <!-- Empty Collection State -->
                <div v-else class="text-center py-12">
                  <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p class="text-gray-600 mb-2">No cards collected yet</p>
                  <p class="text-sm text-gray-500 mb-4">Start collecting cards by marking them as collected on any card page</p>
                  <router-link to="/browse" class="btn btn-h4 btn-primary">
                    Browse Cards
                  </router-link>
                </div>
              </div>
            </div>

            <!-- Pending Invites -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Pending Invites</h3>
                <p class="card-subtitle">Group invitations waiting for your response</p>
              </div>
              <div class="">
                <div v-if="isLoadingInvites" class="text-center py-8">
                  <p class="text-gray-600">Loading invites...</p>
                </div>

                <div v-else-if="pendingInvites.length > 0" class="space-y-4">
                  <div
                    v-for="invite in pendingInvites"
                    :key="invite.id"
                    class="card card-flat"
                  >
                    <div class="card-body">
                      <div class="flex justify-between items-start mb-3">
                        <div>
                          <h4 class="card-title mb-1">{{ invite.challengeName }}</h4>
                          <p class="text-sm text-gray-600">
                            Invited by {{ invite.invitedByName }}
                          </p>
                        </div>
                        <span class="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                          Pending
                        </span>
                      </div>
                      
                      <div class="flex gap-2">
                        <button
                          @click="acceptInvite(invite)"
                          class="btn btn-h5 btn-primary flex-1"
                          :disabled="isProcessingInvite"
                        >
                          Accept
                        </button>
                        <button
                          @click="declineInvite(invite)"
                          class="btn btn-h5 btn-ghost"
                          :disabled="isProcessingInvite"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Empty Invites State -->
                <div v-else class="text-center py-8">
                  <p class="text-gray-600">No pending invites</p>
                </div>
              </div>
            </div>

          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Profile Info -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Profile Info</h3>
              </div>
              <div class="card-body">
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <p class="text-gray-900 dark:text-gray-100">{{ user?.email || 'Not set' }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trainer Name</label>
                    <div v-if="!isEditingTrainerName" class="flex items-center gap-2">
                      <p class="text-gray-900 dark:text-gray-100 flex-1">{{ user?.displayName || 'Not set' }}</p>
                      <button
                        @click="isEditingTrainerName = true"
                        class="text-sm px-2 py-1 rounded transition-colors"
                        style="color: var(--color-accent);"
                        @mouseenter="$event.target.style.backgroundColor = 'var(--color-bg-secondary)'"
                        @mouseleave="$event.target.style.backgroundColor = 'transparent'"
                      >
                        Edit
                      </button>
                    </div>
                    <div v-else class="flex items-center gap-2">
                      <input
                        v-model="editingTrainerName"
                        type="text"
                        placeholder="Enter trainer name"
                        class="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2"
                        style="border-color: var(--color-border); background-color: var(--color-bg-secondary); color: var(--color-text-primary);"
                        @keyup.enter="saveTrainerName"
                        @keyup.esc="cancelEditTrainerName"
                      />
                      <button
                        @click="saveTrainerName"
                        class="px-3 py-2 text-sm rounded transition-colors"
                        style="background-color: var(--color-accent); color: white;"
                        :disabled="isSavingTrainerName"
                      >
                        {{ isSavingTrainerName ? 'Saving...' : 'Save' }}
                      </button>
                      <button
                        @click="cancelEditTrainerName"
                        class="px-3 py-2 text-sm rounded transition-colors"
                        style="color: var(--color-text-secondary);"
                        :disabled="isSavingTrainerName"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Master Sets</label>
                    <p class="text-gray-900 dark:text-gray-100">{{ allMasterSets.length }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Hearts Section -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title flex items-center gap-2">
                  <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Hearts
                </h3>
              </div>
              <div class="card-body">
                <div v-if="isLoadingHearts" class="text-center py-4">
                  <p style="color: var(--color-text-secondary);">Loading hearts...</p>
                </div>
                <div v-else>
                  <!-- Hearted Pokemon -->
                  <div v-if="heartedPokemon.length > 0" class="mb-6">
                    <h4 class="text-sm font-semibold mb-3" style="color: var(--color-text-primary);">Hearted Pokemon</h4>
                    <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      <div
                        v-for="pokemon in heartedPokemon"
                        :key="pokemon.nationalDexNumber"
                        class="aspect-square rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                        style="background-color: var(--color-bg-tertiary);"
                        @click="$router.push(`/pokemon/${pokemon.nationalDexNumber}`)"
                      >
                        <img
                          v-if="pokemon.spriteUrl"
                          :src="pokemon.spriteUrl"
                          :alt="pokemon.pokemonName"
                          class="w-full h-full object-contain p-1"
                        />
                        <div v-else class="w-full h-full flex items-center justify-center text-xs font-medium" style="color: var(--color-text-tertiary);">
                          #{{ pokemon.nationalDexNumber }}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Hearted Cards -->
                  <div v-if="heartedCards.length > 0">
                    <h4 class="text-sm font-semibold mb-3" style="color: var(--color-text-primary);">Hearted Cards</h4>
                    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      <div
                        v-for="heart in heartedCards"
                        :key="heart.id"
                        class="aspect-[3/4] rounded overflow-hidden cursor-pointer hover:scale-105 transition-transform border-2"
                        style="background-color: var(--color-bg-tertiary); border-color: var(--color-border);"
                        @click="selectHeartedCard(heart)"
                      >
                        <img
                          v-if="heart.cardImageUrl"
                          :src="heart.cardImageUrl"
                          :alt="heart.cardName"
                          class="w-full h-full object-contain"
                        />
                        <div v-else class="w-full h-full flex items-center justify-center text-xs font-medium p-1" style="color: var(--color-text-tertiary);">
                          {{ heart.cardName || 'Card' }}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Empty State -->
                  <div v-if="heartedPokemon.length === 0 && heartedCards.length === 0" class="text-center py-8">
                    <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--color-text-tertiary);">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <p style="color: var(--color-text-secondary);">No hearted items yet</p>
                    <p class="text-xs mt-1" style="color: var(--color-text-tertiary);">Heart Pokemon and cards to see them here</p>
                  </div>
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
      @close="selectedCard = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { collection, getDocs, query, where, doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { db, auth } from '../config/firebase'
import { useAuth } from '../composables/useAuth'
import { getUserCollectedCards, removeCardFromCollection, toggleCardCollected, getCollectedCardIds } from '../utils/userCards'
import { getHeartedPokemon, getHeartedCards } from '../utils/hearts'
import { getPokemonByDexNumber } from '../utils/firebasePokemon'
import PokemonCard from '../components/PokemonCard.vue'
import PokemonCardMS from '../components/PokemonCardMS.vue'
import CardModal from '../components/CardModal.vue'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()

const assignments = ref([])
const allMasterSets = ref([])
const pendingInvites = ref([])
const isLoadingAssignments = ref(false)
const isLoadingInvites = ref(false)
const isProcessingInvite = ref(false)
const collectedCards = ref([])
const heartedPokemon = ref([])
const heartedCards = ref([]) // Array for displaying in Hearts section
const isLoadingHearts = ref(false)
const selectedHeartedCard = ref(null)
const isEditingTrainerName = ref(false)
const editingTrainerName = ref('')
const isSavingTrainerName = ref(false)
const isLoadingCollection = ref(false)
const collectionSearchQuery = ref('')
const collectionFilterSet = ref('')
const selectedCard = ref(null)
const expandedMasterSets = ref({})

const loadAssignments = async () => {
  if (!user.value) return
  
  isLoadingAssignments.value = true
  try {
    const assignmentsRef = collection(db, 'assignments')
    const q = query(
      assignmentsRef,
      where('userId', '==', user.value.uid)
    )
    const snapshot = await getDocs(q)
    
    const masterSetMap = new Map()
    
    // Load all assignments and group by masterSetId
    for (const assignmentDoc of snapshot.docs) {
      const assignmentData = { id: assignmentDoc.id, ...assignmentDoc.data() }
      
      if (!assignmentData.masterSetId) continue
      
      // Load master set if not already loaded
      if (!masterSetMap.has(assignmentData.masterSetId)) {
        try {
          const masterSetRef = doc(db, 'masterSets', assignmentData.masterSetId)
          const masterSetSnap = await getDoc(masterSetRef)
          if (masterSetSnap.exists()) {
            const masterSetData = masterSetSnap.data()
            masterSetMap.set(assignmentData.masterSetId, {
              id: masterSetSnap.id,
              ...masterSetData,
              assignment: assignmentData
            })
          }
        } catch (error) {
          console.error('Error loading master set:', error)
        }
      }
    }
    
    // Load cards for each master set (same way as ChallengeDetails)
    allMasterSets.value = await Promise.all(
      Array.from(masterSetMap.values()).map(async (masterSet) => {
        const assignment = masterSet.assignment
        const cardEnIds = assignment.card_en || []
        const cardJaIds = assignment.card_ja || []
        const allCards = []
        
        // Load English cards
        if (cardEnIds.length > 0) {
          const cardEnRef = collection(db, 'card_en')
          const batchSize = 10
          
          for (let i = 0; i < cardEnIds.length; i += batchSize) {
            const batch = cardEnIds.slice(i, i + batchSize)
            try {
              const q = query(cardEnRef, where('id', 'in', batch))
              const snapshot = await getDocs(q)
              
              const batchCards = snapshot.docs.map(doc => {
                const cardData = doc.data()
                const originalCardId = cardData.id || cardData.apiId
                return {
                  ...cardData,
                  id: doc.id,
                  cardId: originalCardId,
                  language: 'en'
                }
              })
              
              allCards.push(...batchCards)
            } catch (error) {
              console.error(`Error querying batch of English cards:`, error)
            }
          }
        }
        
        // Load Japanese cards
        if (cardJaIds.length > 0) {
          const cardJaRef = collection(db, 'card_ja')
          const batchSize = 10
          
          for (let i = 0; i < cardJaIds.length; i += batchSize) {
            const batch = cardJaIds.slice(i, i + batchSize)
            try {
              const q = query(cardJaRef, where('id', 'in', batch))
              const snapshot = await getDocs(q)
              
              const batchCards = snapshot.docs.map(doc => {
                const cardData = doc.data()
                const originalCardId = cardData.id || cardData.apiId
                return {
                  ...cardData,
                  id: doc.id,
                  cardId: originalCardId,
                  language: 'ja'
                }
              })
              
              allCards.push(...batchCards)
            } catch (error) {
              console.error(`Error querying batch of Japanese cards:`, error)
            }
          }
        }
        
        // Get collected card IDs
        const cardIds = allCards.map(c => c.cardId || c.id).filter(Boolean)
        const collectedCardsSet = await getCollectedCardIds(user.value.uid, cardIds)
        
        // Mark cards as collected
        allCards.forEach(card => {
          card.isCollected = collectedCardsSet.has(card.cardId || card.id)
        })
        
        // Calculate progress
        const collectedCount = Array.from(collectedCardsSet).length
        const totalCards = allCards.length
        const progress = totalCards > 0 ? Math.round((collectedCount / totalCards) * 100) : 0
        
        return {
          ...masterSet,
          cards: allCards,
          collected: collectedCount,
          total: totalCards,
          progress: progress
        }
      })
    )
    
    // Also keep assignments for backwards compatibility
    assignments.value = Array.from(masterSetMap.values()).map(ms => ms.assignment)
  } catch (error) {
    console.error('Error loading assignments:', error)
  } finally {
    isLoadingAssignments.value = false
  }
}


const loadInvites = async () => {
  if (!user.value) return
  
  isLoadingInvites.value = true
  try {
    const invitesRef = collection(db, 'invites')
    // Get invites for this user's email
    const q = query(
      invitesRef,
      where('email', '==', user.value.email),
      where('status', '==', 'pending')
    )
    const snapshot = await getDocs(q)
    
    pendingInvites.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error loading invites:', error)
  } finally {
    isLoadingInvites.value = false
  }
}

const selectCard = (card) => {
  selectedCard.value = card
}

const toggleMasterSetExpand = (masterSetId) => {
  expandedMasterSets.value[masterSetId] = !expandedMasterSets.value[masterSetId]
}

const toggleCard = async (card, masterSet) => {
  if (!user.value) return
  
  try {
    const cardId = card.cardId || card.id
    await toggleCardCollected(user.value.uid, cardId)
    
    // Update local state
    card.isCollected = !card.isCollected
    
    // Recalculate progress
    const collectedCount = masterSet.cards.filter(c => c.isCollected).length
    masterSet.collected = collectedCount
    masterSet.progress = masterSet.total > 0 ? Math.round((collectedCount / masterSet.total) * 100) : 0
  } catch (error) {
    console.error('Error toggling card:', error)
  }
}

// Handle card modal toggle collected (for collection cards)
const handleCardModalToggleCollected = async (card) => {
  if (!user.value) return
  
  try {
    const cardId = card.cardId || card.id
    const result = await toggleCardCollected(user.value.uid, cardId)
    
    if (result.success) {
      // Remove from collection if uncollected
      if (!result.isCollected) {
        collectedCards.value = collectedCards.value.filter(c => c.id !== card.id)
      }
      // Reload collection to refresh
      await loadCollection()
    }
  } catch (error) {
    console.error('Error toggling card from modal:', error)
  }
}

const acceptInvite = async (invite) => {
  if (!user.value) {
    alert('Please log in to accept invites')
    return
  }
  
  isProcessingInvite.value = true
  try {
    // Update invite status
    const inviteRef = doc(db, 'invites', invite.id)
    await updateDoc(inviteRef, {
      status: 'accepted',
      userId: user.value.uid,
      acceptedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    // Update assignment: find by email and update to userId
    const assignmentsRef = collection(db, 'assignments')
    const assignmentsQuery = query(
      assignmentsRef,
      where('masterSetId', '==', invite.masterSetId || invite.challengeId),
      where('email', '==', invite.email)
    )
    const assignmentsSnapshot = await getDocs(assignmentsQuery)
    
    if (!assignmentsSnapshot.empty) {
      const assignmentDoc = assignmentsSnapshot.docs[0]
      await updateDoc(doc(db, 'assignments', assignmentDoc.id), {
        userId: user.value.uid,
        email: null, // Clear email since we now have userId
        status: 'accepted',
        acceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }
    
    // Remove from pending invites
    pendingInvites.value = pendingInvites.value.filter(i => i.id !== invite.id)
    
    // Reload assignments
    await loadAssignments()
    
    alert('Invite accepted! You can now start collecting cards for this master set.')
  } catch (error) {
    console.error('Error accepting invite:', error)
    alert('Error accepting invite: ' + error.message)
  } finally {
    isProcessingInvite.value = false
  }
}

const declineInvite = async (invite) => {
  if (!confirm('Decline this invitation?')) return
  
  isProcessingInvite.value = true
  try {
    const inviteRef = doc(db, 'invites', invite.id)
    await updateDoc(inviteRef, {
      status: 'declined',
      updatedAt: serverTimestamp()
    })
    
    pendingInvites.value = pendingInvites.value.filter(i => i.id !== invite.id)
  } catch (error) {
    console.error('Error declining invite:', error)
    alert('Error declining invite: ' + error.message)
  } finally {
    isProcessingInvite.value = false
  }
}

const loadCollection = async () => {
  if (!user.value) return
  
  isLoadingCollection.value = true
  try {
    // Query userCards collection for current user's userId
    const userCardsRef = collection(db, 'userCards')
    const q = query(userCardsRef, where('userId', '==', user.value.uid))
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      collectedCards.value = []
      return
    }
    
    // Extract card IDs (API IDs like "me02-013")
    const cardIds = snapshot.docs.map(doc => doc.data().cardId).filter(Boolean)
    
    if (cardIds.length === 0) {
      collectedCards.value = []
      return
    }
    
    // Query card_en and card_ja collections for matching card IDs
    const allCards = []
    const userCardsMap = new Map()
    
    // Map userCards data by cardId for quick lookup
    snapshot.docs.forEach(doc => {
      const data = doc.data()
      if (data.cardId) {
        userCardsMap.set(data.cardId, {
          collectedAt: data.collectedAt,
          quantity: data.quantity,
          notes: data.notes
        })
      }
    })
    
    // Load English cards
    const cardEnRef = collection(db, 'card_en')
    const batchSize = 10
    
    for (let i = 0; i < cardIds.length; i += batchSize) {
      const batch = cardIds.slice(i, i + batchSize)
      try {
        const q = query(cardEnRef, where('id', 'in', batch))
        const cardSnapshot = await getDocs(q)
        
        cardSnapshot.docs.forEach(doc => {
          const cardData = doc.data()
          const cardId = cardData.id || cardData.apiId
          const userCardData = userCardsMap.get(cardId)
          
          if (userCardData) {
            allCards.push({
              ...cardData,
              id: doc.id,
              cardId: cardId,
              language: 'en',
              collectedAt: userCardData.collectedAt,
              quantity: userCardData.quantity,
              notes: userCardData.notes
            })
          }
        })
      } catch (error) {
        console.error(`Error querying batch of English cards:`, error)
      }
    }
    
    // Load Japanese cards
    const cardJaRef = collection(db, 'card_ja')
    
    for (let i = 0; i < cardIds.length; i += batchSize) {
      const batch = cardIds.slice(i, i + batchSize)
      try {
        const q = query(cardJaRef, where('id', 'in', batch))
        const cardSnapshot = await getDocs(q)
        
        cardSnapshot.docs.forEach(doc => {
          const cardData = doc.data()
          const cardId = cardData.id || cardData.apiId
          const userCardData = userCardsMap.get(cardId)
          
          if (userCardData) {
            allCards.push({
              ...cardData,
              id: doc.id,
              cardId: cardId,
              language: 'ja',
              collectedAt: userCardData.collectedAt,
              quantity: userCardData.quantity,
              notes: userCardData.notes
            })
          }
        })
      } catch (error) {
        console.error(`Error querying batch of Japanese cards:`, error)
      }
    }
    
    collectedCards.value = allCards
    
    // Load heart status for collection cards
  } catch (error) {
    console.error('Error loading collection:', error)
    collectedCards.value = []
  } finally {
    isLoadingCollection.value = false
  }
}


const uniqueCollectionSets = computed(() => {
  const sets = new Set()
  collectedCards.value.forEach(card => {
    const setName = typeof card.set === 'object' ? card.set?.name : card.set
    if (setName) sets.add(setName)
  })
  return Array.from(sets).sort()
})

const filteredCollectionCards = computed(() => {
  let filtered = collectedCards.value
  
  // Search filter
  if (collectionSearchQuery.value) {
    const query = collectionSearchQuery.value.toLowerCase()
    filtered = filtered.filter(card =>
      card.name?.toLowerCase().includes(query) ||
      card.localId?.toLowerCase().includes(query) ||
      (typeof card.set === 'object' ? card.set?.name : card.set)?.toLowerCase().includes(query)
    )
  }
  
  // Set filter
  if (collectionFilterSet.value) {
    filtered = filtered.filter(card => {
      const setName = typeof card.set === 'object' ? card.set?.name : card.set
      return setName === collectionFilterSet.value
    })
  }
  
  // Sort by collected date (newest first) or by set number
  filtered.sort((a, b) => {
    if (a.collectedAt && b.collectedAt) {
      const dateA = a.collectedAt.toDate ? a.collectedAt.toDate() : new Date(a.collectedAt)
      const dateB = b.collectedAt.toDate ? b.collectedAt.toDate() : new Date(b.collectedAt)
      return dateB - dateA // Newest first
    }
    return 0
  })
  
  return filtered
})

const viewCard = (card) => {
  // Navigate to Pokemon detail page if it's a Pokemon card
  if (card.nationalDexNumber) {
    // Find the pokemonList entry for this card
    const normalizedName = card.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    router.push(`/pokemon/dex-${card.nationalDexNumber}-${normalizedName}`)
  } else {
    // Fallback: navigate to browse page
    router.push('/browse')
  }
}

const removeFromCollection = async (cardId) => {
  if (!user.value) return
  
  try {
    await removeCardFromCollection(user.value.uid, cardId)
    // Reload collection
    await loadCollection()
  } catch (error) {
    console.error('Error removing card from collection:', error)
  }
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

// Load hearted items
const loadHearts = async () => {
  if (!user.value) {
    heartedPokemon.value = []
    heartedCards.value = []
    return
  }
  
  isLoadingHearts.value = true
  try {
    // Load hearted Pokemon
    const pokemonResult = await getHeartedPokemon(user.value.uid)
    if (pokemonResult.success && pokemonResult.data) {
      // Fetch Pokemon details for sprites
      const pokemonPromises = pokemonResult.data.map(async (heart) => {
        const pokemonResult = await getPokemonByDexNumber(heart.nationalDexNumber)
        if (pokemonResult.success && pokemonResult.data) {
          return {
            ...heart,
            spriteUrl: pokemonResult.data.spriteUrl,
            gifUrl: pokemonResult.data.gifUrl,
            displayName: pokemonResult.data.displayName || pokemonResult.data.name
          }
        }
        return heart
      })
      heartedPokemon.value = await Promise.all(pokemonPromises)
    }
    
    // Load hearted Cards
    const cardsResult = await getHeartedCards(user.value.uid)
    if (cardsResult.success && cardsResult.data) {
      // Fetch card details for images
      const cardPromises = cardsResult.data.map(async (heart) => {
        try {
          // Try to get card from card_en or card_ja collections
          const cardEnRef = doc(db, 'card_en', heart.cardId)
          const cardEnSnap = await getDoc(cardEnRef)
          
          if (cardEnSnap.exists()) {
            const cardData = cardEnSnap.data()
            return {
              ...heart,
              cardImageUrl: cardData.imageUrl || cardData.thumbnailUrl || cardData.image
            }
          }
          
          const cardJaRef = doc(db, 'card_ja', heart.cardId)
          const cardJaSnap = await getDoc(cardJaRef)
          
          if (cardJaSnap.exists()) {
            const cardData = cardJaSnap.data()
            return {
              ...heart,
              cardImageUrl: cardData.imageUrl || cardData.thumbnailUrl || cardData.image || cardData.englishImageUrl
            }
          }
          
          return heart
        } catch (error) {
          console.error('Error loading card details:', error)
          return heart
        }
      })
      heartedCards.value = await Promise.all(cardPromises)
    }
  } catch (error) {
    console.error('Error loading hearts:', error)
  } finally {
    isLoadingHearts.value = false
  }
}

const selectHeartedCard = (heart) => {
  // Try to find the card in the database to show in modal
  // For now, just set it for potential modal display
  selectedHeartedCard.value = heart
}


// Watch for user changes
// Save trainer name
const saveTrainerName = async () => {
  if (!user.value) return
  
  isSavingTrainerName.value = true
  try {
    const newName = editingTrainerName.value.trim()
    if (!newName) {
      alert('Trainer name cannot be empty')
      return
    }
    
    // Update Firebase Auth profile
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: newName })
    }
    
    // Update Firestore user document
    const userRef = doc(db, 'users', user.value.uid)
    await updateDoc(userRef, {
      displayName: newName,
      updatedAt: serverTimestamp()
    })
    
    // Update local user state
    user.value.displayName = newName
    
    isEditingTrainerName.value = false
  } catch (error) {
    console.error('Error saving trainer name:', error)
    alert('Error saving trainer name: ' + error.message)
  } finally {
    isSavingTrainerName.value = false
  }
}

// Cancel editing trainer name
const cancelEditTrainerName = () => {
  editingTrainerName.value = user.value?.displayName || ''
  isEditingTrainerName.value = false
}

// Initialize editing trainer name when entering edit mode
watch(isEditingTrainerName, (isEditing) => {
  if (isEditing && user.value) {
    editingTrainerName.value = user.value.displayName || ''
  }
})

watch(() => user.value, (newUser) => {
  if (newUser) {
    loadAssignments()
    loadInvites()
    loadCollection()
    loadHearts()
  } else {
    assignments.value = []
    allMasterSets.value = []
    pendingInvites.value = []
    collectedCards.value = []
  }
}, { immediate: true })

// Update page title
watch(() => route.name, () => {
  if (route.name === 'Profile') {
    document.title = 'PokaPal - Your Profile'
  }
}, { immediate: true })

onMounted(() => {
  if (user.value) {
    loadAssignments()
    loadInvites()
    loadCollection()
    loadHearts()
  }
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

