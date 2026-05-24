# Pantry — Feature Backlog

Items are roughly ordered by value vs. effort. Add ideas freely — nothing here is a commitment.

---

## 🌟 High value

### Ingredient-based recipe suggestions
When a user is filling a slot, the picker should surface recipes that share
ingredients with recipes already planned that week. For example: if Tuesday
calls for green onions, and another recipe also uses green onions, flag it
with "uses what you'll already have." Helps reduce waste and simplifies the
grocery list by encouraging ingredient overlap across the week.

- Show overlap count on each recipe card in the picker ("shares 3 ingredients")
- Sort suggested recipes to the top of the list
- Could also show a small "good match" badge on the calendar slot

### Cloud sync via Firebase
Recipes and plans currently live in the browser only — clearing browser data
wipes everything. A free Firebase Realtime Database would sync across all
devices automatically. Access via a shared "household code" so no login needed.

### iOS Reminders / automation hook
The grocery list "Prepare list" button currently copies to clipboard. A future
version could trigger a shortcut or automation to push remaining items directly
into iOS Reminders as individual checklist items. Requires iOS Shortcuts
integration or a webhook.

---

## 🛠 Polish & fixes

### Persistent tab state
App always opens on Plan tab. Should remember the last viewed tab across
page reloads.

### Recipe search / filter
As the recipe library grows, a search box on the recipe picker and recipe
list becomes important. Simple name filter would cover most cases.

### Eat out / Ad hoc notes
Let users add a short note to eat out or ad hoc slots (e.g. "Pizza night"
or "Bryan's birthday dinner") so the calendar is more readable.

### Duplicate recipe warning
If the user adds a recipe with the same name as an existing one, show a
warning before saving.

---

## 🔮 Longer term

### Multi-device without cloud (QR / share link)
Generate a shareable link or QR code that encodes the current recipe
library so it can be loaded on another device without a database.

### Meal history
Track which recipes were used in past plans so you can see what you've
been cooking and avoid repeating the same week.

### Serving size / quantity on ingredients
Optional per-ingredient quantities for users who want a more precise
grocery list (e.g. "2 lbs chicken breast" instead of just "chicken breast").

### Pantry tab (originally scoped out)
A simple in-stock tracker. Mark items as "in pantry" so the grocery list
can automatically exclude them without manual checking each time.
