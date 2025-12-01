<template>
  <div class="min-h-screen" style="background-color: var(--color-bg-primary);">
    <section class="section section-spacing-md">
      <div class="section-container">
        <div class="section-header">
          <div class="flex justify-between items-start">
            <div>
              <h2>Admin - Sets</h2>
              <p class="section-subtitle">Add and manage card sets</p>
            </div>
            <router-link to="/admin" class="btn btn-h4 btn-ghost">
              ← Back to Admin
            </router-link>
          </div>
        </div>

        <div class="max-w-4xl mx-auto">
          <!-- Add Set Form -->
          <div class="card mb-6">
            <div class="card-header">
              <h3 class="card-title">Add New Set</h3>
            </div>
            <div class="card-body">
              <form @submit.prevent="addSet" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Set Name *</label>
                    <input 
                      v-model="form.name"
                      type="text"
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="Base Set"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Set Code *</label>
                    <input 
                      v-model="form.code"
                      type="text"
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 uppercase"
                      placeholder="BS"
                      @input="form.code = form.code.toUpperCase()"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Release Date *</label>
                    <input 
                      v-model="form.releaseDate"
                      type="date"
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Total Cards *</label>
                    <input 
                      v-model.number="form.totalCards"
                      type="number"
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="102"
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

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                  <input 
                    v-model="form.logo"
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
                    {{ isSubmitting ? 'Adding...' : 'Add Set' }}
                  </button>
                  <button 
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

          <!-- Sets List -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">All Sets</h3>
            </div>
            <div class="card-body">
              <div v-if="isLoading" class="text-center py-8">
                <p class="text-gray-600">Loading sets...</p>
              </div>
              <div v-else-if="sets.length === 0" class="text-center py-8">
                <p class="text-gray-600">No sets found. Add your first set!</p>
              </div>
              <div v-else class="space-y-2">
                <div 
                  v-for="set in sets" 
                  :key="set.id"
                  class="flex justify-between items-center p-3 border border-gray-200 rounded hover:bg-gray-50"
                >
                  <div>
                    <p class="font-medium text-gray-900">{{ set.name }}</p>
                    <p class="text-sm text-gray-600">
                      {{ set.code }} • {{ set.totalCards }} cards • {{ formatDate(set.releaseDate) }}
                    </p>
                  </div>
                  <div class="flex gap-2">
                    <button 
                      @click="editSet(set)"
                      class="btn btn-h6 btn-ghost"
                    >
                      Edit
                    </button>
                    <button 
                      @click="deleteSet(set.id)"
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
import { getAllSets } from '../utils/firebasePokemon'
import { Timestamp } from 'firebase/firestore'

const sets = ref([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const editingSet = ref(null)

const form = ref({
  name: '',
  code: '',
  releaseDate: '',
  series: '',
  totalCards: null,
  logo: ''
})

const resetForm = () => {
  form.value = {
    name: '',
    code: '',
    releaseDate: '',
    series: '',
    totalCards: null,
    logo: ''
  }
  editingSet.value = null
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  if (date instanceof Timestamp) {
    return date.toDate().toLocaleDateString()
  }
  if (date instanceof Date) {
    return date.toLocaleDateString()
  }
  return date
}

const addSet = async () => {
  isSubmitting.value = true
  try {
    // Note: Set creation/editing should be done through the Admin panel or seeder
    alert('Set management is handled through the Admin panel. Please use the simplified admin interface.')
    resetForm()
  } catch (error) {
    alert(`Error: ${error.message}`)
  } finally {
    isSubmitting.value = false
  }
}

const editSet = (set) => {
  editingSet.value = set
  form.value = {
    name: set.name,
    code: set.code,
    releaseDate: set.releaseDate instanceof Timestamp 
      ? set.releaseDate.toDate().toISOString().split('T')[0]
      : set.releaseDate,
    series: set.series || '',
    totalCards: set.totalCards,
    logo: set.logo || ''
  }
}

const deleteSet = async (setId) => {
  if (!confirm('Are you sure you want to delete this set?')) return
  
  // Note: Set deletion should be done through Firestore console or Admin panel
  alert('Set deletion is handled through the Admin panel. Please use the simplified admin interface.')
}

const loadSets = async () => {
  isLoading.value = true
  try {
    const result = await getAllSets()
    if (result.success) {
      sets.value = result.data
    }
  } catch (error) {
    console.error('Error loading sets:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadSets()
})
</script>

