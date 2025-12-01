<template>
  <!-- Floating Button -->
  <button
    v-if="!isOpen"
    @click="toggleWidget"
    class="feedback-widget-button"
    :class="{ 'animate-bounce': !hasInteracted }"
    aria-label="Send feedback"
  >
    <img 
      src="/pokagirl.svg" 
      alt="Pokagirl" 
      class="w-full h-full object-contain"
    />
  </button>

  <!-- Chat Widget -->
  <transition name="slide-up">
    <div v-if="isOpen" class="feedback-widget-container">
      <!-- Header -->
      <div class="feedback-widget-header">
        <div class="flex items-center gap-3">
          <img 
            src="/pokagirl.svg" 
            alt="Pokagirl" 
            class="w-10 h-10 object-contain"
          />
          <div>
            <h3 class="feedback-widget-title">Hey there! 👋</h3>
            <p class="feedback-widget-subtitle">Got feedback? Let me know!</p>
          </div>
        </div>
        <button 
          @click="toggleWidget"
          class="feedback-widget-close"
          aria-label="Close"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="feedback-widget-form">
        <div class="space-y-4">
          <!-- Name Field -->
          <div>
            <label for="feedback-name" class="feedback-label">
              Your name (optional)
            </label>
            <input
              id="feedback-name"
              v-model="form.name"
              type="text"
              placeholder="What should I call you?"
              class="feedback-input"
            />
          </div>

          <!-- Email Field -->
          <div>
            <label for="feedback-email" class="feedback-label">
              Your email (optional)
            </label>
            <input
              id="feedback-email"
              v-model="form.email"
              type="email"
              placeholder="your@email.com"
              class="feedback-input"
            />
          </div>

          <!-- Message Field -->
          <div>
            <label for="feedback-message" class="feedback-label">
              Your message <span class="text-red-500">*</span>
            </label>
            <textarea
              id="feedback-message"
              v-model="form.message"
              rows="4"
              placeholder="Tell me about a bug, feature idea, or anything else! 💬"
              class="feedback-textarea"
              required
            ></textarea>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isSubmitting || !form.message.trim()"
            class="feedback-submit-btn"
          >
            <span v-if="!isSubmitting">Send Message 💌</span>
            <span v-else class="flex items-center gap-2">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </span>
          </button>
        </div>
      </form>

      <!-- Success Message -->
      <transition name="fade">
        <div v-if="showSuccess" class="feedback-success">
          <div class="flex items-center gap-2">
            <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm font-medium">Thanks! Your message has been sent! 🎉</p>
          </div>
        </div>
      </transition>

      <!-- Error Message -->
      <transition name="fade">
        <div v-if="showError" class="feedback-error">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm">{{ errorMessage }}</p>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isOpen = ref(false)
const hasInteracted = ref(false)
const isSubmitting = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')

const form = ref({
  name: '',
  email: '',
  message: ''
})

const toggleWidget = () => {
  isOpen.value = !isOpen.value
  if (!hasInteracted.value) {
    hasInteracted.value = true
  }
}

const handleSubmit = async () => {
  if (!form.value.message.trim()) {
    return
  }

  isSubmitting.value = true
  showError.value = false
  showSuccess.value = false

  try {
    // Using EmailJS to send email
    // You'll need to set up EmailJS (free) and add your service ID, template ID, and public key
    // For now, we'll use a mailto fallback
    
    const emailBody = encodeURIComponent(
      `Name: ${form.value.name || 'Anonymous'}\n` +
      `Email: ${form.value.email || 'Not provided'}\n\n` +
      `Message:\n${form.value.message}`
    )
    
    // Check if EmailJS is configured
    if (import.meta.env.VITE_EMAILJS_SERVICE_ID && 
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID && 
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY) {
      
      // Use EmailJS
      const emailjs = await import('@emailjs/browser')
      
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: form.value.name || 'Anonymous',
          from_email: form.value.email || 'noreply@pokapal.com',
          message: form.value.message,
          to_email: 'teampokapak@gmail.com'
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      
      showSuccess.value = true
      form.value = { name: '', email: '', message: '' }
      
      setTimeout(() => {
        showSuccess.value = false
        toggleWidget()
      }, 3000)
    } else {
      // Fallback to mailto
      window.location.href = `mailto:teampokapak@gmail.com?subject=Pokapal Feedback&body=${emailBody}`
      showSuccess.value = true
      form.value = { name: '', email: '', message: '' }
      
      setTimeout(() => {
        showSuccess.value = false
        toggleWidget()
      }, 2000)
    }
  } catch (error) {
    console.error('Error sending feedback:', error)
    showError.value = true
    errorMessage.value = 'Oops! Something went wrong. You can email us directly at teampokapak@gmail.com'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  // Stop bounce animation after 3 seconds
  setTimeout(() => {
    hasInteracted.value = true
  }, 3000)
})
</script>

<style scoped>
.feedback-widget-button {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgb(50, 105, 65) 0%, rgb(153, 212, 162) 100%);
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 4px rgba(50, 105, 65, 0.1);
  cursor: pointer;
  z-index: 1000;
  transition: all 0.3s ease;
  overflow: hidden;
  padding: 8px;
}

@media (prefers-color-scheme: dark) {
  .feedback-widget-button {
    background: linear-gradient(135deg, rgb(153, 212, 162) 0%, rgb(50, 105, 65) 100%);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 4px rgba(153, 212, 162, 0.15);
  }
}

.feedback-widget-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2), 0 0 0 6px rgba(50, 105, 65, 0.2);
}

@media (prefers-color-scheme: dark) {
  .feedback-widget-button:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 0 0 6px rgba(153, 212, 162, 0.25);
  }
}

.feedback-widget-button:active {
  transform: scale(0.95);
}

.feedback-widget-button.animate-bounce {
  animation: bounce-gentle 2s infinite;
}

@keyframes bounce-gentle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.feedback-widget-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 380px;
  max-width: calc(100vw - 48px);
  max-height: calc(100vh - 48px);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.feedback-widget-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: linear-gradient(135deg, rgba(50, 105, 65, 0.1) 0%, rgba(153, 212, 162, 0.1) 100%);
}

@media (prefers-color-scheme: dark) {
  .feedback-widget-header {
    background: linear-gradient(135deg, rgba(153, 212, 162, 0.1) 0%, rgba(50, 105, 65, 0.1) 100%);
  }
}

.feedback-widget-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.feedback-widget-subtitle {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 2px 0 0 0;
}

.feedback-widget-close {
  padding: 4px;
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.feedback-widget-close:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.feedback-widget-form {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.feedback-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 6px;
}

.feedback-input,
.feedback-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
}

.feedback-input:focus,
.feedback-textarea:focus {
  outline: none;
  border-color: rgb(50, 105, 65);
  box-shadow: 0 0 0 3px rgba(50, 105, 65, 0.1);
}

@media (prefers-color-scheme: dark) {
  .feedback-input:focus,
  .feedback-textarea:focus {
    border-color: rgb(153, 212, 162);
    box-shadow: 0 0 0 3px rgba(153, 212, 162, 0.15);
  }
}

.feedback-textarea {
  resize: vertical;
  min-height: 100px;
}

.feedback-submit-btn {
  width: 100%;
  padding: 12px 20px;
  background: linear-gradient(135deg, rgb(50, 105, 65) 0%, rgb(153, 212, 162) 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

@media (prefers-color-scheme: dark) {
  .feedback-submit-btn {
    background: linear-gradient(135deg, rgb(153, 212, 162) 0%, rgb(50, 105, 65) 100%);
    color: rgb(24, 29, 24);
  }
}

.feedback-submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(50, 105, 65, 0.4);
}

@media (prefers-color-scheme: dark) {
  .feedback-submit-btn:hover:not(:disabled) {
    box-shadow: 0 4px 12px rgba(153, 212, 162, 0.4);
  }
}

.feedback-submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.feedback-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.feedback-success,
.feedback-error {
  padding: 12px 20px;
  margin: 0 20px 20px;
  border-radius: 8px;
  font-size: 13px;
}

.feedback-success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  color: var(--color-text-primary);
}

.feedback-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: var(--color-text-primary);
}

/* Slide up animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* Fade animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .feedback-widget-container {
    width: calc(100vw - 32px);
    bottom: 16px;
    right: 16px;
    max-height: calc(100vh - 32px);
  }

  .feedback-widget-button {
    bottom: 16px;
    right: 16px;
    width: 56px;
    height: 56px;
  }
}
</style>

