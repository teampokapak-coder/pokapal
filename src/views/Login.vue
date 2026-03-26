<template>
  <div
    :class="[
      'flex items-center justify-center px-4 sm:px-6 lg:px-8',
      isAppShell ? 'min-h-full py-10 app-login-bg' : 'min-h-screen py-12',
    ]"
    :style="!isAppShell ? { backgroundColor: 'var(--color-bg-primary)' } : undefined"
  >
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <div
          :class="[
            'flex items-center justify-center gap-3 mx-auto mb-4',
            isAppShell && 'app-login__mark',
          ]"
        >
          <picture v-if="!isAppShell">
            <source media="(prefers-color-scheme: light)" srcset="/glint_day.svg" />
            <img
              src="/Glint SVG.svg"
              alt="Pull TCG"
              class="h-10 w-auto brand-mark brand-mark-preserve"
            />
          </picture>
          <img
            src="/pull-tcg.svg"
            alt="Pull TCG"
            :class="['brand-mark', isAppShell ? 'h-9 w-auto' : 'h-7 w-auto']"
          />
        </div>
        <p :class="isAppShell ? 'app-login__subtitle' : 'login-subtitle'">
          Sign in to your account
        </p>
      </div>

      <div :class="['card', isAppShell && 'app-login__card']">
        <div class="card-body">
          <!-- Tabs -->
          <div class="flex gap-2 mb-6 border-b" style="border-color: var(--color-border);">
            <button 
              @click="isLogin = true"
              :class="[
                'btn btn-h5 flex-1',
                isLogin ? 'btn-primary' : 'btn-ghost',
                isAppShell && !isLogin && 'app-login__tab-inactive',
              ]"
            >
              Login
            </button>
            <button 
              @click="isLogin = false"
              :class="[
                'btn btn-h5 flex-1',
                !isLogin ? 'btn-primary' : 'btn-ghost',
                isAppShell && isLogin && 'app-login__tab-inactive',
              ]"
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
              <label
                class="block text-sm font-medium mb-1"
                :class="{ 'app-login__field-label': isAppShell }"
              >Email *</label>
              <input 
                v-model="loginEmail"
                type="email"
                required
                class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
                style="border-color: var(--color-border);"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <div class="flex items-center justify-between mb-1 gap-2">
                <label
                  class="block text-sm font-medium"
                  :class="{ 'app-login__field-label': isAppShell }"
                >Password *</label>
                <button
                  type="button"
                  @click="handleForgotPassword"
                  class="text-sm transition-colors shrink-0"
                  :class="isAppShell ? 'app-login__forgot-link' : ''"
                  :style="!isAppShell ? { color: 'var(--color-text-secondary)' } : undefined"
                  @mouseenter="!isAppShell && ($event.target.style.color = 'var(--color-text-primary)')"
                  @mouseleave="!isAppShell && ($event.target.style.color = 'var(--color-text-secondary)')"
                >
                  Forgot password?
                </button>
              </div>
              <input 
                v-model="loginPassword"
                type="password"
                required
                class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
                style="border-color: var(--color-border);"
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
            <div class="text-center text-xs" style="color: var(--color-text-tertiary);">
              or
            </div>
            <button
              type="button"
              @click="handleGoogleLogin"
              class="btn btn-h3 btn-secondary w-full inline-flex items-center justify-center gap-2.5"
              :disabled="isSubmitting"
            >
              <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>
          </form>

          <!-- Register Form -->
          <form v-else @submit.prevent="handleRegister" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Display Name</label>
              <input 
                v-model="registerName"
                type="text"
                class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
                style="border-color: var(--color-border);"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Email *</label>
              <input 
                v-model="registerEmail"
                type="email"
                required
                class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
                style="border-color: var(--color-border);"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Password *</label>
              <input 
                v-model="registerPassword"
                type="password"
                required
                minlength="6"
                class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
                style="border-color: var(--color-border);"
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

      <!-- Web only: app shell requires sign-in (router guard) -->
      <div v-if="!isAppShell" class="mt-6 text-center">
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
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useAppShell } from '../app/composables/useAppShell'

const { isAppShell } = useAppShell()

const router = useRouter()
const route = useRoute()
const { login, loginWithGoogle, register, resetPassword, error: authError, user } = useAuth()

const isLogin = ref(true)
const isSubmitting = ref(false)

const loginEmail = ref('')
const loginPassword = ref('')
const registerName = ref('')
const registerEmail = ref('')
const registerPassword = ref('')

const goAfterAuth = () => {
  const dest = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
  router.replace(dest || '/')
}

// Redirect if already signed in (handles auth resolving after mount)
watch(
  user,
  (u) => {
    if (u && route.path === '/login') goAfterAuth()
  },
  { immediate: true }
)

const handleLogin = async () => {
  isSubmitting.value = true
  const result = await login(loginEmail.value, loginPassword.value)
  isSubmitting.value = false
  
  if (result.success) {
    goAfterAuth()
  }
}

const handleRegister = async () => {
  isSubmitting.value = true
  const result = await register(registerEmail.value, registerPassword.value, registerName.value)
  isSubmitting.value = false
  
  if (result.success) {
    goAfterAuth()
  }
}

const handleGoogleLogin = async () => {
  isSubmitting.value = true
  try {
    const result = await loginWithGoogle()
    if (result.redirectStarted) return
    if (result.success) goAfterAuth()
  } finally {
    isSubmitting.value = false
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
.app-login-bg {
  min-height: 100%;
  background: linear-gradient(
    155deg,
    #040a14 0%,
    #0b1a33 28%,
    #1e3a6e 52%,
    #2563eb 78%,
    #5ba8db 100%
  );
}

.app-login__mark {
  filter: brightness(0) invert(1);
}

.app-login__subtitle {
  font-family: 'Syne', 'DM Sans', system-ui, sans-serif;
  font-size: 1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.92) !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.app-login__card {
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}

/* Inactive tab: readable on glass over blue gradient (btn-ghost is too low-contrast here) */
.app-login__tab-inactive {
  color: rgba(255, 255, 255, 0.95) !important;
  background: transparent !important;
  border: 1px solid transparent;
}

.app-login__tab-inactive:hover,
.app-login__tab-inactive:focus-visible {
  color: #ffffff !important;
  background: rgba(255, 255, 255, 0.12) !important;
}

.app-login__field-label {
  color: #ffffff !important;
}

.app-login__forgot-link {
  color: #93c5fd !important;
}

.app-login__forgot-link:hover,
.app-login__forgot-link:focus-visible {
  color: #bfdbfe !important;
}
</style>

