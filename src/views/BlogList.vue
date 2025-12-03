<template>
  <div class="min-h-screen" style="background-color: var(--color-bg-primary);">

    <section class="section section-spacing-md">
      <div class="section-container">
        <div class="section-header">
          <h1>Blog</h1>
          <p class="section-subtitle">Guides, tips, and stories about Pokemon TCG collecting</p>
        </div>

        <!-- Featured Posts -->
        <div v-if="featuredPosts.length > 0" class="mt-8 mb-12">
          <h2 class="text-2xl font-semibold mb-6">Featured</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <article
              v-for="post in featuredPosts"
              :key="post.id"
              class="card hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
              @click="$router.push(`/blog/${post.slug || post.id}`)"
            >
              <div v-if="post.heroImage" class="aspect-video overflow-hidden">
                <img
                  :src="post.heroImage"
                  :alt="post.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div class="card-body">
                <h3 class="card-title mb-2">{{ post.title }}</h3>
                <p class="text-sm mb-4" style="color: var(--color-text-secondary);">
                  {{ post.excerpt }}
                </p>
                <div class="text-xs" style="color: var(--color-text-tertiary);">
                  <span>{{ formatDate(post.publishedAt) }}</span>
                </div>
              </div>
            </article>
          </div>
        </div>

        <!-- All Posts -->
        <div class="mt-8">
          <h2 class="text-2xl font-semibold mb-6">All Posts</h2>
          <div v-if="isLoading" class="text-center py-12">
            <p>Loading posts...</p>
          </div>
          <div v-else-if="blogPosts.length === 0" class="text-center py-12">
            <p style="color: var(--color-text-secondary);">No blog posts yet. Check back soon!</p>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <article
              v-for="post in blogPosts"
              :key="post.id"
              class="card hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
              @click="$router.push(`/blog/${post.slug || post.id}`)"
            >
              <div v-if="post.heroImage" class="aspect-video overflow-hidden">
                <img
                  :src="post.heroImage"
                  :alt="post.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div class="card-body">
                <h3 class="card-title mb-2">{{ post.title }}</h3>
                <p class="text-sm mb-4 line-clamp-2" style="color: var(--color-text-secondary);">
                  {{ post.excerpt }}
                </p>
                <div class="text-xs" style="color: var(--color-text-tertiary);">
                  <span>{{ formatDate(post.publishedAt) }}</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getAllBlogPosts } from '../utils/blogUtils'

const blogPosts = ref([])
const featuredPosts = ref([])
const isLoading = ref(false)

const loadPosts = async () => {
  isLoading.value = true
  try {
    // Load featured posts
    const featuredResult = await getAllBlogPosts({
      publishedOnly: true,
      featuredOnly: true,
      limitCount: 2
    })
    if (featuredResult.success) {
      featuredPosts.value = featuredResult.data
      console.log('Loaded featured posts:', featuredPosts.value.length)
    } else {
      console.error('Error loading featured posts:', featuredResult.error)
    }

    // Load all posts (excluding featured ones)
    const allResult = await getAllBlogPosts({
      publishedOnly: true,
      featuredOnly: false
    })
    if (allResult.success) {
      console.log('Loaded all posts:', allResult.data.length)
      // Filter out featured posts from main list
      const featuredIds = new Set(featuredPosts.value.map(p => p.id))
      blogPosts.value = allResult.data.filter(p => !featuredIds.has(p.id))
      console.log('Blog posts after filtering:', blogPosts.value.length)
    } else {
      console.error('Error loading all posts:', allResult.error)
    }
  } catch (error) {
    console.error('Error loading blog posts:', error)
  } finally {
    isLoading.value = false
  }
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const updateMetaTags = () => {
  const title = 'Blog - PokaPal | Pokemon TCG Guides & Articles'
  const description = 'Discover guides, tips, and articles about Pokemon TCG collecting, master sets, and more on PokaPal.'
  
  document.title = title
  
  // Update or create meta tags
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
  
  updateMetaTag('description', description)
  updateMetaTag('og:title', title)
  updateMetaTag('og:description', description)
  updateMetaTag('og:type', 'website')
  updateMetaTag('twitter:card', 'summary_large_image')
}

onMounted(() => {
  loadPosts()
  updateMetaTags()
})
</script>

<style>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

