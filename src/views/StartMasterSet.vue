<template>
  <div class="min-h-screen pull-page-bg start-flow">
    <section class="section py-2 sm:py-4 md:py-6">
      <div class="section-container">
        <div v-if="!user" class="max-w-3xl mx-auto">
          <div class="card text-center py-12">
            <h3 class="mb-4">Log in to start your battleset</h3>
            <p class="mb-6 text-sm">
              You need to be logged in to create a battleset collection.
            </p>
            <router-link to="/login" class="btn btn-h4 btn-primary">
              Go to Login
            </router-link>
          </div>
        </div>

        <div
          v-else
          class="max-w-4xl mx-auto md:pb-0 start-flow-wizard-pad"
          :class="isAppShell ? 'start-flow-wizard-pad--shell' : 'start-flow-wizard-pad--browser'"
        >
          <div class="start-flow-stepper mb-6 md:mb-8 w-full" role="navigation" aria-label="Battleset setup steps">
            <p class="start-flow-stepper-kicker">Create your battleset</p>
            <div class="start-flow-stepper-track">
              <div
                v-for="(step, idx) in steps"
                :key="step.id"
                class="start-flow-stepper-cell"
              >
                <div v-if="currentStep === idx" class="start-flow-stepper-active" aria-current="step">
                  <span class="start-flow-stepper-active-num" aria-hidden="true">{{ idx + 1 }}</span>
                  <span class="start-flow-stepper-active-label">{{ step.label }}</span>
                </div>
                <div v-else-if="currentStep > idx" class="start-flow-stepper-done">
                  <span class="start-flow-stepper-check" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="start-flow-stepper-check-icon">
                      <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                    </svg>
                  </span>
                  <span class="start-flow-stepper-done-label">{{ step.label }}</span>
                </div>
                <div v-else class="start-flow-stepper-todo">
                  <span class="start-flow-stepper-todo-num" aria-hidden="true">{{ idx + 1 }}</span>
                  <span class="start-flow-stepper-todo-label">{{ step.label }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="currentStep === 0" class="space-y-4 md:space-y-5">
            <div>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                <button
                  v-for="option in challengeOptions"
                  :key="option.id"
                  class="card card-flat p-3 sm:p-4 md:p-5 text-left transition-all cursor-pointer border-2"
                  :class="selectedType === option.id ? 'ring-2 ring-offset-2 ring-offset-transparent' : ''"
                  :style="selectedType === option.id ? 'border-color: var(--color-accent); box-shadow: var(--shadow-md); background-color: rgba(91,168,219,0.10);' : 'border-color: var(--color-border);'"
                  @click="selectType(option.id)"
                >
                  <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-1.5 md:gap-3">
                    <IllustratorPaintBrushIcon
                      v-if="option.id === 'illustrator'"
                      class="challenge-type-icon w-7 h-7 sm:w-9 sm:h-9 md:w-12 md:h-12 object-contain order-1 md:order-2 self-start"
                      style="color: var(--color-text-primary)"
                    />
                    <img
                      v-else
                      :src="option.icon"
                      :alt="`${option.label} icon`"
                      class="challenge-type-icon w-7 h-7 sm:w-9 sm:h-9 md:w-12 md:h-12 object-contain order-1 md:order-2 self-start"
                    />
                    <div class="order-2 md:order-1 min-w-0">
                      <h4 class="card-title mb-0.5 md:mb-1 text-sm sm:text-base leading-tight">{{ option.label }}</h4>
                      <p class="text-xs sm:text-sm leading-snug" style="color: var(--color-text-secondary);">{{ option.short }}</p>
                    </div>
                  </div>
                </button>
              </div>

              <div class="mt-4 md:mt-6 hidden md:flex justify-end">
                <button class="btn btn-h3 btn-primary" :disabled="!selectedType" @click="nextStep">
                  Next
                </button>
              </div>
            </div>
          </div>

          <div v-else-if="currentStep === 1" class="space-y-5">
            <div class="space-y-4">
              <div class="pt-2 ui-divider">
                <label class="block text-sm mb-2">Players</label>
                <div class="ui-panel overflow-hidden">
                  <div
                    class="flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide"
                    style="color: var(--color-text-tertiary); border-bottom: 1px solid var(--color-border);"
                  >
                    <span class="min-w-0">Player</span>
                    <span class="shrink-0 text-[0.625rem] font-semibold tracking-wide opacity-90">Status</span>
                  </div>
                  <div
                    v-for="(slot, idx) in form.participants"
                    :key="slot.key"
                    class="px-3 py-3 flex flex-col gap-2"
                    style="border-bottom: 1px solid var(--color-border);"
                  >
                    <div class="flex items-start gap-0 min-w-0 w-full">
                      <div class="flex min-w-0 flex-1 items-start gap-2.5 pr-1">
                        <img
                          v-if="getParticipantPhotoUrl(slot)"
                          :src="getParticipantPhotoUrl(slot)"
                          :alt="participantLabel(slot)"
                          class="w-9 h-9 shrink-0 rounded-full object-cover border mt-0.5"
                          style="border-color: var(--color-border);"
                        />
                        <div
                          v-else
                          class="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5"
                          style="background-color: var(--color-bg-tertiary); color: var(--color-text-secondary);"
                        >
                          {{ participantInitials(slot) }}
                        </div>
                        <div class="min-w-0 flex-1 flex flex-col gap-1">
                          <p class="text-sm font-medium break-words leading-snug">{{ participantLabel(slot) }}</p>
                          <p class="text-xs" style="color: var(--color-text-secondary);">
                            {{ slot.isSelf ? 'You' : `Player ${idx + 1}` }}
                          </p>
                          <div v-if="!slot.isSelf" class="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5">
                            <button
                              type="button"
                              class="text-xs font-medium py-0.5"
                              style="color: var(--color-accent);"
                              @click="startEditParticipant(slot)"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              class="text-xs font-medium py-0.5 text-red-500 hover:text-red-400"
                              @click="removeParticipant(slot.key)"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                      <span
                        class="shrink-0 self-start max-w-[4.75rem] text-right text-[0.625rem] leading-tight pl-1 pr-1 py-[3px] rounded start-flow-status-chip"
                      >
                        {{ slot.isSelf ? 'Ready' : (slot.userId ? 'User found' : (slot.email ? 'Email invite' : 'Needs input')) }}
                      </span>
                    </div>
                    <div v-if="!slot.isSelf && slot.isEditing" class="w-full min-w-0">
                      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                          v-model="slot.input"
                          type="text"
                          class="ui-field w-full sm:flex-1 min-h-[44px] sm:min-h-0"
                          placeholder="Search user or type email"
                          autocomplete="off"
                          autocorrect="off"
                          autocapitalize="off"
                          @input="searchParticipant(slot)"
                          @focus="slot.showResults = true"
                          @blur="handleParticipantBlur(slot)"
                        />
                        <button
                          type="button"
                          class="btn btn-h5 btn-primary w-full shrink-0 sm:w-auto"
                          @click="saveParticipantEdit(slot)"
                        >
                          Save
                        </button>
                      </div>

                      <div
                        v-if="slot.searchResults.length > 0 && slot.showResults"
                        class="ui-panel max-h-40 overflow-y-auto mt-1"
                      >
                        <button
                          v-for="result in slot.searchResults"
                          :key="result.userId"
                          type="button"
                          class="w-full text-left px-3 py-2 border-b last:border-b-0"
                          style="border-color: var(--color-border);"
                          @click="selectParticipant(slot, result)"
                        >
                          <div>{{ result.displayName || result.email }}</div>
                          <div class="text-xs" style="color: var(--color-text-secondary);">{{ result.email }}</div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mt-3 flex items-center justify-between">
                  <button type="button" class="btn btn-h5 start-flow-toggle-btn" :disabled="form.participants.length >= maxParticipants" @click="addParticipant">
                    + Add Friend
                  </button>
                  <p class="text-xs" style="color: var(--color-text-secondary);">
                    {{ form.participants.length }} / {{ maxParticipants }} players
                  </p>
                </div>
              </div>

              <div class="hidden md:flex justify-between pt-2">
                <button type="button" class="btn btn-h3 btn-ghost" @click="prevStep">Back</button>
                <button type="button" class="btn btn-h3 btn-primary" :disabled="!canProceedPlayers" @click="nextStep">
                  Next
                </button>
              </div>
            </div>
          </div>

          <div v-else class="space-y-5">
            <div class="space-y-4">
              <div class="pt-1">
                <label class="block text-xs uppercase tracking-wide mb-1.5" style="color: var(--color-text-tertiary);">Challenge Name</label>
                <input
                  v-model="form.challengeName"
                  type="text"
                  class="w-full challenge-name-input border-0 border-b pb-2 text-2xl sm:text-3xl font-semibold focus:outline-none"
                  style="border-color: var(--color-border); color: var(--color-text-primary); background-color: transparent;"
                  placeholder="Pokemon Challenge"
                />
              </div>

              <div class="pt-2 ui-divider">
                <label class="block text-sm mb-2">Collaboration Mode</label>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <button type="button" class="btn btn-h4 w-full" :class="form.collaborationMode === 'race' ? 'start-flow-toggle-btn-active' : 'start-flow-toggle-btn'" @click="form.collaborationMode = 'race'">
                      Battle Against
                    </button>
                    <p class="text-xs mt-2 start-flow-collab-hint" style="color: var(--color-text-secondary);">
                      Everyone gets their own assignment and races to finish first.
                    </p>
                  </div>
                  <div>
                    <button type="button" class="btn btn-h4 w-full" :class="form.collaborationMode === 'together' ? 'start-flow-toggle-btn-active' : 'start-flow-toggle-btn'" @click="form.collaborationMode = 'together'">
                      Battle Together
                    </button>
                    <p class="text-xs mt-2 start-flow-collab-hint" style="color: var(--color-text-secondary);">
                      One shared team assignment where everyone collects together.
                    </p>
                  </div>
                </div>
              </div>

              <div class="pt-2 ui-divider">
                <label class="block text-sm mb-2">Assignment Method</label>
                <div class="grid grid-cols-2 gap-3">
                  <button type="button" class="btn btn-h4 flat-option-btn" :class="form.selectionMode === 'random' ? 'start-flow-toggle-btn-active' : 'start-flow-toggle-btn'" @click="setSelectionMode('random')">
                    🎲 Random
                  </button>
                  <button
                    type="button"
                    class="btn btn-h4 flat-option-btn"
                    :class="form.selectionMode === 'choose' ? 'start-flow-toggle-btn-active' : 'start-flow-toggle-btn'"
                    :disabled="selectedType === 'randomNumber'"
                    @click="setSelectionMode('choose')"
                  >
                    📋 Select
                  </button>
                </div>

                <div class="grid grid-cols-2 gap-3 mt-3">
                  <button
                    type="button"
                    class="btn btn-h4 flat-option-btn"
                    :class="form.cardCountMode === 'all' ? 'start-flow-toggle-btn-active' : 'start-flow-toggle-btn'"
                    :disabled="selectedType === 'randomNumber'"
                    @click="form.cardCountMode = 'all'"
                  >
                    All Cards
                  </button>
                  <button type="button" class="btn btn-h4 flat-option-btn" :class="form.cardCountMode === 'fixed' ? 'start-flow-toggle-btn-active' : 'start-flow-toggle-btn'" @click="form.cardCountMode = 'fixed'">
                    # of Cards
                  </button>
                </div>
                <div v-if="form.cardCountMode === 'fixed'" class="mt-3">
                  <input
                    v-model.number="form.fixedCardCount"
                    type="number"
                    min="1"
                    :max="selectedType === 'randomNumber' ? 100 : undefined"
                    class="ui-field"
                    placeholder="Enter max number of cards"
                  />
                  <p v-if="selectedType === 'randomNumber'" class="text-xs mt-1" style="color: var(--color-text-secondary);">
                    Random Number challenges support up to 100 cards.
                  </p>
                </div>
                <div v-if="selectedType === 'randomNumber'" class="mt-3">
                  <label class="block text-sm mb-2">Random Pool</label>
                  <select
                    v-model="form.randomScope"
                    class="ui-field"
                  >
                    <option value="all">All Languages</option>
                    <option value="en">English Only</option>
                    <option value="ja">Japanese Only</option>
                  </select>
                </div>
              </div>

              <div class="pt-2 ui-divider">
                <label class="block text-sm mb-2">{{ form.collaborationMode === 'together' ? 'Players' : 'Players & Assignments' }}</label>
                <div class="ui-panel overflow-hidden">
                  <div class="hidden md:grid grid-cols-12 gap-3 px-3 py-2 text-xs font-semibold uppercase tracking-wide" style="color: var(--color-text-tertiary); border-bottom: 1px solid var(--color-border);">
                    <div class="col-span-5">Player</div>
                    <div v-if="form.collaborationMode === 'race'" class="col-span-5">Assignment</div>
                    <div class="col-span-2">Action</div>
                  </div>
                  <div
                    v-for="(slot, idx) in form.participants"
                    :key="slot.key"
                    class="flex flex-col gap-3 px-3 py-3 md:grid md:grid-cols-12 md:gap-3 md:items-start"
                    style="border-bottom: 1px solid var(--color-border);"
                  >
                    <div class="md:col-span-5 min-w-0 w-full">
                      <div class="flex items-center gap-2 min-w-0">
                        <img
                          v-if="getParticipantPhotoUrl(slot)"
                          :src="getParticipantPhotoUrl(slot)"
                          :alt="participantLabel(slot)"
                          class="w-8 h-8 rounded-full object-cover border"
                          style="border-color: var(--color-border);"
                        />
                        <div
                          v-else
                          class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                          style="background-color: var(--color-bg-tertiary); color: var(--color-text-secondary);"
                        >
                          {{ participantInitials(slot) }}
                        </div>
                        <div class="min-w-0">
                          <p class="text-sm font-medium truncate">{{ participantLabel(slot) }}</p>
                          <p class="text-xs truncate" style="color: var(--color-text-secondary);">
                            {{ slot.isSelf ? 'You' : `Player ${idx + 1}` }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div v-if="form.collaborationMode === 'race'" class="md:col-span-5 min-w-0 w-full pl-0 md:pl-0">
                      <p class="text-[0.65rem] font-semibold uppercase tracking-wide md:hidden mb-1.5" style="color: var(--color-text-tertiary);">Assignment</p>
                      <div class="w-full min-w-0">
                        <div v-if="assignmentDetails(slot).isPokemon && assignmentDetails(slot).value !== 'none'" class="flex flex-col gap-2 sm:flex-row sm:items-center px-2.5 py-2 rounded-md ui-panel max-w-full" style="background-color: var(--color-bg-primary);">
                          <div class="w-9 h-9 sm:w-8 sm:h-8 shrink-0 rounded flex items-center justify-center overflow-hidden pokemon-image-bg self-start sm:self-center">
                            <img
                              v-if="assignmentDetails(slot).spriteUrl"
                              :src="assignmentDetails(slot).spriteUrl"
                              :alt="assignmentDetails(slot).value"
                              class="w-full h-full object-contain"
                            />
                            <span v-else class="text-xs font-semibold">PK</span>
                          </div>
                          <p class="text-sm break-words min-w-0 leading-snug">
                            <span class="font-semibold">{{ assignmentDetails(slot).label }}:</span>
                            <span class="font-semibold ml-1">{{ assignmentDetails(slot).value }}</span>
                          </p>
                        </div>
                        <p v-else class="text-sm break-words">
                          <span class="font-semibold">{{ assignmentDetails(slot).label }}:</span>
                          <span class="font-semibold ml-1">{{ assignmentDetails(slot).value }}</span>
                        </p>
                      </div>
                    </div>

                    <div class="w-full md:col-span-2 flex md:justify-end md:pt-0">
                      <button
                        v-if="form.collaborationMode !== 'together'"
                        type="button"
                        class="btn btn-h5 btn-primary w-full sm:w-auto md:w-auto shrink-0"
                        @click="assignForParticipant(slot)"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                </div>

                <div v-if="form.collaborationMode === 'together'" class="card card-flat card-no-hover card-blue-outline p-3 mt-4">
                  <div class="flex flex-col gap-3 md:flex-row md:items-start">
                    <div class="flex-1 md:px-2 md:pt-1 min-w-0 order-1">
                      <p class="text-sm font-semibold mb-1">Team Assignment</p>
                      <div v-if="assignmentDetails(form.participants[0]).isPokemon && assignmentDetails(form.participants[0]).value !== 'none'" class="flex flex-col gap-2 sm:flex-row sm:items-center px-2.5 py-2 rounded-md ui-panel max-w-full" style="background-color: var(--color-bg-primary);">
                        <div class="w-9 h-9 sm:w-8 sm:h-8 shrink-0 rounded flex items-center justify-center overflow-hidden pokemon-image-bg self-start sm:self-center">
                          <img
                            v-if="assignmentDetails(form.participants[0]).spriteUrl"
                            :src="assignmentDetails(form.participants[0]).spriteUrl"
                            :alt="assignmentDetails(form.participants[0]).value"
                            class="w-full h-full object-contain"
                          />
                          <span v-else class="text-xs font-semibold">PK</span>
                        </div>
                        <p class="text-sm break-words min-w-0 leading-snug">
                          <span class="font-semibold">{{ assignmentDetails(form.participants[0]).label }}:</span>
                          <span class="font-semibold ml-1">{{ assignmentDetails(form.participants[0]).value }}</span>
                        </p>
                      </div>
                      <p v-else class="text-sm break-words">
                        <span class="font-semibold">{{ assignmentDetails(form.participants[0]).label }}:</span>
                        <span class="font-semibold ml-1">{{ assignmentDetails(form.participants[0]).value }}</span>
                      </p>
                      <p class="text-xs mt-2" style="color: var(--color-text-secondary);">
                        This target is assigned to all players as one shared checklist.
                      </p>
                    </div>

                    <button
                      type="button"
                      class="btn btn-h5 btn-primary w-full md:w-36 md:mt-6 shrink-0 order-2"
                      @click="assignForParticipant(form.participants[0])"
                    >
                      Assign Shared
                    </button>
                  </div>
                </div>
              </div>

              <div class="hidden md:flex justify-between pt-2">
                <button class="btn btn-h3 btn-ghost" @click="prevStep">Back</button>
                <button class="btn btn-h3 btn-primary" :disabled="!canCreate || isCreating" @click="createMasterSet">
                  {{ isCreating ? 'Creating...' : form.challengeMode === 'battle' ? 'Create Battle' : 'Create Master Set' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Teleport: fixed inside overflow-y main breaks in WKWebView; body-fixed aligns with tab bar -->
        <Teleport to="body">
          <div
            v-if="user"
            class="fixed inset-x-0 z-40 border-t md:hidden start-flow-sticky-nav shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
            :class="isAppShell ? 'start-flow-sticky-nav--shell' : 'start-flow-sticky-nav--browser'"
            style="background-color: var(--color-bg-primary); border-color: var(--color-border);"
          >
            <div class="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3" :class="currentStep === 0 ? 'justify-end' : 'justify-between'">
              <button
                v-if="currentStep > 0"
                type="button"
                class="btn btn-h3 btn-ghost shrink-0"
                @click="prevStep"
              >
                Back
              </button>
              <button
                v-if="currentStep === 0"
                type="button"
                class="btn btn-h3 btn-primary min-w-[7rem]"
                :disabled="!selectedType"
                @click="nextStep"
              >
                Next
              </button>
              <button
                v-else-if="currentStep === 1"
                type="button"
                class="btn btn-h3 btn-primary min-w-[7rem]"
                :disabled="!canProceedPlayers"
                @click="nextStep"
              >
                Next
              </button>
              <button
                v-else
                type="button"
                class="btn btn-h3 btn-primary min-w-[7rem]"
                :disabled="!canCreate || isCreating"
                @click="createMasterSet"
              >
                {{ isCreating ? 'Creating...' : form.challengeMode === 'battle' ? 'Create Battle' : 'Create Master Set' }}
              </button>
            </div>
          </div>
        </Teleport>
      </div>
    </section>

    <div v-if="assignModal.open" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4" @click="closeAssignModal">
      <div class="card w-full max-w-lg max-h-[85vh] overflow-hidden" @click.stop>
        <div class="card-header">
          <h3 class="card-title">Select {{ activeTypeMeta.label.slice(0, -1) }}</h3>
          <p class="card-subtitle">Choose a target for {{ assignModal.slotLabel }}</p>
        </div>
        <div class="card-body space-y-3">
          <input
            v-model="assignModal.query"
            type="text"
            class="ui-field"
            :placeholder="`Search ${activeTypeMeta.label.toLowerCase()}...`"
          />
          <div class="max-h-80 overflow-y-auto ui-panel">
            <button
              v-for="item in modalItems"
              :key="item.id"
              class="w-full text-left px-3 py-2 border-b last:border-b-0"
              style="border-color: var(--color-border);"
              @click="selectModalItem(item)"
            >
              <div class="font-medium">{{ item.label }}</div>
              <div v-if="item.subLabel" class="text-xs" style="color: var(--color-text-secondary);">{{ item.subLabel }}</div>
            </button>
            <div v-if="modalItems.length === 0" class="px-3 py-4 text-sm" style="color: var(--color-text-secondary);">
              No results found.
            </div>
          </div>
          <div class="flex justify-end">
            <button class="btn btn-h5 btn-ghost" @click="closeAssignModal">Cancel</button>
          </div>
        </div>
      </div>
    </div>

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
import { useRouter } from 'vue-router'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../composables/useAuth'
import { useAppShell } from '../app/composables/useAppShell'
import { createMasterSet as createMasterSetUtil, createAssignment, getCardIdsForSet, getCardIdsForPokemon, getCardIdsForGeneration, getCardIdsForIllustrator } from '../utils/masterSetUtils'
import { getAllPokemonCards } from '../utils/firebasePokemon'
import { getAllTrainers } from '../utils/firebaseTrainers'
import { POKEMON_GENERATIONS, getGenerationById } from '../utils/pokemonGenerations'
import { aggregateIllustratorCounts, computeTrainerCardCounts } from '../utils/cardAggregates'
import SuccessNotification from '../components/SuccessNotification.vue'
import IllustratorPaintBrushIcon from '../components/icons/IllustratorPaintBrushIcon.vue'

const router = useRouter()
const { user } = useAuth()
const { isAppShell } = useAppShell()

const steps = [
  { id: 'choose', label: 'Choose' },
  { id: 'players', label: 'Players' },
  { id: 'configure', label: 'Configure' }
]
const currentStep = ref(0)
const selectedType = ref(null)

const challengeOptions = [
  { id: 'set', label: 'Sets', icon: '/sets.svg', short: 'Battle complete sets.', description: 'Choose or randomly pick a set and track completion for all cards in that set.' },
  { id: 'pokemon', label: 'Pokemon', icon: '/pokemon.svg', short: 'Battle a Pokemon line.', description: 'Choose or randomly pick a Pokemon and track all related cards across supported languages.' },
  { id: 'generation', label: 'Generation', icon: '/pokeball.svg', short: 'Battle one generation / region.', description: 'Cards whose national dex falls in that generation (including multi-Pokemon cards when any dex is in range).' },
  { id: 'trainer', label: 'Trainers', icon: '/trainers.svg', short: 'Battle trainer-linked cards.', description: 'MVP: card matching is based on trainer name text in card data.' },
  { id: 'illustrator', label: 'Illustrator', icon: null, short: 'Battle cards by illustrator.', description: 'Uses the illustrator field on English and Japanese card documents.' },
  { id: 'randomNumber', label: 'Random Number', icon: '/random.svg', short: 'Battle random-card challenges.', description: 'Pick a random pool and generate a challenge by card count.' }
]

const activeTypeMeta = computed(() => challengeOptions.find((x) => x.id === selectedType.value) || challengeOptions[0])

const makeParticipant = (idx, isSelf = false) => ({
  key: `p-${idx}-${Date.now()}`,
  isSelf,
  userId: isSelf ? user.value?.uid || null : null,
  userName: isSelf ? user.value?.displayName || user.value?.email || 'You' : null,
  email: isSelf ? user.value?.email || null : null,
  photoUrl: isSelf ? user.value?.photoURL || null : null,
  input: '',
  isEditing: !isSelf,
  searching: false,
  searchResults: [],
  showResults: false,
  searchTimeout: null,
  assignment: {
    setId: '',
    pokemonId: '',
    trainerId: '',
    generationId: '',
    illustratorName: '',
    randomAssigned: false
  }
})

const form = ref({
  challengeName: '',
  selectionMode: 'random',
  cardCountMode: 'all',
  fixedCardCount: 50,
  randomScope: 'all',
  collaborationMode: 'race',
  participants: [makeParticipant(1, true)]
})
const maxParticipants = 8

const availableSets = ref([])
const availablePokemon = ref([])
const availableTrainers = ref([])
const availableIllustrators = ref([])
const isLoadingSets = ref(false)
const isLoadingPokemon = ref(false)
const isLoadingTrainers = ref(false)
const isLoadingIllustrators = ref(false)
const isCreating = ref(false)
const showSuccessNotification = ref(false)

const assignModal = ref({
  open: false,
  participantKey: null,
  slotLabel: '',
  query: ''
})

const canCreate = computed(() => {
  if (!selectedType.value) return false
  if (!form.value.challengeName.trim()) return false
  if (form.value.cardCountMode === 'fixed' && (!form.value.fixedCardCount || form.value.fixedCardCount < 1)) return false
  if (selectedType.value === 'randomNumber' && form.value.fixedCardCount > 100) return false

  const allPlayersValid = form.value.participants.every((slot) => {
    const hasIdentity = slot.isSelf || Boolean(slot.userId || slot.email || (slot.input && slot.input.includes('@')))
    if (!hasIdentity) return false
    if (form.value.collaborationMode === 'together') return true
    if (selectedType.value === 'set') return Boolean(slot.assignment.setId)
    if (selectedType.value === 'pokemon') return Boolean(slot.assignment.pokemonId)
    if (selectedType.value === 'generation') return Boolean(slot.assignment.generationId)
    if (selectedType.value === 'trainer') {
      if (!slot.assignment.trainerId) return false
      if (form.value.cardCountMode === 'fixed') {
        const n = form.value.fixedCardCount
        const row = availableTrainers.value.find((x) => x.id === slot.assignment.trainerId)
        if (!row || (row.cardCount || 0) < n) return false
      }
      return true
    }
    if (selectedType.value === 'illustrator') {
      if (!slot.assignment.illustratorName) return false
      if (form.value.cardCountMode === 'fixed') {
        const n = form.value.fixedCardCount
        const row = availableIllustrators.value.find((x) => x.id === slot.assignment.illustratorName)
        if (!row || row.cardCount < n) return false
      }
      return true
    }
    return Boolean(slot.assignment.randomAssigned)
  })

  if (!allPlayersValid) return false

  if (form.value.collaborationMode === 'together') {
    const first = form.value.participants[0]
    if (selectedType.value === 'set') return Boolean(first?.assignment?.setId)
    if (selectedType.value === 'pokemon') return Boolean(first?.assignment?.pokemonId)
    if (selectedType.value === 'generation') return Boolean(first?.assignment?.generationId)
    if (selectedType.value === 'trainer') {
      if (!first?.assignment?.trainerId) return false
      if (form.value.cardCountMode === 'fixed') {
        const n = form.value.fixedCardCount
        const row = availableTrainers.value.find((x) => x.id === first.assignment.trainerId)
        if (!row || (row.cardCount || 0) < n) return false
      }
      return true
    }
    if (selectedType.value === 'illustrator') {
      if (!first?.assignment?.illustratorName) return false
      if (form.value.cardCountMode === 'fixed') {
        const n = form.value.fixedCardCount
        const row = availableIllustrators.value.find((x) => x.id === first.assignment.illustratorName)
        if (!row || row.cardCount < n) return false
      }
      return true
    }
    return Boolean(first?.assignment?.randomAssigned)
  }

  return true
})

const canProceedPlayers = computed(() => {
  return form.value.participants.every((slot) => {
    return slot.isSelf || Boolean(slot.userId || slot.email || (slot.input && slot.input.includes('@')))
  })
})

const participantLabel = (slot) => {
  if (!slot) return 'Unknown player'
  if (slot.isSelf) return user.value?.displayName || user.value?.email || 'You'
  return slot.userName || slot.email || slot.input || 'Pending player'
}

const getParticipantPhotoUrl = (slot) => {
  if (!slot) return null
  if (slot.isSelf) return user.value?.photoURL || null
  return slot.photoUrl || null
}

const participantInitials = (slot) => {
  const label = participantLabel(slot)
  if (!label) return '?'
  const parts = label.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
}

const toShuffled = (arr) => {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = copy[i]
    copy[i] = copy[j]
    copy[j] = temp
  }
  return copy
}

const sampleCardIds = (cardsByLang) => {
  if (form.value.cardCountMode !== 'fixed') return cardsByLang

  const combined = [
    ...(cardsByLang.card_en || []).map((id) => ({ lang: 'en', id })),
    ...(cardsByLang.card_ja || []).map((id) => ({ lang: 'ja', id }))
  ]
  const count = Math.min(form.value.fixedCardCount || 0, combined.length)
  const selected = toShuffled(combined).slice(0, count)
  return {
    card_en: selected.filter((c) => c.lang === 'en').map((c) => c.id),
    card_ja: selected.filter((c) => c.lang === 'ja').map((c) => c.id)
  }
}

const pickRandomSet = () => {
  if (availableSets.value.length === 0) return null
  const chosen = toShuffled(availableSets.value)[0]
  return chosen.id
}

const pickRandomPokemon = () => {
  if (availablePokemon.value.length === 0) return null
  const chosen = toShuffled(availablePokemon.value)[0]
  return chosen.id
}

const pickRandomTrainer = () => {
  if (availableTrainers.value.length === 0) return null
  const needed = form.value.cardCountMode === 'fixed' ? form.value.fixedCardCount : null
  let pool = [...availableTrainers.value]
  if (needed != null && needed > 0) {
    const filtered = pool.filter((x) => (x.cardCount || 0) >= needed)
    if (filtered.length > 0) pool = filtered
  } else {
    const counts = pool.map((x) => x.cardCount || 0).filter((c) => c > 0).sort((a, b) => a - b)
    if (counts.length > 0) {
      const mid = counts[Math.floor(counts.length / 2)]
      const lo = mid * 0.4
      const hi = mid * 2.5
      const band = pool.filter((x) => {
        const c = x.cardCount || 0
        return c >= lo && c <= hi
      })
      if (band.length > 0) pool = band
    }
  }
  const chosen = toShuffled(pool)[0]
  return chosen?.id || null
}

const pickRandomGeneration = () => {
  if (POKEMON_GENERATIONS.length === 0) return null
  return toShuffled([...POKEMON_GENERATIONS])[0].id
}

const pickRandomIllustrator = () => {
  if (availableIllustrators.value.length === 0) return null
  const needed = form.value.cardCountMode === 'fixed' ? form.value.fixedCardCount : null
  let pool = [...availableIllustrators.value]
  if (needed != null && needed > 0) {
    const filtered = pool.filter((x) => x.cardCount >= needed)
    if (filtered.length > 0) pool = filtered
  } else {
    const counts = pool.map((x) => x.cardCount).filter((c) => c > 0).sort((a, b) => a - b)
    if (counts.length > 0) {
      const mid = counts[Math.floor(counts.length / 2)]
      const lo = mid * 0.4
      const hi = mid * 2.5
      const band = pool.filter((x) => x.cardCount >= lo && x.cardCount <= hi)
      if (band.length > 0) pool = band
    }
  }
  const chosen = toShuffled(pool)[0]
  return chosen?.id || null
}

const resolveLanguages = () => {
  if (selectedType.value === 'randomNumber') {
    if (form.value.randomScope === 'en') return ['en']
    if (form.value.randomScope === 'ja') return ['ja']
    return ['en', 'ja']
  }
  return ['en', 'ja']
}

const getTrainerCardsMvp = async (trainer, languages) => {
  const trainerName = (trainer?.trainerName || '').toLowerCase().trim()
  if (!trainerName) return { card_en: [], card_ja: [] }

  const result = await getAllPokemonCards({ language: 'all' })
  if (!result.success || !result.data) return { card_en: [], card_ja: [] }

  const en = new Set()
  const ja = new Set()

  result.data.forEach((card) => {
    const textBlob = [
      card.name,
      card.cardName,
      card.trainerName,
      card.flavorText,
      Array.isArray(card.rules) ? card.rules.join(' ') : '',
      Array.isArray(card.text) ? card.text.join(' ') : ''
    ].join(' ').toLowerCase()

    if (!textBlob.includes(trainerName)) return
    const cardId = card.cardId || card.id || card.apiId
    if (!cardId) return

    if (card.language === 'en' && languages.includes('en')) en.add(cardId)
    if (card.language === 'ja' && languages.includes('ja')) ja.add(cardId)
  })

  return { card_en: Array.from(en), card_ja: Array.from(ja) }
}

const getRandomCards = async (languages) => {
  const result = await getAllPokemonCards({ language: 'all' })
  if (!result.success || !result.data) return { card_en: [], card_ja: [] }

  const pool = result.data.filter((card) => languages.includes(card.language))
  const normalized = toShuffled(pool).map((card) => ({
    lang: card.language,
    id: card.cardId || card.id || card.apiId
  })).filter((x) => x.id)

  const selected = form.value.cardCountMode === 'fixed'
    ? normalized.slice(0, Math.min(form.value.fixedCardCount || 0, normalized.length))
    : normalized

  return {
    card_en: selected.filter((x) => x.lang === 'en').map((x) => x.id),
    card_ja: selected.filter((x) => x.lang === 'ja').map((x) => x.id)
  }
}

const syncSelfParticipant = () => {
  const current = form.value.participants || []
  const others = current.filter((slot) => !slot.isSelf)
  const selfSlot = current.find((slot) => slot.isSelf) || makeParticipant(1, true)
  selfSlot.isSelf = true
  selfSlot.userId = user.value?.uid || null
  selfSlot.userName = user.value?.displayName || user.value?.email || 'You'
  selfSlot.email = user.value?.email || null
  selfSlot.photoUrl = user.value?.photoURL || null
  form.value.participants = [selfSlot, ...others]
}

const addParticipant = () => {
  if (form.value.participants.length >= maxParticipants) return
  form.value.participants.push(makeParticipant(form.value.participants.length + 1, false))
}

const removeParticipant = (participantKey) => {
  form.value.participants = form.value.participants.filter((slot) => slot.isSelf || slot.key !== participantKey)
}

const setSelectionMode = (mode) => {
  if (selectedType.value === 'randomNumber' && mode !== 'random') return
  form.value.selectionMode = mode
  form.value.participants.forEach((slot) => {
    slot.assignment.setId = ''
    slot.assignment.pokemonId = ''
    slot.assignment.trainerId = ''
    slot.assignment.generationId = ''
    slot.assignment.illustratorName = ''
    slot.assignment.randomAssigned = false
  })
}

const searchParticipant = async (target) => {
  const term = (target?.input || '').trim().toLowerCase()

  if (!term) {
    target.userId = null
    target.userName = null
    target.email = ''
    target.searchResults = []
    return
  }

  clearTimeout(target.searchTimeout)
  target.searchTimeout = setTimeout(async () => {
    target.searching = true
    try {
      const usersRef = collection(db, 'users')
      const snap = await getDocs(usersRef)
      const matches = snap.docs
        .map((d) => ({ userId: d.id, ...d.data() }))
        .filter((u) => {
          const name = (u.displayName || '').toLowerCase()
          const email = (u.email || '').toLowerCase()
          return name.includes(term) || email.includes(term)
        })
        .slice(0, 6)
      target.searchResults = matches

      if (term.includes('@') && matches.length === 0) {
        target.email = term
      }
    } catch (error) {
      console.error('Error searching participant:', error)
      target.searchResults = []
    } finally {
      target.searching = false
    }
  }, 250)
}

const selectParticipant = (target, result) => {
  target.userId = result.userId
  target.userName = result.displayName || result.email
  target.email = result.email || ''
  target.photoUrl = result.photoURL || result.avatarUrl || result.profileImageUrl || null
  target.input = result.email || result.displayName || ''
  target.searchResults = []
  target.showResults = false
  target.isEditing = false
}

const startEditParticipant = (slot) => {
  slot.isEditing = true
  slot.showResults = false
}

const saveParticipantEdit = (slot) => {
  const value = (slot.input || '').trim()
  if (!value) {
    slot.showResults = false
    slot.isEditing = false
    return
  }

  if (!slot.userId && value.includes('@')) {
    slot.email = value
    slot.userName = null
    slot.photoUrl = null
  }

  slot.showResults = false
  slot.isEditing = false
}

const handleParticipantBlur = (slot) => {
  setTimeout(() => {
    slot.showResults = false
    const value = (slot.input || '').trim()
    if (!value) return

    if (!slot.userId && value.includes('@')) {
      slot.email = value
      slot.userName = null
      slot.isEditing = false
      return
    }

    if (slot.userId || slot.email) {
      slot.isEditing = false
    }
  }, 200)
}

const assignForParticipant = (slot) => {
  const assignToSlots = form.value.collaborationMode === 'together' ? form.value.participants : [slot]

  if (form.value.selectionMode === 'random') {
    assignToSlots.forEach((targetSlot) => {
      if (selectedType.value === 'set') targetSlot.assignment.setId = pickRandomSet() || ''
      if (selectedType.value === 'pokemon') targetSlot.assignment.pokemonId = pickRandomPokemon() || ''
      if (selectedType.value === 'generation') targetSlot.assignment.generationId = pickRandomGeneration() || ''
      if (selectedType.value === 'trainer') targetSlot.assignment.trainerId = pickRandomTrainer() || ''
      if (selectedType.value === 'illustrator') targetSlot.assignment.illustratorName = pickRandomIllustrator() || ''
      if (selectedType.value === 'randomNumber') targetSlot.assignment.randomAssigned = true
    })
    return
  }
  assignModal.value.open = true
  assignModal.value.participantKey = form.value.collaborationMode === 'together'
    ? form.value.participants[0].key
    : slot.key
  assignModal.value.slotLabel = form.value.collaborationMode === 'together'
    ? 'all players'
    : (slot.isSelf ? 'you' : (slot.userName || slot.email || 'this player'))
  assignModal.value.query = ''
}

const closeAssignModal = () => {
  assignModal.value.open = false
  assignModal.value.participantKey = null
  assignModal.value.query = ''
}

const modalItems = computed(() => {
  const q = assignModal.value.query.trim().toLowerCase()
  if (selectedType.value === 'set') {
    return availableSets.value
      .filter((x) => !q || (x.name || '').toLowerCase().includes(q))
      .slice(0, 40)
      .map((x) => ({ id: x.id, label: x.name, subLabel: `${x.totalCards || 0} cards` }))
  }
  if (selectedType.value === 'pokemon') {
    return availablePokemon.value
      .filter((x) => !q || ((x.displayName || x.name || '').toLowerCase().includes(q)))
      .slice(0, 40)
      .map((x) => ({ id: x.id, label: x.displayName || x.name, subLabel: x.nationalDexNumber ? `#${x.nationalDexNumber}` : '' }))
  }
  if (selectedType.value === 'trainer') {
    return availableTrainers.value
      .filter((x) => !q || (x.trainerName || '').toLowerCase().includes(q))
      .slice(0, 40)
      .map((x) => ({ id: x.id, label: x.trainerName, subLabel: `${x.cardCount ?? 0} matched cards` }))
  }
  if (selectedType.value === 'generation') {
    return POKEMON_GENERATIONS.filter((x) => !q || x.label.toLowerCase().includes(q) || x.region.toLowerCase().includes(q))
      .slice(0, 40)
      .map((x) => ({
        id: x.id,
        label: x.label,
        subLabel: `#${x.minNationalDex}–#${x.maxNationalDex}`
      }))
  }
  if (selectedType.value === 'illustrator') {
    return availableIllustrators.value
      .filter((x) => !q || (x.label || '').toLowerCase().includes(q))
      .slice(0, 40)
      .map((x) => ({ id: x.id, label: x.label, subLabel: `${x.cardCount} cards` }))
  }
  return []
})

const selectModalItem = (item) => {
  const slot = form.value.participants.find((p) => p.key === assignModal.value.participantKey)
  if (!slot) return
  const applyToSlots = form.value.collaborationMode === 'together' ? form.value.participants : [slot]
  applyToSlots.forEach((targetSlot) => {
    if (selectedType.value === 'set') targetSlot.assignment.setId = item.id
    if (selectedType.value === 'pokemon') targetSlot.assignment.pokemonId = item.id
    if (selectedType.value === 'generation') targetSlot.assignment.generationId = item.id
    if (selectedType.value === 'trainer') targetSlot.assignment.trainerId = item.id
    if (selectedType.value === 'illustrator') targetSlot.assignment.illustratorName = item.id
  })
  closeAssignModal()
}

const getPokemonSpriteUrl = (pokemon) => {
  if (!pokemon) return null
  if (pokemon.spriteUrl) return pokemon.spriteUrl
  if (pokemon.spriteUrls?.normal) return pokemon.spriteUrls.normal
  if (pokemon.imageUrl) return pokemon.imageUrl
  return null
}

const assignmentDetails = (slot) => {
  if (selectedType.value === 'set') {
    const set = availableSets.value.find((x) => x.id === slot.assignment.setId)
    return { label: 'Assigned target', value: set ? set.name : 'none', isPokemon: false, spriteUrl: null }
  }
  if (selectedType.value === 'pokemon') {
    const pokemon = availablePokemon.value.find((x) => x.id === slot.assignment.pokemonId)
    return {
      label: 'Assigned target',
      value: pokemon ? (pokemon.displayName || pokemon.name) : 'none',
      isPokemon: true,
      spriteUrl: getPokemonSpriteUrl(pokemon)
    }
  }
  if (selectedType.value === 'trainer') {
    const trainer = availableTrainers.value.find((x) => x.id === slot.assignment.trainerId)
    return { label: 'Assigned target', value: trainer ? trainer.trainerName : 'none', isPokemon: false, spriteUrl: null }
  }
  if (selectedType.value === 'generation') {
    const gen = getGenerationById(slot.assignment.generationId)
    return {
      label: 'Assigned target',
      value: gen ? gen.label : 'none',
      isPokemon: false,
      spriteUrl: null
    }
  }
  if (selectedType.value === 'illustrator') {
    const name = slot.assignment.illustratorName
    const row = name ? availableIllustrators.value.find((x) => x.id === name) : null
    return {
      label: 'Assigned target',
      value: name ? `${name}${row ? ` (${row.cardCount} cards)` : ''}` : 'none',
      isPokemon: false,
      spriteUrl: null
    }
  }
  if (selectedType.value === 'randomNumber') {
    if (!slot.assignment.randomAssigned) return { label: 'Assigned target', value: 'none', isPokemon: false, spriteUrl: null }
    const cardLabel = form.value.cardCountMode === 'fixed' ? `${form.value.fixedCardCount} cards` : 'all cards'
    return { label: 'Assigned target', value: `random (${form.value.randomScope}) • ${cardLabel}`, isPokemon: false, spriteUrl: null }
  }
  return { label: 'Assigned target', value: 'none', isPokemon: false, spriteUrl: null }
}

const getCardsForParticipant = async (slot, languages) => {
  if (selectedType.value === 'set') {
    const set = availableSets.value.find((x) => x.id === slot.assignment.setId)
    if (!set) return { card_en: [], card_ja: [] }
    const ids = await getCardIdsForSet(set.id, set.language || 'en')
    const base = set.language === 'ja' ? { card_en: [], card_ja: ids } : { card_en: ids, card_ja: [] }
    return sampleCardIds(base)
  }

  if (selectedType.value === 'pokemon') {
    const pokemon = availablePokemon.value.find((x) => x.id === slot.assignment.pokemonId)
    if (!pokemon?.nationalDexNumber) return { card_en: [], card_ja: [] }
    const ids = await getCardIdsForPokemon(pokemon.nationalDexNumber, languages)
    return sampleCardIds(ids)
  }

  if (selectedType.value === 'trainer') {
    const trainer = availableTrainers.value.find((x) => x.id === slot.assignment.trainerId)
    if (!trainer) return { card_en: [], card_ja: [] }
    const ids = await getTrainerCardsMvp(trainer, languages)
    return sampleCardIds(ids)
  }

  if (selectedType.value === 'generation') {
    const gen = getGenerationById(slot.assignment.generationId)
    if (!gen) return { card_en: [], card_ja: [] }
    const ids = await getCardIdsForGeneration(gen.minNationalDex, gen.maxNationalDex, languages)
    return sampleCardIds(ids)
  }

  if (selectedType.value === 'illustrator') {
    const name = slot.assignment.illustratorName
    if (!name) return { card_en: [], card_ja: [] }
    const ids = await getCardIdsForIllustrator(name, languages)
    return sampleCardIds(ids)
  }

  return getRandomCards(languages)
}

const createMasterSet = async () => {
  if (!user.value) {
    router.push('/login')
    return
  }

  isCreating.value = true
  try {
    const languages = resolveLanguages()
    const challengeType = selectedType.value === 'randomNumber' ? 'random' : selectedType.value

    const first = form.value.participants[0]
    const firstSet = availableSets.value.find((x) => x.id === first.assignment.setId)
    const firstPokemon = availablePokemon.value.find((x) => x.id === first.assignment.pokemonId)
    const firstTrainer = availableTrainers.value.find((x) => x.id === first.assignment.trainerId)
    const firstGen = getGenerationById(first.assignment.generationId)
    const firstIllustratorName = first.assignment.illustratorName || null

    const knownMemberIds = form.value.participants
      .map((slot) => (slot.isSelf ? user.value.uid : slot.userId))
      .filter(Boolean)
    const uniqueMemberIds = Array.from(new Set(knownMemberIds))

    const masterSetData = {
      name: form.value.challengeName.trim(),
      description: null,
      type: challengeType === 'trainer' ? 'pokemon' : challengeType, // compatibility for existing screens
      challengeType,
      challengeMode: form.value.challengeMode || 'master-set',
      mode: form.value.collaborationMode,
      selectionMode: form.value.selectionMode,
      cardCountMode: form.value.cardCountMode,
      cardCount: form.value.cardCountMode === 'fixed' ? form.value.fixedCardCount : null,
      targetSetId: firstSet?.id || null,
      targetSetCollection: firstSet ? `set_${firstSet.language || 'en'}` : null,
      targetSetName: firstSet?.name || null,
      targetPokemonId: firstPokemon ? String(firstPokemon.nationalDexNumber || firstPokemon.id) : null,
      targetPokemonName: firstPokemon
        ? (firstPokemon.displayName || firstPokemon.name)
        : (firstGen
          ? firstGen.label
          : (firstIllustratorName || firstTrainer?.trainerName || null)),
      targetTrainerId: firstTrainer?.id || null,
      targetTrainerName: firstTrainer?.trainerName || null,
      targetGenerationKey: firstGen?.id || null,
      generationMinNationalDex: firstGen ? firstGen.minNationalDex : null,
      generationMaxNationalDex: firstGen ? firstGen.maxNationalDex : null,
      generationRegionLabel: firstGen?.region || null,
      targetIllustratorName: firstIllustratorName,
      randomScope: selectedType.value === 'randomNumber' ? form.value.randomScope : null,
      battleOwnerId: user.value.uid,
      battleOpponentId: form.value.participants.length > 1 ? (form.value.participants[1]?.userId || null) : null,
      battleStatus: form.value.participants.length > 1 ? 'pending' : null,
      playerCount: form.value.participants.length,
      memberIds: uniqueMemberIds,
      memberHistoryIds: uniqueMemberIds,
      languages,
      createdBy: user.value.uid
    }

    const created = await createMasterSetUtil(masterSetData)
    if (!created.success) throw new Error(created.error || 'Failed to create master set')
    const masterSetId = created.data.id

    const mapAssignmentType = (ct) => {
      if (ct === 'random') return 'set'
      if (ct === 'trainer') return 'pokemon'
      return ct
    }

    if (form.value.collaborationMode === 'together') {
      const sharedSlot = form.value.participants[0]
      const sharedSetObj = availableSets.value.find((x) => x.id === sharedSlot.assignment.setId)
      const sharedPokemonObj = availablePokemon.value.find((x) => x.id === sharedSlot.assignment.pokemonId)
      const sharedTrainerObj = availableTrainers.value.find((x) => x.id === sharedSlot.assignment.trainerId)
      const sharedGenObj = getGenerationById(sharedSlot.assignment.generationId)
      const sharedIllustratorName = sharedSlot.assignment.illustratorName || null
      const sharedCards = await getCardsForParticipant(sharedSlot, languages)
      const pendingMemberEmails = form.value.participants
        .filter((slot) => !slot.isSelf && !slot.userId)
        .map((slot) => slot.email || (slot.input.includes('@') ? slot.input : null))
        .filter(Boolean)

      if ((sharedCards.card_en.length + sharedCards.card_ja.length) === 0) {
        throw new Error('No cards found for this shared assignment.')
      }

      await createAssignment({
        masterSetId,
        isShared: true,
        memberIds: uniqueMemberIds,
        memberHistoryIds: uniqueMemberIds,
        pendingMemberEmails,
        userId: user.value.uid,
        userEmail: user.value.email,
        email: user.value.email,
        userName: user.value.displayName || user.value.email,
        card_en: sharedCards.card_en,
        card_ja: sharedCards.card_ja,
        type: mapAssignmentType(challengeType),
        setId: sharedSetObj?.id || null,
        setName: sharedSetObj?.name || null,
        pokemonId: sharedPokemonObj ? String(sharedPokemonObj.nationalDexNumber || sharedPokemonObj.id) : (sharedTrainerObj?.id || null),
        pokemonName: sharedPokemonObj
          ? (sharedPokemonObj.displayName || sharedPokemonObj.name)
          : (sharedGenObj
            ? sharedGenObj.label
            : (sharedIllustratorName || sharedTrainerObj?.trainerName || null)),
        generationKey: sharedGenObj?.id || null,
        generationLabel: sharedGenObj?.label || null,
        illustratorName: sharedIllustratorName,
        status: 'accepted',
        createdBy: user.value.uid
      })
    } else {
      for (let i = 0; i < form.value.participants.length; i += 1) {
        const slot = form.value.participants[i]
        const setObj = availableSets.value.find((x) => x.id === slot.assignment.setId)
        const pokemonObj = availablePokemon.value.find((x) => x.id === slot.assignment.pokemonId)
        const trainerObj = availableTrainers.value.find((x) => x.id === slot.assignment.trainerId)
        const genObj = getGenerationById(slot.assignment.generationId)
        const illName = slot.assignment.illustratorName || null
        const cardsByLang = await getCardsForParticipant(slot, languages)

        if ((cardsByLang.card_en.length + cardsByLang.card_ja.length) === 0) {
          throw new Error(`No cards found for ${slot.isSelf ? 'you' : `player ${i + 1}`}.`)
        }

        await createAssignment({
          masterSetId,
          userId: slot.isSelf ? user.value.uid : (slot.userId || null),
          userEmail: slot.isSelf ? user.value.email : (slot.email || (slot.input.includes('@') ? slot.input : null)),
          email: slot.isSelf ? user.value.email : (slot.email || (slot.input.includes('@') ? slot.input : null)),
          userName: slot.isSelf ? (user.value.displayName || user.value.email) : (slot.userName || null),
          card_en: cardsByLang.card_en,
          card_ja: cardsByLang.card_ja,
          type: mapAssignmentType(challengeType),
          setId: setObj?.id || null,
          setName: setObj?.name || null,
          pokemonId: pokemonObj ? String(pokemonObj.nationalDexNumber || pokemonObj.id) : (trainerObj?.id || null),
          pokemonName: pokemonObj
            ? (pokemonObj.displayName || pokemonObj.name)
            : (genObj ? genObj.label : (illName || trainerObj?.trainerName || null)),
          generationKey: genObj?.id || null,
          generationLabel: genObj?.label || null,
          illustratorName: illName,
          status: slot.isSelf ? 'accepted' : 'pending',
          createdBy: user.value.uid
        })
      }
    }

    showSuccessNotification.value = true
    setTimeout(() => {
      router.push(`/master-set/${masterSetId}`)
    }, 1200)
  } catch (error) {
    console.error('Error creating master set:', error)
    alert(error.message || 'Unable to create master set')
  } finally {
    isCreating.value = false
  }
}

const isAutoGeneratedChallengeName = (name) => {
  const t = (name || '').trim()
  if (!t) return true
  return challengeOptions.some((o) => t === `${o.label} Challenge`)
}

const selectType = (type) => {
  selectedType.value = type
  const isRandomNumber = type === 'randomNumber'
  form.value.selectionMode = 'random'
  form.value.cardCountMode = isRandomNumber ? 'fixed' : 'all'
  if (isRandomNumber) {
    form.value.fixedCardCount = Math.min(100, Math.max(1, form.value.fixedCardCount || 50))
  }
  form.value.collaborationMode = 'race'
  form.value.participants = [makeParticipant(1, true)]
  if (isAutoGeneratedChallengeName(form.value.challengeName)) {
    const label = challengeOptions.find((x) => x.id === type)?.label || 'Master Set'
    form.value.challengeName = `${label} Challenge`
  }
}

watch(
  [selectedType, () => form.value.fixedCardCount, () => form.value.selectionMode, () => form.value.cardCountMode],
  () => {
    if (selectedType.value !== 'randomNumber') return
    if (form.value.selectionMode !== 'random') form.value.selectionMode = 'random'
    if (form.value.cardCountMode !== 'fixed') form.value.cardCountMode = 'fixed'
    if (!form.value.fixedCardCount || form.value.fixedCardCount < 1) form.value.fixedCardCount = 1
    if (form.value.fixedCardCount > 100) form.value.fixedCardCount = 100
  }
)

const nextStep = () => {
  if (currentStep.value < steps.length - 1) currentStep.value += 1
}

const prevStep = () => {
  if (currentStep.value > 0) currentStep.value -= 1
}

const loadSets = async () => {
  isLoadingSets.value = true
  try {
    const setsEnRef = collection(db, 'set_en')
    const snapshot = await getDocs(setsEnRef)
    availableSets.value = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      language: 'en'
    })).sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  } catch (error) {
    console.error('Error loading sets:', error)
  } finally {
    isLoadingSets.value = false
  }
}

const loadPokemon = async () => {
  isLoadingPokemon.value = true
  try {
    const pokemonRef = collection(db, 'pokemon')
    const snapshot = await getDocs(pokemonRef)
    availablePokemon.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (error) {
    console.error('Error loading pokemon:', error)
  } finally {
    isLoadingPokemon.value = false
  }
}

const loadTrainers = async () => {
  isLoadingTrainers.value = true
  try {
    const list = await getAllTrainers()
    availableTrainers.value = await computeTrainerCardCounts(list)
  } catch (error) {
    console.error('Error loading trainers:', error)
  } finally {
    isLoadingTrainers.value = false
  }
}

const loadIllustrators = async () => {
  isLoadingIllustrators.value = true
  try {
    availableIllustrators.value = await aggregateIllustratorCounts()
  } catch (error) {
    console.error('Error loading illustrators:', error)
  } finally {
    isLoadingIllustrators.value = false
  }
}

watch(
  () => user.value,
  () => {
    syncSelfParticipant()
  }
)

onMounted(() => {
  document.title = 'PULL TCG — Create Master Set'
  if (user.value) {
    loadSets()
    loadPokemon()
    loadTrainers()
    loadIllustrators()
  }
  syncSelfParticipant()
})
</script>

<style scoped>
/* Mobile wizard: leave room for sticky actions + (in app) bottom tab bar */
.start-flow-wizard-pad--browser {
  padding-bottom: calc(5.75rem + env(safe-area-inset-bottom, 0px));
}

.start-flow-wizard-pad--shell {
  padding-bottom: calc(9.5rem + env(safe-area-inset-bottom, 0px));
}

@media (min-width: 768px) {
  .start-flow-wizard-pad--browser,
  .start-flow-wizard-pad--shell {
    padding-bottom: 0;
  }
}

/* Sticky nav: in native app, sit above AppTabBar (~56px + safe padding) — not viewport bottom */
.start-flow-sticky-nav--shell {
  bottom: calc(3.75rem + max(0.5rem, env(safe-area-inset-bottom, 0px)));
}

.start-flow-sticky-nav--browser {
  bottom: 0;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.flat-option-btn,
.flat-option-btn:hover,
.flat-option-btn:focus,
.flat-option-btn:active {
  box-shadow: none !important;
}

.challenge-name-input {
  background: transparent !important;
  box-shadow: none !important;
}

.challenge-name-input:focus {
  border-color: var(--color-accent) !important;
}

.start-flow-toggle-btn {
  background-color: rgba(30, 90, 158, 0.13) !important;
  color: #0b1a33 !important;
  border: 1px solid rgba(30, 90, 158, 0.3) !important;
  font-weight: 600 !important;
}

.start-flow-toggle-btn:hover,
.start-flow-toggle-btn:focus-visible {
  background-color: rgba(30, 90, 158, 0.24) !important;
  color: #0b1a33 !important;
  border-color: rgba(30, 90, 158, 0.52) !important;
}

.start-flow-toggle-btn-active {
  background-color: rgba(30, 90, 158, 0.3) !important;
  color: #0b1a33 !important;
  border: 1px solid rgba(30, 90, 158, 0.62) !important;
  font-weight: 600 !important;
}

.start-flow-status-chip {
  background-color: rgba(30, 90, 158, 0.14) !important;
  border: 1px solid rgba(30, 90, 158, 0.32) !important;
  color: #2f4b6b !important;
}

/* Pill stepper (Choose → Players → Configure) */
.start-flow-stepper {
  --start-flow-track-bg: #ffffff;
  --start-flow-active-bg: #12233b;
  --start-flow-strong-text: #12233b;
  --start-flow-todo-circle: #e2e8f0;
  --start-flow-todo-num: #64748b;
  --start-flow-todo-text: #a0aec0;
}

.start-flow-stepper-kicker {
  text-align: center;
  font-size: 0.625rem;
  line-height: 1.3;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  margin: 0 0 0.5rem;
}

@media (min-width: 640px) {
  .start-flow-stepper-kicker {
    font-size: 0.6875rem;
    margin-bottom: 0.625rem;
  }
}

.start-flow-stepper-track {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 0.125rem;
  padding: 0.375rem 0.5rem;
  border-radius: var(--radius-lg);
  background-color: var(--start-flow-track-bg);
  border: 1px solid rgba(18, 35, 59, 0.08);
}

.start-flow-stepper-cell {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.start-flow-stepper-active {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.65rem;
  border-radius: 9999px;
  background-color: var(--start-flow-active-bg);
  color: #ffffff;
  max-width: 100%;
  box-shadow: 0 1px 2px rgba(18, 35, 59, 0.12);
}

.start-flow-stepper-active-num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
  background-color: rgba(255, 255, 255, 0.22);
  font-size: 0.8125rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.start-flow-stepper-active-label {
  font-weight: 700;
  font-size: 0.8125rem;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (min-width: 640px) {
  .start-flow-stepper-active {
    padding: 0.5rem 0.85rem;
    gap: 0.625rem;
  }

  .start-flow-stepper-active-label {
    font-size: 0.9375rem;
  }
}

.start-flow-stepper-done {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  max-width: 100%;
  min-width: 0;
}

.start-flow-stepper-check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
  background-color: var(--start-flow-active-bg);
  color: #ffffff;
  flex-shrink: 0;
}

.start-flow-stepper-check-icon {
  width: 0.7rem;
  height: 0.7rem;
}

.start-flow-stepper-done-label {
  font-weight: 700;
  font-size: 0.8125rem;
  line-height: 1.2;
  color: var(--start-flow-strong-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (min-width: 640px) {
  .start-flow-stepper-done-label {
    font-size: 0.9375rem;
  }
}

.start-flow-stepper-todo {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  max-width: 100%;
  min-width: 0;
}

.start-flow-stepper-todo-num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
  background-color: var(--start-flow-todo-circle);
  color: var(--start-flow-todo-num);
  font-size: 0.8125rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
  line-height: 1;
}

.start-flow-stepper-todo-label {
  font-weight: 600;
  font-size: 0.8125rem;
  line-height: 1.2;
  color: var(--start-flow-todo-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (min-width: 640px) {
  .start-flow-stepper-todo-label {
    font-size: 0.875rem;
  }
}

:global(html.dark) .start-flow-stepper {
  --start-flow-track-bg: rgba(255, 255, 255, 0.06);
  --start-flow-active-bg: #2b4a7a;
  --start-flow-strong-text: #e8f0fa;
  --start-flow-todo-circle: rgba(255, 255, 255, 0.1);
  --start-flow-todo-num: #8a9db8;
  --start-flow-todo-text: #8a9db8;
}

:global(html.dark) .start-flow-stepper-track {
  border-color: rgba(255, 255, 255, 0.1);
}

@media (prefers-color-scheme: dark) {
  .start-flow-toggle-btn {
    color: rgba(255, 255, 255, 0.92) !important;
    border-color: rgba(147, 197, 253, 0.42) !important;
  }

  .start-flow-toggle-btn:hover,
  .start-flow-toggle-btn:focus-visible {
    color: #ffffff !important;
    border-color: rgba(147, 197, 253, 0.58) !important;
  }

  .start-flow-toggle-btn-active {
    color: #ffffff !important;
    border-color: rgba(147, 197, 253, 0.68) !important;
  }

  .start-flow-status-chip {
    color: rgba(255, 255, 255, 0.9) !important;
    border-color: rgba(147, 197, 253, 0.42) !important;
  }
}
</style>

