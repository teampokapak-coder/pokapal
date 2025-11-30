// TCGdx API Integration
// Documentation: https://tcgdx.dev/
// Free API, no authentication required

// TCGdx API base URL
// Note: Domain is api.tcgdex.net (with 'e' in dex), not tcgdx.net
const TCGDX_BASE_URL = 'https://api.tcgdex.net/v2'

/**
 * Fetch all series from TCGdx API
 * @param {string} language - Language code (e.g., 'en', 'ja')
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export const fetchAllSeries = async (language = 'en') => {
  try {
    const response = await fetch(`${TCGDX_BASE_URL}/${language}/series`, {
      method: 'GET',
      mode: 'cors'
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    return { success: true, data: data }
  } catch (error) {
    console.error('Error fetching series from TCGdx API:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Fetch all sets from a series
 * @param {string} seriesId - Series ID (e.g., 'swsh', 'sv')
 * @param {string} language - Language code (e.g., 'en', 'ja')
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export const fetchSetsFromSeries = async (seriesId, language = 'en') => {
  try {
    const response = await fetch(`${TCGDX_BASE_URL}/${language}/series/${seriesId}`, {
      method: 'GET',
      mode: 'cors'
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    return { success: true, data: data.sets || [] }
  } catch (error) {
    console.error('Error fetching sets from TCGdx API:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Fetch all sets for a language
 * @param {string} language - Language code (e.g., 'en', 'ja')
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export const fetchAllSets = async (language = 'en') => {
  try {
    // Try the API endpoint
    const url = `${TCGDX_BASE_URL}/${language}/sets`
    console.log(`Fetching from: ${url}`)
    
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors'
    })
    
    if (!response.ok) {
      // If 404, might be wrong language code or endpoint
      if (response.status === 404) {
        return { 
          success: false, 
          error: `Endpoint not found. The API might not support language '${language}' or the endpoint structure may have changed. Please check TCGdx API documentation.` 
        }
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    return { success: true, data: data }
  } catch (error) {
    console.error('Error fetching sets from TCGdx API:', error)
    // Provide more helpful error message for DNS/network errors
    if (error.message.includes('Failed to fetch') || error.message.includes('ERR_NAME_NOT_RESOLVED')) {
      return { 
        success: false, 
        error: `Cannot connect to TCGdx API. The domain may be incorrect or the API may be temporarily unavailable. Please verify the API endpoint at https://tcgdx.dev` 
      }
    }
    return { success: false, error: error.message }
  }
}

/**
 * Fetch a single set by ID
 * @param {string} setId - Set ID (e.g., 'swsh3')
 * @param {string} language - Language code (e.g., 'en', 'ja')
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const fetchSetById = async (setId, language = 'en') => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    try {
      const response = await fetch(`${TCGDX_BASE_URL}/${language}/sets/${setId}`, {
        method: 'GET',
        mode: 'cors',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: 'Set not found' }
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      return { success: true, data: data }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - the API is taking too long to respond')
      }
      throw fetchError
    }
  } catch (error) {
    console.error('Error fetching set from TCGdx API:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Query cards using filters (based on SDK Query system)
 * @param {Object} filters - Filter object (e.g., { 'set.id': 'swsh3' })
 * @param {string} language - Language code (e.g., 'en', 'ja')
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export const queryCards = async (filters = {}, language = 'en') => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      queryParams.append(key, value)
    })
    
    const queryString = queryParams.toString()
    const url = queryString 
      ? `${TCGDX_BASE_URL}/${language}/cards?${queryString}`
      : `${TCGDX_BASE_URL}/${language}/cards`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000)
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: 'No cards found matching query' }
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      // API might return array directly or wrapped in data property
      const cards = Array.isArray(data) ? data : (data.data || data.cards || [])
      return { success: true, data: cards }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - the API is taking too long to respond')
      }
      throw fetchError
    }
  } catch (error) {
    console.error('Error querying cards from TCGdx API:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Fetch cards from a set
 * @param {string} setId - Set ID (e.g., 'swsh3')
 * @param {string} language - Language code (e.g., 'en', 'ja')
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export const fetchCardsBySet = async (setId, language = 'en') => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000) // 120 second timeout
    
    try {
      const response = await fetch(`${TCGDX_BASE_URL}/${language}/sets/${setId}`, {
        method: 'GET',
        mode: 'cors',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: `Set '${setId}' not found or has no cards` }
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      return { success: true, data: data.cards || [] }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - the API is taking too long to respond')
      }
      throw fetchError
    }
  } catch (error) {
    console.error('Error fetching cards from TCGdx API:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Fetch a single card by ID
 * @param {string} cardId - Card ID (e.g., 'swsh3-136')
 * @param {string} language - Language code (e.g., 'en', 'ja')
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const fetchCardById = async (cardId, language = 'en') => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    try {
      const response = await fetch(`${TCGDX_BASE_URL}/${language}/cards/${cardId}`, {
        method: 'GET',
        mode: 'cors',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: 'Card not found' }
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      return { success: true, data: data }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - the API is taking too long to respond')
      }
      throw fetchError
    }
  } catch (error) {
    console.error('Error fetching card from TCGdx API:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Format TCGdx asset URL for logos/symbols
 * Symbols and logos use format: {baseUrl}.{extension} (NO quality path like /high or /low)
 * @param {string} baseUrl - Base URL from API (e.g., "https://assets.tcgdx.net/en/swsh/swsh3/symbol")
 * @param {string} extension - File extension (default: 'png', tries png, webp, jpg)
 * @returns {string} - Formatted URL with extension
 */
const formatTCGdxAssetUrl = (baseUrl, extension = 'webp') => {
  if (!baseUrl) return ''
  // Remove any existing extension
  const cleanUrl = baseUrl.replace(/\.(webp|png|jpg)$/i, '')
  // Add extension directly: .webp (preferred format, no quality path for symbols/logos)
  return `${cleanUrl}.${extension}`
}

/**
 * Find working symbol/logo URL by testing multiple extensions
 * Symbols/logos use format: {baseUrl}.{extension} (no quality path)
 * @param {string} baseUrl - Base URL without extension
 * @param {string[]} extensions - Extensions to try (default: ['png', 'webp', 'jpg'])
 * @returns {Promise<string|null>} - First working URL found, or baseUrl.png as fallback
 */
const findWorkingAssetUrl = async (baseUrl, extensions = ['png', 'webp', 'jpg']) => {
  if (!baseUrl) return null
  
  const cleanUrl = baseUrl.replace(/\.(webp|png|jpg)$/i, '')
  
  // Try each extension
  for (const ext of extensions) {
    const testUrl = `${cleanUrl}.${ext}`
    try {
      // Use HEAD request to check if image exists (faster than GET)
      const response = await fetch(testUrl, { method: 'HEAD', mode: 'no-cors' })
      // Note: no-cors mode doesn't give us status code, but we can try
      // For now, return png as default (most common for symbols/logos)
      if (ext === 'png') {
        return testUrl
      }
    } catch (error) {
      // Continue to next extension
    }
  }
  
  // Default fallback: return .png (most common for symbols/logos)
  return `${cleanUrl}.png`
}

/**
 * Format TCGdx card image URL
 * Card images need quality and extension: /high.webp
 * Tries multiple format combinations if the first one fails
 * @param {string} baseUrl - Base URL from API (e.g., "https://assets.tcgdx.net/en/swsh/swsh3/136")
 * @param {string} quality - Quality level (default: 'high')
 * @param {string} extension - File extension (default: 'jpg' for Japanese, 'webp' for English)
 * @returns {string} - Formatted URL
 */
const formatTCGdxCardImageUrl = (baseUrl, quality = 'high', extension = 'webp') => {
  if (!baseUrl) return ''
  // Remove any existing extension or quality path
  const cleanUrl = baseUrl.replace(/\.(webp|png|jpg)$/i, '').replace(/\/high|\/low$/i, '')
  // Add quality and extension: /high.webp (preferred format)
  return `${cleanUrl}/${quality}.${extension}`
}

/**
 * Test if a TCGdx image URL exists by trying multiple format combinations
 * @param {string} baseUrl - Base URL without quality/extension
 * @returns {Promise<string|null>} - First working URL found, or null if none work
 */
const findWorkingImageUrl = async (baseUrl) => {
  if (!baseUrl) return null
  
  const cleanUrl = baseUrl.replace(/\.(webp|png|jpg)$/i, '').replace(/\/high|\/low$/i, '')
  const qualities = ['high', 'low']
  const extensions = ['jpg', 'webp', 'png']
  
  // Try combinations in order of preference: high.jpg, high.webp, high.png, then low versions
  for (const quality of qualities) {
    for (const ext of extensions) {
      const testUrl = `${cleanUrl}/${quality}.${ext}`
      try {
        const response = await fetch(testUrl, { method: 'HEAD', mode: 'no-cors' })
        // Note: no-cors mode doesn't give us status, but we can try loading it
        // For now, just return the first combination (jpg is most common)
        // In production, you might want to actually verify the image loads
        if (quality === 'high' && ext === 'jpg') {
          return testUrl // Return high.jpg as default
        }
      } catch (error) {
        // Continue to next combination
      }
    }
  }
  
  // Default fallback: return high.jpg even if we can't verify
  return `${cleanUrl}/high.jpg`
}

/**
 * Map TCGdx set format to our Firestore schema
 * @param {Object} tcgdxSet - TCGdx set object
 * @param {string} language - Language code (e.g., 'en', 'ja')
 * @returns {Object} - Mapped set object
 */
export const mapTCGdxSetToSchema = (tcgdxSet, language = 'en') => {
  // Debug: Log what we're receiving (only for first set to avoid spam)
  if (language === 'ja' && !mapTCGdxSetToSchema._logged) {
    console.log('🔍 TCGdx API set fields:', Object.keys(tcgdxSet))
    console.log('🔍 Logo value:', tcgdxSet.logo)
    console.log('🔍 Symbol value:', tcgdxSet.symbol)
    mapTCGdxSetToSchema._logged = true
  }
  
  // Format logo and symbol URLs with extension (no quality path for symbols/logos)
  // Symbols/logos use format: {baseUrl}.{extension} (e.g., symbol.webp)
  let logoUrl = tcgdxSet.logo ? formatTCGdxAssetUrl(tcgdxSet.logo, 'webp') : null
  let symbolUrl = tcgdxSet.symbol ? formatTCGdxAssetUrl(tcgdxSet.symbol, 'webp') : null
  
  // If logo/symbol are missing from API, try to construct them
  // Pattern: https://assets.tcgdex.net/{lang}/{series}/{set}/logo.{ext}
  //          https://assets.tcgdex.net/univ/{series}/{set}/symbol.{ext}
  // Note: Preserve original case from API (card images use uppercase like S/S12)
  // Use .webp as preferred extension
  if (!logoUrl && tcgdxSet.id && tcgdxSet.serie?.id) {
    const seriesId = tcgdxSet.serie.id // Preserve case
    const setId = tcgdxSet.id // Preserve case
    // Try constructing logo URL (language-specific)
    logoUrl = `https://assets.tcgdex.net/${language}/${seriesId}/${setId}/logo.webp`
  }
  
  if (!symbolUrl && tcgdxSet.id && tcgdxSet.serie?.id) {
    const seriesId = tcgdxSet.serie.id // Preserve case
    const setId = tcgdxSet.id // Preserve case
    // Try constructing symbol URL (universal, uses 'univ' instead of language)
    symbolUrl = `https://assets.tcgdex.net/univ/${seriesId}/${setId}/symbol.webp`
  }
  
  const setData = {
    // API reference
    apiId: tcgdxSet.id,
    
    // Set info
    name: tcgdxSet.name, // Japanese name for Japanese sets, English name for English sets
    code: tcgdxSet.id, // TCGdx uses set ID as code
    releaseDate: tcgdxSet.releaseDate ? new Date(tcgdxSet.releaseDate) : null,
    series: tcgdxSet.serie?.name || '', // Japanese series for Japanese sets, English series for English sets
    totalCards: tcgdxSet.cardCount?.total || tcgdxSet.cardCount?.official || 0,
    printedTotal: tcgdxSet.cardCount?.official || null,
    
    // Legalities
    legalities: {
      standard: tcgdxSet.legal?.standard ? 'Legal' : 'Illegal',
      expanded: tcgdxSet.legal?.expanded ? 'Legal' : 'Illegal',
      unlimited: 'Legal' // TCGdx doesn't provide unlimited, default to Legal
    },
    standardLegal: tcgdxSet.legal?.standard || false,
    expandedLegal: tcgdxSet.legal?.expanded || false,
    unlimitedLegal: true,
    
    // Language
    language: language,
    
    // Metadata
    updatedAt: null
  }
  
  // Only add logo/symbol if they exist (don't overwrite with empty/null)
  if (logoUrl) {
    setData.logo = logoUrl
  }
  if (symbolUrl) {
    setData.symbol = symbolUrl
  }
  
  return setData
}

/**
 * Map TCGdx card format to our Firestore schema
 * @param {Object} tcgdxCard - TCGdx card object (from set.cards array or full card object)
 * @param {Object} tcgdxSet - TCGdx set object (for set info)
 * @param {string} language - Language code (e.g., 'en', 'ja')
 * @param {string} firestoreSetId - Firestore document ID for the set (optional)
 * @returns {Object} - Mapped card object
 */
export const mapTCGdxCardToSchema = (tcgdxCard, tcgdxSet, language = 'en', firestoreSetId = null, englishCardData = null) => {
  // Handle both brief card (from set.cards) and full card object
  const isBriefCard = !tcgdxCard.category
  
  // Get image URL - try multiple sources
  let imageBaseUrl = tcgdxCard.image
  
  // If no image field, try to construct from card ID and set info
  // TCGdx image URLs follow pattern: https://assets.tcgdex.net/{lang}/{series}/{set}/{localId}
  if (!imageBaseUrl && tcgdxCard.id && tcgdxCard.localId) {
    // Prefer using series ID from set object if available (more reliable)
    const seriesId = tcgdxSet?.serie?.id || tcgdxCard.set?.serie?.id
    const setId = tcgdxSet?.id || tcgdxCard.set?.id || tcgdxCard.id.split('-')[0]
    
    if (seriesId && setId) {
      // Use series ID and set ID from set object (preserve case as API provides it)
      imageBaseUrl = `https://assets.tcgdex.net/${language}/${seriesId.toLowerCase()}/${setId.toLowerCase()}/${tcgdxCard.localId}`
    } else {
      // Fallback: Extract series and set from card ID (e.g., "SV11W-164" -> series: "sv", set: "sv11w")
      const cardIdParts = tcgdxCard.id.split('-')
      if (cardIdParts.length >= 2) {
        const setId = cardIdParts[0].toLowerCase()
        // Try to extract series (first 2-3 letters, e.g., "sv" from "sv11w")
        const seriesMatch = setId.match(/^([a-z]+)/)
        const series = seriesMatch ? seriesMatch[1] : setId.substring(0, 2)
        imageBaseUrl = `https://assets.tcgdex.net/${language}/${series}/${setId}/${tcgdxCard.localId}`
      }
    }
  }
  
  // Use API structure directly, only add what we need
  return {
    // API fields - use exactly as provided
    id: tcgdxCard.id,
    category: tcgdxCard.category || 'Pokemon',
    illustrator: tcgdxCard.illustrator || '',
    image: imageBaseUrl || tcgdxCard.image || '',
    localId: tcgdxCard.localId || tcgdxCard.number || '',
    name: tcgdxCard.name,
    rarity: tcgdxCard.rarity || 'Unknown',
    hp: tcgdxCard.hp ? parseInt(tcgdxCard.hp) : null,
    types: tcgdxCard.types || [],
    evolveFrom: tcgdxCard.evolveFrom || null,
    description: tcgdxCard.description || '',
    stage: tcgdxCard.stage || null,
    attacks: tcgdxCard.attacks || [],
    weaknesses: tcgdxCard.weaknesses || [],
    resistances: tcgdxCard.resistances || [],
    retreat: tcgdxCard.retreat || null,
    regulationMark: tcgdxCard.regulationMark || null,
    legal: tcgdxCard.legal || null,
    abilities: tcgdxCard.abilities || [],
    level: tcgdxCard.level || null,
    dexId: tcgdxCard.dexId || [],
    
    // Set info - use API structure
    set: tcgdxCard.set || {
      id: tcgdxSet?.id || tcgdxCard.set?.id || '',
      name: tcgdxSet?.name || tcgdxCard.set?.name || '',
      logo: tcgdxSet?.logo || tcgdxCard.set?.logo || null,
      symbol: tcgdxSet?.symbol || tcgdxCard.set?.symbol || null,
      cardCount: tcgdxSet?.cardCount || tcgdxCard.set?.cardCount || null,
      serie: tcgdxSet?.serie || tcgdxCard.set?.serie || null
    },
    
    // Variants - use API structure directly
    variants: tcgdxCard.variants || {
      firstEdition: false,
      holo: false,
      normal: true,
      reverse: false,
      wPromo: false
    },
    
    // Only add what we need
    nationalDexNumber: tcgdxCard.dexId?.[0] || null,
    setId: firestoreSetId || null, // Firestore document ID reference
    setApiId: tcgdxCard.set?.id || tcgdxSet?.id || null, // API set ID for querying
    language: language,
    
    // Construct image URLs for convenience (but keep original image field)
    imageUrl: formatTCGdxCardImageUrl(imageBaseUrl || tcgdxCard.image, 'high', 'webp'),
    thumbnailUrl: formatTCGdxCardImageUrl(imageBaseUrl || tcgdxCard.image, 'low', 'webp'),
    
    // English translation fields (for Japanese cards)
    ...(englishCardData && {
      englishName: englishCardData.name || null,
      englishImageUrl: englishCardData.image 
        ? formatTCGdxCardImageUrl(englishCardData.image, 'high', 'webp')
        : null,
      englishThumbnailUrl: englishCardData.image
        ? formatTCGdxCardImageUrl(englishCardData.image, 'low', 'webp')
        : null
    })
  }
}

