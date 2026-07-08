import { HeartFilled, HeartOutline } from './Icons';

export default function RecipeCard({ meal, isFav, onToggleFav, onClick, hasTape, onDragStart }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', meal.id);
    if (onDragStart) {
      onDragStart(meal.id);
    }
  };

  return (
    <div 
      className="recipe-card" 
      draggable 
      onDragStart={handleDragStart}
      onClick={() => onClick(meal.id)}
    >
      {hasTape && <div className="tape" />}
      <img src={meal.thumb} alt={meal.name} />
      <div className="info">
        <h4>{meal.name}</h4>
        <div className="meta">
          {meal.area || ''}{(meal.area && meal.category) ? ' · ' : ''}{meal.category || ''}
        </div>
      </div>
      <div className="actions">
        <button 
          className={`icon-btn fav-btn ${isFav ? 'faved' : ''}`} 
          title="Save to favorites"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav(meal);
          }}
        >
          {isFav ? <HeartFilled /> : <HeartOutline />}
        </button>
      </div>
    </div>
  );
}
