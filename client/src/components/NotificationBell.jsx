// client/src/components/NotificationBell.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { getAvatarUrl } from '../utils/avatar'; // ← Add this line
import { useNavigate } from 'react-router-dom'; // ← Add this

export default function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead, loading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate(); // ← Add this line after useState hooks

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setIsOpen(false);
  };

  if (loading) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900 relative"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed left-4 right-4 sm:left-auto sm:right-4 sm:w-80 top-[72px] z-50 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[70vh] overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
          
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No notifications yet
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
{notifications.map((notification) => {
  // Extract sender info (now properly populated from backend)
  const sender = notification.sender || {};
  const senderName = sender.name || 'Someone';
  const senderId = sender._id || '';
  
  // Safely extract comment ID
  const commentId = notification.commentId 
    ? (typeof notification.commentId === 'object' 
        ? notification.commentId._id 
        : notification.commentId)
    : null;
  
  // Safely extract post ID  
  const postId = notification.postId 
    ? (typeof notification.postId === 'object' 
        ? notification.postId._id 
        : notification.postId)
    : null;

  return (
    <div
      key={notification._id}
      className={`block p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer ${
        !notification.read ? 'bg-blue-50' : ''
      }`}
 onClick={() => {
  setIsOpen(false);
  if (postId) {
    navigate(`/posts/${postId}?from=dashboard`, {
      state: { 
        scrollToComment: commentId,
        fromDashboard: true 
      }
    });
  } else {
    navigate('/');
  }
}}
    >
      <div className="flex items-start gap-3">
        <Link 
          to={`/profile/${senderId}`} 
          className="flex-shrink-0"
          onClick={(e) => e.stopPropagation()} // Prevents double navigation
        >
          <img
  src={getAvatarUrl(sender.profilePicture, sender.name)}
  alt={senderName}
  className="w-8 h-8 rounded-full object-cover"
/>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800">
            <span className="font-medium text-indigo-600">{senderName}</span> {notification.message.replace(senderName, '').trim()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(notification.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
})}
            </div>
          )}
        </div>
      )}
    </div>
  );
}