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
                class="w-full px-3 md:px-4 py-2 text-sm md:text-base border rounded-md focus:outline-none focus:ring-2"
                style="border-color: var(--color-border);"
                @input="debouncedSearch"
              />
            </div>

            <!-- Language Filter -->
            <select
              v-model="filterLanguage"
              class="px-3 md:px-4 py-2 text-sm md:text-base border rounded-md focus:outline-none focus:ring-2"
              style="border-color: var(--color-border);"
              @change="applyFilters"
            >
              <option value="en">English</option>
              <option value="ja">Japanese</option>
              <option value="">All Languages</option>
            </select>

            <!-- Series Filter -->
            <select
              v-model="filterSeries"
              class="px-3 md:px-4 py-2 text-sm md:text-base border rounded-md focus:outline-none focus:ring-2"
              style="border-color: var(--color-border);"
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
        <div v-if="isLoading" class="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-4">
          <div v-for="i in 12" :key="i" class="card animate-pulse">
            <div class="aspect-square bg-gray-200 rounded-t-lg"></div>
            <div class="card-body p-2 md:p-4">
              <div class="h-3 md:h-4 bg-gray-200 rounded mb-1 md:mb-2"></div>
              <div class="h-2 md:h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>

        <div v-else-if="filteredSets.length > 0" class="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-4">
          <div
            v-for="set in filteredSets"
            :key="set.id"
            class="card hover:shadow-lg transition-all cursor-pointer group"
            @click="handleSetClick(set)"
          >
            <!-- Set Image -->
            <div class="aspect-square rounded-t-lg flex items-center justify-center overflow-hidden" style="background-color: var(--color-bg-secondary);">
              <div v-if="getSetLogoUrl(set)" class="w-full h-full flex items-center justify-center p-2 md:p-4">
                <img :src="getSetLogoUrl(set)" :alt="formatSetDisplayName(set)" class="max-w-full max-h-full object-contain" />
              </div>
              <div v-else class="text-2xl md:text-6xl font-bold flex items-center justify-center w-full h-full" style="color: var(--color-text-tertiary); background: linear-gradient(135deg, var(--color-bg-tertiary), var(--color-bg-secondary));">
                {{ getSetIdInitials(set.apiId || set.code || set.id) }}
              </div>
            </div>
            
            <div class="card-body p-2 md:p-4">
              <h3 class="card-title mb-0.5 md:mb-1 text-xs md:text-base truncate">{{ formatSetDisplayName(set) }}</h3>
              <p class="text-[10px] md:text-xs mb-1 md:mb-2 truncate" style="color: var(--color-text-tertiary);">{{ formatSeriesDisplayName(set) }}</p>
              <div class="flex justify-between items-center text-[10px] md:text-sm">
                <span style="color: var(--color-text-secondary);">{{ set.totalCards || 0 }} cards</span>
                <span v-if="set.releaseDate" style="color: var(--color-text-tertiary);">
                  {{ formatDate(set.releaseDate) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <p style="color: var(--color-text-secondary);">No sets found.</p>
          <p class="text-sm mt-2" style="color: var(--color-text-tertiary);">Try adjusting your search or filters.</p>
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
import { getSetLogoUrl, formatSetDisplayName, formatSeriesDisplayName } from '../utils/setDisplayHelper'
import { getSetIdInitials } from '../utils/cardImageFallback'

const router = useRouter()

const sets = ref([])
const isLoading = ref(false)
const searchQuery = ref('')
const filterLanguage = ref('en') // Default to English
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

  // Language filter (default to English if no language field)
  if (filterLanguage.value) {
    filtered = filtered.filter(set => {
      // English sets: no language field OR language === 'en'
      // Japanese sets: language === 'ja'
      const setLanguage = set.language || 'en' // Default to 'en' if no language field
      return setLanguage === filterLanguage.value
    })
  }

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

