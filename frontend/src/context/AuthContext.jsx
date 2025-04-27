import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);

  // Load user from token on startup
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    console.log('storedUser:', storedUser);
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

  const login = (data) => {
    console.log('Login data received:', data);
    if ((!data.user && !data.currentUser) || !data.token) {
      console.log('Login failed: Missing user or token');
      return;
    }
    // Store token in localStorage
    setAuthToken(data.token);
    setCurrentUser(data.user || data.currentUser);
    localStorage.setItem('currentUser', JSON.stringify(data.user || data.currentUser));
    localStorage.setItem('authToken', data.token);
    console.log('Login successful: Token and user stored');
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setAuthToken(null);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    authToken,
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

export function useAuth() {
  return useContext(AuthContext);
}