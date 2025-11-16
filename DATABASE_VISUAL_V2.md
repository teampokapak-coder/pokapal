# Pokapal Database Structure V2 - Visual Guide

## Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    POKAPAL DATABASE V2 (SIMPLIFIED)                     │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│    users     │
│  {userId}    │
├──────────────┤
│ email        │
│ displayName  │
│ challenges[] │──────┐
│ isAdmin      │      │
└──────────────┘      │
                      │ references
                      │
┌──────────────┐      │      ┌──────────────┐
│ challenges   │◄─────┘      │ assignments │
│{challengeId} │             │{assignmentId}│
├──────────────┤             ├──────────────┤
│ name         │             │ challengeId  │──────┐
│ inviteCode   │             │ userId       │      │
│ createdBy    │             │ email        │      │
│ members[]    │             │ type         │      │
└──────────────┘             │ setId        │      │
       │                     │ pokemonId    │      │
       │                     └──────────────┘      │
       │                            │              │
       │                            │ references   │
       │                            │              │
       │                            ▼              │
       │                     ┌──────────────┐     │
       │                     │ collectorList│     │
       │                     │{collectorId} │     │
       │                     ├──────────────┤     │
       │                     │ userId       │◄────┘
       │                     │ assignmentId │──────┐
       │                     │ challengeId   │◄─────┘
       │                     │ cardId       │
       │                     │ checkedOff   │
       │                     │ quantity     │
       │                     └──────────────┘
       │
       └──────────────────────────────────────────┘
```

---

## Detailed Relationship Diagram

### Challenge Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CHALLENGE CREATION                                │
└─────────────────────────────────────────────────────────────────────┘

Step 1: Create Challenge
┌─────────────────────────────┐
│ challenges/{challengeId}    │
├─────────────────────────────┤
│ name: "Charizard Challenge" │
│ inviteCode: "CHAR2024"      │
│ members: [                  │
│   "user1",                  │
│   "naveesly@gmail.com"       │
│ ]                           │
└─────────────────────────────┘
         │
         │ creates
         ▼
Step 2: Create Assignments (one per member)
┌──────────────────────────────────────────────────────────┐
│              assignments/{assignmentId}                   │
├──────────────────────────────────────────────────────────┤
│ assignment1:                                             │
│   challengeId: "challenge1"                              │
│   userId: "user1"                                        │
│   pokemonId: "dex-6-charizard"                          │
│                                                          │
│ assignment2:                                             │
│   challengeId: "challenge1"                              │
│   email: "naveesly@gmail.com"                           │
│   pokemonId: "dex-6-charizard"                           │
└──────────────────────────────────────────────────────────┘
         │
         │ user collects cards
         ▼
Step 3: Create CollectorList Entries (one per card owned)
┌──────────────────────────────────────────────────────────┐
│           collectorList/{collectorId}                    │
├──────────────────────────────────────────────────────────┤
│ collector1:                                              │
│   userId: "user1"                                        │
│   assignmentId: "assignment1"                           │
│   challengeId: "challenge1"                              │
│   cardId: "card123"                                     │
│   checkedOff: true                                      │
│   quantity: 1                                           │
│                                                          │
│ collector2:                                              │
│   userId: "user1"                                        │
│   assignmentId: "assignment1"                           │
│   challengeId: "challenge1"                              │
│   cardId: "card456"                                     │
│   checkedOff: false                                     │
│   quantity: 0                                           │
└──────────────────────────────────────────────────────────┘
```

---

## Data Flow Visualization

### "Assign to All" Scenario

```
                    CHALLENGE CREATION
                         │
                         ▼
        ┌────────────────────────────────┐
        │  challenges/{challengeId}      │
        │  name: "Charizard Challenge"    │
        └────────────────────────────────┘
                         │
                         │ creates
                         ▼
        ┌─────────────────────────────────────────────┐
        │  assignments/{assignment1}                  │
        │  userId: "user1"                            │
        │  pokemonId: "dex-6-charizard"  ←─── Same   │
        └─────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
        ┌─────────────────────────────────────────────┐
        │  assignments/{assignment2}                  │
        │  email: "user2@email.com"                   │
        │  pokemonId: "dex-6-charizard"  ←─── Same   │
        └─────────────────────────────────────────────┘
                         │
                         │ each user collects cards
                         ▼
        ┌─────────────────────────────────────────────┐
        │  collectorList/{collector1}                 │
        │  userId: "user1"                            │
        │  assignmentId: "assignment1"                │
        │  cardId: "card123"                          │
        │  checkedOff: true                           │
        └─────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
        ┌─────────────────────────────────────────────┐
        │  collectorList/{collector2}                 │
        │  userId: "user2"                            │
        │  assignmentId: "assignment2"                │
        │  cardId: "card123"                          │
        │  checkedOff: false                          │
        └─────────────────────────────────────────────┘
```

### Individual Assignments Scenario

```
                    CHALLENGE CREATION
                         │
                         ▼
        ┌────────────────────────────────┐
        │  challenges/{challengeId}      │
        │  name: "Individual Challenge"  │
        └────────────────────────────────┘
                         │
                         │ creates
                         ▼
        ┌─────────────────────────────────────────────┐
        │  assignments/{assignment1}                  │
        │  userId: "user1"                            │
        │  pokemonId: "dex-6-charizard"  ←─── Different│
        └─────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
        ┌─────────────────────────────────────────────┐
        │  assignments/{assignment2}                  │
        │  email: "user2@email.com"                   │
        │  pokemonId: "dex-310-manectric" ←─── Different│
        └─────────────────────────────────────────────┘
                         │
                         │ each user collects cards
                         ▼
        ┌─────────────────────────────────────────────┐
        │  collectorList/{collector1}                 │
        │  userId: "user1"                            │
        │  assignmentId: "assignment1"                │
        │  cardId: "charizard-card-1"                 │
        │  checkedOff: true                           │
        └─────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
        ┌─────────────────────────────────────────────┐
        │  collectorList/{collector2}                 │
        │  userId: "user2"                            │
        │  assignmentId: "assignment2"                │
        │  cardId: "manectric-card-1"                 │
        │  checkedOff: false                          │
        └─────────────────────────────────────────────┘
```

---

## Collection Hierarchy

```
users/{userId}
│
├── challenges: ["challenge1", "challenge2"]
│
└── (no direct collections array needed)


challenges/{challengeId}
│
├── name: "Charizard Challenge"
├── inviteCode: "CHAR2024"
├── members: ["user1", "user2"]
│
└── (references) assignments/{assignmentId}
    │
    ├── challengeId: "challenge1"
    ├── userId: "user1"
    ├── pokemonId: "dex-6-charizard"
    │
    └── (references) collectorList/{collectorId}
        │
        ├── userId: "user1"
        ├── assignmentId: "assignment1"
        ├── challengeId: "challenge1"
        ├── cardId: "card123"
        └── checkedOff: true


assignments/{assignmentId}
│
├── challengeId: "challenge1"  ←─── Links to challenge
├── userId: "user1"           ←─── Links to user
├── pokemonId: "dex-6-charizard"
│
└── (references) collectorList/{collectorId}
    │
    ├── assignmentId: "assignment1"  ←─── Links to assignment
    ├── userId: "user1"
    ├── cardId: "card123"
    └── checkedOff: true
```

---

## Query Patterns Visual

### Get All Assignments for a Challenge
```
assignments/{assignmentId}
    │
    ├── challengeId: "challenge1"  ←─── Query: where('challengeId', '==', 'challenge1')
    ├── challengeId: "challenge1"
    └── challengeId: "challenge1"
```

### Get Assignment for a User
```
assignments/{assignmentId}
    │
    ├── challengeId: "challenge1"  ←─── Query: where('challengeId', '==', 'challenge1')
    │   userId: "user1"           ←─── AND where('userId', '==', 'user1')
    │
    └── challengeId: "challenge1"
        userId: "user2"
```

### Get All Cards User Owns for an Assignment
```
collectorList/{collectorId}
    │
    ├── userId: "user1"           ←─── Query: where('userId', '==', 'user1')
    │   assignmentId: "assignment1" ←─── AND where('assignmentId', '==', 'assignment1')
    │   checkedOff: true          ←─── AND where('checkedOff', '==', true)
    │
    ├── userId: "user1"
    │   assignmentId: "assignment1"
    │   checkedOff: true
    │
    └── userId: "user1"
        assignmentId: "assignment2"
        checkedOff: false
```

### Get All Cards User Owns in a Challenge
```
collectorList/{collectorId}
    │
    ├── userId: "user1"           ←─── Query: where('userId', '==', 'user1')
    │   challengeId: "challenge1" ←─── AND where('challengeId', '==', 'challenge1')
    │   checkedOff: true
    │
    └── userId: "user1"
        challengeId: "challenge1"
        checkedOff: false
```

### Link Assignment to Cards Owned
```
assignments/{assignmentId}          collectorList/{collectorId}
    │                                    │
    ├── challengeId: "challenge1"        ├── challengeId: "challenge1"
    ├── userId: "user1"                 ├── userId: "user1"
    ├── pokemonId: "dex-6-charizard"    ├── assignmentId: "assignment1" ────┐
    │                                    ├── cardId: "card123"             │
    └── id: "assignment1" ─────────────┘ checkedOff: true                 │
         ↑                                                                  │
         └──────────────────────────────────────────────────────────────────┘
              Links together!
```

---

## Key Relationships Summary

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  USER    │────────▶│ CHALLENGE│◀────────│ASSIGNMENT│
└──────────┘         └──────────┘         └──────────┘
     │                    │                      │
     │                    │                      │
     │                    │                      │
     ▼                    ▼                      ▼
┌──────────┐         ┌──────────┐         ┌──────────┐
│COLLECTOR │◀────────│ CHALLENGE│────────▶│ASSIGNMENT│
│  LIST    │         └──────────┘         └──────────┘
└──────────┘              │                      │
     │                     │                      │
     │                     │                      │
     └─────────────────────┴──────────────────────┘
                                    │
                                    ▼
                          ┌─────────────────┐
                          │  collectorList  │
                          │  (card ownership)│
                          └─────────────────┘
```

---

## Real-World Example

```
User: "Ash Ketchum" (user1)
  │
  ├── Creates Challenge: "Charizard Challenge" (challenge1)
  │   │
  │   ├── Invites: "naveesly@gmail.com"
  │   │
  │   └── Creates Assignments:
  │       │
  │       ├── Assignment 1:
  │       │   userId: "user1"
  │       │   pokemonId: "dex-6-charizard"
  │       │
  │       └── Assignment 2:
  │           email: "naveesly@gmail.com"
  │           pokemonId: "dex-6-charizard"
  │
  └── Collects Cards (creates collectorList entries):
      │
      ├── Collector Entry 1:
      │   userId: "user1"
      │   assignmentId: "assignment1"
      │   challengeId: "challenge1"
      │   cardId: "charizard-base-set"
      │   checkedOff: true
      │
      ├── Collector Entry 2:
      │   userId: "user1"
      │   assignmentId: "assignment1"
      │   challengeId: "challenge1"
      │   cardId: "charizard-fossil"
      │   checkedOff: true
      │
      └── Collector Entry 3:
          userId: "user1"
          assignmentId: "assignment1"
          challengeId: "challenge1"
          cardId: "charizard-team-rocket"
          checkedOff: false

Later: "naveesly@gmail.com" accepts invite
  │
  ├── Assignment 2 Updated:
  │   userId: "user2" (was null)
  │   email: null (was "naveesly@gmail.com")
  │
  └── Collects Cards (creates collectorList entries):
      │
      ├── Collector Entry 4:
      │   userId: "user2"
      │   assignmentId: "assignment2"
      │   challengeId: "challenge1"
      │   cardId: "charizard-base-set"
      │   checkedOff: false
      │
      └── Collector Entry 5:
          userId: "user2"
          assignmentId: "assignment2"
          challengeId: "challenge1"
          cardId: "charizard-fossil"
          checkedOff: true
```

---

## Quick Reference

| Collection | Purpose | Key Fields | Links To |
|------------|---------|------------|----------|
| `users` | User profiles | `challenges[]` | Challenges |
| `challenges` | Challenge containers | `members[]` | Users |
| `assignments` | Task definitions | `challengeId`, `userId`, `setId`, `pokemonId` | Challenges, Users, Sets, PokemonList |
| `collectorList` | Card ownership | `userId`, `assignmentId`, `challengeId`, `cardId` | Users, Assignments, Challenges, Cards |

---

## Card Querying Reference

### Set Assignment Card Query
```
assignments/{assignmentId}
    │
    ├── type: "set"
    ├── setId: "set123"  ←─── References sets/{setId}
    │
    └── Query cards:
        query(pokemon, where('setId', '==', 'set123'))
        │
        └── Returns all cards in pokemon collection
            where setId matches assignment.setId
            │
            └── Check ownership:
                query(collectorList, 
                  where('userId', '==', userId),
                  where('assignmentId', '==', assignmentId),
                  where('cardId', '==', cardId))
```

### Pokemon Assignment Card Query
```
assignments/{assignmentId}
    │
    ├── type: "pokemon"
    ├── pokemonId: "dex-6-charizard"  ←─── References pokemonList/{pokemonId}
    │
    └── Query cards:
        Step 1: Get pokemonList/{pokemonId}
            └── cardIds: ["card1", "card2", "card3", ...]
        │
        Step 2: Filter pokemon collection
            └── Filter where id IN cardIds[]
                │
                └── Returns all cards matching those IDs
                    │
                    └── Check ownership:
                        query(collectorList,
                          where('userId', '==', userId),
                          where('assignmentId', '==', assignmentId),
                          where('cardId', '==', cardId))
```

### Reference Chain Summary

**Set Assignment**:
```
assignments/{assignmentId}
    └── setId → sets/{setId}
                └── Query: pokemon where setId == assignment.setId
                            └── Check: collectorList where userId + assignmentId + cardId
```

**Pokemon Assignment**:
```
assignments/{assignmentId}
    └── pokemonId → pokemonList/{pokemonId}
                    └── cardIds[] → Filter pokemon where id IN cardIds[]
                                    └── Check: collectorList where userId + assignmentId + cardId
```

---

## Benefits Visualization

### Old Structure (Nested)
```
collections/{collectionId}
    └── cards/{cardId}  ←─── Nested subcollection
            │
            └── Hard to query across collections
                Hard to compare users
                Document size limits
```

### New Structure (Flat)
```
assignments/{assignmentId}  ←─── What to collect
    │
    └── collectorList/{collectorId}  ←─── What user owns
            │
            └── Easy to query
                Easy to compare
                No size limits
                Flexible indexing
```

---

## Summary

**Key Concepts**:
- **`challenges`**: High-level container (name, invite code, members)
- **`assignments`**: What each user needs to collect (set/pokemon)
- **`collectorList`**: Individual card ownership (one doc per user+card+assignment)

**Benefits**:
- ✅ Cleaner separation of concerns
- ✅ No nested collections
- ✅ Flexible querying
- ✅ Better scalability
- ✅ Simpler updates

**Remember**: 
- **Assignment** = "What to collect" (the task)
- **CollectorList** = "Which cards you own" (the progress)

