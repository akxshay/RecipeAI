import RecipeCard from './RecipeCard';

export default function Sidebar({ results, favorites, recipeCache, onToggleFav, onRecipeClick, onDragStart, searchError, isSearching }) {
  
  return (
    <div className="sidebar">
      <div className="panel-title">Results</div>
      <div className="card-box">
        <div className="card-scroll" id="resultsScroll">
          {isSearching && <div className="loading-msg">Searching the pantry…</div>}
          {searchError && <div className="error-msg">{searchError}</div>}
          
          {!isSearching && !searchError && results.length === 0 && (
            <div className="empty-note">Search a dish, an ingredient, or a cuisine to fill the box.</div>
          )}
          
          {!isSearching && !searchError && results.map(meal => (
            <RecipeCard 
              key={meal.id} 
              meal={meal} 
              isFav={favorites.includes(meal.id)}
              onToggleFav={onToggleFav}
              onClick={onRecipeClick}
              onDragStart={onDragStart}
            />
          ))}
        </div>
      </div>

      <div style={{ height: '22px' }}></div>
      <div className="panel-title">Favorites</div>
      <div className="card-box">
        <div className="card-scroll" id="favScroll">
          {favorites.length === 0 ? (
            <div className="empty-note">Nothing saved yet — tap the heart on a card.</div>
          ) : (
            favorites.map(id => {
              const meal = recipeCache[id];
              if (!meal) return null;
              return (
                <RecipeCard 
                  key={meal.id} 
                  meal={meal} 
                  isFav={true}
                  onToggleFav={onToggleFav}
                  onClick={onRecipeClick}
                  hasTape={true}
                  onDragStart={onDragStart}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
