<template>
  <!-- Compact Mode -->
  <div
    v-if="compact"
    class="relative aspect-[3/4] sm:aspect-square rounded overflow-hidden border-2 transition-all cursor-pointer group"
    :class="cardClasses"
    style="background-color: var(--color-bg-tertiary); border-color: var(--color-border);"
    @mouseenter="$event.target.style.borderColor = 'var(--color-border-hover)'"
    @mouseleave="$event.target.style.borderColor = 'var(--color-border)'"
    @click="handleCardClick"
  >
    <img
      v-if="getCardImageUrl(card) && !imageError"
      :src="getCardImageUrl(card)"
      :alt="card.name"
      class="w-full h-full object-contain"
      @error="handleImageError"
    />
    <div v-else class="w-full h-full flex items-center justify-center font-bold text-lg" style="color: var(--color-text-tertiary); background: linear-gradient(135deg, var(--color-bg-tertiary), var(--color-bg-secondary));">
      {{ getCardFallbackText(card) }}
    </div>
    <!-- Card Name Tooltip -->
    <div v-if="showNameTooltip" class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 text-center truncate opacity-0 group-hover:opacity-100 transition-opacity">
      {{ formatCardName(card) }}
    </div>
    <!-- Heart Icon - Top Left (if logged in) -->
    <div
      v-if="showHeartIcon && user"
      class="heart-icon-container absolute top-2 left-2 cursor-pointer hover:scale-110 transition-transform z-50"
      @click.stop="handleToggleHeart"
      @mousedown.stop
      @mouseup.stop
      :title="isHearted ? 'Hearted - Click to unheart' : 'Click to heart'"
    >
      <svg
        :class="iconSize"
        :fill="isHearted ? '#ef4444' : 'none'"
        :stroke="isHearted ? '#ef4444' : 'currentColor'"
        stroke-width="2"
        viewBox="0 0 24 24"
        style="color: var(--color-text-primary); filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
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
    class="card hover:shadow-lg transition-all cursor-pointer"
    :class="cardClasses"
    @click="handleCardClick"
  >
    <!-- Card Image -->
    <div class="aspect-square rounded-t-lg flex items-center justify-center overflow-hidden p-1.5 sm:p-2 card-image-bg" style="background: linear-gradient(to bottom right, var(--color-bg-tertiary), var(--color-bg-secondary));">
      <img
        v-if="getCardImageUrl(card) && !imageError"
        :src="getCardImageUrl(card)"
        :alt="card.name"
        class="w-full h-full object-contain"
        @error="handleImageError"
      />
      <div v-else class="text-xl sm:text-2xl font-bold flex items-center justify-center w-full h-full" style="color: var(--color-text-tertiary); background: linear-gradient(135deg, var(--color-bg-tertiary), var(--color-bg-secondary));">
        {{ getCardFallbackText(card) }}
      </div>
    </div>

    <!-- Card Body - Clean Compact Info Section -->
    <div class="card-body p-2 sm:p-2.5 relative">
      <!-- Pokemon Name -->
      <h6 class="text-xs sm:text-sm font-medium truncate mb-1" style="color: var(--color-text-primary);">
        {{ formatCardName(card) }}
      </h6>
      
      <!-- Set Collection Name and Set Number (on one line) -->
      <div class="mb-1 flex items-center gap-1.5 flex-wrap">
        <p v-if="formattedSetName" class="text-[10px] sm:text-xs truncate flex-1 min-w-0" style="color: var(--color-text-secondary);">
          {{ formattedSetName }}
        </p>
        <p v-if="card.localId" class="text-[10px] sm:text-xs flex-shrink-0" style="color: var(--color-text-tertiary);">
          #{{ card.localId }}
        </p>
      </div>
      
      <!-- Bottom Row: Pokemon Type + Collection Button -->
      <div class="flex items-center justify-between gap-1.5 mt-1.5">
        <!-- Type Badges -->
        <div v-if="showTypes && card.types && card.types.length > 0" class="flex gap-1 flex-1 min-w-0">
          <span
            v-for="type in card.types.slice(0, 2)"
            :key="type"
            :class="getTypeColor(type)"
            class="whitespace-nowrap"
            style="font-size: 0.625rem; padding: 0.125rem 0.25rem; border-radius: 0.25rem;"
          >
            {{ type }}
          </span>
        </div>
        <div v-else class="flex-1"></div>
        
        <!-- Heart Icon (if logged in) -->
        <div
          v-if="showHeartIcon && user"
          class="heart-icon-container flex-shrink-0 cursor-pointer hover:scale-110 transition-transform mr-1"
          @click.stop="handleToggleHeart"
          @mousedown.stop
          @mouseup.stop
          :title="isHearted ? 'Hearted - Click to unheart' : 'Click to heart'"
        >
          <svg
            class="w-5 h-5 sm:w-6 sm:h-6"
            :fill="isHearted ? '#ef4444' : 'none'"
            :stroke="isHearted ? '#ef4444' : 'currentColor'"
            stroke-width="2"
            viewBox="0 0 24 24"
            style="color: var(--color-text-primary); filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <!-- Collection Icon SVG -->
        <div
          v-if="showCollectionIcon"
          class="pokeball-icon-container flex-shrink-0 cursor-pointer hover:scale-110 transition-transform"
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
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { getTypeColorClass } from '../utils/pokemonTypes'
import { formatCardName } from '../utils/cardNameFormatter'
import { formatSetName } from '../utils/setNameFormatter'
import { getCardFallbackText } from '../utils/cardImageFallback'
import { useAuth } from '../composables/useAuth'

const { user } = useAuth()

// Get card image URL - prefer English image for Japanese cards if available
const getCardImageUrl = (card) => {
  if (!card) return null
  
  // For Japanese cards, prefer English image if available
  if (card.language === 'ja' && card.englishImageUrl) {
    return card.englishImageUrl
  }
  
  // Use convenience fields first, then fallback to API image field
  return card.imageUrl || card.thumbnailUrl || card.image || null
}

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
  isHearted: {
    type: Boolean,
    default: false
  },
  showCollectionIcon: {
    type: Boolean,
    default: true
  },
  showHeartIcon: {
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

const emit = defineEmits(['click', 'toggle-collected', 'toggle-heart'])

const imageError = ref(false)

// Reset image error when card changes
watch(() => props.card?.id, () => {
  imageError.value = false
})

const getTypeColor = (type) => {
  return getTypeColorClass(type)
}

const handleImageError = (event) => {
  imageError.value = true
  // Hide the broken image
  if (event.target) {
    event.target.style.display = 'none'
  }
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

const handleToggleHeart = (event) => {
  event.stopPropagation()
  event.preventDefault()
  emit('toggle-heart', props.card)
}

const formattedSetName = computed(() => formatSetName(props.card))
</script>

