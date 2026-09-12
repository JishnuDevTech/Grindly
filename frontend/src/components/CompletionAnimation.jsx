import { motion } from 'framer-motion';
import { Check, Coins, Zap } from 'lucide-react';

export default function CompletionAnimation({ quest }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none fixed inset-0 z-50 grid place-items-center bg-ink/30 backdrop-blur-[2px]"><motion.div initial={{ scale: .7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-3xl border border-lime/30 bg-panel px-8 py-7 text-center shadow-2xl"><motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-lime text-ink"><Check size={30} strokeWidth={3} /></motion.div><p className="mt-4 font-display text-xl font-extrabold">Quest cleared</p><p className="mt-1 max-w-xs truncate text-sm text-muted">{quest.title}</p><div className="mt-5 flex justify-center gap-4 text-sm font-bold"><span className="flex items-center gap-1.5 text-lime"><Zap size={15} /> +{quest.xp} XP</span><span className="flex items-center gap-1.5 text-[#ffd27a]"><Coins size={15} /> +{quest.coins}</span></div></motion.div></motion.div>;
}
