// client/src/context/RequireAuth.jsx
import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Redirect to dashboard if authenticated but NOT admin
  if (!user.isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
}