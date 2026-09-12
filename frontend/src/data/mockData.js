export const avatarOptions = [
  { id: 'avatar-1', emoji: '😎', name: 'Cool Guy' },
  { id: 'avatar-2', emoji: '🧙', name: 'Wizard' },
  { id: 'avatar-3', emoji: '🥷', name: 'Ninja' },
  { id: 'avatar-4', emoji: '🚀', name: 'Rocket' },
  { id: 'avatar-5', emoji: '🐉', name: 'Dragon' },
  { id: 'avatar-6', emoji: '🧛', name: 'Vampire' },
  { id: 'avatar-7', emoji: '⚔️', name: 'Knight' },
  { id: 'avatar-8', emoji: '🤖', name: 'Robot' },
  { id: 'avatar-9', emoji: '👽', name: 'Alien' },
  { id: 'avatar-10', emoji: '🎭', name: 'Performer' },
];

export const getCategoryColor = (category) => ({
  Study: 'bg-[#8fd9ff]/10 text-[#a8e3ff]',
  Coding: 'bg-[#d4b6ff]/10 text-[#dfc8ff]',
  Learning: 'bg-[#8ff0b6]/10 text-[#aaf5c5]',
  Health: 'bg-[#ff9a7e]/10 text-[#ffb09b]',
  Work: 'bg-[#ffd27a]/10 text-[#ffe2a8]',
  Personal: 'bg-lime/10 text-lime-soft',
}[category] || 'bg-white/10 text-slate-300');

export const getDifficultyColor = (difficulty) => ({
  Easy: 'text-[#8ff0b6]',
  Medium: 'text-[#ffd27a]',
  Hard: 'text-[#ff9a7e]',
}[difficulty] || 'text-muted');

export const getRarityColor = (rarity) => ({
  Common: 'text-slate-400',
  Rare: 'text-[#8fd9ff]',
  Epic: 'text-[#d4b6ff]',
  Elite: 'text-[#ffab91]',
  Legendary: 'text-[#ffd27a]',
  Mythic: 'text-[#ff9a7e]',
}[rarity] || 'text-slate-400');
