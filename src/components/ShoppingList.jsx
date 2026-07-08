import { useState } from 'react';
import { lookupMeal } from '../api/themealdb';

export default function ShoppingList({ mealPlan }) {
  const [status, setStatus] = useState('');
  const [receipt, setReceipt] = useState(null);

  const handleGenerate = async () => {
    const ids = Array.from(new Set(Object.values(mealPlan)));
    if (ids.length === 0) {
      setStatus('Pin a few meals to the week first.');
      setReceipt(null);
      return;
    }

    setStatus('Pulling ingredients…');
    try {
      const details = await Promise.all(ids.map(id => lookupMeal(id)));
      const agg = {};
      
      details.forEach(d => {
        if (!d) return;
        d.ings.forEach(({ ingredient, measure }) => {
          const key = ingredient.toLowerCase();
          if (!agg[key]) agg[key] = { name: ingredient, measures: [] };
          if (measure) agg[key].measures.push(measure);
        });
      });

      const items = Object.values(agg).sort((a, b) => a.name.localeCompare(b.name));
      setStatus(`${items.length} items from ${ids.length} meals`);
      
      setReceipt({
        mealCount: ids.length,
        items
      });
    } catch (err) {
      setStatus('Could not pull ingredients — try again.');
    }
  };

  return (
    <>
      <div className="shopping-toggle">
        <button onClick={handleGenerate}>Generate shopping list</button>
        <span>{status}</span>
      </div>
      
      {receipt && (
        <div id="receiptWrap">
          <div className="receipt">
            <h3>Shopping List</h3>
            <div className="sub">
              {receipt.mealCount} meal{receipt.mealCount === 1 ? '' : 's'} this week
            </div>
            <ul>
              {receipt.items.map((it, i) => (
                <li key={i}>
                  <span className="name">{it.name}</span>
                  <span className="amt">{it.measures.join(' + ') || '—'}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
