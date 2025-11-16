<template>
  <svg 
    :class="['pokeball-icon', { 'pokeball-icon--collected': isCollected }]"
    viewBox="0 0 595.3 594.1" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Outer Circle Outline - Filled when collected -->
    <circle 
      cx="297.6" 
      cy="297" 
      r="255.7"
      :fill="isCollected ? '#000000' : 'none'"
      :stroke="isCollected ? '#000000' : 'currentColor'"
      :stroke-width="isCollected ? '0' : '2'"
      class="pokeball-outline"
    />
    
    <!-- Top Half (Red) - Only show when collected -->
    <path 
      v-if="isCollected"
      d="M297.7,213.2c40.4,0,74.1,28.6,82.1,66.6h134.4C504.7,169.2,412,82.5,299,82.5S93.4,169.2,83.9,279.7
      h131.7C223.6,241.7,257.3,213.2,297.7,213.2z"
      fill="#FF1C1C"
      class="pokeball-top"
    />
    
    <!-- Bottom Half (White) - Only show when collected -->
    <path 
      v-if="isCollected"
      d="M297.6,380.9c-40.4,0-74.1-28.6-82.1-66.6H81.1c9.5,110.5,102.2,197.2,215.1,197.2
      s205.7-86.7,215.1-197.2H379.7C371.7,352.4,338,380.9,297.6,380.9z"
      fill="#FFFFFF"
      class="pokeball-bottom"
    />
    
    <!-- Horizontal Line - Always show -->
    <line 
      x1="83.9" 
      y1="297" 
      x2="511.3" 
      y2="297"
      :stroke="isCollected ? '#000000' : 'currentColor'"
      :stroke-width="isCollected ? '3' : '2'"
      class="pokeball-line"
    />
    
    <!-- Center Circle - Filled when collected, outline when not -->
    <circle 
      cx="297.6" 
      cy="297" 
      r="25"
      :fill="isCollected ? '#FFFFFF' : 'none'"
      :stroke="isCollected ? '#000000' : 'currentColor'"
      :stroke-width="isCollected ? '2' : '2'"
      class="pokeball-center"
    />
    
    <!-- Center Inner Circle - Only show when collected -->
    <circle 
      v-if="isCollected"
      cx="297.6" 
      cy="297" 
      r="12"
      fill="#000000"
      class="pokeball-center-inner"
    />
  </svg>
</template>

<script setup>
defineProps({
  isCollected: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.pokeball-icon {
  width: 100%;
  height: 100%;
  transition: all 0.2s ease;
}

.pokeball-icon--collected {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.pokeball-outline {
  transition: all 0.2s ease;
}
</style>

