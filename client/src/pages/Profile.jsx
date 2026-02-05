// client/src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, token, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    about: '',
    profilePicture: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
const [lightboxImage, setLightboxImage] = useState('');

  // Load user data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          console.log('✅ Full user object from backend:', data.user);
          setFormData({
            name: data.user.name || '',
            about: data.user.about || '',
            profilePicture: data.user.profilePicture || '',
            createdAt: data.user.createdAt // ← Add this
          });
          setPreviewImage(data.user.profilePicture || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user && token) {
      fetchProfile();
    }
  }, [user, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profilePicture: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('about', formData.about);
      
      if (formData.profilePicture instanceof File) {
        formDataToSend.append('profilePicture', formData.profilePicture);
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend
      });

      const data = await res.json();
     if (res.ok) {
  setMessage('Profile updated successfully!');
setTimeout(() => setMessage(''), 3000);
  updateUser(data.user); // Update auth context
  
  // Update both formData AND previewImage
  const newProfilePicture = data.user.profilePicture;
  setFormData(prev => ({ 
    ...prev, 
    profilePicture: newProfilePicture 
  }));
  setPreviewImage(newProfilePicture);
} else {
        setMessage(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error updating profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setMessage('New passwords do not match');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/change-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Password changed successfully!');
setTimeout(() => setMessage(''), 3000);
        // Clear password fields
        setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      } else {
        setMessage(data.message || 'Failed to change password');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error changing password');
    } finally {
      setSubmitting(false);
    }
  };
  // Handle removing profile picture
const handleRemoveProfilePicture = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/remove-picture`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (res.ok) {
      // Reset to default avatar
      setPreviewImage('');
      setFormData(prev => ({ ...prev, profilePicture: '' }));
      setMessage('Profile picture removed successfully!');
      setTimeout(() => setMessage(''), 3000); // ← Auto-dismiss after 3 seconds
    } else {
      setMessage('Failed to remove profile picture');
    }
  } catch (err) {
    console.error(err);
    setMessage('Error removing profile picture');
  }
};

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile Settings</h1>
        
{/* Success Toast */}
{message && (
  <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
    {message}
  </div>
)}

{/* Profile Picture and Basic Info */}
<div className="bg-white rounded-xl shadow-md p-6 mb-6">
  <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Picture</h2>
  
  <div className="flex flex-col sm:flex-row gap-6 items-start">
<div 
  className="flex-shrink-0 cursor-pointer relative group"
  onClick={() => {
    if (previewImage && !previewImage.startsWith('data:image/svg+xml')) {
      setLightboxImage(previewImage);
      setLightboxOpen(true);
    }
  }}
>
      <img
      src={previewImage || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM3Nzc3NzciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPgogIDxwYXRoIGQ9Ik04IDEyYTEgMSAwIDAgMCAyIDBtNCAwYTEgMSAwIDAgMCAyIDBtLTYgNGE0IDQgMCAxIDEgOCAwIi8+Cjwvc3ZnPg=='}  
        alt="Profile"
        className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 hover:opacity-75 transition"
      />
      
      {/* Remove button - only show when there's an actual image */}
      {previewImage && previewImage !== 'image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIHN0cm9rZT0iI2NjYyIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik04IDEyYTEgMSAwIDAgMCAyIDBtNCAwYTEgMSAwIDAgMCAyIDBtLTYgNGE0IDQgMCAxIDEgOCAwIiBzdHJva2U9IiNjY2MiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4=' && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveProfilePicture();
          }}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition"
          title="Remove photo"
        >
          ×
        </button>
      )}
    </div>
    
    <div className="flex-1">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        Upload new photo
      </label>
<div 
  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400 transition"
  onClick={() => document.getElementById('profilePictureInput').click()}
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
  <p className="mt-2 text-sm text-gray-600">
    <span className="font-medium text-indigo-600">Click to upload</span> or drag and drop
  </p>
  <p className="text-xs text-gray-500 mt-1">
    JPG, PNG, GIF up to 5MB
  </p>
</div>

<input
  id="profilePictureInput"
  type="file"
  accept="image/*"
  onChange={handleFileChange}
  className="hidden"
/>
      <p className="text-xs text-gray-500 mt-1">
        JPG, PNG, GIF up to 5MB
      </p>
    </div>
  </div>
</div>

        {/* Profile Information */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Information</h2>
          
          <form onSubmit={handleProfileSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-1">
                About Me
              </label>
              <textarea
                id="about"
                name="about"
                value={formData.about}
                onChange={handleInputChange}
                rows="4"
                maxLength="500"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Tell us about yourself..."
              />
              <p className="text-xs text-gray-500 mt-1">{formData.about.length}/500</p>
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h2>
          
          <form onSubmit={handlePasswordChange}>
            <div className="mb-4">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmNewPassword"
                value={passwordData.confirmNewPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {submitting ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Information</h2>
          <div className="space-y-2 text-gray-600">
            <p><span className="font-medium">Email:</span> {user?.email}</p>
<p>
  <span className="font-medium">Member since:</span>{' '}
  {formData.createdAt 
    ? new Date(formData.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) 
    : 'N/A'}
</p>
          </div>
        </div>
        {/* Lightbox */}
{lightboxOpen && (
  <div 
    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
    onClick={() => setLightboxOpen(false)}
  >
    <button 
      className="absolute top-4 right-4 text-white text-2xl z-50"
      onClick={(e) => {
        e.stopPropagation();
        setLightboxOpen(false);
      }}
    >
      &times;
    </button>
    <img 
      src={lightboxImage} 
      alt="Profile" 
      className="max-w-full max-h-[90vh] object-contain rounded"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
)}

        {/* Navigation back to dashboard */}
        <div className="mt-6">
          <Link to="/dashboard" className="text-indigo-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}