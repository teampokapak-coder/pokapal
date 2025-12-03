import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage'
import { storage } from '../config/firebase'

/**
 * Upload an image to Firebase Storage
 * @param {File} file - The image file to upload
 * @param {string} folder - Folder path in storage (e.g., 'blog-hero-images')
 * @param {string} fileName - Optional custom file name (defaults to timestamp)
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export const uploadImage = async (file, folder = 'uploads', fileName = null) => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'File must be an image' }
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'File size must be less than 5MB' }
    }
    
    // Generate file name if not provided - sanitize the filename
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const name = fileName || `${Date.now()}-${sanitizedName}`
    const storageRef = ref(storage, `${folder}/${name}`)
    
    console.log('Starting upload to:', `${folder}/${name}`)
    
    // Upload file with metadata
    const metadata = {
      contentType: file.type,
      cacheControl: 'public, max-age=31536000'
    }
    
    // Upload and wait for completion
    const uploadResult = await uploadBytes(storageRef, file, metadata)
    console.log('Upload completed:', uploadResult)
    
    // Verify upload succeeded before getting URL
    if (!uploadResult) {
      return { success: false, error: 'Upload completed but no result returned' }
    }
    
    // Get download URL with retry logic - sometimes the file needs a moment to be available
    let url = null
    let retries = 3
    while (retries > 0 && !url) {
      try {
        // Add a delay to ensure the file is available
        await new Promise(resolve => setTimeout(resolve, 200))
        url = await getDownloadURL(storageRef)
        console.log('Download URL obtained:', url)
      } catch (error) {
        retries--
        if (retries === 0) {
          // If this is object-not-found but upload succeeded, it might just need more time
          // Don't throw error, let it fail silently and the user can retry
          if (error.code === 'storage/object-not-found') {
            console.warn('File uploaded but URL not immediately available. It may appear shortly.')
            // Return success anyway - the file is uploaded, URL will be available soon
            return { success: true, url: null, warning: 'Upload succeeded but URL may take a moment to be available' }
          }
          throw error
        }
        console.log(`Retrying getDownloadURL (${retries} retries left)...`)
      }
    }
    
    return { success: true, url }
  } catch (error) {
    console.error('Error uploading image:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    
    // Provide more helpful error messages
    if (error.code === 'storage/unauthorized') {
      return { success: false, error: 'Unauthorized: Please check Firebase Storage rules and ensure you are logged in' }
    } else if (error.code === 'storage/object-not-found') {
      return { success: false, error: 'Upload failed: Object not found. Please check Firebase Storage rules allow authenticated writes.' }
    } else if (error.code === 'storage/canceled') {
      return { success: false, error: 'Upload was canceled' }
    } else if (error.code === 'storage/unknown') {
      return { success: false, error: 'Unknown error occurred during upload' }
    } else if (error.code === 'storage/quota-exceeded') {
      return { success: false, error: 'Storage quota exceeded. Please check your Firebase Storage limits.' }
    } else if (error.code === 'storage/unauthenticated') {
      return { success: false, error: 'Please log in to upload images' }
    }
    return { success: false, error: error.message || `Failed to upload image (${error.code || 'unknown error'})` }
  }
}

/**
 * Upload hero banner image for blog posts
 * Recommended size: 1920x800px
 */
export const uploadBlogHeroImage = async (file) => {
  return uploadImage(file, 'blog-hero-images')
}

