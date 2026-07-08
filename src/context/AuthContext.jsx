import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Helper: SHA-256 hash a string, returns hex string
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const USERS_KEY = 'larder:users';

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadSession() {
  try {
    const raw = sessionStorage.getItem('larder:session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { username, userId }
  const [authLoading, setAuthLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const session = loadSession();
    if (session) {
      setUser(session);
    }
    setAuthLoading(false);
  }, []);

  const register = async (username, password) => {
    const trimmed = username.trim().toLowerCase();
    if (!trimmed || !password) throw new Error('Username and password are required.');
    if (trimmed.length < 3) throw new Error('Username must be at least 3 characters.');
    if (password.length < 4) throw new Error('Password must be at least 4 characters.');

    const users = loadUsers();
    if (users[trimmed]) throw new Error('That username is already taken.');

    const hash = await sha256(password);
    const userId = `user_${trimmed}_${Date.now()}`;

    users[trimmed] = { userId, username: trimmed, passwordHash: hash };
    saveUsers(users);

    const session = { username: trimmed, userId };
    sessionStorage.setItem('larder:session', JSON.stringify(session));
    setUser(session);
  };

  const login = async (username, password) => {
    const trimmed = username.trim().toLowerCase();
    if (!trimmed || !password) throw new Error('Please enter your username and password.');

    const users = loadUsers();
    const record = users[trimmed];
    if (!record) throw new Error('No account found with that username.');

    const hash = await sha256(password);
    if (hash !== record.passwordHash) throw new Error('Incorrect password.');

    const session = { username: record.username, userId: record.userId };
    sessionStorage.setItem('larder:session', JSON.stringify(session));
    setUser(session);
  };

  const logout = () => {
    sessionStorage.removeItem('larder:session');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
