import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CuisineBar from './CuisineBar';

export default function Header({ onSearch, activeArea, onAreaSelect }) {
  const [query, setQuery] = useState('');
  const { user, logout } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <header>
      <div className="brand">
        <h1>Lar<span>der</span>.</h1>
        <p>find a recipe · pin it to the week · pull the list</p>
      </div>
      <div className="header-right">
        <form className="search-wrap" onSubmit={handleSubmit}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="chicken, pasta, tofu…"
            autoComplete="off"
          />
          <button type="submit">Search</button>
        </form>
        <CuisineBar activeArea={activeArea} onAreaSelect={onAreaSelect} />
        {user && (
          <div className="user-badge">
            <span className="user-name">@{user.username}</span>
            <button className="signout-btn" onClick={logout} title="Sign out">
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
