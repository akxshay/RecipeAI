const BASE = 'https://www.themealdb.com/api/json/v1/1';

// ─── Internal helpers ────────────────────────────────────────────────────────

async function searchByName(q) {
  try {
    const res = await fetch(`${BASE}/search.php?s=${encodeURIComponent(q)}`);
    const data = await res.json();
    return (data.meals || []).map(m => ({
      id: m.idMeal, name: m.strMeal, thumb: m.strMealThumb,
      category: m.strCategory, area: m.strArea,
    }));
  } catch { return []; }
}

async function searchByIngredient(q) {
  try {
    const res = await fetch(`${BASE}/filter.php?i=${encodeURIComponent(q)}`);
    const data = await res.json();
    return (data.meals || []).map(m => ({
      id: m.idMeal, name: m.strMeal, thumb: m.strMealThumb,
      category: '', area: '',
    }));
  } catch { return []; }
}

async function searchByCategory(q) {
  try {
    const res = await fetch(`${BASE}/filter.php?c=${encodeURIComponent(q)}`);
    const data = await res.json();
    return (data.meals || []).map(m => ({
      id: m.idMeal, name: m.strMeal, thumb: m.strMealThumb,
      category: q, area: '',
    }));
  } catch { return []; }
}

async function searchByArea(q) {
  try {
    const res = await fetch(`${BASE}/filter.php?a=${encodeURIComponent(q)}`);
    const data = await res.json();
    return (data.meals || []).map(m => ({
      id: m.idMeal, name: m.strMeal, thumb: m.strMealThumb,
      category: '', area: q, // area is best guess here
    }));
  } catch { return []; }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function searchMeals(q, limit = 500) {
  const [byName, byIngredient, byCategory, byArea] = await Promise.all([
    searchByName(q),
    searchByIngredient(q),
    searchByCategory(q),
    searchByArea(q),
  ]);

  const seen = new Map();
  for (const meal of byName) seen.set(meal.id, meal);
  for (const meal of [...byIngredient, ...byCategory, ...byArea]) {
    if (!seen.has(meal.id)) seen.set(meal.id, meal);
  }
  return Array.from(seen.values()).slice(0, limit);
}

let areasCache = null;
let areaToCountryMap = {}; // Maps "Indian" -> "India", etc.

export async function getAreas() {
  if (areasCache) return areasCache;
  try {
    const res = await fetch(`${BASE}/list.php?a=list`);
    const data = await res.json();
    
    // Some endpoints need strCountry, some need strArea. We store the mapping.
    (data.meals || []).forEach(m => {
      if (m.strArea) {
        areaToCountryMap[m.strArea] = m.strCountry || m.strArea;
      }
    });

    areasCache = Object.keys(areaToCountryMap).sort();
    return areasCache;
  } catch { return []; }
}

export async function searchMealsByArea(area, limit = 500) {
  // If we haven't loaded the mapping yet, fetch it.
  if (!areasCache) await getAreas();
  
  // The API is wildly inconsistent. Sometimes it wants "Indian", sometimes "India".
  // Sometimes it wants "American", sometimes "USA". 
  // We fire both the area name and the mapped country name and merge them.
  const countryParam = areaToCountryMap[area] || area;
  
  const [areaMeals, countryMeals] = await Promise.all([
    searchByArea(area),
    area !== countryParam ? searchByArea(countryParam) : Promise.resolve([])
  ]);

  const seen = new Map();
  for (const meal of [...areaMeals, ...countryMeals]) {
    seen.set(meal.id, meal);
  }

  return Array.from(seen.values())
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, limit);
}

// ─── Lookup ───────────────────────────────────────────────────────────────────

const lookupCache = {};

export async function lookupMeal(id) {
  if (lookupCache[id]) return lookupCache[id];
  const res = await fetch(`${BASE}/lookup.php?i=${encodeURIComponent(id)}`);
  const data = await res.json();
  const meal = data.meals && data.meals[0];
  if (!meal) return null;

  const ings = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal['strIngredient' + i];
    const meas = meal['strMeasure' + i];
    if (ing && ing.trim()) ings.push({ ingredient: ing.trim(), measure: (meas || '').trim() });
  }

  const full = {
    ings,
    instructions: meal.strInstructions,
    thumb: meal.strMealThumb,
    name: meal.strMeal,
    area: meal.strArea,
    category: meal.strCategory,
  };
  lookupCache[id] = full;
  return full;
}



