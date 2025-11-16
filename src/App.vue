<template>
  <div id="app" class="min-h-screen bg-gray-50 flex flex-col">
    <Navigation />
    <main class="flex-1">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Navigation from './components/Navigation.vue'
import Footer from './components/Footer.vue'
</script>
