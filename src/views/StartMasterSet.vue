<template>
  <div class="min-h-screen pull-page-bg start-flow">
    <section class="section py-2 sm:py-4 md:py-6">
      <div class="section-container">
        <div class="section-header">
          <h2>Create a Battleset</h2>
          <p class="section-subtitle">Choose your challenge type, then configure it</p>
        </div>

        <div v-if="!user" class="max-w-3xl mx-auto">
          <div class="card text-center py-12">
            <h3 class="mb-4">Log in to start your battleset</h3>
            <p class="mb-6 text-sm">
              You need to be logged in to create a battleset collection.
            </p>
            <router-link to="/login" class="btn btn-h4 btn-primary">
              Go to Login
            </router-link>
          </div>
        </div>

        <div v-else class="max-w-4xl mx-auto">
          <div class="mb-8">
            <div class="flex items-center justify-between">
              <div
                v-for="(step, idx) in steps"
                :key="step.id"
                class="flex items-center flex-1"
              >
                <div class="flex flex-col items-center flex-1">
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors"
                    :class="currentStep > idx ? 'btn-primary text-white' : currentStep === idx ? 'btn-secondary' : 'btn-ghost'"
                  >
                    {{ idx + 1 }}
                  </div>
                  <p class="text-xs mt-2">{{ step.label }}</p>
                </div>
                <div v-if="idx < steps.length - 1" class="flex-1 h-px mx-2" style="background-color: var(--color-border);"></div>
              </div>
            </div>
          </div>

          <div v-if="currentStep === 0" class="card">
            <div class="card-header">
              <h3 class="card-title">Choose Challenge Type</h3>
              <p class="card-subtitle">Pick what you want to master</p>
            </div>
            <div class="card-body">
              <div class="grid grid-cols-2 gap-3 sm:gap-4">
                <button
                  v-for="option in challengeOptions"
                  :key="option.id"
                  class="card card-flat p-5 text-left transition-all cursor-pointer border-2"
                  :class="selectedType === option.id ? 'ring-2 ring-offset-2 ring-offset-transparent' : ''"
                  :style="selectedType === option.id ? 'border-color: var(--color-accent); box-shadow: var(--shadow-md); background-color: rgba(91,168,219,0.10);' : 'border-color: var(--color-border);'"
                  @click="selectType(option.id)"
                >
                  <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-3">
                    <img
                      :src="option.icon"
                      :alt="`${option.label} icon`"
                      class="challenge-type-icon w-9 h-9 md:w-12 md:h-12 object-contain order-1 md:order-2 self-start"
                    />
                    <div class="order-2 md:order-1">
                      <h4 class="card-title mb-1">{{ option.label }}</h4>
                      <p class="text-sm" style="color: var(--color-text-secondary);">{{ option.short }}</p>
                    </div>
                  </div>
                </button>
              </div>

              <div class="mt-6 flex justify-end">
                <button class="btn btn-h3 btn-primary" :disabled="!selectedType" @click="nextStep">
                  Next
                </button>
              </div>
            </div>
          </div>

          <div v-else class="card">
            <div class="card-header">
              <h3 class="card-title">Configure Challenge</h3>
              <p class="card-subtitle">Players, assignment mode, and card limits</p>
            </div>
            <div class="card-body space-y-4">
              <div>
                <label class="block text-sm mb-2">Challenge Name</label>
                <input
                  v-model="form.challengeName"
                  type="text"
                  class="ui-field"
                  placeholder="e.g., Pull TCG Challenge"
                />
              </div>

              <div>
                <label class="block text-sm mb-2">Players</label>
                <select
                  v-model.number="form.playerCount"
                  class="ui-field"
                  @change="syncParticipants"
                >
                  <option :value="1">Solo (1 player)</option>
                  <option :value="2">2 players</option>
                  <option :value="3">3 players</option>
                  <option :value="4">4 players</option>
                </select>
              </div>

              <div class="card card-flat p-2 sm:p-3 space-y-3">
                <div>
                  <label class="block text-sm mb-2">Assignment Method</label>
                  <div class="grid grid-cols-2 gap-3">
                    <button class="btn btn-h4" :class="form.selectionMode === 'random' ? 'btn-primary' : 'btn-ghost'" @click="setSelectionMode('random')">
                      🎲 Random
                    </button>
                    <button class="btn btn-h4" :class="form.selectionMode === 'choose' ? 'btn-primary' : 'btn-ghost'" @click="setSelectionMode('choose')">
                      📋 Select
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <button class="btn btn-h4" :class="form.cardCountMode === 'all' ? 'btn-primary' : 'btn-ghost'" @click="form.cardCountMode = 'all'">
                    All Cards
                  </button>
                  <button class="btn btn-h4" :class="form.cardCountMode === 'fixed' ? 'btn-primary' : 'btn-ghost'" @click="form.cardCountMode = 'fixed'">
                    Max number of cards
                  </button>
                </div>
                <div v-if="form.cardCountMode === 'fixed'" class="mt-3">
                  <input
                    v-model.number="form.fixedCardCount"
                    type="number"
                    min="1"
                    class="ui-field"
                    placeholder="Enter max number of cards"
                  />
                </div>
                <div v-if="selectedType === 'randomNumber'" class="mt-3">
                  <label class="block text-sm mb-2">Random Pool</label>
                  <select
                    v-model="form.randomScope"
                    class="ui-field"
                  >
                    <option value="all">All Languages</option>
                    <option value="en">English Only</option>
                    <option value="ja">Japanese Only</option>
                  </select>
                </div>
              </div>

              <div class="pt-2 ui-divider">
                <label class="block text-sm mb-2">Players & Assignments</label>
                <div class="space-y-3">
                  <div
                    v-for="(slot, idx) in form.participants"
                    :key="slot.key"
                    class="card card-flat card-no-hover card-blue-outline p-3"
                  >
                    <div class="flex flex-col md:flex-row md:items-start gap-3">
                      <div class="md:w-72">
                        <p class="font-medium">{{ slot.isSelf ? 'You' : `Player ${idx + 1}` }}</p>
                        <div class="mt-1">
                          <span
                            v-if="slot.isSelf"
                            class="ui-selected-pill"
                          >
                            <span class="truncate">{{ user?.displayName || user?.email || 'Current user' }}</span>
                          </span>

                          <input
                            v-else-if="slot.isEditing"
                            v-model="slot.input"
                            type="text"
                            class="ui-field"
                            placeholder="Search user or type email"
                            @input="searchParticipant(slot)"
                            @focus="slot.showResults = true"
                            @blur="handleParticipantBlur(slot)"
                          />

                          <button
                            v-else
                            class="ui-selected-pill"
                            @click="startEditParticipant(slot)"
                          >
                            <span class="truncate">{{ slot.userName || slot.email || 'Click to add user or email' }}</span>
                          </button>
                        </div>

                        <div
                          v-if="!slot.isSelf && slot.isEditing && slot.searchResults.length > 0 && slot.showResults"
                          class="ui-panel max-h-40 overflow-y-auto mt-1"
                        >
                          <button
                            v-for="result in slot.searchResults"
                            :key="result.userId"
                            class="w-full text-left px-3 py-2 border-b last:border-b-0"
                            style="border-color: var(--color-border);"
                            @click="selectParticipant(slot, result)"
                          >
                            <div>{{ result.displayName || result.email }}</div>
                            <div class="text-xs" style="color: var(--color-text-secondary);">{{ result.email }}</div>
                          </button>
                        </div>
                      </div>

                      <div class="flex-1 md:px-2 md:pt-6">
                        <div v-if="assignmentDetails(slot).isPokemon && assignmentDetails(slot).value !== 'none'" class="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md ui-panel" style="background-color: var(--color-bg-primary);">
                          <div class="w-8 h-8 rounded flex items-center justify-center overflow-hidden pokemon-image-bg">
                            <img
                              v-if="assignmentDetails(slot).spriteUrl"
                              :src="assignmentDetails(slot).spriteUrl"
                              :alt="assignmentDetails(slot).value"
                              class="w-full h-full object-contain"
                            />
                            <span v-else class="text-xs font-semibold">PK</span>
                          </div>
                          <p class="text-sm">
                            <span class="font-semibold">{{ assignmentDetails(slot).label }}:</span>
                            <span class="font-semibold ml-1">{{ assignmentDetails(slot).value }}</span>
                          </p>
                        </div>
                        <p v-else class="text-sm md:pt-2">
                          <span class="font-semibold">{{ assignmentDetails(slot).label }}:</span>
                          <span class="font-semibold ml-1">{{ assignmentDetails(slot).value }}</span>
                        </p>
                      </div>

                      <button class="btn btn-h5 btn-primary md:w-28 md:mt-6" @click="assignForParticipant(slot)">
                        Assign
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex justify-between pt-2">
                <button class="btn btn-h3 btn-ghost" @click="prevStep">Back</button>
                <button class="btn btn-h3 btn-primary" :disabled="!canCreate || isCreating" @click="createMasterSet">
                  {{ isCreating ? 'Creating...' : form.challengeMode === 'battle' ? 'Create Battle' : 'Create Master Set' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div v-if="assignModal.open" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4" @click="closeAssignModal">
      <div class="card w-full max-w-lg max-h-[85vh] overflow-hidden" @click.stop>
        <div class="card-header">
          <h3 class="card-title">Select {{ activeTypeMeta.label.slice(0, -1) }}</h3>
          <p class="card-subtitle">Choose a target for {{ assignModal.slotLabel }}</p>
        </div>
        <div class="card-body space-y-3">
          <input
            v-model="assignModal.query"
            type="text"
            class="ui-field"
            :placeholder="`Search ${activeTypeMeta.label.toLowerCase()}...`"
          />
          <div class="max-h-80 overflow-y-auto ui-panel">
            <button
              v-for="item in modalItems"
              :key="item.id"
              class="w-full text-left px-3 py-2 border-b last:border-b-0"
              style="border-color: var(--color-border);"
              @click="selectModalItem(item)"
            >
              <div class="font-medium">{{ item.label }}</div>
              <div v-if="item.subLabel" class="text-xs" style="color: var(--color-text-secondary);">{{ item.subLabel }}</div>
            </button>
            <div v-if="modalItems.length === 0" class="px-3 py-4 text-sm" style="color: var(--color-text-secondary);">
              No results found.
            </div>
          </div>
          <div class="flex justify-end">
            <button class="btn btn-h5 btn-ghost" @click="closeAssignModal">Cancel</button>
          </div>
        </div>
      </div>
    </div>

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
import { useRouter } from 'vue-router'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../composables/useAuth'
import { createMasterSet as createMasterSetUtil, createAssignment, getCardIdsForSet, getCardIdsForPokemon } from '../utils/masterSetUtils'
import { getAllPokemonCards } from '../utils/firebasePokemon'
import { getAllTrainers } from '../utils/firebaseTrainers'
import SuccessNotification from '../components/SuccessNotification.vue'

const router = useRouter()
const { user } = useAuth()

const steps = [{ id: 'choose', label: 'Choose' }, { id: 'configure', label: 'Configure' }]
const currentStep = ref(0)
const selectedType = ref(null)

const challengeOptions = [
  { id: 'set', label: 'Sets', icon: '/sets.svg', short: 'Master complete sets.', description: 'Choose or randomly pick a set and track completion for all cards in that set.' },
  { id: 'pokemon', label: 'Pokemon', icon: '/pokemon.svg', short: 'Master a Pokemon line.', description: 'Choose or randomly pick a Pokemon and track all related cards across supported languages.' },
  { id: 'trainer', label: 'Trainers', icon: '/trainers.svg', short: 'Master trainer-linked cards.', description: 'MVP: card matching is based on trainer name text in card data.' },
  { id: 'randomNumber', label: 'Random Number', icon: '/random.svg', short: 'Build random-card challenges.', description: 'Pick a random pool and generate a challenge by card count.' }
]

const activeTypeMeta = computed(() => challengeOptions.find((x) => x.id === selectedType.value) || challengeOptions[0])

const makeParticipant = (idx, isSelf = false) => ({
  key: `p-${idx}-${Date.now()}`,
  isSelf,
  userId: isSelf ? user.value?.uid || null : null,
  userName: isSelf ? user.value?.displayName || user.value?.email || 'You' : null,
  email: isSelf ? user.value?.email || null : null,
  input: '',
  isEditing: !isSelf,
  searching: false,
  searchResults: [],
  showResults: false,
  searchTimeout: null,
  assignment: {
    setId: '',
    pokemonId: '',
    trainerId: '',
    randomAssigned: false
  }
})

const form = ref({
  challengeName: '',
  selectionMode: 'random',
  cardCountMode: 'all',
  fixedCardCount: 50,
  randomScope: 'all',
  playerCount: 1,
  participants: [makeParticipant(1, true)]
})

const availableSets = ref([])
const availablePokemon = ref([])
const availableTrainers = ref([])
const isLoadingSets = ref(false)
const isLoadingPokemon = ref(false)
const isLoadingTrainers = ref(false)
const isCreating = ref(false)
const showSuccessNotification = ref(false)

const assignModal = ref({
  open: false,
  participantKey: null,
  slotLabel: '',
  query: ''
})

const canCreate = computed(() => {
  if (!selectedType.value) return false
  if (!form.value.challengeName.trim()) return false
  if (form.value.cardCountMode === 'fixed' && (!form.value.fixedCardCount || form.value.fixedCardCount < 1)) return false

  const allPlayersValid = form.value.participants.every((slot, idx) => {
    const hasIdentity = slot.isSelf || Boolean(slot.userId || slot.email || (slot.input && slot.input.includes('@')))
    if (!hasIdentity) return false
    if (selectedType.value === 'set') return Boolean(slot.assignment.setId)
    if (selectedType.value === 'pokemon') return Boolean(slot.assignment.pokemonId)
    if (selectedType.value === 'trainer') return Boolean(slot.assignment.trainerId)
    return Boolean(slot.assignment.randomAssigned)
  })
  return allPlayersValid
})

const toShuffled = (arr) => {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = copy[i]
    copy[i] = copy[j]
    copy[j] = temp
  }
  return copy
}

const sampleCardIds = (cardsByLang) => {
  if (form.value.cardCountMode !== 'fixed') return cardsByLang

  const combined = [
    ...(cardsByLang.card_en || []).map((id) => ({ lang: 'en', id })),
    ...(cardsByLang.card_ja || []).map((id) => ({ lang: 'ja', id }))
  ]
  const count = Math.min(form.value.fixedCardCount || 0, combined.length)
  const selected = toShuffled(combined).slice(0, count)
  return {
    card_en: selected.filter((c) => c.lang === 'en').map((c) => c.id),
    card_ja: selected.filter((c) => c.lang === 'ja').map((c) => c.id)
  }
}

const pickRandomSet = () => {
  if (availableSets.value.length === 0) return null
  const chosen = toShuffled(availableSets.value)[0]
  return chosen.id
}

const pickRandomPokemon = () => {
  if (availablePokemon.value.length === 0) return null
  const chosen = toShuffled(availablePokemon.value)[0]
  return chosen.id
}

const pickRandomTrainer = () => {
  if (availableTrainers.value.length === 0) return null
  const chosen = toShuffled(availableTrainers.value)[0]
  return chosen.id
}

const resolveLanguages = () => {
  if (selectedType.value === 'randomNumber') {
    if (form.value.randomScope === 'en') return ['en']
    if (form.value.randomScope === 'ja') return ['ja']
    return ['en', 'ja']
  }
  return ['en', 'ja']
}

const getTrainerCardsMvp = async (trainer, languages) => {
  const trainerName = (trainer?.trainerName || '').toLowerCase().trim()
  if (!trainerName) return { card_en: [], card_ja: [] }

  const result = await getAllPokemonCards({ language: 'all' })
  if (!result.success || !result.data) return { card_en: [], card_ja: [] }

  const en = new Set()
  const ja = new Set()

  result.data.forEach((card) => {
    const textBlob = [
      card.name,
      card.cardName,
      card.trainerName,
      card.flavorText,
      Array.isArray(card.rules) ? card.rules.join(' ') : '',
      Array.isArray(card.text) ? card.text.join(' ') : ''
    ].join(' ').toLowerCase()

    if (!textBlob.includes(trainerName)) return
    const cardId = card.cardId || card.id || card.apiId
    if (!cardId) return

    if (card.language === 'en' && languages.includes('en')) en.add(cardId)
    if (card.language === 'ja' && languages.includes('ja')) ja.add(cardId)
  })

  return { card_en: Array.from(en), card_ja: Array.from(ja) }
}

const getRandomCards = async (languages) => {
  const result = await getAllPokemonCards({ language: 'all' })
  if (!result.success || !result.data) return { card_en: [], card_ja: [] }

  const pool = result.data.filter((card) => languages.includes(card.language))
  const normalized = toShuffled(pool).map((card) => ({
    lang: card.language,
    id: card.cardId || card.id || card.apiId
  })).filter((x) => x.id)

  const selected = form.value.cardCountMode === 'fixed'
    ? normalized.slice(0, Math.min(form.value.fixedCardCount || 0, normalized.length))
    : normalized

  return {
    card_en: selected.filter((x) => x.lang === 'en').map((x) => x.id),
    card_ja: selected.filter((x) => x.lang === 'ja').map((x) => x.id)
  }
}

const syncParticipants = () => {
  const desired = Math.min(4, Math.max(1, form.value.playerCount || 1))
  const current = form.value.participants
  const updated = [current[0] || makeParticipant(1, true)]
  updated[0].isSelf = true
  updated[0].userId = user.value?.uid || null
  updated[0].userName = user.value?.displayName || user.value?.email || 'You'
  updated[0].email = user.value?.email || null

  for (let i = 1; i < desired; i += 1) {
    const slot = current[i] || makeParticipant(i + 1, false)
    if (typeof slot.isEditing === 'undefined') slot.isEditing = false
    updated.push(slot)
  }
  form.value.participants = updated
}

const setSelectionMode = (mode) => {
  form.value.selectionMode = mode
  form.value.participants.forEach((slot) => {
    slot.assignment.setId = ''
    slot.assignment.pokemonId = ''
    slot.assignment.trainerId = ''
    slot.assignment.randomAssigned = false
  })
}

const searchParticipant = async (target) => {
  const term = (target?.input || '').trim().toLowerCase()

  if (!term) {
    target.userId = null
    target.userName = null
    target.email = ''
    target.searchResults = []
    return
  }

  clearTimeout(target.searchTimeout)
  target.searchTimeout = setTimeout(async () => {
    target.searching = true
    try {
      const usersRef = collection(db, 'users')
      const snap = await getDocs(usersRef)
      const matches = snap.docs
        .map((d) => ({ userId: d.id, ...d.data() }))
        .filter((u) => {
          const name = (u.displayName || '').toLowerCase()
          const email = (u.email || '').toLowerCase()
          return name.includes(term) || email.includes(term)
        })
        .slice(0, 6)
      target.searchResults = matches

      if (term.includes('@') && matches.length === 0) {
        target.email = term
      }
    } catch (error) {
      console.error('Error searching participant:', error)
      target.searchResults = []
    } finally {
      target.searching = false
    }
  }, 250)
}

const selectParticipant = (target, result) => {
  target.userId = result.userId
  target.userName = result.displayName || result.email
  target.email = result.email || ''
  target.input = result.email || result.displayName || ''
  target.searchResults = []
  target.showResults = false
  target.isEditing = false
}

const startEditParticipant = (slot) => {
  slot.isEditing = true
  slot.showResults = false
}

const handleParticipantBlur = (slot) => {
  setTimeout(() => {
    slot.showResults = false
    const value = (slot.input || '').trim()
    if (!value) return

    if (!slot.userId && value.includes('@')) {
      slot.email = value
      slot.userName = null
      slot.isEditing = false
      return
    }

    if (slot.userId || slot.email) {
      slot.isEditing = false
    }
  }, 200)
}

const assignForParticipant = (slot) => {
  if (form.value.selectionMode === 'random') {
    if (selectedType.value === 'set') slot.assignment.setId = pickRandomSet() || ''
    if (selectedType.value === 'pokemon') slot.assignment.pokemonId = pickRandomPokemon() || ''
    if (selectedType.value === 'trainer') slot.assignment.trainerId = pickRandomTrainer() || ''
    if (selectedType.value === 'randomNumber') slot.assignment.randomAssigned = true
    return
  }
  assignModal.value.open = true
  assignModal.value.participantKey = slot.key
  assignModal.value.slotLabel = slot.isSelf ? 'you' : (slot.userName || slot.email || 'this player')
  assignModal.value.query = ''
}

const closeAssignModal = () => {
  assignModal.value.open = false
  assignModal.value.participantKey = null
  assignModal.value.query = ''
}

const modalItems = computed(() => {
  const q = assignModal.value.query.trim().toLowerCase()
  if (selectedType.value === 'set') {
    return availableSets.value
      .filter((x) => !q || (x.name || '').toLowerCase().includes(q))
      .slice(0, 40)
      .map((x) => ({ id: x.id, label: x.name, subLabel: `${x.totalCards || 0} cards` }))
  }
  if (selectedType.value === 'pokemon') {
    return availablePokemon.value
      .filter((x) => !q || ((x.displayName || x.name || '').toLowerCase().includes(q)))
      .slice(0, 40)
      .map((x) => ({ id: x.id, label: x.displayName || x.name, subLabel: x.nationalDexNumber ? `#${x.nationalDexNumber}` : '' }))
  }
  if (selectedType.value === 'trainer') {
    return availableTrainers.value
      .filter((x) => !q || (x.trainerName || '').toLowerCase().includes(q))
      .slice(0, 40)
      .map((x) => ({ id: x.id, label: x.trainerName, subLabel: 'MVP trainer name matching' }))
  }
  return []
})

const selectModalItem = (item) => {
  const slot = form.value.participants.find((p) => p.key === assignModal.value.participantKey)
  if (!slot) return
  if (selectedType.value === 'set') slot.assignment.setId = item.id
  if (selectedType.value === 'pokemon') slot.assignment.pokemonId = item.id
  if (selectedType.value === 'trainer') slot.assignment.trainerId = item.id
  closeAssignModal()
}

const getPokemonSpriteUrl = (pokemon) => {
  if (!pokemon) return null
  if (pokemon.spriteUrl) return pokemon.spriteUrl
  if (pokemon.spriteUrls?.normal) return pokemon.spriteUrls.normal
  if (pokemon.imageUrl) return pokemon.imageUrl
  return null
}

const assignmentDetails = (slot) => {
  if (selectedType.value === 'set') {
    const set = availableSets.value.find((x) => x.id === slot.assignment.setId)
    return { label: 'Assigned target', value: set ? set.name : 'none', isPokemon: false, spriteUrl: null }
  }
  if (selectedType.value === 'pokemon') {
    const pokemon = availablePokemon.value.find((x) => x.id === slot.assignment.pokemonId)
    return {
      label: 'Assigned target',
      value: pokemon ? (pokemon.displayName || pokemon.name) : 'none',
      isPokemon: true,
      spriteUrl: getPokemonSpriteUrl(pokemon)
    }
  }
  if (selectedType.value === 'trainer') {
    const trainer = availableTrainers.value.find((x) => x.id === slot.assignment.trainerId)
    return { label: 'Assigned target', value: trainer ? trainer.trainerName : 'none', isPokemon: false, spriteUrl: null }
  }
  if (selectedType.value === 'randomNumber') {
    if (!slot.assignment.randomAssigned) return { label: 'Assigned target', value: 'none', isPokemon: false, spriteUrl: null }
    const cardLabel = form.value.cardCountMode === 'fixed' ? `${form.value.fixedCardCount} cards` : 'all cards'
    return { label: 'Assigned target', value: `random (${form.value.randomScope}) • ${cardLabel}`, isPokemon: false, spriteUrl: null }
  }
  return { label: 'Assigned target', value: 'none', isPokemon: false, spriteUrl: null }
}

const getCardsForParticipant = async (slot, languages) => {
  if (selectedType.value === 'set') {
    const set = availableSets.value.find((x) => x.id === slot.assignment.setId)
    if (!set) return { card_en: [], card_ja: [] }
    const ids = await getCardIdsForSet(set.id, set.language || 'en')
    const base = set.language === 'ja' ? { card_en: [], card_ja: ids } : { card_en: ids, card_ja: [] }
    return sampleCardIds(base)
  }

  if (selectedType.value === 'pokemon') {
    const pokemon = availablePokemon.value.find((x) => x.id === slot.assignment.pokemonId)
    if (!pokemon?.nationalDexNumber) return { card_en: [], card_ja: [] }
    const ids = await getCardIdsForPokemon(pokemon.nationalDexNumber, languages)
    return sampleCardIds(ids)
  }

  if (selectedType.value === 'trainer') {
    const trainer = availableTrainers.value.find((x) => x.id === slot.assignment.trainerId)
    if (!trainer) return { card_en: [], card_ja: [] }
    const ids = await getTrainerCardsMvp(trainer, languages)
    return sampleCardIds(ids)
  }

  return getRandomCards(languages)
}

const createMasterSet = async () => {
  if (!user.value) {
    router.push('/login')
    return
  }

  isCreating.value = true
  try {
    const languages = resolveLanguages()
    const challengeType = selectedType.value === 'randomNumber' ? 'random' : selectedType.value

    const first = form.value.participants[0]
    const firstSet = availableSets.value.find((x) => x.id === first.assignment.setId)
    const firstPokemon = availablePokemon.value.find((x) => x.id === first.assignment.pokemonId)
    const firstTrainer = availableTrainers.value.find((x) => x.id === first.assignment.trainerId)

    const masterSetData = {
      name: form.value.challengeName.trim(),
      description: null,
      type: challengeType === 'trainer' ? 'pokemon' : challengeType, // compatibility for existing screens
      challengeType,
      challengeMode: form.value.challengeMode,
      selectionMode: form.value.selectionMode,
      cardCountMode: form.value.cardCountMode,
      cardCount: form.value.cardCountMode === 'fixed' ? form.value.fixedCardCount : null,
      targetSetId: firstSet?.id || null,
      targetSetCollection: firstSet ? `set_${firstSet.language || 'en'}` : null,
      targetSetName: firstSet?.name || null,
      targetPokemonId: firstPokemon ? String(firstPokemon.nationalDexNumber || firstPokemon.id) : null,
      targetPokemonName: firstPokemon ? (firstPokemon.displayName || firstPokemon.name) : (firstTrainer?.trainerName || null),
      targetTrainerId: firstTrainer?.id || null,
      targetTrainerName: firstTrainer?.trainerName || null,
      randomScope: selectedType.value === 'randomNumber' ? form.value.randomScope : null,
      battleOwnerId: user.value.uid,
      battleOpponentId: form.value.playerCount > 1 ? (form.value.participants[1]?.userId || null) : null,
      battleStatus: form.value.playerCount > 1 ? 'pending' : null,
      playerCount: form.value.playerCount,
      languages,
      createdBy: user.value.uid
    }

    const created = await createMasterSetUtil(masterSetData)
    if (!created.success) throw new Error(created.error || 'Failed to create master set')
    const masterSetId = created.data.id

    for (let i = 0; i < form.value.participants.length; i += 1) {
      const slot = form.value.participants[i]
      const setObj = availableSets.value.find((x) => x.id === slot.assignment.setId)
      const pokemonObj = availablePokemon.value.find((x) => x.id === slot.assignment.pokemonId)
      const trainerObj = availableTrainers.value.find((x) => x.id === slot.assignment.trainerId)
      const cardsByLang = await getCardsForParticipant(slot, languages)

      if ((cardsByLang.card_en.length + cardsByLang.card_ja.length) === 0) {
        throw new Error(`No cards found for ${slot.isSelf ? 'you' : `player ${i + 1}`}.`)
      }

      await createAssignment({
        masterSetId,
        userId: slot.isSelf ? user.value.uid : (slot.userId || null),
        userEmail: slot.isSelf ? user.value.email : (slot.email || (slot.input.includes('@') ? slot.input : null)),
        email: slot.isSelf ? user.value.email : (slot.email || (slot.input.includes('@') ? slot.input : null)),
        userName: slot.isSelf ? (user.value.displayName || user.value.email) : (slot.userName || null),
        card_en: cardsByLang.card_en,
        card_ja: cardsByLang.card_ja,
        type: challengeType === 'random' ? 'set' : challengeType === 'trainer' ? 'pokemon' : challengeType,
        setId: setObj?.id || null,
        setName: setObj?.name || null,
        pokemonId: pokemonObj ? String(pokemonObj.nationalDexNumber || pokemonObj.id) : (trainerObj?.id || null),
        pokemonName: pokemonObj ? (pokemonObj.displayName || pokemonObj.name) : (trainerObj?.trainerName || null),
        status: slot.isSelf ? 'accepted' : 'pending',
        createdBy: user.value.uid
      })
    }

    showSuccessNotification.value = true
    setTimeout(() => {
      router.push(`/master-set/${masterSetId}`)
    }, 1200)
  } catch (error) {
    console.error('Error creating master set:', error)
    alert(error.message || 'Unable to create master set')
  } finally {
    isCreating.value = false
  }
}

const selectType = (type) => {
  selectedType.value = type
  form.value.selectionMode = 'random'
  form.value.cardCountMode = 'all'
  form.value.playerCount = 1
  form.value.participants = [makeParticipant(1, true)]
  if (!form.value.challengeName.trim()) {
    const label = challengeOptions.find((x) => x.id === type)?.label || 'Master Set'
    form.value.challengeName = `${label} Challenge`
  }
}

const nextStep = () => {
  if (currentStep.value < steps.length - 1) currentStep.value += 1
}

const prevStep = () => {
  if (currentStep.value > 0) currentStep.value -= 1
}

const loadSets = async () => {
  isLoadingSets.value = true
  try {
    const setsEnRef = collection(db, 'set_en')
    const snapshot = await getDocs(setsEnRef)
    availableSets.value = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      language: 'en'
    })).sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  } catch (error) {
    console.error('Error loading sets:', error)
  } finally {
    isLoadingSets.value = false
  }
}

const loadPokemon = async () => {
  isLoadingPokemon.value = true
  try {
    const pokemonRef = collection(db, 'pokemon')
    const snapshot = await getDocs(pokemonRef)
    availablePokemon.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (error) {
    console.error('Error loading pokemon:', error)
  } finally {
    isLoadingPokemon.value = false
  }
}

const loadTrainers = async () => {
  isLoadingTrainers.value = true
  try {
    availableTrainers.value = await getAllTrainers()
  } catch (error) {
    console.error('Error loading trainers:', error)
  } finally {
    isLoadingTrainers.value = false
  }
}

watch(
  () => [selectedType.value, currentStep.value, form.value.selectionMode, form.value.playerCount],
  () => {
    if (currentStep.value === 1) syncParticipants()
  }
)

onMounted(() => {
  document.title = 'PULL TCG — Create Master Set'
  if (user.value) {
    loadSets()
    loadPokemon()
    loadTrainers()
  }
  syncParticipants()
})
</script>

