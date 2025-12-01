<template>
  <Transition name="success-notification">
    <div
      v-if="show"
      class="fixed top-4 right-4 z-[9999] max-w-sm w-full"
    >
      <div
        class="card shadow-2xl border-2"
        style="background-color: var(--color-bg-secondary); border-color: var(--color-accent);"
      >
        <div class="card-body p-4 sm:p-6">
          <div class="flex items-start gap-4">
            <!-- Success Icon with Animation -->
            <div class="flex-shrink-0">
              <div class="w-12 h-12 rounded-full flex items-center justify-center animate-bounce"
                   style="background-color: var(--color-accent);">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <!-- Message -->
            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-lg mb-1" style="color: var(--color-text-primary);">
                {{ title }}
              </h4>
              <p class="text-sm" style="color: var(--color-text-secondary);">
                {{ message }}
              </p>
            </div>
            
            <!-- Close Button -->
            <button
              @click="close"
              class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Success!'
  },
  message: {
    type: String,
    default: 'Operation completed successfully.'
  },
  duration: {
    type: Number,
    default: 3000
  }
})

const emit = defineEmits(['close'])

let timeoutId = null

const close = () => {
  emit('close')
}

watch(() => props.show, (newValue) => {
  if (newValue) {
    // Auto-close after duration
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      close()
    }, props.duration)
  } else {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }
})

onMounted(() => {
  if (props.show) {
    timeoutId = setTimeout(() => {
      close()
    }, props.duration)
  }
})
</script>

<style scoped>
.success-notification-enter-active {
  transition: all 0.3s ease-out;
}

.success-notification-leave-active {
  transition: all 0.3s ease-in;
}

.success-notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.success-notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.success-notification-enter-to,
.success-notification-leave-from {
  opacity: 1;
  transform: translateX(0);
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce {
  animation: bounce 0.6s ease-in-out;
}
</style>

