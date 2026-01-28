// client/src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

useEffect(() => {
  const verifyAuth = async () => {
    // 🔥 WAKE UP THE BACKEND FIRST (even before auth check)
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/health`);
    } catch (err) {
      console.log('Waking up backend...');
    }

    // Now proceed with normal auth verification
    const storedToken = localStorage.getItem('token');
    
    if (storedToken) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setToken(storedToken);
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.error('Auth verification failed:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      }
    }
    
    setLoading(false);
  };

  verifyAuth();
}, []);

  const login = async (userData, userToken) => {
  // Save token immediately
  localStorage.setItem('token', userToken);
  setToken(userToken);

  try {
    // Fetch FULL user profile (this includes `isAdmin`)
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (res.ok) {
      const fullUserData = await res.json();
      const completeUser = fullUserData.user; // ← contains `isAdmin`

      setUser(completeUser);
      localStorage.setItem('user', JSON.stringify(completeUser));
    } else {
      // Fallback: use minimal user if profile fetch fails
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  } catch (err) {
    console.error('Profile fetch failed after login:', err);
    // Still use minimal user as fallback
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }
};

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    
    // Redirect to homepage after logout
    window.location.href = '/';
  };

  // Add updateUser function with path normalization
  const updateUser = (updatedUser) => {
    // Normalize profile picture path (fix Windows backslashes)
    if (updatedUser.profilePicture && updatedUser.profilePicture.includes('\\')) {
      updatedUser.profilePicture = updatedUser.profilePicture.replace(/\\/g, '/');
    }
    
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, token, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};