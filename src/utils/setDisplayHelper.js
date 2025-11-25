/**
 * Set Display Helper Utilities
 * Provides functions for displaying set logos and names with fallbacks
 */

/**
 * Get set logo URL
 * For Japanese sets: Only returns backupLogoUrl (skip broken TCGdx logos)
 * For English sets: Returns logo or backupLogoUrl (both work fine)
 * @param {Object} set - Set object with logo, optional backupLogoUrl, and language
 * @returns {string|null} - Logo URL or null if not available
 */
export const getSetLogoUrl = (set) => {
  if (!set) return null
  
  // For Japanese sets, skip broken TCGdx logos - only use backupLogoUrl
  if (set.language === 'ja') {
    return set.backupLogoUrl || null
  }
  
  // For English sets (or sets without language field), use both logo and backupLogoUrl
  return set.backupLogoUrl || set.logo || null
}

/**
 * Format set name for display
 * For Japanese sets: Shows "English Name (Japanese Name)" if englishName exists
 * For English sets: Shows name as-is
 * 
 * @param {Object} set - Set object with name and optional englishName
 * @returns {string} - Formatted display name
 */
export const formatSetDisplayName = (set) => {
  if (!set || !set.name) return ''
  
  // If set has English name and language is Japanese, show both
  if (set.language === 'ja' && set.englishName) {
    return `${set.englishName} (${set.name})`
  }
  
  // Otherwise show original name
  return set.name
}

/**
 * Get primary set name (English if available, otherwise original)
 * @param {Object} set - Set object
 * @returns {string} - Primary set name
 */
export const getPrimarySetName = (set) => {
  if (!set) return ''
  return set.englishName || set.name || ''
}

/**
 * Format series name for display
 * For Japanese series: Shows "English Series (Japanese Series)" if englishSeries exists
 * For English series: Shows name as-is
 * 
 * @param {Object} set - Set object with series and optional englishSeries
 * @returns {string} - Formatted display name
 */
export const formatSeriesDisplayName = (set) => {
  if (!set || !set.series) return ''
  
  // If set has English series and language is Japanese, show both
  if (set.language === 'ja' && set.englishSeries) {
    return `${set.englishSeries} (${set.series})`
  }
  
  // Otherwise show original series
  return set.series
}

