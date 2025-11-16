<template>
  <!-- Compact Mode -->
  <div
    v-if="compact"
    class="relative aspect-square rounded overflow-hidden border-2 transition-all cursor-pointer group"
    :class="cardClasses"
    style="background-color: var(--color-bg-tertiary); border-color: var(--color-border);"
    @mouseenter="$event.target.style.borderColor = 'var(--color-border-hover)'"
    @mouseleave="$event.target.style.borderColor = 'var(--color-border)'"
    @click="handleCardClick"
  >
    <img
      v-if="card.imageUrl || card.thumbnailUrl"
      :src="card.imageUrl || card.thumbnailUrl"
      :alt="card.name"
      class="w-full h-full object-contain"
      @error="handleImageError"
    />
    <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
    <!-- Card Name Tooltip -->
    <div v-if="showNameTooltip" class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 text-center truncate opacity-0 group-hover:opacity-100 transition-opacity">
      {{ card.name }}
    </div>
    <!-- Poké Ball Icon - Top Right (if collection enabled) -->
    <div
      v-if="showCollectionIcon"
      class="pokeball-icon-container absolute top-2 right-2 cursor-pointer hover:scale-110 transition-transform z-50"
      @click.stop="handleToggleCollected"
      @mousedown.stop
      @mouseup.stop
      :title="isCollected ? 'Collected - Click to remove' : 'Click to collect'"
    >
      <img
        :src="currentPokeballIcon"
        alt="Poké Ball"
        :class="iconSize"
        draggable="false"
      />
    </div>
  </div>

  <!-- Standard Mode -->
  <div
    v-else
    class="card hover:shadow-lg transition-all cursor-pointer relative"
    :class="cardClasses"
    @click="handleCardClick"
  >
    <!-- Card Image -->
    <div class="aspect-square rounded-t-lg flex items-center justify-center overflow-hidden p-2 card-image-bg" style="background: linear-gradient(to bottom right, var(--color-bg-tertiary), var(--color-bg-secondary));">
      <img 
        v-if="card.imageUrl || card.thumbnailUrl" 
        :src="card.imageUrl || card.thumbnailUrl" 
        :alt="card.name"
        class="w-full h-full object-contain"
        @error="handleImageError"
      />
      <div v-else class="text-2xl font-bold text-gray-400">
        {{ getCardInitial(card.name) }}
      </div>
    </div>

    <!-- Card Body -->
    <div class="card-body p-3 relative" style="z-index: 1;">
      <h6 class="mb-1 truncate">
        {{ card.name }}
      </h6>
      <p v-if="card.set" class="text-xs" style="color: var(--color-text-secondary);">{{ card.set }}</p>
      <p v-if="card.setNumber" class="text-xs" style="color: var(--color-text-tertiary);">{{ card.setNumber }}</p>
      
      <!-- Type Badges (optional) -->
      <div v-if="showTypes && card.types && card.types.length > 0" class="flex gap-1 mt-1">
        <span
          v-for="type in card.types.slice(0, 2)"
          :key="type"
          :class="getTypeColor(type)"
          class="px-1.5 py-0.5 rounded text-xs"
        >
          {{ type }}
        </span>
      </div>
    </div>

    <!-- Poké Ball Icon - Bottom Right (if collection enabled) - Outside card-body for proper z-index -->
    <div
      v-if="showCollectionIcon && !compact"
      class="pokeball-icon-container absolute bottom-2 right-2 cursor-pointer hover:scale-110 transition-transform z-50"
      @click.stop="handleToggleCollected"
      @mousedown.stop
      @mouseup.stop
      :title="isCollected ? 'Collected - Click to remove' : 'Click to collect'"
    >
      <img
        :src="currentPokeballIcon"
        alt="Poké Ball"
        :class="iconSize"
        draggable="false"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

// Poké Ball icon paths (static assets from public folder)
const pokeballIconPath = '/pokeball.svg'
const pokeballWhiteIconPath = '/pokeball_white.svg'
const pokeballFillIconPath = '/pokeball_fill.svg'

// Check for dark mode preference
const isDarkMode = ref(false)

onMounted(() => {
  // Check system preference
  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
  isDarkMode.value = darkModeQuery.matches
  
  // Listen for changes
  darkModeQuery.addEventListener('change', (e) => {
    isDarkMode.value = e.matches
  })
})

// Computed property for pokeball icon based on collection status and dark mode
const currentPokeballIcon = computed(() => {
  if (props.isCollected) {
    return pokeballFillIconPath
  }
  return isDarkMode.value ? pokeballWhiteIconPath : pokeballIconPath
})

const props = defineProps({
  card: {
    type: Object,
    required: true
  },
  isCollected: {
    type: Boolean,
    default: false
  },
  showCollectionIcon: {
    type: Boolean,
    default: true
  },
  showTypes: {
    type: Boolean,
    default: false
  },
  iconSize: {
    type: String,
    default: 'w-8 h-8'
  },
  cardClasses: {
    type: String,
    default: ''
  },
  compact: {
    type: Boolean,
    default: false
  },
  showNameTooltip: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'toggle-collected'])

const getCardInitial = (name) => {
  return name?.charAt(0).toUpperCase() || '?'
}

const getTypeColor = (type) => {
  const colors = {
    Fire: 'bg-red-100 text-red-800',
    Water: 'bg-blue-100 text-blue-800',
    Grass: 'bg-green-100 text-green-800',
    Electric: 'bg-yellow-100 text-yellow-800',
    Psychic: 'bg-purple-100 text-purple-800',
    Fighting: 'bg-orange-100 text-orange-800',
    Darkness: 'bg-gray-800 text-white',
    Metal: 'bg-gray-300 text-gray-800',
    Fairy: 'bg-pink-100 text-pink-800',
    Dragon: 'bg-indigo-100 text-indigo-800',
    Colorless: 'bg-gray-100 text-gray-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

const handleCardClick = (event) => {
  // Don't trigger if clicking on the Poké Ball icon
  if (event.target.closest('.pokeball-icon-container')) {
    return
  }
  emit('click', props.card)
}

const handleToggleCollected = (event) => {
  event.stopPropagation()
  event.preventDefault()
  emit('toggle-collected', props.card)
}
</script>

