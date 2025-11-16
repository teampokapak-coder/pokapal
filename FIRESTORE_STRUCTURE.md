# Firestore Data Structure

## Collections Overview

### 1. `pokemon` Collection
**Structure**: One document per Pokemon card

```
pokemon/
  └── {cardId}/                    # Auto-generated document ID
      ├── apiId: string            # Pokemon TCG API card ID (e.g., "base1-4")
      ├── apiSetId: string         # Pokemon TCG API set ID (e.g., "base1")
      ├── name: string            # Card name (e.g., "Charizard")
      ├── nationalDexNumber: number
      ├── set: string              # Set name (e.g., "Base Set")
      ├── setCode: string          # Set code (e.g., "BS")
      ├── setNumber: string        # Card number in set (e.g., "4/102")
      ├── releaseYear: number
      ├── series: string
      ├── rarity: string
      ├── cardType: string         # "Pokemon", "Trainer", "Energy"
      ├── types: string[]          # ["Fire", "Flying"]
      ├── stage: string
      ├── hp: number
      ├── isHolo: boolean
      ├── isReverseHolo: boolean
      ├── isFirstEdition: boolean
      ├── isShadowless: boolean
      ├── isFullArt: boolean
      ├── isRainbow: boolean
      ├── artist: string
      ├── imageUrl: string
      ├── thumbnailUrl: string
      ├── abilities: array
      ├── attacks: array
      ├── weaknesses: array
      ├── resistances: array
      ├── tcgplayerPrices: object
      ├── cardmarketPrices: object
      ├── createdAt: timestamp
      └── updatedAt: timestamp
```

**Example Document**:
```javascript
{
  apiId: "base1-4",
  apiSetId: "base1",
  name: "Charizard",
  nationalDexNumber: 6,
  set: "Base Set",
  setCode: "BS",
  setNumber: "4/102",
  // ... other fields
}
```

### 2. `sets` Collection
**Structure**: One document per card set

```
sets/
  └── {setId}/                     # Auto-generated document ID
      ├── apiId: string            # Pokemon TCG API set ID (e.g., "base1")
      ├── name: string             # "Base Set"
      ├── code: string              # "BS" or "base1"
      ├── releaseDate: timestamp
      ├── series: string
      ├── totalCards: number
      ├── logo: string
      ├── printedTotal: number
      ├── standardLegal: boolean
      ├── expandedLegal: boolean
      ├── createdAt: timestamp
      └── updatedAt: timestamp
```

### 3. `users` Collection
**Structure**: One document per user

```
users/
  └── {userId}/                    # Firebase Auth UID
      ├── email: string
      ├── displayName: string
      ├── createdAt: timestamp
      ├── groups: string[]          # Array of group IDs
      └── isAdmin: boolean
```

### 4. `userCollections` Collection
**Structure**: User's personal collections (subcollections)

```
userCollections/
  └── {userId}/                    # Firebase Auth UID
      └── collections/             # Subcollection
          └── {collectionId}/      # Auto-generated
              ├── pokemonId: string # Reference to pokemon/{cardId}
              ├── setId: string     # Reference to sets/{setId}
              ├── checkedOff: boolean
              ├── checkedOffAt: timestamp
              ├── quantity: number  # For duplicates
              └── notes: string
```

### 5. `groups` Collection
**Structure**: User groups for tracking progress together

```
groups/
  └── {groupId}/                   # Auto-generated document ID
      ├── name: string
      ├── inviteCode: string
      ├── createdBy: string         # userId
      ├── members: string[]        # Array of userIds
      ├── targetSet: string         # setId or "all"
      ├── createdAt: timestamp
      └── activity/                # Subcollection
          └── {activityId}/
              ├── userId: string
              ├── userName: string
              ├── type: string     # "pull", "complete_set", "join"
              ├── pokemonId: string
              └── timestamp: timestamp
```

## API References

Each Pokemon card stores:
- **`apiId`**: The Pokemon TCG API card ID (e.g., "base1-4")
- **`apiSetId`**: The Pokemon TCG API set ID (e.g., "base1")

This allows us to:
- Reference back to the API if needed
- Avoid duplicates when seeding
- Sync updates from the API later

## Firestore Rules for Seeding

The seeder runs when you're **logged in**, so it needs authenticated write access:

```javascript
match /pokemon/{cardId} {
  allow read: if true;              // Anyone can read
  allow write: if request.auth != null;  // Only authenticated users can write
}

match /sets/{setId} {
  allow read: if true;              // Anyone can read
  allow write: if request.auth != null;  // Only authenticated users can write
}
```

## How Seeding Works

1. **Fetch from API**: Gets cards/sets from Pokemon TCG API
2. **Check duplicates**: Uses `apiId` to check if card already exists
3. **Map to schema**: Converts API data to our Firestore schema
4. **Write to Firestore**: Creates documents in `pokemon` and `sets` collections
5. **Skip existing**: Won't duplicate cards that already exist

## Querying Cards

```javascript
// Get all cards from a specific set
const q = query(
  collection(db, 'pokemon'),
  where('apiSetId', '==', 'base1')
)

// Get a specific card by API ID
const q = query(
  collection(db, 'pokemon'),
  where('apiId', '==', 'base1-4')
)

// Get all cards by name
const q = query(
  collection(db, 'pokemon'),
  where('name', '==', 'Charizard')
)
```

