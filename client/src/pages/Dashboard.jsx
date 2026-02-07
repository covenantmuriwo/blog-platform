// client/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // ← Add Link here
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

// Fetch user's posts
// Fetch user's posts
useEffect(() => {
  const fetchPosts = async () => {
    try {
      // Wait a tiny bit to ensure localStorage is updated
      await new Promise(resolve => setTimeout(resolve, 100));

      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        setPosts(data.posts || []);
      } else if (res.status === 401) {
        logout();
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    fetchPosts();
  } else {
    setLoading(false);
  }
}, [user, logout]);

  // Lightbox handlers
  const openLightbox = (images, index) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
  };

  // Delete handler
  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (res.ok) {
        setPosts(posts.filter(post => post._id !== postId));
      } else {
        alert('Failed to delete post');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting post');
    }
  };

  // Lightbox Component
  const Lightbox = ({ isOpen, images, currentIndex, onClose, onNext, onPrev }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-gray-300"
        >
          &times;
        </button>

        {images.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-4 text-white text-3xl font-bold hover:text-gray-300"
            >
              ‹
            </button>
            <button
              onClick={onNext}
              className="absolute right-12 text-white text-3xl font-bold hover:text-gray-300"
            >
              ›
            </button>
          </>
        )}

        <img
          src={images[currentIndex]}
          alt={`Post image ${currentIndex + 1}`}
          className="max-w-full max-h-[90vh] object-contain rounded"
        />

        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    );
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
<div className="flex justify-between items-center mb-8">
  <div>
    <h1 className="text-2xl font-semibold text-gray-700">Dashboard</h1>
    <p className="text-gray-500">Welcome back, <span className="font-medium text-gray-800">{user.name}</span>!</p>
  </div>
  <div className="flex items-center gap-3">
    <Link
      to="/profile"
      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
    >
      Profile
    </Link>
    <NotificationBell />
    <button
      onClick={logout}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
    >
      Logout
    </button>
  </div>
</div>

{/* 👇 ADD THIS BLOCK */}
{user && user.isAdmin && (
  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <h3 className="font-medium text-blue-800 mb-2">Admin Access</h3>
    <p className="text-blue-700 text-sm mb-3">
      You have administrator privileges. Manage users, posts, and site settings.
    </p>
    <Link
      to="/admin"
      className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium"
    >
      Go to Admin Dashboard
    </Link>
  </div>
)}
       <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto">
     <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
  <div>
    <h2 className="text-xl font-semibold text-gray-800">Your Posts</h2>
    <p className="text-sm text-gray-500">Manage your published content</p>
  </div>
  <div className="flex gap-2">
    <Link
      to="/"
      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
    >
      View All Posts
    </Link>
    <button
      onClick={() => navigate('/posts/new')}
      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
    >
      + New Post
    </button>
  </div>
</div>

          {loading ? (
            <p className="text-gray-600">Loading your posts...</p>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post._id} className="border border-gray-200 rounded-lg p-4 min-w-0 overflow-x-auto">
                  <h3 className="font-medium text-gray-800">{post.title}</h3>
<div className="text-gray-600 text-sm mt-1">
  <div 
  className="rich-content max-w-none" 
  dangerouslySetInnerHTML={{ __html: post.content }} 
/>
  {post.content.length > 150 && (
    <Link
      to={`/posts/${post._id}?from=dashboard`}
      className="text-indigo-600 hover:text-indigo-800 text-sm mt-1 inline-block"
    >
      Read more →
    </Link>
  )}
</div>
                  {post.images && post.images.length > 0 && (
                    <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                      {post.images.slice(0, 2).map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => openLightbox(post.images, idx)}
                          className="relative w-16 h-16 flex-shrink-0 focus:outline-none group"
                        >
                          <img
                            src={img}
                            alt={`Post image ${idx + 1}`}
                            className="w-full h-full object-cover rounded border"
                          />
                        </button>
                      ))}
                      {post.images.length > 2 && (
                        <button
                          type="button"
                          onClick={() => openLightbox(post.images, 2)}
                          className="relative w-16 h-16 flex-shrink-0 focus:outline-none group"
                        >
                          <div className="w-full h-full bg-gray-800 rounded border flex items-center justify-center text-white text-xs font-bold">
                            +{post.images.length - 2}
                          </div>
                        </button>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => navigate(`/posts/edit/${post._id}`)}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post._id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">You haven't created any posts yet.</p>
              <button
                onClick={() => navigate('/posts/new')}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
              >
                Create Your First Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <Lightbox
        isOpen={lightboxOpen}
        images={lightboxImages}
        currentIndex={lightboxIndex}
        onClose={closeLightbox}
        onNext={nextImage}
        onPrev={prevImage}
      />
    </div>
  );
}