<template>
  <div
    v-if="card"
    :class="[
      'fixed inset-0 flex bg-black/50 z-50',
      isAppShell
        ? 'z-[400] items-stretch justify-stretch p-0 bg-black/90'
        : 'items-center justify-center p-4',
    ]"
    @click="handleClose"
  >
    <div
      :class="[
        'rounded-lg w-full overflow-y-auto',
        isAppShell ? 'max-h-[100dvh] h-full max-w-none rounded-none' : 'max-w-2xl max-h-[90vh]',
      ]"
      style="background-color: var(--color-bg-tertiary);"
      @click.stop
    >
      <div
        :class="[
          'p-6',
          isAppShell &&
            'pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]',
        ]"
      >
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
              @error="handleImageErrorWithFallback"
            />
            <div v-else class="text-6xl font-bold" style="color: var(--color-text-tertiary);">
              {{ getCardFallbackText(card) }}
            </div>
          </div>
          <div class="space-y-4">
            <!-- Action Buttons -->
            <div v-if="user && user.uid" class="flex gap-3">
              <!-- Collected Button -->
              <button
                @click="handleToggleCollected"
                :disabled="isLoadingCollected"
                :class="isCollected 
                  ? 'btn btn-h4 btn-secondary' 
                  : 'btn btn-h4 btn-primary'"
                class="flex-1 flex items-center justify-center gap-2"
              >
                <img
                  :src="isCollected ? pokeballFillIconPath : pokeballIconPath"
                  alt="Poké Ball"
                  class="w-5 h-5"
                />
                <span>{{ isCollected ? 'Collected' : 'Collect' }}</span>
              </button>
              <!-- Heart Button -->
              <button
                @click="handleToggleHeart"
                :disabled="isLoadingHeart"
                :class="isHearted 
                  ? 'btn btn-h4 btn-secondary' 
                  : 'btn btn-h4 btn-primary'"
                class="flex-1 flex items-center justify-center gap-2"
              >
                <svg
                  class="w-5 h-5"
                  :fill="isHearted ? '#ef4444' : 'none'"
                  :stroke="isHearted ? '#ef4444' : 'currentColor'"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{{ isHearted ? 'Hearted' : 'Heart' }}</span>
              </button>
            </div>
            <!-- Login Prompt Button (when not logged in) -->
            <div v-else>
              <button
                @click="handleLoginClick"
                class="btn btn-h4 btn-outline w-full"
              >
                Login to start collecting
              </button>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-2">Set Information</h4>
              <p class="text-sm text-gray-600">{{ formatSetName(card) }}</p>
              <p v-if="card.localId" class="text-sm text-gray-600">#{{ card.localId }}</p>
              <p v-if="formatSeriesName(card)" class="text-sm text-gray-500 mt-1">{{ formatSeriesName(card) }}</p>
            </div>
            <div v-if="card.types && card.types.length > 0">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Types</h4>
              <div class="flex gap-2">
                <span
                  v-for="type in card.types"
                  :key="type"
                  :class="getTypeColor(type)"
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
            <div v-if="card.illustrator">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Artist</h4>
              <p class="text-sm text-gray-600">{{ card.illustrator }}</p>
            </div>
            <!-- Variants - only show if true -->
            <div v-if="hasVariants(card)">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Variants</h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-if="card.variants?.holo"
                  class="px-2 py-1 rounded text-xs font-medium"
                  style="background-color: var(--color-bg-tertiary); color: var(--color-text-primary);"
                >
                  ✨ Holo
                </span>
                <span
                  v-if="card.variants?.reverse"
                  class="px-2 py-1 rounded text-xs font-medium"
                  style="background-color: var(--color-bg-tertiary); color: var(--color-text-primary);"
                >
                  🔄 Reverse Holo
                </span>
                <span
                  v-if="card.variants?.firstEdition"
                  class="px-2 py-1 rounded text-xs font-medium"
                  style="background-color: var(--color-bg-tertiary); color: var(--color-text-primary);"
                >
                  1️⃣ First Edition
                </span>
                <span
                  v-if="card.variants?.wPromo"
                  class="px-2 py-1 rounded text-xs font-medium"
                  style="background-color: var(--color-bg-tertiary); color: var(--color-text-primary);"
                >
                  🎁 W Promo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useAppShell } from '../app/composables/useAppShell'
import { getTypeColorClass } from '../utils/pokemonTypes'
import { formatCardName } from '../utils/cardNameFormatter'
import { formatSetName, formatSeriesName } from '../utils/setNameFormatter'
import { getCardFallbackText } from '../utils/cardImageFallback'
import { heartCard, unheartCard, isCardHearted } from '../utils/hearts'
import { toggleCardCollected, getCollectedCardIds } from '../utils/userCards'

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

// Handle image errors by trying fallback formats
const handleImageErrorWithFallback = (event) => {
  const img = event.target
  const currentSrc = img.src
  
  // If it's a .webp URL, try .jpg instead
  if (currentSrc.includes('.webp')) {
    const jpgUrl = currentSrc.replace('.webp', '.jpg')
    img.src = jpgUrl
    return
  }
  
  // If it's a /high.webp URL, try /high.jpg
  if (currentSrc.includes('/high.webp')) {
    const jpgUrl = currentSrc.replace('/high.webp', '/high.jpg')
    img.src = jpgUrl
    return
  }
  
  // If it's a /low.webp URL, try /low.jpg
  if (currentSrc.includes('/low.webp')) {
    const jpgUrl = currentSrc.replace('/low.webp', '/low.jpg')
    img.src = jpgUrl
    return
  }
  
  // If all else fails, hide the image
  handleImageError(event)
}

// Poké Ball icon paths (static assets from public folder)
const pokeballIconPath = '/pokeball.svg'
const pokeballFillIconPath = '/pokeball_fill.svg'
const pokeballWhiteIconPath = '/pokeball_white.svg'

const props = defineProps({
  card: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'collection-changed', 'login'])

const { user } = useAuth()
const { isAppShell } = useAppShell()

const imageError = ref(false)
const isHearted = ref(false)
const isCollected = ref(false)
const isLoadingHeart = ref(false)
const isLoadingCollected = ref(false)

// Load both heart and collected status when card changes
watch(() => props.card?.id, async () => {
  imageError.value = false
  if (props.card && user.value && user.value.uid) {
    await Promise.all([loadHeartStatus(), loadCollectedStatus()])
  } else {
    isHearted.value = false
    isCollected.value = false
  }
})

// Load status when user changes
watch(() => user.value, async (newUser) => {
  if (props.card && newUser && newUser.uid) {
    await Promise.all([loadHeartStatus(), loadCollectedStatus()])
  } else {
    isHearted.value = false
    isCollected.value = false
  }
}, { immediate: true })

// Load status on mount
onMounted(async () => {
  if (props.card && user.value && user.value.uid) {
    await Promise.all([loadHeartStatus(), loadCollectedStatus()])
  }
})

const loadHeartStatus = async () => {
  if (!user.value || !user.value.uid || !props.card?.id) {
    isHearted.value = false
    return
  }
  
  try {
    isHearted.value = await isCardHearted(user.value.uid, props.card.id)
  } catch (error) {
    console.error('Error loading heart status:', error)
    isHearted.value = false
  }
}

const loadCollectedStatus = async () => {
  if (!user.value || !user.value.uid || !props.card) {
    isCollected.value = false
    return
  }
  
  try {
    const cardApiId = props.card.cardId || props.card.apiId || props.card.id
    const collectedSet = await getCollectedCardIds(user.value.uid, [cardApiId])
    isCollected.value = collectedSet.has(cardApiId)
  } catch (error) {
    console.error('Error loading collected status:', error)
    isCollected.value = false
  }
}

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

const handleLoginClick = () => {
  emit('login')
  emit('close') // Close card modal when opening login modal
}

const handleToggleCollected = async () => {
  if (!user.value || !user.value.uid || !props.card || isLoadingCollected.value) return
  
  isLoadingCollected.value = true
  try {
    const cardApiId = props.card.cardId || props.card.apiId || props.card.id
    const result = await toggleCardCollected(user.value.uid, cardApiId)
    if (result.success) {
      const newCollectedState = !isCollected.value
      isCollected.value = newCollectedState
      
      // Emit event to parent with the card and new collection state
      emit('collection-changed', {
        card: props.card,
        isCollected: newCollectedState
      })
    }
  } catch (error) {
    console.error('Error toggling collected:', error)
  } finally {
    isLoadingCollected.value = false
  }
}

const handleToggleHeart = async () => {
  if (!user.value || !user.value.uid || !props.card || isLoadingHeart.value) return
  
  isLoadingHeart.value = true
  try {
    if (isHearted.value) {
      const result = await unheartCard(user.value.uid, props.card.id)
      if (result.success) {
        isHearted.value = false
      }
    } else {
      const result = await heartCard(
        user.value.uid,
        props.card.id,
        props.card.cardId || props.card.apiId || '',
        props.card.name || ''
      )
      if (result.success) {
        isHearted.value = true
      }
    }
  } catch (error) {
    console.error('Error toggling heart:', error)
  } finally {
    isLoadingHeart.value = false
  }
}

// Check if card has any variants
const hasVariants = (card) => {
  if (!card || !card.variants) return false
  return card.variants.holo || 
         card.variants.reverse || 
         card.variants.firstEdition || 
         card.variants.wPromo ||
         card.variants.normal
}
</script>

