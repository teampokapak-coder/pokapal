<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style="background-color: var(--color-bg-primary);">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Pokapal</h1>
        <p class="text-gray-600">Sign in to your account</p>
      </div>

      <div class="card">
        <div class="card-body">
          <!-- Tabs -->
          <div class="flex gap-2 mb-6 border-b border-gray-200">
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
          <div v-if="authError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {{ authError }}
          </div>

          <!-- Login Form -->
          <form v-if="isLogin" @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input 
                v-model="loginEmail"
                type="email"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input 
                v-model="loginPassword"
                type="password"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
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
              <label class="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <input 
                v-model="registerName"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input 
                v-model="registerEmail"
                type="email"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input 
                v-model="registerPassword"
                type="password"
                required
                minlength="6"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="••••••••"
              />
              <p class="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
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

      <!-- Continue without login -->
      <div class="mt-6 text-center">
        <router-link 
          to="/" 
          class="text-sm transition-colors"
          style="color: var(--color-text-secondary);"
          @mouseenter="$event.target.style.color = 'var(--color-text-primary)'"
          @mouseleave="$event.target.style.color = 'var(--color-text-secondary)'"
        >
          Continue without account →
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const route = useRoute()
const { login, register, error: authError, user } = useAuth()

const isLogin = ref(true)
const isSubmitting = ref(false)

const loginEmail = ref('')
const loginPassword = ref('')
const registerName = ref('')
const registerEmail = ref('')
const registerPassword = ref('')

// Redirect if already logged in
onMounted(() => {
  if (user.value) {
    router.push(route.query.redirect || '/')
  }
})

const handleLogin = async () => {
  isSubmitting.value = true
  const result = await login(loginEmail.value, loginPassword.value)
  isSubmitting.value = false
  
  if (result.success) {
    // Redirect to original destination or home
    router.push(route.query.redirect || '/')
  }
}

const handleRegister = async () => {
  isSubmitting.value = true
  const result = await register(registerEmail.value, registerPassword.value, registerName.value)
  isSubmitting.value = false
  
  if (result.success) {
    // Redirect to original destination or home
    router.push(route.query.redirect || '/')
  }
}
</script>

