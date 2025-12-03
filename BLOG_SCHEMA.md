# Blog Post Schema

## Firestore Collection: `blogPosts`

### Document Structure

```javascript
{
  // Required fields
  title: string,                    // Blog post title
  slug: string,                     // URL-friendly slug (e.g., "complete-guide-to-base-set")
  heroImage: string,                // URL to hero banner image (1920x800px recommended)
  content: string,                  // Rich text HTML content from TipTap
  excerpt: string,                  // Short description for listing pages (150-200 chars)
  
  // Linking fields (optional)
  linkedSetId: string | null,       // Firestore document ID of linked set
  linkedSetName: string | null,    // Set name for display
  linkedPokemonId: string | null,   // National dex number or Firestore ID of linked Pokemon
  linkedPokemonName: string | null, // Pokemon name for display
  
  // Metadata
  published: boolean,               // Whether post is published
  publishedAt: Timestamp | null,   // When post was published
  createdAt: Timestamp,            // When post was created
  updatedAt: Timestamp,            // When post was last updated
  author: {
    userId: string,                 // User ID of author
    displayName: string,            // Author display name
    email: string                   // Author email
  },
  
  // SEO fields
  metaTitle: string | null,        // Custom SEO title (defaults to title)
  metaDescription: string | null,   // SEO description (defaults to excerpt)
  keywords: string[],               // SEO keywords array
  
  // Analytics
  views: number,                    // View count (default: 0)
  featured: boolean                 // Whether to feature on homepage (default: false)
}
```

## Hero Banner Image Specifications

- **Recommended Size**: 1920x800px (16:6.67 aspect ratio)
- **Format**: JPG or WebP
- **Max File Size**: 500KB (optimized)
- **Storage**: Firebase Storage in `blog-hero-images/` folder

## Slug Generation

Slugs should be:
- Lowercase
- Hyphenated (e.g., "complete-guide-to-base-set")
- Unique (check before creating)
- Based on title but can be customized

## Example Document

```javascript
{
  title: "Complete Guide to Base Set",
  slug: "complete-guide-to-base-set",
  heroImage: "https://firebasestorage.googleapis.com/.../base-set-hero.jpg",
  content: "<p>Rich HTML content here...</p>",
  excerpt: "Discover everything you need to know about the iconic Base Set...",
  linkedSetId: "set-id-123",
  linkedSetName: "Base Set",
  linkedPokemonId: null,
  linkedPokemonName: null,
  published: true,
  publishedAt: Timestamp(2024, 1, 15),
  createdAt: Timestamp(2024, 1, 10),
  updatedAt: Timestamp(2024, 1, 15),
  author: {
    userId: "user-123",
    displayName: "John Doe",
    email: "john@example.com"
  },
  metaTitle: "Complete Guide to Base Set | PokaPal",
  metaDescription: "Everything you need to know about the iconic Base Set...",
  keywords: ["base set", "pokemon", "tcg", "collecting"],
  views: 0,
  featured: true
}
```

