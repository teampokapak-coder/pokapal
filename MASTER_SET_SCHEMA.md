# Master Set & Collection Database Schema

## Overview
Clean, simple, and expandable structure for:
- Master sets (set-based, pokemon-based, group-based)
- General card collection (personal collection separate from master sets)
- English and Japanese cards
- Group master sets with invites
- Master set battles/competitions

---

## Core Collections

### 1. `userCollections` Collection
**Path**: `userCollections/{collectionId}`

**Description**: General card collection - tracks cards a user owns (not master set specific)

**Fields**:
```javascript
{
  userId: string,                    // Owner user ID
  cardId: string,                    // Reference to card_en/{cardId} or card_ja/{cardId}
  cardCollection: string,            // 'card_en' or 'card_ja' (which collection the card is in)
  language: 'en' | 'ja',             // Card language
  quantity: number,                  // How many copies (default: 1)
  condition: string | null,          // Optional: 'mint', 'near-mint', 'played', etc.
  notes: string | null,              // User notes
  collectedAt: timestamp,            // When added to collection
  updatedAt: timestamp
}
```

**Indexes**:
- `userId` + `language` (for user's collection by language)
- `userId` + `collectedAt` (for recent additions)

**Example**:
```javascript
{
  userId: "user123",
  cardId: "abc456",
  cardCollection: "card_en",
  language: "en",
  quantity: 2,
  condition: "near-mint",
  notes: "One is first edition",
  collectedAt: Timestamp,
  updatedAt: Timestamp
}
```

---

### 2. `masterSets` Collection
**Path**: `masterSets/{masterSetId}`

**Description**: Master set challenges - can be personal or group-based

**Fields**:
```javascript
{
  // Basic Info
  name: string,                      // e.g., "Base Set Master Set", "All Charizards"
  description: string | null,        // Optional description
  createdBy: string,                 // User ID of creator
  createdAt: timestamp,
  updatedAt: timestamp,
  
  // Type & Target
  type: 'set' | 'pokemon',           // What are we mastering?
  targetSetId: string | null,       // If type='set': Firestore set document ID (set_en/{id} or set_ja/{id})
  targetSetCollection: string | null,// 'set_en' or 'set_ja'
  targetSetName: string | null,      // Set name for display
  targetPokemonId: string | null,   // If type='pokemon': nationalDexNumber
  targetPokemonName: string | null,  // Pokemon name for display
  
  // Language Scope
  languages: ('en' | 'ja')[],        // Which languages to master (can be both)
  
  // Group Info
  groupId: string | null,            // If part of a group, reference to groups/{groupId}
  isGroupMasterSet: boolean,         // true = group challenge, false = personal
  
  // Status
  status: 'active' | 'completed' | 'paused',
  completedAt: timestamp | null,
  
  // Stats (computed/cached)
  totalCards: number,                // Total cards in this master set
  collectedCards: number,             // How many collected (across all members if group)
  progress: number                   // Percentage (0-100)
}
```

**Indexes**:
- `createdBy` + `status`
- `groupId` + `status`
- `type` + `targetSetId` (for set-based)
- `type` + `targetPokemonId` (for pokemon-based)

**Example (Personal Set Master Set)**:
```javascript
{
  name: "Base Set Master Set",
  description: "My personal Base Set collection",
  createdBy: "user123",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  type: "set",
  targetSetId: "dC3hFxfrIOMQ9dApPqPC",
  targetSetCollection: "set_en",
  targetSetName: "Base Set",
  targetPokemonId: null,
  targetPokemonName: null,
  languages: ["en"],
  groupId: null,
  isGroupMasterSet: false,
  status: "active",
  completedAt: null,
  totalCards: 102,
  collectedCards: 45,
  progress: 44
}
```

**Example (Group Pokemon Master Set)**:
```javascript
{
  name: "Charizard Master Set Challenge",
  description: "Let's collect all Charizard cards together!",
  createdBy: "user123",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  type: "pokemon",
  targetSetId: null,
  targetSetCollection: null,
  targetSetName: null,
  targetPokemonId: "6",
  targetPokemonName: "Charizard",
  languages: ["en", "ja"],
  groupId: "group456",
  isGroupMasterSet: true,
  status: "active",
  completedAt: null,
  totalCards: 87,
  collectedCards: 23,
  progress: 26
}
```

---

### 3. `masterSetMembers` Collection
**Path**: `masterSetMembers/{memberId}`

**Description**: Tracks which users are in which master sets (for group master sets)

**Fields**:
```javascript
{
  masterSetId: string,               // Reference to masterSets/{masterSetId}
  userId: string,                    // User ID
  joinedAt: timestamp,
  role: 'owner' | 'member',          // Owner = creator, member = invited
  status: 'active' | 'left',          // Has user left the master set?
  leftAt: timestamp | null,
  
  // Personal Progress (for group master sets)
  personalCollectedCards: number,    // How many cards this user has collected
  personalProgress: number           // Percentage for this user
}
```

**Indexes**:
- `masterSetId` + `status`
- `userId` + `status`

**Example**:
```javascript
{
  masterSetId: "masterSet789",
  userId: "user123",
  joinedAt: Timestamp,
  role: "owner",
  status: "active",
  leftAt: null,
  personalCollectedCards: 23,
  personalProgress: 26
}
```

---

### 4. `masterSetCards` Collection
**Path**: `masterSetCards/{cardId}`

**Description**: Tracks which cards are collected in which master sets

**Fields**:
```javascript
{
  masterSetId: string,               // Reference to masterSets/{masterSetId}
  userId: string,                    // Who collected this card
  cardId: string,                    // Reference to card_en/{cardId} or card_ja/{cardId}
  cardCollection: string,            // 'card_en' or 'card_ja'
  language: 'en' | 'ja',             // Card language
  collectedAt: timestamp,
  quantity: number,                  // How many copies (default: 1)
  notes: string | null               // Optional notes
}
```

**Indexes**:
- `masterSetId` + `userId` (for user's cards in a master set)
- `masterSetId` + `cardId` (to check if card is collected)
- `userId` + `masterSetId` + `language` (for user's cards by language)

**Example**:
```javascript
{
  masterSetId: "masterSet789",
  userId: "user123",
  cardId: "abc456",
  cardCollection: "card_en",
  language: "en",
  collectedAt: Timestamp,
  quantity: 1,
  notes: "First edition holo"
}
```

---

### 5. `groups` Collection
**Path**: `groups/{groupId}`

**Description**: Groups for collaborative master sets and battles

**Fields**:
```javascript
{
  name: string,                      // Group name
  description: string | null,
  createdBy: string,                 // User ID of creator
  inviteCode: string,                // Unique invite code (e.g., "BASE2024")
  createdAt: timestamp,
  updatedAt: timestamp,
  
  // Members
  memberIds: string[],              // Array of user IDs
  memberCount: number,               // Cached count
  
  // Settings
  isPublic: boolean,                 // Can anyone join with invite code?
  allowInvites: boolean,            // Can members invite others?
  
  // Master Sets in this group
  masterSetIds: string[]             // Array of masterSetIds
}
```

**Indexes**:
- `inviteCode` (unique)
- `createdBy`
- `memberIds` (array-contains)

**Example**:
```javascript
{
  name: "Base Set Challenge 2024",
  description: "Let's master Base Set together!",
  createdBy: "user123",
  inviteCode: "BASE2024",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  memberIds: ["user123", "user456", "user789"],
  memberCount: 3,
  isPublic: false,
  allowInvites: true,
  masterSetIds: ["masterSet789"]
}
```

---

### 6. `groupInvites` Collection
**Path**: `groupInvites/{inviteId}`

**Description**: Pending group invitations

**Fields**:
```javascript
{
  groupId: string,                   // Reference to groups/{groupId}
  invitedBy: string,                // User ID who sent invite
  inviteEmail: string | null,        // Email if user doesn't have account
  inviteUserId: string | null,       // User ID if user has account
  inviteCode: string,                // Same as group inviteCode (for easy lookup)
  status: 'pending' | 'accepted' | 'declined',
  createdAt: timestamp,
  acceptedAt: timestamp | null,
  declinedAt: timestamp | null
}
```

**Indexes**:
- `inviteCode` + `status`
- `inviteEmail` + `status`
- `inviteUserId` + `status`

**Example**:
```javascript
{
  groupId: "group456",
  invitedBy: "user123",
  inviteEmail: "friend@example.com",
  inviteUserId: null,
  inviteCode: "BASE2024",
  status: "pending",
  createdAt: Timestamp,
  acceptedAt: null,
  declinedAt: null
}
```

---

### 7. `masterSetBattles` Collection (Optional - Future Feature)
**Path**: `masterSetBattles/{battleId}`

**Description**: Competitive battles/challenges between groups or users

**Fields**:
```javascript
{
  name: string,                      // Battle name
  description: string | null,
  createdBy: string,
  createdAt: timestamp,
  startsAt: timestamp,               // When battle starts
  endsAt: timestamp,                 // When battle ends
  
  // Participants
  participantType: 'users' | 'groups',
  participantIds: string[],          // User IDs or group IDs
  
  // Battle Rules
  targetType: 'set' | 'pokemon',     // What are we battling to collect?
  targetSetId: string | null,
  targetPokemonId: string | null,
  languages: ('en' | 'ja')[],
  
  // Scoring
  scoringType: 'most_cards' | 'first_complete' | 'most_rare',
  winnerIds: string[],                // Who won (can be multiple)
  
  status: 'upcoming' | 'active' | 'completed',
  completedAt: timestamp | null
}
```

**Indexes**:
- `status` + `startsAt`
- `participantType` + `participantIds` (array-contains)

---

## Data Flow Examples

### Creating a Personal Master Set from Set Detail Page
1. User clicks "Start Master Set" on set detail page
2. Create `masterSets/{id}` document with:
   - `type: 'set'`
   - `targetSetId: <set document ID>`
   - `targetSetCollection: 'set_en'` or `'set_ja'`
   - `languages: ['en']` or `['ja']` based on set
   - `isGroupMasterSet: false`
3. Query `card_en` or `card_ja` collection to get `totalCards`
4. User collects cards → create `masterSetCards/{id}` documents

### Creating a Group Master Set
1. User creates group → `groups/{id}`
2. User creates master set → `masterSets/{id}` with `groupId`
3. User invites friends → `groupInvites/{id}`
4. Friends accept → add to `groups.memberIds` and create `masterSetMembers/{id}`
5. All members collect cards → `masterSetCards/{id}` documents

### Collecting a Card (General Collection)
1. User clicks "Collect" on card
2. Check if card exists in `userCollections`:
   - If exists: Update `quantity` and `updatedAt`
   - If not: Create new `userCollections/{id}` document

### Collecting a Card in Master Set
1. User clicks "Collect" on card in master set context
2. Create `masterSetCards/{id}` document
3. Update `masterSets.collectedCards` and `masterSets.progress`
4. Update `masterSetMembers.personalCollectedCards` if group master set

---

## Query Patterns

### Get User's General Collection
```javascript
query(userCollectionsRef, 
  where('userId', '==', userId),
  where('language', '==', 'en')  // or 'ja'
)
```

### Get User's Master Sets
```javascript
query(masterSetsRef,
  where('createdBy', '==', userId),
  where('status', '==', 'active')
)
// OR for group master sets:
query(masterSetMembersRef,
  where('userId', '==', userId),
  where('status', '==', 'active')
)
// Then get masterSets by masterSetId
```

### Get Cards in Master Set
```javascript
query(masterSetCardsRef,
  where('masterSetId', '==', masterSetId),
  where('userId', '==', userId)  // Optional: filter by user
)
```

### Get Group Members
```javascript
query(groupInvitesRef,
  where('groupId', '==', groupId),
  where('status', '==', 'accepted')
)
// OR use groups.memberIds array
```

---

## Key Design Decisions

1. **Separate General Collection from Master Sets**
   - `userCollections` = personal collection (always)
   - `masterSetCards` = cards collected for specific master set challenge
   - A card can be in both (user owns it AND it's part of master set)

2. **Language Handling**
   - Cards stored in `card_en` and `card_ja` collections
   - `language` field tracks which language
   - Master sets can target one or both languages via `languages` array

3. **Group vs Personal**
   - Personal master sets: `groupId: null`, `isGroupMasterSet: false`
   - Group master sets: `groupId: <id>`, `isGroupMasterSet: true`
   - Group master sets track individual progress via `masterSetMembers`

4. **Set vs Pokemon Master Sets**
   - `type: 'set'` → master all cards in a set
   - `type: 'pokemon'` → master all cards of a specific Pokemon
   - Both can target English, Japanese, or both languages

5. **Extensibility**
   - Easy to add new master set types (e.g., `type: 'series'`)
   - Easy to add battle features (separate collection)
   - Easy to add card conditions, grading, etc. (add fields to collections)

---

## Migration Notes

If migrating from existing structure:
1. Map existing `collections` → `masterSets`
2. Map existing `collections/{id}/cards` → `masterSetCards`
3. Create `userCollections` from existing user card data
4. Update references to use new structure

