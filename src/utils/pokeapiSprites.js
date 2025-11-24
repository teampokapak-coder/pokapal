// PokeAPI Sprite utility functions
// PokeAPI Sprites: https://github.com/PokeAPI/sprites
// Sprites are hosted on GitHub and accessible via raw.githubusercontent.com

/**
 * Generate PokeAPI sprite URL
 * PokeAPI uses numeric IDs (national dex numbers) instead of names
 * 
 * @param {number} nationalDexNumber - National dex number (required for PokeAPI)
 * @param {string} variant - Sprite variant (see SPRITE_VARIANTS below)
 * @returns {string} Sprite URL
 */
export const getPokeAPISpriteUrl = (nationalDexNumber, variant = 'official-artwork') => {
  if (!nationalDexNumber || typeof nationalDexNumber !== 'number') {
    return null
  }
  
  const baseUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'
  
  // Map variant to path
  const variantPaths = {
    'official-artwork': `other/official-artwork/${nationalDexNumber}.png`,
    'official-artwork-shiny': `other/official-artwork/shiny/${nationalDexNumber}.png`,
    'home': `other/home/${nationalDexNumber}.png`,
    'home-shiny': `other/home/shiny/${nationalDexNumber}.png`,
    'dream-world': `other/dream-world/${nationalDexNumber}.svg`,
    'showdown': `other/showdown/${nationalDexNumber}.gif`,
    'default': `${nationalDexNumber}.png`,
    'default-shiny': `shiny/${nationalDexNumber}.png`,
    'default-back': `back/${nationalDexNumber}.png`,
    'default-back-shiny': `back/shiny/${nationalDexNumber}.png`,
    'black-white': `versions/generation-v/black-white/${nationalDexNumber}.png`,
    'black-white-shiny': `versions/generation-v/black-white/shiny/${nationalDexNumber}.png`,
    'black-white-animated': `versions/generation-v/black-white/animated/${nationalDexNumber}.gif`,
    'x-y': `versions/generation-vi/x-y/${nationalDexNumber}.png`,
    'x-y-shiny': `versions/generation-vi/x-y/shiny/${nationalDexNumber}.png`,
    'ultra-sun-moon': `versions/generation-vii/ultra-sun-ultra-moon/${nationalDexNumber}.png`,
    'ultra-sun-moon-shiny': `versions/generation-vii/ultra-sun-ultra-moon/shiny/${nationalDexNumber}.png`,
  }
  
  const path = variantPaths[variant] || variantPaths['official-artwork']
  return `${baseUrl}/${path}`
}

/**
 * Generate sprite URLs for a Pokemon using PokeAPI
 * Returns object with different sprite variants
 * 
 * @param {number} nationalDexNumber - National dex number (required)
 * @param {string} pokemonName - Pokemon name (optional, for reference)
 * @returns {object} Object with sprite URLs
 */
export const getPokeAPISprites = (nationalDexNumber, pokemonName = null) => {
  if (!nationalDexNumber || typeof nationalDexNumber !== 'number') {
    return {
      spriteUrl: null,
      error: 'National dex number is required for PokeAPI sprites'
    }
  }
  
  return {
    // Primary sprite URL (official artwork - highest quality)
    spriteUrl: getPokeAPISpriteUrl(nationalDexNumber, 'official-artwork'),
    
    // Official artwork variants (best quality, 475x475)
    'official-artwork': getPokeAPISpriteUrl(nationalDexNumber, 'official-artwork'),
    'official-artwork-shiny': getPokeAPISpriteUrl(nationalDexNumber, 'official-artwork-shiny'),
    
    // Home sprites (512x512, modern)
    'home': getPokeAPISpriteUrl(nationalDexNumber, 'home'),
    'home-shiny': getPokeAPISpriteUrl(nationalDexNumber, 'home-shiny'),
    
    // Dream world (SVG, vector)
    'dream-world': getPokeAPISpriteUrl(nationalDexNumber, 'dream-world'),
    
    // Showdown (animated GIF)
    'showdown': getPokeAPISpriteUrl(nationalDexNumber, 'showdown'),
    
    // Default sprites (classic style)
    'default': getPokeAPISpriteUrl(nationalDexNumber, 'default'),
    'default-shiny': getPokeAPISpriteUrl(nationalDexNumber, 'default-shiny'),
    'default-back': getPokeAPISpriteUrl(nationalDexNumber, 'default-back'),
    'default-back-shiny': getPokeAPISpriteUrl(nationalDexNumber, 'default-back-shiny'),
    
    // Generation-specific sprites
    'black-white': getPokeAPISpriteUrl(nationalDexNumber, 'black-white'),
    'black-white-shiny': getPokeAPISpriteUrl(nationalDexNumber, 'black-white-shiny'),
    'black-white-animated': getPokeAPISpriteUrl(nationalDexNumber, 'black-white-animated'),
    'x-y': getPokeAPISpriteUrl(nationalDexNumber, 'x-y'),
    'x-y-shiny': getPokeAPISpriteUrl(nationalDexNumber, 'x-y-shiny'),
    'ultra-sun-moon': getPokeAPISpriteUrl(nationalDexNumber, 'ultra-sun-moon'),
    'ultra-sun-moon-shiny': getPokeAPISpriteUrl(nationalDexNumber, 'ultra-sun-moon-shiny'),
    
    // Metadata
    source: 'pokeapi',
    nationalDexNumber,
    pokemonName
  }
}

/**
 * Available sprite variants in PokeAPI
 */
export const POKEAPI_SPRITE_VARIANTS = {
  OFFICIAL_ARTWORK: 'official-artwork',
  OFFICIAL_ARTWORK_SHINY: 'official-artwork-shiny',
  HOME: 'home',
  HOME_SHINY: 'home-shiny',
  DREAM_WORLD: 'dream-world',
  SHOWDOWN: 'showdown',
  DEFAULT: 'default',
  DEFAULT_SHINY: 'default-shiny',
  DEFAULT_BACK: 'default-back',
  DEFAULT_BACK_SHINY: 'default-back-shiny',
  BLACK_WHITE: 'black-white',
  BLACK_WHITE_SHINY: 'black-white-shiny',
  BLACK_WHITE_ANIMATED: 'black-white-animated',
  X_Y: 'x-y',
  X_Y_SHINY: 'x-y-shiny',
  ULTRA_SUN_MOON: 'ultra-sun-moon',
  ULTRA_SUN_MOON_SHINY: 'ultra-sun-moon-shiny',
}

