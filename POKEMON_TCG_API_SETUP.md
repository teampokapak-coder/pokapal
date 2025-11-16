# Pokemon TCG API Integration

## Overview

We're now using the [Pokemon TCG API](https://pokemontcg.io/) to fetch card data instead of manual entry. This provides:

- **Complete dataset**: All cards from Base Set through Sword & Shield
- **Hi-res images**: Card images included
- **Prices**: TCGplayer and Cardmarket prices
- **Always up-to-date**: New sets available on launch day
- **Rich metadata**: Abilities, attacks, weaknesses, legalities, and more

## Architecture

### Data Flow

1. **Fetch from API** → Pokemon TCG API (pokemontcg.io)
2. **Store in Firestore** → Your own database with API IDs for reference
3. **Query locally** → Fast queries, offline support, custom fields

### Why Copy to Firestore?

- ✅ **Faster queries** for user collections/progress
- ✅ **Offline support** 
- ✅ **Custom fields** (like master set groupings)
- ✅ **No rate limits** on your own data
- ✅ **Enrich with metadata** (user notes, completion status, etc.)

## Setup

### 1. API Key

Your API key is already configured in `src/utils/pokemonTCGAPI.js`:
```
API_KEY: '34317d16-2f3e-47d5-93e3-6b631dde821f'
```

### 2. Seed Sets

1. Go to `/admin`
2. Click **"Fetch All Sets from API"**
3. This fetches all sets from Base Set through current releases
4. Only new sets are added (skips duplicates)

### 3. Seed Cards

1. Go to `/admin`
2. Click **"Seed Popular Sets"** to fetch Base Set, Jungle, and Fossil
3. Or use the API functions to fetch specific sets

## API Functions

### Available Functions

**`src/utils/pokemonTCGAPI.js`**
- `fetchAllSets()` - Get all sets from API
- `fetchCardsBySet(setId)` - Get cards from a specific set
- `fetchAllCardsBySet(setId)` - Get all cards (handles pagination)
- `searchCards(query)` - Search cards with Lucene-like syntax
- `mapAPICardToSchema(apiCard)` - Convert API card to our schema
- `mapAPISetToSchema(apiSet)` - Convert API set to our schema

**`src/utils/pokemonTCGSeeder.js`**
- `seedSetsFromAPI()` - Fetch and store all sets
- `seedCardsFromSet(setId)` - Fetch and store cards from a set
- `seedCardsFromSets(setIds)` - Fetch cards from multiple sets
- `seedPopularSets()` - Seed Base Set, Jungle, Fossil

## Data Schema

### Pokemon Card (with API data)

```javascript
{
  // API reference
  apiId: string,              // Pokemon TCG API card ID
  apiSetId: string,           // Pokemon TCG API set ID
  
  // Basic info
  name: string,
  nationalDexNumber: number,
  
  // Set info
  set: string,
  setCode: string,
  setNumber: string,
  releaseYear: number,
  series: string,
  
  // Card details
  rarity: string,
  cardType: string,
  
  // Pokemon-specific
  types: string[],
  stage: string,
  hp: number,
  
  // Variants
  isHolo: boolean,
  isReverseHolo: boolean,
  isFirstEdition: boolean,
  isShadowless: boolean,
  isFullArt: boolean,
  isRainbow: boolean,
  
  // Metadata
  artist: string,
  imageUrl: string,
  thumbnailUrl: string,
  
  // Additional API data
  abilities: array,
  attacks: array,
  weaknesses: array,
  resistances: array,
  retreatCost: number,
  convertedRetreatCost: number,
  flavorText: string,
  legalities: object,
  tcgplayerPrices: object,
  cardmarketPrices: object,
  
  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Set (with API data)

```javascript
{
  // API reference
  apiId: string,
  
  // Set info
  name: string,
  code: string,
  releaseDate: timestamp,
  series: string,
  totalCards: number,
  logo: string,
  
  // Additional API data
  printedTotal: number,
  standardLegal: boolean,
  expandedLegal: boolean,
  
  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Usage Examples

### Fetch Cards from a Specific Set

```javascript
import { seedCardsFromSet } from '@/utils/pokemonTCGSeeder'

// Fetch all cards from Base Set
const result = await seedCardsFromSet('base1')
```

### Search Cards

```javascript
import { searchCards } from '@/utils/pokemonTCGAPI'

// Search for Gardevoir cards
const result = await searchCards('name:gardevoir')

// Search with filters
const result = await searchCards('name:charizard subtypes:mega')
```

### Update Cards Periodically

You can create a scheduled function to update cards when new sets are released:

```javascript
// Check for new sets and cards
const setsResult = await seedSetsFromAPI()
// Then seed cards from new sets
```

## Rate Limits

The API has rate limits. The seeder includes delays to respect these:
- 100ms delay between card batches
- 500ms delay between sets
- Automatic pagination handling

## Manual Entry

Manual card entry is still available at `/admin/pokemon` for:
- Custom cards not in the API
- User-created cards
- Cards with custom metadata

## Next Steps

1. ✅ API integration complete
2. ✅ Seeder functions ready
3. ✅ Admin panel updated
4. 🔄 Consider adding scheduled updates for new sets
5. 🔄 Add sync functionality to update existing cards

## Resources

- [Pokemon TCG API Documentation](https://docs.pokemontcg.io/)
- [API Portal](https://dev.pokemontcg.io/)
- [Discord Community](https://discord.gg/dpsTCvg)

