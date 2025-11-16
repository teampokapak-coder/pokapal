# Admin Panel Guide

## Overview

The admin panel provides a complete backend UI for managing Pokemon card data in Firebase. Access it at `/admin` after setting up Firebase.

## Features

### 1. Admin Dashboard (`/admin`)
- View Firebase connection status
- See counts of sets and Pokemon cards
- Seed initial sets data
- Navigate to different admin sections

### 2. Pokemon Cards Management (`/admin/pokemon`)

#### Add Single Card
Complete form with all fields:
- **Basic Info**: Name, National Dex Number
- **Set Info**: Set name, Set Code, Set Number, Release Year, Series
- **Card Details**: Rarity, Card Type (Pokemon/Trainer/Energy)
- **Pokemon-specific**: Types, Stage, HP
- **Variants**: Holo, Reverse Holo, First Edition, Shadowless, Full Art, Rainbow
- **Metadata**: Artist, Image URL, Thumbnail URL

#### Bulk Upload
Paste a JSON array of Pokemon cards to upload multiple at once:
```json
[
  {
    "name": "Pikachu",
    "nationalDexNumber": 25,
    "set": "Base Set",
    "setCode": "BS",
    "setNumber": "58/102",
    "releaseYear": 1999,
    "series": "Original Series",
    "rarity": "Common",
    "cardType": "Pokemon",
    "types": ["Electric"],
    "stage": "Basic",
    "hp": 60,
    "isHolo": false,
    "artist": "Ken Sugimori"
  }
]
```

#### View All Cards
- List all Pokemon cards in Firebase
- Delete individual cards
- See card details at a glance

### 3. Sets Management (`/admin/sets`)

#### Add/Edit Sets
- Set Name
- Set Code (e.g., "BS", "JU")
- Release Date
- Total Cards
- Series
- Logo URL

#### View All Sets
- List all sets
- Edit existing sets
- Delete sets

## Data Structure

### Pokemon Card Document
```javascript
{
  name: string,
  nationalDexNumber: number,
  set: string,
  setCode: string,
  setNumber: string,
  releaseYear: number,
  series: string,
  rarity: string,
  cardType: string,
  types: string[],
  stage: string,
  hp: number,
  isHolo: boolean,
  isReverseHolo: boolean,
  isFirstEdition: boolean,
  isShadowless: boolean,
  isFullArt: boolean,
  isRainbow: boolean,
  artist: string,
  imageUrl: string,
  thumbnailUrl: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Set Document
```javascript
{
  name: string,
  code: string,
  releaseDate: timestamp,
  series: string,
  totalCards: number,
  logo: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Getting Started

1. **Set up Firebase** (if not already done):
   - Create Firebase project
   - Enable Firestore Database
   - Add config to `.env` or `src/config/firebase.js`

2. **Seed Initial Sets**:
   - Go to `/admin`
   - Click "Seed Firebase with Sets"
   - This adds 28 Pokemon sets and 3 Sports sets

3. **Add Pokemon Cards**:
   - Go to `/admin/pokemon`
   - Use "Add Single Card" form or "Bulk Upload"
   - Start adding your card collection!

4. **Manage Sets**:
   - Go to `/admin/sets`
   - Add new sets or edit existing ones

## Tips

- **Bulk Upload**: Use the bulk upload feature for adding many cards at once. Prepare your JSON array first.
- **Set Codes**: Use consistent set codes (e.g., "BS" for Base Set) for easier filtering
- **Images**: Add image URLs for better card display in the app
- **Validation**: All required fields are marked with * and validated before submission

## Future Enhancements

- CSV import/export
- Image upload to Firebase Storage
- Batch editing
- Search and filter cards
- Card preview with images

