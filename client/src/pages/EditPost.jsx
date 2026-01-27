// client/src/pages/EditPost.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CategorySelector from '../components/CategorySelector';
import RichTextEditor from '../components/RichTextEditor';

export default function EditPost() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [category, setCategory] = useState(null);

  // Fetch post on load
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          setTitle(data.post.title);
          setContent(data.post.content);
          setExistingImages(data.post.images || []);
          setCategory(data.post.category?._id || null);
        } else {
          setError('Failed to load post');
          navigate('/dashboard');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load post');
        navigate('/dashboard');
      }
    };

    fetchPost();
  }, [id, token, navigate]);

  const handleNewImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setNewImagePreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (category) {
  formData.append('category', category);
}

    // If new images selected, they REPLACE all existing images
    if (newImages.length > 0) {
      newImages.forEach(file => {
        formData.append('images', file);
      });
    }
    // If no new images, backend keeps existing images (since images field is not sent)

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update post');
      }

      // Clean up object URLs
      newImagePreviews.forEach(url => URL.revokeObjectURL(url));

      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Post</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

<div className="mb-6">
  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
    Content
  </label>
  <RichTextEditor 
    value={content} 
    onChange={setContent} 
    placeholder="Edit your post content..."
  />
</div>

          {/* Existing Images Preview */}
          {existingImages.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Images
              </label>
              <div className="flex flex-wrap gap-2">
                {existingImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt=""
                    className="w-16 h-16 object-cover rounded border"
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                To change images, upload new ones below (replaces all).
              </p>
            </div>
          )}
          {/* Category Selector */}
<div className="mb-6">
  <CategorySelector 
    value={category} 
    onChange={setCategory} 
  />
</div>

          {/* Upload New Images */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload New Images (optional)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleNewImagesChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700"
            />
            {newImagePreviews.length > 0 && (
              <div className="flex gap-2 mt-2">
                {newImagePreviews.map((preview, idx) => (
                  <img
                    key={idx}
                    src={preview}
                    alt=""
                    className="w-16 h-16 object-cover rounded border"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-white rounded-lg transition ${
                loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? 'Saving...' : 'Update Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}