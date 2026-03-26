<template>
  <div class="mobile-shell flex flex-col h-[100dvh] overflow-hidden" style="background-color: var(--color-bg-primary);">
    <AppTopBar v-if="!isLoginRoute" />
    <main class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain">
      <slot />
    </main>
    <AppTabBar v-if="!isLoginRoute" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppTopBar from '../components/AppTopBar.vue'
import AppTabBar from '../components/AppTabBar.vue'

const route = useRoute()
const isLoginRoute = computed(() => route.path === '/login')
</script>
