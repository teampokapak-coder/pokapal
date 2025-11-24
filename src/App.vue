<template>
  <div id="app" class="min-h-screen flex flex-col">
    <Navigation />
    <main class="flex-1">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import Navigation from './components/Navigation.vue'
import Footer from './components/Footer.vue'

// Apply Material Design color scheme classes to root element based on system preference
onMounted(() => {
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const updateClass = () => {
      // Remove all color scheme classes
      document.documentElement.classList.remove('light', 'dark', 'light-high-contrast', 'dark-high-contrast', 'light-medium-contrast', 'dark-medium-contrast')
      // Add appropriate class
      if (mediaQuery.matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.add('light')
      }
    }
    updateClass()
    mediaQuery.addEventListener('change', updateClass)
  }
})
</script>
