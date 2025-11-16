<template>
  <div class="min-h-screen" style="background-color: var(--color-bg-primary);">
    <section class="section section-spacing-md">
      <div class="section-container">
        <div class="section-header">
          <div class="flex justify-between items-start">
            <div>
              <h2>Admin - Pokemon Cards</h2>
              <p class="section-subtitle">Add and manage Pokemon card data</p>
            </div>
            <router-link to="/admin" class="btn btn-h4 btn-ghost">
              ← Back to Admin
            </router-link>
          </div>
        </div>

        <div class="max-w-4xl mx-auto">
          <!-- Tabs -->
          <div class="flex gap-2 mb-6 border-b border-gray-200">
            <button 
              @click="activeTab = 'add'"
              :class="['btn btn-h5', activeTab === 'add' ? 'btn-primary' : 'btn-ghost']"
            >
              Add Single Card
            </button>
            <button 
              @click="activeTab = 'list'"
              :class="['btn btn-h5', activeTab === 'list' ? 'btn-primary' : 'btn-ghost']"
            >
              View All Cards
            </button>
          </div>
          
          <!-- API Info -->
          <div class="card mb-6 bg-blue-50 border-blue-200">
            <div class="card-body">
              <p class="text-sm text-blue-900">
                <strong>Note:</strong> Cards are now fetched from the Pokemon TCG API. 
                Use the admin dashboard to seed sets and cards from the API. 
                Manual card entry is still available for custom cards.
              </p>
            </div>
          </div>

          <!-- Add/Edit Single Card Form -->
          <div v-if="activeTab === 'add'" class="card mb-6">
            <div class="card-header">
              <h3 class="card-title">{{ editingCard ? 'Edit Pokemon Card' : 'Add Pokemon Card' }}</h3>
            </div>
            <div class="card-body">
              <form @submit.prevent="addCard" class="space-y-4">
                <!-- Basic Info -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input 
                      v-model="form.name"
                      type="text"
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="Pikachu"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">National Dex Number *</label>
                    <input 
                      v-model.number="form.nationalDexNumber"
                      type="number"
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="25"
                    />
                  </div>
                </div>

                <!-- Set Info -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Set *</label>
                    <select 
                      v-model="form.set"
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="">Select a set</option>
                      <option v-for="set in availableSets" :key="set.id" :value="set.name">
                        {{ set.name }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Set Code *</label>
                    <input 
                      v-model="form.setCode"
                      type="text"
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 uppercase"
                      placeholder="BS"
                      @input="form.setCode = form.setCode.toUpperCase()"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Set Number *</label>
                    <input 
                      v-model="form.setNumber"
                      type="text"
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="4/102"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Release Year *</label>
                    <input 
                      v-model.number="form.releaseYear"
                      type="number"
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="1999"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Series</label>
                  <select 
                    v-model="form.series"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="">Select series</option>
                    <option value="Original Series">Original Series</option>
                    <option value="Neo Series">Neo Series</option>
                    <option value="EX Series">EX Series</option>
                    <option value="Diamond & Pearl">Diamond & Pearl</option>
                    <option value="Black & White">Black & White</option>
                    <option value="XY">XY</option>
                    <option value="Sun & Moon">Sun & Moon</option>
                    <option value="Sword & Shield">Sword & Shield</option>
                    <option value="Scarlet & Violet">Scarlet & Violet</option>
                  </select>
                </div>

                <!-- Card Details -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Rarity *</label>
                    <select 
                      v-model="form.rarity"
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="">Select rarity</option>
                      <option value="Common">Common</option>
                      <option value="Uncommon">Uncommon</option>
                      <option value="Rare">Rare</option>
                      <option value="Holo Rare">Holo Rare</option>
                      <option value="Ultra Rare">Ultra Rare</option>
                      <option value="Secret Rare">Secret Rare</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Card Type *</label>
                    <select 
                      v-model="form.cardType"
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="">Select type</option>
                      <option value="Pokemon">Pokemon</option>
                      <option value="Trainer">Trainer</option>
                      <option value="Energy">Energy</option>
                    </select>
                  </div>
                </div>

                <!-- Pokemon-specific -->
                <div v-if="form.cardType === 'Pokemon'" class="space-y-4 border-t border-gray-200 pt-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Types (comma-separated)</label>
                    <input 
                      v-model="form.typesInput"
                      type="text"
                      class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="Fire, Flying"
                      @input="updateTypes"
                    />
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                      <select 
                        v-model="form.stage"
                        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        <option value="">Select stage</option>
                        <option value="Basic">Basic</option>
                        <option value="Stage 1">Stage 1</option>
                        <option value="Stage 2">Stage 2</option>
                        <option value="V">V</option>
                        <option value="VMAX">VMAX</option>
                        <option value="VSTAR">VSTAR</option>
                        <option value="EX">EX</option>
                        <option value="GX">GX</option>
                        <option value="Tag Team">Tag Team</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">HP</label>
                      <input 
                        v-model.number="form.hp"
                        type="number"
                        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                        placeholder="60"
                      />
                    </div>
                  </div>
                </div>

                <!-- Variants -->
                <div class="space-y-2 border-t border-gray-200 pt-4">
                  <h4 class="font-medium text-gray-900">Variants</h4>
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <label class="flex items-center">
                      <input type="checkbox" v-model="form.isHolo" class="mr-2" />
                      <span class="text-sm">Holo</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" v-model="form.isReverseHolo" class="mr-2" />
                      <span class="text-sm">Reverse Holo</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" v-model="form.isFirstEdition" class="mr-2" />
                      <span class="text-sm">First Edition</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" v-model="form.isShadowless" class="mr-2" />
                      <span class="text-sm">Shadowless</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" v-model="form.isFullArt" class="mr-2" />
                      <span class="text-sm">Full Art</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" v-model="form.isRainbow" class="mr-2" />
                      <span class="text-sm">Rainbow</span>
                    </label>
                  </div>
                </div>

                <!-- Metadata -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Artist</label>
                    <input 
                      v-model="form.artist"
                      type="text"
                      class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="Ken Sugimori"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input 
                      v-model="form.imageUrl"
                      type="url"
                      class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
                  <input 
                    v-model="form.thumbnailUrl"
                    type="url"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="https://..."
                  />
                </div>

                <div class="flex gap-4 pt-4">
                  <button 
                    type="submit"
                    class="btn btn-h3 btn-primary"
                    :disabled="isSubmitting"
                  >
                    {{ isSubmitting ? (editingCard ? 'Updating...' : 'Adding...') : (editingCard ? 'Update Card' : 'Add Card') }}
                  </button>
                  <button 
                    v-if="editingCard"
                    type="button"
                    @click="cancelEdit"
                    class="btn btn-h3 btn-secondary"
                  >
                    Cancel Edit
                  </button>
                  <button 
                    v-else
                    type="button"
                    @click="resetForm"
                    class="btn btn-h3 btn-secondary"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Card List -->
          <div v-if="activeTab === 'list'" class="card">
            <div class="card-header">
              <h3 class="card-title">All Pokemon Cards</h3>
            </div>
            <div class="card-body">
              <div v-if="isLoading" class="text-center py-8">
                <p class="text-gray-600">Loading cards...</p>
              </div>
              <div v-else-if="cards.length === 0" class="text-center py-8">
                <p class="text-gray-600">No cards found. Add your first card!</p>
              </div>
              <div v-else class="space-y-2">
                <div 
                  v-for="card in cards" 
                  :key="card.id"
                  class="flex justify-between items-center p-3 border border-gray-200 rounded hover:bg-gray-50"
                >
                  <div>
                    <p class="font-medium text-gray-900">{{ card.name }}</p>
                    <p class="text-sm text-gray-600">
                      #{{ card.nationalDexNumber }} • {{ card.set }} ({{ card.setNumber }})
                    </p>
                  </div>
                  <div class="flex gap-2">
                    <button 
                      @click="editCard(card)"
                      class="btn btn-h6 btn-ghost"
                    >
                      Edit
                    </button>
                    <button 
                      @click="deleteCard(card.id)"
                      class="btn btn-h6 btn-ghost text-red-600"
                    >
                      Delete
                    </button>
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
import { ref, onMounted } from 'vue'
import { addPokemonCard, updatePokemonCard, getAllPokemonCards, deletePokemonCard } from '../utils/firebasePokemon'
import { getAllSets } from '../utils/firebasePokemon'

const activeTab = ref('add')
const availableSets = ref([])
const cards = ref([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const editingCard = ref(null)

const form = ref({
  name: '',
  nationalDexNumber: null,
  set: '',
  setCode: '',
  setNumber: '',
  releaseYear: null,
  series: '',
  rarity: '',
  cardType: '',
  types: [],
  typesInput: '',
  stage: '',
  hp: null,
  isHolo: false,
  isReverseHolo: false,
  isFirstEdition: false,
  isShadowless: false,
  isFullArt: false,
  isRainbow: false,
  artist: '',
  imageUrl: '',
  thumbnailUrl: ''
})

const updateTypes = () => {
  form.value.types = form.value.typesInput
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0)
}

const resetForm = () => {
  editingCard.value = null
  form.value = {
    name: '',
    nationalDexNumber: null,
    set: '',
    setCode: '',
    setNumber: '',
    releaseYear: null,
    series: '',
    rarity: '',
    cardType: '',
    types: [],
    typesInput: '',
    stage: '',
    hp: null,
    isHolo: false,
    isReverseHolo: false,
    isFirstEdition: false,
    isShadowless: false,
    isFullArt: false,
    isRainbow: false,
    artist: '',
    imageUrl: '',
    thumbnailUrl: ''
  }
}

const addCard = async () => {
  isSubmitting.value = true
  try {
    const cardData = {
      ...form.value,
      types: form.value.types
    }
    delete cardData.typesInput
    
    let result
    if (editingCard.value) {
      // Update existing card
      result = await updatePokemonCard(editingCard.value.id, cardData)
    } else {
      // Add new card
      result = await addPokemonCard(cardData)
    }
    
    if (result.success) {
      alert(editingCard.value ? 'Card updated successfully!' : 'Card added successfully!')
      resetForm()
      if (activeTab.value === 'list') {
        loadCards()
      }
    } else {
      alert(`Error: ${result.error}`)
    }
  } catch (error) {
    alert(`Error: ${error.message}`)
  } finally {
    isSubmitting.value = false
  }
}

const editCard = (card) => {
  editingCard.value = card
  form.value = {
    name: card.name || '',
    nationalDexNumber: card.nationalDexNumber || null,
    set: card.set || '',
    setCode: card.setCode || '',
    setNumber: card.setNumber || '',
    releaseYear: card.releaseYear || null,
    series: card.series || '',
    rarity: card.rarity || '',
    cardType: card.cardType || '',
    types: card.types || [],
    typesInput: card.types ? card.types.join(', ') : '',
    stage: card.stage || '',
    hp: card.hp || null,
    isHolo: card.isHolo || false,
    isReverseHolo: card.isReverseHolo || false,
    isFirstEdition: card.isFirstEdition || false,
    isShadowless: card.isShadowless || false,
    isFullArt: card.isFullArt || false,
    isRainbow: card.isRainbow || false,
    artist: card.artist || '',
    imageUrl: card.imageUrl || '',
    thumbnailUrl: card.thumbnailUrl || ''
  }
  // Switch to add tab to show the form
  activeTab.value = 'add'
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  editingCard.value = null
  resetForm()
}


const loadCards = async () => {
  isLoading.value = true
  try {
    const result = await getAllPokemonCards()
    if (result.success) {
      cards.value = result.data
    }
  } catch (error) {
    console.error('Error loading cards:', error)
  } finally {
    isLoading.value = false
  }
}

const deleteCard = async (cardId) => {
  if (!confirm('Are you sure you want to delete this card?')) return
  
  try {
    const result = await deletePokemonCard(cardId)
    if (result.success) {
      alert('Card deleted successfully!')
      loadCards()
    } else {
      alert(`Error: ${result.error}`)
    }
  } catch (error) {
    alert(`Error: ${error.message}`)
  }
}

const loadSets = async () => {
  try {
    const result = await getAllSets()
    if (result.success) {
      availableSets.value = result.data
    }
  } catch (error) {
    console.error('Error loading sets:', error)
  }
}

onMounted(() => {
  loadSets()
  if (activeTab.value === 'list') {
    loadCards()
  }
})

// Watch activeTab to load cards when switching to list
import { watch } from 'vue'
watch(activeTab, (newTab) => {
  if (newTab === 'list') {
    loadCards()
  }
})
</script>

