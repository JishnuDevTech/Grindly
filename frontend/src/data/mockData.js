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

export const achievementCatalog = [
  { id: 'first-quest', name: 'First Signal', category: 'Medals', rarity: 'Common', detail: 'Complete your first quest.', progress: (user) => Math.min(user.completedQuestCount || 0, 1), goal: 1 },
  { id: 'ten-quests', name: 'Quest Runner', category: 'Medals', rarity: 'Rare', detail: 'Complete 10 quests.', progress: (user) => Math.min(user.completedQuestCount || 0, 10), goal: 10 },
  { id: 'fifty-quests', name: 'Seasoned Grinder', category: 'Medals', rarity: 'Epic', detail: 'Complete 50 quests.', progress: (user) => Math.min(user.completedQuestCount || 0, 50), goal: 50 },
  { id: 'seven-streak', name: 'Seven-Day Signal', category: 'Streaks', rarity: 'Rare', detail: 'Maintain a 7 day streak.', progress: (user) => Math.min(user.streak || 0, 7), goal: 7 },
  { id: 'thirty-streak', name: 'Unbroken', category: 'Streaks', rarity: 'Epic', detail: 'Maintain a 30 day streak.', progress: (user) => Math.min(user.streak || 0, 30), goal: 30 },
  { id: 'level-ten', name: 'Double Digits', category: 'Milestones', rarity: 'Elite', detail: 'Reach level 10.', progress: (user) => Math.min(user.level || 0, 10), goal: 10 },
  { id: 'level-twenty-five', name: 'Long Game', category: 'Milestones', rarity: 'Legendary', detail: 'Reach level 25.', progress: (user) => Math.min(user.level || 0, 25), goal: 25 },
  { id: 'study-path', name: 'Scholar Path', category: 'Quest achievements', rarity: 'Rare', detail: 'Complete 10 Study quests.', progress: (user) => Math.min(user.categoryCounts?.Study || 0, 10), goal: 10 },
  { id: 'coding-path', name: 'Forge Path', category: 'Quest achievements', rarity: 'Rare', detail: 'Complete 10 Coding quests.', progress: (user) => Math.min(user.categoryCounts?.Coding || 0, 10), goal: 10 },
  { id: 'secret-return', name: 'The Return', category: 'Secret', rarity: 'Mythic', detail: 'Return after a long absence and start again.', secret: true, progress: () => 0, goal: 1 },
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
