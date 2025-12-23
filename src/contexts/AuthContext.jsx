import { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext(null);

// Función para decodificar el token JWT
function decodeToken(token) {
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    if (decoded && decoded.user) {
      decoded.user.isAdmin = !!decoded.user.isAdmin;
    }
    return decoded;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      const decoded = decodeToken(token);
      if (decoded && decoded.user) {
        setUser(decoded.user);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    const decoded = decodeToken(token);
    if (decoded && decoded.user) {
      setUser(decoded.user);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

