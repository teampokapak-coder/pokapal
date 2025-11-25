# Japanese Cards Integration Strategy

## Current Structure

### Collections
- **`pokemon`** - English cards (one document per card)
- **`sets`** - English sets (one document per set)
- **`pokemonList`** - Aggregated Pokemon data (grouped by nationalDexNumber, base names only)

### Key Functions
- `normalizePokemonName()` - Removes variations like "Erika's", "Mega", "EX", etc.
- `groupPokemonByBase()` - Groups cards by nationalDexNumber, shows only base Pokemon
- Pokemon detail page queries `pokemon` collection and filters by normalized name + dex number

---

## Proposed Structure

### Collections

#### 1. Cards Collections
- **`pokemon`** (existing) - English cards
- **`pokemon_ja`** (new) - Japanese cards
  - Same schema as `pokemon`
  - Add `language: "ja"` field to distinguish

#### 2. Sets Collections
**Option A: Single Collection with Language Field** (Recommended)
- **`sets`** (modified) - All sets (English + Japanese)
  - Add `language: "en" | "ja"` field
  - Filter by language in UI

**Option B: Separate Collections**
- **`sets`** (existing) - English sets
- **`sets_ja`** (new) - Japanese sets

**Recommendation: Option A** - Single collection with language filter is cleaner and easier to query

#### 3. Pokemon List Collection
**Unified Approach** (Recommended)
- **`pokemonList`** (existing) - Single unified list
  - Already groups by `nationalDexNumber`
  - Already normalizes names (removes "Erika's", etc.)
  - Will aggregate cards from BOTH `pokemon` and `pokemon_ja` collections
  - Shows only base Pokemon (e.g., "Pikachu", not "Erika's Pikachu")

**Why Unified?**
- Pokemon are the same regardless of language (Pikachu is Pikachu)
- `nationalDexNumber` is universal
- Normalization already handles variations
- Single source of truth for Pokemon browsing

---

## Data Flow

### 1. Seeding Japanese Cards

**New Function: `seedJapaneseCardsFromSet()`**
```javascript
// Similar to seedCardsFromSet() but:
// - Fetches from TCGdx API (Japanese endpoint)
// - Stores in `pokemon_ja` collection
// - Maps TCGdx format → our schema
// - Adds `language: "ja"` field
```

**New Function: `seedJapaneseSets()`**
```javascript
// Fetches Japanese sets from TCGdx API
// Stores in `sets` collection with `language: "ja"`
```

### 2. Pokemon List Aggregation

**Modified Function: `buildPokemonList()`**
```javascript
// Current: Queries only `pokemon` collection
// New: Queries BOTH `pokemon` AND `pokemon_ja` collections
// Groups by nationalDexNumber (same logic)
// Aggregates card counts from both languages
// Shows only base Pokemon (normalization handles this)
```

### 3. Pokemon Detail Page

**Modified Function: `loadCards()` in PokemonDetail.vue**
```javascript
// Current: Queries only `pokemon` collection
// New: Queries BOTH `pokemon` AND `pokemon_ja` collections
// Filters by normalized name + nationalDexNumber
// Shows all cards together (English + Japanese)
// Can add language badge/indicator if desired
```

### 4. Sets Page

**Modified: AllSets.vue**
```javascript
// Add language filter dropdown:
// - "All Languages"
// - "English"
// - "Japanese"

// Filter sets by language field
// Show sets from both languages together (or filtered)
```

---

## Schema Changes

### Cards (`pokemon` and `pokemon_ja`)
```javascript
{
  // Existing fields...
  language: "en" | "ja",  // NEW: Add to distinguish language
  // All other fields remain the same
}
```

### Sets (`sets`)
```javascript
{
  // Existing fields...
  language: "en" | "ja",  // NEW: Add to distinguish language
  // All other fields remain the same
}
```

### Pokemon List (`pokemonList`)
```javascript
{
  // No changes needed!
  // Already groups by nationalDexNumber
  // Already normalizes names
  // Will automatically aggregate from both collections
}
```

---

## Implementation Steps

### Phase 1: Setup & Mapping
1. ✅ Create TCGdx API utility (`tcgdxAPI.js`)
   - Functions to fetch Japanese sets/cards
   - Map TCGdx format → our schema
   - Handle language field

2. ✅ Add language field to existing collections
   - Update `pokemon` collection: add `language: "en"` to all existing cards
   - Update `sets` collection: add `language: "en"` to all existing sets

### Phase 2: Seeding Functions
3. ✅ Create `seedJapaneseSets()` function
   - Fetch from TCGdx API (`/ja/series`)
   - Store in `sets` collection with `language: "ja"`

4. ✅ Create `seedJapaneseCardsFromSet()` function
   - Fetch from TCGdx API (`/ja/sets/{setId}`)
   - Store in `pokemon_ja` collection
   - Map TCGdx card format → our schema

### Phase 3: Aggregation Updates
5. ✅ Update `buildPokemonList()` function
   - Query both `pokemon` and `pokemon_ja` collections
   - Aggregate card counts
   - Group by nationalDexNumber (existing logic works)

6. ✅ Update `getAllPokemonCards()` function
   - Add optional `language` filter parameter
   - Query both collections when needed

7. ✅ Update PokemonDetail.vue `loadCards()`
   - Query both collections
   - Merge results
   - Show all cards together

### Phase 4: UI Updates
8. ✅ Update AllSets.vue
   - Add language filter dropdown
   - Filter sets by language
   - Show language indicator/badge

9. ✅ Update PokemonDetail.vue (optional)
   - Add language badge/indicator on cards
   - Or keep unified (no distinction needed)

---

## Key Questions Answered

### Q: Do we need separate `pokemonList_ja` collection?
**A: No!** Unified `pokemonList` works because:
- Pokemon are identified by `nationalDexNumber` (universal)
- Normalization already handles variations ("Erika's Pikachu" → "Pikachu")
- Single list is cleaner and easier to maintain
- Aggregation logic already groups by dex number

### Q: How do we handle set IDs?
**A: Same set IDs across languages**
- TCGdx uses same set IDs (e.g., `swsh3` = Darkness Ablaze in both languages)
- We can link English and Japanese sets by `apiId` or `setCode`
- Or store separately and filter by language

### Q: How do we handle card IDs?
**A: Same card IDs across languages**
- TCGdx uses same card IDs (e.g., `swsh3-136` = Furret in both languages)
- Store in separate collections (`pokemon` vs `pokemon_ja`)
- Query both when displaying Pokemon detail page

### Q: What about Pokemon names?
**A: Normalization handles it**
- English: "Furret"
- Japanese: "オタチ" (Otachi)
- Both map to same `nationalDexNumber: 162`
- `groupPokemonByBase()` already handles this
- Pokemon list shows English name (from `pokemonList.json`)

---

## Example Data Flow

### Seeding Japanese Set
```
1. Fetch from TCGdx: GET /ja/sets/swsh3
2. Map to our schema:
   {
     apiId: "swsh3",
     name: "闇の誘惑",  // Japanese name
     language: "ja",
     ...
   }
3. Store in `sets` collection
```

### Seeding Japanese Cards
```
1. Fetch from TCGdx: GET /ja/sets/swsh3
2. For each card:
   {
     apiId: "swsh3-136",
     name: "オタチ",  // Japanese name
     nationalDexNumber: 162,
     language: "ja",
     ...
   }
3. Store in `pokemon_ja` collection
```

### Building Pokemon List
```
1. Query `pokemon` collection (English cards)
2. Query `pokemon_ja` collection (Japanese cards)
3. Group by nationalDexNumber:
   - Furret (162): 5 English cards + 3 Japanese cards = 8 total
4. Store in `pokemonList`:
   {
     nationalDexNumber: 162,
     name: "Furret",  // English name from pokemonList.json
     cardCount: 8,  // Aggregated from both languages
     ...
   }
```

### Displaying Pokemon Detail
```
1. User clicks on Furret (nationalDexNumber: 162)
2. Query `pokemon` collection: WHERE nationalDexNumber == 162
3. Query `pokemon_ja` collection: WHERE nationalDexNumber == 162
4. Merge results
5. Display all 8 cards together (5 English + 3 Japanese)
```

---

## Benefits of This Approach

✅ **Unified Pokemon List** - Single source of truth, no duplication
✅ **Language Separation** - Cards stored separately, easy to query
✅ **Existing Logic Works** - Normalization and grouping already handle variations
✅ **Flexible Filtering** - Can filter by language when needed
✅ **Scalable** - Easy to add more languages later (just add `pokemon_fr`, etc.)

---

## Admin UI Implementation

### Current Admin Flow (English)
1. **"Fetch Cards by Set"** section
   - Shows all sets from `sets` collection
   - "Fetch Cards" button → calls `seedCardsFromSet()` → adds to `pokemon` collection

2. **"Update with Card Data: Build from Cards"** button
   - Calls `buildPokemonList()` → queries `pokemon` collection → updates `pokemonList`

### New Admin Flow (Japanese)

#### Option 1: Separate Section (Recommended)
Add new section: **"Fetch Japanese Cards by Set"**
- Shows all Japanese sets (filtered by `language: "ja"` from `sets` collection)
- "Fetch Cards" button → calls `seedJapaneseCardsFromSet()` → adds to `pokemon_ja` collection
- Same UI pattern as English section

#### Option 2: Combined Section with Language Filter
Modify existing **"Fetch Cards by Set"** section:
- Add language filter dropdown: "English" / "Japanese" / "All"
- Filter sets by language
- "Fetch Cards" button → detects language → calls appropriate function

**Recommendation: Option 1** - Clearer separation, easier to understand

### Updated "Build from Cards" Function

**Current**: `buildPokemonList()`
- Queries only `pokemon` collection
- Groups by nationalDexNumber
- Updates `pokemonList`

**New**: `buildPokemonList()` (updated)
- Queries BOTH `pokemon` AND `pokemon_ja` collections
- Groups by nationalDexNumber (same logic)
- Aggregates card counts from both languages
- Updates `pokemonList` with unified data

**No changes needed to UI** - Same button, same function, just queries both collections!

---

## Implementation Checklist

### Phase 1: Setup
- [ ] Create TCGdx API utility (`tcgdxAPI.js`)
- [ ] Add `language: "en"` to all existing `pokemon` documents
- [ ] Add `language: "en"` to all existing `sets` documents

### Phase 2: Japanese Seeding Functions
- [ ] Create `seedJapaneseSets()` - Fetch from TCGdx, store in `sets` with `language: "ja"`
- [ ] Create `seedJapaneseCardsFromSet(setId)` - Fetch from TCGdx, store in `pokemon_ja`

### Phase 3: Update Aggregation
- [ ] Update `buildPokemonList()` - Query both `pokemon` and `pokemon_ja` collections
- [ ] Update `getAllPokemonCards()` - Add optional language filter
- [ ] Update PokemonDetail.vue `loadCards()` - Query both collections

### Phase 4: Admin UI
- [ ] Add "Fetch Japanese Cards by Set" section to Admin.vue
- [ ] Add "Fetch Cards" button for Japanese sets → calls `seedJapaneseCardsFromSet()`
- [ ] Update "Build from Cards" description to mention both languages
- [ ] (Optional) Add language filter to sets page

---

## Next Steps

1. ✅ Review and confirm this strategy
2. Create TCGdx API utility
3. Add language fields to existing collections
4. Create Japanese seeding functions
5. Update aggregation logic (`buildPokemonList()`)
6. Update Admin UI with Japanese section

