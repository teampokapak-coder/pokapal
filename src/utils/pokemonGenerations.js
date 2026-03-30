/**
 * National Pokédex ranges per generation (mainline games).
 * Used for "Generation" battleset challenges (filter by nationalDexNumber on cards).
 */
export const POKEMON_GENERATIONS = [
  { id: 'gen1', region: 'Kanto', label: 'Gen I — Kanto', minNationalDex: 1, maxNationalDex: 151 },
  { id: 'gen2', region: 'Johto', label: 'Gen II — Johto', minNationalDex: 152, maxNationalDex: 251 },
  { id: 'gen3', region: 'Hoenn', label: 'Gen III — Hoenn', minNationalDex: 252, maxNationalDex: 386 },
  { id: 'gen4', region: 'Sinnoh', label: 'Gen IV — Sinnoh', minNationalDex: 387, maxNationalDex: 493 },
  { id: 'gen5', region: 'Unova', label: 'Gen V — Unova', minNationalDex: 494, maxNationalDex: 649 },
  { id: 'gen6', region: 'Kalos', label: 'Gen VI — Kalos', minNationalDex: 650, maxNationalDex: 721 },
  { id: 'gen7', region: 'Alola', label: 'Gen VII — Alola', minNationalDex: 722, maxNationalDex: 809 },
  { id: 'gen8', region: 'Galar', label: 'Gen VIII — Galar', minNationalDex: 810, maxNationalDex: 905 },
  { id: 'gen9', region: 'Paldea', label: 'Gen IX — Paldea', minNationalDex: 906, maxNationalDex: 1025 }
]

export function getGenerationById (id) {
  return POKEMON_GENERATIONS.find((g) => g.id === id) || null
}
