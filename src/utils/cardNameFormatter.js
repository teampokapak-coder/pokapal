/**
 * Card Name Formatter Utility
 * Formats card names for display
 * 
 * Card names are kept in their original language:
 * - English cards: name = "Erika's Pikachu" (kept as-is)
 * - Japanese cards: name = "エリカのピカチュウ" (kept as-is)
 * 
 * Use nationalDexNumber to group cards by Pokemon (same for both languages)
 */

/**
 * Format card name for display
 * For Japanese cards: Shows "Japanese Name (English Name)" if englishName exists
 * For English cards: Shows name as-is
 * 
 * @param {Object} card - Card object with name (original language) and optional englishName
 * @returns {string} - Formatted display name
 */
export const formatCardName = (card) => {
  if (!card || !card.name) return ''
  
  // If card has English name and language is Japanese, show both
  if (card.language === 'ja' && card.englishName) {
    return `${card.name} (${card.englishName})`
  }
  
  // Otherwise show original name
  return card.name
}

/**
 * Get display name for a card
 * Returns the card name (in original language)
 * 
 * @param {Object} card - Card object
 * @returns {string} - Display name
 */
export const getCardDisplayName = (card) => {
  if (!card) return ''
  return card.name || ''
}

/**
 * Get the Pokemon's English name from nationalDexNumber
 * Useful for grouping/displaying cards by Pokemon
 * 
 * @param {Object} card - Card object with optional nationalDexNumber
 * @param {Array} pokemonList - Array of Pokemon data with nationalDexNumber and name
 * @returns {string} - English Pokemon name or empty string
 */
export const getPokemonEnglishName = (card, pokemonList = []) => {
  if (!card || !card.nationalDexNumber) return ''
  const pokemon = pokemonList.find(p => p.nationalDexNumber === card.nationalDexNumber)
  return pokemon?.name || ''
}

/**
 * Get the primary name (always English, stored in name field)
 * 
 * @param {Object} card - Card object
 * @returns {string} - Primary name (English)
 */
export const getCardPrimaryName = (card) => {
  if (!card || !card.name) return ''
  return card.name
}

