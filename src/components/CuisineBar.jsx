import { useState, useEffect, useRef } from 'react';
import { getAreas } from '../api/themealdb';

// Emoji flag map for known cuisines
const FLAG = {
  American:   '🇺🇸',
  British:    '🇬🇧',
  Canadian:   '🇨🇦',
  Chinese:    '🇨🇳',
  Croatian:   '🇭🇷',
  Dutch:      '🇳🇱',
  Egyptian:   '🇪🇬',
  Filipino:   '🇵🇭',
  French:     '🇫🇷',
  Greek:      '🇬🇷',
  Indian:     '🇮🇳',
  Irish:      '🇮🇪',
  Italian:    '🇮🇹',
  Jamaican:   '🇯🇲',
  Japanese:   '🇯🇵',
  Kenyan:     '🇰🇪',
  Malaysian:  '🇲🇾',
  Mexican:    '🇲🇽',
  Moroccan:   '🇲🇦',
  Polish:     '🇵🇱',
  Portuguese: '🇵🇹',
  Russian:    '🇷🇺',
  Spanish:    '🇪🇸',
  Thai:       '🇹🇭',
  Tunisian:   '🇹🇳',
  Turkish:    '🇹🇷',
  Ukrainian:  '🇺🇦',
  Vietnamese: '🇻🇳',
};

export default function CuisineBar({ activeArea, onAreaSelect }) {
  const [areas, setAreas] = useState([]);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    getAreas().then(setAreas);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredAreas = areas.filter(area => 
    area.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="cuisine-search-wrap" ref={wrapperRef}>
      <div className="cuisine-search-container">
        {activeArea && (
           <div className="cuisine-active-badge">
             <span className="cuisine-flag">{FLAG[activeArea] || '🌍'}</span>
             <span className="cuisine-name">{activeArea}</span>
             <button className="cuisine-clear" onClick={() => {
                onAreaSelect(null);
                setQuery('');
             }} title="Clear country filter">×</button>
           </div>
        )}
        
        <input
          type="text"
          className="cuisine-search-input"
          placeholder={activeArea ? "Search another country..." : "Search by country (e.g., Italian, Mexican)..."}
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <div className="cuisine-search-icon">🌍</div>
      </div>
      
      {isOpen && (
        <div className="cuisine-dropdown">
          {filteredAreas.length > 0 ? (
            filteredAreas.map(area => (
              <button
                key={area}
                className={`cuisine-dropdown-item ${activeArea === area ? 'selected' : ''}`}
                onClick={() => {
                  onAreaSelect(area);
                  setQuery('');
                  setIsOpen(false);
                }}
              >
                <span className="cuisine-flag">{FLAG[area] || '🌍'}</span>
                <span className="cuisine-name">{area}</span>
              </button>
            ))
          ) : (
            <div className="cuisine-dropdown-empty">No countries found matching "{query}"</div>
          )}
        </div>
      )}
    </div>
  );
}
