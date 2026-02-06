// client/src/pages/PostDetail.jsx
import { useEffect, useState, useRef, useCallback} from 'react';
import { useParams, Link, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/avatar'; // ← Add this line


export default function PostDetail() {
  const { user } = useAuth();
  const { id: postId } = useParams();
  const [searchParams] = useSearchParams();
    const location = useLocation(); 
    const { state } = useLocation();
    const scrollToCommentId = state?.scrollToComment;

    console.log('🔍 ScrollToCommentId from state:', scrollToCommentId);
console.log('🔍 Full location state:', state);
  const from = searchParams.get('from');
  const backTo = from === 'dashboard' ? '/dashboard' : '/';
  const backLabel = from === 'dashboard' ? 'Dashboard' : 'Blog';

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newComment, setNewComment] = useState('');

  // DEBUG: Log current state
console.log('Debug State:', {
  scrollToCommentId,
  postLoaded: !!post,
  commentsLoaded: comments.length,
  locationState: location.state
});
  

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Force fresh load on every post visit
useEffect(() => {
  setLoading(true);
  setComments([]);
  setPost(null);
}, [postId]);

// Fetch post and comments
useEffect(() => {
  console.log('🔍 DEBUG: Starting to fetch post and comments');
  console.log('🔍 DEBUG: Post ID is:', postId);
  
  const fetchPostAndComments = async () => {
    try {
      // Fetch post
      console.log('🔍 DEBUG: Fetching post from:', `${import.meta.env.VITE_API_URL}/api/posts/${postId}`);
      const postRes = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${postId}`);
      console.log('🔍 DEBUG: Post response status:', postRes.status);
      
      if (!postRes.ok) {
        console.error('❌ DEBUG: Post fetch failed with status:', postRes.status);
        throw new Error('Post not found');
      }
      
      const postData = await postRes.json();
      console.log('✅ DEBUG: Post data received:', postData);
      setPost(postData.post);

      // Fetch comments
      console.log('🔍 DEBUG: Fetching comments from:', `${import.meta.env.VITE_API_URL}/api/posts/${postId}/comments`);
      const commentsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${postId}/comments`);
      console.log('🔍 DEBUG: Comments response status:', commentsRes.status);
      
      if (!commentsRes.ok) {
        console.error('❌ DEBUG: Comments fetch failed with status:', commentsRes.status);
        throw new Error('Comments not found');
      }
      
      const commentsData = await commentsRes.json();
      console.log('✅ DEBUG: Comments data received:', commentsData);
      setComments(commentsData.comments || []);
    } catch (err) {
      console.error('🔥 DEBUG: Error in fetchPostAndComments:', err);
    } finally {
      setLoading(false);
    }
  };

  if (postId) {
    fetchPostAndComments();
  } else {
    console.log('❌ DEBUG: No postId available');
  }
}, [postId]);
// Auto-refresh comments every 30 seconds (for admin deletions)
useEffect(() => {
  if (!postId) return;
  
  const refreshComments = async () => {
    try {
      const commentsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${postId}/comments`);
      if (commentsRes.ok) {
        const commentsData = await commentsRes.json();
        setComments(commentsData.comments || []);
      }
    } catch (err) {
      console.error('Error refreshing comments:', err);
    }
  };

  // Refresh comments every 30 seconds
  const interval = setInterval(refreshComments, 30000);
  return () => clearInterval(interval);
}, [postId]);
// Scroll-to-comment with recursive reply expansion
useEffect(() => {
  if (!scrollToCommentId) return;

  const expandRepliesRecursively = async (depth = 0, maxDepth = 5) => {
    if (depth >= maxDepth) return;

    // Wait for DOM to update
    await new Promise(resolve => setTimeout(resolve, 100));

    // Find all "View X replies" buttons that haven't been clicked yet
    const viewButtons = Array.from(document.querySelectorAll('button'))
      .filter(btn => 
        btn.textContent?.includes('View') && 
        !btn.textContent?.includes('Hide')
      );

    if (viewButtons.length === 0) return;

    // Click all "View replies" buttons
    viewButtons.forEach(btn => btn.click());

    // Recursively expand deeper levels
    await expandRepliesRecursively(depth + 1, maxDepth);
  };

  const scrollToComment = async () => {
    // First, expand all reply levels recursively
    await expandRepliesRecursively();

    // Now scroll to target
    const commentElement = document.getElementById(`comment-${scrollToCommentId}`);
    if (commentElement) {
      commentElement.classList.add('bg-yellow-100', 'transition-colors');
      
      const elementRect = commentElement.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      const headerOffset = 120;
      const scrollPosition = absoluteElementTop - headerOffset;
      
      window.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
      
      setTimeout(() => {
        commentElement.classList.remove('bg-yellow-100');
      }, 2000);
    } else {
      console.log('❌ Target comment not found even after expansion');
    }
  };

  if (comments.length > 0) {
    const timer = setTimeout(scrollToComment, 400);
    return () => clearTimeout(timer);
  }
}, [scrollToCommentId, comments.length, location.state]);


  // Lightbox handlers
  const openLightbox = (images, index) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);
  const nextImage = () => setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
  const prevImage = () => setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);

  // Handle comment submit
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: newComment })
      });

      const data = await res.json();
      if (res.ok) {
        setComments([data.comment, ...comments]);
        setNewComment('');
      } else {
        alert('Failed to post comment');
      }
    } catch (err) {
      console.error(err);
      alert('Error posting comment');
    } finally {
      setCommentLoading(false);
    }
  };
// Handle reply submit - supports nested replies
const handleReplySubmit = async (parentCommentId, replyContent) => {
  if (!replyContent.trim()) return;

  // Find the parent comment (could be top-level or nested)
  const findAndAddReply = (comments, parentId, newReply) => {
    return comments.map(comment => {
      if (comment._id === parentId) {
        // Found the parent - add reply to its replies array
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply]
        };
      }
      
      // Check if parent is in this comment's replies (nested case)
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: findAndAddReply(comment.replies, parentId, newReply)
        };
      }
      
      return comment;
    });
  };

  // Optimistic UI update
  const newReply = {
    _id: 'temp-' + Date.now(),
    content: replyContent,
    author: {
      _id: user.id,
      name: user.name,
      profilePicture: user.profilePicture
    },
    createdAt: new Date().toISOString(),
    likes: [],
    parentComment: parentCommentId
  };

  // Update state recursively
  setComments(prevComments => findAndAddReply(prevComments, parentCommentId, newReply));

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/reply/${parentCommentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ content: replyContent })
    });

    const data = await res.json();
    if (res.ok) {
      // Replace temporary reply with actual server response
      const replaceTempReply = (comments, tempId, actualReply) => {
        return comments.map(comment => {
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply => 
                reply._id === tempId ? actualReply : {
                  ...reply,
                  replies: replaceTempReply(reply.replies || [], tempId, actualReply)
                }
              )
            };
          }
          return comment;
        });
      };

      setComments(prevComments => replaceTempReply(prevComments, newReply._id, data.comment));
    } else {
      // Remove failed reply
      const removeFailedReply = (comments, tempId) => {
        return comments.map(comment => {
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies
                .filter(reply => reply._id !== tempId)
                .map(reply => ({
                  ...reply,
                  replies: removeFailedReply(reply.replies || [], tempId)
                }))
            };
          }
          return comment;
        });
      };
      
      setComments(prevComments => removeFailedReply(prevComments, newReply._id));
      alert('Failed to post reply');
    }
  } catch (err) {
    console.error(err);
    // Remove failed reply on error
    const removeFailedReply = (comments, tempId) => {
      return comments.map(comment => {
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies
              .filter(reply => reply._id !== tempId)
              .map(reply => ({
                ...reply,
                replies: removeFailedReply(reply.replies || [], tempId)
              }))
          };
        }
        return comment;
      });
    };
    
    setComments(prevComments => removeFailedReply(prevComments, newReply._id));
    alert('Error posting reply');
  }
};
// Recursive Comment Component with collapsible replies
const CommentItem = ({ comment, user, handleCommentLike, handleReplySubmit, handleDeleteComment }) => {
  const userLikedComment = comment.likes?.includes(user?.id);
  const commentLikesCount = comment.likes?.length || 0;
  
  // Local state for reply form
  const [isReplying, setIsReplying] = useState(false);
  const [localReplyContent, setLocalReplyContent] = useState('');
  
  // NEW: Collapsible state for replies
  const [isRepliesCollapsed, setIsRepliesCollapsed] = useState(true);

  const handleLocalReplySubmit = async () => {
    if (!localReplyContent.trim()) return;
    await handleReplySubmit(comment._id, localReplyContent);
    setLocalReplyContent('');
    setIsReplying(false);
  };

  return (
    <div key={comment._id} id={`comment-${comment._id}`} className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <Link to={`/profile/${comment.author?._id}`} className="flex-shrink-0">
              <img
                src={getAvatarUrl(comment.author?.profilePicture, comment.author?.name)}
                alt={comment.author?.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            </Link>
            <Link to={`/profile/${comment.author?._id}`} className="text-sm text-indigo-600 hover:underline">
              {comment.author?.name || 'Anonymous'}
            </Link>
          </div>
          <p className="text-gray-700 mt-1">{comment.content}</p>
        </div>
{user && (
  <div className="flex gap-2">
    <button
      onClick={() => handleCommentLike(comment._id)}
      className="ml-2 flex items-center gap-1 text-xs"
    >
      {userLikedComment ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-600">
          <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.18 25.18 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400 hover:text-gray-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      )}
      <span className={userLikedComment ? 'text-red-600' : 'text-gray-400'}>
        {commentLikesCount}
      </span>
    </button>
    <button
      onClick={() => setIsReplying(!isReplying)}
      className="text-xs text-gray-500 hover:text-indigo-600"
    >
      Reply
    </button>
    {/* 👇 ADD DELETE BUTTON HERE 👇 */}
    {comment.author?._id === user.id && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (window.confirm('Delete this comment? This cannot be undone.')) {
            handleDeleteComment(comment._id);
          }
        }}
        className="text-xs text-gray-500 hover:text-red-600 ml-2"
        title="Delete comment"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </button>
    )}
  </div>
)}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-500">
          {new Date(comment.createdAt).toLocaleDateString()}
        </span>
        
        {/* NEW: Show reply count and toggle button */}
        {comment.replies && comment.replies.length > 0 && (
          <button
            onClick={() => setIsRepliesCollapsed(!isRepliesCollapsed)}
            className="text-xs text-gray-500 hover:text-indigo-600"
          >
            {isRepliesCollapsed ? 
              `View ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}` : 
              'Hide replies'
            }
          </button>
        )}
      </div>

      {/* Reply form */}
      {isReplying && user && (
        <div className="mt-3 ml-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={localReplyContent}
              onChange={(e) => setLocalReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
              maxLength="300"
              autoFocus
            />
            <button
              onClick={handleLocalReplySubmit}
              className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
            >
              Post
            </button>
          </div>
        </div>
      )}

      {/* NEW: Collapsible nested replies */}
      {comment.replies && comment.replies.length > 0 && !isRepliesCollapsed && (
        <div className="mt-3 ml-8 space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              user={user}
              handleCommentLike={handleCommentLike}
              handleReplySubmit={handleReplySubmit}
               handleDeleteComment={handleDeleteComment}
            />
          ))}
        </div>
      )}
    </div>
  );
};
  // Handle post like
  const handlePostLike = async () => {
    if (!user) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        setPost({
  ...post,
  likes: data.liked 
    ? [...post.likes, user.id] 
    : post.likes.filter(id => id !== user.id),
  likesCount: data.likesCount
});
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle comment delete
const handleDeleteComment = async (commentId) => {
  try {
   const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${commentId}`, {
  method: 'DELETE',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

    if (res.ok) {
      // Remove comment and its replies from UI
      const removeCommentAndReplies = (comments, idToRemove) => {
        return comments.filter(comment => {
          if (comment._id === idToRemove) {
            return false; // Remove this comment
          }
          
          // Recursively remove from replies
          if (comment.replies && comment.replies.length > 0) {
            comment.replies = removeCommentAndReplies(comment.replies, idToRemove);
          }
          
          return true;
        });
      };

      setComments(prevComments => removeCommentAndReplies(prevComments, commentId));
    } else {
      const data = await res.json();
      alert(data.message || 'Failed to delete comment');
    }
  } catch (err) {
    console.error(err);
    alert('Error deleting comment');
  }
};

// Handle comment like - supports nested replies
const handleCommentLike = async (commentId) => {
  if (!user) return;
  
  try {
const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${commentId}/like`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

    const data = await res.json();
    if (res.ok) {
      // Recursive function to update likes in nested structure
      const updateCommentLikes = (comments) => {
        return comments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              likes: data.liked 
                ? [...comment.likes, user.id] 
                : comment.likes.filter(id => id !== user.id),
              likesCount: data.likesCount
            };
          }
          
          // Check nested replies recursively
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentLikes(comment.replies)
            };
          }
          
          return comment;
        });
      };
      
      setComments(prevComments => updateCommentLikes(prevComments));
    }
  } catch (err) {
    console.error(err);
  }
};

  // Check if user liked post
  const userLikedPost = post?.likes?.includes(user?.id);
  const postLikesCount = post?.likes?.length || 0;

  // Lightbox component
  const Lightbox = ({ isOpen, images, currentIndex, onClose, onNext, onPrev }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
        <button onClick={onClose} className="absolute top-4 right-4 text-white text-2xl">&times;</button>
        {images.length > 1 && (
          <>
            <button onClick={onPrev} className="absolute left-4 text-white text-3xl">‹</button>
            <button onClick={onNext} className="absolute right-12 text-white text-3xl">›</button>
          </>
        )}
        <img src={images[currentIndex]} alt="" className="max-w-full max-h-[90vh] object-contain rounded" />
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!post) return <div className="min-h-screen flex items-center justify-center">Post not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Link to={backTo} className="text-indigo-600 hover:underline mb-6 inline-block">
          &larr; Back to {backLabel}
        </Link>
        
        <article className="bg-white rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{post.title}</h1>
          
          {/* Post Like Button */}
          {user && (
          <button
  onClick={handlePostLike}
  className="mb-2 flex items-center gap-1 text-sm"
>
  {userLikedPost ? (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-600">
      <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 hover:text-gray-700">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  )}
  <span className={userLikedPost ? 'text-red-600' : 'text-gray-500'}>
    {postLikesCount} {postLikesCount === 1 ? 'like' : 'likes'}
  </span>
</button>
          )}
          
<div className="text-sm text-gray-500 mb-6">
  <div className="flex items-center gap-2">
    <Link to={`/profile/${post.author?._id}`} className="flex-shrink-0">
   <img
  src={getAvatarUrl(post.author?.profilePicture, post.author?.name)}
  alt={post.author?.name}
  className="w-6 h-6 rounded-full object-cover"
/>
    </Link>
    <Link to={`/profile/${post.author?._id}`} className="text-sm text-indigo-600 hover:underline">
      {post.author?.name || 'Anonymous'}
    </Link>
  </div>
  <span className="ml-2">• {new Date(post.createdAt).toLocaleDateString()}</span>
</div>

<div 
  className="rich-content max-w-none" 
  dangerouslySetInnerHTML={{ __html: post.content }} 
/>

          {post.images && post.images.length > 0 && (
            <div className="mt-6">
              <div className="flex gap-2 flex-wrap">
                {post.images.slice(0, 2).map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => openLightbox(post.images, idx)}
                    className="relative w-24 h-24 focus:outline-none"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover rounded border" />
                  </button>
                ))}
                {post.images.length > 2 && (
                  <button
                    type="button"
                    onClick={() => openLightbox(post.images, 2)}
                    className="relative w-24 h-24 focus:outline-none"
                  >
                    <div className="w-full h-full bg-gray-800 rounded border flex items-center justify-center text-white text-xs font-bold">
                      +{post.images.length - 2}
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Comments ({comments.length})
            </h3>

            {/* Comment Form */}
            {user ? (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <div className="flex gap-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows="2"
                    maxLength="500"
                    key="main-comment-input"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || commentLoading}
                    className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition ${
                      (!newComment.trim() || commentLoading) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {commentLoading ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-gray-600 mb-4">
                <Link to="/login" className="text-indigo-600 hover:underline">
                  Log in
                </Link> to comment.
              </p>
            )}

{/* Comments List */}
{comments.length > 0 ? (
  <div className="space-y-4">
    {comments.map((comment) => (
      <CommentItem
        key={comment._id}
        comment={comment}
        user={user}
        handleCommentLike={handleCommentLike}
        handleReplySubmit={handleReplySubmit}
        handleDeleteComment={handleDeleteComment}
      />
    ))}
  </div>
) : (
  <p className="text-gray-500 italic">No comments yet. Be the first!</p>
)}
          </div>
        </article>
      </div>

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