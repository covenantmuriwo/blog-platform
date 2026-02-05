// client/src/pages/Home.jsx
import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/avatar';
export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
const [selectedCategory, setSelectedCategory] = useState('');
const [searchInput, setSearchInput] = useState('');
const [searchQuery, setSearchQuery] = useState('');

// Debounce search
const debouncedSearch = useCallback(
  debounce((value) => setSearchQuery(value), 300),
  []
);

useEffect(() => {
  debouncedSearch(searchInput);
}, [searchInput, debouncedSearch]);

// Cleanup debounce
useEffect(() => {
  return () => {
    debouncedSearch.cancel?.();
  };
}, [debouncedSearch]);

 useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/categories`);
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

const fetchPosts = async () => {
  try {
    let url = `${import.meta.env.VITE_API_URL}/api/posts`;
    const params = new URLSearchParams();
    
    if (selectedCategory) {
      params.append('category', selectedCategory);
    }
    if (searchQuery) {
      params.append('search', searchQuery);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const res = await fetch(url);
    const data = await res.json();
    if (res.ok) {
      setPosts(data.posts || []);
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};
  fetchCategories();
  fetchPosts();
}, [selectedCategory, searchQuery]); // ← Note the dependency array

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-gray-800 hover:text-indigo-600">
            Blog Platform
          </Link>
          <div className="flex gap-4">
            {!user ? (
              <>
                <Link to="/login" className="text-gray-700 hover:text-indigo-600">
                  Login
                </Link>
                <Link to="/signup" className="text-gray-700 hover:text-indigo-600">
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600">
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Latest Blog Posts</h1>
        {/* Search Input */}
<div className="mb-6">
  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
    Search Posts
  </label>
  <input
  type="text"
  id="search"
  value={searchInput}
  onChange={(e) => setSearchInput(e.target.value)}
  placeholder="Search by title or content..."
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
/>
</div>

        {/* Category Filter */}
<div className="mb-6">
  <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-2">
    Filter by Category
  </label>
  <select
    id="category-filter"
    value={selectedCategory}
    onChange={(e) => setSelectedCategory(e.target.value)}
    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
  >
    <option value="">All Categories</option>
    {categories.map((category) => (
      <option key={category._id} value={category._id}>
        {category.name}
      </option>
    ))}
  </select>
</div>

        {loading ? (
          <p className="text-gray-600 text-center">Loading posts...</p>
        ) : posts.length > 0 ? (
          <div className="space-y-8">
          {posts.map(post => {
  // 🔍 DEBUG LOGS - Add these lines
  console.log('Post author:', post.author);
  console.log('Avatar URL:', getAvatarUrl(post.author?.profilePicture));
  
  return (
    <article key={post._id} className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Post content - clickable to go to post detail */}
      <div 
        className="cursor-pointer"
        onClick={() => navigate(`/posts/${post._id}?from=home`)}
      >
        {/* Title + Content */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2 hover:text-indigo-600">
            {post.title}
          </h2>
<div 
  className="rich-content max-w-none" 
  dangerouslySetInnerHTML={{ __html: post.content }} 
/>
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="px-6 pb-4">
            <div className="flex gap-2">
              {post.images.slice(0, 2).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt=""
                  className="w-16 h-16 object-cover rounded border"
                />
              ))}
              {post.images.length > 2 && (
                <div className="w-16 h-16 bg-gray-800 rounded border flex items-center justify-center text-white text-xs font-bold">
                  +{post.images.length - 2}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Author + Category + Date (at bottom) - NOT clickable for post */}
      <div className="px-6 pb-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to={`/profile/${post.author?._id}?from=home`} className="flex-shrink-0">
            <img
  src={getAvatarUrl(post.author?.profilePicture, post.author?.name)}
  alt={post.author?.name}
  className="w-6 h-6 rounded-full object-cover"
/>
          </Link>
          <Link to={`/profile/${post.author?._id}?from=home`} className="text-sm text-indigo-600 hover:underline">
            {post.author?.name || 'Anonymous'}
          </Link>
          {post.category && (
            <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
              {post.category.name}
            </span>
          )}
        </div>
        <span className="text-sm text-gray-500">
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
      </div>
    </article>
  );
})}
          </div>
        ) : (
          <p className="text-gray-600 text-center">No posts yet.</p>
        )}
      </div>
    </div>
  );
}
// Simple debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}