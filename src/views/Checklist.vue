<template>
  <div class="min-h-screen" style="background-color: var(--color-bg-primary);">
    <section class="section section-spacing-md">
      <div class="section-container">
        <div class="section-header">
          <h2>My Checklist</h2>
          <p class="section-subtitle">Track your collection progress</p>
        </div>

        <!-- Progress Overview -->
        <div v-if="checklists.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="card">
            <div class="card-body">
              <h4 class="text-sm text-gray-600 mb-2">Total Sets</h4>
              <p class="text-3xl font-bold text-gray-900">{{ checklists.length }}</p>
            </div>
          </div>
          <div class="card">
            <div class="card-body">
              <h4 class="text-sm text-gray-600 mb-2">Overall Progress</h4>
              <p class="text-3xl font-bold text-gray-900">{{ overallProgress }}%</p>
            </div>
          </div>
          <div class="card">
            <div class="card-body">
              <h4 class="text-sm text-gray-600 mb-2">Completed Sets</h4>
              <p class="text-3xl font-bold text-gray-900">{{ completedSets }}</p>
            </div>
          </div>
        </div>

        <!-- Checklist Items -->
        <div v-if="checklists.length > 0" class="space-y-4">
          <div 
            v-for="(checklist, index) in checklists" 
            :key="index"
            class="card"
          >
            <div class="card-header flex justify-between items-start">
              <div>
                <h3 class="card-title">{{ checklist.name }}</h3>
                <p class="card-subtitle">{{ checklist.description }}</p>
              </div>
              <button 
                @click="removeChecklist(index)"
                class="btn btn-h6 btn-ghost text-red-600"
              >
                Remove
              </button>
            </div>
            <div class="card-body">
              <!-- Progress Bar -->
              <div class="mb-4">
                <div class="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{{ checklist.completed }} / {{ checklist.total }} ({{ Math.round((checklist.completed / checklist.total) * 100) }}%)</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    class="bg-gray-900 h-3 rounded-full transition-all duration-300"
                    :style="{ width: `${(checklist.completed / checklist.total) * 100}%` }"
                  ></div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="flex gap-2">
                <button 
                  @click="incrementProgress(index)"
                  class="btn btn-h4 btn-primary"
                  :disabled="checklist.completed >= checklist.total"
                >
                  +1 Item
                </button>
                <button 
                  @click="decrementProgress(index)"
                  class="btn btn-h4 btn-secondary"
                  :disabled="checklist.completed <= 0"
                >
                  -1 Item
                </button>
                <router-link 
                  :to="`/checklist/${index}`"
                  class="btn btn-h4 btn-outline"
                >
                  View Details
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="card">
          <div class="card-body text-center py-12">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">No checklists yet</h3>
            <p class="text-gray-600 mb-6">Start by picking a random set or create a new checklist</p>
            <div class="flex gap-4 justify-center">
              <router-link to="/picker" class="btn btn-h3 btn-primary">
                Pick a Set
              </router-link>
              <button @click="createNewChecklist" class="btn btn-h3 btn-secondary">
                Create New
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const checklists = ref([])

const overallProgress = computed(() => {
  if (checklists.value.length === 0) return 0
  const total = checklists.value.reduce((sum, c) => sum + c.total, 0)
  const completed = checklists.value.reduce((sum, c) => sum + c.completed, 0)
  return Math.round((completed / total) * 100)
})

const completedSets = computed(() => {
  return checklists.value.filter(c => c.completed >= c.total).length
})

const loadChecklists = () => {
  const stored = localStorage.getItem('checklists')
  if (stored) {
    checklists.value = JSON.parse(stored)
  }
}

const saveChecklists = () => {
  localStorage.setItem('checklists', JSON.stringify(checklists.value))
}

const incrementProgress = (index) => {
  if (checklists.value[index].completed < checklists.value[index].total) {
    checklists.value[index].completed++
    saveChecklists()
  }
}

const decrementProgress = (index) => {
  if (checklists.value[index].completed > 0) {
    checklists.value[index].completed--
    saveChecklists()
  }
}

const removeChecklist = (index) => {
  if (confirm('Remove this checklist?')) {
    checklists.value.splice(index, 1)
    saveChecklists()
  }
}

const createNewChecklist = () => {
  const name = prompt('Enter checklist name:')
  if (name) {
    checklists.value.push({
      name,
      description: 'Custom checklist',
      type: 'Custom',
      completed: 0,
      total: 100,
      items: []
    })
    saveChecklists()
  }
}

onMounted(() => {
  loadChecklists()
})
</script>

