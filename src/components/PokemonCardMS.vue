<template>
  <div
    class="relative aspect-[3/4] sm:aspect-square rounded overflow-hidden border-2 transition-all cursor-pointer group"
    :class="cardClasses"
    :style="cardStyle"
    @click="handleCardClick"
  >
    <img
      v-if="getCardImageUrl(card) && !imageError"
      :src="getCardImageUrl(card)"
      :alt="card.name"
      class="w-full h-full object-contain transition-opacity"
      :style="{ opacity: isCollected ? 1 : 0.5 }"
      @error="handleImageError"
    />
    <div v-else class="w-full h-full flex items-center justify-center font-bold text-lg transition-opacity" :style="{ opacity: isCollected ? 1 : 0.5, color: 'var(--color-text-tertiary)', background: 'linear-gradient(135deg, var(--color-bg-tertiary), var(--color-bg-secondary))' }">
      {{ getCardFallbackText(card) }}
    </div>
    
    <!-- Card Name Tooltip -->
    <div v-if="showNameTooltip" class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 text-center truncate opacity-0 group-hover:opacity-100 transition-opacity">
      {{ formatCardName(card) }}
    </div>
    
    <!-- Collection Checkmark Overlay -->
    <div
      v-if="isCollected"
      class="absolute top-2 right-2 bg-green-500 rounded-full p-1.5 shadow-lg z-50"
    >
      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    
    <!-- Collection Button (when not collected) -->
    <div
      v-if="!isCollected && showCollectionButton"
      class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all z-40"
      @click.stop="handleToggleCollected"
    >
      <div class="opacity-0 group-hover:opacity-100 transition-opacity relative">
        <!-- Pokeball Background -->
        <img
          :src="currentPokeballIcon"
          alt="Poké Ball"
          class="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-lg"
          draggable="false"
        />
        <!-- Plus Sign Overlay -->
        <div class="absolute inset-0 flex items-center justify-center">
          <svg class="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>
    </div>
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

// Reset image error when card changes
watch(() => props.card?.id, () => {
  imageError.value = false
})

const cardStyle = computed(() => {
  const baseStyle = {
    backgroundColor: 'var(--color-bg-tertiary)',
    borderColor: 'var(--color-border)'
  }
  
  // Add opacity to border when not collected
  if (!props.isCollected) {
    baseStyle.opacity = '0.5'
  }
  
  return baseStyle
})

const handleImageError = (event) => {
  imageError.value = true
  if (event.target) {
    event.target.style.display = 'none'
  }
}

const handleCardClick = (event) => {
  // Don't trigger if clicking on collection button
  if (event.target.closest('.collection-button')) {
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

