// client/src/pages/PublicProfile.jsx
import { useState, useEffect } from 'react'; // ← useState is now properly imported
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getAvatarUrl } from '../utils/avatar';

export default function PublicProfile() {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from');
  
  // Fix Issue 4: Dynamic back link
  const backTo = from === 'home' ? '/' : '/dashboard';
  const backLabel = from === 'home' ? 'Blog' : 'Dashboard';
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false); // ← Moved INSIDE component

  const openLightbox = () => {
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userId}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        const data = await res.json();
        
        if (res.ok) {
          const userData = data.user;
          if (userData.profilePicture && userData.profilePicture.includes('http://localhost:5000/')) {
            userData.profilePicture = userData.profilePicture.replace('http://localhost:5000/', '');
          }
          setUser(userData);
        } else {
          setError('User not found');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex-shrink-0 cursor-pointer" onClick={openLightbox}>
              <img
                src={getAvatarUrl(user.profilePicture, user.name)}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 hover:opacity-75 transition"
onError={(e) => {
  e.target.src = 'https://ui-avatars.com/api/?name=XX&background=f3f4f6&color=9ca3af';
}}
                crossorigin="anonymous"
              />
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
              
              {user.about && (
                <p className="text-gray-600 mt-2">{user.about}</p>
              )}
              
              <div className="mt-4 text-gray-500">
                <p>Member since: {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
                <p className="mt-1">Email: {user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to appropriate page */}
        <div className="mt-6">
          <Link to={backTo} className="text-indigo-600 hover:underline">
            ← Back to {backLabel}
          </Link>
        </div>

        {/* Lightbox */}
        {lightboxOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
            onClick={closeLightbox}
          >
            <button 
              className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-gray-300 z-50"
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
              }}
            >
              &times;
            </button>
            
            <img 
              src={getAvatarUrl(user.profilePicture, user.name)}
              alt={user.name}
              className="max-w-full max-h-[90vh] object-contain rounded"
onError={(e) => {
  const imgSrc = e.target.src;
  if (!avatarCache.has(imgSrc)) {
    avatarCache.set(imgSrc, true); // mark as attempted
    setTimeout(() => {
      // Retry only if we haven't already fallen back
      if (e.target.src === imgSrc) {
        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM3Nzc3NzciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPgogIDxwYXRoIGQ9Ik04IDEyYTEgMSAwIDAgMCAyIDBtNCAwYTEgMSAwIDAgMCAyIDBtLTYgNGE0IDQgMCAxIDEgOCAwIi8+Cjwvc3ZnPg==';
      }
    }, 2000);
  } else if (!imgSrc.includes('data:image')) {
    // If already retried and still failing, use fallback immediately
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM3Nzc3NzciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPgogIDxwYXRoIGQ9Ik04IDEyYTEgMSAwIDAgMCAyIDBtNCAwYTEgMSAwIDAgMCAyIDBtLTYgNGE0IDQgMCAxIDEgOCAwIi8+Cjwvc3ZnPg==';
  }
}}
              crossorigin="anonymous"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
}