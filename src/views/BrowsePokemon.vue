<template>
  <div class="min-h-screen" style="background-color: var(--color-bg-primary);">
    <section class="section section-spacing-md">
      <div class="section-container">
        <div class="section-header">
          <h2>Browse Pokemon</h2>
          <p class="section-subtitle">Search and explore Pokemon</p>
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
                    placeholder="Pokemon name..."
                    class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                    style="border-color: var(--color-border);"
                    @input="debouncedSearch"
                  />
                </div>

                <!-- Type Filter -->
                <div>
                  <label class="block text-sm font-medium mb-2" style="color: var(--color-text-primary);">
                    Type
                  </label>
                  <select
                    v-model="filters.type"
                    class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                    style="border-color: var(--color-border);"
                    @change="applyFilters"
                  >
                    <option value="">All Types</option>
                    <option value="Fire">Fire</option>
                    <option value="Water">Water</option>
                    <option value="Grass">Grass</option>
                    <option value="Electric">Electric</option>
                    <option value="Psychic">Psychic</option>
                    <option value="Fighting">Fighting</option>
                    <option value="Darkness">Darkness</option>
                    <option value="Metal">Metal</option>
                    <option value="Fairy">Fairy</option>
                    <option value="Dragon">Dragon</option>
                    <option value="Colorless">Colorless</option>
                  </select>
                </div>

                <!-- National Dex Number Filter -->
                <div>
                  <label class="block text-sm font-medium mb-2" style="color: var(--color-text-primary);">
                    National Dex #
                  </label>
                  <input
                    v-model.number="filters.dexNumber"
                    type="number"
                    placeholder="e.g. 25"
                    class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                    style="border-color: var(--color-border);"
                    @input="applyFilters"
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
                    <option value="dex">National Dex #</option>
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

          <!-- Pokemon Grid -->
          <main class="flex-1 min-w-0">
            <!-- Results Count -->
            <div class="mb-3 sm:mb-4">
              <p class="text-xs sm:text-sm" style="color: var(--color-text-secondary);">
                Showing {{ filteredPokemon.length }} of {{ pokemon.length }} Pokemon
              </p>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="w-full">
              <LoadingSpinner />
            </div>

            <!-- Pokemon Grid -->
            <div v-else-if="filteredPokemon.length > 0" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-1.5 sm:gap-2 md:gap-3">
              <PokemonListItem
                v-for="p in filteredPokemon"
                :key="p.id || p.name"
                :pokemon="p"
                mode="card"
                @click="handlePokemonClick"
              />
            </div>

            <!-- Empty State -->
            <div v-else class="card">
              <div class="card-body text-center py-12">
                <p style="color: var(--color-text-secondary);">No Pokemon found matching your filters.</p>
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
import { getAllPokemon, getAllPokemonCards } from '../utils/firebasePokemon'
import { groupPokemonByBase, generatePokemonListDocId } from '../utils/pokemonGrouping'
import PokemonListItem from '../components/PokemonListItem.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const router = useRouter()
const pokemon = ref([])
const isLoading = ref(false)
const searchTimeout = ref(null)
const showMobileFilters = ref(false)

const filters = ref({
  search: '',
  type: '',
  dexNumber: null,
  sortBy: 'dex'
})

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return !!(filters.value.search || filters.value.type || filters.value.dexNumber)
})

// Count active filters
const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.search) count++
  if (filters.value.type) count++
  if (filters.value.dexNumber) count++
  return count
})

const filteredPokemon = computed(() => {
  let filtered = pokemon.value

  // Search filter
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(p =>
      (p.displayName || p.name)?.toLowerCase().includes(search) ||
      p.nationalDexNumber?.toString().includes(search)
    )
  }

  // Type filter
  if (filters.value.type) {
    filtered = filtered.filter(p =>
      p.types && p.types.includes(filters.value.type)
    )
  }

  // Dex number filter
  if (filters.value.dexNumber) {
    filtered = filtered.filter(p =>
      p.nationalDexNumber === filters.value.dexNumber
    )
  }

  // Sort
  filtered = [...filtered].sort((a, b) => {
    if (filters.value.sortBy === 'dex') {
      if (a.nationalDexNumber && b.nationalDexNumber) {
        return a.nationalDexNumber - b.nationalDexNumber
      }
      if (a.nationalDexNumber) return -1
      if (b.nationalDexNumber) return 1
      return (a.displayName || a.name).localeCompare(b.displayName || b.name)
    } else if (filters.value.sortBy === 'name') {
      return (a.displayName || a.name).localeCompare(b.displayName || b.name)
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
    type: '',
    dexNumber: null,
    minCards: null,
    sortBy: 'dex'
  }
  // Close mobile filters after clearing
  showMobileFilters.value = false
}

const handlePokemonClick = (pokemon) => {
  // Navigate to Pokemon detail page using nationalDexNumber (preferred)
  if (pokemon.nationalDexNumber) {
    router.push(`/pokemon/${pokemon.nationalDexNumber}`)
  } else if (pokemon.id) {
    // Fallback: use document ID if no nationalDexNumber
    router.push(`/pokemon/${pokemon.id}`)
  }
}


const loadPokemon = async () => {
  isLoading.value = true
  try {
    // Load Pokemon from pokemon collection
    const result = await getAllPokemon()
    if (!result.success) {
      console.error('Failed to load Pokemon:', result.error)
      return
    }
    
    const allPokemonRaw = result.data || []
    
    // Use the grouping utility to get only base Pokemon (no variations like "Erika's Pikachu")
    const allPokemon = groupPokemonByBase(allPokemonRaw)
    
    // Sort by national dex number
    allPokemon.sort((a, b) => {
      if (a.nationalDexNumber && b.nationalDexNumber) {
        return a.nationalDexNumber - b.nationalDexNumber
      }
      if (a.nationalDexNumber) return -1
      if (b.nationalDexNumber) return 1
      return (a.displayName || a.name).localeCompare(b.displayName || a.name)
    })

    pokemon.value = allPokemon
    console.log(`Loaded ${allPokemon.length} Pokemon (${allPokemonRaw.length} documents from Firestore)`)
  } catch (error) {
    console.error('Error loading Pokemon:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadPokemon()
})
</script>

