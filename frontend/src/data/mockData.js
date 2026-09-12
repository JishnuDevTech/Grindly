export const avatarOptions = [
  { id: 'avatar-1', name: 'Signal', tone: 'lime' },
  { id: 'avatar-2', name: 'Orbit', tone: 'blue' },
  { id: 'avatar-3', name: 'Forge', tone: 'violet' },
  { id: 'avatar-4', name: 'Pulse', tone: 'amber' },
  { id: 'avatar-5', name: 'Bloom', tone: 'rose' },
  { id: 'avatar-6', name: 'Nova', tone: 'cyan' },
  { id: 'avatar-7', name: 'Summit', tone: 'orange' },
  { id: 'avatar-8', name: 'Core', tone: 'green' },
  { id: 'avatar-9', name: 'Drift', tone: 'indigo' },
  { id: 'avatar-10', name: 'Echo', tone: 'pink' },
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
