# Pokemon Card Schema Documentation

## Collections

### English Cards: `pokemon` Collection
### Japanese Cards: `pokemon_ja` Collection

**Both collections use the same schema** - only difference is the `language` field.

---

## Complete Card Schema

### Required Fields (for grouping)

```javascript
{
  // ✅ CRITICAL: For grouping Pokemon by name
  name: string,                    // Card name (e.g., "Oshawott", "オタチ")
  nationalDexNumber: number,      // National Pokedex number (e.g., 162 for Furret)
  
  // ✅ CRITICAL: For identifying cards
  apiId: string,                   // Unique API card ID (e.g., "swsh3-136")
  apiSetId: string,                // API set ID (e.g., "swsh3")
}
```

### Complete Field List

```javascript
{
  // ============================================
  // IDENTIFICATION & API REFERENCE
  // ============================================
  apiId: string,                   // Unique API card ID (e.g., "swsh3-136")
  apiSetId: string,                // API set ID (e.g., "swsh3")
  setId: string,                   // Firestore set document ID (optional)
  language: "en" | "ja",           // Language code
  
  // ============================================
  // POKEMON IDENTIFICATION (for grouping)
  // ============================================
  name: string,                    // ✅ ALWAYS English name (e.g., "Furret", "Oshawott")
  japaneseName: string,           // ✅ Japanese name (for Japanese cards only, e.g., "オタチ")
  nationalDexNumber: number,       // ✅ National Pokedex number (e.g., 162)
  nationalPokedexNumbers: number[], // All dex numbers (for multi-Pokemon cards)
  
  // ============================================
  // SET INFORMATION
  // ============================================
  set: string,                     // Set name (e.g., "Darkness Ablaze")
  setCode: string,                 // Set code (e.g., "swsh3")
  setNumber: string,                // Card number in set (e.g., "136" or "136/189")
  releaseYear: number,              // Release year
  series: string,                  // Series name (e.g., "Sword & Shield")
  
  // ============================================
  // CARD TYPE & DETAILS
  // ============================================
  cardType: string,                 // "Pokemon", "Trainer", "Energy"
  supertype: string,                // Same as cardType
  subtypes: string[],               // ["Basic", "Stage1", "EX", etc.]
  stage: string,                    // "Basic", "Stage1", "Stage2", etc.
  rarity: string,                   // "Common", "Uncommon", "Rare", etc.
  
  // ============================================
  // POKEMON-SPECIFIC FIELDS
  // ============================================
  types: string[],                  // ["Fire", "Water", "Grass", etc.]
  hp: number,                       // Hit Points
  level: number,                    // Pokemon level (for older cards)
  evolvesFrom: string,              // Name of Pokemon it evolves from
  evolvesTo: string[],              // Names of Pokemon it evolves to
  
  // ============================================
  // CARD MECHANICS
  // ============================================
  abilities: array,                 // Array of ability objects
  attacks: array,                   // Array of attack objects
  weaknesses: array,                // Array of weakness objects
  resistances: array,               // Array of resistance objects
  retreatCost: number,              // Retreat cost
  convertedRetreatCost: number,     // Converted retreat cost
  flavorText: string,              // Card description/flavor text
  
  // ============================================
  // VARIANTS & EDITIONS
  // ============================================
  isHolo: boolean,                  // Holofoil version
  isReverseHolo: boolean,           // Reverse holofoil version
  isFirstEdition: boolean,          // First edition printing
  isShadowless: boolean,            // Shadowless version (Base Set)
  isFullArt: boolean,               // Full art card
  isRainbow: boolean,               // Rainbow rare
  
  // ============================================
  // METADATA
  // ============================================
  artist: string,                   // Illustrator name
  imageUrl: string,                 // Large card image URL
  thumbnailUrl: string,             // Small card image URL
  
  // ============================================
  // LEGALITIES & PRICING
  // ============================================
  legalities: object,               // { standard: "Legal", expanded: "Legal" }
  tcgplayerPrices: object,         // TCGPlayer pricing data
  cardmarketPrices: object,         // Cardmarket pricing data
  
  // ============================================
  // TIMESTAMPS
  // ============================================
  createdAt: timestamp,             // When card was added
  updatedAt: timestamp              // Last update time
}
```

---

## Grouping Logic

### How We Group Cards by Pokemon

We use **two fields** to group cards:

1. **`name`** - Card name (normalized to remove variations)
2. **`nationalDexNumber`** - National Pokedex number

### Normalization

The `normalizePokemonName()` function removes card variations:
- "Mega Charizard" → "Charizard"
- "Charizard EX" → "Charizard"
- "Erika's Pikachu" → "Pikachu"
- "オタチ" (Japanese) → Still "オタチ" (but grouped with English "Furret" via `nationalDexNumber`)

### Grouping Key

```javascript
const key = nationalDexNumber 
  ? `#${nationalDexNumber}-${normalizedName}` 
  : normalizedName
```

**Example:**
- English: "Furret" (dex #162) → `#162-furret`
- Japanese: "オタチ" (dex #162) → `#162-オタチ`
- Both grouped together because they share `nationalDexNumber: 162`

---

## Collection Structure

### English Cards
- **Collection**: `pokemon`
- **Language**: `language: "en"`
- **Example**: `pokemon/{cardId}` with `name: "Oshawott"`

### Japanese Cards
- **Collection**: `pokemon_ja`
- **Language**: `language: "ja"`
- **Example**: `pokemon_ja/{cardId}` with `name: "ミジュマル"`

### Unified Pokemon List
- **Collection**: `pokemonList`
- **Groups by**: `nationalDexNumber`
- **Aggregates from**: Both `pokemon` and `pokemon_ja` collections
- **Shows**: Base Pokemon name (from `pokemonList.json`)

---

## Example Documents

### English Card
```javascript
{
  apiId: "swsh3-136",
  apiSetId: "swsh3",
  language: "en",
  name: "Furret",                  // ✅ English name
  // japaneseName: undefined        // Not present for English cards
  nationalDexNumber: 162,
  set: "Darkness Ablaze",
  setCode: "swsh3",
  setNumber: "136",
  types: ["Colorless"],
  hp: 110,
  // ... other fields
}
```

### Japanese Card
```javascript
{
  apiId: "swsh3-136",
  apiSetId: "swsh3",
  language: "ja",
  name: "Furret",                  // ✅ ALWAYS English name (for consistent querying)
  japaneseName: "オタチ",          // ✅ Japanese name (for display)
  nationalDexNumber: 162,
  set: "闇の誘惑",
  setCode: "swsh3",
  setNumber: "136",
  types: ["無色"],
  hp: 110,
  // ... other fields
}
```

### Pokemon List Entry (Aggregated)
```javascript
{
  id: "dex-162-furret",
  nationalDexNumber: 162,
  name: "Furret",                    // Base name from pokemonList.json
  displayName: "Furret",
  cardCount: 8,                      // 5 English + 3 Japanese
  cardIds: ["card1", "card2", ...],  // IDs from both collections
  sets: ["Darkness Ablaze", "..."],
  types: ["Colorless"],
  // ... other fields
}
```

---

## Key Points

✅ **`name` field is ALWAYS English** - Used for grouping, querying, and display (consistent across all cards)
✅ **`japaneseName` field** - Only present on Japanese cards, stores the Japanese name (e.g., "オタチ")
✅ **`nationalDexNumber` is REQUIRED** - Used for grouping across languages
✅ **Both collections use same schema** - Only `language` field differs
✅ **Grouping works across languages** - English and Japanese cards group together via `nationalDexNumber` and `name` (both have same English name)
✅ **Display formatting** - Japanese cards show as "オタチ (Furret)" in UI using `formatCardName()` utility
✅ **Consistent querying** - You can always query/filter by `name` field and get English names

## Display Formatting

We use `formatCardName()` utility to format card names:
- **Japanese cards**: "オタチ (Furret)" - Shows `japaneseName` first, then `name` (English) in parentheses
- **English cards**: "Furret" - Shows just the `name` field (English)

This approach ensures:
- `name` is always English for consistent querying/filtering
- Users can see Japanese names with English translations
- Grouping works seamlessly (both cards have same `name` value)

