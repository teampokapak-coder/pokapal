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
                      <div class="flex justify-between items-start mb-3">
                        <div class="flex-1 cursor-pointer" @click="toggleMasterSetExpand(masterSet.id)">
                          <div class="flex items-center gap-2">
                            <svg 
                              class="w-5 h-5 text-gray-500 transition-transform"
                              :class="{ 'rotate-90': expandedMasterSets[masterSet.id] }"
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                            <div>
                              <h4 class="card-title mb-1">{{ masterSet.name }}</h4>
                              <p class="text-sm text-gray-600">
                                <span v-if="masterSet.type === 'set'">{{ masterSet.targetSetName || 'Set' }}</span>
                                <span v-else-if="masterSet.type === 'pokemon'">{{ masterSet.targetPokemonName || 'Pokemon' }}</span>
                                <span v-else>Custom Collection</span>
                              </p>
                            </div>
                          </div>
                        </div>
                        <router-link
                          :to="`/master-set/${masterSet.id}`"
                          class="btn btn-h5 btn-primary"
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
                  <div class="flex justify-between items-center mb-4">
                    <p class="text-sm text-gray-600">
                      {{ collectedCards.length }} {{ collectedCards.length === 1 ? 'card' : 'cards' }} collected
                    </p>
                    <div class="flex gap-2">
                      <input
                        v-model="collectionSearchQuery"
                        type="text"
                        placeholder="Search cards..."
                        class="px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      />
                      <select
                        v-model="collectionFilterSet"
                        class="px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        <option value="">All Sets</option>
                        <option v-for="set in uniqueCollectionSets" :key="set" :value="set">
                          {{ set }}
                        </option>
                      </select>
                    </div>
                  </div>

                  <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    <PokemonCard
                      v-for="card in filteredCollectionCards"
                      :key="card.id"
                      :card="card"
                      :is-collected="true"
                      :show-collection-icon="true"
                      :compact="true"
                      :show-name-tooltip="true"
                      icon-size="w-6 h-6"
                      @click="viewCard"
                      @toggle-collected="(card) => removeFromCollection(card.id)"
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
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                    <p class="text-gray-900 dark:text-gray-100">{{ user?.displayName || 'Not set' }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Master Sets</label>
                    <p class="text-gray-900 dark:text-gray-100">{{ allMasterSets.length }}</p>
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
      @toggle-collected="selectedCard ? toggleCard(selectedCard, allMasterSets.find(ms => ms.cards?.some(c => c.id === selectedCard.id))) : null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { collection, getDocs, query, where, doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../composables/useAuth'
import { getUserCollectedCards, removeCardFromCollection, toggleCardCollected, getCollectedCardIds } from '../utils/userCards'
import PokemonCard from '../components/PokemonCard.vue'
import PokemonCardMS from '../components/PokemonCardMS.vue'
import CardModal from '../components/CardModal.vue'

const router = useRouter()
const { user } = useAuth()

const assignments = ref([])
const allMasterSets = ref([])
const pendingInvites = ref([])
const isLoadingAssignments = ref(false)
const isLoadingInvites = ref(false)
const isProcessingInvite = ref(false)
const collectedCards = ref([])
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

// Watch for user changes
watch(() => user.value, (newUser) => {
  if (newUser) {
    loadAssignments()
    loadInvites()
    loadCollection()
  } else {
    assignments.value = []
    allMasterSets.value = []
    pendingInvites.value = []
    collectedCards.value = []
  }
}, { immediate: true })

onMounted(() => {
  if (user.value) {
    loadAssignments()
    loadInvites()
    loadCollection()
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

