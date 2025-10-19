interface DemoPlayerCardProps {
  name: string;
  avatar: string;
  compact?: boolean;
  type: 'player1' | 'player2';
}

// Helper to normalize avatar path (extract filename if it's a full URL)
const normalizeAvatarForDisplay = (avatar: string): string => {
  if (!avatar) return '/images/avatar1.png';
  
  // If it's already a proper path, return as is
  if (avatar.startsWith('/uploads/')) return avatar;
  if (avatar.startsWith('/images/')) return avatar;
  
  // If it's a full URL or complex path
  if (avatar.includes('/')) {
    const parts = avatar.split('/');
    const filename = parts[parts.length - 1];
    // Check if it looks like an avatar file (avatar1-4.png) or just return /uploads/
    if (filename.includes('avatar')) {
      return `/images/${filename}`;
    }
    // Otherwise treat as upload
    return `/uploads/${filename}`;
  }
  
  // If it's just a filename, check if it's default avatar or user upload
  if (avatar.includes('avatar')) {
    return `/images/${avatar}`;
  }
  
  // Default to uploads
  return `/uploads/${avatar}`;
};

export const renderDemoPlayerCard = ({ name, avatar, compact = false, type }: DemoPlayerCardProps): string => {
  const isPlayer1 = type === 'player1';
  const avatarPath = normalizeAvatarForDisplay(avatar);
  if (compact) {
    return `
      <div class="flex-1 max-w-[140px] sm:max-w-[160px]" data-player-card="${type}">
        <div class="p-2 sm:p-3 bg-gray-900 rounded-[15px] sm:rounded-[20px] shadow-[2px_2px_10px_0px_rgba(0,240,255,0.20)]
                    outline outline-2 outline-offset-[-2px] ${isPlayer1 ? 'outline-teal-600' : 'outline-cyan-950'} flex flex-col gap-2">
          <div class="flex flex-col items-center">
            <div class="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full shadow-[0px_2px_8px_rgba(0,240,255,0.20)]
                        ${isPlayer1 ? 'bg-gradient-to-br from-cyan-400 to-blue-600' : 'bg-gradient-to-br from-yellow-400 to-orange-600'}
                        flex items-center justify-center select-none overflow-hidden">
              <img src="${avatarPath}" class="w-full h-full object-cover object-center" alt="${name}" onerror="this.src='/images/avatar1.png'" />
            </div>
            <div class="mt-2 flex flex-col gap-1 w-full">
              <div class="px-2 py-1 ${isPlayer1 ? 'bg-teal-600 text-white' : 'bg-teal-600 text-white'} rounded-md text-xs sm:text-sm font-semibold text-center truncate" title="${name}">
                ${name}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  return `
    <div class="p-3 bg-gray-900 rounded-[20px] shadow-[2px_2px_10px_0px_rgba(0,240,255,0.20)]
                outline outline-2 outline-offset-[-2px] ${isPlayer1 ? 'outline-teal-600' : 'outline-cyan-950'} flex flex-col gap-2.5"
         data-player-card="${type}">
      <div class="flex flex-col ${isPlayer1 ? 'items-start' : 'items-end'}">
        <div class="w-32 h-32 xl:w-36 xl:h-36 rounded-full shadow-[0px_2px_8px_rgba(0,240,255,0.20)]
                    ${isPlayer1 ? 'bg-gradient-to-br from-cyan-400 to-blue-600' : 'bg-gradient-to-br from-yellow-400 to-orange-600'}
                    flex items-center justify-center select-none overflow-hidden">
          <img src="${avatarPath}" class="w-full h-full object-cover object-center" alt="${name}" onerror="this.src='/images/avatar1.png'" />
        </div>
        <div class="mt-2 flex flex-col gap-2 ${isPlayer1 ? 'items-start' : 'items-end'}">
          <div class="px-3 py-2 bg-teal-600 rounded-lg text-white text-sm xl:text-base font-semibold truncate" title="${name}">
            ${name}
          </div>
        </div>
      </div>
    </div>
  `;
};
