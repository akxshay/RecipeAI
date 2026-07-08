import { useState } from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner'];

export default function PlannerBoard({ mealPlan, recipeCache, onPlanChange, onRecipeClick, draggedId }) {
  const [dragOverSlot, setDragOverSlot] = useState(null);

  const handleDrop = (e, key) => {
    e.preventDefault();
    setDragOverSlot(null);
    const id = e.dataTransfer.getData('text/plain') || draggedId;
    if (!id || !recipeCache[id]) return;
    
    const newPlan = { ...mealPlan, [key]: id };
    onPlanChange(newPlan);
  };

  const handleRemove = (e, key) => {
    e.stopPropagation();
    const newPlan = { ...mealPlan };
    delete newPlan[key];
    onPlanChange(newPlan);
  };

  return (
    <div className="corkboard">
      <div className="board-grid">
        <div className="corner"></div>
        {DAYS.map(d => (
          <div key={d} className="day-label">{d}</div>
        ))}
        
        {MEALS.map(meal => (
          <div key={meal} style={{ display: 'contents' }}>
            <div className="meal-label">{meal}</div>
            {DAYS.map(day => {
              const key = `${day}-${meal}`;
              const filledId = mealPlan[key];
              const mealData = filledId ? recipeCache[filledId] : null;
              
              const isDragOver = dragOverSlot === key;
              
              return (
                <div 
                  key={key} 
                  className={`slot ${isDragOver ? 'drag-over' : ''} ${mealData ? 'filled' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOverSlot(key); }}
                  onDragLeave={() => setDragOverSlot(null)}
                  onDrop={(e) => handleDrop(e, key)}
                >
                  {mealData ? (
                    <div className="pin-card" onClick={() => onRecipeClick(mealData.id)}>
                      <div className="pin-dot"></div>
                      <button className="rm" title="Remove" onClick={(e) => handleRemove(e, key)}>×</button>
                      <h5>{mealData.name}</h5>
                    </div>
                  ) : (
                    <div className="slot-placeholder">drop here</div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
