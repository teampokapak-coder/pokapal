<template>
  <div class="min-h-screen" style="background-color: var(--color-bg-primary);">
    <section class="section section-spacing-md">
      <div class="section-container">
        <div class="section-header">
          <h2>All Sets</h2>
          <p class="section-subtitle">Browse all Pokemon TCG sets</p>
        </div>

        <!-- Search and Filters -->
        <div class="mb-6">
          <div class="flex gap-4 flex-wrap">
            <!-- Search -->
            <div class="flex-1 min-w-[200px]">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search sets..."
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                @input="debouncedSearch"
              />
            </div>

            <!-- Series Filter -->
            <select
              v-model="filterSeries"
              class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              @change="applyFilters"
            >
              <option value="">All Series</option>
              <option v-for="series in uniqueSeries" :key="series" :value="series">
                {{ series }}
              </option>
            </select>
          </div>
        </div>

        <!-- Sets Grid -->
        <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div v-for="i in 12" :key="i" class="card animate-pulse">
            <div class="aspect-square bg-gray-200 rounded-t-lg"></div>
            <div class="card-body">
              <div class="h-4 bg-gray-200 rounded mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>

        <div v-else-if="filteredSets.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div
            v-for="set in filteredSets"
            :key="set.id"
            class="card hover:shadow-lg transition-all cursor-pointer group"
            @click="handleSetClick(set)"
          >
            <!-- Set Image -->
            <div class="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-lg flex items-center justify-center overflow-hidden">
              <div v-if="set.logo" class="w-full h-full flex items-center justify-center">
                <img :src="set.logo" :alt="set.name" class="max-w-full max-h-full object-contain" />
              </div>
              <div v-else class="text-6xl font-bold text-gray-400">
                {{ set.code?.substring(0, 2).toUpperCase() || '?' }}
              </div>
            </div>
            
            <div class="card-body">
              <h3 class="card-title mb-1 group-hover:text-gray-900">{{ set.name }}</h3>
              <p class="text-xs text-gray-500 mb-2">{{ set.series }}</p>
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-600">{{ set.totalCards || 0 }} cards</span>
                <span v-if="set.releaseDate" class="text-gray-500">
                  {{ formatDate(set.releaseDate) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <p class="text-gray-600">No sets found.</p>
          <p class="text-sm text-gray-500 mt-2">Try adjusting your search or filters.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllSets } from '../utils/firebasePokemon'
import { Timestamp } from 'firebase/firestore'

const router = useRouter()

const sets = ref([])
const isLoading = ref(false)
const searchQuery = ref('')
const filterSeries = ref('')
const searchTimeout = ref(null)

const uniqueSeries = computed(() => {
  const seriesSet = new Set()
  sets.value.forEach(set => {
    if (set.series) seriesSet.add(set.series)
  })
  return Array.from(seriesSet).sort()
})

const filteredSets = computed(() => {
  let filtered = sets.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(set => 
      set.name?.toLowerCase().includes(query) ||
      set.code?.toLowerCase().includes(query) ||
      set.series?.toLowerCase().includes(query)
    )
  }

  // Series filter
  if (filterSeries.value) {
    filtered = filtered.filter(set => set.series === filterSeries.value)
  }

  // Sort by release date (newest first)
  filtered.sort((a, b) => {
    const dateA = a.releaseDate instanceof Timestamp ? a.releaseDate.toDate() : new Date(a.releaseDate || 0)
    const dateB = b.releaseDate instanceof Timestamp ? b.releaseDate.toDate() : new Date(b.releaseDate || 0)
    return dateB - dateA
  })

  return filtered
})

const formatDate = (date) => {
  if (!date) return 'N/A'
  if (date instanceof Timestamp) {
    return date.toDate().getFullYear()
  }
  if (date instanceof Date) {
    return date.getFullYear()
  }
  return date
}

const debouncedSearch = () => {
  clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    // Search is handled by computed property
  }, 300)
}

const applyFilters = () => {
  // Filters are reactive, no action needed
}

const handleSetClick = (set) => {
  router.push(`/set/${set.id}`)
}

const loadSets = async () => {
  isLoading.value = true
  try {
    const result = await getAllSets()
    if (result.success) {
      sets.value = result.data || []
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

