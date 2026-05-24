// store.js — localStorage helpers + pure utility functions, no React dependency

const RECIPES_KEY = 'pm_recipes';
const PLAN_KEY = 'pm_plan';

function getRecipes() {
  try { return JSON.parse(localStorage.getItem(RECIPES_KEY)) || []; }
  catch { return []; }
}

function saveRecipes(recipes) {
  localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
}

function getPlan() {
  try { return JSON.parse(localStorage.getItem(PLAN_KEY)) || null; }
  catch { return null; }
}

function savePlan(plan) {
  localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
}

function clearPlan() {
  localStorage.removeItem(PLAN_KEY);
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function buildSlots(startDate, endDate) {
  const slots = [];
  const cur = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  while (cur <= end) {
    const date = cur.toISOString().slice(0, 10);
    for (const meal_type of ['breakfast', 'lunch', 'dinner']) {
      slots.push({ id: generateId(), date, meal_type, status: 'empty', recipe_id: null });
    }
    cur.setDate(cur.getDate() + 1);
  }
  return slots;
}

// Returns [{name, usedIn: string[]}] sorted alphabetically, deduplicated case-insensitively.
function generateGroceryList(plan, recipes) {
  if (!plan) return [];
  const recipeMap = Object.fromEntries(recipes.map(r => [r.id, r]));
  const seen = new Map(); // normalised key -> { name: display string, usedIn: Set }
  for (const slot of plan.slots) {
    if (slot.status !== 'recipe' || !slot.recipe_id) continue;
    const recipe = recipeMap[slot.recipe_id];
    if (!recipe) continue;
    for (const ing of (recipe.ingredients || [])) {
      const key = ing.trim().toLowerCase();
      if (!key) continue;
      if (!seen.has(key)) seen.set(key, { name: ing.trim(), usedIn: new Set() });
      seen.get(key).usedIn.add(recipe.main_dish_name);
    }
  }
  return [...seen.values()]
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
    .map(v => ({ name: v.name, usedIn: [...v.usedIn] }));
}

function formatDate(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function daysBetween(startDate, endDate) {
  const s = new Date(startDate + 'T00:00:00');
  const e = new Date(endDate + 'T00:00:00');
  return Math.round((e - s) / 86400000) + 1;
}
