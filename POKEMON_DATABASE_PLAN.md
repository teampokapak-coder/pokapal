# Pokemon Database Structure Plan

## Overview
Create a comprehensive `pokemonList` collection that serves as the master Pokemon database, with all Pokemon data, variants, sprites, and GIFs.

---

## Current State

### How We Currently Pull Pokemon Data
- **Source**: Static JSON file (`pokemonList.json`)
- **Data**: Just `{nationalDexNumber, name}` pairs (1025 entries)
- **Sprites**: Generated from PokéSprite utility (local)
- **GIFs**: Generated from PokemonDB utility (local)
- **No API**: We don't pull Pokemon data from an external API

### Current `pokemonList` Structure
```javascript
{
  name: "Bulbasaur",
  displayName: "Bulbasaur",
  nationalDexNumber: 1,
  types: [], // From cards later
  spriteUrl: "...", // PokéSprite
  spriteUrls: {...}, // All sprite variants
  cardCount: 0,
  cardIds: [],
  japCardIds: [],
  sets: []
}
```

---

## Proposed Structure

### Option 1: Enhanced `pokemonList` with Variants Array (Recommended)
```javascript
{
  // Document ID: "dex-1-bulbasaur"
  
  // Basic Info
  name: "Bulbasaur",
  displayName: "Bulbasaur",
  nationalDexNumber: 1,
  
  // Pokemon Data (from PokeAPI or static)
  height: 7,              // decimeters
  weight: 69,             // hectograms
  baseExperience: 64,
  types: ["Grass", "Poison"], // Primary types
  abilities: [...],       // Pokemon abilities
  stats: {
    hp: 45,
    attack: 49,
    defense: 49,
    specialAttack: 65,
    specialDefense: 65,
    speed: 45
  },
  
  // Variants Array (all card variants)
  variants: [
    {
      name: "Bulbasaur",           // Base name
      variantType: "base",         // "base", "mega", "gx", "v", "trainer", "shiny"
      displayName: "Bulbasaur",    // Full display name
      cardIds: ["card1", "card2"], // Card IDs for this variant
      japCardIds: ["jap1"],        // Japanese card IDs
      imageUrl: "...",             // Best card image for this variant
      count: 15                    // Number of cards
    },
    {
      name: "Bulbasaur",
      variantType: "trainer",
      displayName: "Erika's Bulbasaur",
      cardIds: ["card3"],
      japCardIds: [],
      imageUrl: "...",
      count: 1
    },
    {
      name: "Bulbasaur",
      variantType: "mega",
      displayName: "Mega Bulbasaur",
      cardIds: ["card4"],
      japCardIds: [],
      imageUrl: "...",
      count: 1
    }
  ],
  
  // Aggregated Card Data
  cardIds: ["card1", "card2", "card3", "card4"], // All English cards
  japCardIds: ["jap1"],                          // All Japanese cards
  cardCount: 17,                                 // Total English cards
  japCardCount: 1,                               // Total Japanese cards
  
  // Images & Sprites
  spriteUrl: "...",                              // Primary sprite
  spriteUrls: {
    regular: "...",
    shiny: "...",
    mega: "...",
    // etc.
  },
  gifUrl: "...",                                 // Primary GIF
  gifUrls: {
    regular: "...",
    shiny: "...",
    // etc.
  },
  
  // Set Info
  sets: ["Base Set", "Jungle", ...],            // Sets this Pokemon appears in
  
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Option 2: Sub-collection for Variants
```javascript
// pokemonList/{dex-1-bulbasaur}
{
  name: "Bulbasaur",
  nationalDexNumber: 1,
  // ... base Pokemon data
}

// pokemonList/{dex-1-bulbasaur}/variants/{variantId}
{
  variantType: "base",
  displayName: "Bulbasaur",
  cardIds: [...],
  // ... variant-specific data
}
```

**Recommendation: Option 1 (Variants Array)** - Simpler queries, easier to display

---

## How to Pull Pokemon Data

### Option A: Use PokeAPI (pokeapi.co)
**Pros:**
- ✅ Comprehensive Pokemon data (height, weight, stats, abilities, types)
- ✅ Free, no API key
- ✅ Well-maintained
- ✅ Has all 1025 Pokemon

**Cons:**
- ⚠️ Separate API call per Pokemon (1025 calls)
- ⚠️ Rate limits (but generous)
- ⚠️ Different from TCG data

**API Endpoint:**
```
https://pokeapi.co/api/v2/pokemon/{nationalDexNumber}/
```

**Example Response:**
```json
{
  "id": 1,
  "name": "bulbasaur",
  "height": 7,
  "weight": 69,
  "base_experience": 64,
  "types": [
    {
      "type": {
        "name": "grass"
      }
    },
    {
      "type": {
        "name": "poison"
      }
    }
  ],
  "abilities": [...],
  "stats": [...],
  "sprites": {
    "front_default": "...",
    "front_shiny": "...",
    // etc.
  }
}
```

### Option B: Use Static JSON + Generate Sprites Locally (Current)
**Pros:**
- ✅ Fast (no API calls)
- ✅ Already working
- ✅ No rate limits

**Cons:**
- ❌ Limited data (just name and dex number)
- ❌ No Pokemon stats/abilities
- ❌ Sprites generated locally (may not have all variants)

**Recommendation: Option A (PokeAPI)** - Richer data, better for displaying Pokemon info

---

## Proposed Workflow

### Step 1: Seed Base Pokemon List from PokeAPI
**Button:** "Seed Pokemon Database from PokeAPI"
- Function: `seedPokemonDatabaseFromPokeAPI()`
- Fetches Pokemon data from PokeAPI (1-1025)
- Creates `pokemonList` entries with:
  - Basic info (name, dex number)
  - Pokemon stats (height, weight, base experience)
  - Types, abilities, stats
  - PokeAPI sprite URLs
- **No variants yet** - just base Pokemon

### Step 2: Add Sprites & GIFs
**Button:** "Add Pokemon Sprites & GIFs"
- Function: `updatePokemonSpritesFromDB()` (existing)
- Generates sprite/GIF URLs from `nationalDexNumber`
- Updates `pokemonList.spriteUrl`, `spriteUrls`, `gifUrl`, `gifUrls`
- Adds all variants (regular, shiny, mega, etc.)

### Step 3: Fetch Sets & Cards
- Same as before (sets → cards)
- Cards get `nationalDexNumber` from API

### Step 4: Build Pokemon List with Variants
**Button:** "Build Pokemon List with Variants"
- Function: `buildPokemonListWithVariants()` (NEW)
- Groups cards by `nationalDexNumber`
- Creates variant entries based on card names:
  - "Bulbasaur" → `variantType: "base"`
  - "Erika's Bulbasaur" → `variantType: "trainer"`
  - "Mega Bulbasaur" → `variantType: "mega"`
  - "Bulbasaur EX" → `variantType: "ex"`
  - "Shiny Bulbasaur" → `variantType: "shiny"`
- Updates `pokemonList.variants[]` array
- Updates `pokemonList.cardIds[]` and `japCardIds[]`

---

## Variant Detection Logic

```javascript
const detectVariantType = (cardName, baseName) => {
  const name = cardName.toLowerCase()
  const base = baseName.toLowerCase()
  
  // Remove base name to get variant part
  const variantPart = name.replace(base, '').trim()
  
  if (variantPart.includes("mega")) return "mega"
  if (variantPart.includes("gx")) return "gx"
  if (variantPart.includes("ex")) return "ex"
  if (variantPart.includes("vmax")) return "vmax"
  if (variantPart.includes("vstar")) return "vstar"
  if (variantPart.includes("v ")) return "v"
  if (variantPart.includes("shiny")) return "shiny"
  if (variantPart.includes("'s") || variantPart.includes("'")) return "trainer"
  if (variantPart.includes("&")) return "tag-team"
  
  return "base" // Default
}
```

---

## Displaying Variants

### On Pokemon Detail Page
```vue
<template>
  <div>
    <h1>{{ pokemon.name }}</h1>
    
    <!-- Base Pokemon Info -->
    <div>Dex #{{ pokemon.nationalDexNumber }}</div>
    <div>Types: {{ pokemon.types.join(', ') }}</div>
    
    <!-- Variants Section -->
    <div v-for="variant in pokemon.variants" :key="variant.variantType">
      <h3>{{ variant.displayName }}</h3>
      <p>{{ variant.count }} cards</p>
      <div class="cards-grid">
        <!-- Show cards for this variant -->
      </div>
    </div>
  </div>
</template>
```

---

## Questions to Confirm

1. **Pokemon Data Source**: Use PokeAPI to enrich Pokemon data? (height, weight, stats, abilities)
2. **Variants Storage**: Store variants as array in `pokemonList` document? (Option 1)
3. **Variant Types**: Track variant types (base, mega, trainer, shiny, etc.)?
4. **Display**: Show variants grouped under each Pokemon on detail page?
5. **Sprites**: Keep current sprite/GIF generation (PokéSprite + PokemonDB)?

---

## Updated Schema: `pokemonList`

```javascript
{
  // Document ID: "dex-1-bulbasaur"
  
  // Basic Info
  name: "Bulbasaur",                    // Base name
  displayName: "Bulbasaur",            // Display name
  nationalDexNumber: 1,                // Primary key
  
  // Pokemon Data (from PokeAPI)
  height: 7,                            // decimeters
  weight: 69,                           // hectograms
  baseExperience: 64,
  types: ["Grass", "Poison"],          // Primary types
  abilities: [
    {
      name: "Overgrow",
      isHidden: false
    },
    {
      name: "Chlorophyll",
      isHidden: true
    }
  ],
  stats: {
    hp: 45,
    attack: 49,
    defense: 49,
    specialAttack: 65,
    specialDefense: 65,
    speed: 45
  },
  
  // Variants Array
  variants: [
    {
      variantType: "base",              // "base", "mega", "trainer", "shiny", etc.
      displayName: "Bulbasaur",
      cardIds: ["card1", "card2"],
      japCardIds: [],
      imageUrl: "...",                  // Best card image
      count: 15
    },
    {
      variantType: "trainer",
      displayName: "Erika's Bulbasaur",
      cardIds: ["card3"],
      japCardIds: [],
      imageUrl: "...",
      count: 1
    }
  ],
  
  // Aggregated Card References
  cardIds: ["card1", "card2", "card3"], // All English cards
  japCardIds: ["jap1"],                // All Japanese cards
  cardCount: 16,                        // Total English cards
  japCardCount: 1,                      // Total Japanese cards
  
  // Images & Sprites
  spriteUrl: "...",                     // Primary sprite
  spriteUrls: {
    regular: "...",
    shiny: "...",
    mega: "...",
    // etc.
  },
  gifUrl: "...",                        // Primary GIF
  gifUrls: {
    regular: "...",
    shiny: "...",
    // etc.
  },
  
  // Set Info
  sets: ["Base Set", "Jungle", ...],
  
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## Next Steps

1. **Confirm Pokemon Data Source**: PokeAPI or static JSON?
2. **Confirm Variant Structure**: Array or sub-collection?
3. **Create Functions**:
   - `seedPokemonDatabaseFromPokeAPI()` - Fetch from PokeAPI
   - `buildPokemonListWithVariants()` - Group cards into variants
4. **Update UI**: Show variants on Pokemon detail page

