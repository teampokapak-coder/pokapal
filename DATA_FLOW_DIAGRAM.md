# Data Flow Diagram: English & Japanese Card Integration

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         DATA FLOW                                │
└─────────────────────────────────────────────────────────────────┘

ENGLISH PATH:
┌──────────────┐      ┌──────────────┐      ┌──────────────────┐
│ English Sets │ ────> │ English Cards│ ────> │ English Pokemon  │
│              │       │              │       │ (Grouped)        │
│ - Base Set   │       │ - Charizard  │       │                  │
│ - Jungle     │       │ - Erika's    │       │ Charizard:       │
│ - Fossil     │       │   Bulbasaur  │       │   - cardIds: []  │
└──────────────┘       └──────────────┘       └──────────────────┘
                              │
                              │ nationalDexNumber: 6
                              ▼
                    ┌──────────────────┐
                    │  pokemonList     │
                    │  (Unified)       │
                    │                  │
                    │ Charizard:       │
                    │   - name: "Charizard"
                    │   - nationalDexNumber: 6
                    │   - cardIds: [en1, en2, ...]
                    │   - japCardIds: [ja1, ja2, ...]
                    └──────────────────┘
                              ▲
                              │ nationalDexNumber: 6
                              │
JAPANESE PATH:                │
┌──────────────┐      ┌──────────────┐      ┌──────────────────┐
│ Japanese Sets│ ────> │ Japanese Cards│ ────> │ Japanese Pokemon │
│              │       │              │       │ (Grouped)        │
│ - ベースセット │       │ - リザードン   │       │                  │
│ - ジャングル   │       │ - エリカの    │       │ リザードン:       │
│              │       │   フシギダネ  │       │   - japCardIds: []│
└──────────────┘       └──────────────┘       └──────────────────┘
```

## Linking Strategy

### Key: `nationalDexNumber`

Both English and Japanese cards link to the same Pokemon entry via `nationalDexNumber`:

```
English Card: "Erika's Bulbasaur"
├── name: "Erika's Bulbasaur" (kept as-is)
├── nationalDexNumber: 1 (Bulbasaur)
└── → Links to pokemonList entry with nationalDexNumber: 1

Japanese Card: "エリカのフシギダネ"
├── name: "エリカのフシギダネ" (kept as-is, Japanese)
├── nationalDexNumber: 1 (Bulbasaur)
└── → Links to pokemonList entry with nationalDexNumber: 1
```

## Card Schema

### English Cards (`pokemon` collection)
```javascript
{
  id: "card123",
  name: "Erika's Bulbasaur",           // Original card name
  nationalDexNumber: 1,                // Base Pokemon (Bulbasaur)
  apiId: "base1-15",
  apiSetId: "base1",
  set: "Base Set",
  setNumber: "15",
  language: "en",
  // ... other fields
}
```

### Japanese Cards (`pokemon_ja` collection)
```javascript
{
  id: "card456",
  name: "エリカのフシギダネ",            // Original Japanese name
  nationalDexNumber: 1,                // Base Pokemon (Bulbasaur)
  apiId: "base1-15-ja",
  apiSetId: "base1",
  set: "ベースセット",
  setNumber: "15",
  language: "ja",
  englishSetName: "Base Set",          // English translation
  englishSeries: "Base Series",        // English translation
  // ... other fields
}
```

## pokemonList Schema (Unified Entry)

```javascript
{
  id: "dex-1-bulbasaur",
  name: "Bulbasaur",                   // English name (from pokemonList.json)
  displayName: "Bulbasaur",
  nationalDexNumber: 1,
  
  // English cards
  cardIds: [
    "card123",  // "Bulbasaur"
    "card124",  // "Erika's Bulbasaur"
    "card125",  // "Bulbasaur EX"
  ],
  cardCount: 3,
  
  // Japanese cards
  japCardIds: [
    "card456",  // "フシギダネ"
    "card457",  // "エリカのフシギダネ"
  ],
  japCardCount: 2,
  
  // Other fields
  types: ["Grass", "Poison"],
  imageUrl: "...",
  spriteUrl: "...",
  sets: ["Base Set", "Jungle", ...],
  // ...
}
```

## Grouping Logic

### English Cards → Pokemon Grouping
1. **Normalize card name**: Remove variants (EX, GX, V, VMAX, "Erika's", etc.)
   - "Erika's Bulbasaur" → "Bulbasaur"
   - "Charizard EX" → "Charizard"
   - "Pikachu VMAX" → "Pikachu"

2. **Group by**: `normalizedName + nationalDexNumber`
   - Cards with same normalized name AND same dex number → same Pokemon entry

3. **Store card IDs**: Add all card IDs to `cardIds` array

### Japanese Cards → Pokemon Grouping
1. **Extract base Pokemon**: Use `nationalDexNumber` (primary method)
   - If `nationalDexNumber` exists → use it directly
   - If missing → try to extract from card name:
     - "エリカのフシギダネ" → extract "フシギダネ" → map to English → get dex number

2. **Group by**: `nationalDexNumber` only
   - All cards with same `nationalDexNumber` → same Pokemon entry

3. **Store card IDs**: Add all card IDs to `japCardIds` array

## Build Process

### Step 1: Build English Pokemon List
```
buildPokemonList()
├── Query: getAllPokemonCards({ language: 'en' })
├── Group by: normalizedName + nationalDexNumber
├── Create/Update: pokemonList entries
└── Store: cardIds array
```

### Step 2: Build Japanese Pokemon List
```
buildJapanesePokemonList()
├── Query: getAllPokemonCards({ language: 'ja' })
├── Group by: nationalDexNumber
├── Find: pokemonList entry by nationalDexNumber
└── Update: japCardIds array
```

## Example Flow

### English Card: "Erika's Bulbasaur"
1. Card seeded: `name: "Erika's Bulbasaur"`, `nationalDexNumber: 1`
2. Build process:
   - Normalize: "Erika's Bulbasaur" → "Bulbasaur"
   - Find/Create: pokemonList entry with `nationalDexNumber: 1`
   - Add: card ID to `cardIds` array

### Japanese Card: "エリカのフシギダネ"
1. Card seeded from API: `name: "エリカのフシギダネ"`, `nationalDexNumber: null` (usually missing)
2. Translation process (during seeding):
   - Extract: "エリカのフシギダネ" → "フシギダネ" (remove "エリカの")
   - Translate: "フシギダネ" → "Bulbasaur" (via japanesePokemonNames.json)
   - Lookup: "Bulbasaur" → dex number 1 (via pokemonList.json)
   - Assign: `nationalDexNumber: 1` to card
3. Build process:
   - Use: `nationalDexNumber: 1` (now assigned)
   - Find: pokemonList entry with `nationalDexNumber: 1` (same as English!)
   - Add: card ID to `japCardIds` array

### Result: Unified Pokemon Entry
```javascript
{
  nationalDexNumber: 1,
  name: "Bulbasaur",
  cardIds: ["en_card_1", "en_card_2"],      // English cards
  japCardIds: ["ja_card_1", "ja_card_2"],   // Japanese cards
}
```

## Confirmation Checklist

✅ **English Cards:**
- [x] Card `name` stays as original ("Erika's Bulbasaur")
- [x] Card has `nationalDexNumber` pointing to base Pokemon (from API)
- [x] Grouped by normalized name + dex number
- [x] Card IDs stored in `pokemonList.cardIds`
- [x] Build process: `buildPokemonList()` - processes English cards only

✅ **Japanese Cards:**
- [x] Card `name` stays as original Japanese ("エリカのフシギダネ")
- [x] Card has `nationalDexNumber` pointing to base Pokemon (extracted/filled)
- [x] Grouped by dex number only (no name normalization needed)
- [x] Card IDs stored in `pokemonList.japCardIds`
- [x] Build process: `buildJapanesePokemonList()` - processes Japanese cards, links to existing entries

✅ **Linking:**
- [x] Both languages link via `nationalDexNumber`
- [x] Same Pokemon entry contains both `cardIds` and `japCardIds`
- [x] Build process happens separately but links to same entries
- [x] No translation of card names - names stay in original language

## Implementation Details

### English Card Seeding
- API provides `nationalPokedexNumbers` array
- We use `nationalPokedexNumbers[0]` as `nationalDexNumber`
- Card name stays as-is (e.g., "Erika's Bulbasaur")

### Japanese Card Seeding  
- **Step 1**: Check if API provided `nationalDexNumber` (rarely available)
- **Step 2**: If missing, extract base Pokemon name from card name:
  - "エリカのフシギダネ" → extract "フシギダネ" (possessive pattern)
  - "リザードンVMAX" → extract "リザードン" (variant pattern)
- **Step 3**: Translate Japanese Pokemon name to English:
  - "フシギダネ" → lookup in `japanesePokemonNames.json` → "Bulbasaur"
- **Step 4**: Lookup English name in `pokemonList.json` → get `nationalDexNumber: 1`
- **Step 5**: Assign `nationalDexNumber` to card
- Card name stays as-is (Japanese) - no translation of card names

### Grouping Logic

**English:**
- Key: `#${nationalDexNumber}-${normalizedName}`
- Example: "Erika's Bulbasaur" (dex 1) → key: "#1-bulbasaur"
- All cards with same key → same Pokemon entry

**Japanese:**
- Key: `nationalDexNumber` only
- Example: "エリカのフシギダネ" (dex 1) → key: 1
- All cards with same dex number → same Pokemon entry
- Links to English entry via `nationalDexNumber`

