// PokéSprite utility functions
// PokéSprite: https://github.com/msikma/pokesprite
// Sprites are hosted on GitHub and accessible via CDN

/**
 * Normalize Pokemon name for sprite URL
 * Converts names like "Charizard" -> "charizard"
 * Handles special cases like "Nidoran♀" -> "nidoran-f", "Mr. Mime" -> "mr-mime"
 */
export const normalizeSpriteName = (name) => {
  if (!name) return ''
  
  let normalized = name.toLowerCase()
  
  // Handle special characters and forms
  normalized = normalized
    .replace(/♀/g, '-f')
    .replace(/♂/g, '-m')
    .replace(/\./g, '')
    .replace(/\s+/g, '-')
    .replace(/'/g, '')
    .replace(/:/g, '')
    .replace(/é/g, 'e')
    .replace(/[^a-z0-9-]/g, '')
  
  // Handle specific Pokemon name variations
  const nameMappings = {
    'nidoran-f': 'nidoran-f',
    'nidoran-m': 'nidoran-m',
    'mr-mime': 'mr-mime',
    'farfetchd': 'farfetchd',
    'sirfetchd': 'sirfetchd',
    'type-null': 'type-null',
    'jangmo-o': 'jangmo-o',
    'hakamo-o': 'hakamo-o',
    'kommo-o': 'kommo-o',
    'tapu-koko': 'tapu-koko',
    'tapu-lele': 'tapu-lele',
    'tapu-bulu': 'tapu-bulu',
    'tapu-fini': 'tapu-fini',
    'mime-jr': 'mime-jr',
    'ho-oh': 'ho-oh',
    'porygon-z': 'porygon-z',
    'porygon2': 'porygon-2',
    'nidoran': 'nidoran-f', // Default to female if unspecified
  }
  
  if (nameMappings[normalized]) {
    return nameMappings[normalized]
  }
  
  return normalized
}

/**
 * Generate PokéSprite sprite URL
 * Uses jsdelivr CDN for reliable access
 * 
 * @param {string} pokemonName - Pokemon name (e.g., "Charizard")
 * @param {number} nationalDexNumber - National dex number (optional, for fallback)
 * @param {string} variant - Sprite variant: 'regular' | 'shiny' | 'box' | 'inventory'
 * @returns {string} Sprite URL
 */
export const getPokespriteUrl = (pokemonName, nationalDexNumber = null, variant = 'regular') => {
  const normalizedName = normalizeSpriteName(pokemonName)
  
  // PokéSprite uses different paths for different variants
  // Base URL: https://cdn.jsdelivr.net/gh/msikma/pokesprite@master/pokemon-gen8/
  
  let spritePath = ''
  
  if (variant === 'shiny') {
    spritePath = `pokemon-gen8/${normalizedName}-shiny.png`
  } else if (variant === 'box') {
    spritePath = `pokemon-gen8/box/${normalizedName}.png`
  } else if (variant === 'inventory') {
    spritePath = `pokemon-gen8/inventory/${normalizedName}.png`
  } else {
    // Regular sprite
    spritePath = `pokemon-gen8/${normalizedName}.png`
  }
  
  // Use jsdelivr CDN for reliable access
  return `https://cdn.jsdelivr.net/gh/msikma/pokesprite@master/${spritePath}`
}

/**
 * Generate sprite URLs for a Pokemon
 * Returns object with different sprite variants
 */
export const getPokemonSprites = (pokemonName, nationalDexNumber = null) => {
  const normalizedName = normalizeSpriteName(pokemonName)
  
  return {
    regular: getPokespriteUrl(pokemonName, nationalDexNumber, 'regular'),
    shiny: getPokespriteUrl(pokemonName, nationalDexNumber, 'shiny'),
    box: getPokespriteUrl(pokemonName, nationalDexNumber, 'box'),
    inventory: getPokespriteUrl(pokemonName, nationalDexNumber, 'inventory'),
    // Use regular sprite as default
    spriteUrl: getPokespriteUrl(pokemonName, nationalDexNumber, 'regular')
  }
}

/**
 * Test if a sprite URL is accessible
 * Useful for validating sprite URLs before storing
 */
export const testSpriteUrl = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch (error) {
    return false
  }
}

