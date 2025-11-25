/**
 * Set Name Formatter Utility
 * Formats set and series names for display, especially for Japanese sets with English translations
 */

/**
 * Format set name for display
 * For Japanese sets with English translation, shows: "Darkness Ablaze (闇の誘惑)"
 * For English sets or Japanese sets without translation, shows: "Darkness Ablaze" or "闇の誘惑"
 * 
 * @param {Object} card - Card object with set (Japanese) and optional englishSetName
 * @returns {string} - Formatted display name
 */
export const formatSetName = (card) => {
  if (!card) return ''
  
  const japaneseSetName = card.set || ''
  const englishSetName = card.englishSetName || ''
  
  // If we have both, show English first with Japanese in parentheses
  if (englishSetName && japaneseSetName && japaneseSetName !== englishSetName) {
    return `${englishSetName} (${japaneseSetName})`
  }
  
  // Otherwise, show whichever we have
  return englishSetName || japaneseSetName
}

/**
 * Format series name for display
 * For Japanese series with English translation, shows: "Sword & Shield (ソード&シールド)"
 * For English series or Japanese series without translation, shows: "Sword & Shield" or "ソード&シールド"
 * 
 * @param {Object} card - Card object with series (Japanese) and optional englishSeries
 * @returns {string} - Formatted display name
 */
export const formatSeriesName = (card) => {
  if (!card) return ''
  
  const japaneseSeries = card.series || ''
  const englishSeries = card.englishSeries || ''
  
  // If we have both, show English first with Japanese in parentheses
  if (englishSeries && japaneseSeries && japaneseSeries !== englishSeries) {
    return `${englishSeries} (${japaneseSeries})`
  }
  
  // Otherwise, show whichever we have
  return englishSeries || japaneseSeries
}

/**
 * Get the primary set name (English if available, otherwise Japanese)
 * 
 * @param {Object} card - Card object
 * @returns {string} - Primary set name
 */
export const getPrimarySetName = (card) => {
  if (!card) return ''
  return card.englishSetName || card.set || ''
}

/**
 * Get the primary series name (English if available, otherwise Japanese)
 * 
 * @param {Object} card - Card object
 * @returns {string} - Primary series name
 */
export const getPrimarySeriesName = (card) => {
  if (!card) return ''
  return card.englishSeries || card.series || ''
}

