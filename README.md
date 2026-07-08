# 🥘 Larder.

> Find a recipe · Pin it to the week · Pull the list

A beautiful, multi-user recipe planning app built with **React + Vite**. Search millions of dishes, plan your week on a drag-and-drop board, and generate an automatic shopping list — all stored privately per user.

---

## ✨ Features

- **Recipe Search** — Searches by meal name, ingredient, category, and cuisine area simultaneously (powered by [TheMealDB](https://www.themealdb.com/api.php))
- **Country Cuisine Search** — Inline autocomplete country selector with 🏳️ flag emojis to browse dishes by cuisine (Indian, Italian, Japanese…)
- **Drag & Drop Weekly Planner** — Drop recipe cards onto a Mon–Sun × Breakfast/Lunch/Dinner board
- **Shopping List Generator** — Aggregates ingredients from your whole week into a deduplicated, sorted receipt
- **Favorites** — Heart any recipe to pin it to your saved list
- **Multi-User Auth** — Register / sign in with per-user isolated storage. Passwords are hashed with SHA-256 (`crypto.subtle`) — no backend required
- **Persistent Storage** — Each user's plan, favorites, and cache are namespaced in `localStorage` so data survives refreshes

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Styling | Vanilla CSS with CSS custom properties |
| Auth | Client-side SHA-256 hashing via `crypto.subtle` |
| Data | [TheMealDB](https://www.themealdb.com/) free public API |
| State | React hooks (`useState`, `useEffect`, `useContext`) |
| Storage | `localStorage` with per-user namespaced keys |

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📁 Project Structure

```
src/
├── api/
│   └── themealdb.js        # All MealDB API calls (search, filter, lookup)
├── components/
│   ├── AuthPage.jsx         # Login / Register screen
│   ├── CuisineBar.jsx       # Country autocomplete search
│   ├── Header.jsx           # Top bar with search + user badge
│   ├── PlannerBoard.jsx     # Weekly drag-and-drop grid
│   ├── RecipeCard.jsx       # Draggable recipe card
│   ├── RecipeModal.jsx      # Full recipe detail overlay
│   ├── ShoppingList.jsx     # Auto-generated ingredient list
│   └── Sidebar.jsx          # Search results + favorites panel
├── context/
│   └── AuthContext.jsx      # Auth state, register/login/logout
├── hooks/
│   └── useLarderStorage.js  # Per-user persistent storage hook
├── index.css                # Global design system & all component styles
└── main.jsx                 # App entry point
```

## 🔐 How Multi-User Works

1. Passwords are hashed with `SHA-256` via the Web Crypto API before being stored in `localStorage` — they are never stored in plain text.
2. On login, the hash is compared server-side. A session object is stored in `sessionStorage` (cleared when the tab closes).
3. All user data keys are namespaced: `larder:{userId}:favorites`, `larder:{userId}:plan`, etc. — so different users' data never overlaps.

## 📸 Screenshots

| Auth Screen | Main App | Recipe Detail |
|---|---|---|
| Login / Register page | Planner board + sidebar | Full recipe with ingredients |

---

Made with ❤️ using React, Vite, and TheMealDB.
