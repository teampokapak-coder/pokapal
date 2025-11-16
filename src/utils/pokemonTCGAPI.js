// Pokemon TCG API Integration
// Documentation: https://pokemontcg.io/

// Use proxy in dev (to avoid CORS), direct API in production
const API_BASE_URL = import.meta.env.DEV 
  ? '/api/pokemontcg' 
  : 'https://api.pokemontcg.io/v2'
const API_KEY = '34317d16-2f3e-47d5-93e3-6b631dde821f'

// Fetch all sets from Pokemon TCG API
export const fetchAllSets = async () => {
  try {
    const headers = import.meta.env.DEV 
      ? {} // Proxy adds the header
      : { 'X-Api-Key': API_KEY }
    
    const response = await fetch(`${API_BASE_URL}/sets`, {
      method: 'GET',
      headers,
      mode: 'cors'
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    return { success: true, data: data.data }
  } catch (error) {
    console.error('Error fetching sets from Pokemon TCG API:', error)
    return { success: false, error: error.message }
  }
}

// Fetch a single card by ID
// Based on Pokemon TCG API v2 documentation: https://docs.pokemontcg.io/api-reference/cards/get-a-card
export const fetchCardById = async (cardId, selectFields = null) => {
  try {
    const headers = import.meta.env.DEV 
      ? {} // Proxy adds the header
      : { 'X-Api-Key': API_KEY }
    
    // Build URL with optional select parameter
    let url = `${API_BASE_URL}/cards/${cardId}`
    if (selectFields && Array.isArray(selectFields)) {
      url += `?select=${selectFields.join(',')}`
    }
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
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
      // Single card endpoint returns { data: { ...card } }
      return { 
        success: true, 
        data: data.data
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - the API is taking too long to respond')
      }
      throw fetchError
    }
  } catch (error) {
    console.error('Error fetching card from Pokemon TCG API:', error)
    return { success: false, error: error.message }
  }
}

// Fetch cards from a specific set
export const fetchCardsBySet = async (setId, page = 1, pageSize = 50) => {
  try {
    const headers = import.meta.env.DEV 
      ? {} // Proxy adds the header
      : { 'X-Api-Key': API_KEY }
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 90000) // 90 second timeout per request (API can be slow)
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/cards?q=set.id:${setId}&page=${page}&pageSize=${pageSize}`,
        {
          method: 'GET',
          headers,
          mode: 'cors',
          signal: controller.signal
        }
      )
      
      clearTimeout(timeoutId)
    
      if (!response.ok) {
        // 404 could mean page doesn't exist OR set doesn't exist
        if (response.status === 404) {
          // If it's page 1, it might be the set doesn't exist
          if (page === 1) {
            return { success: false, error: `Set '${setId}' not found or has no cards` }
          }
          return { success: false, error: 'NO_MORE_PAGES' }
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      return { 
        success: true, 
        data: data.data,
        totalCount: data.totalCount,
        page: data.page,
        pageSize: data.pageSize,
        count: data.count
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        // Don't log as error - this is expected with slow API responses
        throw new Error('Request timeout - retrying...')
      }
      throw fetchError
    }
  } catch (error) {
    // Only log as error if it's not a timeout (timeouts will be retried)
    if (!error.message.includes('timeout')) {
      console.error('Error fetching cards from Pokemon TCG API:', error)
    }
    return { success: false, error: error.message }
  }
}

// Fetch all cards from a set (handles pagination)
// Based on Pokemon TCG API v2 documentation: https://docs.pokemontcg.io/api-reference/cards/search-cards
export const fetchAllCardsBySet = async (setId, retries = 3) => {
  const allCards = []
  let page = 1
  const pageSize = 50 // Using smaller page size to avoid timeouts (API max is 250)
  let totalCount = null // Will be set from first response
  
  while (true) {
    let result
    let attempt = 0
    let isNoMorePages = false
    
    // Retry logic for failed requests (but not for 404s)
    while (attempt < retries) {
      result = await fetchCardsBySet(setId, page, pageSize)
      
      if (result.success) {
        break
      }
      
      // 404 on page 1 means set doesn't exist - return error immediately
      if (result.error && page === 1 && result.error.includes('not found')) {
        return result // Return error immediately, don't retry
      }
      
      // 404 on later pages means no more pages - don't retry
      if (result.error && result.error.includes('NO_MORE_PAGES')) {
        isNoMorePages = true
        break
      }
      
      attempt++
      if (attempt < retries) {
        // Log retry as info, not error - this is normal for slow API
        console.log(`⏳ API slow, retrying page ${page} (${attempt}/${retries})...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)) // Exponential backoff
      }
    }
    
    // If we got a 404 on a later page, we're done
    if (isNoMorePages) {
      console.log(`Page ${page} doesn't exist (404) - no more pages`)
      break
    }
    
    if (!result.success) {
      // If it's page 1 and we got an error, it's likely the set doesn't exist
      if (page === 1) {
        return { 
          success: false, 
          error: `Set '${setId}' not found or has no cards. ${result.error}` 
        }
      }
      return result
    }
    
    // Store totalCount from first successful response
    if (totalCount === null && result.totalCount) {
      totalCount = result.totalCount
      console.log(`Found ${totalCount} total cards in set ${setId}`)
    }
    
    // Add cards from this page
    if (result.data && result.data.length > 0) {
      allCards.push(...result.data)
      console.log(`Page ${page}: Fetched ${result.data.length} cards (${allCards.length}/${totalCount || '?'} total)`)
    }
    
    // Check if there are more pages using API response metadata
    // According to API docs: 
    // - count = number of items in current page response
    // - totalCount = total number of items matching the query
    // - pageSize = requested page size
    
    // Stop conditions (in order of reliability):
    // 1. No cards returned in this page
    if (!result.data || result.data.length === 0) {
      console.log(`No cards returned for page ${page} - stopping`)
      break
    }
    
    // 2. We have all cards according to totalCount
    if (totalCount && allCards.length >= totalCount) {
      console.log(`Fetched all ${totalCount} cards`)
      break
    }
    
    // 3. count < pageSize means we got fewer than requested (last page)
    if (result.count < result.pageSize) {
      console.log(`Got ${result.count} cards (less than pageSize ${result.pageSize}) - last page`)
      break
    }
    
    // 4. If count === 0, no more items
    if (result.count === 0) {
      console.log(`Count is 0 - no more cards`)
      break
    }
    
    // More pages available, continue to next page
    page++
    await new Promise(resolve => setTimeout(resolve, 200)) // Small delay between pages
  }
  
  console.log(`Completed fetching cards: ${allCards.length} total cards from set ${setId}`)
  return { success: true, data: allCards }
}

// Search cards with query
export const searchCards = async (query, page = 1, pageSize = 100) => {
  try {
    const headers = import.meta.env.DEV 
      ? {} // Proxy adds the header
      : { 'X-Api-Key': API_KEY }
    
    const response = await fetch(
      `${API_BASE_URL}/cards?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`,
      {
        method: 'GET',
        headers,
        mode: 'cors'
      }
    )
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    return { 
      success: true, 
      data: data.data,
      totalCount: data.totalCount,
      page: data.page,
      pageSize: data.pageSize,
      count: data.count
    }
  } catch (error) {
    console.error('Error searching cards:', error)
    return { success: false, error: error.message }
  }
}

// Map Pokemon TCG API card to our schema
// Based on Pokemon TCG API v2 documentation: https://docs.pokemontcg.io/api-reference/cards/card-object
export const mapAPICardToSchema = (apiCard, firestoreSetId = null) => {
  return {
    // API reference
    apiId: apiCard.id,
    apiSetId: apiCard.set.id,
    
    // Firestore reference (will be added by seeder if provided)
    ...(firestoreSetId && { setId: firestoreSetId }),
    
    // Basic info
    name: apiCard.name,
    nationalDexNumber: apiCard.nationalPokedexNumbers?.[0] || null,
    nationalPokedexNumbers: apiCard.nationalPokedexNumbers || [], // Store all dex numbers
    
    // Set info
    set: apiCard.set.name,
    setCode: apiCard.set.ptcgoCode || apiCard.set.id,
    setNumber: apiCard.number,
    releaseYear: new Date(apiCard.set.releaseDate).getFullYear(),
    series: apiCard.set.series,
    
    // Card details
    rarity: apiCard.rarity || 'Unknown',
    cardType: apiCard.supertype || 'Pokemon',
    supertype: apiCard.supertype, // Store original supertype
    subtypes: apiCard.subtypes || [], // Store all subtypes
    stage: apiCard.subtypes?.[0] || (apiCard.supertype === 'Pokemon' ? 'Basic' : null), // First subtype as stage for backward compatibility
    
    // Pokemon-specific
    types: apiCard.types || [],
    level: apiCard.level || null, // Level for older cards
    hp: apiCard.hp ? parseInt(apiCard.hp) : null,
    evolvesFrom: apiCard.evolvesFrom || null,
    evolvesTo: apiCard.evolvesTo || [],
    
    // Rules and traits
    rules: apiCard.rules || [],
    ancientTrait: apiCard.ancientTrait || null,
    regulationMark: apiCard.regulationMark || null,
    
    // Variants (from API data)
    isHolo: apiCard.rarity?.toLowerCase().includes('holo') || false,
    isReverseHolo: false, // Not available in API (would need to check price data)
    isFirstEdition: apiCard.set.printedTotal ? false : null, // Not directly available
    isShadowless: false, // Not available in API
    isFullArt: apiCard.rarity?.toLowerCase().includes('full art') || false,
    isRainbow: apiCard.rarity?.toLowerCase().includes('rainbow') || false,
    
    // Metadata
    artist: apiCard.artist || '',
    imageUrl: apiCard.images?.large || apiCard.images?.small || '',
    thumbnailUrl: apiCard.images?.small || apiCard.images?.large || '',
    
    // Card mechanics
    abilities: apiCard.abilities || [],
    attacks: apiCard.attacks || [],
    weaknesses: apiCard.weaknesses || [],
    resistances: apiCard.resistances || [],
    retreatCost: apiCard.retreatCost || null,
    convertedRetreatCost: apiCard.convertedRetreatCost || null,
    flavorText: apiCard.flavorText || '',
    
    // Legalities and pricing
    legalities: apiCard.legalities || {},
    tcgplayerPrices: apiCard.tcgplayer || null,
    cardmarketPrices: apiCard.cardmarket || null
  }
}

// Fetch a single set by ID
// Based on Pokemon TCG API v2 documentation: https://docs.pokemontcg.io/api-reference/sets/get-a-set
export const fetchSetById = async (setId, selectFields = null) => {
  try {
    const headers = import.meta.env.DEV 
      ? {} // Proxy adds the header
      : { 'X-Api-Key': API_KEY }
    
    // Build URL with optional select parameter
    let url = `${API_BASE_URL}/sets/${setId}`
    if (selectFields && Array.isArray(selectFields)) {
      url += `?select=${selectFields.join(',')}`
    }
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout (set verification is optional)
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
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
      // Single set endpoint returns { data: { ...set } }
      return { 
        success: true, 
        data: data.data
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        // Don't log as error - verification is optional
        throw new Error('Request timeout')
      }
      throw fetchError
    }
  } catch (error) {
    // Only log as error if it's not a timeout (verification is optional)
    if (!error.message.includes('timeout')) {
      console.error('Error fetching set from Pokemon TCG API:', error)
    }
    return { success: false, error: error.message }
  }
}

// Fetch all types from Pokemon TCG API
// Based on Pokemon TCG API v2 documentation: https://docs.pokemontcg.io/api-reference/types/get-types
export const fetchTypes = async (retries = 2) => {
  try {
    const headers = import.meta.env.DEV 
      ? {} // Proxy adds the header
      : { 'X-Api-Key': API_KEY }
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    const response = await fetch(`${API_BASE_URL}/types`, {
      method: 'GET',
      headers,
      mode: 'cors',
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    return { success: true, data: data.data }
  } catch (error) {
    if (error.name === 'AbortError') {
      if (retries > 0) {
        console.log(`Types API timeout, retrying... (${retries} attempts left)`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return fetchTypes(retries - 1)
      }
      return { success: false, error: 'Request timeout - the API is taking too long to respond' }
    }
    console.error('Error fetching types from Pokemon TCG API:', error)
    return { success: false, error: error.message }
  }
}

// Fetch all subtypes from Pokemon TCG API
// Based on Pokemon TCG API v2 documentation: https://docs.pokemontcg.io/api-reference/subtypes/get-subtypes
export const fetchSubtypes = async (retries = 2) => {
  try {
    const headers = import.meta.env.DEV 
      ? {} // Proxy adds the header
      : { 'X-Api-Key': API_KEY }
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    const response = await fetch(`${API_BASE_URL}/subtypes`, {
      method: 'GET',
      headers,
      mode: 'cors',
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    return { success: true, data: data.data }
  } catch (error) {
    if (error.name === 'AbortError') {
      if (retries > 0) {
        console.log(`Subtypes API timeout, retrying... (${retries} attempts left)`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return fetchSubtypes(retries - 1)
      }
      return { success: false, error: 'Request timeout - the API is taking too long to respond' }
    }
    console.error('Error fetching subtypes from Pokemon TCG API:', error)
    return { success: false, error: error.message }
  }
}

// Fetch all supertypes from Pokemon TCG API
// Based on Pokemon TCG API v2 documentation: https://docs.pokemontcg.io/api-reference/supertypes/get-supertypes
export const fetchSupertypes = async (retries = 2) => {
  try {
    const headers = import.meta.env.DEV 
      ? {} // Proxy adds the header
      : { 'X-Api-Key': API_KEY }
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    const response = await fetch(`${API_BASE_URL}/supertypes`, {
      method: 'GET',
      headers,
      mode: 'cors',
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    return { success: true, data: data.data }
  } catch (error) {
    if (error.name === 'AbortError') {
      if (retries > 0) {
        console.log(`Supertypes API timeout, retrying... (${retries} attempts left)`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return fetchSupertypes(retries - 1)
      }
      return { success: false, error: 'Request timeout - the API is taking too long to respond' }
    }
    console.error('Error fetching supertypes from Pokemon TCG API:', error)
    return { success: false, error: error.message }
  }
}

// Fetch all rarities from Pokemon TCG API
// Based on Pokemon TCG API v2 documentation: https://docs.pokemontcg.io/api-reference/rarities/get-rarities
export const fetchRarities = async (retries = 2) => {
  try {
    const headers = import.meta.env.DEV 
      ? {} // Proxy adds the header
      : { 'X-Api-Key': API_KEY }
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    const response = await fetch(`${API_BASE_URL}/rarities`, {
      method: 'GET',
      headers,
      mode: 'cors',
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    return { success: true, data: data.data }
  } catch (error) {
    if (error.name === 'AbortError') {
      if (retries > 0) {
        console.log(`Rarities API timeout, retrying... (${retries} attempts left)`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return fetchRarities(retries - 1)
      }
      return { success: false, error: 'Request timeout - the API is taking too long to respond' }
    }
    console.error('Error fetching rarities from Pokemon TCG API:', error)
    return { success: false, error: error.message }
  }
}

// Map Pokemon TCG API set to our schema
// Based on Pokemon TCG API v2 documentation: https://docs.pokemontcg.io/api-reference/sets/set-object
export const mapAPISetToSchema = (apiSet) => {
  return {
    // API reference
    apiId: apiSet.id,
    
    // Set info
    name: apiSet.name,
    code: apiSet.ptcgoCode || apiSet.id,
    releaseDate: new Date(apiSet.releaseDate),
    series: apiSet.series,
    totalCards: apiSet.total || 0,
    printedTotal: apiSet.printedTotal || null,
    logo: apiSet.images?.logo || apiSet.images?.symbol || '',
    symbol: apiSet.images?.symbol || '',
    
    // Legalities
    legalities: apiSet.legalities || {},
    standardLegal: apiSet.legalities?.standard === 'Legal' || false,
    expandedLegal: apiSet.legalities?.expanded === 'Legal' || false,
    unlimitedLegal: apiSet.legalities?.unlimited === 'Legal' || false,
    
    // Metadata
    updatedAt: apiSet.updatedAt || null
  }
}

