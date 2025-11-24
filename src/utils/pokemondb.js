// PokemonDB Sprite utility functions
// PokemonDB: https://pokemondb.net/sprites
// Sprites are hosted on img.pokemondb.net

/**
 * Normalize Pokemon name for PokemonDB sprite URL
 * PokemonDB uses lowercase with hyphens
 * Handles special cases like "Mr. Mime" -> "mr-mime", "Nidoran♀" -> "nidoran-f"
 */
export const normalizePokemonDBName = (name) => {
  if (!name) return ''
  
  // First, remove card variants (EX, GX, V, Mega, etc.) - these won't be in sprite names
  // Also remove trainer names (e.g., "Giovanni's Nidorina" -> "Nidorina")
  let cleaned = name
    .replace(/^Mega\s+/i, '')
    .replace(/^Light\s+/i, '')
    .replace(/^Dark\s+/i, '')
    .replace(/^[A-Z][a-z]+'s\s+/i, '') // Remove possessive trainer names (e.g., "Giovanni's", "Erika's")
    .replace(/\s+EX$/i, '')
    .replace(/\s+GX$/i, '')
    .replace(/\s+V$/i, '')
    .replace(/\s+VMAX$/i, '')
    .replace(/\s+VSTAR$/i, '')
    .replace(/\s+Prime$/i, '')
    .replace(/\s+LV\.?\s*X$/i, '')
    .replace(/\s+LV\.?\s*\d+$/i, '')
    .replace(/\s+Break$/i, '')
    .replace(/\s+Tag Team$/i, '')
    .replace(/\s+&.*$/i, '')
    .replace(/\s+\(.*\)$/i, '')
    .trim()
  
  let normalized = cleaned.toLowerCase()
  
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
  
  // Handle specific Pokemon name variations for PokemonDB
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
    'great-tusk': 'great-tusk',
    'scream-tail': 'scream-tail',
    'brute-bonnet': 'brute-bonnet',
    'flutter-mane': 'flutter-mane',
    'slither-wing': 'slither-wing',
    'sandy-shocks': 'sandy-shocks',
    'iron-treads': 'iron-treads',
    'iron-bundle': 'iron-bundle',
    'iron-hands': 'iron-hands',
    'iron-jugulis': 'iron-jugulis',
    'iron-moth': 'iron-moth',
    'iron-thorns': 'iron-thorns',
    'wo-chien': 'wo-chien',
    'chien-pao': 'chien-pao',
    'ting-lu': 'ting-lu',
    'chi-yu': 'chi-yu',
    'roaring-moon': 'roaring-moon',
    'iron-valiant': 'iron-valiant',
    'walking-wake': 'walking-wake',
    'iron-leaves': 'iron-leaves',
  }
  
  if (nameMappings[normalized]) {
    return nameMappings[normalized]
  }
  
  return normalized
}

/**
 * Game generation mappings for PokemonDB
 * Maps to the sprite directory names used by PokemonDB
 */
export const GAME_GENERATIONS = {
  'red-blue': 'red-blue',
  'yellow': 'yellow',
  'gold-silver': 'gold-silver',
  'crystal': 'crystal',
  'ruby-sapphire': 'ruby-sapphire',
  'emerald': 'emerald',
  'firered-leafgreen': 'firered-leafgreen',
  'diamond-pearl': 'diamond-pearl',
  'platinum': 'platinum',
  'heartgold-soulsilver': 'heartgold-soulsilver',
  'black-white': 'black-white',
  'black-2-white-2': 'black-2-white-2',
  'x-y': 'x-y',
  'omega-ruby-alpha-sapphire': 'omega-ruby-alpha-sapphire',
  'sun-moon': 'sun-moon',
  'ultra-sun-ultra-moon': 'ultra-sun-ultra-moon',
  'lets-go-pikachu-lets-go-eevee': 'lets-go-pikachu-lets-go-eevee',
  'sword-shield': 'sword-shield',
  'brilliant-diamond-shining-pearl': 'brilliant-diamond-shining-pearl',
  'legends-arceus': 'legends-arceus',
  'scarlet-violet': 'scarlet-violet',
}

/**
 * Default game generation to use
 * Using sword-shield as it's modern and has good coverage
 * Can be changed to 'scarlet-violet' for latest, or 'diamond-pearl' for classic
 */
export const DEFAULT_GENERATION = 'sword-shield'

/**
 * Fallback generations to try if default fails
 * Ordered from most recent to oldest
 */
export const FALLBACK_GENERATIONS = [
  'scarlet-violet',
  'legends-arceus',
  'brilliant-diamond-shining-pearl',
  'sword-shield',
  'ultra-sun-ultra-moon',
  'sun-moon',
  'x-y',
  'black-2-white-2',
  'black-white',
  'diamond-pearl',
  'platinum',
  'emerald',
  'ruby-sapphire',
  'gold-silver',
  'red-blue',
]

/**
 * Sprite variants available in PokemonDB
 */
export const SPRITE_VARIANTS = {
  normal: 'normal',
  shiny: 'shiny',
  back: 'back',
  backShiny: 'back-shiny',
}

/**
 * Generate PokemonDB sprite URL
 * 
 * @param {string} pokemonName - Pokemon name (e.g., "Charizard")
 * @param {string} gameGeneration - Game generation (defaults to DEFAULT_GENERATION)
 * @param {string} variant - Sprite variant: 'normal' | 'shiny' | 'back' | 'back-shiny' (defaults to 'normal')
 * @returns {string} Sprite URL
 */
export const getPokemonDBSpriteUrl = (
  pokemonName,
  gameGeneration = DEFAULT_GENERATION,
  variant = 'normal'
) => {
  const normalizedName = normalizePokemonDBName(pokemonName)
  const variantPath = variant === 'back-shiny' ? 'back-shiny' : variant
  
  return `https://img.pokemondb.net/sprites/${gameGeneration}/${variantPath}/${normalizedName}.png`
}

/**
 * Test if a sprite URL is accessible
 * Useful for validating sprite URLs before storing
 */
export const testPokemonDBSpriteUrl = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' })
    // With no-cors, we can't check response.ok, but if it doesn't throw, assume it exists
    return true
  } catch (error) {
    return false
  }
}

/**
 * Find the best available sprite URL for a Pokemon
 * Tries multiple generations with fallback logic
 * 
 * @param {string} pokemonName - Pokemon name
 * @param {string} variant - Sprite variant (defaults to 'normal')
 * @param {string[]} generationsToTry - Optional array of generations to try (defaults to FALLBACK_GENERATIONS)
 * @returns {Promise<string|null>} Best available sprite URL or null if none found
 */
export const findBestPokemonDBSpriteUrl = async (
  pokemonName,
  variant = 'normal',
  generationsToTry = FALLBACK_GENERATIONS
) => {
  for (const generation of generationsToTry) {
    const url = getPokemonDBSpriteUrl(pokemonName, generation, variant)
    // Note: Due to CORS, we can't reliably test URLs client-side
    // So we'll return the first URL (default generation) and let the browser handle 404s
    // In a server-side context, you could test each URL
    return url
  }
  return null
}

/**
 * Generate sprite URLs for a Pokemon using PokemonDB
 * Returns object with different sprite variants and generations
 * 
 * @param {string} pokemonName - Pokemon name
 * @param {number} nationalDexNumber - National dex number (optional, for future use)
 * @param {string} preferredGeneration - Preferred game generation (defaults to DEFAULT_GENERATION)
 * @returns {object} Object with sprite URLs
 */
export const getPokemonDBSprites = (
  pokemonName,
  nationalDexNumber = null,
  preferredGeneration = DEFAULT_GENERATION
) => {
  const normalizedName = normalizePokemonDBName(pokemonName)
  
  // Generate URLs for different variants using preferred generation
  const baseUrl = `https://img.pokemondb.net/sprites/${preferredGeneration}`
  
  return {
    // Primary sprite URL (normal variant)
    spriteUrl: `${baseUrl}/normal/${normalizedName}.png`,
    
    // All variants
    normal: `${baseUrl}/normal/${normalizedName}.png`,
    shiny: `${baseUrl}/shiny/${normalizedName}.png`,
    back: `${baseUrl}/back/${normalizedName}.png`,
    backShiny: `${baseUrl}/back-shiny/${normalizedName}.png`,
    
    // Generation info
    generation: preferredGeneration,
    
    // Alternative generations (for fallback)
    alternateGenerations: {
      'scarlet-violet': getPokemonDBSpriteUrl(pokemonName, 'scarlet-violet', 'normal'),
      'sword-shield': getPokemonDBSpriteUrl(pokemonName, 'sword-shield', 'normal'),
      'diamond-pearl': getPokemonDBSpriteUrl(pokemonName, 'diamond-pearl', 'normal'),
      'x-y': getPokemonDBSpriteUrl(pokemonName, 'x-y', 'normal'),
      'black-white': getPokemonDBSpriteUrl(pokemonName, 'black-white', 'normal'),
    }
  }
}

/**
 * Get sprite URL with automatic fallback
 * Returns the primary sprite URL, with fallback generations available
 * 
 * @param {string} pokemonName - Pokemon name
 * @param {string} variant - Sprite variant (defaults to 'normal')
 * @returns {string} Sprite URL (uses DEFAULT_GENERATION)
 */
export const getPokemonDBSprite = (pokemonName, variant = 'normal') => {
  return getPokemonDBSpriteUrl(pokemonName, DEFAULT_GENERATION, variant)
}

/**
 * Generate PokemonDB animated GIF URL
 * Format: https://img.pokemondb.net/sprites/{generation}/anim/{variant}/{pokemon-name}.gif
 * 
 * @param {string} pokemonName - Pokemon name (e.g., "Reshiram")
 * @param {string} gameGeneration - Game generation (defaults to DEFAULT_GENERATION)
 * @param {string} variant - Sprite variant: 'normal' | 'shiny' | 'back' | 'back-shiny' (defaults to 'normal')
 * @returns {string} Animated GIF URL
 */
export const getPokemonDBGifUrl = (
  pokemonName,
  gameGeneration = DEFAULT_GENERATION,
  variant = 'normal'
) => {
  const normalizedName = normalizePokemonDBName(pokemonName)
  const variantPath = variant === 'back-shiny' ? 'back-shiny' : variant
  
  return `https://img.pokemondb.net/sprites/${gameGeneration}/anim/${variantPath}/${normalizedName}.gif`
}

/**
 * Generate animated GIF URLs for a Pokemon using PokemonDB
 * Returns object with different GIF variants
 * 
 * @param {string} pokemonName - Pokemon name
 * @param {number} nationalDexNumber - National dex number (optional)
 * @param {string} preferredGeneration - Preferred game generation (defaults to 'black-white' for best GIF support)
 * @returns {object} Object with GIF URLs
 */
export const getPokemonDBGifs = (
  pokemonName,
  nationalDexNumber = null,
  preferredGeneration = 'black-white' // black-white has best GIF coverage
) => {
  const normalizedName = normalizePokemonDBName(pokemonName)
  
  // Generate URLs for different variants using preferred generation
  const baseUrl = `https://img.pokemondb.net/sprites/${preferredGeneration}/anim`
  
  return {
    // Primary GIF URL (normal variant)
    gifUrl: `${baseUrl}/normal/${normalizedName}.gif`,
    
    // All variants
    normal: `${baseUrl}/normal/${normalizedName}.gif`,
    shiny: `${baseUrl}/shiny/${normalizedName}.gif`,
    back: `${baseUrl}/back/${normalizedName}.gif`,
    backShiny: `${baseUrl}/back-shiny/${normalizedName}.gif`,
    
    // Generation info
    generation: preferredGeneration,
    
    // Alternative generations (for fallback)
    alternateGenerations: {
      'black-white': getPokemonDBGifUrl(pokemonName, 'black-white', 'normal'),
      'black-2-white-2': getPokemonDBGifUrl(pokemonName, 'black-2-white-2', 'normal'),
      'x-y': getPokemonDBGifUrl(pokemonName, 'x-y', 'normal'),
      'diamond-pearl': getPokemonDBGifUrl(pokemonName, 'diamond-pearl', 'normal'),
    }
  }
}

