// Pokemon Sets Data
// This will be seeded to Firebase

export const pokemonSets = [
  {
    name: 'Base Set',
    description: 'The original Pokémon card set released in 1999',
    type: 'Pokémon',
    year: 1999,
    totalCards: 102,
    setCode: 'BS1'
  },
  {
    name: 'Jungle',
    description: 'Wild Pokémon from the jungle',
    type: 'Pokémon',
    year: 1999,
    totalCards: 64,
    setCode: 'JU'
  },
  {
    name: 'Fossil',
    description: 'Ancient Pokémon revived from fossils',
    type: 'Pokémon',
    year: 1999,
    totalCards: 62,
    setCode: 'FO'
  },
  {
    name: 'Base Set 2',
    description: 'Reprint of Base Set and Jungle',
    type: 'Pokémon',
    year: 2000,
    totalCards: 130,
    setCode: 'BS2'
  },
  {
    name: 'Team Rocket',
    description: 'Dark Pokémon cards',
    type: 'Pokémon',
    year: 2000,
    totalCards: 82,
    setCode: 'TR'
  },
  {
    name: 'Gym Heroes',
    description: 'Gym Leader Pokémon',
    type: 'Pokémon',
    year: 2000,
    totalCards: 132,
    setCode: 'GH'
  },
  {
    name: 'Gym Challenge',
    description: 'Elite Four and Gym Leaders',
    type: 'Pokémon',
    year: 2000,
    totalCards: 132,
    setCode: 'GC'
  },
  {
    name: 'Neo Genesis',
    description: 'New generation of Pokémon',
    type: 'Pokémon',
    year: 2000,
    totalCards: 111,
    setCode: 'NG'
  },
  {
    name: 'Neo Discovery',
    description: 'Discover new Pokémon',
    type: 'Pokémon',
    year: 2001,
    totalCards: 75,
    setCode: 'ND'
  },
  {
    name: 'Neo Revelation',
    description: 'Revealed secrets of Pokémon',
    type: 'Pokémon',
    year: 2001,
    totalCards: 66,
    setCode: 'NR'
  },
  {
    name: 'Neo Destiny',
    description: 'Destiny of light and dark',
    type: 'Pokémon',
    year: 2002,
    totalCards: 113,
    setCode: 'ND'
  },
  {
    name: 'Legendary Collection',
    description: 'Reprint collection',
    type: 'Pokémon',
    year: 2002,
    totalCards: 110,
    setCode: 'LC'
  },
  {
    name: 'Expedition Base Set',
    description: 'Expedition to find rare Pokémon',
    type: 'Pokémon',
    year: 2002,
    totalCards: 165,
    setCode: 'EX'
  },
  {
    name: 'Aquapolis',
    description: 'Water-themed set',
    type: 'Pokémon',
    year: 2003,
    totalCards: 147,
    setCode: 'AQ'
  },
  {
    name: 'Skyridge',
    description: 'Sky-high adventures',
    type: 'Pokémon',
    year: 2003,
    totalCards: 144,
    setCode: 'SK'
  },
  {
    name: 'Ruby & Sapphire',
    description: 'Hoenn region Pokémon',
    type: 'Pokémon',
    year: 2003,
    totalCards: 109,
    setCode: 'RS'
  },
  {
    name: 'Sword & Shield Base Set',
    description: 'Galar region Pokémon',
    type: 'Pokémon',
    year: 2020,
    totalCards: 202,
    setCode: 'SSH'
  },
  {
    name: 'Chilling Reign',
    description: 'Ice and fighting types',
    type: 'Pokémon',
    year: 2021,
    totalCards: 198,
    setCode: 'CRE'
  },
  {
    name: 'Evolving Skies',
    description: 'Eevee evolutions',
    type: 'Pokémon',
    year: 2021,
    totalCards: 203,
    setCode: 'EVS'
  },
  {
    name: 'Brilliant Stars',
    description: 'Shining stars collection',
    type: 'Pokémon',
    year: 2022,
    totalCards: 172,
    setCode: 'BRS'
  },
  {
    name: 'Astral Radiance',
    description: 'Radiant Pokémon',
    type: 'Pokémon',
    year: 2022,
    totalCards: 189,
    setCode: 'ASR'
  },
  {
    name: 'Lost Origin',
    description: 'Lost and found',
    type: 'Pokémon',
    year: 2022,
    totalCards: 196,
    setCode: 'LOR'
  },
  {
    name: 'Scarlet & Violet Base Set',
    description: 'Paldea region Pokémon',
    type: 'Pokémon',
    year: 2023,
    totalCards: 198,
    setCode: 'SVI'
  },
  {
    name: 'Paldea Evolved',
    description: 'Evolved Paldea Pokémon',
    type: 'Pokémon',
    year: 2023,
    totalCards: 193,
    setCode: 'PAL'
  },
  {
    name: 'Obsidian Flames',
    description: 'Dark flames collection',
    type: 'Pokémon',
    year: 2023,
    totalCards: 197,
    setCode: 'OBF'
  },
  {
    name: 'Paradox Rift',
    description: 'Paradox Pokémon',
    type: 'Pokémon',
    year: 2023,
    totalCards: 182,
    setCode: 'PAR'
  }
]

// Sports cards examples
export const sportsSets = [
  {
    name: '2023 Topps Baseball',
    description: '2023 Major League Baseball cards',
    type: 'Sports',
    year: 2023,
    totalCards: 330,
    setCode: 'TOP23'
  },
  {
    name: '2023 Panini Football',
    description: '2023 NFL cards',
    type: 'Sports',
    year: 2023,
    totalCards: 400,
    setCode: 'PAN23'
  },
  {
    name: '2023 Panini Basketball',
    description: '2023 NBA cards',
    type: 'Sports',
    year: 2023,
    totalCards: 300,
    setCode: 'NBA23'
  }
]

export const allSets = [...pokemonSets, ...sportsSets]

