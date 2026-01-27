// client/src/pages/CreatePost.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CategorySelector from '../components/CategorySelector';
import RichTextEditor from '../components/RichTextEditor';

export default function CreatePost() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [category, setCategory] = useState(null); // ← Add category state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (category) {
      formData.append('category', category); // ← Add category to form
    }
    images.forEach(file => {
      formData.append('images', file);
    });

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create post');
      }

      // Clean up object URLs
      imagePreviews.forEach(url => URL.revokeObjectURL(url));

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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Post</h1>

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

        <div className="mb-4">
  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
    Content
  </label>
  <RichTextEditor 
    value={content} 
    onChange={setContent} 
    placeholder="Write about your photography session, equipment used, or behind-the-scenes story..."
  />
</div>

          {/* Category Selector */}
          <div className="mb-4">
            <CategorySelector 
              value={category} 
              onChange={setCategory} 
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images (optional)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImagesChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700"
            />
            {imagePreviews.length > 0 && (
              <div className="flex gap-2 mt-2">
                {imagePreviews.map((preview, idx) => (
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
              {loading ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}