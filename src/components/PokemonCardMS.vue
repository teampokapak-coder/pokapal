<template>
  <div class="flex flex-col">
    <!-- Card Container -->
    <div
      class="relative aspect-[3/4] sm:aspect-square rounded overflow-hidden border-2 transition-all cursor-pointer group"
      :class="[cardClasses, !isCollectedComputed ? 'uncollected-card' : '']"
      :style="cardStyle"
      @click="handleCardClick"
    >
      <img
        v-if="getCardImageUrl(card) && !imageError"
        :src="getCardImageUrl(card)"
        :alt="card.name"
        class="w-full h-full object-contain transition-opacity duration-300"
        :style="{ opacity: isCollectedComputed ? 1 : 0.75 }"
        @error="handleImageError"
      />
      <div v-else class="w-full h-full flex items-center justify-center font-bold text-lg transition-opacity duration-300" :style="{ opacity: isCollectedComputed ? 1 : 0.75, color: 'var(--color-text-tertiary)', background: 'linear-gradient(135deg, var(--color-bg-tertiary), var(--color-bg-secondary))' }">
        {{ getCardFallbackText(card) }}
      </div>
      
      <!-- Card Name Tooltip -->
      <div v-if="showNameTooltip" class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 text-center truncate opacity-0 group-hover:opacity-100 transition-opacity z-10">
        {{ formatCardName(card) }}
      </div>
      
      <!-- Collection Checkmark Overlay (top-right corner) -->
      <Transition name="checkmark">
        <div
          v-if="isCollectedComputed"
          class="absolute top-1.5 right-1.5 bg-green-500 rounded-full p-1 shadow-lg z-20"
        >
          <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </Transition>
      
      <!-- Small Pokeball Icon (bottom-right corner, always visible for uncollected) -->
      <Transition name="pokeball">
        <div
          v-if="!isCollectedComputed"
          class="absolute bottom-1.5 right-1.5 z-20"
        >
          <img
            :src="currentPokeballIcon"
            alt="Not collected"
            class="w-5 h-5 sm:w-6 sm:h-6 opacity-60"
            draggable="false"
          />
        </div>
      </Transition>
    </div>
    
    <!-- Collect Button (below card, only for uncollected cards) -->
    <Transition name="button">
      <button
        v-if="!isCollectedComputed && showCollectionButton"
      @click.stop="handleToggleCollected"
      class="mt-1.5 w-full py-1.5 px-2 text-xs sm:text-sm font-medium rounded transition-all collection-button"
      :class="isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'"
    >
      <span class="flex items-center justify-center gap-1.5">
        <img
          :src="currentPokeballIcon"
          alt="Collect"
          class="w-3 h-3 sm:w-4 sm:h-4"
          draggable="false"
        />
        <span>Collect</span>
      </span>
      </button>
    </Transition>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { formatCardName } from '../utils/cardNameFormatter'
import { getCardFallbackText } from '../utils/cardImageFallback'

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

// Use white pokeball in dark mode, regular in light mode
const currentPokeballIcon = computed(() => {
  return isDarkMode.value ? pokeballWhiteIconPath : pokeballIconPath
})

// Get card image URL
const getCardImageUrl = (card) => {
  if (!card) return null
  
  // For Japanese cards, prefer English image if available
  if (card.language === 'ja' && card.englishImageUrl) {
    return card.englishImageUrl
  }
  
  // Use convenience fields first, then fallback to API image field
  return card.imageUrl || card.thumbnailUrl || card.image || null
}

const props = defineProps({
  card: {
    type: Object,
    required: true
  },
  isCollected: {
    type: Boolean,
    default: false
  },
  showCollectionButton: {
    type: Boolean,
    default: true
  },
  cardClasses: {
    type: String,
    default: ''
  },
  showNameTooltip: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'toggle-collected'])

const imageError = ref(false)

// Computed property to ensure reactivity for isCollected
// This ensures Vue tracks changes to both the prop and the card object
const isCollectedComputed = computed(() => {
  // Use prop first (most reliable), fallback to card.isCollected for reactivity
  return props.isCollected !== undefined ? props.isCollected : (props.card?.isCollected || false)
})

// Reset image error when card changes
watch(() => props.card?.id, () => {
  imageError.value = false
})

const cardStyle = computed(() => {
  const baseStyle = {
    backgroundColor: 'var(--color-bg-tertiary)',
    borderColor: isCollectedComputed.value ? 'var(--color-border)' : 'var(--color-border)'
  }
  
  // Don't reduce overall opacity - let individual elements handle their own opacity
  // This keeps the card more visible and clickable
  
  return baseStyle
})

const handleImageError = (event) => {
  imageError.value = true
  if (event.target) {
    event.target.style.display = 'none'
  }
}

const handleCardClick = (event) => {
  // Always open modal when clicking the card itself
  // Collection button handles its own click separately
  emit('click', props.card)
}

const handleToggleCollected = (event) => {
  event.stopPropagation()
  event.preventDefault()
  emit('toggle-collected', props.card)
}
</script>

<style scoped>
.uncollected-card {
  /* Subtle visual indicator that card is not collected */
  border-color: var(--color-border);
  border-style: dashed; /* Dashed border to indicate uncollected */
  border-width: 2px;
}

.uncollected-card:hover {
  /* Make it fully visible and interactive on hover */
  border-style: solid;
  border-color: var(--color-border-hover, var(--color-border));
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Ensure card is always clickable */
.uncollected-card,
.uncollected-card * {
  pointer-events: auto;
  cursor: pointer;
}

/* Collection button styling */
.collection-button {
  cursor: pointer;
  border: none;
  outline: none;
}

.collection-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.collection-button:active {
  transform: translateY(0);
}

/* Transition animations for reactive updates */
.checkmark-enter-active,
.checkmark-leave-active {
  transition: all 0.3s ease;
}

.checkmark-enter-from {
  opacity: 0;
  transform: scale(0);
}

.checkmark-leave-to {
  opacity: 0;
  transform: scale(0);
}

.pokeball-enter-active,
.pokeball-leave-active {
  transition: all 0.3s ease;
}

.pokeball-enter-from {
  opacity: 0;
  transform: scale(0);
}

.pokeball-leave-to {
  opacity: 0;
  transform: scale(0);
}

.button-enter-active,
.button-leave-active {
  transition: all 0.3s ease;
}

.button-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.button-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

