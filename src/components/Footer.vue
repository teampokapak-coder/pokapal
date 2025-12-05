<template>
  <footer class="mt-auto" style="background-color: var(--color-bg-secondary); border-top: 1px solid var(--color-border);">
    <div class="section-container">
      <div class="py-8">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <!-- Brand -->
          <div class="flex items-center gap-3">
            <img src="/pokapal.png" alt="Pokapal" class="h-6 w-auto bg-transparent" />
            <img 
              src="/pokapal_type.png" 
              alt="Pokapal" 
              class="h-8 w-auto bg-transparent pokapal-footer-logo"
            />
            <span class="text-xs" style="color: var(--color-text-tertiary);">© {{ currentYear }}</span>
          </div>

          <!-- Links -->
          <nav class="flex flex-wrap justify-center gap-4 text-sm">
            <router-link to="/" class="transition-colors footer-link">
              Home
            </router-link>
            <router-link to="/browse" class="transition-colors footer-link">
              Browse
            </router-link>
            <router-link to="/blog" class="transition-colors footer-link">
              Blog
            </router-link>
            <router-link v-if="user" to="/start" class="transition-colors footer-link">
              Start Master Set
            </router-link>
            <router-link v-if="user" to="/profile" class="transition-colors footer-link">
              Profile
            </router-link>
            <router-link v-if="!user" to="/login" class="transition-colors footer-link">
              Login
            </router-link>
          </nav>
        </div>

        <!-- Bottom Text -->
        <div class="mt-6 pt-6 text-center" style="border-top: 1px solid var(--color-border);">
          <p class="text-xs" style="color: var(--color-text-tertiary);">
            Your collection companion for Pokémon TCG master sets
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useAuth } from '../composables/useAuth'

const { user } = useAuth()
const currentYear = computed(() => new Date().getFullYear())
</script>

