<template>
  <div class="min-h-screen" style="background-color: var(--color-bg-primary);">
    <section class="section section-spacing-md">
      <div class="section-container">
        <div class="section-header">
          <h2>Random Set Picker</h2>
          <p class="section-subtitle">Get a random set or series to start collecting</p>
        </div>

        <div class="max-w-2xl mx-auto">
          <!-- Current Selection Display -->
          <div v-if="selectedSet" class="card card-elevated mb-6">
            <div class="card-body text-center">
              <div class="mb-4">
                <div class="inline-block px-6 py-3 bg-gray-100 rounded-lg">
                  <h3 class="text-2xl font-semibold text-gray-900">{{ selectedSet.name }}</h3>
                </div>
              </div>
              <p class="text-gray-600 mb-4">{{ selectedSet.description }}</p>
              <div class="flex gap-2 justify-center">
                <span class="px-3 py-1 bg-gray-200 rounded text-sm text-gray-700">
                  {{ selectedSet.type }}
                </span>
                <span v-if="selectedSet.year" class="px-3 py-1 bg-gray-200 rounded text-sm text-gray-700">
                  {{ selectedSet.year }}
                </span>
              </div>
            </div>
          </div>

          <!-- Pack Simulator Feel -->
          <div v-if="isPicking" class="card mb-6">
            <div class="card-body text-center py-12">
              <div class="animate-pulse">
                <div class="inline-block w-24 h-32 bg-gray-300 rounded-lg mb-4"></div>
                <p class="text-gray-600">Picking your set...</p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              @click="pickRandomSet" 
              class="btn btn-h2 btn-primary"
              :disabled="isPicking"
            >
              {{ selectedSet ? 'Pick Another Set' : 'Pick a Random Set' }}
            </button>
            <button 
              v-if="selectedSet"
              @click="addToChecklist" 
              class="btn btn-h2 btn-secondary"
            >
              Add to My Checklist
            </button>
          </div>

          <!-- Recent Picks -->
          <div v-if="recentPicks.length > 0" class="mt-12">
            <h3 class="text-xl font-semibold mb-4">Recent Picks</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div 
                v-for="(pick, index) in recentPicks.slice(0, 6)" 
                :key="index"
                class="card card-flat p-3 text-center cursor-pointer hover:bg-gray-50"
                @click="selectSet(pick)"
              >
                <p class="text-sm font-medium text-gray-900">{{ pick.name }}</p>
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
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { allSets } from '../data/pokemonSets'

const selectedSet = ref(null)
const recentPicks = ref([])
const isPicking = ref(false)
const availableSets = ref([])
const useFirebase = ref(false)

// Load sets from Firebase or use local data
const loadSets = async () => {
  try {
    const setsRef = collection(db, 'sets')
    const snapshot = await getDocs(setsRef)
    
    if (snapshot.size > 0) {
      // Use Firebase data
      availableSets.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      useFirebase.value = true
    } else {
      // Fallback to local data
      availableSets.value = allSets
      useFirebase.value = false
    }
  } catch (error) {
    // Firebase not configured or error - use local data
    console.log('Using local sets data:', error.message)
    availableSets.value = allSets
    useFirebase.value = false
  }
}

const pickRandomSet = () => {
  if (availableSets.value.length === 0) {
    alert('No sets available. Please seed Firebase first.')
    return
  }
  
  isPicking.value = true
  
  // Simulate pack opening delay
  setTimeout(() => {
    const randomIndex = Math.floor(Math.random() * availableSets.value.length)
    const picked = availableSets.value[randomIndex]
    selectedSet.value = picked
    
    // Add to recent picks if not already there
    if (!recentPicks.value.find(p => p.name === picked.name)) {
      recentPicks.value.unshift(picked)
    }
    
    isPicking.value = false
  }, 1000)
}

onMounted(() => {
  loadSets()
})

const selectSet = (set) => {
  selectedSet.value = set
}

const addToChecklist = () => {
  if (selectedSet.value) {
    // Store in localStorage for now, will use Firebase later
    const checklists = JSON.parse(localStorage.getItem('checklists') || '[]')
    if (!checklists.find(c => c.name === selectedSet.value.name)) {
      checklists.push({
        ...selectedSet.value,
        completed: 0,
        total: selectedSet.value.totalCards || 100,
        items: []
      })
      localStorage.setItem('checklists', JSON.stringify(checklists))
    }
    alert(`Added ${selectedSet.value.name} to your checklist!`)
  }
}
</script>

