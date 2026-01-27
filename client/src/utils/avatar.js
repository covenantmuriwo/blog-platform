// client/src/utils/avatar.js
export const getAvatarUrl = (profilePicture, name = 'User') => {
  console.log('DEBUG: profilePicture input:', profilePicture);
  console.log('DEBUG: VITE_API_URL:', import.meta.env.VITE_API_URL);
  
  // If user has uploaded a profile picture
  if (profilePicture && typeof profilePicture === 'string' && profilePicture.trim() !== '') {
    // Normalize Windows paths
    let normalizedPath = profilePicture.replace(/\\/g, '/');
    console.log('DEBUG: normalizedPath:', normalizedPath);
    
    // Handle full URLs (external avatars, Cloudinary, etc.)
    if (normalizedPath.startsWith('http')) {
      console.log('DEBUG: returning full URL');
      return normalizedPath;
    }
    
    // Handle local uploads - use API URL
    const finalUrl = `${import.meta.env.VITE_API_URL}/${normalizedPath}`;
    console.log('DEBUG: returning final URL:', finalUrl);
    return finalUrl;
  }

  // Generate initials from name
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Return dynamic UI Avatar URL - NO EXTRA SPACES
  return `https://ui-avatars.com/api/?name=${initials}&background=f3f4f6&color=9ca3af&size=200&bold=true&rounded=true`;
};