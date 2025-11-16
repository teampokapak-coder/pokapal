# Pokapal Database Structure

## Overview

This document maps out the complete Firestore database structure for Pokapal, explaining the relationship between collections, assignments, groups, and users.

---

## Collections Overview

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
  groups: string[],              // Array of groupIds the user belongs to
  collections: string[],         // Array of collectionIds the user owns
  isAdmin: boolean
}
```

**Example**:
```javascript
{
  email: "trainer@pokemon.com",
  displayName: "Ash Ketchum",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  groups: ["group1", "group2"],
  collections: ["collection1", "collection2"],
  isAdmin: false
}
```

---

### 2. `groups` Collection
**Path**: `groups/{groupId}`

**Purpose**: Group challenges where multiple users participate

**Fields**:
```javascript
{
  name: string,                  // e.g., "Base Set Challenge 2024"
  description: string,            // Group description
  inviteCode: string,            // Unique invite code (e.g., "BASE2024")
  createdBy: string,             // userId of creator
  members: string[],             // Array of userIds and/or emails
  memberCollections: {           // Map of userId -> collectionId (for quick lookup)
    [userId: string]: string     // userId: collectionId
  },
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
  memberCollections: {
    "user1": "collection1",
    "user2": "collection2"
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Note**: `memberCollections` is a convenience map for quick lookups. The primary source of truth is the `collectionId` field in the `assignments` collection.

---

### 3. `assignments` Collection (Top-Level)
**Path**: `assignments/{assignmentId}`

**Purpose**: Tracks what each member is assigned to master set in a group challenge

**Fields**:
```javascript
{
  groupId: string,               // Reference to groups/{groupId}
  userId: string | null,         // userId if user has account, null if email invite
  email: string | null,          // email if invited via email, null if userId exists
  type: "set" | "pokemon",       // What type of master set
  setId: string | null,          // If type is "set", reference to sets/{setId}
  setName: string | null,        // For easy display
  pokemonId: string | null,      // If type is "pokemon", reference to pokemonList/{pokemonId}
  pokemonName: string | null,    // For easy display
  collectionId: string | null,   // Reference to collections/{collectionId} (set when user creates collection)
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Example (Email Invite)**:
```javascript
{
  groupId: "group1",
  userId: null,
  email: "naveesly@gmail.com",
  type: "pokemon",
  setId: null,
  setName: null,
  pokemonId: "dex-310-manectric",
  pokemonName: "Manectric",
  collectionId: null,  // Will be set when user accepts and creates collection
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Example (After User Accepts)**:
```javascript
{
  groupId: "group1",
  userId: "user2",  // Updated from null
  email: null,      // Cleared since we have userId
  type: "pokemon",
  setId: null,
  setName: null,
  pokemonId: "dex-310-manectric",
  pokemonName: "Manectric",
  collectionId: "collection2",  // Set when user creates their collection
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Key Points**:
- **One assignment per member** in a group
- For "Assign to All": Multiple assignments with same `setId`/`pokemonId` (one per member)
- For Individual: Each assignment has different `setId`/`pokemonId`
- `collectionId` is set when the user creates their actual collection

---

### 4. `collections` Collection
**Path**: `collections/{collectionId}`

**Purpose**: The actual collection where a user tracks their card progress

**Fields**:
```javascript
{
  userId: string,                // Owner of this collection
  userName: string,              // Display name (for easy display)
  name: string,                  // e.g., "Base Set Master Set", "All Charizards"
  type: "set" | "pokemon",       // "set" = mastering a specific set, "pokemon" = mastering specific Pokemon
  
  // For Set Collections (type === "set"):
  targetSetId: string | null,    // Reference to sets/{setId} - used to query cards
  targetSetName: string | null,  // For easy display
  
  // For Pokemon Collections (type === "pokemon"):
  targetPokemonId: string | null, // Reference to pokemonList/{pokemonId} - used to query cards
  targetPokemonIds: string[] | null,  // Legacy/fallback array (use targetPokemonId instead)
  targetPokemonName: string | null,   // For easy display
  
  groupId: string | null,        // If part of a group, reference to groups/{groupId}
  createdAt: timestamp,
  updatedAt: timestamp,
  isActive: boolean,             // Whether this collection is currently being worked on
  
  // Subcollections:
  // - cards/{cardId}  (see below)
}
```

**How Cards Are Queried**:

1. **For Set Collections** (`type === "set"`):
   ```javascript
   // Query all cards in the pokemon collection that belong to this set
   query(
     collection(db, 'pokemon'),
     where('setId', '==', collection.targetSetId)
   )
   ```
   - `targetSetId` references `sets/{setId}`
   - Cards are queried from `pokemon` collection where `setId == targetSetId`

2. **For Pokemon Collections** (`type === "pokemon"`):
   ```javascript
   // Step 1: Get pokemonList document to get cardIds
   const pokemonListDoc = await getDoc(doc(db, 'pokemonList', collection.targetPokemonId))
   const cardIds = pokemonListDoc.data().cardIds || []
   
   // Step 2: Query/filter pokemon collection by cardIds
   const allCards = await getDocs(collection(db, 'pokemon'))
   const matchingCards = allCards.filter(card => cardIds.includes(card.id))
   ```
   - `targetPokemonId` references `pokemonList/{pokemonId}`
   - `pokemonList` document contains `cardIds[]` array
   - Cards are filtered from `pokemon` collection where `id` is in `cardIds[]`

**Example (Group Collection)**:
```javascript
{
  userId: "user1",
  userName: "Ash Ketchum",
  name: "Charizard Challenge",
  type: "pokemon",
  targetSetId: null,
  targetSetName: null,
  targetPokemonId: "dex-310-manectric",
  targetPokemonIds: ["dex-310-manectric"],
  targetPokemonName: "Manectric",
  groupId: "group1",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  isActive: true
}
```

**Example (Solo Collection)**:
```javascript
{
  userId: "user1",
  userName: "Ash Ketchum",
  name: "My Base Set Collection",
  type: "set",
  targetSetId: "set123",
  targetSetName: "Base Set",
  targetPokemonIds: null,
  groupId: null,  // Not part of a group
  createdAt: Timestamp,
  updatedAt: Timestamp,
  isActive: true
}
```

**Key Points**:
- **One collection per user per assignment**
- Contains the actual card tracking data
- Can be part of a group (`groupId` set) or standalone (`groupId` null)
- Links to an assignment via `groupId` + `userId` lookup
- **References**:
  - Set collections: `targetSetId` → `sets/{setId}` → query `pokemon` where `setId == targetSetId`
  - Pokemon collections: `targetPokemonId` → `pokemonList/{pokemonId}` → get `cardIds[]` → filter `pokemon` by IDs

---

### 5. `collections/{collectionId}/cards` Subcollection
**Path**: `collections/{collectionId}/cards/{cardId}`

**Purpose**: Tracks individual cards within a collection

**Fields**:
```javascript
{
  pokemonId: string,             // Reference to pokemon/{cardId}
  checkedOff: boolean,           // Whether user has this card
  checkedOffAt: timestamp | null,
  quantity: number,               // Number of copies (for duplicates)
  notes: string,                 // User notes about this card
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Example**:
```javascript
{
  pokemonId: "card123",
  checkedOff: true,
  checkedOffAt: Timestamp,
  quantity: 1,
  notes: "First edition holo",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

### 6. `invites` Collection
**Path**: `invites/{inviteId}`

**Purpose**: Pending group invitations

**Fields**:
```javascript
{
  groupId: string,                // Reference to groups/{groupId}
  groupName: string,              // For easy display
  invitedBy: string,              // userId of person who sent invite
  invitedByName: string,          // Display name of inviter
  email: string,                  // Email address of invitee
  userId: string | null,          // If user has account, their userId (null if no account yet)
  status: "pending" | "accepted" | "declined",
  createdAt: timestamp,
  updatedAt: timestamp,
  acceptedAt: timestamp | null
}
```

---

## Relationships & Flow

### Assignment vs Collection

**They are NOT the same:**

1. **`assignments`**: 
   - **What**: "You need to master set Charizard"
   - **Who**: One assignment per member
   - **When**: Created when group challenge is created
   - **Purpose**: Defines the challenge/task

2. **`collections`**: 
   - **What**: "Here's your collection of Charizard cards"
   - **Who**: One collection per user per assignment
   - **When**: Created when user starts working on their assignment
   - **Purpose**: Tracks actual card progress

### Flow Example: Group Challenge Creation

1. **User creates group challenge**:
   ```
   groups/{groupId} created
   ```

2. **Assignments created** (one per member):
   ```
   assignments/{assignment1} - for creator (userId: "user1", pokemonId: "dex-310-manectric")
   assignments/{assignment2} - for invitee (email: "naveesly@gmail.com", pokemonId: "dex-310-manectric")
   ```

3. **Creator creates collection**:
   ```
   collections/{collection1} created
   - userId: "user1"
   - groupId: "group1"
   - targetPokemonId: "dex-310-manectric"
   
   assignments/{assignment1} updated:
   - collectionId: "collection1"
   
   groups/{groupId} updated:
   - memberCollections.user1: "collection1"
   ```

4. **Invitee accepts invite**:
   ```
   assignments/{assignment2} updated:
   - userId: "user2" (was null)
   - email: null (was "naveesly@gmail.com")
   
   groups/{groupId} updated:
   - members: ["user1", "user2"] (was ["user1", "naveesly@gmail.com"])
   ```

5. **Invitee creates collection**:
   ```
   collections/{collection2} created
   - userId: "user2"
   - groupId: "group1"
   - targetPokemonId: "dex-310-manectric"
   
   assignments/{assignment2} updated:
   - collectionId: "collection2"
   
   groups/{groupId} updated:
   - memberCollections.user2: "collection2"
   ```

### Querying Patterns

**Get all assignments for a group**:
```javascript
query(collection(db, 'assignments'), where('groupId', '==', groupId))
```

**Get assignment for a user in a group**:
```javascript
query(
  collection(db, 'assignments'),
  where('groupId', '==', groupId),
  where('userId', '==', userId)
)
```

**Get assignment by email (before user accepts)**:
```javascript
query(
  collection(db, 'assignments'),
  where('groupId', '==', groupId),
  where('email', '==', email)
)
```

**Get all collections for a user**:
```javascript
query(collection(db, 'collections'), where('userId', '==', userId))
```

**Get all collections in a group**:
```javascript
query(collection(db, 'collections'), where('groupId', '==', groupId))
```

---

## Summary

- **`assignments`**: The challenge/task assignment ("master set Charizard")
- **`collections`**: The actual collection tracking cards ("here are your Charizard cards")
- **`groups`**: Container for multiple assignments and collections
- **`memberCollections`**: Convenience map for quick lookups (can be derived from assignments)

**Key Insight**: An assignment defines WHAT to collect, a collection tracks HOW MANY cards you've collected.

