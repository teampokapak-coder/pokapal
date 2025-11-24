// Sprite URL Validator and Cleanup Utilities
// Tests sprite URLs to ensure they're valid before storing

/**
 * Test if a sprite URL is accessible
 * Uses a proxy approach to avoid CORS issues
 */
export const testSpriteUrl = async (url) => {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'Invalid URL' }
  }

  try {
    // Use a simple image load test
    // Note: This works client-side but may have CORS limitations
    // For production, consider a server-side validation endpoint
    
    const img = new Image()
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({ valid: false, error: 'Timeout' })
      }, 5000) // 5 second timeout
      
      img.onload = () => {
        clearTimeout(timeout)
        resolve({ valid: true, width: img.width, height: img.height })
      }
      
      img.onerror = () => {
        clearTimeout(timeout)
        resolve({ valid: false, error: 'Failed to load image' })
      }
      
      img.src = url
    })
  } catch (error) {
    return { valid: false, error: error.message }
  }
}

/**
 * Test multiple sprite URLs and return results
 */
export const testSpriteUrls = async (urls, maxConcurrent = 5) => {
  const results = {}
  const urlArray = Array.isArray(urls) ? urls : Object.values(urls).filter(Boolean)
  
  // Process in batches to avoid overwhelming the browser
  for (let i = 0; i < urlArray.length; i += maxConcurrent) {
    const batch = urlArray.slice(i, i + maxConcurrent)
    const batchResults = await Promise.all(
      batch.map(async (url) => ({
        url,
        ...(await testSpriteUrl(url))
      }))
    )
    
    batchResults.forEach(result => {
      results[result.url] = result
    })
    
    // Small delay between batches
    if (i + maxConcurrent < urlArray.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  return results
}

/**
 * Validate sprite URL format without testing
 * Checks if URL matches expected patterns
 */
export const validateSpriteUrlFormat = (url, source) => {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is not a string' }
  }

  const patterns = {
    pokesprite: /^https:\/\/cdn\.jsdelivr\.net\/gh\/msikma\/pokesprite@master\/pokemon-gen8\/.+\.png$/,
    pokemondb: /^https:\/\/img\.pokemondb\.net\/sprites\/.+\/.+\/.+\.png$/,
    pokeapi: /^https:\/\/raw\.githubusercontent\.com\/PokeAPI\/sprites\/master\/sprites\/pokemon\/.+/
  }

  if (source && patterns[source]) {
    const matches = url.match(patterns[source])
    return { valid: !!matches, error: matches ? null : `URL doesn't match ${source} pattern` }
  }

  // Check against all patterns
  for (const [src, pattern] of Object.entries(patterns)) {
    if (pattern.test(url)) {
      return { valid: true, detectedSource: src }
    }
  }

  return { valid: false, error: "URL doesn't match any known sprite source pattern" }
}

/**
 * Get recommended generation based on Pokemon's national dex number
 * Newer Pokemon should use newer generations
 */
export const getRecommendedGeneration = (nationalDexNumber) => {
  if (!nationalDexNumber || typeof nationalDexNumber !== 'number') {
    return 'sword-shield' // Default fallback
  }

  // Generation 9 (Scarlet & Violet): 906-1025
  if (nationalDexNumber >= 906) {
    return 'scarlet-violet'
  }
  
  // Generation 8 (Sword & Shield): 810-905
  if (nationalDexNumber >= 810) {
    return 'sword-shield'
  }
  
  // Generation 7 (Sun & Moon): 722-809
  if (nationalDexNumber >= 722) {
    return 'ultra-sun-ultra-moon'
  }
  
  // Generation 6 (X & Y): 650-721
  if (nationalDexNumber >= 650) {
    return 'x-y'
  }
  
  // Generation 5 (Black & White): 494-649
  if (nationalDexNumber >= 494) {
    return 'black-white'
  }
  
  // Generation 4 (Diamond & Pearl): 387-493
  if (nationalDexNumber >= 387) {
    return 'diamond-pearl'
  }
  
  // Older generations - use diamond-pearl as it has good coverage
  return 'diamond-pearl'
}

/**
 * Clean up sprite URLs - remove invalid or broken URLs
 */
export const cleanSpriteUrls = (spriteUrls) => {
  if (!spriteUrls || typeof spriteUrls !== 'object') {
    return null
  }

  const cleaned = {}
  
  // Keep source and generation metadata
  if (spriteUrls.source) cleaned.source = spriteUrls.source
  if (spriteUrls.generation) cleaned.generation = spriteUrls.generation
  if (spriteUrls.nationalDexNumber) cleaned.nationalDexNumber = spriteUrls.nationalDexNumber
  if (spriteUrls.pokemonName) cleaned.pokemonName = spriteUrls.pokemonName

  // Validate and keep only valid URLs
  for (const [key, value] of Object.entries(spriteUrls)) {
    if (typeof value === 'string' && value.startsWith('http')) {
      const validation = validateSpriteUrlFormat(value, spriteUrls.source)
      if (validation.valid) {
        cleaned[key] = value
      }
    } else if (typeof value !== 'object' && key !== 'source' && key !== 'generation') {
      // Keep non-object, non-metadata fields
      cleaned[key] = value
    }
  }

  return cleaned
}

