<template>
  <nav
    class="app-tab-bar app-tab-bar--safe flex shrink-0 border-t safe-pb"
    style="background-color: var(--color-bg-secondary); border-color: var(--color-border);"
    aria-label="Main navigation"
  >
    <button
      v-for="tab in tabs"
      :key="tab.to"
      type="button"
      role="tab"
      :aria-selected="isTabActive(tab)"
      class="app-tab flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-w-0 border-0 bg-transparent cursor-pointer"
      :class="{ 'app-tab--active': isTabActive(tab) }"
      @click="go(tab.to)"
    >
      <span class="app-tab__icon" aria-hidden="true">
        <img v-if="tab.iconSrc" :src="tab.iconSrc" class="app-tab__img" alt="" />
        <span v-else v-html="tab.iconSvg" />
      </span>
      <span class="app-tab__label truncate max-w-full px-0.5">{{ tab.label }}</span>
    </button>
  </nav>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

function go(path) {
  router.push(path)
}

const tabs = [
  {
    to: '/',
    label: 'Home',
    exact: true,
    iconSvg:
      '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>'
  },
  {
    to: '/pokemon',
    label: 'Pokémon',
    exact: false,
    iconSrc: '/pokemonIcon.svg'
  },
  {
    to: '/sets',
    label: 'Sets',
    exact: false,
    iconSvg:
      '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>',
    isActive: (path) => path === '/sets' || path.startsWith('/set/')
  },
  {
    to: '/start',
    label: 'Battleset',
    exact: false,
    iconSvg:
      '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v8M8 12h8"/></svg>',
    isActive: (path) => path === '/start' || path.startsWith('/start/')
  },
  {
    to: '/profile',
    label: 'Profile',
    exact: false,
    iconSvg:
      '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>'
  }
]

function isTabActive(tab) {
  const path = route.path
  if (typeof tab.isActive === 'function') return tab.isActive(path)
  if (tab.exact) return path === '/' || path === ''
  return path === tab.to || path.startsWith(`${tab.to}/`)
}
</script>

<style scoped>
.app-tab-bar--safe {
  position: relative;
  z-index: 520;
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
}

.safe-pb {
  padding-bottom: max(0.5rem, env(safe-area-inset-bottom, 0px));
}

.app-tab {
  color: var(--color-text-tertiary);
  text-decoration: none;
  font-size: 0.65rem;
  font-weight: 500;
  -webkit-tap-highlight-color: transparent;
}

.app-tab--active {
  color: var(--color-accent);
  background-color: color-mix(in srgb, var(--color-accent) 14%, transparent);
  border-radius: 0.625rem;
}

.app-tab--active .app-tab__icon {
  color: var(--color-accent);
}

.app-tab__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  color: inherit;
  opacity: 0.85;
}

.app-tab__icon :deep(svg) {
  width: 100%;
  height: 100%;
  flex-shrink: 0;
}

.app-tab__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  opacity: 0.72;
}

.app-tab--active .app-tab__img {
  opacity: 1;
}

@media (prefers-color-scheme: dark) {
  .app-tab__img {
    /* Keep image-based icon aligned with muted gray tab icon color in dark mode */
    filter: brightness(0) saturate(100%) invert(67%) sepia(8%) saturate(305%) hue-rotate(176deg) brightness(94%) contrast(86%);
  }

  .app-tab--active .app-tab__img {
    /* Approximate active accent tint used by currentColor SVG icons */
    filter: brightness(0) saturate(100%) invert(57%) sepia(82%) saturate(1784%) hue-rotate(192deg) brightness(100%) contrast(93%);
  }
}

.app-tab--active .app-tab__icon {
  opacity: 1;
}
</style>
