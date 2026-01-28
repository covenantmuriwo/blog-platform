const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM3Nzc3NzciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPgogIDxwYXRoIGQ9Ik04IDEyYTEgMSAwIDAgMCAyIDBtNCAwYTEgMSAwIDAgMCAyIDBtLTYgNGE0IDQgMCAxIDEgOCAwIi8+Cjwvc3ZnPg==';
// In-memory cache to prevent re-fetching failed avatars
const avatarCache = new Map();
export const getAvatarUrl = (profilePicture, name = 'User') => {
  if (profilePicture && typeof profilePicture === 'string' && profilePicture.trim() !== '') {
    let normalizedPath = profilePicture.replace(/\\/g, '/');
    if (normalizedPath.startsWith('http')) {
      return normalizedPath;
    }
    return `${import.meta.env.VITE_API_URL}/${normalizedPath}`;
  }
  return DEFAULT_AVATAR;
};