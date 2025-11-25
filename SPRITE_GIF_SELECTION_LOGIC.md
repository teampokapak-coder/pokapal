# Sprite & GIF Selection Logic

## Current Selection Process

### **Sprites**
1. **Source Priority**: Uses `SPRITE_SOURCES.AUTO` by default
   - **Primary**: PokemonDB (generation-based sprites)
   - **Fallback**: PokéSprite (Gen 8 sprites)

2. **Generation Selection**: Based on `nationalDexNumber`
   - Gen 9 (906-1025): `scarlet-violet`
   - Gen 8 (810-905): `sword-shield`
   - Gen 7 (722-809): `ultra-sun-ultra-moon`
   - Gen 6 (650-721): `x-y`
   - Gen 5 (494-649): `black-white`
   - Gen 4 (387-493): `diamond-pearl`
   - Older: `diamond-pearl` (fallback)

3. **Returns**: Multiple variants
   ```javascript
   {
     spriteUrl: "https://img.pokemondb.net/sprites/sword-shield/normal/pikachu.png", // PRIMARY
     normal: "...",
     shiny: "...",
     back: "...",
     backShiny: "...",
     source: "pokemondb",
     generation: "sword-shield",
     fallback: {
       pokesprite: "https://cdn.jsdelivr.net/.../pikachu.png"
     }
   }
   ```

### **GIFs**
1. **Source**: PokemonDB only
2. **Generation**: Always `black-white` (best GIF coverage)
3. **Returns**: Multiple variants
   ```javascript
   {
     gifUrl: "https://img.pokemondb.net/sprites/black-white/anim/normal/pikachu.gif", // PRIMARY
     normal: "...",
     shiny: "...",
     back: "...",
     backShiny: "...",
     source: "pokemondb",
     generation: "black-white"
   }
   ```

---

## If JSON Has Just ONE Sprite URL & ONE GIF URL

### **Current Behavior**
If you add `spriteUrl` and `gifUrl` directly to `pokemonList.json`:

```json
{
  "nationalDexNumber": 25,
  "name": "Pikachu",
  "spriteUrl": "https://example.com/pikachu.png",
  "gifUrl": "https://example.com/pikachu.gif"
}
```

**What happens:**
1. ✅ **If URLs exist in JSON**: They would be used as-is (no generation logic)
2. ⚠️ **Problem**: Current seeding functions **overwrite** JSON URLs with generated ones
3. ⚠️ **Problem**: No variants (just the single URL)

### **Proposed Behavior** (if we update the code)
```javascript
// Priority order:
1. Use spriteUrl/gifUrl from JSON if present
2. Generate from PokemonDB if JSON missing
3. Fallback to PokéSprite for sprites
```

**Implementation would be:**
```javascript
const spriteUrl = pokemon.spriteUrl || generateSpriteUrl(...)
const gifUrl = pokemon.gifUrl || generateGifUrl(...)
```

---

## Separate `sprites` Collection? 🤔

### **Current Architecture**
```
pokemonList (1025 docs)
├── Each doc has spriteUrl, spriteUrls, gifUrl, gifUrls
└── Sprites stored inline with Pokemon data
```

### **Proposed Architecture**
```
sprites (one doc per sprite URL)
├── Document structure:
│   {
│     spriteUrl: "https://...",
│     spriteType: "normal" | "shiny" | "back" | "backShiny",
│     source: "pokemondb" | "pokesprite" | "custom",
│     generation: "sword-shield",
│     nationalDexNumbers: [25, 172, ...], // Which Pokemon use this sprite
│     pokemonNames: ["Pikachu", "Pichu", ...]
│   }
│
pokemonList (1025 docs)
├── References sprite documents
└── spriteRefs: ["spriteDocId1", "spriteDocId2", ...]
```

### **Pros of Separate Collection**
✅ **Centralized Management**: Update one sprite, affects all Pokemon using it
✅ **Deduplication**: Multiple Pokemon can share the same sprite (e.g., Pikachu variants)
✅ **Metadata**: Store sprite-specific info (dimensions, source, last validated)
✅ **Easier Updates**: Change sprite source globally without touching 1025 docs
✅ **Variant Organization**: Group all sprites by type (normal, shiny, mega, etc.)
✅ **Scalability**: Can add sprite variants without bloating pokemonList docs

### **Cons of Separate Collection**
❌ **Complexity**: Need to join/query two collections
❌ **More Queries**: Fetch Pokemon, then fetch sprites
❌ **Overhead**: For simple use case, might be overkill
❌ **Migration**: Would need to migrate existing data

### **Hybrid Approach** (Recommended)
```
pokemonList (1025 docs)
├── spriteUrl: "https://..." (primary, for quick access)
├── spriteRefs: ["spriteId1", "spriteId2"] (optional, for variants)
└── gifUrl: "https://..." (primary)

sprites (optional collection)
├── Only for variants/special cases
└── Referenced when needed
```

**Benefits:**
- Fast queries (spriteUrl in pokemonList)
- Flexible (can add variants via sprites collection)
- Backward compatible (existing code still works)

---

## Recommendation

### **For Your Use Case:**

1. **If JSON has ONE sprite + ONE GIF per Pokemon:**
   - ✅ **Keep it simple**: Store directly in `pokemonList`
   - ✅ **Update seeding**: Check JSON first, generate only if missing
   - ✅ **No separate collection needed**

2. **If you want variants later (mega, shiny, etc.):**
   - ✅ **Start with inline storage** (spriteUrl, gifUrl in pokemonList)
   - ✅ **Add variants array** in pokemonList:
     ```javascript
     variants: [
       { type: "normal", spriteUrl: "...", gifUrl: "..." },
       { type: "shiny", spriteUrl: "...", gifUrl: "..." },
       { type: "mega", spriteUrl: "...", gifUrl: "..." }
     ]
     ```
   - ✅ **Consider separate collection** only if variants become complex

3. **If you want to share sprites across Pokemon:**
   - ✅ **Use separate `sprites` collection**
   - ✅ **Reference from pokemonList**: `spriteRefs: ["spriteId"]`

---

## Implementation Plan

### **Option A: Simple (JSON URLs take priority)**
```javascript
// In seedPokemonListFromJSON()
const spriteUrl = pokemon.spriteUrl || generateSpriteUrl(pokemon.name, pokemon.nationalDexNumber)
const gifUrl = pokemon.gifUrl || generateGifUrl(pokemon.name, pokemon.nationalDexNumber)

// Store in pokemonList
{
  spriteUrl: spriteUrl,
  gifUrl: gifUrl,
  spriteUrls: { spriteUrl }, // Simple object
  gifUrls: { gifUrl } // Simple object
}
```

### **Option B: Separate Collection**
```javascript
// 1. Create sprites collection
// 2. Store sprite documents
// 3. Reference from pokemonList
{
  spriteRef: "spriteDocId",
  gifRef: "gifDocId"
}
```

**Which do you prefer?** I'd recommend **Option A** for now (simpler, faster), with the ability to migrate to **Option B** later if needed.

