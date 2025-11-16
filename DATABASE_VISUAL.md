# Pokapal Database Structure - Visual Guide

## Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           POKAPAL DATABASE                              │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│    users     │
│  {userId}    │
├──────────────┤
│ email        │
│ displayName  │
│ groups[]     │──────┐
│ collections[]│      │
│ isAdmin      │      │
└──────────────┘      │
                      │
                      │ references
                      │
┌──────────────┐      │      ┌──────────────┐
│   groups     │◄─────┘      │ assignments │
│  {groupId}   │             │{assignmentId}│
├──────────────┤             ├──────────────┤
│ name         │             │ groupId      │──────┐
│ inviteCode   │             │ userId       │      │
│ createdBy    │             │ email        │      │
│ members[]    │             │ type         │      │
│ memberColl{} │             │ setId        │      │
└──────────────┘             │ pokemonId    │      │
       │                     │ collectionId │      │
       │                     └──────────────┘      │
       │                            │              │
       │                            │ references  │
       │                            │             │
       │                            ▼             │
       │                     ┌──────────────┐    │
       │                     │ collections   │    │
       │                     │{collectionId} │    │
       │                     ├──────────────┤    │
       │                     │ userId       │◄───┘
       │                     │ name         │
       │                     │ type         │
       │                     │ targetSetId   │
       │                     │ targetPokemonId│
       │                     │ groupId       │◄───┐
       │                     └──────────────┘    │
       │                            │            │
       │                            │ contains   │
       │                            ▼            │
       │                     ┌──────────────┐   │
       │                     │    cards      │   │
       │                     │  {cardId}     │   │
       │                     ├──────────────┤   │
       │                     │ pokemonId     │   │
       │                     │ checkedOff    │   │
       │                     │ quantity      │   │
       │                     └──────────────┘   │
       │                                        │
       └────────────────────────────────────────┘
```

---

## Detailed Relationship Diagram

### Group Challenge Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    GROUP CHALLENGE CREATION                         │
└─────────────────────────────────────────────────────────────────────┘

Step 1: Create Group
┌─────────────────┐
│ groups/{groupId}│
├─────────────────┤
│ name: "Test"    │
│ inviteCode: "2OJDJ5"
│ members: [      │
│   "user1",      │
│   "email@..."   │
│ ]               │
└─────────────────┘
         │
         │ creates
         ▼
Step 2: Create Assignments (one per member)
┌──────────────────────────────────────────────────────────┐
│              assignments/{assignmentId}                   │
├──────────────────────────────────────────────────────────┤
│ assignment1:                                             │
│   groupId: "group1"                                      │
│   userId: "user1"                                        │
│   email: null                                            │
│   pokemonId: "dex-310-manectric"                         │
│   collectionId: null  ←─── Not created yet               │
│                                                          │
│ assignment2:                                             │
│   groupId: "group1"                                      │
│   userId: null                                           │
│   email: "naveesly@gmail.com"                            │
│   pokemonId: "dex-310-manectric"                         │
│   collectionId: null  ←─── Not created yet               │
└──────────────────────────────────────────────────────────┘
         │
         │ user creates collection
         ▼
Step 3: Create Collection
┌──────────────────────────────────────────────────────────┐
│           collections/{collectionId}                     │
├──────────────────────────────────────────────────────────┤
│ userId: "user1"                                          │
│ name: "Test"                                             │
│ type: "pokemon"                                          │
│ targetPokemonId: "dex-310-manectric"                     │
│ groupId: "group1"  ←─── Links back to group             │
│                                                          │
│ ┌────────────────────────────────────────────┐          │
│ │ cards/{cardId}                             │          │
│ ├────────────────────────────────────────────┤          │
│ │ pokemonId: "card123"                       │          │
│ │ checkedOff: true                           │          │
│ │ quantity: 1                                │          │
│ └────────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────────┘
         │
         │ updates
         ▼
Step 4: Update Assignment & Group
┌──────────────────────────────────────────────────────────┐
│              assignments/{assignmentId}                   │
├──────────────────────────────────────────────────────────┤
│ collectionId: "collection1"  ←─── Now linked!            │
└──────────────────────────────────────────────────────────┘

┌─────────────────┐
│ groups/{groupId}│
├─────────────────┤
│ memberCollections: {
│   "user1": "collection1"  ←─── Quick lookup map
│ }
└─────────────────┘
```

---

## Data Flow Visualization

### "Assign to All" Scenario

```
                    GROUP CREATION
                         │
                         ▼
        ┌────────────────────────────────┐
        │  groups/{groupId}              │
        │  name: "Charizard Challenge"   │
        └────────────────────────────────┘
                         │
                         │ creates
                         ▼
        ┌─────────────────────────────────────────────┐
        │  assignments/{assignment1}                  │
        │  userId: "user1"                            │
        │  pokemonId: "dex-6-charizard"  ←─── Same   │
        │  collectionId: null                         │
        └─────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
        ┌─────────────────────────────────────────────┐
        │  assignments/{assignment2}                  │
        │  email: "user2@email.com"                   │
        │  pokemonId: "dex-6-charizard"  ←─── Same   │
        │  collectionId: null                         │
        └─────────────────────────────────────────────┘
                         │
                         │ each user creates collection
                         ▼
        ┌─────────────────────────────────────────────┐
        │  collections/{collection1}                  │
        │  userId: "user1"                            │
        │  targetPokemonId: "dex-6-charizard"          │
        │  groupId: "group1"                          │
        └─────────────────────────────────────────────┘
                         │
                         │ updates assignment
                         ▼
        ┌─────────────────────────────────────────────┐
        │  assignments/{assignment1}                  │
        │  collectionId: "collection1"  ←─── Linked! │
        └─────────────────────────────────────────────┘
```

### Individual Assignments Scenario

```
                    GROUP CREATION
                         │
                         ▼
        ┌────────────────────────────────┐
        │  groups/{groupId}              │
        │  name: "Individual Challenge"  │
        └────────────────────────────────┘
                         │
                         │ creates
                         ▼
        ┌─────────────────────────────────────────────┐
        │  assignments/{assignment1}                  │
        │  userId: "user1"                            │
        │  pokemonId: "dex-6-charizard"  ←─── Different│
        │  collectionId: null                         │
        └─────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
        ┌─────────────────────────────────────────────┐
        │  assignments/{assignment2}                  │
        │  email: "user2@email.com"                   │
        │  pokemonId: "dex-310-manectric" ←─── Different│
        │  collectionId: null                         │
        └─────────────────────────────────────────────┘
                         │
                         │ each user creates collection
                         ▼
        ┌─────────────────────────────────────────────┐
        │  collections/{collection1}                  │
        │  userId: "user1"                            │
        │  targetPokemonId: "dex-6-charizard"         │
        │  groupId: "group1"                          │
        └─────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
        ┌─────────────────────────────────────────────┐
        │  collections/{collection2}                  │
        │  userId: "user2"                            │
        │  targetPokemonId: "dex-310-manectric"       │
        │  groupId: "group1"                          │
        └─────────────────────────────────────────────┘
```

---

## Collection Hierarchy

```
users/{userId}
│
├── groups: ["group1", "group2"]
│
└── collections: ["collection1", "collection2"]
    │
    └── collections/{collectionId}
        │
        ├── userId: "user1"
        ├── name: "My Collection"
        ├── type: "pokemon"
        ├── targetPokemonId: "dex-6-charizard"
        ├── groupId: "group1"  ←─── Optional: links to group
        │
        └── cards/{cardId}
            │
            ├── pokemonId: "card123"
            ├── checkedOff: true
            ├── quantity: 1
            └── notes: "First edition"


groups/{groupId}
│
├── members: ["user1", "user2"]
├── memberCollections: {
│     "user1": "collection1",
│     "user2": "collection2"
│   }
│
└── (references) assignments/{assignmentId}
    │
    ├── groupId: "group1"
    ├── userId: "user1"
    ├── pokemonId: "dex-6-charizard"
    └── collectionId: "collection1"  ←─── Links to collection


assignments/{assignmentId}
│
├── groupId: "group1"  ←─── Links to group
├── userId: "user1"    ←─── Links to user
├── pokemonId: "dex-6-charizard"
└── collectionId: "collection1"  ←─── Links to collection
```

---

## Query Patterns Visual

### Get All Assignments for a Group
```
assignments/{assignmentId}
    │
    ├── groupId: "group1"  ←─── Query: where('groupId', '==', 'group1')
    ├── groupId: "group1"
    └── groupId: "group1"
```

### Get Assignment for User
```
assignments/{assignmentId}
    │
    ├── groupId: "group1"  ←─── Query: where('groupId', '==', 'group1')
    │   userId: "user1"   ←─── AND where('userId', '==', 'user1')
    │
    └── groupId: "group1"
        userId: "user2"
```

### Get Collections in Group
```
collections/{collectionId}
    │
    ├── groupId: "group1"  ←─── Query: where('groupId', '==', 'group1')
    ├── groupId: "group1"
    └── groupId: null      ←─── Not in group (solo collection)
```

### Link Assignment to Collection
```
assignments/{assignmentId}          collections/{collectionId}
    │                                    │
    ├── groupId: "group1"               ├── groupId: "group1"
    ├── userId: "user1"                 ├── userId: "user1"
    ├── pokemonId: "dex-6-charizard"    ├── targetPokemonId: "dex-6-charizard"
    └── collectionId: "collection1" ────┘ id: "collection1"
         ↑                                    ↑
         └────────────────────────────────────┘
              Links together!
```

---

## Key Relationships Summary

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  USER    │────────▶│  GROUP   │◀────────│ ASSIGNMENT│
└──────────┘         └──────────┘         └──────────┘
     │                    │                      │
     │                    │                      │
     │                    │                      │
     ▼                    ▼                      ▼
┌──────────┐         ┌──────────┐         ┌──────────┐
│COLLECTION│◀────────│  GROUP   │────────▶│ ASSIGNMENT│
└──────────┘         └──────────┘         └──────────┘
     │                    │                      │
     │                    │                      │
     │                    │                      │
     ▼                    │                      │
┌──────────┐              │                      │
│  CARDS   │              │                      │
└──────────┘              │                      │
                          │                      │
                          └──────────────────────┘
                                    │
                                    ▼
                          ┌─────────────────┐
                          │ memberCollections│
                          │  (quick lookup) │
                          └─────────────────┘
```

---

## Real-World Example

```
User: "Ash Ketchum" (user1)
  │
  ├── Creates Group: "Charizard Challenge" (group1)
  │   │
  │   ├── Invites: "naveesly@gmail.com"
  │   │
  │   └── Creates Assignments:
  │       │
  │       ├── Assignment 1:
  │       │   userId: "user1"
  │       │   pokemonId: "dex-6-charizard"
  │       │   collectionId: null
  │       │
  │       └── Assignment 2:
  │           email: "naveesly@gmail.com"
  │           pokemonId: "dex-6-charizard"
  │           collectionId: null
  │
  └── Creates Collection: "Charizard Challenge" (collection1)
      │
      ├── userId: "user1"
      ├── groupId: "group1"
      ├── targetPokemonId: "dex-6-charizard"
      │
      └── Cards:
          ├── Card 1: checkedOff: true
          ├── Card 2: checkedOff: false
          └── Card 3: checkedOff: true

Later: "naveesly@gmail.com" accepts invite
  │
  ├── Assignment 2 Updated:
  │   userId: "user2" (was null)
  │   email: null (was "naveesly@gmail.com")
  │
  └── Creates Collection: "Charizard Challenge" (collection2)
      │
      ├── userId: "user2"
      ├── groupId: "group1"
      ├── targetPokemonId: "dex-6-charizard"
      │
      └── Cards:
          ├── Card 1: checkedOff: false
          ├── Card 2: checkedOff: true
          └── Card 3: checkedOff: false
```

---

## Quick Reference

| Collection | Purpose | Key Fields | Links To |
|------------|---------|------------|----------|
| `users` | User profiles | `groups[]`, `collections[]` | Groups, Collections |
| `groups` | Challenge containers | `members[]`, `memberCollections{}` | Users, Collections |
| `assignments` | Challenge assignments | `groupId`, `userId`, `collectionId` | Groups, Users, Collections |
| `collections` | Card tracking | `userId`, `groupId`, `targetSetId`, `targetPokemonId` | Users, Groups, Sets, PokemonList |
| `cards` | Individual cards | `pokemonId`, `checkedOff` | Collections |

## Card Querying Reference

### Set Collection Card Query
```
collections/{collectionId}
    │
    ├── type: "set"
    ├── targetSetId: "set123"  ←─── References sets/{setId}
    │
    └── Query cards:
        query(pokemon, where('setId', '==', 'set123'))
        │
        └── Returns all cards in pokemon collection
            where setId matches targetSetId
```

### Pokemon Collection Card Query
```
collections/{collectionId}
    │
    ├── type: "pokemon"
    ├── targetPokemonId: "dex-6-charizard"  ←─── References pokemonList/{pokemonId}
    │
    └── Query cards:
        Step 1: Get pokemonList/{pokemonId}
            └── cardIds: ["card1", "card2", "card3", ...]
        │
        Step 2: Filter pokemon collection
            └── Filter where id IN cardIds[]
                │
                └── Returns all cards matching those IDs
```

### Reference Chain Summary

**Set Collection**:
```
collections/{collectionId}
    └── targetSetId → sets/{setId}
                        └── Query: pokemon where setId == targetSetId
```

**Pokemon Collection**:
```
collections/{collectionId}
    └── targetPokemonId → pokemonList/{pokemonId}
                            └── cardIds[] → Filter pokemon where id IN cardIds[]
```

**Remember**: 
- **Assignment** = "What to collect" (the task)
- **Collection** = "Which cards you have" (the progress)

