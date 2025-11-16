# Pokapal

A modern collection companion for trading cards and collectibles.

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **Vite** - Next generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework
- **Vue Router** - Client-side routing
- **Firebase** - Backend and authentication (configured, ready to connect)

## Design System

This project uses a comprehensive global design system with:

### Typography (h1 - h6)
All headings follow a consistent hierarchy with proper sizing and spacing:
- `h1` - Main titles (2.25rem, bold)
- `h2` - Section titles (1.875rem, semibold)
- `h3` - Card titles (1.5rem, semibold)
- `h4` - Subsections (1.25rem, medium)
- `h5` - Small headings (1.125rem, medium)
- `h6` - Smallest headings (1rem, medium)

### Buttons (btn-h1 through btn-h6)
Button sizes match the heading hierarchy:
- `.btn-h1` - Largest buttons
- `.btn-h2` - Large buttons
- `.btn-h3` - Medium buttons (default)
- `.btn-h4` - Small buttons
- `.btn-h5` - Smaller buttons
- `.btn-h6` - Smallest buttons

Button variants:
- `.btn-primary` - Primary action (dark gray)
- `.btn-secondary` - Secondary action (light gray)
- `.btn-outline` - Outlined style
- `.btn-ghost` - Minimal style

### Cards
- `.card` - Base card component
- `.card-header` - Card header section
- `.card-body` - Card content section
- `.card-footer` - Card footer section
- `.card-title` - Card title styling
- `.card-subtitle` - Card subtitle styling
- `.card-content` - Card content styling

Card variants:
- `.card-elevated` - Elevated shadow
- `.card-bordered` - Stronger border
- `.card-flat` - No shadow or border

### Sections
- `.section` - Base section wrapper
- `.section-container` - Container with max-width and padding
- `.section-header` - Section header area
- `.section-title` - Section title
- `.section-subtitle` - Section subtitle
- `.section-content` - Section content wrapper

Spacing variants:
- `.section-spacing-sm` - Small spacing (py-8)
- `.section-spacing-md` - Medium spacing (py-12)
- `.section-spacing-lg` - Large spacing (py-16)
- `.section-spacing-xl` - Extra large spacing (py-24)

## Getting Started

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Project Structure

```
src/
├── assets/          # Static assets
├── components/      # Reusable Vue components
│   └── Navigation.vue
├── config/          # Configuration files
│   └── firebase.js  # Firebase configuration
├── views/           # Page components
│   ├── Home.vue           # Landing page
│   ├── Picker.vue         # Random set picker
│   ├── Checklist.vue      # Personal checklist
│   ├── Groups.vue         # Group management
│   └── GroupDashboard.vue # Group progress dashboard
├── router/          # Vue Router configuration
│   └── index.js
├── App.vue          # Root component
├── main.js          # Application entry point
└── style.css        # Global styles and design system
```

## Design Principles

- **Consistency**: Always use the global design system classes
- **Clean & Modern**: Vintage gray aesthetic with clean lines
- **Dashboard Feel**: Clean, organized, dashboard-like interface
- **Responsive**: Mobile-first approach with Tailwind breakpoints

## Usage Examples

### Typography
```vue
<h1>Main Title</h1>
<h2>Section Title</h2>
<h3>Card Title</h3>
```

### Buttons
```vue
<button class="btn btn-h3 btn-primary">Primary Button</button>
<button class="btn btn-h3 btn-secondary">Secondary Button</button>
```

### Cards
```vue
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
  </div>
  <div class="card-body">
    <p class="card-content">Card content goes here</p>
  </div>
</div>
```

### Sections
```vue
<section class="section section-spacing-md">
  <div class="section-container">
    <div class="section-header">
      <h2 class="section-title">Section Title</h2>
    </div>
    <div class="section-content">
      <!-- Content here -->
    </div>
  </div>
</section>
```

## MVP Features (Implemented)

✅ **Random Set Picker** - Pick a random set/series with pack simulator feel
✅ **Personal Checklist** - Track your collection with real-time completion tracking
✅ **Group Creation** - Create groups with invite codes
✅ **Group Joining** - Join groups using invite codes
✅ **Group Progress Dashboard** - See everyone's completion percentage

## Current Status

The MVP is functional using localStorage for data persistence. All core features are working:
- Random set picker with animation
- Personal checklist with progress tracking
- Group creation and joining
- Group dashboard with member progress

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Firestore Database
3. Enable Authentication (Email/Password recommended)
4. Copy your Firebase config to `src/config/firebase.js` or use environment variables

Create a `.env` file in the root directory:
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

## Next Steps

- [ ] Connect Firebase for real-time data sync
- [ ] Add authentication flow
- [ ] Implement card/item reveal animations
- [ ] Add celebration animations for completions
- [ ] Create activity feed
- [ ] Add duplicate tracking
- [ ] Implement dark mode toggle
- [ ] Add export/share functionality
