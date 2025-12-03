# Blog System Guide

## Overview

A complete blog system has been added to PokaPal with rich text editing, hero banner images, SEO optimization, and the ability to link blog posts to sets or Pokemon pages.

## Features

✅ **Rich Text Editor** - Using TipTap for content creation
✅ **Hero Banner Images** - Upload 1920x800px hero images (stored in Firebase Storage)
✅ **Set/Pokemon Linking** - Link blog posts to specific sets or Pokemon
✅ **SEO Optimization** - Meta tags, Open Graph, Twitter Cards
✅ **Admin Management** - Full CRUD operations for blog posts
✅ **Public Pages** - Beautiful blog listing and detail pages
✅ **View Tracking** - Automatic view count tracking

## Hero Banner Specifications

- **Recommended Size**: 1920x800px (16:6.67 aspect ratio)
- **Format**: JPG or WebP
- **Max File Size**: 5MB
- **Storage Location**: `blog-hero-images/` in Firebase Storage

## Routes

- `/blog` - Public blog listing page
- `/blog/:slug` - Individual blog post detail page
- `/admin/blog` - Admin blog management (requires authentication)

## Admin Features

### Creating a Blog Post

1. Navigate to `/admin/blog`
2. Click "+ New Post"
3. Fill in required fields:
   - **Title** - Auto-generates slug (can be customized)
   - **Slug** - URL-friendly identifier
   - **Hero Image** - Upload 1920x800px image
   - **Excerpt** - Short description (150-200 chars)
   - **Content** - Rich text editor
   - **Link to Set/Pokemon** - Optional
   - **SEO Fields** - Meta title, description, keywords
   - **Publish Options** - Published status, featured flag

### Editing a Blog Post

1. Click "Edit" on any post in the admin list
2. Make changes
3. Click "Update Post"

### Deleting a Blog Post

1. Click "Delete" on any post
2. Confirm deletion

## Database Schema

See `BLOG_SCHEMA.md` for complete schema documentation.

## SEO Features

### Blog Listing Page (`/blog`)
- Dynamic meta title and description
- Open Graph tags
- Twitter Card tags

### Blog Detail Page (`/blog/:slug`)
- Dynamic meta title (from post or custom metaTitle)
- Dynamic meta description (from excerpt or custom metaDescription)
- Open Graph image (hero banner)
- Article type meta tags
- Automatic view count tracking

## Rich Text Editor

The TipTap editor supports:
- **Bold** and *Italic* text
- Headings (H2, H3)
- Bullet and numbered lists
- Links
- Full HTML output

## Linking to Sets/Pokemon

When creating a blog post, you can link to:
- **Sets**: Select from dropdown of available English sets
- **Pokemon**: Enter national dex number

The linked content appears at the bottom of the blog post with a nice card design and a button to navigate to the set or Pokemon page.

## Public Blog Pages

### Blog Listing (`/blog`)
- Shows featured posts at the top (2 posts)
- Grid layout for all posts
- Post previews with hero images
- View counts and publish dates

### Blog Detail (`/blog/:slug`)
- Full-width hero banner
- Author and publish date
- Rich text content
- Linked set/Pokemon section (if applicable)
- Back to blog navigation

## Next Steps

1. **Add Navigation Links**: Add blog links to your main navigation
2. **Create Content**: Start writing blog posts!
3. **Customize Styling**: Adjust blog template styles if needed
4. **Add Categories/Tags**: Consider adding category/tag system if needed

## Files Created

- `src/utils/blogUtils.js` - Blog CRUD operations
- `src/utils/imageUpload.js` - Image upload utilities
- `src/components/RichTextEditor.vue` - TipTap rich text editor
- `src/views/AdminBlog.vue` - Admin blog management
- `src/views/BlogList.vue` - Public blog listing
- `src/views/BlogDetail.vue` - Blog post detail page
- `BLOG_SCHEMA.md` - Database schema documentation
- `BLOG_SYSTEM_GUIDE.md` - This guide

## Dependencies Added

- `@tiptap/vue-3` - Vue 3 integration
- `@tiptap/starter-kit` - Basic editor features
- `@tiptap/extension-image` - Image support
- `@tiptap/extension-link` - Link support

