<template>
  <div class="app-top-bar-wrap relative z-[100] shrink-0">
    <Transition name="app-drawer-backdrop">
      <div
        v-if="menuOpen"
        class="fixed inset-0 z-[600] bg-black/40"
        aria-hidden="true"
        @click="menuOpen = false"
      />
    </Transition>

    <Transition name="app-drawer-panel">
      <aside
        v-if="menuOpen"
        class="app-drawer fixed inset-y-0 left-0 z-[601] flex w-[min(19.5rem,88vw)] flex-col border-r shadow-2xl"
        style="background-color: var(--color-bg-primary); border-color: var(--color-border);"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-drawer-title"
      >
        <div
          class="flex shrink-0 items-center justify-between gap-2 border-b px-3 pb-2.5 drawer-pt"
          style="border-color: var(--color-border);"
        >
          <span id="app-drawer-title" class="text-sm font-semibold" style="color: var(--color-text-primary);">
            Menu
          </span>
          <button
            type="button"
            class="btn btn-h6 btn-ghost -mr-1 p-2 rounded-lg"
            aria-label="Close menu"
            @click="menuOpen = false"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav class="flex-1 min-h-0 overflow-y-auto overscroll-y-contain py-2 px-2" aria-label="More destinations">
          <router-link
            v-for="link in drawerLinks"
            :key="link.to"
            :to="link.to"
            role="menuitem"
            class="app-drawer__link flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors"
            style="color: var(--color-text-primary);"
            active-class="app-drawer__link--active"
            @click="menuOpen = false"
          >
            <span class="app-drawer__icon" aria-hidden="true" v-html="link.iconSvg" />
            {{ link.label }}
          </router-link>
        </nav>
      </aside>
    </Transition>

    <header
      class="app-top-bar relative z-[102] flex items-center border-b app-top-bar__inset"
      style="background-color: var(--color-bg-secondary); border-color: var(--color-border);"
    >
      <button
        type="button"
        class="app-top-bar__menu btn btn-h6 btn-ghost -ml-1 p-2 rounded-lg"
        aria-haspopup="dialog"
        :aria-expanded="menuOpen"
        aria-label="Open menu"
        @click="menuOpen = true"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </header>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const menuOpen = ref(false)

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
  }
)

const drawerLinks = [
  {
    to: '/browse',
    label: 'Browse cards',
    iconSvg:
      '<svg class="w-5 h-5 shrink-0 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>'
  },
  {
    to: '/trainers',
    label: 'Trainers',
    iconSvg:
      '<svg class="w-5 h-5 shrink-0 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>'
  },
  {
    to: '/start',
    label: 'Start battleset',
    iconSvg:
      '<svg class="w-5 h-5 shrink-0 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>'
  },
  {
    to: '/blog',
    label: 'Blog',
    iconSvg:
      '<svg class="w-5 h-5 shrink-0 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>'
  },
  {
    to: '/profile',
    label: 'Profile',
    iconSvg:
      '<svg class="w-5 h-5 shrink-0 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>'
  }
]
</script>

<style scoped>
.drawer-pt {
  padding-top: max(0.5rem, env(safe-area-inset-top, 0px));
}

.app-top-bar__inset {
  padding-top: max(0.25rem, calc(env(safe-area-inset-top, 0px) + 2px));
  padding-left: max(0.5rem, env(safe-area-inset-left, 0px));
  padding-right: max(0.5rem, env(safe-area-inset-right, 0px));
  padding-bottom: 0.25rem;
}

.app-drawer__link:hover,
.app-drawer__link:focus-visible {
  background-color: var(--color-bg-tertiary);
}

.app-drawer__link--active {
  background-color: color-mix(in srgb, var(--color-accent) 16%, var(--color-bg-tertiary));
  color: var(--color-accent) !important;
}

.app-drawer__link--active :deep(svg) {
  opacity: 1;
  color: inherit;
}

.app-drawer-backdrop-enter-active,
.app-drawer-backdrop-leave-active {
  transition: opacity 0.2s ease;
}

.app-drawer-backdrop-enter-from,
.app-drawer-backdrop-leave-to {
  opacity: 0;
}

.app-drawer-panel-enter-active,
.app-drawer-panel-leave-active {
  transition: transform 0.22s ease;
}

.app-drawer-panel-enter-from,
.app-drawer-panel-leave-to {
  transform: translateX(-100%);
}
</style>
