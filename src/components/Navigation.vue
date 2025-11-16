<template>
  <nav style="background-color: var(--color-bg-secondary); border-bottom: 1px solid var(--color-border);">
    <div class="section-container">
      <div class="flex justify-between items-center h-16">
        <router-link to="/" class="flex items-center gap-2 md:gap-4">
          <img src="/pokapal.png" alt="Pokapal" class="h-8 w-auto" />
          <img 
            src="/pokapal_black.svg" 
            alt="Pokapal" 
            class="h-7 w-auto hidden sm:block pokapal-logo-text"
          />
        </router-link>
        
        <!-- Desktop Navigation -->
        <div class="hidden md:flex gap-4 items-center">
          <router-link 
            to="/browse" 
            class="btn btn-h6 btn-ghost router-link-active-nav"
          >
            Browse
          </router-link>
          <router-link 
            to="/start" 
            class="btn btn-h6 btn-ghost router-link-active-nav"
          >
            Start Master Set
          </router-link>
          <router-link 
            to="/profile" 
            class="btn btn-h6 btn-ghost router-link-active-nav"
          >
            Profile
          </router-link>
          
          <!-- Auth Section -->
          <div v-if="user" class="flex items-center gap-3 ml-4 pl-4" style="border-left: 1px solid var(--color-border);">
            <span class="text-sm" style="color: var(--color-text-secondary);">{{ user.displayName || user.email }}</span>
            <button 
              @click="handleLogout"
              class="btn btn-h6 btn-ghost"
            >
              Logout
            </button>
          </div>
          <router-link 
            v-else
            to="/login" 
            class="btn btn-h6 btn-primary ml-4"
          >
            Login
          </router-link>
        </div>

        <!-- Mobile Menu Button -->
        <button 
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden p-2"
          style="color: var(--color-text-primary);"
          aria-label="Toggle menu"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Sidebar -->
    <div 
      v-if="mobileMenuOpen"
      class="fixed inset-0 z-50 md:hidden"
      @click="mobileMenuOpen = false"
    >
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50"></div>
      
      <!-- Sidebar -->
      <aside 
        class="fixed top-0 right-0 h-full w-64 sidebar shadow-xl transform transition-transform duration-300 ease-in-out"
        @click.stop
      >
        <div class="flex flex-col h-full">
          <!-- Header -->
          <div class="flex items-center justify-between p-4" style="border-bottom: 1px solid var(--color-border);">
            <router-link to="/" class="flex items-center gap-2" @click="mobileMenuOpen = false">
              <img src="/pokapal.png" alt="Pokapal" class="h-8 w-auto" />
              <img src="/pokapal_black.svg" alt="Pokapal" class="h-7 w-auto pokapal-logo-text" />
            </router-link>
            <button 
              @click="mobileMenuOpen = false"
              class="p-2 rounded"
              style="color: var(--color-text-primary);"
              @mouseenter="$event.target.style.backgroundColor = 'var(--color-bg-tertiary)'"
              @mouseleave="$event.target.style.backgroundColor = 'transparent'"
              aria-label="Close menu"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Navigation Links -->
          <nav class="flex-1 overflow-y-auto p-4 space-y-2">
            <router-link 
              to="/browse" 
              class="block px-4 py-3 rounded-lg sidebar-hover transition-colors"
              style="color: var(--color-text-primary);"
              @click="mobileMenuOpen = false"
            >
              Browse
            </router-link>
            <router-link 
              to="/start" 
              class="block px-4 py-3 rounded-lg sidebar-hover transition-colors"
              style="color: var(--color-text-primary);"
              @click="mobileMenuOpen = false"
            >
              Start Master Set
            </router-link>
            <router-link 
              to="/profile" 
              class="block px-4 py-3 rounded-lg sidebar-hover transition-colors"
              style="color: var(--color-text-primary);"
              @click="mobileMenuOpen = false"
            >
              Profile
            </router-link>
          </nav>

          <!-- Auth Section -->
          <div class="p-4" style="border-top: 1px solid var(--color-border);">
            <div v-if="user" class="space-y-2">
              <div class="px-4 py-2 text-sm" style="color: var(--color-text-secondary);">
                {{ user.displayName || user.email }}
              </div>
              <button 
                @click="handleLogout"
                class="w-full px-4 py-3 rounded-lg sidebar-hover transition-colors text-left"
                style="color: var(--color-text-primary);"
              >
                Logout
              </button>
            </div>
            <router-link 
              v-else
              to="/login" 
              class="block px-4 py-3 rounded-lg btn btn-h4 btn-primary text-center"
              @click="mobileMenuOpen = false"
            >
              Login
            </router-link>
          </div>
        </div>
      </aside>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useRouter } from 'vue-router'

const { user, logout } = useAuth()
const router = useRouter()
const mobileMenuOpen = ref(false)

const handleLogout = async () => {
  await logout()
  mobileMenuOpen.value = false
  router.push('/')
}
</script>

