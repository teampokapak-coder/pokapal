<template>
  <div class="min-h-screen" style="background-color: var(--color-bg-primary);">
    <section class="section section-spacing-md">
      <div class="section-container">
        <div class="section-header">
          <h2>Admin Dashboard</h2>
          <p class="section-subtitle">Simplified Pokemon TCG Data Management</p>
        </div>

        <div class="max-w-6xl mx-auto space-y-6">
          <!-- Status Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="card">
              <div class="card-body text-center">
                <p class="text-sm mb-1" style="color: var(--color-text-secondary);">Pokemon</p>
                <p class="text-2xl font-bold">{{ pokemonCount }}</p>
              </div>
            </div>
            <div class="card">
              <div class="card-body text-center">
                <p class="text-sm mb-1" style="color: var(--color-text-secondary);">English Sets</p>
                <p class="text-2xl font-bold">{{ setsEnCount }}</p>
              </div>
            </div>
            <div class="card">
              <div class="card-body text-center">
                <p class="text-sm mb-1" style="color: var(--color-text-secondary);">Japanese Sets</p>
                <p class="text-2xl font-bold">{{ setsJaCount }}</p>
              </div>
            </div>
            <div class="card">
              <div class="card-body text-center">
                <p class="text-sm mb-1" style="color: var(--color-text-secondary);">Cards</p>
                <p class="text-2xl font-bold">{{ cardsEnCount + cardsJaCount }}</p>
              </div>
            </div>
          </div>

          <!-- Pokemon Collection -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Pokemon Collection</h3>
            </div>
            <div class="card-body">
              <p class="text-sm mb-4" style="color: var(--color-text-secondary);">
                Seed the <code class="px-1 py-0.5 rounded" style="background-color: var(--color-bg-secondary);">pokemon</code> collection from pokemonList.json
              </p>
              <button 
                @click="seedPokemon"
                class="btn btn-h5 btn-primary"
                :disabled="isSeedingPokemon"
              >
                {{ isSeedingPokemon ? 'Seeding...' : '🌱 Seed Pokemon Collection' }}
              </button>
            </div>
          </div>

          <!-- Trainers Collection -->
          <div class="card">
            <div class="card-header flex items-center justify-between">
              <h3 class="card-title">Trainers Collection</h3>
              <button
                @click="openAddTrainerModal"
                class="btn btn-h6 btn-primary"
              >
                + Add Trainer
              </button>
            </div>
            <div class="card-body">
              <!-- Search -->
              <div class="mb-4">
                <input
                  v-model="trainerSearchQuery"
                  type="text"
                  placeholder="Search trainers..."
                  class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                  style="border-color: var(--color-border); background-color: var(--color-bg-secondary); color: var(--color-text-primary);"
                />
              </div>

              <!-- Loading State -->
              <div v-if="loadingTrainers" class="text-center py-8">
                <p class="text-sm" style="color: var(--color-text-secondary);">Loading trainers...</p>
              </div>

              <!-- Trainers Table -->
              <div v-else class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr style="border-bottom: 1px solid var(--color-border);">
                      <th class="text-left py-2 px-3 font-medium" style="color: var(--color-text-primary);">Image</th>
                      <th class="text-left py-2 px-3 font-medium" style="color: var(--color-text-primary);">Name</th>
                      <th class="text-left py-2 px-3 font-medium" style="color: var(--color-text-primary);">Icon URL</th>
                      <th class="text-left py-2 px-3 font-medium" style="color: var(--color-text-primary);">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="trainer in paginatedTrainers"
                      :key="trainer.id"
                      style="border-bottom: 1px solid var(--color-border);"
                      class="hover:opacity-80 transition-opacity"
                    >
                      <td class="py-2 px-3">
                        <div class="w-12 h-12 pokemon-image-bg rounded flex items-center justify-center overflow-hidden">
                          <img
                            v-if="trainer.icon"
                            :src="trainer.icon"
                            :alt="trainer.trainerName"
                            :key="trainer.icon"
                            class="w-full h-full object-contain p-1"
                            @error="(e) => handleTrainerImageError(e)"
                          />
                          <span v-else class="text-xs font-medium">
                            {{ trainer.trainerName?.charAt(0)?.toUpperCase() || '?' }}
                          </span>
                        </div>
                      </td>
                      <td class="py-2 px-3" style="color: var(--color-text-primary);">
                        {{ trainer.trainerName }}
                      </td>
                      <td class="py-2 px-3">
                        <div class="max-w-xs truncate text-xs" style="color: var(--color-text-secondary);">
                          {{ trainer.icon || 'No URL' }}
                        </div>
                      </td>
                      <td class="py-2 px-3">
                        <div class="flex items-center gap-2">
                          <button
                            @click="openTrainerEditModal(trainer)"
                            class="text-xs px-2 py-1 rounded transition-colors"
                            style="background-color: var(--color-bg-tertiary); color: var(--color-text-primary); border: 1px solid var(--color-border);"
                            title="Edit icon URL"
                          >
                            Edit
                          </button>
                          <button
                            @click="toggleTrainerVisibility(trainer)"
                            class="text-xs px-2 py-1 rounded transition-colors"
                            :style="trainer.hide 
                              ? { backgroundColor: 'var(--color-accent)', color: 'white' }
                              : { backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }"
                            :title="trainer.hide ? 'Show trainer' : 'Hide trainer'"
                          >
                            {{ trainer.hide ? 'Show' : 'Hide' }}
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="filteredTrainers.length === 0" class="text-center py-8">
                  <p class="text-sm" style="color: var(--color-text-secondary);">
                    {{ trainerSearchQuery ? 'No trainers found matching your search.' : 'No trainers found.' }}
                  </p>
                </div>
                
                <!-- Pagination -->
                <div v-if="filteredTrainers.length > 0" class="flex items-center justify-between mt-4 pt-4" style="border-top: 1px solid var(--color-border);">
                  <div class="text-sm" style="color: var(--color-text-secondary);">
                    Showing {{ paginationStart }} - {{ paginationEnd }} of {{ filteredTrainers.length }} trainers
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      @click="currentTrainerPage = Math.max(1, currentTrainerPage - 1)"
                      :disabled="currentTrainerPage === 1"
                      class="px-3 py-1 text-sm rounded transition-colors"
                      :style="currentTrainerPage === 1 
                        ? { backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-tertiary)', cursor: 'not-allowed' }
                        : { backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }"
                    >
                      Previous
                    </button>
                    <div class="flex items-center gap-1">
                      <button
                        v-for="page in trainerPages"
                        :key="page"
                        @click="currentTrainerPage = page"
                        class="px-3 py-1 text-sm rounded transition-colors"
                        :style="currentTrainerPage === page
                          ? { backgroundColor: 'var(--color-primary)', color: 'white' }
                          : { backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }"
                      >
                        {{ page }}
                      </button>
                    </div>
                    <button
                      @click="currentTrainerPage = Math.min(totalTrainerPages, currentTrainerPage + 1)"
                      :disabled="currentTrainerPage === totalTrainerPages"
                      class="px-3 py-1 text-sm rounded transition-colors"
                      :style="currentTrainerPage === totalTrainerPages 
                        ? { backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-tertiary)', cursor: 'not-allowed' }
                        : { backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sets -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Sets</h3>
            </div>
            <div class="card-body space-y-4">
              <div class="p-4 rounded-lg border" style="background-color: var(--color-bg-tertiary); border-color: var(--color-border);">
                <p class="text-sm font-medium mb-2" style="color: var(--color-text-primary);">English Sets</p>
                <p class="text-xs mb-3" style="color: var(--color-text-secondary);">
                  Fetch all English sets from TCGdx API → <code class="text-xs px-1 py-0.5 rounded" style="background-color: var(--color-bg-secondary);">set_en</code>
                </p>
                <button 
                  @click="seedSetsEn"
                  class="btn btn-h5 btn-primary w-full"
                  :disabled="isSeedingSetsEn"
                >
                  {{ isSeedingSetsEn ? 'Fetching...' : '📦 Fetch All English Sets' }}
                </button>
              </div>

              <div class="p-4 rounded-lg border" style="background-color: var(--color-bg-tertiary); border-color: var(--color-border);">
                <p class="text-sm font-medium mb-2" style="color: var(--color-text-primary);">Japanese Sets</p>
                <p class="text-xs mb-3" style="color: var(--color-text-secondary);">
                  Fetch all Japanese sets from TCGdx API → <code class="text-xs px-1 py-0.5 rounded" style="background-color: var(--color-bg-secondary);">set_ja</code>
                </p>
                <button 
                  @click="seedSetsJa"
                  class="btn btn-h5 btn-primary w-full"
                  :disabled="isSeedingSetsJa"
                >
                  {{ isSeedingSetsJa ? 'Fetching...' : '📦 Fetch All Japanese Sets' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Cards by Set -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Fetch Cards by Set</h3>
            </div>
            <div class="card-body space-y-6">
              <!-- English Sets -->
              <div>
                <button
                  @click="isSetsEnExpanded = !isSetsEnExpanded"
                  class="flex items-center justify-between w-full mb-4 p-2 rounded-lg hover:opacity-80 transition-opacity"
                  style="background-color: var(--color-bg-tertiary);"
                >
                  <p class="text-sm font-medium" style="color: var(--color-text-primary);">
                    English Sets
                    <span class="ml-2 text-xs font-normal" style="color: var(--color-text-secondary);">
                      ({{ setsEn.length }})
                    </span>
                  </p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    :class="{ 'rotate-180': isSetsEnExpanded }"
                    class="transition-transform"
                    style="color: var(--color-text-secondary);"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                <div v-if="loadingSetsEn" class="text-center py-8">
                  <p class="text-sm" style="color: var(--color-text-secondary);">Loading sets...</p>
                </div>
                <div v-else-if="setsEn.length === 0" class="text-center py-8">
                  <p class="text-sm" style="color: var(--color-text-secondary);">No English sets found. Fetch sets first.</p>
                </div>
                <div v-else-if="isSetsEnExpanded" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div
                    v-for="set in setsEn"
                    :key="set.id"
                    class="p-4 rounded-lg border relative"
                    style="background-color: var(--color-bg-tertiary); border-color: var(--color-border);"
                  >
                    <!-- Logo -->
                    <div class="flex items-center justify-center mb-3 h-16 relative">
                      <img
                        v-if="set.logo"
                        :src="set.logo"
                        :alt="set.name"
                        class="max-h-full max-w-full object-contain"
                        @error="(e) => handleImageError(e, set, 'logo')"
                      />
                      <div v-else class="text-xs text-center" style="color: var(--color-text-secondary);">
                        No Logo
                      </div>
                      <!-- Upload/Clear Buttons -->
                      <div class="absolute top-0 right-0 flex gap-1">
                        <button
                          @click.stop="openUploadModal(set, 'logo')"
                          class="text-xs p-1 rounded"
                          style="background-color: var(--color-bg-primary); color: var(--color-text-primary); border: 1px solid var(--color-border);"
                          title="Edit logo"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                          </svg>
                        </button>
                        <button
                          class="text-xs p-1 rounded"
                          style="background-color: var(--color-bg-primary); color: #ef4444; border: 1px solid var(--color-border);"
                          title="Clear custom logo"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <!-- Symbol -->
                    <div class="flex items-center justify-center mb-3 h-8 relative">
                      <img
                        v-if="set.symbol"
                        :src="set.symbol"
                        :alt="set.name"
                        class="max-h-full max-w-full object-contain"
                        @error="(e) => handleImageError(e, set, 'symbol')"
                      />
                      <!-- Upload/Clear Buttons -->
                      <div v-if="set.symbol" class="absolute top-0 right-0 flex gap-1">
                        <button
                          @click.stop="openUploadModal(set, 'symbol')"
                          class="text-xs p-1 rounded"
                          style="background-color: var(--color-bg-primary); color: var(--color-text-primary); border: 1px solid var(--color-border);"
                          title="Edit symbol"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                          </svg>
                        </button>
                        <button
                          class="text-xs p-1 rounded"
                          style="background-color: var(--color-bg-primary); color: #ef4444; border: 1px solid var(--color-border);"
                          title="Clear custom symbol"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <!-- Set Name -->
                    <h4 class="text-sm font-medium mb-2 text-center" style="color: var(--color-text-primary);">
                      {{ set.name }}
                    </h4>
                    
                    <!-- Set ID -->
                    <p class="text-xs text-center mb-1" style="color: var(--color-text-secondary);">
                      {{ set.apiId }}
                    </p>
                    
                    <!-- Release Date -->
                    <p v-if="set.releaseDate || set.releaseYear" class="text-xs text-center mb-1" style="color: var(--color-text-secondary);">
                      {{ formatSetDate(set) }}
                    </p>
                    
                    <!-- Card Count -->
                    <p 
                      class="text-xs text-center mb-3 font-medium"
                      :style="(set.cardCount || 0) > 0 ? { color: '#10b981' } : { color: 'var(--color-text-secondary)' }"
                    >
                      Cards: {{ set.cardCount || 0 }}
                    </p>
                    
                    <!-- Fetch Button -->
                    <button
                      @click="seedCardsForSetHandler(set.apiId, 'en')"
                      class="btn btn-h5 btn-secondary w-full text-sm"
                      :disabled="isFetchingCards[set.apiId]"
                    >
                      {{ isFetchingCards[set.apiId] ? 'Fetching...' : 'Fetch Cards' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Japanese Sets -->
              <div>
                <button
                  @click="isSetsJaExpanded = !isSetsJaExpanded"
                  class="flex items-center justify-between w-full mb-4 p-2 rounded-lg hover:opacity-80 transition-opacity"
                  style="background-color: var(--color-bg-tertiary);"
                >
                  <p class="text-sm font-medium" style="color: var(--color-text-primary);">
                    Japanese Sets
                    <span class="ml-2 text-xs font-normal" style="color: var(--color-text-secondary);">
                      ({{ setsJa.length }})
                    </span>
                  </p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    :class="{ 'rotate-180': isSetsJaExpanded }"
                    class="transition-transform"
                    style="color: var(--color-text-secondary);"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                <div v-if="loadingSetsJa" class="text-center py-8">
                  <p class="text-sm" style="color: var(--color-text-secondary);">Loading sets...</p>
                </div>
                <div v-else-if="setsJa.length === 0" class="text-center py-8">
                  <p class="text-sm" style="color: var(--color-text-secondary);">No Japanese sets found. Fetch sets first.</p>
                </div>
                <div v-else-if="isSetsJaExpanded" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div
                    v-for="set in setsJa"
                    :key="set.id"
                    class="p-4 rounded-lg border relative"
                    style="background-color: var(--color-bg-tertiary); border-color: var(--color-border);"
                  >
                    <!-- Logo -->
                    <div class="flex items-center justify-center mb-3 h-16 relative">
                      <img
                        v-if="set.logo"
                        :src="set.logo"
                        :alt="set.name"
                        class="max-h-full max-w-full object-contain"
                        @error="(e) => handleImageError(e, set, 'logo')"
                      />
                      <div v-else class="text-xs text-center" style="color: var(--color-text-secondary);">
                        No Logo
                      </div>
                      <!-- Upload/Clear Buttons -->
                      <div class="absolute top-0 right-0 flex gap-1">
                        <button
                          @click.stop="openUploadModal(set, 'logo')"
                          class="text-xs p-1 rounded"
                          style="background-color: var(--color-bg-primary); color: var(--color-text-primary); border: 1px solid var(--color-border);"
                          title="Edit logo"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                          </svg>
                        </button>
                        <button
                          class="text-xs p-1 rounded"
                          style="background-color: var(--color-bg-primary); color: #ef4444; border: 1px solid var(--color-border);"
                          title="Clear custom logo"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <!-- Symbol -->
                    <div class="flex items-center justify-center mb-3 h-8 relative">
                      <img
                        v-if="set.symbol"
                        :src="set.symbol"
                        :alt="set.name"
                        class="max-h-full max-w-full object-contain"
                        @error="(e) => handleImageError(e, set, 'symbol')"
                      />
                      <!-- Upload/Clear Buttons -->
                      <div v-if="set.symbol" class="absolute top-0 right-0 flex gap-1">
                        <button
                          @click.stop="openUploadModal(set, 'symbol')"
                          class="text-xs p-1 rounded"
                          style="background-color: var(--color-bg-primary); color: var(--color-text-primary); border: 1px solid var(--color-border);"
                          title="Edit symbol"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                          </svg>
                        </button>
                        <button
                          class="text-xs p-1 rounded"
                          style="background-color: var(--color-bg-primary); color: #ef4444; border: 1px solid var(--color-border);"
                          title="Clear custom symbol"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <!-- Set Name -->
                    <h4 class="text-sm font-medium mb-2 text-center" style="color: var(--color-text-primary);">
                      {{ set.englishName || set.name }}
                    </h4>
                    <p v-if="set.englishName" class="text-xs text-center mb-2" style="color: var(--color-text-secondary);">
                      {{ set.name }}
                    </p>
                    
                    <!-- Set ID -->
                    <p class="text-xs text-center mb-1" style="color: var(--color-text-secondary);">
                      {{ set.apiId }}
                    </p>
                    
                    <!-- Release Date -->
                    <p v-if="set.releaseDate || set.releaseYear" class="text-xs text-center mb-1" style="color: var(--color-text-secondary);">
                      {{ formatSetDate(set) }}
                    </p>
                    
                    <!-- Card Count -->
                    <p 
                      class="text-xs text-center mb-3 font-medium"
                      :style="(set.cardCount || 0) > 0 ? { color: '#10b981' } : { color: 'var(--color-text-secondary)' }"
                    >
                      Cards: {{ set.cardCount || 0 }}
                    </p>
                    
                    <!-- Fetch Button -->
                    <button
                      @click="seedCardsForSetHandler(set.apiId, 'ja')"
                      class="btn btn-h5 btn-secondary w-full text-sm"
                      :disabled="isFetchingCards[set.apiId]"
                    >
                      {{ isFetchingCards[set.apiId] ? 'Fetching...' : 'Fetch Cards' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Messages -->
          <div v-if="message" class="card" :class="messageType === 'error' ? 'border-red-500' : 'border-green-500'">
            <div class="card-body">
              <p :style="{ color: messageType === 'error' ? '#ef4444' : '#10b981' }">{{ message }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Upload Modal -->
    <div
      v-if="uploadModal.show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeUploadModal"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" style="background-color: var(--color-bg-primary);">
        <h3 class="text-lg font-bold mb-4" style="color: var(--color-text-primary);">
          {{ uploadModal.type === 'logo' ? 'Logo' : 'Symbol' }} for {{ uploadModal.set?.name }}
        </h3>
        
        <!-- Toggle between Upload and URL -->
        <div class="flex gap-2 mb-4 border-b" style="border-color: var(--color-border);">
          <button
            @click="uploadModal.mode = 'upload'"
            class="px-4 py-2 text-sm font-medium transition-colors"
            :style="uploadModal.mode === 'upload' 
              ? { color: 'var(--color-text-primary)', borderBottom: '2px solid var(--color-primary)' }
              : { color: 'var(--color-text-secondary)' }"
          >
            Upload File
          </button>
          <button
            @click="uploadModal.mode = 'url'"
            class="px-4 py-2 text-sm font-medium transition-colors"
            :style="uploadModal.mode === 'url' 
              ? { color: 'var(--color-text-primary)', borderBottom: '2px solid var(--color-primary)' }
              : { color: 'var(--color-text-secondary)' }"
          >
            Enter URL
          </button>
        </div>

        <!-- Upload File Mode -->
        <div v-if="uploadModal.mode === 'upload'" class="mb-4">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleFileSelect"
            class="hidden"
          />
          <button
            @click="$refs.fileInput.click()"
            class="btn btn-h5 btn-secondary w-full mb-2"
          >
            Choose Image
          </button>
          <p v-if="uploadModal.fileName" class="text-sm" style="color: var(--color-text-secondary);">
            Selected: {{ uploadModal.fileName }}
          </p>
        </div>

        <!-- URL Mode -->
        <div v-else class="mb-4">
          <label class="block text-sm mb-2" style="color: var(--color-text-secondary);">
            Image URL
          </label>
          <input
            v-model="uploadModal.url"
            type="url"
            placeholder="https://example.com/image.png"
            class="w-full px-3 py-2 rounded border"
            style="background-color: var(--color-bg-secondary); border-color: var(--color-border); color: var(--color-text-primary);"
          />
          <p class="text-xs mt-1" style="color: var(--color-text-tertiary);">
            Enter a direct link to an image
          </p>
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex gap-2">
            <button
              @click="saveImage"
              class="btn btn-h5 btn-primary flex-1"
              :disabled="(uploadModal.mode === 'upload' && !uploadModal.file) || (uploadModal.mode === 'url' && !uploadModal.url) || isUploading"
            >
              {{ isUploading ? 'Saving...' : 'Save' }}
            </button>
            <button
              @click="closeUploadModal"
              class="btn btn-h5 btn-secondary"
              :disabled="isUploading"
            >
              Cancel
            </button>
          </div>
          <button
            @click="repullFromAPI"
            class="btn btn-h5 btn-secondary w-full text-sm"
            :disabled="isUploading"
          >
            🔄 Repull from API
          </button>
        </div>
      </div>
    </div>

    <!-- Add Trainer Modal -->
    <div
      v-if="addTrainerModal.show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeAddTrainerModal"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" style="background-color: var(--color-bg-primary);">
        <h3 class="text-lg font-bold mb-4" style="color: var(--color-text-primary);">
          Add New Trainer
        </h3>
        
        <div class="space-y-4">
          <!-- Trainer Name -->
          <div>
            <label class="block text-sm font-medium mb-2" style="color: var(--color-text-primary);">
              Trainer Name *
            </label>
            <input
              v-model="addTrainerModal.trainerName"
              type="text"
              placeholder="Enter trainer name"
              class="w-full px-3 py-2 rounded border"
              style="background-color: var(--color-bg-secondary); border-color: var(--color-border); color: var(--color-text-primary);"
            />
          </div>

          <!-- Toggle between Upload and URL -->
          <div class="flex gap-2 mb-4 border-b" style="border-color: var(--color-border);">
            <button
              @click="addTrainerModal.mode = 'upload'"
              class="px-4 py-2 text-sm font-medium transition-colors"
              :style="addTrainerModal.mode === 'upload' 
                ? { color: 'var(--color-text-primary)', borderBottom: '2px solid var(--color-primary)' }
                : { color: 'var(--color-text-secondary)' }"
            >
              Upload File
            </button>
            <button
              @click="addTrainerModal.mode = 'url'"
              class="px-4 py-2 text-sm font-medium transition-colors"
              :style="addTrainerModal.mode === 'url' 
                ? { color: 'var(--color-text-primary)', borderBottom: '2px solid var(--color-primary)' }
                : { color: 'var(--color-text-secondary)' }"
            >
              Enter URL
            </button>
          </div>

          <!-- Upload File Mode -->
          <div v-if="addTrainerModal.mode === 'upload'">
            <input
              ref="addTrainerFileInput"
              type="file"
              accept="image/*"
              @change="handleAddTrainerFileSelect"
              class="hidden"
            />
            <button
              @click="addTrainerFileInput?.click()"
              class="btn btn-h5 btn-secondary w-full mb-2"
            >
              Choose File
            </button>
            <p v-if="addTrainerModal.fileName" class="text-sm" style="color: var(--color-text-secondary);">
              Selected: {{ addTrainerModal.fileName }}
            </p>
          </div>

          <!-- URL Mode -->
          <div v-else>
            <label class="block text-sm font-medium mb-2" style="color: var(--color-text-primary);">
              Icon URL *
            </label>
            <input
              v-model="addTrainerModal.url"
              type="url"
              placeholder="https://example.com/trainer.png"
              class="w-full px-3 py-2 rounded border"
              style="background-color: var(--color-bg-secondary); border-color: var(--color-border); color: var(--color-text-primary);"
            />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 justify-end mt-6">
          <button
            @click="closeAddTrainerModal"
            class="btn btn-h5 btn-ghost"
          >
            Cancel
          </button>
          <button
            @click="saveNewTrainer"
            class="btn btn-h5 btn-primary"
            :disabled="!addTrainerModal.trainerName || ((addTrainerModal.mode === 'upload' && !addTrainerModal.file) || (addTrainerModal.mode === 'url' && !addTrainerModal.url)) || isSavingTrainer"
          >
            {{ isSavingTrainer ? 'Saving...' : 'Add Trainer' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Trainer Edit Modal -->
    <div
      v-if="trainerEditModal.show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeTrainerEditModal"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" style="background-color: var(--color-bg-primary);">
        <h3 class="text-lg font-bold mb-4" style="color: var(--color-text-primary);">
          Edit Icon for {{ trainerEditModal.trainer?.trainerName }}
        </h3>
        
        <!-- Toggle between Upload and URL -->
        <div class="flex gap-2 mb-4 border-b" style="border-color: var(--color-border);">
          <button
            @click="trainerEditModal.mode = 'upload'"
            class="px-4 py-2 text-sm font-medium transition-colors"
            :style="trainerEditModal.mode === 'upload' 
              ? { color: 'var(--color-text-primary)', borderBottom: '2px solid var(--color-primary)' }
              : { color: 'var(--color-text-secondary)' }"
          >
            Upload File
          </button>
          <button
            @click="trainerEditModal.mode = 'url'"
            class="px-4 py-2 text-sm font-medium transition-colors"
            :style="trainerEditModal.mode === 'url' 
              ? { color: 'var(--color-text-primary)', borderBottom: '2px solid var(--color-primary)' }
              : { color: 'var(--color-text-secondary)' }"
          >
            Enter URL
          </button>
        </div>

        <!-- Upload File Mode -->
        <div v-if="trainerEditModal.mode === 'upload'" class="mb-4">
          <input
            ref="trainerFileInput"
            type="file"
            accept="image/*"
            @change="handleTrainerFileSelect"
            class="hidden"
          />
          <button
            @click="trainerFileInput?.click()"
            class="btn btn-h5 btn-secondary w-full mb-2"
          >
            Choose File
          </button>
          <p v-if="trainerEditModal.fileName" class="text-sm" style="color: var(--color-text-secondary);">
            Selected: {{ trainerEditModal.fileName }}
          </p>
        </div>

        <!-- URL Mode -->
        <div v-else class="mb-4">
          <input
            v-model="trainerEditModal.url"
            type="url"
            placeholder="https://example.com/trainer.png"
            class="w-full px-3 py-2 rounded border"
            style="background-color: var(--color-bg-secondary); border-color: var(--color-border); color: var(--color-text-primary);"
          />
        </div>

        <!-- Actions -->
        <div class="flex gap-2 justify-end">
          <button
            @click="closeTrainerEditModal"
            class="btn btn-h5 btn-ghost"
          >
            Cancel
          </button>
          <button
            @click="saveTrainerIcon"
            class="btn btn-h5 btn-primary"
            :disabled="(trainerEditModal.mode === 'upload' && !trainerEditModal.file) || (trainerEditModal.mode === 'url' && !trainerEditModal.url) || isSavingTrainer"
          >
            {{ isSavingTrainer ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { collection, getCountFromServer, getDocs, query, where, doc, updateDoc } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../config/firebase'
import { seedPokemonCollection, seedSets, seedCardsForSet } from '../utils/simplifiedSeeder'
import { getAllTrainers, saveTrainer } from '../utils/firebaseTrainers'
import { fetchSetById } from '../utils/tcgdxAPI'
import { mapTCGdxSetToSchema } from '../utils/tcgdxAPI'
import { Timestamp } from 'firebase/firestore'

// State
const pokemonCount = ref(0)
const setsEnCount = ref(0)
const setsJaCount = ref(0)
const cardsEnCount = ref(0)
const cardsJaCount = ref(0)

const isSeedingPokemon = ref(false)
const isSeedingSetsEn = ref(false)
const isSeedingSetsJa = ref(false)

// Trainers
const trainers = ref([])
const loadingTrainers = ref(false)
const trainerSearchQuery = ref('')
const currentTrainerPage = ref(1)
const trainersPerPage = 10
const trainerEditModal = ref({
  show: false,
  trainer: null,
  mode: 'url', // 'upload' or 'url'
  file: null,
  fileName: '',
  url: ''
})
const addTrainerModal = ref({
  show: false,
  trainerName: '',
  mode: 'url', // 'upload' or 'url'
  file: null,
  fileName: '',
  url: ''
})
const isSavingTrainer = ref(false)
const trainerFileInput = ref(null)
const addTrainerFileInput = ref(null)

const setsEn = ref([])
const setsJa = ref([])
const loadingSetsEn = ref(false)
const loadingSetsJa = ref(false)
const isFetchingCards = ref({}) // Track which sets are being fetched

const message = ref('')
const messageType = ref('success')

// Upload modal state
const uploadModal = ref({
  show: false,
  set: null,
  type: 'logo', // 'logo' or 'symbol'
  mode: 'upload', // 'upload' or 'url'
  file: null,
  fileName: '',
  url: ''
})
const isUploading = ref(false)
const fileInput = ref(null)

// Collapsible sections
const isSetsEnExpanded = ref(true)
const isSetsJaExpanded = ref(true)

// Load counts
const loadCounts = async () => {
  try {
    const [pokemonSnap, setsEnSnap, setsJaSnap, cardsEnSnap, cardsJaSnap] = await Promise.all([
      getCountFromServer(collection(db, 'pokemon')),
      getCountFromServer(collection(db, 'set_en')),
      getCountFromServer(collection(db, 'set_ja')),
      getCountFromServer(collection(db, 'card_en')),
      getCountFromServer(collection(db, 'card_ja'))
    ])
    
    pokemonCount.value = pokemonSnap.data().count
    setsEnCount.value = setsEnSnap.data().count
    setsJaCount.value = setsJaSnap.data().count
    cardsEnCount.value = cardsEnSnap.data().count
    cardsJaCount.value = cardsJaSnap.data().count
  } catch (error) {
    console.error('Error loading counts:', error)
  }
}

// Seed Pokemon
const seedPokemon = async () => {
  isSeedingPokemon.value = true
  message.value = ''
  
  try {
    const result = await seedPokemonCollection()
    if (result.success) {
      message.value = `✅ Seeded ${result.added} Pokemon, updated ${result.updated}`
      messageType.value = 'success'
      await loadCounts()
    } else {
      message.value = `❌ Error: ${result.error}`
      messageType.value = 'error'
    }
  } catch (error) {
    message.value = `❌ Error: ${error.message}`
    messageType.value = 'error'
  } finally {
    isSeedingPokemon.value = false
  }
}

// Seed English Sets
const seedSetsEn = async () => {
  isSeedingSetsEn.value = true
  message.value = ''
  
  try {
    const result = await seedSets('en')
    if (result.success) {
      message.value = `✅ Seeded ${result.added} English sets, updated ${result.updated}`
      messageType.value = 'success'
      await loadCounts()
      await loadSets() // Reload sets to show new ones
    } else {
      message.value = `❌ Error: ${result.error}`
      messageType.value = 'error'
    }
  } catch (error) {
    message.value = `❌ Error: ${error.message}`
    messageType.value = 'error'
  } finally {
    isSeedingSetsEn.value = false
  }
}

// Seed Japanese Sets
const seedSetsJa = async () => {
  isSeedingSetsJa.value = true
  message.value = ''
  
  try {
    const result = await seedSets('ja')
    if (result.success) {
      message.value = `✅ Seeded ${result.added} Japanese sets, updated ${result.updated}`
      messageType.value = 'success'
      await loadCounts()
      await loadSets() // Reload sets to show new ones
    } else {
      message.value = `❌ Error: ${result.error}`
      messageType.value = 'error'
    }
  } catch (error) {
    message.value = `❌ Error: ${error.message}`
    messageType.value = 'error'
  } finally {
    isSeedingSetsJa.value = false
  }
}

// Filtered trainers based on search (searches all trainers, not just current page)
const filteredTrainers = computed(() => {
  if (!trainerSearchQuery.value) {
    return trainers.value
  }
  const query = trainerSearchQuery.value.toLowerCase()
  return trainers.value.filter(trainer =>
    trainer.trainerName?.toLowerCase().includes(query)
  )
})

// Pagination computed properties
const totalTrainerPages = computed(() => {
  return Math.ceil(filteredTrainers.value.length / trainersPerPage)
})

const paginationStart = computed(() => {
  return filteredTrainers.value.length === 0 ? 0 : (currentTrainerPage.value - 1) * trainersPerPage + 1
})

const paginationEnd = computed(() => {
  return Math.min(currentTrainerPage.value * trainersPerPage, filteredTrainers.value.length)
})

const trainerPages = computed(() => {
  const pages = []
  const total = totalTrainerPages.value
  const current = currentTrainerPage.value
  
  // Show up to 5 page numbers
  let start = Math.max(1, current - 2)
  let end = Math.min(total, start + 4)
  
  // Adjust start if we're near the end
  if (end - start < 4) {
    start = Math.max(1, end - 4)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Paginated trainers (only show 10 per page)
const paginatedTrainers = computed(() => {
  const start = (currentTrainerPage.value - 1) * trainersPerPage
  const end = start + trainersPerPage
  return filteredTrainers.value.slice(start, end)
})

// Watch search query to reset to page 1
watch(trainerSearchQuery, () => {
  currentTrainerPage.value = 1
})

// Load trainers
const loadTrainers = async () => {
  loadingTrainers.value = true
  try {
    const allTrainers = await getAllTrainers()
    trainers.value = allTrainers.sort((a, b) => 
      (a.trainerName || '').localeCompare(b.trainerName || '')
    )
  } catch (error) {
    console.error('Error loading trainers:', error)
    message.value = `❌ Error loading trainers: ${error.message}`
    messageType.value = 'error'
  } finally {
    loadingTrainers.value = false
  }
}

// Handle trainer image error
const handleTrainerImageError = (event) => {
  event.target.style.display = 'none'
}

// Open trainer edit modal
const openTrainerEditModal = (trainer) => {
  trainerEditModal.value = {
    show: true,
    trainer,
    mode: 'url',
    file: null,
    fileName: '',
    url: trainer.icon || ''
  }
}

// Close trainer edit modal
const closeTrainerEditModal = () => {
  trainerEditModal.value = {
    show: false,
    trainer: null,
    mode: 'url',
    file: null,
    fileName: '',
    url: ''
  }
  if (trainerFileInput.value) {
    trainerFileInput.value.value = ''
  }
}

// Handle trainer file select
const handleTrainerFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    trainerEditModal.value.file = file
    trainerEditModal.value.fileName = file.name
  }
}

// Save trainer icon
const saveTrainerIcon = async () => {
  if (!trainerEditModal.value.trainer) return
  
  const trainer = trainerEditModal.value.trainer
  const mode = trainerEditModal.value.mode
  
  // Validate based on mode
  if (mode === 'upload' && !trainerEditModal.value.file) return
  if (mode === 'url' && !trainerEditModal.value.url?.trim()) return

  isSavingTrainer.value = true
  message.value = ''

  try {
    let downloadURL = ''
    
    if (mode === 'upload') {
      // Upload file to Firebase Storage
      const file = trainerEditModal.value.file
      const fileExt = file.name.split('.').pop()
      const fileName = `icon.${fileExt}`
      const storagePath = `trainers/${trainer.id}/${fileName}`
      const imageRef = storageRef(storage, storagePath)

      await uploadBytes(imageRef, file)
      downloadURL = await getDownloadURL(imageRef)
    } else {
      // Use provided URL directly
      downloadURL = trainerEditModal.value.url.trim()
      
      // Basic URL validation
      try {
        new URL(downloadURL)
      } catch (e) {
        throw new Error('Please enter a valid URL')
      }
    }

    // Update trainer document in Firestore
    const trainerRef = doc(db, 'trainers', trainer.id)
    
    await updateDoc(trainerRef, {
      icon: downloadURL,
      updatedAt: Timestamp.now()
    })

    // Update local state reactively
    const index = trainers.value.findIndex(t => t.id === trainer.id)
    if (index !== -1) {
      // Use Vue's reactivity to update the icon
      trainers.value[index] = {
        ...trainers.value[index],
        icon: downloadURL
      }
    }

    message.value = `✅ Successfully saved icon for ${trainer.trainerName}`
    messageType.value = 'success'
    closeTrainerEditModal()
  } catch (error) {
    console.error('Error saving trainer icon:', error)
    message.value = `❌ Error saving icon: ${error.message}`
    messageType.value = 'error'
  } finally {
    isSavingTrainer.value = false
  }
}

// Open add trainer modal
const openAddTrainerModal = () => {
  addTrainerModal.value = {
    show: true,
    trainerName: '',
    mode: 'url',
    file: null,
    fileName: '',
    url: ''
  }
}

// Close add trainer modal
const closeAddTrainerModal = () => {
  addTrainerModal.value = {
    show: false,
    trainerName: '',
    mode: 'url',
    file: null,
    fileName: '',
    url: ''
  }
  if (addTrainerFileInput.value) {
    addTrainerFileInput.value.value = ''
  }
}

// Handle add trainer file select
const handleAddTrainerFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    addTrainerModal.value.file = file
    addTrainerModal.value.fileName = file.name
  }
}

// Save new trainer
const saveNewTrainer = async () => {
  if (!addTrainerModal.value.trainerName?.trim()) {
    message.value = '❌ Please enter a trainer name'
    messageType.value = 'error'
    return
  }

  const mode = addTrainerModal.value.mode
  
  // Validate based on mode
  if (mode === 'upload' && !addTrainerModal.value.file) return
  if (mode === 'url' && !addTrainerModal.value.url?.trim()) return

  isSavingTrainer.value = true
  message.value = ''

  try {
    let iconURL = ''
    
    if (mode === 'upload') {
      // Upload file to Firebase Storage
      const file = addTrainerModal.value.file
      const fileExt = file.name.split('.').pop()
      const fileName = `icon.${fileExt}`
      // Use trainer name for folder (will be sanitized)
      const sanitizedName = addTrainerModal.value.trainerName.toLowerCase().replace(/[^a-z0-9]/g, '_')
      const storagePath = `trainers/${sanitizedName}/${fileName}`
      const imageRef = storageRef(storage, storagePath)

      await uploadBytes(imageRef, file)
      iconURL = await getDownloadURL(imageRef)
    } else {
      // Use provided URL directly
      iconURL = addTrainerModal.value.url.trim()
      
      // Basic URL validation
      try {
        new URL(iconURL)
      } catch (e) {
        throw new Error('Please enter a valid URL')
      }
    }

    // Create trainer document in Firestore
    const trainerData = {
      trainerName: addTrainerModal.value.trainerName.trim(),
      icon: iconURL,
      artistCreditUrl: 'https://play.pokemonshowdown.com/sprites/trainers/?filter=credited',
      hide: false
    }

    const trainerId = await saveTrainer(trainerData)

    // Add to local state (will be sorted by name)
    const newTrainer = {
      id: trainerId,
      ...trainerData
    }
    trainers.value.push(newTrainer)
    trainers.value.sort((a, b) => (a.trainerName || '').localeCompare(b.trainerName || ''))

    message.value = `✅ Successfully added trainer: ${addTrainerModal.value.trainerName}`
    messageType.value = 'success'
    closeAddTrainerModal()
  } catch (error) {
    console.error('Error saving new trainer:', error)
    message.value = `❌ Error adding trainer: ${error.message}`
    messageType.value = 'error'
  } finally {
    isSavingTrainer.value = false
  }
}

// Toggle trainer visibility
const toggleTrainerVisibility = async (trainer) => {
  const newHideValue = !trainer.hide
  
  try {
    const trainerRef = doc(db, 'trainers', trainer.id)
    await updateDoc(trainerRef, {
      hide: newHideValue,
      updatedAt: Timestamp.now()
    })

    // Update local state reactively
    const index = trainers.value.findIndex(t => t.id === trainer.id)
    if (index !== -1) {
      trainers.value[index] = {
        ...trainers.value[index],
        hide: newHideValue
      }
    }

    message.value = `✅ Trainer ${newHideValue ? 'hidden' : 'shown'}: ${trainer.trainerName}`
    messageType.value = 'success'
  } catch (error) {
    console.error('Error toggling trainer visibility:', error)
    message.value = `❌ Error: ${error.message}`
    messageType.value = 'error'
  }
}

// Load sets
const loadSets = async () => {
  loadingSetsEn.value = true
  loadingSetsJa.value = true
  
  try {
    // Load all sets and cards in parallel
    const [setsEnSnapshot, setsJaSnapshot, cardsEnSnapshot, cardsJaSnapshot] = await Promise.all([
      getDocs(collection(db, 'set_en')),
      getDocs(collection(db, 'set_ja')),
      getDocs(collection(db, 'card_en')),
      getDocs(collection(db, 'card_ja'))
    ])
    
    // Count cards by setApiId in memory (dynamic count from actual cards)
    const cardCountsEn = new Map()
    cardsEnSnapshot.docs.forEach(doc => {
      const cardData = doc.data()
      // Try setApiId first (new structure), then fallback to set.id or apiSetId (old structure)
      const apiSetId = cardData.setApiId || cardData.set?.id || cardData.apiSetId
      if (apiSetId) {
        cardCountsEn.set(apiSetId, (cardCountsEn.get(apiSetId) || 0) + 1)
      }
    })
    
    const cardCountsJa = new Map()
    cardsJaSnapshot.docs.forEach(doc => {
      const cardData = doc.data()
      // Try setApiId first (new structure), then fallback to set.id or apiSetId (old structure)
      const apiSetId = cardData.setApiId || cardData.set?.id || cardData.apiSetId
      if (apiSetId) {
        cardCountsJa.set(apiSetId, (cardCountsJa.get(apiSetId) || 0) + 1)
      }
    })
    
    // Process English sets - always use dynamic count from cards (ignore stale cardCount in set document)
    const enSets = setsEnSnapshot.docs.map(doc => {
      const data = doc.data()
      // Always count dynamically from cards collection (more accurate)
      const cardCount = cardCountsEn.get(data.apiId) || 0
      return {
        id: doc.id,
        ...data,
        language: 'en',
        cardCount
      }
    })
    
    setsEn.value = enSets.sort((a, b) => {
      const dateA = a.releaseDate?.toMillis?.() || (a.releaseDate?.seconds ? a.releaseDate.seconds * 1000 : 0)
      const dateB = b.releaseDate?.toMillis?.() || (b.releaseDate?.seconds ? b.releaseDate.seconds * 1000 : 0)
      return dateB - dateA
    })
    
    // Process Japanese sets - always use dynamic count from cards (ignore stale cardCount in set document)
    const jaSets = setsJaSnapshot.docs.map(doc => {
      const data = doc.data()
      // Always count dynamically from cards collection (more accurate)
      const cardCount = cardCountsJa.get(data.apiId) || 0
      return {
        id: doc.id,
        ...data,
        language: 'ja',
        cardCount
      }
    })
    
    setsJa.value = jaSets.sort((a, b) => {
      const dateA = a.releaseDate?.toMillis?.() || (a.releaseDate?.seconds ? a.releaseDate.seconds * 1000 : 0)
      const dateB = b.releaseDate?.toMillis?.() || (b.releaseDate?.seconds ? b.releaseDate.seconds * 1000 : 0)
      return dateB - dateA
    })
  } catch (error) {
    console.error('Error loading sets:', error)
    message.value = `❌ Error loading sets: ${error.message}`
    messageType.value = 'error'
  } finally {
    loadingSetsEn.value = false
    loadingSetsJa.value = false
  }
}

// Update card count for a specific set dynamically (without reloading all sets)
const updateSetCardCount = async (setApiId, language) => {
  try {
    const collectionName = `card_${language}`
    const cardsSnapshot = await getDocs(collection(db, collectionName))
    
    let count = 0
    cardsSnapshot.docs.forEach(doc => {
      const cardData = doc.data()
      // Try setApiId first (new structure), then fallback to set.id or apiSetId (old structure)
      const cardSetApiId = cardData.setApiId || cardData.set?.id || cardData.apiSetId
      if (cardSetApiId === setApiId) {
        count++
      }
    })
    
    // Update the card count in the sets array reactively
    const setsArray = language === 'en' ? setsEn.value : setsJa.value
    const setIndex = setsArray.findIndex(s => s.apiId === setApiId)
    if (setIndex !== -1) {
      setsArray[setIndex].cardCount = count
    }
  } catch (error) {
    console.error('Error updating card count:', error)
  }
}

// Seed cards for a specific set
const seedCardsForSetHandler = async (setId, language) => {
  isFetchingCards.value[setId] = true
  message.value = ''
  
  try {
    const result = await seedCardsForSet(setId, language)
    if (result.success) {
      message.value = `✅ Seeded ${result.added} ${language === 'en' ? 'English' : 'Japanese'} cards, updated ${result.updated} for set ${setId}`
      messageType.value = 'success'
      await loadCounts() // Update total card counts
      // Update card count dynamically for this specific set (faster than reloading all sets)
      await updateSetCardCount(setId, language)
    } else {
      message.value = `❌ Error: ${result.error}`
      messageType.value = 'error'
    }
  } catch (error) {
    message.value = `❌ Error: ${error.message}`
    messageType.value = 'error'
  } finally {
    isFetchingCards.value[setId] = false
  }
}

// Handle image load errors (suppress 404 console errors)
const handleImageError = (event, set, type) => {
  // Hide broken images silently
  event.target.style.display = 'none'
  // Prevent console errors by stopping propagation
  event.stopPropagation()
}

// Open upload modal
const openUploadModal = (set, type) => {
  uploadModal.value = {
    show: true,
    set,
    type,
    mode: 'upload',
    file: null,
    fileName: '',
    url: ''
  }
}

// Close upload modal
const closeUploadModal = () => {
  uploadModal.value = {
    show: false,
    set: null,
    type: 'logo',
    mode: 'upload',
    file: null,
    fileName: '',
    url: ''
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Handle file selection
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    uploadModal.value.file = file
    uploadModal.value.fileName = file.name
  }
}

// Save image (either upload file or save URL)
const saveImage = async () => {
  if (!uploadModal.value.set) return
  
  const set = uploadModal.value.set
  const type = uploadModal.value.type
  const mode = uploadModal.value.mode
  
  // Validate based on mode
  if (mode === 'upload' && !uploadModal.value.file) return
  if (mode === 'url' && !uploadModal.value.url?.trim()) return

  isUploading.value = true
  message.value = ''

  try {
    let downloadURL = ''
    
    if (mode === 'upload') {
      // Upload file to Firebase Storage
      const file = uploadModal.value.file
      const fileExt = file.name.split('.').pop()
      const fileName = `${type}.${fileExt}`
      const storagePath = `sets/${set.language}/${set.apiId}/${fileName}`
      const imageRef = storageRef(storage, storagePath)

      await uploadBytes(imageRef, file)
      downloadURL = await getDownloadURL(imageRef)
    } else {
      // Use provided URL directly
      downloadURL = uploadModal.value.url.trim()
      
      // Basic URL validation
      try {
        new URL(downloadURL)
      } catch (e) {
        throw new Error('Please enter a valid URL')
      }
    }

    // Update set document in Firestore
    const collectionName = `set_${set.language}`
    const setRef = doc(db, collectionName, set.id)
    const updateField = type === 'logo' ? 'logo' : 'symbol'
    
    await updateDoc(setRef, {
      [updateField]: downloadURL,
      updatedAt: new Date()
    })

    // Update local state
    if (set.language === 'en') {
      const index = setsEn.value.findIndex(s => s.id === set.id)
      if (index !== -1) {
        setsEn.value[index][updateField] = downloadURL
      }
    } else {
      const index = setsJa.value.findIndex(s => s.id === set.id)
      if (index !== -1) {
        setsJa.value[index][updateField] = downloadURL
      }
    }

    message.value = `✅ Successfully saved ${type} for ${set.name}`
    messageType.value = 'success'
    closeUploadModal()
  } catch (error) {
    console.error('Error saving image:', error)
    message.value = `❌ Error saving ${type}: ${error.message}`
    messageType.value = 'error'
  } finally {
    isUploading.value = false
  }
}

// Repull set data from API and update logo/symbol
const repullFromAPI = async () => {
  if (!uploadModal.value.set) return

  const set = uploadModal.value.set
  const type = uploadModal.value.type
  
  isUploading.value = true
  message.value = ''

  try {
    // Fetch set data from TCGdx API
    const apiResult = await fetchSetById(set.apiId, set.language)
    
    if (!apiResult.success) {
      throw new Error(apiResult.error || 'Failed to fetch set from API')
    }

    // Map API data to schema (this will format logo/symbol URLs correctly)
    const mappedSet = mapTCGdxSetToSchema(apiResult.data, set.language)
    
    // Get the logo or symbol URL from the mapped data
    const apiUrl = type === 'logo' ? mappedSet.logo : mappedSet.symbol
    
    if (!apiUrl) {
      throw new Error(`No ${type} found in API response`)
    }

    // Update set document in Firestore
    const collectionName = `set_${set.language}`
    const setRef = doc(db, collectionName, set.id)
    const updateField = type === 'logo' ? 'logo' : 'symbol'
    
    await updateDoc(setRef, {
      [updateField]: apiUrl,
      updatedAt: new Date()
    })

    // Update local state
    if (set.language === 'en') {
      const index = setsEn.value.findIndex(s => s.id === set.id)
      if (index !== -1) {
        setsEn.value[index][updateField] = apiUrl
      }
    } else {
      const index = setsJa.value.findIndex(s => s.id === set.id)
      if (index !== -1) {
        setsJa.value[index][updateField] = apiUrl
      }
    }

    message.value = `✅ Successfully repulled ${type} from API for ${set.name}`
    messageType.value = 'success'
    closeUploadModal()
  } catch (error) {
    console.error('Error repulling from API:', error)
    message.value = `❌ Error repulling ${type} from API: ${error.message}`
    messageType.value = 'error'
  } finally {
    isUploading.value = false
  }
}

// Format set release date for display
const formatSetDate = (set) => {
  if (set.releaseDate) {
    let dateObj
    if (set.releaseDate instanceof Timestamp) {
      dateObj = set.releaseDate.toDate()
    } else if (set.releaseDate?.toDate) {
      dateObj = set.releaseDate.toDate()
    } else if (set.releaseDate instanceof Date) {
      dateObj = set.releaseDate
    } else if (set.releaseDate?.seconds) {
      dateObj = new Date(set.releaseDate.seconds * 1000)
    } else {
      return set.releaseYear || 'N/A'
    }
    
    const month = dateObj.toLocaleDateString('en-US', { month: 'short' })
    const day = dateObj.getDate()
    const year = dateObj.getFullYear()
    const ordinal = getOrdinalSuffix(day)
    
    return `${month} ${day}${ordinal} ${year}`
  } else if (set.releaseYear) {
    return set.releaseYear.toString()
  }
  return 'N/A'
}

const getOrdinalSuffix = (day) => {
  if (day > 3 && day < 21) return 'th'
  switch (day % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

onMounted(() => {
  loadCounts()
  loadSets()
  loadTrainers()
})
</script>

