// Always generate a reliable, remote avatar URL
export const getAvatarUrl = (profilePicture, name = 'User') => {
  // Extract initials safely
  const initials = name
    .split(' ')
    .map(part => part[0]?.toUpperCase())
    .join('')
    .substring(0, 2)
    .padEnd(2, 'X'); // Ensures 2 chars (e.g., "A" → "AX")

  // Use ui-avatars.com (free, no auth, always works)
  return `https://ui-avatars.com/api/?name=${initials}&background=f3f4f6&color=9ca3af&size=200&bold=true&rounded=true`;
};