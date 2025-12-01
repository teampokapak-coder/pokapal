<template>
  <div class="min-h-screen" style="background-color: var(--color-bg-primary);">
    <section class="section section-spacing-md">
      <div class="section-container">
        <div class="section-header">
          <h2>Start Master Set</h2>
          <p class="section-subtitle">Create a new master set collection</p>
        </div>

        <!-- Login Required Message -->
        <div v-if="!user" class="max-w-3xl mx-auto">
          <div class="card text-center py-12">
            <h3 class="mb-4">Log in to start your master set</h3>
            <p class="mb-6" style="color: var(--color-text-secondary);">
              You need to be logged in to create a master set collection.
            </p>
            <router-link to="/login" class="btn btn-h4 btn-primary">
              Go to Login
            </router-link>
          </div>
        </div>

        <div v-else class="max-w-3xl mx-auto">
          <!-- Step Indicator -->
          <div class="mb-8">
            <div class="flex items-center justify-between">
              <div 
                v-for="(step, index) in steps" 
                :key="index"
                class="flex items-center flex-1"
              >
                <div class="flex flex-col items-center flex-1">
                  <div 
                    class="w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors"
                    :class="currentStep > index ? 'bg-gray-900 text-white' : currentStep === index ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-600'"
                  >
                    {{ index + 1 }}
                  </div>
                  <p class="text-xs mt-2 text-center text-gray-600">{{ step }}</p>
                </div>
                <div v-if="index < steps.length - 1" class="flex-1 h-1 mx-2" :class="currentStep > index ? 'bg-gray-900' : 'bg-gray-200'"></div>
              </div>
            </div>
          </div>

          <!-- Step 1: Name Challenge -->
          <div v-if="currentStep === 1" class="card">
            <div class="card-header">
              <h3 class="card-title">Name Your Challenge</h3>
              <p class="card-subtitle">Give your master set a name</p>
            </div>
            <div class="card-body">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Challenge Name</label>
                <input
                  v-model="form.challengeName"
                  type="text"
                  placeholder="e.g., Base Set Master Set, Charizard Collection..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
                <p class="text-xs text-gray-500 mt-2">This will be the name of your collection</p>
              </div>
              <div class="mt-6 flex justify-end">
                <button
                  @click="nextStep"
                  class="btn btn-h3 btn-primary"
                  :disabled="!form.challengeName.trim()"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <!-- Step 2: Invite Users -->
          <div v-if="currentStep === 2" class="card">
            <div class="card-header">
              <h3 class="card-title">Invite Friends</h3>
              <p class="card-subtitle">Add friends to your challenge (optional)</p>
            </div>
            <div class="card-body">
              <div class="space-y-4">
                <div v-if="form.invites.length > 0" class="space-y-2">
                  <div v-for="(invite, index) in form.invites" :key="index" class="flex gap-2 items-start">
                    <div class="flex-1">
                      <input
                        v-model="invite.email"
                        type="email"
                        placeholder="friend@example.com or search for user..."
                        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                        @input="searchUser(invite, index)"
                      />
                      <div v-if="invite.userId" class="mt-1 text-xs text-green-600">
                        ✓ User found: {{ invite.userName || invite.email }}
                      </div>
                      <div v-else-if="invite.email && !invite.searching && invite.email.includes('@')" class="mt-1 text-xs text-gray-500">
                        Will create invite for email (user can accept when they sign up)
                      </div>
                    </div>
                    <button
                      @click="removeInvite(index)"
                      class="btn btn-h5 btn-ghost text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <button
                  @click="addInvite"
                  class="btn btn-h5 btn-secondary w-full"
                >
                  + Add Friend
                </button>
                <p class="text-xs text-gray-500 text-center">You can skip this step if you want to master set solo</p>
              </div>
              <div class="mt-6 flex justify-between">
                <button @click="prevStep" class="btn btn-h3 btn-ghost">Back</button>
                <button
                  @click="nextStep"
                  class="btn btn-h3 btn-primary"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <!-- Step 3: Choose What to Master -->
          <div v-if="currentStep === 3" class="card">
            <div class="card-header">
              <h3 class="card-title">Choose What to Master</h3>
              <p class="card-subtitle">Select what you want to collect</p>
            </div>
            <div class="card-body">
              <div class="space-y-6">

                <!-- Collection Type: Set or Pokemon -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">What to Master</label>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      @click="form.collectionType = 'set'"
                      class="card card-flat p-6 text-left hover:shadow-lg transition-shadow cursor-pointer"
                      :class="form.collectionType === 'set' ? 'border-2 border-gray-900' : ''"
                    >
                      <div class="text-3xl mb-3">📦</div>
                      <h4 class="card-title mb-2">Set</h4>
                      <p class="text-sm text-gray-600">Master a complete set (e.g., Base Set, Jungle)</p>
                    </button>
                    <button
                      @click="form.collectionType = 'pokemon'"
                      class="card card-flat p-6 text-left hover:shadow-lg transition-shadow cursor-pointer"
                      :class="form.collectionType === 'pokemon' ? 'border-2 border-gray-900' : ''"
                    >
                      <div class="text-3xl mb-3">⚡</div>
                      <h4 class="card-title mb-2">Pokemon</h4>
                      <p class="text-sm text-gray-600">Master all cards of a specific Pokemon</p>
                    </button>
                  </div>
                </div>

                <!-- Random or Select Toggle -->
                <div v-if="form.collectionType">
                  <label class="block text-sm font-medium text-gray-700 mb-3">Selection Method</label>
                  <div class="flex gap-4">
                    <button
                      @click="form.selectionType = 'random'"
                      class="btn btn-h4 flex-1"
                      :class="form.selectionType === 'random' ? 'btn-primary' : 'btn-ghost'"
                    >
                      🎲 Random
                    </button>
                    <button
                      @click="form.selectionType = 'select'"
                      class="btn btn-h4 flex-1"
                      :class="form.selectionType === 'select' ? 'btn-primary' : 'btn-ghost'"
                    >
                      📋 Select
                    </button>
                  </div>
                </div>

                <!-- Set Selection -->
                <div v-if="form.collectionType === 'set'">
                  <!-- Random Set Display -->
                  <div v-if="form.selectionType === 'random' && form.selectedSet" class="card card-elevated">
                    <div class="card-body">
                      <div class="text-center mb-4">
                        <h4 class="mb-2">{{ form.selectedSet.name }}</h4>
                        <p class="text-gray-600 mb-4">{{ form.selectedSet.totalCards }} cards</p>
                      </div>
                      
                      <!-- Assignment Controls -->
                      <div class="border-t border-gray-200 pt-4">
                        <div class="space-y-3">
                          <!-- Assignment dropdown + Save button - ALWAYS SHOW -->
                          <div class="space-y-3">
                            <label class="block text-sm font-medium text-gray-700">Assign to:</label>
                            <div class="flex gap-2">
                              <select
                                v-model="currentAssignmentTarget"
                                class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                              >
                                <option value="all">Assign to All</option>
                                <option :value="user?.uid || 'creator'">{{ user?.displayName || user?.email || 'You' }}</option>
                                <option 
                                  v-for="invite in form.invites.filter(i => i.email && i.email.includes('@'))" 
                                  :key="invite.userId || invite.email"
                                  :value="invite.userId || invite.email"
                                >
                                  {{ invite.userName || invite.email }}
                                </option>
                              </select>
                              <button
                                @click="saveSetAssignment"
                                class="btn btn-h5 btn-primary"
                                :disabled="!currentAssignmentTarget"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                          
                          <button
                            @click="pickRandomSet"
                            class="btn btn-h5 btn-secondary w-full"
                          >
                            🎲 Pick Another Set
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Select Set Dropdown -->
                  <div v-if="form.selectionType === 'select'">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Select Set</label>
                    <select
                      v-model="form.selectedSetId"
                      class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 mb-3"
                      @change="onSetSelected"
                    >
                      <option value="">Choose a set...</option>
                      <option v-for="set in availableSets" :key="set.id" :value="set.id">
                        {{ set.name }} ({{ set.totalCards }} cards)
                      </option>
                    </select>
                    
                    <!-- Assignment Controls for Selected Set -->
                    <div v-if="form.selectedSetId" class="card card-flat p-4">
                      <div class="mb-3">
                        <h4 class="mb-1">{{ getSetName(form.selectedSetId) }}</h4>
                        <p class="text-sm text-gray-600">{{ form.selectedSet?.totalCards || 0 }} cards</p>
                      </div>
                      
                      <div class="border-t border-gray-200 pt-3">
                        <div class="space-y-3">
                          <!-- Assignment dropdown + Save button - ALWAYS SHOW -->
                          <div class="space-y-3">
                            <label class="block text-sm font-medium text-gray-700">Assign to:</label>
                            <div class="flex gap-2">
                              <select
                                v-model="currentAssignmentTarget"
                                class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                              >
                                <option value="all">Assign to All</option>
                                <option :value="user?.uid || 'creator'">{{ user?.displayName || user?.email || 'You' }}</option>
                                <option 
                                  v-for="invite in form.invites.filter(i => i.email && i.email.includes('@'))" 
                                  :key="invite.userId || invite.email"
                                  :value="invite.userId || invite.email"
                                >
                                  {{ invite.userName || invite.email }}
                                </option>
                              </select>
                              <button
                                @click="saveSetAssignment"
                                class="btn btn-h5 btn-primary"
                                :disabled="!currentAssignmentTarget"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Pick Random Button -->
                  <div v-if="form.selectionType === 'random' && !form.selectedSet" class="text-center">
                    <div v-if="isLoadingSets" class="text-gray-600 mb-4">
                      Loading sets...
                    </div>
                    <button
                      @click="pickRandomSet"
                      class="btn btn-h3 btn-primary"
                      :disabled="isPicking || isLoadingSets"
                    >
                      {{ isPicking ? 'Picking...' : isLoadingSets ? 'Loading...' : '🎲 Pick Random Set' }}
                    </button>
                  </div>
                </div>

                <!-- Pokemon Selection -->
                <div v-if="form.collectionType === 'pokemon'">
                  <!-- Random Pokemon Display -->
                  <div v-if="form.selectionType === 'random' && form.selectedPokemon" class="card card-elevated">
                    <div class="card-body">
                      <div class="flex items-center gap-4 mb-4">
                        <div class="w-20 h-20 pokemon-image-bg rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img 
                            v-if="form.selectedPokemon.imageUrl || form.selectedPokemon.spriteUrl" 
                            :src="form.selectedPokemon.imageUrl || form.selectedPokemon.spriteUrl" 
                            :alt="form.selectedPokemon.displayName || form.selectedPokemon.name"
                            class="w-full h-full object-contain p-2"
                          />
                          <span v-else class="text-2xl font-medium text-gray-500">
                            {{ getPokemonInitial(form.selectedPokemon.displayName || form.selectedPokemon.name) }}
                          </span>
                        </div>
                        <div class="flex-1 text-left">
                          <h4 class="mb-1">{{ form.selectedPokemon.displayName || form.selectedPokemon.name }}</h4>
                          <p class="text-gray-600">
                            {{ form.selectedPokemon.cardCount || 0 }} cards
                            <span v-if="form.selectedPokemon.nationalDexNumber"> • #{{ form.selectedPokemon.nationalDexNumber }}</span>
                          </p>
                        </div>
                      </div>
                      
                      <!-- Assignment Controls -->
                      <div class="border-t border-gray-200 pt-4">
                        <div class="space-y-3">
                          <!-- Assignment dropdown + Save button - ALWAYS SHOW -->
                          <div class="space-y-3">
                            <label class="block text-sm font-medium text-gray-700">Assign to:</label>
                            <div class="flex gap-2">
                              <select
                                v-model="currentAssignmentTarget"
                                class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                              >
                                <option value="all">Assign to All</option>
                                <option :value="user?.uid || 'creator'">{{ user?.displayName || user?.email || 'You' }}</option>
                                <option 
                                  v-for="invite in form.invites.filter(i => i.email && i.email.includes('@'))" 
                                  :key="invite.userId || invite.email"
                                  :value="invite.userId || invite.email"
                                >
                                  {{ invite.userName || invite.email }}
                                </option>
                              </select>
                              <button
                                @click="savePokemonAssignment"
                                class="btn btn-h5 btn-primary"
                                :disabled="!currentAssignmentTarget"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                          
                          <button
                            @click="pickRandomPokemon"
                            class="btn btn-h5 btn-secondary w-full"
                          >
                            🎲 Pick Another Pokemon
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Select Pokemon Search -->
                  <div v-if="form.selectionType === 'select'">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Search Pokemon</label>
                    <input
                      v-model="pokemonSearchQuery"
                      type="text"
                      placeholder="Search by name (e.g., Charizard, Pikachu)..."
                      class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      @input="searchPokemon"
                    />
                  </div>

                  <!-- Pokemon Results -->
                  <div v-if="form.selectionType === 'select' && pokemonSearchQuery && filteredPokemon.length > 0" class="max-h-64 overflow-y-auto border border-gray-200 rounded-md mt-2">
                    <button
                      v-for="pokemon in filteredPokemon.slice(0, 10)"
                      :key="pokemon.id"
                      @click="selectPokemon(pokemon)"
                      class="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      :class="form.selectedPokemonId === pokemon.id ? 'bg-gray-100' : ''"
                    >
                      <div class="flex items-center gap-3">
                        <div class="w-12 h-12 pokemon-image-bg rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img 
                            v-if="pokemon.imageUrl || pokemon.spriteUrl" 
                            :src="pokemon.imageUrl || pokemon.spriteUrl" 
                            :alt="pokemon.displayName || pokemon.name"
                            class="w-full h-full object-contain p-1"
                          />
                          <span v-else class="text-lg font-medium text-gray-500">
                            {{ getPokemonInitial(pokemon.displayName || pokemon.name) }}
                          </span>
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="font-medium text-gray-900 truncate">{{ pokemon.displayName || pokemon.name }}</p>
                          <p class="text-xs text-gray-500">
                            {{ pokemon.cardCount || 0 }} {{ (pokemon.cardCount || 0) === 1 ? 'card' : 'cards' }}
                            <span v-if="pokemon.nationalDexNumber"> • #{{ pokemon.nationalDexNumber }}</span>
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>

                  <!-- Selected Pokemon Display (for select mode) -->
                  <div v-if="form.selectionType === 'select' && form.selectedPokemon" class="card card-elevated mt-4">
                    <div class="card-body">
                      <div class="flex items-center gap-4 mb-4">
                        <div class="w-20 h-20 pokemon-image-bg rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img 
                            v-if="form.selectedPokemon.imageUrl || form.selectedPokemon.spriteUrl" 
                            :src="form.selectedPokemon.imageUrl || form.selectedPokemon.spriteUrl" 
                            :alt="form.selectedPokemon.displayName || form.selectedPokemon.name"
                            class="w-full h-full object-contain p-2"
                          />
                          <span v-else class="text-2xl font-medium text-gray-500">
                            {{ getPokemonInitial(form.selectedPokemon.displayName || form.selectedPokemon.name) }}
                          </span>
                        </div>
                        <div class="flex-1">
                          <h4 class="mb-1">{{ form.selectedPokemon.displayName || form.selectedPokemon.name }}</h4>
                          <p class="text-gray-600">
                            {{ form.selectedPokemon.cardCount || 0 }} cards
                            <span v-if="form.selectedPokemon.nationalDexNumber"> • #{{ form.selectedPokemon.nationalDexNumber }}</span>
                          </p>
                        </div>
                        <button
                          @click="form.selectedPokemon = null; form.selectedPokemonId = null; pokemonSearchQuery = ''"
                          class="btn btn-h5 btn-ghost"
                        >
                          Change
                        </button>
                      </div>
                      
                      <!-- Assignment Controls -->
                      <div class="border-t border-gray-200 pt-4">
                        <div class="space-y-3">
                          <!-- Assignment dropdown + Save button - ALWAYS SHOW -->
                          <div class="space-y-3">
                            <label class="block text-sm font-medium text-gray-700">Assign to:</label>
                            <div class="flex gap-2">
                              <select
                                v-model="currentAssignmentTarget"
                                class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                              >
                                <option value="all">Assign to All</option>
                                <option :value="user?.uid || 'creator'">{{ user?.displayName || user?.email || 'You' }}</option>
                                <option 
                                  v-for="invite in form.invites.filter(i => i.email && i.email.includes('@'))" 
                                  :key="invite.userId || invite.email"
                                  :value="invite.userId || invite.email"
                                >
                                  {{ invite.userName || invite.email }}
                                </option>
                              </select>
                              <button
                                @click="savePokemonAssignment"
                                class="btn btn-h5 btn-primary"
                                :disabled="!currentAssignmentTarget"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Pick Random Button -->
                  <div v-if="form.selectionType === 'random' && !form.selectedPokemon" class="text-center">
                    <div v-if="isLoadingPokemon" class="text-gray-600 mb-4">
                      Loading Pokemon...
                    </div>
                    <button
                      @click="pickRandomPokemon"
                      class="btn btn-h3 btn-primary"
                      :disabled="isPicking || isLoadingPokemon"
                    >
                      {{ isPicking ? 'Picking...' : isLoadingPokemon ? 'Loading...' : '🎲 Pick Random Pokemon' }}
                    </button>
                  </div>

                  <!-- Empty State -->
                  <div v-if="form.selectionType === 'select' && pokemonSearchQuery && filteredPokemon.length === 0 && !isLoadingPokemon" class="text-center py-8 text-gray-500">
                    <p>No Pokemon found matching "{{ pokemonSearchQuery }}"</p>
                  </div>
                </div>

                <!-- Summary of Assignments - ALWAYS SHOW -->
                <div class="mt-6 pt-6 border-t border-gray-200">
                  <h5 class="mb-3">Current Assignments</h5>
                  
                  <!-- Check if we have "Assign to All" -->
                  <div v-if="hasAssignToAll && (form.selectedSetId || form.selectedPokemonId)" class="card card-flat p-3 mb-3">
                    <div class="flex items-center justify-between">
                      <p class="text-sm text-gray-700">
                        <span class="font-medium">All users:</span> 
                        <span v-if="form.collectionType === 'set' && form.selectedSetId">{{ getSetName(form.selectedSetId) }}</span>
                        <span v-else-if="form.collectionType === 'pokemon' && form.selectedPokemonId">{{ getPokemonName(form.selectedPokemonId) }}</span>
                      </p>
                      <button
                        @click="hasAssignToAll = false; form.selectedSetId = null; form.selectedPokemonId = null; form.selectedSet = null; form.selectedPokemon = null; form.individualAssignments = {}"
                        class="text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  <!-- Individual Assignments -->
                  <div v-if="Object.keys(form.individualAssignments).length > 0" class="space-y-2">
                    <div 
                      v-for="(assignment, personId) in form.individualAssignments" 
                      :key="personId"
                      class="card card-flat p-3"
                    >
                      <div class="flex items-center justify-between">
                        <p class="text-sm text-gray-700">
                          <span class="font-medium">{{ getPersonName(personId) }}:</span>
                          <span v-if="assignment.type === 'set' && assignment.setId">{{ getSetName(assignment.setId) }}</span>
                          <span v-else-if="assignment.type === 'pokemon' && assignment.pokemonId">{{ getPokemonName(assignment.pokemonId) }}</span>
                          <span v-else class="text-gray-400 italic">Invalid assignment</span>
                        </p>
                        <button
                          @click="removeAssignment(personId)"
                          class="text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="!hasAssignToAll && Object.keys(form.individualAssignments).length === 0" class="text-sm text-gray-500 text-center py-4">
                    No assignments yet. Select a set/pokemon above and click "Save" to assign it.
                  </div>
                </div>
              </div>
              <div class="mt-6 flex justify-between">
                <button @click="prevStep" class="btn btn-h3 btn-ghost">Back</button>
                <button
                  @click="nextStep"
                  class="btn btn-h3 btn-primary"
                  :disabled="!canProceedToReview"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <!-- Step 4: Review & Create -->
          <div v-if="currentStep === 4" class="card">
            <div class="card-header">
              <h3 class="card-title">Review & Create</h3>
              <p class="card-subtitle">Review your master set details</p>
            </div>
            <div class="card-body">
              <div class="space-y-4">
                <div>
                  <h4 class="text-sm font-medium text-gray-700 mb-1">Challenge Name</h4>
                  <p class="text-gray-900">{{ form.challengeName }}</p>
                </div>
                <div v-if="form.invites.length > 0 && form.invites.some(i => i.email && i.email.includes('@'))">
                  <h4 class="text-sm font-medium text-gray-700 mb-1">Invites</h4>
                  <div class="space-y-1">
                    <p v-for="invite in form.invites.filter(i => i.email && i.email.includes('@'))" :key="invite.email" class="text-gray-900">
                      {{ invite.email }}
                      <span v-if="invite.userId" class="text-xs text-green-600">(User)</span>
                      <span v-else class="text-xs text-gray-500">(Email invite)</span>
                    </p>
                  </div>
                </div>
                <div v-else>
                  <h4 class="text-sm font-medium text-gray-700 mb-1">Type</h4>
                  <p class="text-gray-900">Solo Challenge</p>
                </div>
                <div>
                  <h4 class="text-sm font-medium text-gray-700 mb-1">Collection Type</h4>
                  <p class="text-gray-900 capitalize">{{ form.collectionType }}</p>
                </div>
                <!-- Show assignments -->
                <div v-if="hasAssignToAll">
                  <!-- Assign to All -->
                  <div v-if="form.collectionType === 'set'">
                    <h4 class="text-sm font-medium text-gray-700 mb-1">Set (All Members)</h4>
                    <p class="text-gray-900">{{ form.selectedSet?.name || getSetName(form.selectedSetId) || 'Not selected' }}</p>
                  </div>
                  <div v-else-if="form.collectionType === 'pokemon'">
                    <h4 class="text-sm font-medium text-gray-700 mb-1">Pokemon (All Members)</h4>
                    <p class="text-gray-900">{{ form.selectedPokemon?.displayName || form.selectedPokemon?.name || getPokemonName(form.selectedPokemonId) || 'Not selected' }}</p>
                  </div>
                </div>
                <div v-else-if="Object.keys(form.individualAssignments).length > 0">
                  <!-- Individual Assignments -->
                  <h4 class="text-sm font-medium text-gray-700 mb-2">Assignments</h4>
                  <div class="space-y-2">
                    <div 
                      v-for="(assignment, personId) in form.individualAssignments" 
                      :key="personId"
                      class="border border-gray-200 rounded p-3"
                    >
                      <p class="font-medium text-gray-900 mb-1">{{ getPersonName(personId) }}</p>
                      <div v-if="assignment.type === 'set'">
                        <span class="text-sm text-gray-600">Set: </span>
                        <span class="text-sm text-gray-900">{{ getSetName(assignment.setId) || 'Not selected' }}</span>
                      </div>
                      <div v-else-if="assignment.type === 'pokemon'">
                        <span class="text-sm text-gray-600">Pokemon: </span>
                        <span class="text-sm text-gray-900">{{ getPokemonName(assignment.pokemonId) || 'Not selected' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else>
                  <!-- Fallback if no assignments -->
                  <div v-if="form.collectionType === 'set'">
                    <h4 class="text-sm font-medium text-gray-700 mb-1">Set</h4>
                    <p class="text-gray-900">{{ form.selectedSet?.name || getSetName(form.selectedSetId) || 'Not selected' }}</p>
                  </div>
                  <div v-else-if="form.collectionType === 'pokemon'">
                    <h4 class="text-sm font-medium text-gray-700 mb-1">Pokemon</h4>
                    <p class="text-gray-900">{{ form.selectedPokemon?.displayName || form.selectedPokemon?.name || getPokemonName(form.selectedPokemonId) || 'Not selected' }}</p>
                  </div>
                </div>
              </div>
              <div class="mt-6 flex justify-between">
                <button @click="prevStep" class="btn btn-h3 btn-ghost">Back</button>
                <button
                  @click="createMasterSet"
                  class="btn btn-h3 btn-primary"
                  :disabled="isCreating"
                >
                  {{ isCreating ? 'Creating...' : 'Create Master Set' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Success Notification -->
    <SuccessNotification
      :show="showSuccessNotification"
      title="Master Set Created!"
      message="Redirecting to your master set..."
      @close="showSuccessNotification = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../composables/useAuth'
import { createMasterSet as createMasterSetUtil, createAssignment, getCardIdsForSet, getCardIdsForPokemon } from '../utils/masterSetUtils'
import { getAllPokemonCards } from '../utils/firebasePokemon'
import SuccessNotification from '../components/SuccessNotification.vue'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()

const currentStep = ref(1)
const steps = computed(() => {
  return ['Name', 'Invite', 'Choose', 'Review']
})

const form = ref({
  challengeName: '',
  invites: [], // Array of { email: '', userId: null, userName: null, searching: false }
  collectionType: null, // 'set' or 'pokemon'
  selectionType: 'random', // 'random' or 'select'
  selectedSet: null,
  selectedSetId: null,
  selectedPokemon: null,
  selectedPokemonId: null,
  individualAssignments: {} // { userId/email: { type: 'set'|'pokemon', setId: string|null, pokemonId: string|null } }
})

const availableSets = ref([])
const availablePokemon = ref([])
const isLoadingSets = ref(false)
const isLoadingPokemon = ref(false)
const isPicking = ref(false)
const isCreating = ref(false)
const showSuccessNotification = ref(false)
const pokemonSearchQuery = ref('')
const filteredPokemon = ref([])
const currentAssignmentTarget = ref('all') // 'all' or personId
const hasAssignToAll = ref(false)

const loadSets = async () => {
  isLoadingSets.value = true
  try {
    // Load from both set_en and set_ja collections
    const setsEnRef = collection(db, 'set_en')
    const setsJaRef = collection(db, 'set_ja')
    
    const [enSnapshot, jaSnapshot] = await Promise.all([
      getDocs(setsEnRef),
      getDocs(setsJaRef)
    ])
    
    const allSets = []
    
    enSnapshot.docs.forEach(doc => {
      allSets.push({
        id: doc.id,
        ...doc.data(),
        language: 'en'
      })
    })
    
    jaSnapshot.docs.forEach(doc => {
      allSets.push({
        id: doc.id,
        ...doc.data(),
        language: 'ja'
      })
    })
    
    availableSets.value = allSets.sort((a, b) => {
      const dateA = a.releaseDate?.toDate?.() || new Date(0)
      const dateB = b.releaseDate?.toDate?.() || new Date(0)
      return dateB - dateA
    })
  } catch (error) {
    console.error('Error loading sets:', error)
  } finally {
    isLoadingSets.value = false
  }
}

const pickRandomSet = () => {
  if (isLoadingSets.value) {
    // Still loading, wait a bit
    setTimeout(() => pickRandomSet(), 500)
    return
  }
  
  if (availableSets.value.length === 0) {
    alert('No sets available. Please seed Firebase first by going to /admin and clicking "Fetch All Sets from API".')
    return
  }
  
  isPicking.value = true
  setTimeout(() => {
    const randomIndex = Math.floor(Math.random() * availableSets.value.length)
    form.value.selectedSet = availableSets.value[randomIndex]
    form.value.selectedSetId = form.value.selectedSet.id
    isPicking.value = false
  }, 500)
}

const pickRandomPokemon = () => {
  if (isLoadingPokemon.value) {
    setTimeout(() => pickRandomPokemon(), 500)
    return
  }
  
  if (availablePokemon.value.length === 0) {
    alert('No Pokemon available. Please seed Pokemon data first.')
    return
  }
  
  isPicking.value = true
  setTimeout(() => {
    const randomIndex = Math.floor(Math.random() * availablePokemon.value.length)
    form.value.selectedPokemon = availablePokemon.value[randomIndex]
    form.value.selectedPokemonId = form.value.selectedPokemon.id
    isPicking.value = false
  }, 500)
}

const onSetSelected = () => {
  const set = availableSets.value.find(s => s.id === form.value.selectedSetId)
  if (set) {
    form.value.selectedSet = set
  }
}

const getSetName = (setId) => {
  const set = availableSets.value.find(s => s.id === setId)
  return set?.name || 'Unknown Set'
}

const addInvite = () => {
  form.value.invites.push({ email: '', userId: null, userName: null, searching: false })
}

const removeInvite = (index) => {
  form.value.invites.splice(index, 1)
}

const searchUser = async (invite, index) => {
  if (!invite.email || !invite.email.includes('@')) {
    invite.userId = null
    invite.userName = null
    return
  }
  
  invite.searching = true
  try {
    // Search for user by email
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', invite.email))
    const snapshot = await getDocs(q)
    
    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0]
      const userData = userDoc.data()
      invite.userId = userDoc.id
      invite.userName = userData.displayName || userData.email
    } else {
      invite.userId = null
      invite.userName = null
    }
  } catch (error) {
    console.error('Error searching user:', error)
    invite.userId = null
    invite.userName = null
  } finally {
    invite.searching = false
  }
}

const loadPokemon = async () => {
  isLoadingPokemon.value = true
  try {
    const pokemonRef = collection(db, 'pokemon')
    const snapshot = await getDocs(pokemonRef)
    availablePokemon.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => {
      const dexA = a.nationalDexNumber || 9999
      const dexB = b.nationalDexNumber || 9999
      return dexA - dexB
    })
  } catch (error) {
    console.error('Error loading Pokemon:', error)
  } finally {
    isLoadingPokemon.value = false
  }
}

const searchPokemon = () => {
  if (!pokemonSearchQuery.value) {
    filteredPokemon.value = []
    return
  }
  const query = pokemonSearchQuery.value.toLowerCase()
  filteredPokemon.value = availablePokemon.value.filter(p => {
    const name = (p.displayName || p.name || '').toLowerCase()
    return name.includes(query)
  }).slice(0, 20) // Limit to 20 results
}

const selectPokemon = (pokemon) => {
  form.value.selectedPokemon = pokemon
  form.value.selectedPokemonId = pokemon.id
  pokemonSearchQuery.value = pokemon.displayName || pokemon.name
}

const getPokemonInitial = (name) => {
  return name?.charAt(0).toUpperCase() || '?'
}

const getPokemonName = (pokemonId) => {
  const pokemon = availablePokemon.value.find(p => p.id === pokemonId)
  return pokemon?.displayName || pokemon?.name || 'Unknown Pokemon'
}

const getAssignmentLabel = (personId) => {
  const assignment = form.value.individualAssignments[personId]
  if (!assignment) return null
  if (assignment.type === 'set' && assignment.setId) {
    return getSetName(assignment.setId)
  }
  if (assignment.type === 'pokemon' && assignment.pokemonId) {
    return getPokemonName(assignment.pokemonId)
  }
  return null
}

const confirmSoloSet = () => {
  // For solo collections, store the confirmed selection
  // Store it in individualAssignments with the creator's ID so it shows in the summary
  const creatorId = user.value?.uid || 'creator'
  const setId = form.value.selectedSet?.id || form.value.selectedSetId
  
  if (!setId) {
    console.error('No set ID to confirm')
    return
  }
  
  form.value.individualAssignments[creatorId] = {
    type: 'set',
    setId: setId,
    pokemonId: null
  }
  
  // Clear the selection so they can pick another if needed
  form.value.selectedSet = null
  form.value.selectedSetId = null
}

const saveSetAssignment = () => {
  if (!currentAssignmentTarget.value) {
    return
  }
  
  const setId = form.value.selectedSet?.id || form.value.selectedSetId
  if (!setId) {
    console.error('No set ID to assign')
    return
  }
  
  if (currentAssignmentTarget.value === 'all') {
    // Assign to all - store for all members (creator + invites)
    hasAssignToAll.value = true
    form.value.selectedSetId = setId
    form.value.selectedSet = form.value.selectedSet || availableSets.value.find(s => s.id === setId)
    // Keep selectedSetId set so it displays in Current Assignments
    // Don't clear it - we need it to show the assignment
    // Clear individual assignments when assigning to all
    form.value.individualAssignments = {}
  } else {
    // Assign to individual person
    hasAssignToAll.value = false
    
    const personId = currentAssignmentTarget.value || user.value?.uid || 'creator'
    // Use Vue's reactive assignment to ensure reactivity
    const newAssignments = { ...form.value.individualAssignments }
    newAssignments[personId] = {
      type: 'set',
      setId: setId,
      pokemonId: null
    }
    form.value.individualAssignments = newAssignments
    
    // Clear the selection card so they can pick another set/pokemon
    form.value.selectedSet = null
    form.value.selectedSetId = null
  }
  
  // Reset dropdown to "all" for next assignment
  currentAssignmentTarget.value = 'all'
}

const confirmSoloPokemon = () => {
  // For solo collections, store the confirmed selection
  // Store it in individualAssignments with the creator's ID so it shows in the summary
  const creatorId = user.value?.uid || 'creator'
  
  if (!form.value.selectedPokemonId) {
    console.error('No pokemon ID to confirm')
    return
  }
  
  form.value.individualAssignments[creatorId] = {
    type: 'pokemon',
    setId: null,
    pokemonId: form.value.selectedPokemonId
  }
  
  // Clear the selection so they can pick another if needed
  form.value.selectedPokemon = null
  form.value.selectedPokemonId = null
  pokemonSearchQuery.value = ''
}

const savePokemonAssignment = () => {
  if (!currentAssignmentTarget.value) {
    return
  }
  
  if (!form.value.selectedPokemonId) {
    console.error('No pokemon ID to assign')
    return
  }
  
  if (currentAssignmentTarget.value === 'all') {
    // Assign to all - store for all members (creator + invites)
    hasAssignToAll.value = true
    form.value.selectedPokemon = form.value.selectedPokemon || availablePokemon.value.find(p => p.id === form.value.selectedPokemonId)
    // Keep selectedPokemonId set so it displays in Current Assignments
    // Don't clear it - we need it to show the assignment
    // Clear individual assignments when assigning to all
    form.value.individualAssignments = {}
  } else {
    // Assign to individual person
    hasAssignToAll.value = false
    
    const personId = currentAssignmentTarget.value || user.value?.uid || 'creator'
    // Use Vue's reactive assignment to ensure reactivity
    const newAssignments = { ...form.value.individualAssignments }
    newAssignments[personId] = {
      type: 'pokemon',
      setId: null,
      pokemonId: form.value.selectedPokemonId
    }
    form.value.individualAssignments = newAssignments
    
    // Clear the selection card so they can pick another set/pokemon
    form.value.selectedPokemon = null
    form.value.selectedPokemonId = null
    pokemonSearchQuery.value = ''
  }
  
  // Reset dropdown to "all" for next assignment
  currentAssignmentTarget.value = 'all'
}

const getPersonName = (personId) => {
  if (personId === user.value?.uid || personId === 'creator') {
    return user.value?.displayName || user.value?.email || 'You'
  }
  
  // Find in invites
  const invite = form.value.invites.find(i => (i.userId || i.email) === personId)
  return invite?.userName || invite?.email || 'Unknown'
}

const removeAssignment = (personId) => {
  delete form.value.individualAssignments[personId]
  // If no more individual assignments, reset to "assign to all"
  if (Object.keys(form.value.individualAssignments).length === 0) {
    hasAssignToAll.value = false
  }
}

const hasInvites = computed(() => {
  return form.value.invites.length > 0 && form.value.invites.some(i => i.email && i.email.includes('@'))
})

const canProceedToReview = computed(() => {
  // Must have selected a collection type
  if (!form.value.collectionType) return false
  
  // Check if we have "Assign to All" assignment
  if (hasAssignToAll.value) {
    if (form.value.collectionType === 'set' && !form.value.selectedSetId) return false
    if (form.value.collectionType === 'pokemon' && !form.value.selectedPokemonId) return false
    return true
  }
  
  // Check if we have individual assignments
  if (Object.keys(form.value.individualAssignments).length > 0) {
    // At minimum, creator should have an assignment
    const creatorId = user.value?.uid || 'creator'
    if (!form.value.individualAssignments[creatorId]) return false
    
    // If there are invites, check that all invited users have assignments
    if (hasInvites.value) {
      for (const invite of form.value.invites.filter(i => i.email && i.email.includes('@'))) {
        const personId = invite.userId || invite.email
        if (!form.value.individualAssignments[personId]) return false
      }
    }
    return true
  }
  
  // No assignments yet
  return false
})

const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const createMasterSet = async () => {
  if (!user.value) {
    alert('Please log in to create a master set')
    router.push('/login')
    return
  }

  // Validate assignments
  if (hasAssignToAll.value) {
    // "Assign to All" - need the selection stored
    if (form.value.collectionType === 'set' && !form.value.selectedSetId) {
      alert('Please select a set')
      return
    }
    if (form.value.collectionType === 'pokemon' && !form.value.selectedPokemonId) {
      alert('Please select a Pokemon')
      return
    }
  } else if (Object.keys(form.value.individualAssignments).length === 0) {
    alert('Please assign at least one set or Pokemon')
    return
  } else {
    // Individual assignments - validate they're complete
    const creatorId = user.value?.uid || 'creator'
    if (!form.value.individualAssignments[creatorId]) {
      alert('Please assign a set or Pokemon to yourself')
      return
    }
    if (hasInvites.value) {
      for (const invite of form.value.invites.filter(i => i.email && i.email.includes('@'))) {
        const personId = invite.userId || invite.email
        if (!form.value.individualAssignments[personId]) {
          alert(`Please assign a set or Pokemon to ${invite.userName || invite.email}`)
          return
        }
      }
    }
  }

  isCreating.value = true
  
  try {
    // Determine languages based on assignments
    const languages = new Set()
    
    // Helper function to get card IDs for an assignment
    const getCardIdsForAssignment = async (type, setId, pokemonId, setLanguage) => {
      if (type === 'set' && setId) {
        // Get card IDs for set
        const cardIds = await getCardIdsForSet(setId, setLanguage || 'en')
        return { card_en: setLanguage === 'en' ? cardIds : [], card_ja: setLanguage === 'ja' ? cardIds : [] }
      } else if (type === 'pokemon' && pokemonId) {
        // Get Pokemon by ID
        const pokemon = availablePokemon.value.find(p => p.id === pokemonId)
        if (pokemon && pokemon.nationalDexNumber) {
          // Default to both languages for Pokemon
          return await getCardIdsForPokemon(pokemon.nationalDexNumber, ['en', 'ja'])
        }
      }
      return { card_en: [], card_ja: [] }
    }
    
    // Determine master set type and languages
    let masterSetType = null
    let masterSetTargetId = null
    let masterSetTargetName = null
    let masterSetTargetCollection = null
    
    if (hasAssignToAll.value) {
      // All have same assignment - use that as master set type
      masterSetType = form.value.collectionType
      if (form.value.collectionType === 'set') {
        const selectedSet = form.value.selectedSet || availableSets.value.find(s => s.id === form.value.selectedSetId)
        masterSetTargetId = form.value.selectedSetId
        masterSetTargetName = selectedSet?.name
        masterSetTargetCollection = `set_${selectedSet?.language || 'en'}`
        if (selectedSet?.language) languages.add(selectedSet.language)
      } else if (form.value.collectionType === 'pokemon') {
        const selectedPokemon = form.value.selectedPokemon || availablePokemon.value.find(p => p.id === form.value.selectedPokemonId)
        masterSetTargetId = String(selectedPokemon?.nationalDexNumber)
        masterSetTargetName = selectedPokemon?.displayName || selectedPokemon?.name
        languages.add('en')
        languages.add('ja')
      }
    } else {
      // Mixed assignments - master set type is null, but we'll use the first assignment's type
      const firstAssignment = Object.values(form.value.individualAssignments)[0]
      if (firstAssignment) {
        masterSetType = firstAssignment.type
        // For mixed, we'll default to both languages
        languages.add('en')
        languages.add('ja')
      }
    }
    
    // Create master set
    const masterSetData = {
      name: form.value.challengeName.trim(),
      description: null,
      type: masterSetType || 'set', // Default to 'set' if null
      targetSetId: masterSetType === 'set' ? masterSetTargetId : null,
      targetSetCollection: masterSetTargetCollection,
      targetSetName: masterSetType === 'set' ? masterSetTargetName : null,
      targetPokemonId: masterSetType === 'pokemon' ? masterSetTargetId : null,
      targetPokemonName: masterSetType === 'pokemon' ? masterSetTargetName : null,
      languages: Array.from(languages),
      createdBy: user.value.uid
    }
    
    const masterSetResult = await createMasterSetUtil(masterSetData)
    if (!masterSetResult.success) {
      throw new Error(masterSetResult.error)
    }
    
    const masterSetId = masterSetResult.data.id
    
    // Get all members (creator + invites)
    const members = []
    const validInvites = form.value.invites.filter(i => i.email && i.email.includes('@'))
    
    // Add creator
    members.push({
      userId: user.value.uid,
      userEmail: user.value.email,
      userName: user.value.displayName || user.value.email
    })
    
    // Add invites
    for (const invite of validInvites) {
      members.push({
        userId: invite.userId || null,
        userEmail: invite.email,
        userName: invite.userName || null
      })
    }
    
    // Create assignments
    if (hasAssignToAll.value) {
      // "Assign to All" - all members get the same assignment
      const selectedSet = form.value.selectedSet || availableSets.value.find(s => s.id === form.value.selectedSetId)
      const selectedPokemon = form.value.selectedPokemon || availablePokemon.value.find(p => p.id === form.value.selectedPokemonId)
      
      // Get card IDs once
      const cardIds = await getCardIdsForAssignment(
        form.value.collectionType,
        form.value.collectionType === 'set' ? form.value.selectedSetId : null,
        form.value.collectionType === 'pokemon' ? form.value.selectedPokemonId : null,
        selectedSet?.language
      )
      
      // Create assignment for each member
      for (const member of members) {
        await createAssignment({
          masterSetId,
          userId: member.userId,
          userEmail: member.userEmail,
          userName: member.userName,
          card_en: cardIds.card_en,
          card_ja: cardIds.card_ja,
          assignmentType: null, // Same as masterSet.type
          assignmentSetId: null,
          assignmentPokemonId: null,
          status: member.userId === user.value.uid ? 'accepted' : 'pending',
          createdBy: user.value.uid
        })
      }
    } else {
      // Individual assignments - each member gets their own assignment
      for (const member of members) {
        const personId = member.userId || member.userEmail
        const assignment = form.value.individualAssignments[personId] || form.value.individualAssignments[member.userEmail]
        
        if (!assignment) {
          console.warn(`No assignment found for ${personId}`)
          continue
        }
        
        const selectedSet = assignment.type === 'set' ? availableSets.value.find(s => s.id === assignment.setId) : null
        const selectedPokemon = assignment.type === 'pokemon' ? availablePokemon.value.find(p => p.id === assignment.pokemonId) : null
        
        // Get card IDs for this specific assignment
        const cardIds = await getCardIdsForAssignment(
          assignment.type,
          assignment.setId || null,
          assignment.pokemonId || null,
          selectedSet?.language
        )
        
        await createAssignment({
          masterSetId,
          userId: member.userId,
          userEmail: member.userEmail,
          userName: member.userName,
          card_en: cardIds.card_en,
          card_ja: cardIds.card_ja,
          assignmentType: assignment.type, // Different from masterSet.type
          assignmentSetId: assignment.type === 'set' ? assignment.setId : null,
          assignmentPokemonId: assignment.type === 'pokemon' ? assignment.pokemonId : null,
          status: member.userId === user.value.uid ? 'accepted' : 'pending',
          createdBy: user.value.uid
        })
      }
    }
    
    // Show success notification and redirect
    showSuccessNotification.value = true
    setTimeout(() => {
      router.push(`/master-set/${masterSetId}`)
    }, 1500) // Redirect after 1.5 seconds
  } catch (error) {
    console.error('Error creating master set:', error)
    alert('Error creating master set: ' + error.message)
    showSuccessNotification.value = false
  } finally {
    isCreating.value = false
  }
}

// Set default assignment target when entering step 3
watch(() => currentStep.value, (newStep) => {
  if (newStep === 3) {
    // Always default to "all"
    currentAssignmentTarget.value = 'all'
  }
})

// Watch for user authentication - only load data if logged in
watch(user, (newUser) => {
  if (newUser) {
    loadSets()
    loadPokemon()
    currentAssignmentTarget.value = 'all'
  }
})

// Update page title
watch(() => route.name, () => {
  if (route.name === 'StartMasterSet') {
    document.title = 'PokaPal - Create Your Master Set'
  }
}, { immediate: true })

onMounted(() => {
  if (user.value) {
    loadSets()
    loadPokemon()
    // Set initial default to "all"
    currentAssignmentTarget.value = 'all'
  }
})
</script>

