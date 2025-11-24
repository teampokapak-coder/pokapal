/**
 * Get the CSS class name for a Pokemon type
 * Uses global type color classes defined in style.css
 * @param {string} type - The Pokemon type (e.g., "Fire", "Water", "Grass")
 * @returns {string} - The CSS class name for the type
 */
export function getTypeColorClass(type) {
  if (!type) return 'pokemon-type pokemon-type-colorless'
  
  const typeMap = {
    'Fire': 'pokemon-type-fire',
    'Water': 'pokemon-type-water',
    'Grass': 'pokemon-type-grass',
    'Electric': 'pokemon-type-electric',
    'Psychic': 'pokemon-type-psychic',
    'Fighting': 'pokemon-type-fighting',
    'Darkness': 'pokemon-type-darkness',
    'Metal': 'pokemon-type-metal',
    'Fairy': 'pokemon-type-fairy',
    'Dragon': 'pokemon-type-dragon',
    'Colorless': 'pokemon-type-colorless'
  }
  
  const typeClass = typeMap[type] || 'pokemon-type-colorless'
  return `pokemon-type ${typeClass}`
}

