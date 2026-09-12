import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock3, Coins, Flag, Play, TimerReset, Zap } from 'lucide-react';
import { getCategoryColor, getDifficultyColor } from '../data/mockData';

export function QuestCard({ quest, blocked = false, onStart, onComplete, index = 0 }) {
  const [remaining, setRemaining] = useState(Math.max(0, quest.requiredSeconds - (quest.elapsedSeconds || 0)));
  const isCompleted = quest.status === 'completed' || quest.completed;
  const isActive = quest.status === 'active';

  useEffect(() => {
    if (!isActive) {
      setRemaining(Math.max(0, quest.requiredSeconds - (quest.elapsedSeconds || 0)));
      return undefined;
    }
    const started = Date.parse(quest.startedAt);
    const update = () => setRemaining(Math.max(0, quest.requiredSeconds - Math.floor((Date.now() - started) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [isActive, quest.startedAt, quest.requiredSeconds, quest.elapsedSeconds]);

  const formatTime = (seconds) => `${Math.floor(seconds / 3600).toString().padStart(2, '0')}:${Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  const progress = quest.requiredSeconds ? Math.min(100, ((quest.requiredSeconds - remaining) / quest.requiredSeconds) * 100) : 0;

  return <motion.article initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .05 }} className={`group relative overflow-hidden rounded-2xl border p-5 transition ${isCompleted ? 'border-white/8 bg-white/[.025]' : 'border-white/10 bg-panel hover:border-lime/30 hover:bg-[#151d1b]'}`}>
    <div className={`absolute inset-y-0 left-0 w-1 ${isCompleted ? 'bg-[#5bdc96]' : isActive ? 'bg-[#ffd27a]' : 'bg-lime'}`} />
    <div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="mb-2 flex flex-wrap items-center gap-2"><span className={`badge ${getCategoryColor(quest.category)}`}>{quest.category}</span><span className={`font-mono text-[.62rem] ${getDifficultyColor(quest.difficulty)}`}>{quest.difficulty}</span></div><h3 className={`font-display text-lg font-bold ${isCompleted ? 'text-muted line-through' : 'text-white'}`}>{quest.title}</h3><p className="mt-1 text-sm leading-6 text-muted">{quest.description}</p></div>{isCompleted ? <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#5bdc96]/15 text-[#8ff0b6]"><Check size={17} /></div> : isActive ? <button disabled={remaining > 0} onClick={() => onComplete(quest.id)} className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition ${remaining > 0 ? 'cursor-not-allowed bg-white/10 text-muted' : 'bg-lime text-ink hover:bg-lime-soft'}`} aria-label="Confirm quest completion"><Check size={17} strokeWidth={3} /></button> : blocked ? <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[.62rem] font-bold text-muted"><TimerReset size={13} /> Finish current</div> : <button onClick={() => onStart(quest.id)} className="flex shrink-0 items-center gap-1.5 rounded-xl bg-lime px-3 py-2 text-xs font-bold text-ink transition hover:bg-lime-soft"><Play size={14} fill="currentColor" /> Start</button>}</div>
    {isActive && <div className="mt-5 rounded-xl border border-[#ffd27a]/20 bg-[#ffd27a]/5 p-3"><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-bold text-[#ffd27a]"><TimerReset size={14} /> Focus session active</span><span className="font-mono text-xs text-[#ffe2a8]">{remaining > 0 ? `${formatTime(remaining)} left` : 'Ready to confirm'}</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><motion.div className="h-full rounded-full bg-[#ffd27a]" animate={{ width: `${progress}%` }} /></div><p className="mt-2 text-[.65rem] text-muted">Completion unlocks only after the required time. Rewards are calculated by the server.</p></div>}
    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/8 pt-4 text-xs text-muted"><span className="flex items-center gap-1.5"><Clock3 size={14} /> {quest.estimatedTime}</span><span className="flex items-center gap-1.5 text-lime"><Zap size={14} /> server reward</span><span className="flex items-center gap-1.5 text-[#ffd27a]"><Coins size={14} /> earned on completion</span>{quest.priority && <span className="ml-auto flex items-center gap-1.5 text-[#ffab91]"><Flag size={13} /> {quest.priority} priority</span>}</div>
  </motion.article>;
}
