import { useState, useEffect } from 'react';
import { lookupMeal } from '../api/themealdb';

export default function RecipeModal({ mealId, recipeCache, onClose }) {
  const [fullRecipe, setFullRecipe] = useState(null);
  const [error, setError] = useState(false);

  const summary = recipeCache[mealId];

  useEffect(() => {
    if (!mealId) return;
    setFullRecipe(null);
    setError(false);
    lookupMeal(mealId)
      .then(full => {
        if (full) setFullRecipe(full);
        else setError(true);
      })
      .catch(() => setError(true));
  }, [mealId]);

  if (!mealId) return null;

  // Use cached summary OR fall back to lookupMeal result for display name/thumb
  const display = summary || fullRecipe;

  const handleOverlayClick = (e) => {
    if (e.target.className === 'overlay') onClose();
  };

  return (
    <div className="overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <button className="close-btn" onClick={onClose}>×</button>
        {display ? (
          <>
            <img src={display.thumb} alt={display.name} />
            <h2>{display.name}</h2>
            <div className="modal-meta">
              {display.area || ''} {display.category ? `· ${display.category}` : ''}
            </div>
          </>
        ) : (
          <div className="loading-msg" style={{ padding: '2rem' }}>Loading recipe…</div>
        )}

        {!fullRecipe && !error && display && (
          <div className="loading-msg">Loading ingredients…</div>
        )}

        {error && (
          <div className="error-msg">Could not load the full recipe.</div>
        )}

        {fullRecipe && (
          <>
            <h4>Ingredients</h4>
            <ul className="ing">
              {fullRecipe.ings.map((i, idx) => (
                <li key={idx}>{i.measure ? `${i.measure} — ` : ''}{i.ingredient}</li>
              ))}
            </ul>
            <h4>Instructions</h4>
            <p className="instr">{fullRecipe.instructions || 'No instructions listed.'}</p>
          </>
        )}
      </div>
    </div>
  );
}
