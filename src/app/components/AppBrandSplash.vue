<template>
  <div class="app-brand-splash" role="status" aria-live="polite" aria-busy="true">
    <div class="app-brand-splash__aurora" aria-hidden="true" />
    <div class="app-brand-splash__content">
      <div class="app-brand-splash__mark">
        <img src="/pull-tcg.svg" alt="Pull TCG" class="app-brand-splash__wordmark" />
      </div>
      <p v-if="message" class="app-brand-splash__text">{{ message }}</p>
      <div class="app-brand-splash__pulse" aria-hidden="true" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.app-brand-splash {
  position: fixed;
  inset: 0;
  z-index: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(
    155deg,
    #040a14 0%,
    #0b1a33 28%,
    #1e3a6e 52%,
    #2563eb 78%,
    #5ba8db 100%
  );
}

.app-brand-splash__aurora {
  position: absolute;
  inset: -40%;
  background:
    radial-gradient(ellipse 55% 45% at 20% 30%, rgba(96, 165, 250, 0.35), transparent 55%),
    radial-gradient(ellipse 50% 40% at 85% 70%, rgba(91, 168, 219, 0.4), transparent 50%),
    radial-gradient(ellipse 40% 35% at 50% 100%, rgba(37, 99, 235, 0.25), transparent 45%);
  animation: app-brand-aurora 14s ease-in-out infinite alternate;
}

@keyframes app-brand-aurora {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  100% {
    transform: translate(2%, -1%) rotate(4deg);
  }
}

.app-brand-splash__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  text-align: center;
}

.app-brand-splash__mark {
  display: flex;
  align-items: center;
  justify-content: center;
  filter: brightness(0) invert(1);
}

.app-brand-splash__wordmark {
  height: 1.85rem;
  width: auto;
}

.app-brand-splash__text {
  font-family: 'Syne', 'DM Sans', system-ui, sans-serif;
  font-size: 0.9375rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.88);
  margin: 0;
}

.app-brand-splash__pulse {
  width: 2.5rem;
  height: 3px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.35);
  animation: app-brand-pulse 1.2s ease-in-out infinite;
}

@keyframes app-brand-pulse {
  0%,
  100% {
    opacity: 0.4;
    transform: scaleX(0.85);
  }
  50% {
    opacity: 1;
    transform: scaleX(1);
  }
}
</style>
