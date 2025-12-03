import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  increment
} from 'firebase/firestore'
import { db } from '../config/firebase'

const BLOG_COLLECTION = 'blogPosts'

/**
 * Generate a URL-friendly slug from a title
 */
export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-')  // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, '')  // Remove leading/trailing hyphens
}

/**
 * Check if a slug is unique
 */
export const isSlugUnique = async (slug, excludeId = null) => {
  try {
    const q = query(
      collection(db, BLOG_COLLECTION),
      where('slug', '==', slug)
    )
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) return true
    
    // If updating, exclude current document
    if (excludeId) {
      return snapshot.docs.every(doc => doc.id !== excludeId)
    }
    
    return false
  } catch (error) {
    console.error('Error checking slug uniqueness:', error)
    return false
  }
}

/**
 * Get all blog posts (with optional filters)
 */
export const getAllBlogPosts = async (options = {}) => {
  try {
    const {
      publishedOnly = true,
      featuredOnly = false,
      limitCount = null,
      orderByField = 'createdAt',
      orderDirection = 'desc'
    } = options
    
    let q = query(collection(db, BLOG_COLLECTION))
    
    if (publishedOnly) {
      q = query(q, where('published', '==', true))
    }
    
    if (featuredOnly) {
      q = query(q, where('featured', '==', true))
    }
    
    // Order by createdAt instead of publishedAt to avoid null issues
    // We'll sort by publishedAt client-side if needed
    q = query(q, orderBy(orderByField, orderDirection))
    
    if (limitCount) {
      q = query(q, limit(limitCount))
    }
    
    const snapshot = await getDocs(q)
    let posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // Sort by publishedAt if available, otherwise createdAt
    posts.sort((a, b) => {
      const dateA = a.publishedAt?.toDate ? a.publishedAt.toDate() : (a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0))
      const dateB = b.publishedAt?.toDate ? b.publishedAt.toDate() : (b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0))
      return orderDirection === 'desc' ? dateB - dateA : dateA - dateB
    })
    
    return { success: true, data: posts }
  } catch (error) {
    console.error('Error getting blog posts:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get a single blog post by ID or slug
 */
export const getBlogPost = async (idOrSlug) => {
  try {
    // Try as document ID first
    const docRef = doc(db, BLOG_COLLECTION, idOrSlug)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { 
        success: true, 
        data: { id: docSnap.id, ...docSnap.data() } 
      }
    }
    
    // If not found, try as slug
    const q = query(
      collection(db, BLOG_COLLECTION),
      where('slug', '==', idOrSlug)
    )
    const snapshot = await getDocs(q)
    
    if (!snapshot.empty) {
      const postDoc = snapshot.docs[0]
      return { 
        success: true, 
        data: { id: postDoc.id, ...postDoc.data() } 
      }
    }
    
    return { success: false, error: 'Blog post not found' }
  } catch (error) {
    console.error('Error getting blog post:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Create a new blog post
 */
export const createBlogPost = async (postData, author) => {
  try {
    // Generate slug if not provided
    let slug = postData.slug || generateSlug(postData.title)
    
    // Ensure slug is unique
    let uniqueSlug = slug
    let counter = 1
    while (!(await isSlugUnique(uniqueSlug))) {
      uniqueSlug = `${slug}-${counter}`
      counter++
    }
    
    const newPost = {
      title: postData.title,
      slug: uniqueSlug,
      heroImage: postData.heroImage || '',
      content: postData.content || '',
      excerpt: postData.excerpt || '',
      linkedSetId: postData.linkedSetId || null,
      linkedSetName: postData.linkedSetName || null,
      linkedPokemonId: postData.linkedPokemonId || null,
      linkedPokemonName: postData.linkedPokemonName || null,
      published: postData.published || false,
      publishedAt: postData.published ? serverTimestamp() : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      author: {
        userId: author.uid,
        displayName: author.displayName || author.email,
        email: author.email
      },
      metaTitle: postData.metaTitle || null,
      metaDescription: postData.metaDescription || postData.excerpt || null,
      keywords: postData.keywords || [],
      views: 0,
      featured: postData.featured || false
    }
    
    const docRef = await addDoc(collection(db, BLOG_COLLECTION), newPost)
    
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error('Error creating blog post:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Update a blog post
 */
export const updateBlogPost = async (postId, updates) => {
  try {
    const postRef = doc(db, BLOG_COLLECTION, postId)
    
    // Handle slug changes - only check uniqueness if slug is actually changing
    if (updates.slug) {
      const currentPost = await getDoc(postRef)
      if (currentPost.exists()) {
        const currentData = currentPost.data()
        // Only check uniqueness if slug is different from current slug
        if (updates.slug !== currentData.slug) {
          const isUnique = await isSlugUnique(updates.slug, postId)
          if (!isUnique) {
            return { success: false, error: 'Slug already exists' }
          }
        }
      }
    }
    
    // If publishing for the first time, set publishedAt
    if (updates.published === true) {
      const currentPost = await getDoc(postRef)
      if (currentPost.exists() && !currentPost.data().publishedAt) {
        updates.publishedAt = serverTimestamp()
      }
    }
    
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    }
    
    await updateDoc(postRef, updateData)
    
    return { success: true }
  } catch (error) {
    console.error('Error updating blog post:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Delete a blog post
 */
export const deleteBlogPost = async (postId) => {
  try {
    await deleteDoc(doc(db, BLOG_COLLECTION, postId))
    return { success: true }
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Increment view count
 */
export const incrementBlogViews = async (postId) => {
  try {
    const postRef = doc(db, BLOG_COLLECTION, postId)
    await updateDoc(postRef, {
      views: increment(1)
    })
    return { success: true }
  } catch (error) {
    console.error('Error incrementing views:', error)
    return { success: false, error: error.message }
  }
}

