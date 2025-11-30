/**
 * Card Image Fallback Utilities
 * 
 * Provides fallback display options when card images fail to load
 */

/**
 * Generate initials/abbreviation from set ID
 * Examples:
 * - "SV11W" → "SV11W"
 * - "SV9a" → "SV9A"
 * - "swsh3" → "SW3"
 * - "SM7a" → "SM7A"
 * @param {string} setId - Set ID (e.g., "SV11W", "swsh3")
 * @returns {string} - Abbreviated set ID for display
 */
export function getSetIdInitials(setId) {
  if (!setId || typeof setId !== 'string') return '?'
  
  // Remove common prefixes if present
  let cleaned = setId.trim()
  
  // If it's already short (5 chars or less), return uppercase
  if (cleaned.length <= 5) {
    return cleaned.toUpperCase()
  }
  
  // For longer IDs, try to extract meaningful parts
  // Pattern: Series + Number + Optional suffix (e.g., "swsh3", "SV11W")
  const match = cleaned.match(/^([A-Z]{1,3})(\d+)([A-Za-z]*)$/i)
  if (match) {
    const [, series, number, suffix] = match
    // Return series + number + first letter of suffix (if any)
    return (series.toUpperCase() + number + (suffix ? suffix[0].toUpperCase() : '')).slice(0, 5)
  }
  
  // Fallback: Take first 3-4 characters
  return cleaned.substring(0, 4).toUpperCase()
}

/**
 * Generate initials from card name (fallback)
 * @param {string} name - Card name
 * @returns {string} - First letter(s) of the name
 */
export function getCardNameInitials(name) {
  if (!name || typeof name !== 'string') return '?'
  
  // Take first letter, or first two if it's a single character
  const firstChar = name.charAt(0).toUpperCase()
  if (name.length === 1) return firstChar
  
  // For multi-word names, try to get initials
  const words = name.split(/\s+/)
  if (words.length > 1) {
    return words.slice(0, 2).map(w => w.charAt(0).toUpperCase()).join('')
  }
  
  return firstChar
}

/**
 * Get fallback text for a card when image fails
 * Prioritizes set ID initials, falls back to card name initials
 * @param {Object} card - Card object
 * @returns {string} - Fallback text to display
 */
export function getCardFallbackText(card) {
  if (!card) return '?'
  
  // Prefer set ID initials if available
  const setId = card.setId || card.set?.id || card.id
  if (setId) {
    return getSetIdInitials(setId)
  }
  
  // Fallback to card name initials
  if (card.name) {
    return getCardNameInitials(card.name)
  }
  
  return '?'
}

