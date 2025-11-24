<template>
  <!-- List Mode (for sidebar) -->
  <button
    v-if="mode === 'list'"
    @click="handleClick"
    class="w-full text-left px-3 py-2 text-sm rounded sidebar-hover transition-colors"
  >
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 pokemon-image-bg rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
        <img 
          v-if="spriteUrl" 
          :src="spriteUrl" 
          :alt="pokemon.displayName || pokemon.name"
          class="w-full h-full object-contain p-1"
          @error="handleImageError"
        />
        <span v-else class="text-xs font-medium">
          {{ getPokemonInitial(pokemon.displayName || pokemon.name) }}
        </span>
      </div>
      <div class="flex-1 min-w-0">
        <p class="truncate list-item-title">{{ pokemon.displayName || pokemon.name }}</p>
        <p v-if="pokemon.cardCount" class="text-xs">
          {{ pokemon.cardCount }} {{ pokemon.cardCount === 1 ? 'card' : 'cards' }}
        </p>
      </div>
    </div>
  </button>

  <!-- Card/Grid Mode (default) -->
  <div
    v-else
    class="card hover:shadow-lg transition-all cursor-pointer group"
    :class="cardClasses"
    @click="handleClick"
  >
    <!-- Pokemon Image -->
    <div class="aspect-square pokemon-image-bg rounded-t-lg flex items-center justify-center overflow-hidden p-1">
      <img 
        v-if="spriteUrl" 
        :src="spriteUrl" 
        :alt="pokemon.displayName || pokemon.name" 
        class="w-full h-full object-contain"
        @error="handleImageError"
      />
      <div v-else class="text-xl sm:text-2xl font-bold" style="color: var(--color-text-tertiary);">
        {{ getPokemonInitial(pokemon.displayName || pokemon.name) }}
      </div>
    </div>
    
    <div class="card-body p-1.5 sm:p-2">
      <h6 class="mb-0.5 truncate text-xs font-medium">
        {{ pokemon.displayName || pokemon.name }}
      </h6>
      <div class="flex items-center gap-0.5 flex-wrap">
        <span 
          v-for="type in pokemon.types?.slice(0, 1)" 
          :key="type"
          class="text-[10px] px-1 py-0.5 rounded"
          style="background-color: var(--color-bg-tertiary); color: var(--color-text-primary);"
        >
          {{ type }}
        </span>
        <span v-if="pokemon.cardCount" class="text-[10px] leading-tight" style="color: var(--color-text-tertiary);">
          {{ pokemon.cardCount }}
        </span>
      </div>
      <div v-if="pokemon.nationalDexNumber" class="text-[10px] mt-0.5" style="color: var(--color-text-tertiary);">
        #{{ pokemon.nationalDexNumber }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getPokemonDBSprites } from '../utils/pokemondb'
import { getRecommendedGeneration } from '../utils/spriteValidator'
import { normalizePokemonName } from '../utils/pokemonGrouping'

const props = defineProps({
  pokemon: {
    type: Object,
    required: true
  },
  mode: {
    type: String,
    default: 'card', // 'card' or 'list'
    validator: (value) => ['card', 'list'].includes(value)
  },
  cardClasses: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click'])

// Get the best sprite URL for a Pokemon with fallbacks
const spriteUrl = computed(() => {
  const pokemon = props.pokemon
  if (!pokemon) return null
  
  // Priority order (sprite fields only):
  // 1. Top-level spriteUrl
  // 2. spriteUrls.normal (most reliable nested field)
  // 3. spriteUrls.spriteUrl
  // 4. Alternative sprite generations
  
  if (pokemon.spriteUrl) {
    return pokemon.spriteUrl
  }
  
  // Check spriteUrls.normal first (this is the most common nested field)
  if (pokemon.spriteUrls && pokemon.spriteUrls.normal) {
    return pokemon.spriteUrls.normal
  }
  
  if (pokemon.spriteUrls && pokemon.spriteUrls.spriteUrl) {
    return pokemon.spriteUrls.spriteUrl
  }
  
  // Try alternative sprite generations
  if (pokemon.spriteUrls && pokemon.spriteUrls.alternateGenerations) {
    const altSprites = pokemon.spriteUrls.alternateGenerations
    // Try recommended generations first
    if (altSprites['scarlet-violet']) return altSprites['scarlet-violet']
    if (altSprites['sword-shield']) return altSprites['sword-shield']
    if (altSprites['diamond-pearl']) return altSprites['diamond-pearl']
    if (altSprites['x-y']) return altSprites['x-y']
    if (altSprites['black-white']) return altSprites['black-white']
  }
  
  return null
})

const getPokemonInitial = (name) => {
  return name ? name.charAt(0).toUpperCase() : '?'
}

const handleImageError = (event) => {
  // If sprite failed, try to generate one using the base Pokemon name
  if (!props.pokemon || !props.pokemon.nationalDexNumber || !props.pokemon.name) {
    event.target.style.display = 'none'
    return
  }
  
  // Always use base Pokemon name (never variation names)
  const baseName = props.pokemon.name // This is already the base name from pokemonList.json
  const normalizedName = normalizePokemonName(baseName)
  
  try {
    // Generate sprite using base Pokemon name
    const generation = getRecommendedGeneration(props.pokemon.nationalDexNumber)
    const sprites = getPokemonDBSprites(normalizedName, props.pokemon.nationalDexNumber, generation)
    
    // Only use if it's different from the failed URL
    if (sprites.spriteUrl && event.target.src !== sprites.spriteUrl) {
      event.target.src = sprites.spriteUrl
      return
    }
  } catch (error) {
    // Silently fail - just hide the image
  }
  
  // All fallbacks failed - hide image
  event.target.style.display = 'none'
}

const handleClick = () => {
  emit('click', props.pokemon)
}
</script>

