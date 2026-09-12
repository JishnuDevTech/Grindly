import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock3, Coins, Flag, LockKeyhole, Play, TimerReset, Zap } from 'lucide-react';
import { getCategoryColor, getDifficultyColor } from '../data/mockData';

export function QuestCard({ quest, blocked = false, onStart, onComplete, index = 0 }) {
  const [remaining, setRemaining] = useState(Math.max(0, quest.requiredSeconds - (quest.elapsedSeconds || 0)));
  const isCompleted = quest.status === 'completed' || quest.completed;
  const isActive = quest.status === 'active';
  useEffect(() => {
    if (!isActive) { setRemaining(Math.max(0, quest.requiredSeconds - (quest.elapsedSeconds || 0))); return undefined; }
    const started = Date.parse(quest.startedAt);
    const update = () => setRemaining(Math.max(0, quest.requiredSeconds - Math.floor((Date.now() - started) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [isActive, quest.startedAt, quest.requiredSeconds, quest.elapsedSeconds]);
  const formatTime = (seconds) => `${Math.floor(seconds / 3600).toString().padStart(2, '0')}:${Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  const progress = quest.requiredSeconds ? Math.min(100, ((quest.requiredSeconds - remaining) / quest.requiredSeconds) * 100) : 0;
  return <motion.article initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .05 }} className={`relative overflow-hidden rounded-3xl border p-5 transition ${isCompleted ? 'border-white/8 bg-white/[.025]' : isActive ? 'border-[#ffd27a]/45 bg-gradient-to-br from-[#2e281a] to-panel shadow-[0_0_34px_rgba(255,210,122,.08)]' : 'border-white/10 bg-panel hover:border-lime/30'}`}>
    <div className={`absolute inset-y-0 left-0 w-1.5 ${isCompleted ? 'bg-[#5bdc96]' : isActive ? 'bg-[#ffd27a]' : blocked ? 'bg-white/15' : 'bg-lime'}`} />
    <div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="mb-2 flex flex-wrap items-center gap-2"><span className={`badge ${getCategoryColor(quest.category)}`}>{quest.category}</span><span className={`font-mono text-[.62rem] ${getDifficultyColor(quest.difficulty)}`}>{quest.difficulty}</span>{quest.priority && <span className="badge badge-accent">{quest.priority} priority</span>}</div><h3 className={`font-display text-xl font-bold ${isCompleted ? 'text-muted line-through' : 'text-white'}`}>{quest.title}</h3><p className="mt-1 text-sm leading-6 text-muted">{quest.description || 'A focused move for your character.'}</p></div>{isCompleted ? <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#5bdc96]/15 text-[#8ff0b6]"><Check size={18} /></div> : isActive ? <span className="badge badge-accent shrink-0">Active quest</span> : blocked ? <span className="badge shrink-0 border border-white/10 bg-white/5 text-muted">Locked</span> : <button onClick={() => onStart(quest.id)} className="flex shrink-0 items-center gap-1.5 rounded-xl bg-lime px-3 py-2 text-xs font-bold text-ink transition hover:bg-lime-soft"><Play size={14} fill="currentColor" /> Start quest</button>}</div>
    {isActive && <div className="mt-5 rounded-2xl border border-[#ffd27a]/30 bg-[#ffd27a]/8 p-4"><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ffd27a]"><TimerReset size={15} /> Focus session</span><span className="font-mono text-base font-bold text-[#ffe2a8]">{remaining > 0 ? formatTime(remaining) : 'QUEST READY'}</span></div><div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10"><motion.div className="h-full rounded-full bg-gradient-to-r from-[#ffd27a] to-[#ff9a7e]" animate={{ width: `${progress}%` }} /></div><div className="mt-3 flex items-center justify-between gap-3"><p className="text-xs text-muted">{remaining > 0 ? 'Stay with this quest until the session is satisfied.' : 'Your time requirement is satisfied. Claim the reward.'}</p><button disabled={remaining > 0} onClick={() => onComplete(quest.id)} className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition ${remaining > 0 ? 'cursor-not-allowed bg-white/10 text-muted' : 'bg-lime text-ink hover:bg-lime-soft'}`}>{remaining > 0 ? 'Keep going' : 'Complete quest'}</button></div></div>}
    {!isActive && !isCompleted && blocked && <div className="mt-5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-muted"><LockKeyhole size={14} /> Finish your current quest first.</div>}
    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/8 pt-4 sm:grid-cols-4"><QuestMeta icon={Clock3} label="Time" value={quest.estimatedTime || `${Math.ceil((quest.requiredSeconds || 0) / 60)} min`} /><QuestMeta icon={Zap} label="XP potential" value={quest.xp ? `+${quest.xp}` : 'Server-set'} tone="text-lime" /><QuestMeta icon={Coins} label="Coin potential" value={quest.coins ? `+${quest.coins}` : 'Server-set'} tone="text-[#ffd27a]" /><QuestMeta icon={Flag} label="Status" value={isCompleted ? 'Cleared' : isActive ? 'Running' : blocked ? 'Waiting' : 'Available'} /></div>
  </motion.article>;
}

function QuestMeta({ icon: Icon, label, value, tone = 'text-muted' }) { return <div className="flex min-w-0 items-center gap-2"><Icon size={14} className={tone} /><div className="min-w-0"><p className="truncate text-[.6rem] uppercase tracking-wider text-muted">{label}</p><p className={`truncate text-xs font-bold ${tone}`}>{value}</p></div></div>; }
