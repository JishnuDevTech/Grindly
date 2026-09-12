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

const rewardRarities = ['Common', 'Rare', 'Epic', 'Elite', 'Legendary', 'Mythic'];
const rewardPrice = { Common: 180, Rare: 360, Epic: 720, Elite: 1200, Legendary: 2200, Mythic: 4200 };
const reward = (category, names, descriptions) => names.map((name, index) => {
  const rarity = rewardRarities[Math.min(rewardRarities.length - 1, Math.floor(index / 4))];
  return {
    id: `vault-${category.toLowerCase().replaceAll(' ', '-')}-${index + 1}`,
    name,
    category,
    rarity,
    detail: descriptions[index],
    price: rewardPrice[rarity],
    catalogOnly: true,
    unlocksAt: rarity === 'Common' ? 'Unlock in Chest' : `Unlock at Level ${8 + index * 2}`,
  };
});

export const shopCatalog = [
  ...reward('Profile Frame', [
    'Mosslight Ring', 'Signal Border', 'Dawn Circuit', 'Tideglass Frame', 'Astral Relay',
    'Emberline Halo', 'Prism Bastion', 'Moonforge Frame', 'Verdant Crown', 'Solaris Edge',
    'Starlit Archive', 'Obsidian Bloom', 'Aurora Bastion', 'Chrono Laurel', 'Eclipse Array',
    'Celestial Gate', 'Voidgarden Frame', 'Nova Reliquary', 'Worldtree Halo', 'Singularity Frame',
  ], [
    'A quiet lime signal for your first loadout.', 'Clean geometry for consistent grinders.', 'A warm horizon for early momentum.', 'Glass-blue light caught at the edge of focus.', 'A ring mapped from distant constellations.',
    'A red-orange trace left by hard quests.', 'Refraction armor for a player who keeps climbing.', 'Forged under a violet moon.', 'A living border for patient builders.', 'Gold light for a new chapter.',
    'A frame built from saved sessions.', 'Dark petals with a dangerous glow.', 'Aurora light for impossible days.', 'A precision ring that bends time.', 'A black-gold eclipse with a sharp edge.',
    'A gate reserved for long-term players.', 'A garden growing in the dark.', 'A frame that hums like a starship.', 'Ancient roots, future progress.', 'The rarest border in the vault.',
  ]),
  ...reward('Nameplate', [
    'First Light Plate', 'Focus Runner', 'Quiet Builder', 'Deep Work Unit', 'Quest Cartographer',
    'Momentum Protocol', 'Night Shift Plate', 'Brightmind Array', 'Iron Routine', 'Signal Keeper',
    'Long Game Plate', 'Summit Caller', 'Archive Walker', 'Limit Breaker', 'Solar Rank',
    'Crown of Return', 'Legend Circuit', 'Mythmaker Plate', 'Beyond Routine', 'The Unwritten',
  ], [
    'Soft light, strong start.', 'A plate for people who move before they talk.', 'Minimal identity for quiet consistency.', 'Your name, sharpened by focus.', 'For players who know the whole map.',
    'A moving status line for a moving player.', 'Forged for late-night sessions.', 'Bright lettering with a calm pulse.', 'No excuses, just another run.', 'The player who keeps the signal alive.',
    'Proof that patience compounds.', 'A title that points uphill.', 'Every completed quest becomes history.', 'For the day you stop negotiating with yourself.', 'Gold status for a solar streak.',
    'Return is a skill. Wear it.', 'A legendary call sign.', 'Make your own folklore.', 'For players who outgrow the checklist.', 'A blank plate for a name people remember.',
  ]),
  ...reward('Theme', [
    'Mossline Terminal', 'Blue Hour Desk', 'Cinder Study', 'Violet Focusroom', 'Sunset Relay',
    'Deep Ocean Mode', 'Rose Quartz Lab', 'Night Garden', 'Copper Horizon', 'Lunar Workshop',
    'Aurora Command', 'Ember Observatory', 'Prism Archive', 'Blackglass Atelier', 'Golden Hour OS',
    'Eventide Citadel', 'Nebula House', 'Worldtree Sanctum', 'Eclipse Command', 'Singularity Room',
  ], [
    'A soft green home for your daily quests.', 'Cool light for calm focus.', 'Warm shadows for serious work.', 'Violet contrast for deep sessions.', 'A bright theme for fresh momentum.',
    'Blue depth for long-range goals.', 'A gentle rose-lit study.', 'Quiet leaves, darker nights.', 'Copper light and warm resolve.', 'A moonlit workshop for patient builders.',
    'Aurora gradients for high performers.', 'A red-gold room for decisive days.', 'Every panel catches a different color.', 'A blackglass interface with no distractions.', 'A polished reward for a bright streak.',
    'Stone, gold, and endgame energy.', 'Your personal room among the stars.', 'Ancient green, modern ambition.', 'A rare theme that feels like a final boss.', 'The vault’s most impossible room.',
  ]),
  ...reward('XP Effect', [
    'Lime Burst', 'Clean Gain', 'Pulse Count', 'Orbit Pop', 'Prism Rise',
    'Ember Cascade', 'Starfall XP', 'Critical Focus', 'Aurora Numbers', 'Gold Cascade',
    'Chrono Bloom', 'Legend Spark', 'Solar Flare XP', 'Void Ripple', 'Crown Surge',
    'Mythic Constellation', 'Infinite Climb', 'Worldtree Gain', 'Eclipse Break', 'Singularity Level',
  ], [
    'A crisp +XP flash for every first win.', 'Minimal numbers, maximum satisfaction.', 'A pulse that makes progress visible.', 'XP that circles your avatar once.', 'Color shards rise with your reward.',
    'Hot particles for hard-earned gains.', 'Numbers fall like tiny stars.', 'A bright critical-hit burst.', 'Aurora trails behind every level.', 'Gold sparks for milestone rewards.',
    'Time folds around your XP.', 'A rare flash reserved for elite runs.', 'A solar flare when the bar moves.', 'A dark ripple with a bright center.', 'A crown-shaped reward burst.',
    'A full constellation assembles at completion.', 'The number keeps climbing after the quest ends.', 'Roots of light connect your progress.', 'A black-gold break in the interface.', 'The reward moment becomes a tiny universe.',
  ]),
  ...reward('Avatar Effect', [
    'Soft Signal', 'Orbit Dust', 'Green Static', 'Blue Halo', 'Rose Current',
    'Ember Wings', 'Prism Drift', 'Moonlit Sparks', 'Solar Crown', 'Aurora Veil',
    'Glass Comet', 'Violet Familiar', 'Gold Afterimage', 'Nightfire Mantle', 'Star Engine',
    'Eclipse Aura', 'Nebula Skin', 'Worldtree Pulse', 'Legendary Orbit', 'Mythic Ascension',
  ], [
    'A subtle glow for a new character.', 'Tiny particles orbit your avatar.', 'Green static from focused sessions.', 'A cool halo for calm progress.', 'A warm current follows your movement.',
    'Flame-shaped energy behind your avatar.', 'Your silhouette refracts into color.', 'Small sparks like a quiet night sky.', 'A solar ring for serious momentum.', 'A soft aurora moves with you.',
    'A comet tail for fast progress.', 'A violet companion light.', 'A gold afterimage marks every move.', 'Dark fire for the player who returns.', 'A star engine at the center of your identity.',
    'Light and shadow orbit in balance.', 'A whole nebula lives behind the avatar.', 'Roots pulse when you complete a quest.', 'A legendary ring with animated depth.', 'The final avatar treatment in the vault.',
  ]),
  ...reward('Badge', [
    'The Starter Mark', 'Daily Signal', 'Clean Slate', 'Questbound', 'Focus Certified',
    'Streaksmith', 'Deep Work', 'Mapmaker', 'Iron Will', 'Brightmind',
    'Return Specialist', 'Summit Badge', 'Vault Keeper', 'Limit Break', 'Golden Path',
    'Legend Builder', 'Mythic Intent', 'Unbroken Core', 'Worldmaker', 'Beyond Possible',
  ], [
    'The first mark every character can earn.', 'A badge for showing up today.', 'Begin again, but better.', 'You chose the quest path.', 'Proof of a focused session.',
    'Forged through repeat days.', 'For work that needs uninterrupted time.', 'You make progress visible.', 'A hard badge for hard days.', 'Learning made visible.',
    'Returning is its own achievement.', 'Keep climbing.', 'A keeper of rare identity items.', 'You exceeded your old limit.', 'A gold path through the noise.',
    'Build what future-you will inherit.', 'Intent strong enough to change your route.', 'The center holds.', 'A player who changes their world.', 'For the impossible you made ordinary.',
  ]),
  ...reward('Trophy Display', [
    'First Run Plinth', 'Signal Totem', 'Focus Obelisk', 'Glass Trophy', 'Cinder Monument',
    'Streak Pillar', 'Prism Reliquary', 'Moonstone Stand', 'Gold Horizon', 'The Long Table',
    'Archive Beacon', 'Summit Monument', 'Aurora Spire', 'Chrono Trophy', 'Legend Keep',
    'Eclipse Monument', 'Nebula Pillar', 'Worldtree Statue', 'Mythic Reliquary', 'The Grindly Crown',
  ], [
    'A small place for a first win.', 'A beacon for daily momentum.', 'Tall, quiet, and earned.', 'Your progress, held in glass.', 'Warm stone for difficult work.',
    'A pillar built one day at a time.', 'Color trapped inside a trophy.', 'Cool light for patient players.', 'A horizon you can display.', 'A trophy table for the long game.',
    'Your completed quests become a signal.', 'A monument to choosing the climb.', 'A rare spire for bright streaks.', 'Time itself becomes the display.', 'A keep for legendary progress.',
    'Black-gold geometry for endgame players.', 'A trophy with a sky inside it.', 'Ancient roots, modern discipline.', 'A vault within the vault.', 'The centerpiece of a finished character.',
  ]),
];

const generatedAchievements = (category, names, detailPrefix, rarityOffset = 0) => names.map((name, index) => {
  const goal = category === 'Streaks' ? (index + 1) * 3 : category === 'Milestones' ? (index + 1) * 5 : (index + 1) * 5;
  const rarity = rewardRarities[Math.min(5, Math.floor((index + rarityOffset) / 4))];
  const progress = category === 'Streaks'
    ? (user) => Math.min(user.streak || 0, goal)
    : category === 'Milestones'
      ? (user) => Math.min(user.level || 0, goal)
      : (user) => Math.min(user.completedQuestCount || 0, goal);
  return { id: `${category.toLowerCase().replaceAll(' ', '-')}-${index + 1}`, name, category, rarity, detail: `${detailPrefix} ${goal}.`, progress, goal };
});

export const expandedAchievementCatalog = [
  ...generatedAchievements('Medals', ['Signal Found', 'First Ten', 'Quest Collector', 'Momentum Made', 'Reliable Hand', 'Daily Operator', 'Focus Veteran', 'Pathfinder', 'Deep Runner', 'Routine Architect', 'Questsmith', 'The Finisher', 'Iron Calendar', 'Quiet Champion', 'Vault Regular', 'Long Horizon', 'Legend in Progress', 'Mythic Intent', 'The Constant', 'Grindly Standard'], 'Complete quests to earn this mark at', 0),
  ...generatedAchievements('Quest achievements', ['Study Spark', 'Code Current', 'Health Protocol', 'Work Mode', 'Learning Loop', 'Personal Forge', 'Study Streak', 'Code Cartographer', 'Health Builder', 'Workhorse', 'Knowledge Keeper', 'Project Pilot', 'Scholar Engine', 'Systems Thinker', 'Body and Mind', 'Career Climber', 'Mastery Route', 'The Generalist', 'The Specialist', 'Full Spectrum'], 'Complete this many quests on your path:', 1),
  ...generatedAchievements('Streaks', ['Three-Day Flame', 'Week Signal', 'Fortnight Fire', 'Twenty-One Pulse', 'Month Unbroken', 'Six-Week Current', 'Two-Month Run', 'Season Keeper', 'Century Spark', 'Quartermaster', 'Half-Year Heat', 'Long Summer', 'Year Signal', 'Year and a Day', 'Evergreen', 'Unbroken Orbit', 'Solar Streak', 'Legendary Return', 'Mythic Flame', 'No Zero Days'], 'Maintain a streak of', 2),
  ...generatedAchievements('Milestones', ['Level Five', 'Double Digits', 'First Ascension', 'Long Game', 'Silver Summit', 'Vault Access', 'Elite Threshold', 'Golden Level', 'Legend Route', 'The Climb', 'Quarter Century', 'Halfway There', 'Endgame Path', 'High Orbit', 'Master Level', 'Mythic Gate', 'Beyond Fifty', 'Century Character', 'World Class', 'The Final Horizon'], 'Reach level', 3),
  ...['The Vanishing Point', 'After Midnight', 'Second Wind', 'Chest Whisperer', 'Hidden Frequency', 'No Map Needed', 'The Long Way Home', 'Ghost Protocol', 'Unlisted Signal', 'Beyond the Screen'].map((name, index) => ({ id: `secret-${index + 1}`, name, category: 'Secret', rarity: index > 6 ? 'Mythic' : 'Legendary', detail: 'A hidden discovery for players who experiment.', secret: true, progress: () => 0, goal: 1 })),
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
