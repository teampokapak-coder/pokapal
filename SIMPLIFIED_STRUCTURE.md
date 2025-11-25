# Simplified Collection Structure - Implementation Summary

## ✅ Completed

### 1. New Collection Structure
- **`pokemon`** - Base Pokemon data from pokemonList.json (replaces `pokemonList`)
- **`set_en`** - English sets from TCGdx (replaces `sets`)
- **`set_ja`** - Japanese sets from TCGdx (replaces `setJA`)
- **`card_en`** - English cards from TCGdx (replaces `pokemon`)
- **`card_ja`** - Japanese cards from TCGdx (replaces `pokemon_ja`)

### 2. Simplified Seeder (`src/utils/simplifiedSeeder.js`)
- ✅ `seedPokemonCollection()` - Seeds `pokemon` collection from pokemonList.json
- ✅ `seedSets(language)` - Seeds sets for `en` or `ja` → `set_en` or `set_ja`
- ✅ `seedCardsForSet(setId, language)` - Seeds cards → `card_en` or `card_ja`
- ✅ Always uses `.webp` extension for all images (logos, symbols, card images)
- ✅ Automatic `nationalDexNumber` matching from card names
- ✅ Supports `name_ja` field for Japanese Pokemon matching

### 3. Simplified Admin Panel (`src/views/AdminSimplified.vue`)
- ✅ Clean, simple UI with status cards
- ✅ Seed Pokemon collection button
- ✅ Fetch English/Japanese sets buttons
- ✅ Fetch cards by set ID (English/Japanese)
- ✅ Real-time collection counts
- ✅ Success/error messaging

### 4. Router Updated
- ✅ `/admin` route now uses `AdminSimplified.vue`

## 📋 Ready for Implementation

### pokemonList.json Structure
The JSON is ready to accept `name_ja` field:
```json
{
  "nationalDexNumber": 1,
  "name": "Bulbasaur",
  "name_ja": "フシギダネ",  // ← Add this field
  "spriteUrl": "...",
  "gifUrl": "...",
  "types": ["Grass", "Poison"]
}
```

When you add `name_ja` to pokemonList.json, the seeder will automatically use it for matching Japanese card names.

## 🔄 Next Steps (Views to Update)

### Priority 1: Core Views
1. **Home.vue** - Update to use `set_en` for featured sets
2. **AllSets.vue** - Query both `set_en` and `set_ja`
3. **SetDetail.vue** - Query `set_en` or `set_ja`, then `card_en` or `card_ja`
4. **PokemonDetail.vue** - Query `pokemon` collection, then `card_en` and `card_ja` by `nationalDexNumber`
5. **BrowseCards.vue** - Query `card_en` and `card_ja`
6. **BrowsePokemon.vue** - Query `pokemon` collection

### Priority 2: Utility Functions
- Update `firebasePokemon.js` to use new collection names
- Update any other utilities that reference old collections

## 🎯 Key Features

### Image URLs
- **Sets**: Logo and symbol URLs always use `.webp` extension
- **Cards**: Image URLs use `/high.webp` and `/low.webp` format
- Format: `https://assets.tcgdex.net/{lang}/{series}/{set}/{localId}/high.webp`

### National Dex Number Matching
The seeder automatically matches card names to Pokemon:
1. Normalizes card name (removes "Mega", "EX", "Erika's", etc.)
2. Matches against `pokemon.name` (English)
3. Matches against `pokemon.name_ja` (Japanese, when available)
4. Sets `nationalDexNumber` on card document

### Collection Naming Convention
- Pattern: `{type}_{language}`
- Examples: `set_en`, `set_ja`, `card_en`, `card_ja`
- Base collections: `pokemon` (no language suffix)

## 🚀 Usage

### 1. Seed Pokemon Collection
```javascript
// In Admin panel, click "Seed Pokemon Collection"
// Reads from pokemonList.json and creates/updates pokemon collection
```

### 2. Fetch Sets
```javascript
// English sets
seedSets('en') // → set_en collection

// Japanese sets  
seedSets('ja') // → set_ja collection
```

### 3. Fetch Cards
```javascript
// English cards from a set
seedCardsForSet('swsh3', 'en') // → card_en collection

// Japanese cards from a set
seedCardsForSet('SV11W', 'ja') // → card_ja collection
```

## 📝 Notes

- All images use `.webp` format (faster loading, smaller file size)
- Duplicate prevention: Uses `apiId` + `language` to prevent duplicates
- Updates existing documents instead of creating duplicates
- National dex number matching works for both English and Japanese cards
- When `name_ja` is added to pokemonList.json, Japanese card matching will improve

