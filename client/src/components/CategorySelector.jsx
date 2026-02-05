// client/src/components/CategorySelector.jsx
import { useEffect, useState } from 'react';

export default function CategorySelector({ value, onChange }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/categories`);
        const data = await res.json();
        if (res.ok) {
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div>
      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
        Category (optional)
      </label>
      <select
        id="category"
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        <option value="">None</option>
        {categories.map((category) => (
          <option key={category._id} value={category._id}>
            {category.name}
          </option>
        ))}
      </select>
      {loading && <p className="text-sm text-gray-500 mt-1">Loading categories...</p>}
    </div>
  );
}