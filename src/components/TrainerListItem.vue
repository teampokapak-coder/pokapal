<template>
  <!-- List Mode (for sidebar) -->
  <button
    v-if="mode === 'list'"
    @click="handleClick"
    class="w-full text-left px-3 py-2 text-sm rounded sidebar-hover transition-colors"
  >
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 pokemon-image-bg rounded flex-shrink-0 flex items-center justify-center overflow-hidden relative">
        <img 
          v-if="trainer.icon" 
          :src="trainer.icon" 
          :alt="trainer.trainerName"
          class="w-full h-full object-contain p-1"
          @error="handleImageError"
        />
        <span v-else class="text-xs font-medium">
          {{ getTrainerInitial(trainer.trainerName) }}
        </span>
        <!-- Artist Credit Icon -->
        <a
          v-if="trainer.artistCreditUrl"
          :href="trainer.artistCreditUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="absolute bottom-0 right-0 w-3 h-3 bg-black bg-opacity-50 rounded-tl text-white flex items-center justify-center text-[6px] hover:bg-opacity-70 transition-opacity"
          title="Sprite Artist Credit"
          @click.stop
        >
          ©
        </a>
      </div>
      <div class="flex-1 min-w-0">
        <p class="truncate list-item-title">{{ trainer.trainerName }}</p>
      </div>
    </div>
  </button>

  <!-- Card/Grid Mode (default) -->
  <div
    v-else
    class="card hover:shadow-lg transition-all cursor-pointer group relative"
    :class="cardClasses"
    @click="handleClick"
  >
    <!-- Trainer Image -->
    <div class="aspect-square pokemon-image-bg rounded-t-lg flex items-center justify-center overflow-hidden p-1 relative">
      <img 
        v-if="trainer.icon" 
        :src="trainer.icon" 
        :alt="trainer.trainerName" 
        class="w-full h-full object-contain"
        @error="handleImageError"
      />
      <div v-else class="text-xl sm:text-2xl font-bold" style="color: var(--color-text-tertiary);">
        {{ getTrainerInitial(trainer.trainerName) }}
      </div>
      <!-- Artist Credit Icon -->
      <a
        v-if="trainer.artistCreditUrl"
        :href="trainer.artistCreditUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="absolute bottom-1 right-1 w-4 h-4 bg-black bg-opacity-50 rounded text-white flex items-center justify-center text-[8px] hover:bg-opacity-70 transition-opacity"
        title="Sprite Artist Credit"
        @click.stop
      >
        ©
      </a>
    </div>
    
    <div class="card-body p-1.5 sm:p-2">
      <h6 class="mb-0.5 truncate text-xs font-medium">
        {{ trainer.trainerName }}
      </h6>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  trainer: {
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

const getTrainerInitial = (name) => {
  return name ? name.charAt(0).toUpperCase() : '?'
}

const handleImageError = (event) => {
  // Hide image if it fails to load
  event.target.style.display = 'none'
}

const handleClick = () => {
  emit('click', props.trainer)
}
</script>
