<template>
  <div class="native-auth-bootstrap" role="status" aria-live="polite" aria-busy="true">
    <AppBrandLoader :label="label" />
  </div>
</template>

<script setup>
import AppBrandLoader from './AppBrandLoader.vue'

defineProps({
  label: {
    type: String,
    default: 'Loading Pull…'
  }
})
</script>

<style scoped>
.native-auth-bootstrap {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: env(safe-area-inset-top, 0) env(safe-area-inset-right, 0)
    env(safe-area-inset-bottom, 0) env(safe-area-inset-left, 0);
  background: linear-gradient(
    155deg,
    #040a14 0%,
    #0b1a33 28%,
    #1e3a6e 52%,
    #2563eb 78%,
    #5ba8db 100%
  );
}
</style>
