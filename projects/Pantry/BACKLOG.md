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

### Party tricks — recipes you bring
A tagged category of recipes for things you bring to events: fruit trays,
veggie boards, buffalo dip, etc. These are still full recipes (ingredients
flow to the grocery list) but are flagged as "party tricks" and surfaced
specifically in the Going out flow.

When a slot is set to "Going out" with a label, a second optional step
appears: "Bringing anything?" — filtered to party trick recipes only.
The calendar cell shows both: "🎉 Ang's Birthday · Buffalo Dip".
Grocery list attributes the ingredients to the event name.

Implementation notes:
- Add a "type" field to recipes: 'dinner' (default) or 'party'
- Recipe form gets a toggle: "This is something I bring places"
- Party trick recipes are hidden from regular meal slot picker
- Going out flow gets a step 2 for bringing something (optional)

CSV / export-import impact (must handle before shipping):
- CSV gains a 4th column: name, sides, ingredients, type
- type value is either blank/"dinner" (regular) or "party"
- Export must write the type column for all recipes
- Import must read the type column and default to 'dinner' if blank or missing
  (ensures all existing CSV files from before this feature still import cleanly)
- Example row: "Buffalo Dip,,cream cheese; hot sauce; cheddar,party"
- Effort: Medium — touches recipe form, slot sheet, calendar display,
  grocery list attribution, and export/import

### Duplicate recipe warning
If the user adds a recipe with the same name as an existing one, show a
warning before saving.

### ~~Going out labels~~ ✅ shipped
~~Let users title a Going out slot (e.g. "Ang's Birthday", "Going to Jane's").~~

---

## 🏠 Bigger picture — "Ours" family suite

### Brand concept
A family planning suite called **Ours** — the name subtly doubles as *Hours*,
signalling both ownership ("our family's things") and time ("how you spend
your hours"). The wordplay doesn't need to be announced — a tagline like
*"How you spend your hours"* or a quiet clock element in the logo plants it.

Our Pantry becomes the first module in the suite. Others follow the same
naming pattern and share the same design system (earth tones, Kalam/Caveat
fonts, sketchy borders, warm paper background).

### The suite modules (vision)
- **Our Pantry** ✅ — meal planning (built)
- **Our Time** — family calendar, who's where, shared schedule
- **Our Goals** — savings targets, milestones, bucket list
- **Our Budget** — where the money goes each month
- **Our Health** — habits, appointments, wellness tracking

### The landing page ("Ours" dashboard)
The root `index.html` currently redirects to Pantry — this becomes the
suite landing page. A clean card grid, one card per module, same visual
language throughout. Tap a card to enter that app.

Each module lives in its own `projects/` folder in the same repo. One
design system (`wireframe-base.css`), one push to deploy everything to
GitHub Pages.

### Design note on the Hours wordplay
Keep it subtle. Options:
- The "O" in Ours has a faint clock-face texture
- Tagline under the logo: "How you spend your hours."
- The dot/period after each module name is styled as a small clock dot
The user should feel it before they notice it.

### Technical architecture
- Monorepo: all modules in `my_universe` repo under `projects/`
- Shared CSS: `wireframe-base.css` at repo root, referenced by all modules
- Each module is self-contained (its own index.html, store.js, app.jsx)
- Cloud sync (Firebase) added per-module as they mature
- Effort to build the dashboard shell: Small. Full suite: Long term.

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
