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
          <h3>{{ card.name }}</h3>
          <button
            @click="handleClose"
            class="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <img
              v-if="card.imageUrl || card.thumbnailUrl"
              :src="card.imageUrl || card.thumbnailUrl"
              :alt="card.name"
              class="w-full rounded-lg"
            />
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
              <p class="text-sm text-gray-600">{{ card.set }}</p>
              <p v-if="card.setNumber" class="text-sm text-gray-600">{{ card.setNumber }}</p>
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
import { useAuth } from '../composables/useAuth'

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

const handleClose = () => {
  emit('close')
}

const handleToggleCollected = () => {
  emit('toggle-collected', props.card)
}
</script>

