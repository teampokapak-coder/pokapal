/**
 * Card Count Cache Service
 * Caches card counts by nationalDexNumber to avoid repeated queries across pages
 */

import { getCardCountsByDexNumber } from './firebasePokemon'

// Cache storage
let cardCountsCache = null
let cacheTimestamp = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Get card counts by dex number (with caching)
 * @param {string} language - Language code ('en', 'ja', or 'all')
 * @param {boolean} forceRefresh - Force refresh cache
 * @returns {Promise<Map<number, number>>} Map of nationalDexNumber -> count
 */
export const getCachedCardCounts = async (language = 'all', forceRefresh = false) => {
  const now = Date.now()
  
  // Return cached data if still valid and not forcing refresh
  if (!forceRefresh && cardCountsCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return cardCountsCache
  }
  
  // Fetch fresh data
  const result = await getCardCountsByDexNumber(language)
  
  if (result.success) {
    cardCountsCache = result.data
    cacheTimestamp = now
    return cardCountsCache
  } else {
    // If fetch fails, return cached data if available (even if expired)
    if (cardCountsCache) {
      console.warn('Failed to refresh card counts, using stale cache')
      return cardCountsCache
    }
    return new Map()
  }
}

/**
 * Clear the cache (useful when cards are added/removed)
 */
export const clearCardCountCache = () => {
  cardCountsCache = null
  cacheTimestamp = null
}

/**
 * Get cache age in seconds
 */
export const getCacheAge = () => {
  if (!cacheTimestamp) return null
  return Math.floor((Date.now() - cacheTimestamp) / 1000)
}

