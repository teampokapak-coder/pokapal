<template>
  <div class="app-brand-loader" role="status" aria-live="polite">
    <div class="app-brand-loader__strip" aria-hidden="true" />
    <div class="app-brand-loader__mark">
      <img src="/pull-tcg.svg" alt="" class="app-brand-loader__wordmark" />
    </div>
    <p v-if="label" class="app-brand-loader__label">{{ label }}</p>
    <div class="app-brand-loader__bar" aria-hidden="true">
      <span class="app-brand-loader__bar-inner" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: 'Loading…'
  }
})
</script>

<style scoped>
.app-brand-loader {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  padding: 2.85rem 1.75rem;
  width: 100%;
  overflow: hidden;
  border-radius: var(--radius-lg, 14px);
}

.app-brand-loader__strip {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.12;
  background: linear-gradient(
    140deg,
    #1e5a9e 0%,
    #2563eb 45%,
    #5ba8db 100%
  );
  border-radius: inherit;
}

.app-brand-loader__mark {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  /* White wordmark on blue strip (dark / app-style) */
  filter: brightness(0) invert(1);
}

.app-brand-loader__wordmark {
  height: 1.6rem;
  width: auto;
}

.app-brand-loader__label {
  position: relative;
  z-index: 1;
  font-family: 'Syne', 'DM Sans', system-ui, sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.app-brand-loader__bar {
  position: relative;
  z-index: 1;
  width: 7.25rem;
  height: 3px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.app-brand-loader__bar-inner {
  display: block;
  height: 100%;
  width: 40%;
  border-radius: inherit;
  background: rgba(255, 255, 255, 0.95);
  animation: app-brand-bar 1.1s ease-in-out infinite;
}

@keyframes app-brand-bar {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(350%);
  }
}

/* Light mode: navy wordmark + label on a soft wash (full-page loaders) */
@media (prefers-color-scheme: light) {
  .app-brand-loader__strip {
    opacity: 0.08;
    background: linear-gradient(
      140deg,
      #1e5a9e 0%,
      #3b82f6 50%,
      #93c5fd 100%
    );
  }

  .app-brand-loader__mark {
    filter: brightness(0) saturate(100%) invert(15%) sepia(55%) saturate(2200%) hue-rotate(195deg) brightness(0.42);
  }

  .app-brand-loader__label {
    color: #0b1a33;
  }

  .app-brand-loader__bar {
    background: rgba(11, 26, 51, 0.12);
  }

  .app-brand-loader__bar-inner {
    background: #1e5a9e;
  }
}
</style>
