<template>
  <div class="min-h-screen" style="background-color: var(--color-bg-primary);">
    <div v-if="isLoading" class="section section-spacing-md">
      <div class="section-container text-center py-12">
        <p>Loading post...</p>
      </div>
    </div>

    <div v-else-if="!post" class="section section-spacing-md">
      <div class="section-container text-center py-12">
        <h2>Post Not Found</h2>
        <p class="mb-6" style="color: var(--color-text-secondary);">
          The blog post you're looking for doesn't exist.
        </p>
        <router-link to="/blog" class="btn btn-h4 btn-primary">
          Back to Blog
        </router-link>
      </div>
    </div>

    <article v-else>
      <!-- Hero Banner -->
      <div v-if="post.heroImage" class="w-full flex justify-center mt-3 mb-1">
        <div class="w-full max-w-4xl h-64 sm:h-80 md:h-96 overflow-hidden">
          <img
            :src="post.heroImage"
            :alt="post.title"
            class="w-full h-full object-cover"
          />
        </div>
      </div>

      <!-- Content -->
      <section class="section section-spacing-md">
        <div class="section-container max-w-4xl">
          <!-- Header -->
          <header class="mb-8">
            <h1 class="mb-4">{{ post.title }}</h1>
            <div class="flex flex-wrap items-center gap-2 sm:gap-4 text-sm" style="color: var(--color-text-secondary);">
              <span>By {{ post.author?.displayName || 'Unknown' }}</span>
              <span class="hidden sm:inline">•</span>
              <span>{{ formatDate(post.publishedAt) }}</span>
            </div>
          </header>

          <!-- Content -->
          <div
            class="prose prose-lg max-w-none mb-12 blog-content"
            v-html="post.content"
            style="max-width: 100%;"
          />

          <!-- Linked Page Section -->
          <div v-if="post.linkedSetId || post.linkedPokemonId" class="card card-elevated mt-12">
            <div class="card-body">
              <h3 class="card-title mb-4">Explore Related Content</h3>
              <div v-if="post.linkedSetId" class="flex items-center justify-between">
                <div>
                  <p class="font-medium mb-1">{{ post.linkedSetName || 'Set' }}</p>
                  <p class="text-sm" style="color: var(--color-text-secondary);">
                    View all cards from this set
                  </p>
                </div>
                <router-link
                  :to="`/set/${post.linkedSetId}`"
                  class="btn btn-h4 btn-primary"
                >
                  View Set →
                </router-link>
              </div>
              <div v-else-if="post.linkedPokemonId" class="flex items-center justify-between">
                <div>
                  <p class="font-medium mb-1">{{ post.linkedPokemonName || 'Pokemon' }}</p>
                  <p class="text-sm" style="color: var(--color-text-secondary);">
                    View all cards for this Pokemon
                  </p>
                </div>
                <router-link
                  :to="`/pokemon/${post.linkedPokemonId}`"
                  class="btn btn-h4 btn-primary"
                >
                  View Pokemon →
                </router-link>
              </div>
            </div>
          </div>

          <!-- Back to Blog -->
          <div class="mt-8">
            <router-link to="/blog" class="btn btn-h4 btn-secondary">
              ← Back to Blog
            </router-link>
          </div>
        </div>
      </section>
    </article>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getBlogPost, incrementBlogViews } from '../utils/blogUtils'

const route = useRoute()
const post = ref(null)
const isLoading = ref(true)

const loadPost = async () => {
  isLoading.value = true
  try {
    const slugOrId = route.params.slug
    const result = await getBlogPost(slugOrId)
    
    if (result.success) {
      post.value = result.data
      
      // Update page title and meta tags for SEO
      const title = post.value.metaTitle || `${post.value.title} | PokaPal Blog`
      const description = post.value.metaDescription || post.value.excerpt || ''
      
      document.title = title
      
      // Update meta tags
      updateMetaTag('description', description)
      updateMetaTag('og:title', title)
      updateMetaTag('og:description', description)
      updateMetaTag('og:type', 'article')
      if (post.value.heroImage) {
        updateMetaTag('og:image', post.value.heroImage)
      }
      updateMetaTag('twitter:card', 'summary_large_image')
      if (post.value.heroImage) {
        updateMetaTag('twitter:image', post.value.heroImage)
      }
      
      // Increment view count
      await incrementBlogViews(result.data.id)
    } else {
      post.value = null
    }
  } catch (error) {
    console.error('Error loading blog post:', error)
    post.value = null
  } finally {
    isLoading.value = false
  }
}

const updateMetaTag = (name, content) => {
  let tag = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    if (name.startsWith('og:') || name.startsWith('twitter:')) {
      tag.setAttribute('property', name)
    } else {
      tag.setAttribute('name', name)
    }
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

watch(() => route.params.slug, () => {
  loadPost()
})

onMounted(() => {
  loadPost()
})
</script>

<style>
.prose {
  line-height: 1.75;
}

.prose p {
  margin-bottom: 1.25rem;
}

.prose h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.prose h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.prose ul,
.prose ol {
  margin-left: 1.5rem;
  margin-bottom: 1.25rem;
}

.prose ul {
  list-style-type: disc;
}

.prose ol {
  list-style-type: decimal;
}

.prose li {
  margin-bottom: 0.5rem;
}

.prose a {
  color: #2563eb;
  text-decoration: underline;
}

.prose a:hover {
  color: #1d4ed8;
}

.prose img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1.5rem 0;
}

/* Ensure HTML content renders properly */
.blog-content {
  color: var(--color-text-primary);
  line-height: 1.7;
}

.blog-content :deep(p) {
  margin-bottom: 1.25rem;
  line-height: 1.7;
  color: var(--color-text-primary);
  font-size: 1rem;
}

.blog-content :deep(h2) {
  font-size: 1.875rem;
  font-weight: 600;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
  line-height: 1.3;
}

.blog-content :deep(h2:first-child) {
  margin-top: 0;
}

.blog-content :deep(h3) {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  color: var(--color-text-primary);
  line-height: 1.3;
}

.blog-content :deep(ul),
.blog-content :deep(ol) {
  margin-left: 1.5rem;
  margin-bottom: 1.25rem;
  padding-left: 0.5rem;
}

.blog-content :deep(ul) {
  list-style-type: disc;
}

.blog-content :deep(ol) {
  list-style-type: decimal;
}

.blog-content :deep(li) {
  margin-bottom: 0.75rem;
  color: var(--color-text-primary);
  line-height: 1.6;
  padding-left: 0.25rem;
}

.blog-content :deep(li p) {
  margin-bottom: 0.5rem;
}

.blog-content :deep(a) {
  color: var(--color-accent);
  text-decoration: underline;
  transition: color 0.2s;
}

.blog-content :deep(a:hover) {
  color: var(--color-accent-hover);
}

.blog-content :deep(strong) {
  font-weight: 600;
  color: var(--color-text-primary);
}

.blog-content :deep(em) {
  font-style: italic;
}

.blog-content :deep(p:last-child) {
  margin-bottom: 0;
}
</style>

