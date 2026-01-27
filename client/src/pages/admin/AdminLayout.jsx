// client/src/pages/admin/AdminLayout.jsx
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { user } = useAuth();
  
  // Redirect non-admins
  if (!user?.isAdmin) {
    return <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-600">Access denied. Admin only.</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="flex">
        <aside className="w-64 bg-white shadow-md min-h-screen">
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold text-indigo-600">Admin Panel</h1>
          </div>
          <nav className="p-4">
            <Link to="/admin" className="block py-2 px-4 hover:bg-gray-100 rounded">Dashboard</Link>
            <Link to="/admin/users" className="block py-2 px-4 hover:bg-gray-100 rounded">Users</Link>
            <Link to="/admin/posts" className="block py-2 px-4 hover:bg-gray-100 rounded">Posts</Link>
            <Link to="/admin/comments" className="block py-2 px-4 hover:bg-gray-100 rounded">Comments</Link>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
