<template>
  <div class="flex flex-col items-center justify-center py-8 sm:py-12" :class="containerClass">
    <!-- Animated Poké Balls -->
    <div class="flex items-center gap-2 mb-4">
      <div 
        v-for="(ball, index) in balls" 
        :key="index"
        class="pokeball-spinner"
        :style="{ animationDelay: `${index * 0.2}s` }"
      >
        <svg 
          width="32" 
          height="32" 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          class="w-8 h-8"
        >
          <!-- Top half (red) - semicircle from top to middle -->
          <path 
            d="M16 4C9.37258 4 4 9.37258 4 16L28 16C28 9.37258 22.6274 4 16 4Z" 
            fill="#EF4444"
          />
          <!-- Bottom half (white) - semicircle from middle to bottom -->
          <path 
            d="M4 16C4 22.6274 9.37258 28 16 28C22.6274 28 28 22.6274 28 16L4 16Z" 
            fill="white"
          />
          <!-- Center circle -->
          <circle cx="16" cy="16" r="4" fill="white" stroke="#1F2937" stroke-width="1.5"/>
          <!-- Horizontal line -->
          <line x1="4" y1="16" x2="28" y2="16" stroke="#1F2937" stroke-width="2"/>
        </svg>
      </div>
    </div>
    
    <!-- Pixel-style "Loading..." text -->
    <div class="pixel-text">
      <span class="pixel-char" v-for="(char, index) in loadingText" :key="index" :style="{ animationDelay: `${0.5 + index * 0.1}s` }">
        {{ char === ' ' ? '\u00A0' : char }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: {
    type: String,
    default: 'Loading...'
  },
  ballCount: {
    type: Number,
    default: 3
  },
  containerClass: {
    type: String,
    default: ''
  }
})

const loadingText = computed(() => props.text.split(''))
const balls = computed(() => Array(props.ballCount).fill(0))
</script>

<style scoped>
.pokeball-spinner {
  animation: bounce 1.4s ease-in-out infinite;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  40% {
    transform: translateY(-12px) scale(1.1);
    opacity: 0.8;
  }
}

.pixel-text {
  font-family: 'Courier New', monospace;
  font-size: 1.25rem;
  font-weight: bold;
  letter-spacing: 0.1em;
  color: var(--color-text-primary);
  display: inline-flex;
  gap: 0.1em;
}

.pixel-char {
  display: inline-block;
  animation: pixel-flicker 1.5s ease-in-out infinite;
  text-shadow: 
    1px 1px 0px currentColor,
    2px 2px 0px rgba(0, 0, 0, 0.1);
}

@keyframes pixel-flicker {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.95);
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .pixel-text {
    text-shadow: 
      1px 1px 0px currentColor,
      2px 2px 0px rgba(255, 255, 255, 0.1);
  }
}
</style>

