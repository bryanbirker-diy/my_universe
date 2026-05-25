// store.js — Our Exploring
const EXPLORING_KEY = 'ex_trips';

function loadTrips() {
  try { return JSON.parse(localStorage.getItem(EXPLORING_KEY) || '[]'); }
  catch { return []; }
}
function saveTrips(trips) {
  localStorage.setItem(EXPLORING_KEY, JSON.stringify(trips));
}
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
