import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function LevelDisplay({ level, size = 'md' }) {
  const sizes = { sm: 'h-11 w-11 text-base', md: 'h-16 w-16 text-2xl', lg: 'h-24 w-24 text-4xl' };
  return (
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} whileHover={{ scale: 1.04 }} className={`relative grid place-items-center rounded-2xl border border-lime/50 bg-gradient-to-br from-lime to-[#6b9f38] font-display font-extrabold text-ink shadow-[0_0_32px_rgba(200,241,105,.16)] ${sizes[size]}`}>
      <span className="absolute right-1 top-1"><Sparkles size={size === 'lg' ? 14 : 10} /></span>
      <span>{level}</span>
    </motion.div>
  );
}
