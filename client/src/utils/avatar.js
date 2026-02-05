// client/src/utils/avatar.js
export const getAvatarUrl = (profilePicture, name = 'User') => {
  // If user has uploaded a profile picture
  if (profilePicture && typeof profilePicture === 'string' && profilePicture.trim() !== '') {
    // Normalize Windows paths
    let normalizedPath = profilePicture.replace(/\\/g, '/');
    
    // Handle full URLs (external avatars)
    if (normalizedPath.startsWith('http')) {
      return normalizedPath;
    }
    
    // Use Vite proxy for local uploads
    if (normalizedPath.startsWith('uploads/')) {
      return `/${normalizedPath}`;
    }
    
    // Fallback to relative path
    return `/${normalizedPath}`;
  }

  // Generate initials from name
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Return dynamic UI Avatar URL
  return `https://ui-avatars.com/api/?name=${initials}&background=f3f4f6&color=9ca3af&size=200&bold=true&rounded=true`;
};