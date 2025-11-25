<template>
  <div
    v-if="card"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click="handleClose"
  >
    <div
      class="rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      style="background-color: var(--color-bg-secondary);"
      @click.stop
    >
      <div class="p-6">
        <div class="flex justify-between items-start mb-4">
          <h3>{{ formatCardName(card) }}</h3>
          <button
            @click="handleClose"
            class="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <div class="grid md:grid-cols-2 gap-6">
          <div class="flex items-center justify-center min-h-[300px] rounded-lg" style="background: linear-gradient(135deg, var(--color-bg-tertiary), var(--color-bg-secondary));">
            <img
              v-if="getCardImageUrl(card) && !imageError"
              :src="getCardImageUrl(card)"
              :alt="card.name"
              class="w-full rounded-lg"
              @error="handleImageError"
            />
            <div v-else class="text-6xl font-bold" style="color: var(--color-text-tertiary);">
              {{ getCardFallbackText(card) }}
            </div>
          </div>
          <div class="space-y-4">
            <!-- Collected Button -->
            <div v-if="user">
              <button
                @click="handleToggleCollected"
                :class="isCollected 
                  ? 'btn btn-h4 btn-secondary' 
                  : 'btn btn-h4 btn-primary'"
              >
                <img
                  :src="isCollected ? pokeballFillIconPath : pokeballIconPath"
                  alt="Poké Ball"
                  class="w-5 h-5 inline mr-2"
                />
                {{ isCollected ? 'Remove from Collection' : 'Mark as Collected' }}
              </button>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-2">Set Information</h4>
              <p class="text-sm text-gray-600">{{ formatSetName(card) }}</p>
              <p v-if="card.setNumber" class="text-sm text-gray-600">#{{ card.setNumber }}</p>
              <p v-if="formatSeriesName(card)" class="text-sm text-gray-500 mt-1">{{ formatSeriesName(card) }}</p>
            </div>
            <div v-if="card.types && card.types.length > 0">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Types</h4>
              <div class="flex gap-2">
                <span
                  v-for="type in card.types"
                  :key="type"
                  :class="getTypeColor(type)"
                  class="px-2 py-1 rounded text-xs font-medium"
                >
                  {{ type }}
                </span>
              </div>
            </div>
            <div v-if="card.rarity">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Rarity</h4>
              <p class="text-sm text-gray-600">{{ card.rarity }}</p>
            </div>
            <div v-if="card.hp">
              <h4 class="text-sm font-medium text-gray-700 mb-2">HP</h4>
              <p class="text-sm text-gray-600">{{ card.hp }}</p>
            </div>
            <div v-if="card.artist">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Artist</h4>
              <p class="text-sm text-gray-600">{{ card.artist }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuth } from '../composables/useAuth'
import { getTypeColorClass } from '../utils/pokemonTypes'
import { formatCardName } from '../utils/cardNameFormatter'
import { formatSetName, formatSeriesName } from '../utils/setNameFormatter'
import { getCardFallbackText } from '../utils/cardImageFallback'

// Get card image URL - prefer English image for Japanese cards if available
const getCardImageUrl = (card) => {
  if (!card) return null
  
  // For Japanese cards, prefer English image if available
  if (card.language === 'ja' && card.englishImageUrl) {
    return card.englishImageUrl
  }
  
  // Otherwise use Japanese/English image
  return card.imageUrl || card.thumbnailUrl || null
}

// Poké Ball icon paths (static assets from public folder)
const pokeballIconPath = '/pokeball.svg'
const pokeballFillIconPath = '/pokeball_fill.svg'
const pokeballWhiteIconPath = '/pokeball_white.svg'

const props = defineProps({
  card: {
    type: Object,
    default: null
  },
  isCollected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'toggle-collected'])

const { user } = useAuth()

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

const handleClose = () => {
  emit('close')
  // Reset image error when modal closes
  imageError.value = false
}

const handleToggleCollected = () => {
  emit('toggle-collected', props.card)
}
</script>

