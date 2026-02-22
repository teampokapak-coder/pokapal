<template>
  <div class="min-h-screen" style="background-color: var(--color-bg-primary);">
    <section class="section section-spacing-md">
      <div class="section-container">
        <div class="section-header">
          <h2>Browse Trainers</h2>
          <p class="section-subtitle">Search and explore trainers</p>
        </div>

        <!-- Mobile Filter Toggle Button -->
        <div class="mb-4 md:hidden">
          <button
            @click="showMobileFilters = !showMobileFilters"
            class="btn btn-h5 btn-primary w-full flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {{ showMobileFilters ? 'Hide Filters' : 'Show Filters' }}
            <span v-if="hasActiveFilters" class="ml-1 px-2 py-0.5 rounded-full text-xs" style="background-color: var(--color-accent); color: white;">
              {{ activeFilterCount }}
            </span>
          </button>
        </div>

        <!-- Mobile Filter Overlay -->
        <div 
          v-if="showMobileFilters"
          class="fixed inset-0 bg-black bg-opacity-50 z-[100] md:hidden"
          @click="showMobileFilters = false"
        ></div>

        <div class="flex flex-col md:flex-row gap-4 md:gap-6">
          <!-- Filters Sidebar -->
          <aside 
            :class="[
              'w-full md:w-64 flex-shrink-0 transition-all duration-300',
              showMobileFilters ? 'fixed top-0 left-0 h-full z-[101] overflow-y-auto md:relative md:z-auto md:h-auto' : 'hidden md:block'
            ]"
          >
            <div class="card md:sticky md:top-4 h-full md:h-auto" style="background-color: var(--color-bg-primary);">
              <div class="card-header flex items-center justify-between">
                <h3 class="card-title">Filters</h3>
                <button
                  @click="showMobileFilters = false"
                  class="md:hidden p-1 rounded transition-colors"
                  style="color: var(--color-text-secondary);"
                  @mouseenter="$event.target.style.backgroundColor = 'var(--color-bg-secondary)'"
                  @mouseleave="$event.target.style.backgroundColor = 'transparent'"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="card-body space-y-4">
                <!-- Search -->
                <div>
                  <label class="block text-sm font-medium mb-2" style="color: var(--color-text-primary);">
                    Search
                  </label>
                  <input
                    v-model="filters.search"
                    type="text"
                    placeholder="Trainer name..."
                    class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                    style="border-color: var(--color-border);"
                    @input="debouncedSearch"
                  />
                </div>

                <!-- Sort By -->
                <div>
                  <label class="block text-sm font-medium mb-2" style="color: var(--color-text-primary);">
                    Sort By
                  </label>
                  <select
                    v-model="filters.sortBy"
                    class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                    style="border-color: var(--color-border);"
                    @change="applyFilters"
                  >
                    <option value="name">Name (A-Z)</option>
                  </select>
                </div>

                <!-- Clear Filters -->
                <button
                  @click="clearFilters"
                  class="btn btn-h5 btn-ghost w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </aside>

          <!-- Trainers Grid -->
          <main class="flex-1 min-w-0">
            <!-- Results Count -->
            <div class="mb-3 sm:mb-4">
              <p class="text-xs sm:text-sm" style="color: var(--color-text-secondary);">
                Showing {{ filteredTrainers.length }} of {{ trainers.length }} trainers
              </p>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="w-full">
              <LoadingSpinner />
            </div>

            <!-- Trainers Grid -->
            <div v-else-if="filteredTrainers.length > 0" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-1.5 sm:gap-2 md:gap-3">
              <TrainerListItem
                v-for="trainer in filteredTrainers"
                :key="trainer.id"
                :trainer="trainer"
                mode="card"
                @click="handleTrainerClick"
              />
            </div>

            <!-- Empty State -->
            <div v-else class="card">
              <div class="card-body text-center py-12">
                <p style="color: var(--color-text-secondary);">No trainers found matching your filters.</p>
                <button
                  @click="clearFilters"
                  class="btn btn-h4 btn-primary mt-4"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllTrainers } from '../utils/firebaseTrainers'
import TrainerListItem from '../components/TrainerListItem.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const router = useRouter()
const trainers = ref([])
const isLoading = ref(false)
const searchTimeout = ref(null)
const showMobileFilters = ref(false)

const filters = ref({
  search: '',
  sortBy: 'name'
})

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return !!filters.value.search
})

// Count active filters
const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.search) count++
  return count
})

const filteredTrainers = computed(() => {
  let filtered = trainers.value

  // Filter out hidden trainers (only show if hide is false or undefined)
  filtered = filtered.filter(t => !t.hide)

  // Search filter
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(t =>
      t.trainerName?.toLowerCase().includes(search)
    )
  }

  // Sort
  filtered = [...filtered].sort((a, b) => {
    if (filters.value.sortBy === 'name') {
      return (a.trainerName || '').localeCompare(b.trainerName || '')
    }
    return 0
  })

  return filtered
})

const debouncedSearch = () => {
  clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    applyFilters()
  }, 300)
}

const applyFilters = () => {
  // Filters are reactive, no action needed
}

const clearFilters = () => {
  filters.value = {
    search: '',
    sortBy: 'name'
  }
  // Close mobile filters after clearing
  showMobileFilters.value = false
}

const handleTrainerClick = (trainer) => {
  router.push(`/trainer/${trainer.id}`)
}

const loadTrainers = async () => {
  isLoading.value = true
  try {
    const allTrainers = await getAllTrainers()
    trainers.value = allTrainers
    console.log(`Loaded ${allTrainers.length} trainers`)
  } catch (error) {
    console.error('Error loading trainers:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  document.title = 'Trainers - Poképal'
  loadTrainers()
})
</script>
