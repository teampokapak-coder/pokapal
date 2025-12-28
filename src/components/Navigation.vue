<template>
  <nav style="background-color: var(--color-bg-secondary); border-bottom: 1px solid var(--color-border);">
    <div class="section-container">
      <div class="flex justify-between items-center h-16">
        <router-link to="/" class="flex items-center gap-2 md:gap-4">
          <picture class="h-[28px] w-auto flex items-center justify-center">
            <img src="/pokapal.png" alt="Pokapal" class="h-[28px] w-auto object-contain" />
          </picture>
          <img 
            src="/pokapal_black.svg" 
            alt="Pokapal" 
            class="h-6 sm:h-7 w-auto pokapal-logo-text"
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
            to="/blog" 
            class="btn btn-h6 btn-ghost router-link-active-nav"
          >
            Blog
          </router-link>
          <router-link 
            to="/start" 
            class="btn btn-h6 btn-ghost router-link-active-nav"
          >
            Start Master Set
          </router-link>
          
          <!-- Auth Section -->
          <div v-if="user" class="flex items-center gap-3 ml-4 pl-4" style="border-left: 1px solid var(--color-border);">
            <router-link 
              to="/profile"
              class="trainer-badge"
            >
              <span class="font-semibold">Trainer</span> {{ user.displayName || user.email }}
            </router-link>
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
              <picture class="h-[28px] w-auto flex items-center justify-center">
                <img src="/pokapal.png" alt="Pokapal" class="h-[28px] w-auto object-contain" />
              </picture>
              <img src="/pokapal_black.svg" alt="Pokapal" class="h-6 w-auto pokapal-logo-text" />
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
          <nav class="flex-1 overflow-y-auto p-4 space-y-4">
            <!-- View By Section -->
            <div>
              <h6 class="section-label mb-2 px-4">View By</h6>
              <div class="space-y-1">
                <router-link 
                  to="/pokemon" 
                  class="block px-4 py-3 rounded-lg sidebar-hover transition-colors"
                  style="color: var(--color-text-primary);"
                  @click="mobileMenuOpen = false"
                >
                  Pokemon
                </router-link>
                <router-link 
                  to="/sets" 
                  class="block px-4 py-3 rounded-lg sidebar-hover transition-colors"
                  style="color: var(--color-text-primary);"
                  @click="mobileMenuOpen = false"
                >
                  Sets
                </router-link>
                <router-link 
                  to="/browse" 
                  class="block px-4 py-3 rounded-lg sidebar-hover transition-colors"
                  style="color: var(--color-text-primary);"
                  @click="mobileMenuOpen = false"
                >
                  Cards
                </router-link>
              </div>
            </div>

            <!-- Divider -->
            <div class="my-2" style="border-top: 1px solid var(--color-border);"></div>

            <!-- Other Links Section -->
            <div>
              <div class="space-y-1">
                <router-link 
                  to="/start" 
                  class="block px-4 py-3 rounded-lg sidebar-hover transition-colors"
                  style="color: var(--color-text-primary);"
                  @click="mobileMenuOpen = false"
                >
                  Start a Master Set
                </router-link>
                <router-link 
                  to="/blog" 
                  class="block px-4 py-3 rounded-lg sidebar-hover transition-colors"
                  style="color: var(--color-text-primary);"
                  @click="mobileMenuOpen = false"
                >
                  Blog
                </router-link>
              </div>
            </div>
          </nav>

          <!-- Auth Section -->
          <div class="p-4" style="border-top: 1px solid var(--color-border);">
            <div v-if="user" class="space-y-2">
              <router-link 
                to="/profile"
                class="trainer-badge block text-center"
                @click="mobileMenuOpen = false"
              >
                <span class="font-bold">Trainer</span> {{ user.displayName || user.email }}
              </router-link>
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

