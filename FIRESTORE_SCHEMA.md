# Firestore Database Schema

## Overview

This document defines the complete Firestore structure for Pokapal, including user profiles, collections (master sets), and groups.

---

## Collections

### 1. `users` Collection
**Path**: `users/{userId}`

**Description**: User profiles and authentication data

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

### 2. `collections` Collection
**Path**: `collections/{collectionId}`

**Description**: Master set collections (top-level, referenced by users and groups)

**Fields**:
```javascript
{
  userId: string,                // Owner of this collection
  userName: string,              // Display name (for easy display)
  name: string,                  // e.g., "Base Set Master Set", "All Charizards"
  type: "set" | "pokemon",       // "set" = mastering a specific set, "pokemon" = mastering specific Pokemon
  targetSetId: string | null,    // If type is "set", reference to sets/{setId}
  targetSetName: string | null,  // For easy display (e.g., "Base Set")
  targetPokemonIds: string[] | null,  // If type is "pokemon", array of pokemon IDs to master
  groupId: string | null,        // If part of a group, reference to groups/{groupId} (null = personal/standalone)
  createdAt: timestamp,
  updatedAt: timestamp,
  isActive: boolean,             // Whether this collection is currently being worked on
  
  // Subcollections:
  // - cards/{cardId}  (see below)
}
```

**Example (Personal Set Collection - Standalone)**:
```javascript
{
  userId: "user123",
  userName: "Ash Ketchum",
  name: "Base Set Master Set",
  type: "set",
  targetSetId: "Uv9zdLidLFbIzKZVDUMM",
  targetSetName: "Base Set",
  targetPokemonIds: null,
  groupId: null,  // Not part of a group - personal collection
  createdAt: Timestamp,
  updatedAt: Timestamp,
  isActive: true
}
```

**Example (Group Set Collection - Shared)**:
```javascript
{
  userId: "user123",
  userName: "Ash Ketchum",
  name: "Base Set Master Set",
  type: "set",
  targetSetId: "Uv9zdLidLFbIzKZVDUMM",
  targetSetName: "Base Set",
  targetPokemonIds: null,
  groupId: "group1",  // Part of a shared group
  createdAt: Timestamp,
  updatedAt: Timestamp,
  isActive: true
}
```

**Example (Pokemon Collection - Standalone)**:
```javascript
{
  userId: "user123",
  userName: "Ash Ketchum",
  name: "All Charizards",
  type: "pokemon",
  targetSetId: null,
  targetSetName: null,
  targetPokemonIds: ["card1", "card2", "card3"],
  groupId: null,  // Not part of a group - personal collection
  createdAt: Timestamp,
  updatedAt: Timestamp,
  isActive: true
}
```

---

### 3. `collections/{collectionId}/cards` Subcollection
**Path**: `collections/{collectionId}/cards/{cardId}`

**Description**: Tracks individual cards within a collection

**Fields**:
```javascript
{
  pokemonId: string,             // Reference to pokemon/{pokemonId}
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
  pokemonId: "abc123",
  checkedOff: true,
  checkedOffAt: Timestamp,
  quantity: 2,
  notes: "First edition holo",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

### 4. `groups` Collection
**Path**: `groups/{groupId}`

**Description**: Group expeditions for shared or individual master sets

**Fields**:
```javascript
{
  name: string,                  // e.g., "Base Set Challenge 2024"
  description: string,            // Group description
  inviteCode: string,            // Unique invite code (e.g., "BASE2024")
  createdBy: string,             // userId of creator
  createdAt: timestamp,
  updatedAt: timestamp,
  
  // Group Type
  type: "shared" | "individual",  // "shared" = everyone masters same set, "individual" = each person masters their own
  
  // Shared Mode (type === "shared")
  targetSetId: string | null,    // The set everyone is mastering together
  targetSetName: string | null,  // For easy display
  
  // Individual Mode (type === "individual")
  // Each member has their own collection tracked separately
  
  // Members
  members: string[],             // Array of userIds
  memberCollections: {            // Map of userId -> collectionId (for individual mode)
    [userId: string]: string     // userId: collectionId
  },
  
  // Subcollections:
  // - activity/{activityId}  (see below)
}
```

**Example (Shared Group)**:
```javascript
{
  name: "Base Set Master Set Challenge",
  description: "Let's master Base Set together!",
  inviteCode: "BASE2024",
  createdBy: "user1",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  type: "shared",
  targetSetId: "Uv9zdLidLFbIzKZVDUMM",
  targetSetName: "Base Set",
  members: ["user1", "user2", "user3"],
  memberCollections: {}
}
```

**Example (Individual Group)**:
```javascript
{
  name: "Personal Master Set Race",
  description: "Everyone masters their own set!",
  inviteCode: "RACE2024",
  createdBy: "user1",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  type: "individual",
  targetSetId: null,
  targetSetName: null,
  members: ["user1", "user2", "user3"],
  memberCollections: {
    "user1": "collection1",
    "user2": "collection2",
    "user3": "collection3"
  }
}
```

---

### 5. `invites` Collection
**Path**: `invites/{inviteId}`

**Description**: Pending group invitations (for users who don't have accounts yet or haven't accepted)

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
  type: "shared" | "individual",  // Group type
  createdAt: timestamp,
  updatedAt: timestamp,
  acceptedAt: timestamp | null
}
```

**Example (Invite for user without account)**:
```javascript
{
  groupId: "group1",
  groupName: "Base Set Challenge",
  invitedBy: "user1",
  invitedByName: "Ash Ketchum",
  email: "friend@example.com",
  userId: null,  // No account yet
  status: "pending",
  type: "individual",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  acceptedAt: null
}
```

**Example (Invite for user with account)**:
```javascript
{
  groupId: "group1",
  groupName: "Base Set Challenge",
  invitedBy: "user1",
  invitedByName: "Ash Ketchum",
  email: "user2@example.com",
  userId: "user2",  // Has account
  status: "pending",
  type: "individual",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  acceptedAt: null
}
```

---

### 6. `groups/{groupId}/activity` Subcollection
**Path**: `groups/{groupId}/activity/{activityId}`

**Description**: Activity feed for group events

**Fields**:
```javascript
{
  userId: string,                // User who performed the action
  userName: string,              // Display name (for easy display)
  type: "pull" | "complete_set" | "join" | "check_off" | "milestone",
  pokemonId: string | null,     // If type is "pull" or "check_off"
  pokemonName: string | null,    // For easy display
  collectionId: string | null,   // Collection this activity relates to
  message: string,               // Human-readable message
  timestamp: timestamp,
  metadata: {                    // Additional data
    [key: string]: any
  }
}
```

**Example**:
```javascript
{
  userId: "user1",
  userName: "Ash Ketchum",
  type: "check_off",
  pokemonId: "abc123",
  pokemonName: "Charizard",
  collectionId: "collection1",
  message: "Ash Ketchum checked off Charizard!",
  timestamp: Timestamp,
  metadata: {
    completionPercentage: 45.5
  }
}
```

---

## Data Relationships

### User → Collections → Cards
```
users/{userId}
  └── collections: [collectionId1, collectionId2, ...]

collections/{collectionId}
  ├── userId → users/{userId}
  └── cards/{cardId}
      └── pokemonId → pokemon/{pokemonId}
```

### Group → Members → Collections
```
groups/{groupId}
  ├── members: [userId1, userId2, ...]
  ├── memberCollections: { userId1: collectionId1, ... }
  └── activity/{activityId}
      (subcollection for activity feed)
```

### Personal Collection Flow (Standalone)
1. User creates a collection in `collections/` with:
   - `userId` = their userId
   - `groupId` = null (standalone)
   - `targetSetId` or `targetPokemonIds` set
2. Collection ID added to user's `collections` array
3. User can work on it independently

### Shared Group Flow
1. User creates group with `type: "shared"` and `targetSetId`
2. Members join group (added to `members` array)
3. Each member creates their own collection in `collections/` with:
   - `userId` = their userId
   - `groupId` = group's groupId (links to group)
   - `targetSetId` = group's `targetSetId`
   - Collection ID added to user's `collections` array
4. Progress is tracked individually but compared within the group
5. Query all members' collections: `where('groupId', '==', groupId)` OR `where('targetSetId', '==', group.targetSetId)`

### Individual Group Flow
1. User creates group with `type: "individual"`
2. Members join group (added to `members` array)
3. Each member creates their own collection in `collections/` (can be different sets/Pokemon) with:
   - `userId` = their userId
   - `groupId` = group's groupId (links to group)
   - `targetSetId` or `targetPokemonIds` set (can be different per member)
   - Collection ID added to user's `collections` array
4. Group tracks each member's collection via `memberCollections` map: `{ userId: collectionId }`
5. Progress is tracked individually and displayed together
6. Query member collections: `where('groupId', '==', groupId)` OR use `memberCollections` map to get collectionIds

---

## Query Patterns

### Get User's Collections
```javascript
const collectionsRef = collection(db, 'collections')
const q = query(collectionsRef, where('userId', '==', userId), where('isActive', '==', true))
```

### Get Cards in a Collection
```javascript
const cardsRef = collection(db, 'collections', collectionId, 'cards')
const q = query(cardsRef, where('checkedOff', '==', true))
```

### Get All Collections for a Group
```javascript
const collectionsRef = collection(db, 'collections')
const q = query(collectionsRef, where('groupId', '==', groupId))
```

### Get All Collections for a Set (for shared groups)
```javascript
const collectionsRef = collection(db, 'collections')
const q = query(collectionsRef, where('targetSetId', '==', setId))
```

### Get User's Personal Collections (not in a group)
```javascript
const collectionsRef = collection(db, 'collections')
const q = query(collectionsRef, where('userId', '==', userId), where('groupId', '==', null))
```

### Get Group Members' Progress
```javascript
// For shared group: Get all members' collections for the targetSetId
// For individual group: Get collections referenced in memberCollections
```

### Get Group Activity Feed
```javascript
const activityRef = collection(db, 'groups', groupId, 'activity')
const q = query(activityRef, orderBy('timestamp', 'desc'), limit(50))
```

---

## Notes

1. **Collection Types**:
   - `"set"`: User is mastering a specific set (e.g., Base Set)
   - `"pokemon"`: User is mastering specific Pokemon across sets (e.g., all Charizards)

2. **Group Types**:
   - `"shared"`: All members work on the same master set
   - `"individual"`: Each member works on their own master set

3. **Invite Codes**: Should be unique and user-friendly (e.g., "BASE2024", "RACE2024")

4. **Activity Feed**: Can be used for:
   - Recent card pulls/completions
   - Set completions
   - Milestones (50%, 75%, 100%)
   - Member joins

5. **Progress Tracking**: 
   - For shared groups: Compare completion % across members
   - For individual groups: Show each member's progress on their own collection

