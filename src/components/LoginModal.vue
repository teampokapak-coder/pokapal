<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-lg max-w-md w-full mx-4" style="background-color: var(--color-bg-secondary);">
      <div class="p-6">
        <div class="flex justify-between items-start mb-6">
          <div class="text-center flex-1">
            <img 
              src="/pokapal_white.svg" 
              alt="Pokapal" 
              class="pokapal-login-logo mx-auto mb-4 h-12 w-auto"
            />
            <p class="login-subtitle">Sign in to your account</p>
          </div>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 ml-4"
            style="color: var(--color-text-tertiary);"
          >
            ✕
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex gap-2 mb-6 border-b" style="border-color: var(--color-border);">
          <button 
            @click="isLogin = true"
            :class="['btn btn-h5 flex-1', isLogin ? 'btn-primary' : 'btn-ghost']"
          >
            Login
          </button>
          <button 
            @click="isLogin = false"
            :class="['btn btn-h5 flex-1', !isLogin ? 'btn-primary' : 'btn-ghost']"
          >
            Register
          </button>
        </div>

        <!-- Error Message -->
        <div v-if="authError" class="error-message mb-4 p-3 rounded text-sm">
          {{ authError }}
        </div>

        <!-- Login Form -->
        <form v-if="isLogin" @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1" style="color: var(--color-text-primary);">Email *</label>
            <input 
              v-model="loginEmail"
              type="email"
              required
              class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
              style="border-color: var(--color-border); background-color: var(--color-bg-primary); color: var(--color-text-primary);"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-sm font-medium" style="color: var(--color-text-primary);">Password *</label>
              <button
                type="button"
                @click="handleForgotPassword"
                class="text-sm transition-colors"
                style="color: var(--color-text-secondary);"
                @mouseenter="$event.target.style.color = 'var(--color-text-primary)'"
                @mouseleave="$event.target.style.color = 'var(--color-text-secondary)'"
              >
                Forgot password?
              </button>
            </div>
            <input 
              v-model="loginPassword"
              type="password"
              required
              class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
              style="border-color: var(--color-border); background-color: var(--color-bg-primary); color: var(--color-text-primary);"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            class="btn btn-h3 btn-primary w-full"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <!-- Register Form -->
        <form v-else @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1" style="color: var(--color-text-primary);">Display Name</label>
            <input 
              v-model="registerName"
              type="text"
              class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
              style="border-color: var(--color-border); background-color: var(--color-bg-primary); color: var(--color-text-primary);"
              placeholder="Your Name"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" style="color: var(--color-text-primary);">Email *</label>
            <input 
              v-model="registerEmail"
              type="email"
              required
              class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
              style="border-color: var(--color-border); background-color: var(--color-bg-primary); color: var(--color-text-primary);"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" style="color: var(--color-text-primary);">Password *</label>
            <input 
              v-model="registerPassword"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
              style="border-color: var(--color-border); background-color: var(--color-bg-primary); color: var(--color-text-primary);"
              placeholder="••••••••"
            />
            <p class="text-xs mt-1" style="color: var(--color-text-tertiary);">Must be at least 6 characters</p>
          </div>
          <button 
            type="submit"
            class="btn btn-h3 btn-primary w-full"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuth } from '../composables/useAuth'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'success'])

const { login, register, resetPassword, error: authError } = useAuth()

const isLogin = ref(true)
const isSubmitting = ref(false)

const loginEmail = ref('')
const loginPassword = ref('')
const registerName = ref('')
const registerEmail = ref('')
const registerPassword = ref('')

// Reset form when modal opens/closes
watch(() => props.show, (isOpen) => {
  if (isOpen) {
    // Reset form when opening
    isLogin.value = true
    loginEmail.value = ''
    loginPassword.value = ''
    registerName.value = ''
    registerEmail.value = ''
    registerPassword.value = ''
    authError.value = null
  }
})

const handleLogin = async () => {
  isSubmitting.value = true
  const result = await login(loginEmail.value, loginPassword.value)
  isSubmitting.value = false
  
  if (result.success) {
    emit('success')
    emit('close')
  }
}

const handleRegister = async () => {
  isSubmitting.value = true
  const result = await register(registerEmail.value, registerPassword.value, registerName.value)
  isSubmitting.value = false
  
  if (result.success) {
    emit('success')
    emit('close')
  }
}

const handleForgotPassword = async () => {
  if (!loginEmail.value) {
    authError.value = 'Please enter your email address first'
    return
  }
  
  isSubmitting.value = true
  const result = await resetPassword(loginEmail.value)
  isSubmitting.value = false
  
  if (result.success) {
    authError.value = null
    alert('Password reset email sent! Please check your inbox.')
  }
}
</script>

<style scoped>
.pokapal-login-logo {
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.login-subtitle {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.error-message {
  background-color: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}
</style>

