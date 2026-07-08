import { useState, useEffect } from 'react';

export function useLarderStorage(userId) {
  const [favorites, setFavorites] = useState([]);
  const [mealPlan, setMealPlan] = useState({});
  const [recipeCache, setRecipeCache] = useState({});
  const [loading, setLoading] = useState(true);

  // Keys are namespaced per user so data never leaks between accounts
  const KEYS = userId ? {
    favorites: `larder:${userId}:favorites`,
    plan:      `larder:${userId}:plan`,
    cache:     `larder:${userId}:cache`,
  } : null;

  // Helper: use window.storage if available (app host), else localStorage
  const storageGet = async (key) => {
    if (typeof window !== 'undefined' && window.storage && typeof window.storage.get === 'function') {
      const r = await window.storage.get(key, false);
      return r ? r.value : null;
    }
    return localStorage.getItem(key);
  };

  const storageSet = async (key, value) => {
    if (typeof window !== 'undefined' && window.storage && typeof window.storage.set === 'function') {
      await window.storage.set(key, value, false);
    } else {
      localStorage.setItem(key, value);
    }
  };

  // Reload user data whenever the logged-in user changes
  useEffect(() => {
    if (!userId || !KEYS) {
      setFavorites([]);
      setMealPlan({});
      setRecipeCache({});
      setLoading(false);
      return;
    }

    setLoading(true);

    async function loadState() {
      try {
        const f = await storageGet(KEYS.favorites);
        setFavorites(f ? JSON.parse(f) : []);
      } catch { setFavorites([]); }

      try {
        const p = await storageGet(KEYS.plan);
        setMealPlan(p ? JSON.parse(p) : {});
      } catch { setMealPlan({}); }

      try {
        const rc = await storageGet(KEYS.cache);
        setRecipeCache(rc ? JSON.parse(rc) : {});
      } catch { setRecipeCache({}); }

      setLoading(false);
    }

    loadState();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const saveFavorites = async (newFavorites) => {
    setFavorites(newFavorites);
    if (KEYS) {
      try { await storageSet(KEYS.favorites, JSON.stringify(newFavorites)); } catch {}
    }
  };

  const savePlan = async (newPlan) => {
    setMealPlan(newPlan);
    if (KEYS) {
      try { await storageSet(KEYS.plan, JSON.stringify(newPlan)); } catch {}
    }
  };

  const saveCache = async (newCache) => {
    setRecipeCache(newCache);
    if (KEYS) {
      try { await storageSet(KEYS.cache, JSON.stringify(newCache)); } catch {}
    }
  };

  const toggleFavorite = (meal) => {
    const newCache = { ...recipeCache, [meal.id]: meal };
    saveCache(newCache);

    const isFav = favorites.includes(meal.id);
    const newFavorites = isFav
      ? favorites.filter(id => id !== meal.id)
      : [...favorites, meal.id];
    saveFavorites(newFavorites);
  };

  return {
    favorites,
    mealPlan,
    recipeCache,
    loading,
    savePlan,
    toggleFavorite,
    saveCache,
  };
}

