import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  // Load user from token on startup
  useEffect(() => {
    if (token) {
      // Decode token or fetch user data if needed
      try {
        // For JWT example (you may need a proper JWT library)
        const userData = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser(userData);
      } catch (error) {
        console.error("Failed to parse token", error);
        localStorage.removeItem('authToken');
        setToken(null);
      }
    }
    setLoading(false);
  }, [token]);

  const login = (data) => {
    // Store token in localStorage
    localStorage.setItem('authToken', data.token);
    setToken(data.token);
    setCurrentUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    token,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}