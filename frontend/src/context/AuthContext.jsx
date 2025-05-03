import { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);

  // Load user from token on startup
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('authToken');
    
    if (storedUser && storedToken && storedUser !== 'undefined') {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser) {
          setCurrentUser(parsedUser);
          setAuthToken(storedToken);
        }
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
      }
    } else {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    }
    setLoading(false);
  }, []);

  const login = useCallback((data) => {
    if ((!data.user && !data.currentUser) || !data.token) {
      console.log('Login failed: Missing user or token');
      return;
    }
    setAuthToken(data.token);
    setCurrentUser(data.user || data.currentUser);
    localStorage.setItem('currentUser', JSON.stringify(data.user || data.currentUser));
    localStorage.setItem('authToken', data.token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setAuthToken(null);
    setCurrentUser(null);
  }, []);

  const value = useMemo(() => ({
    currentUser,
    authToken,
    login,
    logout,
    loading,
  }), [currentUser, authToken, login, logout, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}