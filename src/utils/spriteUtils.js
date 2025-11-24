// Unified sprite utility - supports both PokéSprite and PokemonDB
// Allows easy switching between sprite sources

import { getPokemonSprites as getPokespriteSprites } from './pokesprite'
import { getPokemonDBSprites, DEFAULT_GENERATION } from './pokemondb'

/**
 * Sprite source options
 */
export const SPRITE_SOURCES = {
  POKESPRITE: 'pokesprite',
  POKEMONDB: 'pokemondb',
  AUTO: 'auto', // Try PokemonDB first, fallback to PokéSprite
}

/**
 * Get sprite URLs for a Pokemon using the specified source
 * 
 * @param {string} pokemonName - Pokemon name
 * @param {number} nationalDexNumber - National dex number (optional)
 * @param {string} source - Sprite source: 'pokesprite' | 'pokemondb' | 'auto' (defaults to 'auto')
 * @param {string} pokemonDBGeneration - PokemonDB generation to use (defaults to DEFAULT_GENERATION)
 * @returns {object} Object with sprite URLs
 */
export const getPokemonSprites = (
  pokemonName,
  nationalDexNumber = null,
  source = SPRITE_SOURCES.AUTO,
  pokemonDBGeneration = DEFAULT_GENERATION
) => {
  if (source === SPRITE_SOURCES.POKESPRITE) {
    return getPokespriteSprites(pokemonName, nationalDexNumber)
  }
  
  if (source === SPRITE_SOURCES.POKEMONDB) {
    return getPokemonDBSprites(pokemonName, nationalDexNumber, pokemonDBGeneration)
  }
  
  // AUTO: Use PokemonDB as primary, but include PokéSprite as fallback
  const pokemonDBSprites = getPokemonDBSprites(pokemonName, nationalDexNumber, pokemonDBGeneration)
  const pokespriteSprites = getPokespriteSprites(pokemonName, nationalDexNumber)
  
  return {
    ...pokemonDBSprites,
    // Add PokéSprite URLs as fallback options
    fallback: {
      pokesprite: pokespriteSprites.spriteUrl,
      ...pokespriteSprites
    },
    // Primary sprite URL (PokemonDB)
    spriteUrl: pokemonDBSprites.spriteUrl
  }
}

/**
 * Get a single sprite URL with automatic fallback
 * Tries PokemonDB first, falls back to PokéSprite if needed
 * 
 * @param {string} pokemonName - Pokemon name
 * @param {number} nationalDexNumber - National dex number (optional)
 * @param {string} source - Sprite source (defaults to 'auto')
 * @returns {string} Sprite URL
 */
export const getPokemonSpriteUrl = (
  pokemonName,
  nationalDexNumber = null,
  source = SPRITE_SOURCES.AUTO
) => {
  const sprites = getPokemonSprites(pokemonName, nationalDexNumber, source)
  return sprites.spriteUrl
}

