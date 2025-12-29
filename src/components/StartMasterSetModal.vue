<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
    @click="$emit('close')"
  >
    <div
      class="rounded-lg max-w-md w-full my-auto max-h-[90vh] overflow-y-auto"
      style="background-color: var(--color-bg-secondary);"
      @click.stop
    >
      <div class="p-4 sm:p-5">
        <div class="flex justify-between items-start mb-3">
          <h3 class="text-lg sm:text-xl" style="color: var(--color-text-primary);">Start Master Set</h3>
          <button
            @click="$emit('close')"
            class="text-xl leading-none"
            style="color: var(--color-text-tertiary);"
          >
            ✕
          </button>
        </div>
        
        <div class="space-y-3">
          <div>
            <label class="block text-xs sm:text-sm font-medium mb-1.5" style="color: var(--color-text-primary);">
              Master Set Name
            </label>
            <input
              v-model="form.name"
              type="text"
              :placeholder="namePlaceholder"
              class="w-full px-3 py-1.5 sm:px-4 sm:py-2 text-sm border rounded-md focus:outline-none focus:ring-2"
              style="border-color: var(--color-border); background-color: var(--color-bg-primary); color: var(--color-text-primary);"
            />
          </div>

          <div>
            <label class="block text-xs sm:text-sm font-medium mb-1.5" style="color: var(--color-text-primary);">
              Description (Optional)
            </label>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="Add a description for your master set..."
              class="w-full px-3 py-1.5 sm:px-4 sm:py-2 text-sm border rounded-md focus:outline-none focus:ring-2"
              style="border-color: var(--color-border); background-color: var(--color-bg-primary); color: var(--color-text-primary);"
            ></textarea>
          </div>

          <!-- Language Selection -->
          <div>
            <label class="block text-xs sm:text-sm font-medium mb-1.5" style="color: var(--color-text-primary);">
              Languages
            </label>
            <div class="flex gap-3 sm:gap-4">
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="form.languages"
                  value="en"
                  class="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  :disabled="type === 'set' && setLanguage === 'ja'"
                />
                <span class="text-xs sm:text-sm" style="color: var(--color-text-primary);">English</span>
                <span v-if="englishCardCount > 0" class="text-xs" style="color: var(--color-text-tertiary);">
                  ({{ englishCardCount }})
                </span>
              </label>
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="form.languages"
                  value="ja"
                  class="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  :disabled="type === 'set' && setLanguage === 'en'"
                />
                <span class="text-xs sm:text-sm" style="color: var(--color-text-primary);">Japanese</span>
                <span v-if="japaneseCardCount > 0" class="text-xs" style="color: var(--color-text-tertiary);">
                  ({{ japaneseCardCount }})
                </span>
              </label>
            </div>
            <p v-if="form.languages.length === 0" class="text-xs text-red-500 mt-1">
              Please select at least one language
            </p>
            <p v-if="type === 'set' && setLanguage" class="text-xs mt-1" style="color: var(--color-text-tertiary);">
              This set contains {{ setLanguage === 'en' ? 'English' : 'Japanese' }} cards
            </p>
          </div>

          <!-- Invite Users -->
          <div>
            <label class="block text-xs sm:text-sm font-medium mb-1.5" style="color: var(--color-text-primary);">
              Invite Friends (Optional)
            </label>
            <div class="space-y-1.5">
              <div v-for="(invite, index) in form.invites" :key="index" class="flex gap-1.5">
                <input
                  v-model="invite.email"
                  type="email"
                  placeholder="friend@example.com"
                  class="flex-1 px-3 py-1.5 sm:px-4 sm:py-2 text-sm border rounded-md focus:outline-none focus:ring-2"
                  style="border-color: var(--color-border); background-color: var(--color-bg-primary); color: var(--color-text-primary);"
                  @input="searchUserForInvite(invite, index)"
                />
                <button
                  @click="removeInvite(index)"
                  class="px-2 py-1.5 sm:px-3 sm:py-2 text-red-600 hover:bg-red-50 rounded-md text-sm"
                >
                  ✕
                </button>
              </div>
              <button
                @click="addInvite"
                class="btn btn-h5 btn-secondary w-full text-xs sm:text-sm py-1.5"
              >
                + Add Friend
              </button>
            </div>
          </div>

          <div class="text-xs sm:text-sm" style="color: var(--color-text-secondary);">
            <p class="mb-1">This will create a master set for:</p>
            <p class="font-medium" style="color: var(--color-text-primary);">
              {{ targetName }}
            </p>
            <p class="text-xs mt-0.5">
              {{ totalCardCount }} cards will be included
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3">
            <button
              @click="$emit('close')"
              class="btn btn-h5 sm:btn-h4 btn-ghost flex-1 order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              @click="handleCreate"
              class="btn btn-h5 sm:btn-h4 btn-primary flex-1 order-1 sm:order-2"
              :disabled="!form.name.trim() || form.languages.length === 0 || isCreating"
            >
              {{ isCreating ? 'Creating...' : 'Create Master Set' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    required: true,
    validator: (value) => ['pokemon', 'set'].includes(value)
  },
  pokemon: {
    type: Object,
    default: null
  },
  set: {
    type: Object,
    default: null
  },
  englishCardCount: {
    type: Number,
    default: 0
  },
  japaneseCardCount: {
    type: Number,
    default: 0
  },
  isCreating: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'create'])

const form = ref({
  name: '',
  description: '',
  languages: [],
  invites: []
})

const namePlaceholder = computed(() => {
  if (props.type === 'pokemon' && props.pokemon) {
    return `${props.pokemon.displayName || props.pokemon.name} Master Set`
  } else if (props.type === 'set' && props.set) {
    return `${props.set.name || 'Set'} Master Set`
  }
  return 'Master Set'
})

const targetName = computed(() => {
  if (props.type === 'pokemon' && props.pokemon) {
    return props.pokemon.displayName || props.pokemon.name
  } else if (props.type === 'set' && props.set) {
    return props.set.name
  }
  return ''
})

const setLanguage = computed(() => {
  return props.set?.language || null
})

const totalCardCount = computed(() => {
  let count = 0
  if (form.value.languages.includes('en')) {
    count += props.englishCardCount
  }
  if (form.value.languages.includes('ja')) {
    count += props.japaneseCardCount
  }
  return count
})

const addInvite = () => {
  form.value.invites.push({ email: '', userId: null, userName: null })
}

const removeInvite = (index) => {
  form.value.invites.splice(index, 1)
}

const searchUserForInvite = async (invite, index) => {
  // TODO: Implement user search by email
  // For now, just store the email
}

const handleCreate = () => {
  emit('create', {
    name: form.value.name.trim(),
    description: form.value.description.trim() || null,
    languages: form.value.languages,
    invites: form.value.invites
  })
}

// Initialize form when modal opens
watch(() => props.show, (isOpen) => {
  if (isOpen) {
    if (props.type === 'pokemon' && props.pokemon) {
      form.value.name = `${props.pokemon.displayName || props.pokemon.name} Master Set`
      form.value.description = ''
      form.value.languages = ['en'] // Default to English
      form.value.invites = []
    } else if (props.type === 'set' && props.set) {
      form.value.name = `${props.set.name} Master Set`
      form.value.description = ''
      // Default to set's language
      form.value.languages = props.set.language === 'ja' ? ['ja'] : ['en']
      form.value.invites = []
    }
  }
})
</script>

