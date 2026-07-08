import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PlannerBoard from './components/PlannerBoard';
import ShoppingList from './components/ShoppingList';
import RecipeModal from './components/RecipeModal';
import AuthPage from './components/AuthPage';
import { useLarderStorage } from './hooks/useLarderStorage';
import { useAuth } from './context/AuthContext';
import { searchMeals, searchMealsByArea } from './api/themealdb';

function App() {
  const { user, authLoading } = useAuth();

  const {
    favorites,
    mealPlan,
    recipeCache,
    loading,
    savePlan,
    toggleFavorite,
    saveCache
  } = useLarderStorage(user?.userId);

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [activeArea, setActiveArea] = useState(null);

  const [activeModalId, setActiveModalId] = useState(null);
  const [draggedId, setDraggedId] = useState(null);

  // Still booting — don't flash anything
  if (authLoading) return null;

  // No user logged in — show auth screen
  if (!user) return <AuthPage />;

  const runSearch = async (fetchFn, errorMsg) => {
    setIsSearching(true);
    setSearchError('');
    try {
      const meals = await fetchFn();
      if (meals.length === 0) {
        setSearchResults([]);
      } else {
        const newCache = { ...recipeCache };
        meals.forEach(m => { newCache[m.id] = m; });
        saveCache(newCache);
        setSearchResults(meals);
      }
    } catch {
      setSearchError(errorMsg);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (query) => {
    setActiveArea(null); // clear country filter when doing text search
    runSearch(
      () => searchMeals(query),
      'Could not reach the recipe index. Check your connection and try again.'
    );
  };

  const handleAreaSelect = (area) => {
    if (!area) {
      setActiveArea(null);
      setSearchResults([]);
      return;
    }
    setActiveArea(area);
    runSearch(
      () => searchMealsByArea(area),
      `Could not load ${area} cuisine. Try again.`
    );
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-msg">Loading your larder…</div>
      </div>
    );
  }

  return (
    <>
      <Header onSearch={handleSearch} activeArea={activeArea} onAreaSelect={handleAreaSelect} />

      <div className="layout">
        <Sidebar
          results={searchResults}
          favorites={favorites}
          recipeCache={recipeCache}
          onToggleFav={toggleFavorite}
          onRecipeClick={setActiveModalId}
          onDragStart={setDraggedId}
          isSearching={isSearching}
          searchError={searchError}
        />

        <div className="main">
          <div className="panel-title">This week</div>
          <PlannerBoard
            mealPlan={mealPlan}
            recipeCache={recipeCache}
            onPlanChange={savePlan}
            onRecipeClick={setActiveModalId}
            draggedId={draggedId}
          />

          <ShoppingList mealPlan={mealPlan} />
        </div>
      </div>

      <footer>
        drag a card onto a slot · click a card to see the full recipe · data persists to your Larder storage
      </footer>

      {activeModalId && (
        <RecipeModal
          mealId={activeModalId}
          recipeCache={recipeCache}
          onClose={() => setActiveModalId(null)}
        />
      )}
    </>
  );
}

export default App;
