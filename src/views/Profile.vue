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
            <!-- My Assignments -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">My Master Sets</h3>
              </div>
              <div class="card-body">
                <div v-if="isLoadingAssignments" class="text-center py-8">
                  <p class="text-gray-600">Loading assignments...</p>
                </div>

                <div v-else-if="assignments.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="assignment in assignments"
                    :key="assignment.id"
                    class="card card-flat hover:shadow-lg transition-shadow cursor-pointer"
                    @click="goToAssignment(assignment)"
                  >
                    <div class="card-body">
                      <div class="flex justify-between items-start mb-3">
                        <div>
                          <h4 class="card-title mb-1">{{ assignment.challengeName || (assignment.setName || assignment.pokemonName || 'Master Set') }}</h4>
                          <p class="text-sm text-gray-600">
                            <span v-if="assignment.type === 'set'">{{ assignment.setName || 'Set' }}</span>
                            <span v-else-if="assignment.type === 'pokemon'">{{ assignment.pokemonName || 'Pokemon' }}</span>
                            <span v-else>Custom Collection</span>
                          </p>
                        </div>
                        <span
                          v-if="assignment.challengeId"
                          class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                        >
                          Challenge
                        </span>
                      </div>
                      
                      <!-- Progress -->
                      <div class="mb-3">
                        <div class="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{{ assignment.progress || 0 }}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            class="bg-gray-900 h-2 rounded-full transition-all"
                            :style="{ width: `${assignment.progress || 0}%` }"
                          ></div>
                        </div>
                        <div class="text-xs text-gray-500 mt-1">
                          {{ assignment.collected || 0 }} / {{ assignment.total || 0 }} cards
                        </div>
                      </div>
                      
                      <button
                        @click.stop="goToAssignment(assignment)"
                        class="btn btn-h5 btn-primary w-full"
                      >
                        View Checklist
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Empty Assignments State -->
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
              <div class="card-body">
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

            <!-- My Challenges -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">My Challenges</h3>
                <p class="card-subtitle">Track progress with your challenges</p>
              </div>
              <div class="card-body">
                <div v-if="isLoadingChallenges" class="text-center py-8">
                  <p class="text-gray-600">Loading challenges...</p>
                </div>

                <div v-else-if="userChallenges.length > 0" class="space-y-6">
                  <div
                    v-for="challenge in userChallenges"
                    :key="challenge.id"
                    class="card card-flat"
                  >
                    <div class="card-body">
                      <!-- Challenge Header -->
                      <div class="flex justify-between items-start mb-4">
                        <div>
                          <h4 class="card-title mb-1">{{ challenge.name }}</h4>
                          <p class="text-sm text-gray-600" v-if="challenge.description">{{ challenge.description }}</p>
                        </div>
                        <router-link
                          :to="`/challenge/${challenge.id}`"
                          class="btn btn-h5 btn-primary"
                        >
                          View Details
                        </router-link>
                      </div>

                      <!-- Challenge Stats (always visible) -->
                      <div class="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p class="text-xs text-gray-600 mb-1">Members</p>
                          <p class="text-xl font-bold text-gray-900">{{ challengeMembers[challenge.id]?.length || challenge.members?.length || 0 }}</p>
                        </div>
                        <div>
                          <p class="text-xs text-gray-600 mb-1">Avg Progress</p>
                          <p class="text-xl font-bold text-gray-900">{{ challengeStats[challenge.id]?.averageProgress || 0 }}%</p>
                        </div>
                        <div>
                          <p class="text-xs text-gray-600 mb-1">Assignments</p>
                          <p class="text-xl font-bold text-gray-900">{{ challengeStats[challenge.id]?.totalAssignments || 0 }}</p>
                        </div>
                      </div>

                      <!-- Invite Code -->
                      <div class="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded">
                        <div class="flex-1">
                          <p class="text-xs text-gray-600 mb-1">Invite Code</p>
                          <p class="text-lg font-mono font-bold text-gray-900">{{ challenge.inviteCode }}</p>
                        </div>
                        <button
                          @click="copyInviteCode(challenge.inviteCode)"
                          class="btn btn-h5 btn-secondary"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Empty Challenges State -->
                <div v-else class="text-center py-8">
                  <p class="text-gray-600 mb-4">No challenges yet</p>
                  <router-link to="/start" class="btn btn-h4 btn-primary">
                    Start a Challenge
                  </router-link>
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
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p class="text-gray-900">{{ user?.email || 'Not set' }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                    <p class="text-gray-900">{{ user?.displayName || 'Not set' }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Master Sets</label>
                    <p class="text-gray-900">{{ assignments.length }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Challenges</label>
                    <p class="text-gray-900">{{ userChallenges.length }}</p>
                  </div>
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
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { collection, getDocs, query, where, doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../composables/useAuth'
import { getUserCollectedCards, removeCardFromCollection } from '../utils/userCards'
import PokemonCard from '../components/PokemonCard.vue'

const router = useRouter()
const { user } = useAuth()

const assignments = ref([])
const pendingInvites = ref([])
const userChallenges = ref([])
const isLoadingAssignments = ref(false)
const isLoadingInvites = ref(false)
const isLoadingChallenges = ref(false)
const isProcessingInvite = ref(false)
const challengeMembers = ref({})
const challengeStats = ref({})
const collectedCards = ref([])
const isLoadingCollection = ref(false)
const collectionSearchQuery = ref('')
const collectionFilterSet = ref('')

const loadAssignments = async () => {
  if (!user.value) return
  
  isLoadingAssignments.value = true
  try {
    const assignmentsRef = collection(db, 'assignments')
    const q = query(assignmentsRef, where('userId', '==', user.value.uid))
    const snapshot = await getDocs(q)
    
    assignments.value = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = { id: doc.id, ...doc.data() }
        
        // Load challenge name if challengeId exists
        if (data.challengeId) {
          try {
            const challengeRef = doc(db, 'challenges', data.challengeId)
            const challengeSnap = await getDoc(challengeRef)
            if (challengeSnap.exists()) {
              data.challengeName = challengeSnap.data().name
            }
          } catch (error) {
            console.error('Error loading challenge:', error)
          }
        }
        
        // Calculate progress from collectorList
        const collectorListRef = collection(db, 'collectorList')
        const collectorListQuery = query(
          collectorListRef,
          where('userId', '==', user.value.uid),
          where('assignmentId', '==', doc.id)
        )
        const collectorListSnapshot = await getDocs(collectorListQuery)
        
        // Get total cards for this assignment - use stored totalCards or cardIds
        let totalCards = 0
        
        // Use stored totalCards if available (new assignments)
        if (data.totalCards !== undefined) {
          totalCards = data.totalCards
        } else if (data.cardIds && data.cardIds.length > 0) {
          // Use cardIds length if available
          totalCards = data.cardIds.length
        } else {
          // Fallback for old assignments - query (but this is expensive, should migrate)
          const pokemonRef = collection(db, 'pokemon')
          if (data.type === 'set' && data.setId) {
            const setQuery = query(pokemonRef, where('setId', '==', data.setId))
            const setSnapshot = await getDocs(setQuery)
            totalCards = setSnapshot.size
          } else if (data.type === 'pokemon' && data.pokemonId) {
            const pokemonListRef = doc(db, 'pokemonList', data.pokemonId)
            const pokemonListDoc = await getDoc(pokemonListRef)
            if (pokemonListDoc.exists()) {
              const cardIds = pokemonListDoc.data().cardIds || []
              totalCards = cardIds.length
            }
          }
        }
        
        const checkedCards = collectorListSnapshot.docs.filter(d => d.data().checkedOff).length
        data.progress = totalCards > 0 ? Math.round((checkedCards / totalCards) * 100) : 0
        data.collected = checkedCards
        data.total = totalCards
        
        return data
      })
    )
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

const loadChallenges = async () => {
  if (!user.value) return
  
  isLoadingChallenges.value = true
  try {
    // Load user document to get challenges array
    const userRef = doc(db, 'users', user.value.uid)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      const userData = userSnap.data()
      const challengeIds = userData.challenges || []
      
      if (challengeIds.length > 0) {
        const challengesData = await Promise.all(
          challengeIds.map(async (challengeId) => {
            const challengeRef = doc(db, 'challenges', challengeId)
            const challengeSnap = await getDoc(challengeRef)
            if (challengeSnap.exists()) {
              return { id: challengeSnap.id, ...challengeSnap.data() }
            }
            return null
          })
        )
        userChallenges.value = challengesData.filter(Boolean)
        
        // Load member data for all challenges
        await Promise.all(userChallenges.value.map(challenge => loadChallengeMembers(challenge.id)))
      }
    }
  } catch (error) {
    console.error('Error loading challenges:', error)
  } finally {
    isLoadingChallenges.value = false
  }
}

const loadChallengeMembers = async (challengeId) => {
  try {
    const challengeRef = doc(db, 'challenges', challengeId)
    const challengeSnap = await getDoc(challengeRef)
    
    if (!challengeSnap.exists()) return
    
    const challengeData = challengeSnap.data()
    const memberIds = challengeData.members || []
    
    // Load all assignments for this challenge
    const assignmentsRef = collection(db, 'assignments')
    const assignmentsQuery = query(assignmentsRef, where('challengeId', '==', challengeId))
    const assignmentsSnapshot = await getDocs(assignmentsQuery)
    
    const membersData = []
    
    for (const assignmentDoc of assignmentsSnapshot.docs) {
      const assignmentData = assignmentDoc.data()
      const memberId = assignmentData.userId
      
      if (!memberId) continue // Skip email-only invites
      
      // Get user data
      const userRef = doc(db, 'users', memberId)
      const userSnap = await getDoc(userRef)
      if (!userSnap.exists()) continue
      
      const userData = userSnap.data()
      
      // Calculate progress from collectorList
      const collectorListRef = collection(db, 'collectorList')
      const collectorListQuery = query(
        collectorListRef,
        where('userId', '==', memberId),
        where('assignmentId', '==', assignmentDoc.id)
      )
      const collectorListSnapshot = await getDocs(collectorListQuery)
      
      // Get total cards for this assignment - use stored totalCards or cardIds
      let totalCards = 0
      
      // Use stored totalCards if available (new assignments)
      if (assignmentData.totalCards !== undefined) {
        totalCards = assignmentData.totalCards
      } else if (assignmentData.cardIds && assignmentData.cardIds.length > 0) {
        // Use cardIds length if available
        totalCards = assignmentData.cardIds.length
      } else {
        // Fallback for old assignments - query (but this is expensive, should migrate)
        const pokemonRef = collection(db, 'pokemon')
        if (assignmentData.type === 'set' && assignmentData.setId) {
          const setQuery = query(pokemonRef, where('setId', '==', assignmentData.setId))
          const setSnapshot = await getDocs(setQuery)
          totalCards = setSnapshot.size
        } else if (assignmentData.type === 'pokemon' && assignmentData.pokemonId) {
          const pokemonListRef = doc(db, 'pokemonList', assignmentData.pokemonId)
          const pokemonListDoc = await getDoc(pokemonListRef)
          if (pokemonListDoc.exists()) {
            const cardIds = pokemonListDoc.data().cardIds || []
            totalCards = cardIds.length
          }
        }
      }
      
      const checkedCards = collectorListSnapshot.docs.filter(d => d.data().checkedOff).length
      const progress = totalCards > 0 ? Math.round((checkedCards / totalCards) * 100) : 0
      
      membersData.push({
        id: memberId,
        name: userData.displayName || userData.email || 'Unknown',
        email: userData.email,
        progress: progress,
        assignmentId: assignmentDoc.id
      })
    }
    
    challengeMembers.value[challengeId] = membersData
    
    // Calculate challenge stats
    const averageProgress = membersData.length > 0
      ? Math.round(membersData.reduce((sum, m) => sum + m.progress, 0) / membersData.length)
      : 0
    
    challengeStats.value[challengeId] = {
      averageProgress,
      totalAssignments: assignmentsSnapshot.size
    }
  } catch (error) {
    console.error(`Error loading challenge members for ${challengeId}:`, error)
  }
}

const copyInviteCode = (code) => {
  navigator.clipboard.writeText(code)
  alert(`Invite code copied: ${code}`)
}

const goToAssignment = (assignment) => {
  // Navigate to challenge page
  if (assignment.challengeId) {
    router.push(`/challenge/${assignment.challengeId}`)
  } else {
    // Solo assignments should still have a challengeId, but fallback to profile
    console.warn('Assignment missing challengeId:', assignment.id)
    router.push(`/profile`)
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
    
    // Add user to challenge
    const challengeRef = doc(db, 'challenges', invite.challengeId)
    await updateDoc(challengeRef, {
      members: arrayUnion(user.value.uid),
      updatedAt: serverTimestamp()
    })
    
    // Add challenge to user's challenges array
    const userRef = doc(db, 'users', user.value.uid)
    await updateDoc(userRef, {
      challenges: arrayUnion(invite.challengeId),
      updatedAt: serverTimestamp()
    })
    
    // Update assignment: find by email and update to userId
    const assignmentsRef = collection(db, 'assignments')
    const assignmentsQuery = query(
      assignmentsRef,
      where('challengeId', '==', invite.challengeId),
      where('email', '==', invite.email)
    )
    const assignmentsSnapshot = await getDocs(assignmentsQuery)
    
    if (!assignmentsSnapshot.empty) {
      const assignmentDoc = assignmentsSnapshot.docs[0]
      await updateDoc(doc(db, 'assignments', assignmentDoc.id), {
        userId: user.value.uid,
        email: null, // Clear email since we now have userId
        updatedAt: serverTimestamp()
      })
    }
    
    // Remove from pending invites
    pendingInvites.value = pendingInvites.value.filter(i => i.id !== invite.id)
    
    // Reload challenges and assignments
    await loadChallenges()
    await loadAssignments()
    
    alert('Invite accepted! You can now start collecting cards for this challenge.')
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
    const result = await getUserCollectedCards(user.value.uid)
    if (result.success && result.data) {
      // Load full card details for each collected card
      const cardPromises = result.data.map(async (userCard) => {
        try {
          const cardDoc = await getDoc(doc(db, 'pokemon', userCard.cardId))
          if (cardDoc.exists()) {
            const cardData = cardDoc.data()
            const enrichedCard = {
              ...cardData,
              id: cardDoc.id,
              collectedAt: userCard.collectedAt,
              quantity: userCard.quantity,
              notes: userCard.notes
            }
            
            // If card has nationalDexNumber, try to enrich with sprite from pokemonList
            if (cardData.nationalDexNumber && !enrichedCard.spriteUrl) {
              try {
                const pokemonListRef = collection(db, 'pokemonList')
                const pokemonQuery = query(
                  pokemonListRef,
                  where('nationalDexNumber', '==', cardData.nationalDexNumber)
                )
                const pokemonSnapshot = await getDocs(pokemonQuery)
                
                // Find the best entry with a sprite
                for (const pokemonDoc of pokemonSnapshot.docs) {
                  const pokemonData = pokemonDoc.data()
                  const spriteUrl = pokemonData.spriteUrl || pokemonData.spriteUrls?.spriteUrl || pokemonData.spriteUrls?.normal
                  
                  if (spriteUrl) {
                    enrichedCard.spriteUrl = spriteUrl
                    enrichedCard.spriteUrls = pokemonData.spriteUrls
                    break // Use first one with sprite
                  }
                }
              } catch (error) {
                // Silently fail - sprite enrichment is optional
                console.debug(`Could not enrich sprite for card ${cardDoc.id}:`, error)
              }
            }
            
            return enrichedCard
          }
          return null
        } catch (error) {
          console.error(`Error loading card ${userCard.cardId}:`, error)
          return null
        }
      })
      
      const cards = await Promise.all(cardPromises)
      collectedCards.value = cards.filter(card => card !== null)
    } else {
      collectedCards.value = []
    }
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
    loadChallenges()
    loadCollection()
  } else {
    assignments.value = []
    pendingInvites.value = []
    userChallenges.value = []
    collectedCards.value = []
  }
}, { immediate: true })

onMounted(() => {
  if (user.value) {
    loadAssignments()
    loadInvites()
    loadChallenges()
    loadCollection()
  }
})
</script>

