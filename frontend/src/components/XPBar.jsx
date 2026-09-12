import { motion } from 'framer-motion';
import { ArrowUpRight, Zap } from 'lucide-react';

export function XPBar({ current, max, showLabel = true, compact = false }) {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));

  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="eyebrow flex items-center gap-1.5"><Zap size={12} className="text-lime" /> Current XP</span>
          <span className="font-mono text-xs text-slate-300">{current.toLocaleString()} <span className="text-muted">/ {max.toLocaleString()}</span></span>
        </div>
      )}
      <div className={`relative overflow-hidden rounded-full bg-white/8 ${compact ? 'h-1.5' : 'h-2.5'}`}>
        <motion.div className="h-full rounded-full bg-gradient-to-r from-lime via-[#e1fb92] to-[#8bd34a]" initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
        <motion.div className="absolute inset-y-0 w-20 bg-white/30 blur-md" initial={{ left: '-20%' }} animate={{ left: '110%' }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2 }} />
      </div>
      {!compact && <p className="mt-2 flex items-center gap-1 text-[0.68rem] text-muted"><ArrowUpRight size={12} className="text-lime" /> {Math.max(0, max - current).toLocaleString()} XP until the next level</p>}
    </div>
  );
}
