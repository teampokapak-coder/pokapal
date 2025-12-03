<template>
  <div class="min-h-screen" style="background-color: var(--color-bg-primary);">
    <section class="section section-spacing-md">
      <div class="section-container">
        <div class="section-header flex justify-between items-center">
          <div>
            <h2>Blog Management</h2>
            <p class="section-subtitle">Create and manage blog posts</p>
          </div>
          <button @click="showCreateModal = true" class="btn btn-h4 btn-primary">
            + New Post
          </button>
        </div>

        <!-- Blog Posts List -->
        <div class="mt-6">
          <div v-if="isLoading" class="text-center py-12">
            <p>Loading blog posts...</p>
          </div>
          
          <div v-else-if="blogPosts.length === 0" class="text-center py-12">
            <p class="mb-4" style="color: var(--color-text-secondary);">No blog posts yet</p>
            <button @click="showCreateModal = true" class="btn btn-h4 btn-primary">
              Create Your First Post
            </button>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="post in blogPosts"
              :key="post.id"
              class="card hover:shadow-lg transition-all"
            >
              <div class="card-body">
                <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-2 mb-2">
                      <h3 class="card-title break-words">{{ post.title }}</h3>
                      <span
                        v-if="post.published"
                        class="px-2 py-1 text-xs rounded flex-shrink-0"
                        style="background-color: rgba(34, 197, 94, 0.2); color: rgb(22, 163, 74);"
                      >
                        Published
                      </span>
                      <span
                        v-else
                        class="px-2 py-1 text-xs rounded flex-shrink-0"
                        style="background-color: var(--color-bg-tertiary); color: var(--color-text-secondary);"
                      >
                        Draft
                      </span>
                      <span
                        v-if="post.featured"
                        class="px-2 py-1 text-xs rounded flex-shrink-0"
                        style="background-color: rgba(59, 130, 246, 0.2); color: rgb(37, 99, 235);"
                      >
                        Featured
                      </span>
                    </div>
                    <p class="text-sm mb-2 break-words" style="color: var(--color-text-secondary);">
                      {{ post.excerpt || 'No excerpt' }}
                    </p>
                    <div class="flex flex-wrap items-center gap-2 sm:gap-4 text-xs" style="color: var(--color-text-tertiary);">
                      <span class="break-all">Slug: /blog/{{ post.slug }}</span>
                      <span v-if="post.publishedAt" class="whitespace-nowrap">
                        Published: {{ formatDate(post.publishedAt) }}
                      </span>
                    </div>
                  </div>
                  <div class="flex gap-2 flex-shrink-0">
                    <button
                      @click="editPost(post)"
                      class="btn btn-h5 btn-secondary whitespace-nowrap"
                    >
                      Edit
                    </button>
                    <button
                      @click="deletePost(post.id)"
                      class="btn btn-h5 btn-ghost whitespace-nowrap"
                      style="color: #dc2626;"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal || editingPost"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4"
      @click.self="closeModal"
    >
      <div class="rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto" style="background-color: var(--color-bg-primary);">
        <div class="sticky top-0 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center border-b" style="background-color: var(--color-bg-primary); border-color: var(--color-border);">
          <h3 class="text-lg sm:text-xl font-semibold" style="color: var(--color-text-primary);">
            {{ editingPost ? 'Edit Post' : 'Create New Post' }}
          </h3>
          <button @click="closeModal" style="color: var(--color-text-secondary);" class="hover:opacity-75 transition-opacity text-xl sm:text-2xl">
            ✕
          </button>
        </div>

        <div class="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium mb-2" style="color: var(--color-text-primary);">Title *</label>
            <input
              v-model="postForm.title"
              type="text"
              placeholder="Enter blog post title"
              class="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2"
              style="border-color: var(--color-border); background-color: var(--color-bg-primary); color: var(--color-text-primary);"
              @input="generateSlugFromTitle"
            />
          </div>

          <!-- Slug -->
          <div>
            <label class="block text-sm font-medium mb-2" style="color: var(--color-text-primary);">Slug *</label>
            <div class="flex gap-2">
              <span class="px-3 py-2 rounded-l-md border" style="background-color: var(--color-bg-tertiary); border-color: var(--color-border); color: var(--color-text-secondary);">/blog/</span>
              <input
                v-model="postForm.slug"
                type="text"
                placeholder="url-friendly-slug"
                class="flex-1 px-4 py-2 rounded-r-md border focus:outline-none focus:ring-2"
                style="border-color: var(--color-border); background-color: var(--color-bg-primary); color: var(--color-text-primary);"
              />
            </div>
            <p class="text-xs mt-1" style="color: var(--color-text-tertiary);">URL: /blog/{{ postForm.slug || 'slug' }}</p>
          </div>

          <!-- Hero Image -->
          <div>
            <label class="block text-sm font-medium mb-2" style="color: var(--color-text-primary);">Hero Banner Image</label>
            <p class="text-xs mb-2" style="color: var(--color-text-tertiary);">Recommended size: 1920x800px</p>
            <div v-if="postForm.heroImage" class="mb-2">
              <img :src="postForm.heroImage" alt="Hero" class="max-w-full h-32 object-cover rounded" />
            </div>
            <input
              type="file"
              accept="image/*"
              @change="handleHeroImageUpload"
              class="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2"
              style="border-color: var(--color-border); background-color: var(--color-bg-primary); color: var(--color-text-primary);"
            />
            <div v-if="uploadingImage" class="text-sm mt-2" style="color: var(--color-text-tertiary);">Uploading...</div>
          </div>

          <!-- Excerpt -->
          <div>
            <label class="block text-sm font-medium mb-2" style="color: var(--color-text-primary);">Excerpt *</label>
            <textarea
              v-model="postForm.excerpt"
              rows="3"
              placeholder="Short description (150-200 characters)"
              class="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2"
              style="border-color: var(--color-border); background-color: var(--color-bg-primary); color: var(--color-text-primary);"
              maxlength="200"
            />
            <p class="text-xs mt-1" style="color: var(--color-text-tertiary);">{{ postForm.excerpt.length }}/200 characters</p>
          </div>

          <!-- Content -->
          <div>
            <label class="block text-sm font-medium mb-2" style="color: var(--color-text-primary);">Content *</label>
            <RichTextEditor v-model="postForm.content" />
          </div>

          <!-- Link to Set or Pokemon -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--color-text-primary);">Link to Set (Optional)</label>
              <select
                v-model="postForm.linkedSetId"
                class="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2"
                style="border-color: var(--color-border); background-color: var(--color-bg-primary); color: var(--color-text-primary);"
                @change="updateLinkedSetName"
              >
                <option value="">None</option>
                <option v-for="set in availableSets" :key="set.id" :value="set.id">
                  {{ set.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--color-text-primary);">Link to Pokemon (Optional)</label>
              <input
                v-model.number="postForm.linkedPokemonId"
                type="number"
                placeholder="National Dex #"
                class="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2"
                style="border-color: var(--color-border); background-color: var(--color-bg-primary); color: var(--color-text-primary);"
                @input="updateLinkedPokemonName"
              />
            </div>
          </div>

          <!-- SEO Fields -->
          <div class="border-t pt-4" style="border-color: var(--color-border);">
            <h4 class="font-medium mb-4" style="color: var(--color-text-primary);">SEO Settings</h4>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2" style="color: var(--color-text-primary);">Meta Title</label>
                <input
                  v-model="postForm.metaTitle"
                  type="text"
                  placeholder="Defaults to post title"
                  class="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2"
                  style="border-color: var(--color-border); background-color: var(--color-bg-primary); color: var(--color-text-primary);"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2" style="color: var(--color-text-primary);">Meta Description</label>
                <textarea
                  v-model="postForm.metaDescription"
                  rows="2"
                  placeholder="Defaults to excerpt"
                  class="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2"
                  style="border-color: var(--color-border); background-color: var(--color-bg-primary); color: var(--color-text-primary);"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2" style="color: var(--color-text-primary);">Keywords (comma-separated)</label>
                <input
                  v-model="keywordsInput"
                  type="text"
                  placeholder="pokemon, tcg, collecting"
                  class="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2"
                  style="border-color: var(--color-border); background-color: var(--color-bg-primary); color: var(--color-text-primary);"
                />
              </div>
            </div>
          </div>

          <!-- Publish Options -->
          <div class="border-t pt-4" style="border-color: var(--color-border);">
            <div class="flex items-center gap-6">
              <label class="flex items-center gap-2" style="color: var(--color-text-primary);">
                <input
                  v-model="postForm.published"
                  type="checkbox"
                  class="w-4 h-4"
                  style="accent-color: var(--color-accent);"
                />
                <span>Publish immediately</span>
              </label>
              <label class="flex items-center gap-2" style="color: var(--color-text-primary);">
                <input
                  v-model="postForm.featured"
                  type="checkbox"
                  class="w-4 h-4"
                  style="accent-color: var(--color-accent);"
                />
                <span>Feature on homepage</span>
              </label>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-4 border-t pt-4" style="border-color: var(--color-border);">
            <button @click="closeModal" class="btn btn-h4 btn-ghost">
              Cancel
            </button>
            <button @click="savePost" class="btn btn-h4 btn-primary" :disabled="saving">
              {{ saving ? 'Saving...' : editingPost ? 'Update Post' : 'Create Post' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import { getAllBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost, generateSlug } from '../utils/blogUtils'
import { uploadBlogHeroImage } from '../utils/imageUpload'
import { getAllSets } from '../utils/firebasePokemon'
import { getPokemonByDexNumber } from '../utils/firebasePokemon'
import RichTextEditor from '../components/RichTextEditor.vue'

const { user } = useAuth()

const blogPosts = ref([])
const isLoading = ref(false)
const showCreateModal = ref(false)
const editingPost = ref(null)
const saving = ref(false)
const uploadingImage = ref(false)
const availableSets = ref([])

const postForm = ref({
  title: '',
  slug: '',
  heroImage: '',
  content: '',
  excerpt: '',
  linkedSetId: '',
  linkedSetName: '',
  linkedPokemonId: null,
  linkedPokemonName: '',
  published: false,
  featured: false,
  metaTitle: '',
  metaDescription: '',
  keywords: []
})

const keywordsInput = computed({
  get: () => postForm.value.keywords.join(', '),
  set: (val) => {
    postForm.value.keywords = val.split(',').map(k => k.trim()).filter(Boolean)
  }
})

const loadBlogPosts = async () => {
  isLoading.value = true
  try {
    const result = await getAllBlogPosts({ publishedOnly: false })
    if (result.success) {
      blogPosts.value = result.data
    }
  } catch (error) {
    console.error('Error loading blog posts:', error)
  } finally {
    isLoading.value = false
  }
}

const loadSets = async () => {
  const result = await getAllSets({ language: 'en' })
  if (result.success) {
    availableSets.value = result.data
  }
}

const generateSlugFromTitle = () => {
  if (!editingPost.value && postForm.value.title) {
    postForm.value.slug = generateSlug(postForm.value.title)
  }
}

const handleHeroImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Check if user is authenticated
  if (!user.value) {
    alert('Please log in to upload images')
    return
  }

  uploadingImage.value = true
  try {
    const result = await uploadBlogHeroImage(file)
    if (result.success) {
      if (result.url) {
        postForm.value.heroImage = result.url
      } else if (result.warning) {
        // Upload succeeded but URL not immediately available - don't show error
        // The file is uploaded and will be available shortly
        console.log(result.warning)
      }
    } else {
      // Only show error if it's a real failure, not a transient object-not-found
      if (!result.error || !result.error.includes('object-not-found')) {
        let errorMessage = result.error || 'Failed to upload image'
        if (errorMessage.includes('CORS') || errorMessage.includes('cors')) {
          errorMessage += '\n\nPlease check Firebase Storage CORS configuration. See FIREBASE_STORAGE_CORS_SETUP.md for instructions.'
        }
        alert('Error uploading image: ' + errorMessage)
      }
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    // Don't show alert for object-not-found errors that resolve themselves
    if (error.code !== 'storage/object-not-found') {
      let errorMessage = error.message || 'Unknown error occurred'
      if (errorMessage.includes('CORS') || errorMessage.includes('cors') || error.code === 'storage/unauthorized') {
        errorMessage += '\n\nPlease check Firebase Storage CORS configuration and ensure you are logged in. See FIREBASE_STORAGE_CORS_SETUP.md for instructions.'
      }
      alert('Error uploading image: ' + errorMessage)
    }
  } finally {
    uploadingImage.value = false
  }
}

const updateLinkedSetName = () => {
  const set = availableSets.value.find(s => s.id === postForm.value.linkedSetId)
  postForm.value.linkedSetName = set?.name || ''
}

const updateLinkedPokemonName = async () => {
  if (postForm.value.linkedPokemonId) {
    const result = await getPokemonByDexNumber(postForm.value.linkedPokemonId)
    if (result.success && result.data) {
      postForm.value.linkedPokemonName = result.data.displayName || result.data.name
    }
  } else {
    postForm.value.linkedPokemonName = ''
  }
}

const editPost = (post) => {
  editingPost.value = post
  postForm.value = {
    title: post.title,
    slug: post.slug,
    heroImage: post.heroImage || '',
    content: post.content || '',
    excerpt: post.excerpt || '',
    linkedSetId: post.linkedSetId || '',
    linkedSetName: post.linkedSetName || '',
    linkedPokemonId: post.linkedPokemonId || null,
    linkedPokemonName: post.linkedPokemonName || '',
    published: post.published || false,
    featured: post.featured || false,
    metaTitle: post.metaTitle || '',
    metaDescription: post.metaDescription || '',
    keywords: post.keywords || []
  }
  showCreateModal.value = true
}

const closeModal = () => {
  showCreateModal.value = false
  editingPost.value = null
  postForm.value = {
    title: '',
    slug: '',
    heroImage: '',
    content: '',
    excerpt: '',
    linkedSetId: '',
    linkedSetName: '',
    linkedPokemonId: null,
    linkedPokemonName: '',
    published: false,
    featured: false,
    metaTitle: '',
    metaDescription: '',
    keywords: []
  }
}

const savePost = async () => {
  if (!postForm.value.title || !postForm.value.slug || !postForm.value.content || !postForm.value.excerpt) {
    alert('Please fill in all required fields')
    return
  }

  saving.value = true
  try {
    if (editingPost.value) {
      const result = await updateBlogPost(editingPost.value.id, postForm.value)
      if (result.success) {
        alert('Post updated successfully!')
        closeModal()
        loadBlogPosts()
      } else {
        alert('Error updating post: ' + result.error)
      }
    } else {
      const result = await createBlogPost(postForm.value, user.value)
      if (result.success) {
        alert('Post created successfully!')
        closeModal()
        loadBlogPosts()
      } else {
        alert('Error creating post: ' + result.error)
      }
    }
  } catch (error) {
    console.error('Error saving post:', error)
    alert('Error saving post')
  } finally {
    saving.value = false
  }
}

const deletePost = async (postId) => {
  if (!confirm('Are you sure you want to delete this post?')) return

  try {
    const result = await deleteBlogPost(postId)
    if (result.success) {
      alert('Post deleted successfully!')
      loadBlogPosts()
    } else {
      alert('Error deleting post: ' + result.error)
    }
  } catch (error) {
    console.error('Error deleting post:', error)
    alert('Error deleting post')
  }
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString()
}

onMounted(() => {
  loadBlogPosts()
  loadSets()
})
</script>

