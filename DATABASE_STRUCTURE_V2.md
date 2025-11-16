# Pokapal Database Structure V2 - Simplified

## Overview

This is a cleaner, more streamlined database structure that separates concerns:
- **Challenges**: High-level challenge details
- **Assignments**: What each user needs to master set
- **CollectorList**: Individual card ownership tracking

---

## Collections

### 1. `users` Collection
**Path**: `users/{userId}`

**Purpose**: User profiles and authentication data

**Fields**:
```javascript
{
  email: string,
  displayName: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  challenges: string[],           // Array of challengeIds the user belongs to
  isAdmin: boolean
}
```

---

### 2. `challenges` Collection (formerly `groups`)
**Path**: `challenges/{challengeId}`

**Purpose**: High-level challenge container with basic details

**Fields**:
```javascript
{
  name: string,                   // e.g., "Charizard Challenge 2024"
  description: string,             // Challenge description
  inviteCode: string,             // Unique invite code (e.g., "CHAR2024")
  createdBy: string,              // userId of creator
  members: string[],              // Array of userIds and/or emails
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Example**:
```javascript
{
  name: "Charizard Challenge",
  description: "Let's master set Charizard together!",
  inviteCode: "CHAR2024",
  createdBy: "user1",
  members: ["user1", "user2", "naveesly@gmail.com"],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Key Points**:
- Contains only high-level challenge info
- No assignment or collection data here
- Members array tracks who's in the challenge

---

### 3. `assignments` Collection
**Path**: `assignments/{assignmentId}`

**Purpose**: Defines what each user is assigned to master set

**Fields**:
```javascript
{
  challengeId: string,            // Reference to challenges/{challengeId}
  userId: string | null,         // userId if user has account, null if email invite
  email: string | null,          // email if invited via email, null if userId exists
  type: "set" | "pokemon",       // What type of master set
  setId: string | null,          // If type is "set", reference to sets/{setId}
  setName: string | null,        // For easy display
  pokemonId: string | null,      // If type is "pokemon", reference to pokemonList/{pokemonId}
  pokemonName: string | null,     // For easy display
  cardIds: string[],             // Pre-calculated list of card document IDs (for efficient loading)
  totalCards: number,            // Total number of cards in this assignment (for quick reference)
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Example (Email Invite)**:
```javascript
{
  challengeId: "challenge1",
  userId: null,
  email: "naveesly@gmail.com",
  type: "pokemon",
  setId: null,
  setName: null,
  pokemonId: "dex-310-manectric",
  pokemonName: "Manectric",
  cardIds: ["card1", "card2", "card3", ...], // Pre-calculated when assignment created
  totalCards: 45, // Total cards for Manectric
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Example (After User Accepts)**:
```javascript
{
  challengeId: "challenge1",
  userId: "user2",  // Updated from null
  email: null,      // Cleared since we have userId
  type: "pokemon",
  setId: null,
  setName: null,
  pokemonId: "dex-310-manectric",
  pokemonName: "Manectric",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Key Points**:
- **One assignment per user per challenge**
- Defines WHAT to collect (the task)
- For "Assign to All": Multiple assignments with same `setId`/`pokemonId` (one per member)
- For Individual: Each assignment has different `setId`/`pokemonId`
- **`cardIds` is pre-calculated when assignment is created** - avoids expensive queries later
- **`totalCards` is stored for quick progress calculation** - no need to query cards just to count
- No collectionId needed - we query collectorList directly

---

### 4. `collectorList` Collection
**Path**: `collectorList/{collectorId}`

**Purpose**: Tracks individual card ownership - one document per user+card+assignment combination

**Fields**:
```javascript
{
  userId: string,                 // Owner of this card
  assignmentId: string,           // Reference to assignments/{assignmentId}
  challengeId: string,            // Reference to challenges/{challengeId} (for easy querying)
  cardId: string,                  // Reference to pokemon/{cardId}
  checkedOff: boolean,            // Whether user has this card
  checkedOffAt: timestamp | null,
  quantity: number,               // Number of copies (for duplicates)
  notes: string,                  // User notes about this card
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Example**:
```javascript
{
  userId: "user1",
  assignmentId: "assignment1",
  challengeId: "challenge1",
  cardId: "card123",
  checkedOff: true,
  checkedOffAt: Timestamp,
  quantity: 1,
  notes: "First edition holo",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Key Points**:
- **One document per user+card+assignment**
- Tracks actual card ownership
- Can query: "All cards user owns for this assignment"
- Can query: "All users who own this card in this challenge"
- `challengeId` included for easy cross-challenge queries

---

### 5. `invites` Collection
**Path**: `invites/{inviteId}`

**Purpose**: Pending challenge invitations

**Fields**:
```javascript
{
  challengeId: string,            // Reference to challenges/{challengeId}
  challengeName: string,           // For easy display
  invitedBy: string,              // userId of person who sent invite
  invitedByName: string,          // Display name of inviter
  email: string,                  // Email address of invitee
  userId: string | null,         // If user has account, their userId (null if no account yet)
  status: "pending" | "accepted" | "declined",
  createdAt: timestamp,
  updatedAt: timestamp,
  acceptedAt: timestamp | null
}
```

---

## Relationships & Flow

### Challenge Creation Flow

```
Step 1: Create Challenge
┌─────────────────────────────┐
│ challenges/{challengeId}    │
├─────────────────────────────┤
│ name: "Charizard Challenge" │
│ inviteCode: "CHAR2024"      │
│ members: ["user1", "email@..."]
└─────────────────────────────┘
         │
         │ creates
         ▼
Step 2: Create Assignments (one per member)
┌──────────────────────────────────────────────┐
│ assignments/{assignmentId}                   │
├──────────────────────────────────────────────┤
│ assignment1:                                 │
│   challengeId: "challenge1"                  │
│   userId: "user1"                            │
│   pokemonId: "dex-6-charizard"               │
│                                              │
│ assignment2:                                 │
│   challengeId: "challenge1"                  │
│   email: "naveesly@gmail.com"                │
│   pokemonId: "dex-6-charizard"               │
└──────────────────────────────────────────────┘
         │
         │ user collects cards
         ▼
Step 3: Create CollectorList Entries
┌──────────────────────────────────────────────┐
│ collectorList/{collectorId}                  │
├──────────────────────────────────────────────┤
│ collector1:                                  │
│   userId: "user1"                            │
│   assignmentId: "assignment1"               │
│   challengeId: "challenge1"                   │
│   cardId: "card123"                          │
│   checkedOff: true                           │
│                                              │
│ collector2:                                  │
│   userId: "user1"                            │
│   assignmentId: "assignment1"                │
│   challengeId: "challenge1"                  │
│   cardId: "card456"                         │
│   checkedOff: false                          │
└──────────────────────────────────────────────┘
```

---

## Query Patterns

### Get All Assignments for a Challenge
```javascript
query(
  collection(db, 'assignments'),
  where('challengeId', '==', challengeId)
)
```

### Get Assignment for a User in a Challenge
```javascript
query(
  collection(db, 'assignments'),
  where('challengeId', '==', challengeId),
  where('userId', '==', userId)
)
```

### Get All Cards User Owns for an Assignment
```javascript
query(
  collection(db, 'collectorList'),
  where('userId', '==', userId),
  where('assignmentId', '==', assignmentId)
)
```

### Get All Cards User Owns in a Challenge
```javascript
query(
  collection(db, 'collectorList'),
  where('userId', '==', userId),
  where('challengeId', '==', challengeId)
)
```

### Get All Users Who Own a Specific Card in a Challenge
```javascript
query(
  collection(db, 'collectorList'),
  where('challengeId', '==', challengeId),
  where('cardId', '==', cardId),
  where('checkedOff', '==', true)
)
```

### Get All Cards Needed for an Assignment (not yet owned)
```javascript
// Step 1: Get assignment
const assignment = await getDoc(doc(db, 'assignments', assignmentId))

// Step 2: Get all cards for that assignment
let allCards = []
if (assignment.type === 'set') {
  allCards = await query(pokemon, where('setId', '==', assignment.setId))
} else if (assignment.type === 'pokemon') {
  const pokemonList = await getDoc(doc(db, 'pokemonList', assignment.pokemonId))
  const cardIds = pokemonList.data().cardIds || []
  allCards = await filter(pokemon, where('id', 'in', cardIds))
}

// Step 3: Get cards user owns
const ownedCards = await query(
  collectorList,
  where('userId', '==', userId),
  where('assignmentId', '==', assignmentId),
  where('checkedOff', '==', true)
)

// Step 4: Filter to get cards not owned
const neededCards = allCards.filter(card => 
  !ownedCards.some(owned => owned.cardId === card.id)
)
```

---

## Benefits of This Structure

1. **Cleaner Separation**:
   - Challenges = Container
   - Assignments = Task definition
   - CollectorList = Ownership tracking

2. **No Nested Collections**:
   - Everything is top-level, easier to query
   - No need for `collections/{collectionId}/cards` subcollection

3. **Flexible Querying**:
   - Query by user, assignment, challenge, or card
   - Easy to get progress across challenges
   - Easy to compare users in same challenge

4. **Simpler Updates**:
   - To mark a card as owned: Create/update one document in `collectorList`
   - No need to update multiple nested structures

5. **Better Scalability**:
   - Each card ownership is independent document
   - Can easily add indexes for common queries
   - No document size limits from nested arrays

---

## Migration from Old Structure

**Old**: `collections/{collectionId}/cards/{cardId}`
**New**: `collectorList/{collectorId}`

**Mapping**:
- `collections/{collectionId}` → `assignments/{assignmentId}` (what to collect)
- `collections/{collectionId}/cards/{cardId}` → `collectorList/{collectorId}` (card ownership)

**Key Changes**:
- Remove `collections` collection entirely
- Remove `groups` collection, rename to `challenges`
- Add `assignmentId` and `challengeId` to `collectorList` documents
- Update all queries to use new structure

