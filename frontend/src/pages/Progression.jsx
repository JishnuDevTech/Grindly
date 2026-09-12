import { motion } from 'framer-motion';
import { Check, Crown, Lock, Sparkles, Target, Trophy, Zap } from 'lucide-react';
import { XPBar } from '../components/XPBar';

const milestones = [
  { level: 1, label: 'First signal', detail: 'Complete your first focused session', icon: Target, rarity: 'Common' },
  { level: 3, label: 'Momentum badge', detail: 'Build a three-day streak', icon: Sparkles, rarity: 'Rare' },
  { level: 5, label: 'Neon Grove frame', detail: 'A profile frame for your growing identity', icon: Sparkles, rarity: 'Rare' },
  { level: 8, label: 'Orbit XP effect', detail: 'Make every reward moment visible', icon: Zap, rarity: 'Epic' },
  { level: 10, label: 'Elite nameplate', detail: 'Show your consistency in every room', icon: Trophy, rarity: 'Elite' },
  { level: 15, label: 'Epic trophy display', detail: 'A permanent marker of the long game', icon: Trophy, rarity: 'Epic' },
  { level: 25, label: 'Legendary loadout', detail: 'A complete cosmetic set for your character', icon: Crown, rarity: 'Legendary' },
  { level: 50, label: 'Mythic status', detail: 'The rarest Grindly reward: earned status', icon: Crown, rarity: 'Mythic' },
];

export default function Progression({ user }) {
  const currentIndex = Math.max(0, milestones.findIndex((milestone) => milestone.level > user.level) - 1);
  return <div className="min-h-screen bg-ink"><div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
    <header className="border-b border-white/8 pb-8"><p className="eyebrow text-lime">Character journey</p><h1 className="mt-2 font-display text-4xl font-extrabold">Your next chapter is visible.</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted">Follow the path from focused session to earned status. You are building a character, not clearing a dashboard.</p></header>
    <section className="card-lg mt-8 border-lime/25 bg-gradient-to-br from-[#18281b] to-panel"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow text-lime">You are here</p><h2 className="mt-2 font-display text-3xl font-extrabold">LEVEL {user.level}</h2><p className="mt-1 text-sm text-muted">Pathfinder · {user.streak} day streak</p></div><span className="font-mono text-sm font-bold text-lime">{user.experience.toLocaleString()} / {user.nextLevelExp.toLocaleString()} XP</span></div><div className="mt-6"><XPBar current={user.experience} max={user.nextLevelExp} /></div><p className="mt-3 text-xs text-muted">Next level: {user.level + 1} · keep one quest moving to advance</p></section>
    <div className="relative mt-10"><div className="absolute bottom-8 left-5 top-8 w-1 rounded-full bg-gradient-to-b from-lime via-[#8fd9ff] to-white/10" />{milestones.map((milestone, index) => { const unlocked = user.level >= milestone.level; const current = index === currentIndex + 1 && !unlocked; const Icon = milestone.icon; return <motion.article key={milestone.level} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * .06 }} className={`relative mb-4 pl-14 ${current ? 'scale-[1.02]' : ''}`}><div className={`absolute left-0 top-5 grid h-11 w-11 place-items-center rounded-2xl border-2 ${unlocked ? 'border-lime bg-lime text-ink' : current ? 'border-[#ffd27a] bg-[#ffd27a]/20 text-[#ffd27a]' : 'border-white/20 bg-panel text-muted'}`}>{unlocked ? <Check size={17} strokeWidth={3} /> : current ? <Target size={18} /> : <Lock size={15} />}</div><div className={`flex items-center gap-4 rounded-2xl border p-4 ${unlocked ? 'border-lime/25 bg-lime/5' : current ? 'border-[#ffd27a]/40 bg-[#ffd27a]/8' : 'border-white/10 bg-panel/70 opacity-70'}`}><div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${unlocked ? 'bg-lime/15 text-lime' : 'bg-white/5 text-muted'}`}><Icon size={22} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="eyebrow">Level {milestone.level}</span><span className="font-mono text-[.6rem] text-muted">{milestone.rarity}</span>{current && <span className="badge badge-accent">Next unlock</span>}</div><h3 className="mt-1 font-display text-base font-bold">{milestone.label}</h3><p className="mt-1 text-xs leading-5 text-muted">{milestone.detail}</p></div><span className="hidden text-xs font-bold text-muted sm:block">{unlocked ? 'Unlocked' : `${Math.max(1, milestone.level - user.level)} levels`}</span></div></motion.article>; })}</div>
  </div></div>;
}
