import { useState } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, Lock, Medal, Sparkles, Trophy } from 'lucide-react';
import { achievementCatalog } from '../data/mockData';

const categories = ['All', 'Medals', 'Quest achievements', 'Streaks', 'Milestones', 'Secret'];
const rarityClasses = {
  Common: 'from-slate-500/45 to-slate-950 border-slate-300/35 text-slate-200',
  Rare: 'from-sky-500/45 to-slate-950 border-sky-200/45 text-sky-100',
  Epic: 'from-violet-500/50 to-slate-950 border-violet-200/50 text-violet-100',
  Elite: 'from-rose-500/50 to-slate-950 border-rose-200/55 text-rose-100',
  Legendary: 'from-amber-400/60 to-slate-950 border-amber-200/65 text-amber-100',
  Mythic: 'from-fuchsia-500/70 via-indigo-900 to-slate-950 border-fuchsia-200/75 text-fuchsia-100',
};

export default function Achievements({ user }) {
  const [category, setCategory] = useState('All');
  const ownedIds = new Set((user.achievements || []).map((achievement) => achievement.id));
  const visible = achievementCatalog.filter((achievement) => category === 'All' || achievement.category === category);
  return <div className="min-h-screen bg-ink"><div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
    <header className="flex flex-col justify-between gap-5 border-b border-white/8 pb-8 sm:flex-row sm:items-end"><div><p className="eyebrow text-lime">Collection · medal case</p><h1 className="mt-2 font-display text-4xl font-extrabold">Earn your marks.</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted">Every medal records a way you showed up. Fill the case through quests, streaks, levels, and discoveries.</p></div><div className="flex items-center gap-3 text-xs text-muted"><Medal size={18} className="text-[#ffd27a]" /> {ownedIds.size} / {achievementCatalog.length} discovered</div></header>
    <div className="mt-7 flex gap-2 overflow-x-auto pb-1">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition ${category === item ? 'border-lime/40 bg-lime/10 text-lime-soft' : 'border-white/10 bg-white/[.03] text-muted hover:bg-white/[.07]'}`}>{item}</button>)}</div>
    <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visible.map((achievement, index) => <Achievement key={achievement.id} achievement={achievement} index={index} owned={ownedIds.has(achievement.id)} user={user} />)}</div>
  </div></div>;
}

function Achievement({ achievement, index, owned, user }) {
  const progress = achievement.progress(user);
  const complete = owned || progress >= achievement.goal;
  const Icon = achievement.category === 'Medals' ? Medal : achievement.category === 'Streaks' ? Sparkles : achievement.category === 'Secret' ? Lock : achievement.category === 'Milestones' ? Trophy : BadgeCheck;
  return <motion.article initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .05 }} className={`overflow-hidden rounded-3xl border bg-gradient-to-br ${rarityClasses[achievement.rarity] || rarityClasses.Common} ${complete ? '' : 'opacity-75'}`}><div className="relative flex h-40 items-center justify-center overflow-hidden"><div className={`medal-emblem ${complete ? '' : 'medal-emblem-locked'}`}><Icon size={38} strokeWidth={1.4} /></div><span className="absolute bottom-3 left-3 rounded-full bg-black/25 px-2 py-1 font-mono text-[.58rem] tracking-widest">{complete ? achievement.rarity.toUpperCase() : 'LOCKED'}</span>{achievement.secret && !complete && <span className="absolute right-3 top-3 rounded-full bg-black/25 px-2 py-1 text-[.58rem]">SECRET</span>}</div><div className="border-t border-white/10 bg-black/15 p-4"><p className="font-display font-bold">{achievement.secret && !complete ? 'Hidden achievement' : achievement.name}</p><p className="mt-1 text-xs leading-5 text-white/65">{achievement.secret && !complete ? 'A discovery waits beyond the visible path.' : achievement.detail}</p>{!complete && !achievement.secret && <><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/20"><div className="h-full rounded-full bg-white/60" style={{ width: `${Math.round((progress / achievement.goal) * 100)}%` }} /></div><p className="mt-2 text-[.62rem] text-white/60">{progress} / {achievement.goal} progress</p></>}{complete && <p className="mt-4 flex items-center gap-2 text-xs font-bold text-[#8ff0b6]"><BadgeCheck size={14} /> Collected</p>}</div></motion.article>;
}
