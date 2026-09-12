import { motion } from 'framer-motion';
import { Check, Lock, Sparkles, Trophy, Zap } from 'lucide-react';
import { XPBar } from '../components/XPBar';

const milestones = [
  { level: 1, label: 'First signal', detail: 'Complete your first focused session', icon: Zap, tone: 'lime' },
  { level: 3, label: 'Momentum badge', detail: 'Build a three-day streak', icon: Sparkles, tone: 'blue' },
  { level: 5, label: 'Profile theme', detail: 'Unlock the Neon Grove theme', icon: Trophy, tone: 'violet' },
  { level: 8, label: 'Elite nameplate', detail: 'Show your consistency in every room', icon: Sparkles, tone: 'amber' },
  { level: 12, label: 'Mythic display', detail: 'A long-term trophy for the long game', icon: Trophy, tone: 'rose' },
];

export default function Progression({ user }) {
  return <div className="min-h-screen bg-ink"><div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
    <header className="border-b border-white/8 pb-8"><p className="eyebrow text-lime">The journey</p><h1 className="mt-2 font-display text-4xl font-extrabold">See your next unlock.</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted">A clear progression track for the work you choose to repeat. Your current level is the marker; every step ahead is earned.</p></header>
    <section className="card-lg mt-8 border-lime/20 bg-gradient-to-br from-[#18281b] to-panel"><div className="flex items-center justify-between gap-4"><div><p className="eyebrow">Current position</p><h2 className="mt-2 font-display text-2xl font-extrabold">Level {user.level} · Pathfinder</h2></div><span className="rounded-full border border-lime/25 bg-lime/10 px-3 py-1 text-xs font-bold text-lime-soft">{user.experience}/{user.nextLevelExp} XP</span></div><div className="mt-5"><XPBar current={user.experience} max={user.nextLevelExp} /></div></section>
    <div className="relative mt-10 pl-8 sm:pl-12"><div className="absolute bottom-5 left-3 top-5 w-px bg-gradient-to-b from-lime via-[#8fd9ff] to-white/10 sm:left-5" />{milestones.map((milestone, index) => { const unlocked = user.level >= milestone.level; const Icon = milestone.icon; return <motion.article key={milestone.level} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * .08 }} className="relative mb-5 flex gap-4"><div className={`absolute -left-8 grid h-6 w-6 place-items-center rounded-full border-2 sm:-left-9 ${unlocked ? 'border-lime bg-lime text-ink' : 'border-white/20 bg-panel text-muted'}`}>{unlocked ? <Check size={13} strokeWidth={3} /> : <Lock size={11} />}</div><div className={`flex min-w-0 flex-1 items-center gap-4 rounded-2xl border p-4 transition ${unlocked ? 'border-lime/25 bg-lime/5' : 'border-white/10 bg-panel/70 opacity-75'}`}><div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${unlocked ? 'bg-lime/15 text-lime' : 'bg-white/5 text-muted'}`}><Icon size={21} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="eyebrow">Level {milestone.level}</span>{unlocked && <span className="badge badge-success">Unlocked</span>}</div><h3 className="mt-1 font-display text-base font-bold">{milestone.label}</h3><p className="mt-1 text-xs leading-5 text-muted">{milestone.detail}</p></div><span className="hidden text-xs font-bold text-muted sm:block">{unlocked ? 'Claimed' : `${milestone.level - user.level} levels away`}</span></div></motion.article>; })}</div>
  </div></div>;
}
