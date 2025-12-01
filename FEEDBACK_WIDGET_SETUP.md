# Feedback Widget Setup Guide

The feedback widget is now installed and will appear in the bottom right corner of your site! 🎉

## Current Setup

The widget currently uses a **mailto fallback** - when users submit feedback, it opens their email client with a pre-filled message to `teampokapak@gmail.com`.

## Optional: Set Up EmailJS (Recommended)

For a better user experience (no email client popup), you can set up EmailJS (free):

### Step 1: Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account (200 emails/month free)
3. Verify your email address

### Step 2: Create Email Service

1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose **Gmail** (or your email provider)
4. Connect your Gmail account (`teampokapak@gmail.com`)
5. Note your **Service ID** (e.g., `service_xxxxx`)

### Step 3: Create Email Template

1. Go to **Email Templates**
2. Click **Create New Template**
3. Use this template:

```
Subject: Pokapal Feedback - {{from_name}}

From: {{from_email}}
Name: {{from_name}}

Message:
{{message}}

---
This feedback was sent from Pokapal.com
```

4. Set **To Email** to: `teampokapak@gmail.com`
5. Note your **Template ID** (e.g., `template_xxxxx`)

### Step 4: Get Public Key

1. Go to **Account** → **General**
2. Copy your **Public Key** (e.g., `xxxxxxxxxxxxx`)

### Step 5: Add Environment Variables

Create a `.env` file in your project root (or add to existing one):

```env
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

### Step 6: Restart Dev Server

```bash
npm run dev
```

That's it! The widget will now send emails directly without opening the user's email client.

## Features

- ✨ Cute pokagirl SVG character
- 💬 Chat-like interface
- 📱 Mobile responsive
- 🎨 Smooth animations
- ✅ Success/error messages
- 🔄 Auto-closes after successful submission

## Customization

You can customize the widget in `src/components/FeedbackWidget.vue`:
- Colors (currently purple gradient)
- Position (currently bottom-right)
- Size
- Animations

## Testing

1. Click the pokagirl button in the bottom right
2. Fill out the form
3. Submit and verify you receive the email!

