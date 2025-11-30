# Master Set & Collection Database Schema (Revised)

## Overview
Simplified structure:
- `masterSets` - High-level master set definition
- `assignments` - Person-specific card lists for each master set
- `collectedCards` - Cards collected (can be for assignment or general collection)

---

## Collections

### 1. `masterSets` Collection
**Path**: `masterSets/{masterSetId}`

**Description**: High-level master set definition - the challenge/collection itself

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
  targetSetId: string | null,       // If type='set': Firestore set document ID
  targetSetCollection: string | null,// 'set_en' or 'set_ja'
  targetSetName: string | null,      // Set name for display
  targetPokemonId: string | null,   // If type='pokemon': nationalDexNumber
  targetPokemonName: string | null,  // Pokemon name for display
  
  // Language Scope
  languages: ('en' | 'ja')[],        // Which languages to master (can be both)
  
  // Status
  status: 'active' | 'completed' | 'paused',
  completedAt: timestamp | null,
  
  // Stats (computed/cached - total across all assignments)
  totalAssignments: number,          // How many people are participating
  totalCardsCollected: number        // Total cards collected across all assignments
}
```

**Indexes**:
- `createdBy` + `status`
- `type` + `targetSetId`
- `type` + `targetPokemonId`

**Example (Set Master Set)**:
```javascript
{
  name: "Base Set Master Set",
  description: "Let's master Base Set together!",
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
  status: "active",
  completedAt: null,
  totalAssignments: 3,
  totalCardsCollected: 87
}
```

**Example (Pokemon Master Set)**:
```javascript
{
  name: "Charizard Master Set Challenge",
  description: "Collect all Charizard cards!",
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
  status: "active",
  completedAt: null,
  totalAssignments: 5,
  totalCardsCollected: 142
}
```

---

### 2. `assignments` Collection
**Path**: `assignments/{assignmentId}`

**Description**: Person-specific card list for a master set - what cards they need to collect

**Fields**:
```javascript
{
  masterSetId: string,               // Reference to masterSets/{masterSetId}
  userId: string | null,             // User ID (null if user doesn't have account yet)
  userEmail: string,                  // Email address (required for invites)
  userName: string | null,            // Display name (cached, null if no account)
  
  // Card Lists (arrays of card IDs from respective collections)
  card_en: string[],                  // Array of card IDs from card_en collection
  card_ja: string[],                 // Array of card IDs from card_ja collection
  
  // Assignment Type (for Start Master Set page - allows mixed types)
  assignmentType: 'set' | 'pokemon' | null,  // null = same as masterSet.type
  assignmentSetId: string | null,    // If assignmentType='set': specific set for this assignment
  assignmentPokemonId: string | null, // If assignmentType='pokemon': specific pokemon for this assignment
  
  // Metadata
  createdAt: timestamp,              // When assignment was created
  updatedAt: timestamp,             // When card lists were last modified
  createdBy: string,                 // Who created this assignment (user ID)
  
  // Invite/Acceptance Status
  status: 'pending' | 'accepted' | 'rejected' | 'active' | 'completed' | 'paused',
  acceptedAt: timestamp | null,      // When user accepted the assignment
  rejectedAt: timestamp | null,      // When user rejected the assignment
  
  // Stats (computed/cached)
  totalCards: number,                // Total cards in assignment (card_en.length + card_ja.length)
  collectedCards: number,            // How many collected (from collectedCards collection)
  progress: number                   // Percentage (0-100)
}
```

**Indexes**:
- `masterSetId` + `status`
- `userId` + `status` (for users with accounts)
- `userEmail` + `status` (for pending invites)
- `masterSetId` + `userId` (unique combination when userId exists)
- `masterSetId` + `userEmail` (unique combination)

**Example (Accepted Assignment)**:
```javascript
{
  masterSetId: "masterSet789",
  userId: "user123",
  userEmail: "ash@pokemon.com",
  userName: "Ash Ketchum",
  card_en: ["cardId1", "cardId2", "cardId3", ...],  // 102 card IDs
  card_ja: [],                                       // No Japanese cards
  assignmentType: null,                              // Same as masterSet.type
  assignmentSetId: null,
  assignmentPokemonId: null,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: "user456",                              // Created by different user
  status: "accepted",
  acceptedAt: Timestamp,
  rejectedAt: null,
  totalCards: 102,
  collectedCards: 45,
  progress: 44
}
```

**Example (Pending Invite - No Account)**:
```javascript
{
  masterSetId: "masterSet789",
  userId: null,                                      // No account yet
  userEmail: "friend@example.com",
  userName: null,
  card_en: ["cardId1", "cardId2", ...],
  card_ja: [],
  assignmentType: null,
  assignmentSetId: null,
  assignmentPokemonId: null,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: "user123",
  status: "pending",
  acceptedAt: null,
  rejectedAt: null,
  totalCards: 102,
  collectedCards: 0,
  progress: 0
}
```

**Example (Custom Assignment Type - Pokemon when Master Set is Set)**:
```javascript
{
  masterSetId: "masterSet789",                      // Master set is for "Base Set"
  userId: "user123",
  userEmail: "ash@pokemon.com",
  userName: "Ash Ketchum",
  card_en: ["charizard1", "charizard2", ...],       // Only Charizard cards
  card_ja: ["charizardJ1", "charizardJ2", ...],
  assignmentType: "pokemon",                         // Different from masterSet.type
  assignmentSetId: null,
  assignmentPokemonId: "6",                         // Charizard
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: "user123",
  status: "active",
  acceptedAt: Timestamp,
  rejectedAt: null,
  totalCards: 87,
  collectedCards: 23,
  progress: 26
}
```

**Example (Multi-language)**:
```javascript
{
  masterSetId: "masterSet456",
  userId: "user456",
  userEmail: "misty@pokemon.com",
  userName: "Misty",
  card_en: ["cardId1", "cardId2", ...],  // 50 English card IDs
  card_ja: ["cardIdJ1", "cardIdJ2", ...], // 37 Japanese card IDs
  assignmentType: null,
  assignmentSetId: null,
  assignmentPokemonId: null,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: "user123",
  status: "accepted",
  acceptedAt: Timestamp,
  rejectedAt: null,
  totalCards: 87,
  collectedCards: 23,
  progress: 26
}
```

**Notes**:
- Card lists are generated at creation time based on master set type/target
- Users can edit (add/remove cards) from their assignment
- Arrays make it easy to check if a card is in the assignment: `card_en.includes(cardId)`

---

### 3. `collectedCards` Collection
**Path**: `collectedCards/{collectionId}`

**Description**: Cards collected by users - can be for an assignment OR general collection

**Fields**:
```javascript
{
  userId: string,                    // User ID
  cardId: string,                    // Reference to card_en/{cardId} or card_ja/{cardId}
  cardCollection: string,            // 'card_en' or 'card_ja' (which collection the card is in)
  language: 'en' | 'ja',             // Card language
  
  // Assignment Context (optional)
  assignmentId: string | null,       // If collected for an assignment, reference to assignments/{assignmentId}
  masterSetId: string | null,        // Cached reference to masterSets/{masterSetId} (for easy querying)
  
  // Collection Details
  quantity: number,                  // How many copies (default: 1)
  condition: string | null,          // Optional: 'mint', 'near-mint', 'played', etc.
  notes: string | null,              // User notes
  collectedAt: timestamp,           // When added to collection
  updatedAt: timestamp
}
```

**Indexes**:
- `userId` + `language` (for user's collection by language)
- `userId` + `assignmentId` (for user's cards in an assignment)
- `userId` + `masterSetId` (for user's cards in a master set)
- `assignmentId` + `cardId` (to check if card collected for assignment)
- `userId` + `cardId` + `cardCollection` (to check if user has this specific card)

**Example (Collected for Assignment)**:
```javascript
{
  userId: "user123",
  cardId: "abc456",
  cardCollection: "card_en",
  language: "en",
  assignmentId: "assignment789",
  masterSetId: "masterSet789",
  quantity: 1,
  condition: "near-mint",
  notes: "First edition holo",
  collectedAt: Timestamp,
  updatedAt: Timestamp
}
```

**Example (General Collection - Not for Assignment)**:
```javascript
{
  userId: "user123",
  cardId: "xyz789",
  cardCollection: "card_ja",
  language: "ja",
  assignmentId: null,
  masterSetId: null,
  quantity: 2,
  condition: null,
  notes: "Got these in a trade",
  collectedAt: Timestamp,
  updatedAt: Timestamp
}
```

**Example (Same Card - Both General and Assignment)**:
```javascript
// Document 1: General collection
{
  userId: "user123",
  cardId: "abc456",
  cardCollection: "card_en",
  language: "en",
  assignmentId: null,
  masterSetId: null,
  quantity: 1,
  collectedAt: Timestamp,
  updatedAt: Timestamp
}

// Document 2: Also collected for assignment
{
  userId: "user123",
  cardId: "abc456",
  cardCollection: "card_en",
  language: "en",
  assignmentId: "assignment789",
  masterSetId: "masterSet789",
  quantity: 1,
  collectedAt: Timestamp,
  updatedAt: Timestamp
}
```

**Notes**:
- Same card can be in collection multiple times:
  - Once for general collection (`assignmentId: null`)
  - Once (or more) for specific assignments (`assignmentId: <id>`)
- This allows tracking: "I own this card" AND "I collected it for this assignment"
- Query patterns:
  - User's general collection: `where('userId', '==', userId) && where('assignmentId', '==', null)`
  - User's assignment collection: `where('userId', '==', userId) && where('assignmentId', '==', assignmentId)`
  - All cards user owns: `where('userId', '==', userId)` (regardless of assignmentId)

---

## Data Flow Examples

### Creating a Master Set from Set Detail Page
1. User clicks "Start Master Set" on set detail page
2. Create `masterSets/{id}` document:
   ```javascript
   {
     name: "Base Set Master Set",
     type: "set",
     targetSetId: "dC3hFxfrIOMQ9dApPqPC",
     targetSetCollection: "set_en",
     languages: ["en"],
     createdBy: userId,
     ...
   }
   ```
3. Query `card_en` collection to get all card IDs for this set
4. Create `assignments/{id}` document:
   ```javascript
   {
     masterSetId: masterSetId,
     userId: userId,
     card_en: [cardId1, cardId2, cardId3, ...], // All card IDs from set
     card_ja: [],
     ...
   }
   ```

### Creating a Master Set from Pokemon Detail Page
1. User clicks "Start Master Set" on pokemon detail page
2. **UI Flow**:
   - User enters master set name
   - User selects languages: English and/or Japanese (for this Pokemon)
   - User can invite others (enter emails)
3. Create `masterSets/{id}` document:
   ```javascript
   {
     name: "Charizard Master Set",  // User-provided name
     type: "pokemon",
     targetPokemonId: "6",
     languages: ["en", "ja"],  // User-selected languages
     ...
   }
   ```
4. Query `card_en` and/or `card_ja` collections for all cards with `nationalDexNumber: 6`
5. Create `assignments/{id}` for creator (same as set flow)
6. Create `assignments/{id}` for each invitee (same as set flow)

### Accepting/Rejecting an Assignment Invite
1. User receives invite (email notification or in-app notification)
2. **If user accepts**:
   - Update `assignments/{id}`:
     ```javascript
     {
       status: "accepted",
       acceptedAt: Timestamp,
       userId: userId,  // Set if was null (user created account)
       userName: userName  // Set if was null
     }
     ```
3. **If user rejects**:
   - Update `assignments/{id}`:
     ```javascript
     {
       status: "rejected",
       rejectedAt: Timestamp
     }
     ```
4. User can edit their assignment (add/remove cards) after accepting

### Creating Master Set from Start Master Set Page
1. **UI Flow** (similar to current):
   - User enters challenge name
   - User can add multiple assignments:
     - **Per User**: Select user, select type (set/pokemon), select target
     - **Random Assignment**: System randomly assigns sets/pokemon to users
   - User can invite users (emails)
2. Create `masterSets/{id}` document:
   ```javascript
   {
     name: "Challenge Name",
     type: "set",  // Or "pokemon" - can be mixed in assignments
     targetSetId: null,  // null if mixed assignments
     languages: ["en", "ja"],  // Based on selected languages
     ...
   }
   ```
3. For each assignment:
   - Determine card list based on `assignmentType`:
     - If `assignmentType: "set"` → Query cards from `assignmentSetId`
     - If `assignmentType: "pokemon"` → Query cards for `assignmentPokemonId`
   - Create `assignments/{id}`:
     ```javascript
     {
       masterSetId: masterSetId,
       userId: userId || null,
       userEmail: email,
       assignmentType: "pokemon",  // Different from masterSet.type
       assignmentPokemonId: "6",
       card_en: [cardIds],
       card_ja: [cardIds],
       status: userId ? "accepted" : "pending",
       ...
     }
     ```
4. For random assignments:
   - Generate random set/pokemon assignments
   - Create assignments with `assignmentType` set accordingly

### Collecting a Card (General Collection)
1. User clicks "Collect" on card (not in master set context)
2. Create `collectedCards/{id}`:
   ```javascript
   {
     userId: userId,
     cardId: cardId,
     cardCollection: "card_en",
     language: "en",
     assignmentId: null, // General collection
     masterSetId: null,
     quantity: 1,
     ...
   }
   ```

### Collecting a Card for Assignment
1. User clicks "Collect" on card in master set context
2. Create `collectedCards/{id}`:
   ```javascript
   {
     userId: userId,
     cardId: cardId,
     cardCollection: "card_en",
     language: "en",
     assignmentId: assignmentId,
     masterSetId: masterSetId,
     quantity: 1,
     ...
   }
   ```
3. Update `assignments.collectedCards` and `assignments.progress`
4. Update `masterSets.totalCardsCollected`

### Checking if Card is Collected
```javascript
// Check if user has card in general collection
query(collectedCardsRef,
  where('userId', '==', userId),
  where('cardId', '==', cardId),
  where('cardCollection', '==', 'card_en'),
  where('assignmentId', '==', null)
)

// Check if user has card for specific assignment
query(collectedCardsRef,
  where('userId', '==', userId),
  where('cardId', '==', cardId),
  where('cardCollection', '==', 'card_en'),
  where('assignmentId', '==', assignmentId)
)

// Check if user has card at all (any context)
query(collectedCardsRef,
  where('userId', '==', userId),
  where('cardId', '==', cardId),
  where('cardCollection', '==', 'card_en')
)
```

---

## Query Patterns

### Get User's Assignments
```javascript
// Get accepted/active assignments
query(assignmentsRef,
  where('userId', '==', userId),
  where('status', 'in', ['accepted', 'active'])
)

// Get pending invites (by email)
query(assignmentsRef,
  where('userEmail', '==', userEmail),
  where('status', '==', 'pending')
)
```

### Get All Assignments for a Master Set
```javascript
query(assignmentsRef,
  where('masterSetId', '==', masterSetId),
  where('status', '==', 'active')
)
```

### Get Cards Collected for Assignment
```javascript
query(collectedCardsRef,
  where('userId', '==', userId),
  where('assignmentId', '==', assignmentId)
)
```

### Get User's General Collection
```javascript
query(collectedCardsRef,
  where('userId', '==', userId),
  where('assignmentId', '==', null),
  where('language', '==', 'en')  // or 'ja'
)
```

### Check if Card is in Assignment
```javascript
// Get assignment
const assignment = await getDoc(doc(db, 'assignments', assignmentId))
const cardIds = assignment.data().card_en // or card_ja
const isInAssignment = cardIds.includes(cardId)
```

### Check if Card is Collected for Assignment
```javascript
query(collectedCardsRef,
  where('assignmentId', '==', assignmentId),
  where('cardId', '==', cardId),
  where('cardCollection', '==', 'card_en')
)
```

---

## Key Design Decisions

1. **Simplified Structure**
   - No separate "groups" collection - master sets with multiple assignments = group
   - No separate "members" collection - assignments serve that purpose

2. **Assignment Card Lists**
   - Arrays (`card_en`, `card_ja`) make it easy to:
     - Check if card is in assignment: `card_en.includes(cardId)`
     - Generate checklist UI
     - Allow users to edit (add/remove cards)
   - Generated at creation, editable by user

3. **Unified Collected Cards**
   - One collection for all collected cards
   - `assignmentId` field determines context:
     - `null` = general collection
     - `<id>` = collected for assignment
   - Same card can exist multiple times (general + assignment contexts)

4. **Language Handling**
   - Clear separation: `card_en` array vs `card_ja` array
   - `language` field in `collectedCards` for easy filtering
   - `cardCollection` field specifies which Firestore collection (`card_en` or `card_ja`)

5. **Extensibility**
   - Easy to add new master set types
   - Easy to add card conditions, grading, etc.
   - Easy to add battle features later (could add `battleId` field to assignments)

---

## Benefits of This Structure

1. **Simple**: Only 3 collections instead of 6+
2. **Flexible**: Cards can be in general collection AND assignments
3. **Efficient**: Arrays make card checking fast
4. **User-friendly**: Users can customize their assignment card lists
5. **Scalable**: Easy to query and update

