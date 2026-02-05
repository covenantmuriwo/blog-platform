// client/src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import PublicProfile from './pages/PublicProfile';
import UserManagement from './pages/admin/UserManagement';
import AdminLayout from './pages/admin/AdminLayout'; // ← Add this import
import AdminDashboard from './pages/admin/AdminDashboard'; // ← Add this import
import PostManagement from './pages/admin/PostManagement';
import CommentManagement from './pages/admin/CommentManagement';

// In your admin routes
<Route path="posts" element={<PostManagement />} />

// You need to import RequireAuth
import RequireAuth from './context/RequireAuth';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/posts/:id" element={<PostDetail />} />

      {/* Auth routes */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:userId"
        element={<PublicProfile />}
      />
      
      <Route
        path="/posts/new"
        element={
          <ProtectedRoute>
            <CreatePost />
          </ProtectedRoute>
        }
      />
      <Route
        path="/posts/edit/:id"
        element={
          <ProtectedRoute>
            <EditPost />
          </ProtectedRoute>
        }
      />

      {/* ✅ CORRECT ADMIN ROUTES - NESTED PROPERLY */}
      <Route 
        path="/admin/*" 
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        {/* Add other admin routes here when ready */}
        <Route path="posts" element={<PostManagement />} />
        <Route path="comments" element={<CommentManagement />} />
      </Route>
    </Routes>
  );
}

export default App;