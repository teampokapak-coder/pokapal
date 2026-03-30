<template>
  <template v-if="isNativeShell">
    <NativeAuthBootstrap v-if="authLoading" />
    <MobileShell v-else>
      <router-view />
    </MobileShell>
  </template>
  <div v-else class="min-h-screen flex flex-col">
    <Navigation />
    <main class="flex-1">
      <router-view />
    </main>
    <Footer />
    <!-- Glint feedback bubble — disabled: was cluttering the web UI; re-enable by uncommenting import + component -->
    <!-- <FeedbackWidget /> -->
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NativeAuthBootstrap from './app/components/NativeAuthBootstrap.vue'
import MobileShell from './app/layouts/MobileShell.vue'
import Navigation from './components/Navigation.vue'
import Footer from './components/Footer.vue'
// import FeedbackWidget from './components/FeedbackWidget.vue'
import { getIsNativeApp } from './app/composables/useIsNativeApp'
import { useAuth } from './composables/useAuth'

const route = useRoute()
const router = useRouter()
const { user, loading: authLoading } = useAuth()
const isNativeShell = computed(() => getIsNativeApp())

// Failsafe: if the route guard ever misses (timing / detection), never leave signed-out users on app routes
watch(
  [() => user.value, authLoading, () => route.path],
  () => {
    if (!getIsNativeApp()) return
    if (authLoading.value) return
    if (user.value) return
    if (route.path === '/login') return
    router.replace({ path: '/login', query: { redirect: route.fullPath } })
  }
)

// Apply Material Design color scheme classes to root element based on system preference
onMounted(() => {
  document.documentElement.dataset.appShell = getIsNativeApp() ? 'true' : ''
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
