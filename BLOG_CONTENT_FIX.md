# Blog Content Database Fix

The content in your database is double-encoded. Here's what it should be:

## Current (Wrong) Format:
The content has HTML entities encoded (`&lt;` instead of `<`) and is wrapped in extra `<p>` tags.

## Correct Format:
Replace the `content` field in your Firestore document with this:

```html
<p>Welcome to PokaPal! We built this app for collectors like us—people who aren't satisfied with just a few chase cards. We want it all. Every card, every variant, every piece of art in a set. That's the master set dream, and now you have a tool designed specifically to help you achieve it.</p>

<h2>What Is a Pokemon Master Set?</h2>

<p>A master set goes beyond the standard set list. It includes every card number, every reverse holo, every secret rare, illustration rare, and special art rare in an expansion. When you complete a master set, you own the complete artistic vision of that release—nothing missing, nothing left to chase. It's the collector's equivalent of 100% completion, and it's incredibly satisfying.</p>

<h2>Turn Collecting Into a Friendly Competition</h2>

<p>Here's where things get fun. Grab a few friends and each pick a different set to master. Maybe you tackle Obsidian Flames while your buddy goes after 151 and someone else chases Paldea Evolved. Track your progress in PokaPal, share updates, and race to see who completes their master set first. The friendly trash talk alone is worth it.</p>

<h3>Tips for Your Master Set Race</h3>

<ul>
<li><strong>Set a timeline.</strong> Give yourselves three or six months. Deadlines create urgency and keep everyone engaged.</li>
<li><strong>Trade within the group.</strong> Pull a card someone else needs? Make a deal. It speeds everyone up and strengthens the competition.</li>
<li><strong>Celebrate milestones.</strong> First one to 50%? First secret rare pulled? Mark those moments.</li>
<li><strong>Use PokaPal to stay honest.</strong> Log every card as you get it. No disputes about who's actually ahead.</li>
</ul>

<p>Whether you're a seasoned collector or just getting started, master set collecting with friends transforms a solo hobby into a shared adventure. Welcome to PokaPal—let's complete some sets.</p>
```

## How to Fix:

1. Go to Firebase Console > Firestore Database
2. Find your blog post document in the `blogs` collection
3. Edit the `content` field
4. Replace the entire value with the HTML above (copy exactly as shown)
5. Save

The content should be stored as **raw HTML**, not encoded HTML entities.

