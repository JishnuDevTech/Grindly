import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

export function StatCard({ label, value, icon: iconName, variant = 'primary', suffix = '', detail }) {
  const Icon = Icons[iconName] || Icons.Zap;
  const accents = { primary: 'text-lime bg-lime/10 border-lime/15', accent: 'text-[#ff9a7e] bg-[#ff8060]/10 border-[#ff8060]/15', success: 'text-[#8ff0b6] bg-[#5bdc96]/10 border-[#5bdc96]/15', blue: 'text-[#8fd9ff] bg-[#65c8ff]/10 border-[#65c8ff]/15', purple: 'text-[#d4b6ff] bg-[#a979ff]/10 border-[#a979ff]/15', slate: 'text-slate-300 bg-white/5 border-white/10' };
  return <motion.div whileHover={{ y: -2 }} className="rounded-2xl border border-white/10 bg-panel p-4"><div className="flex items-start justify-between gap-3"><div><p className="eyebrow">{label}</p><p className="mt-2 font-display text-2xl font-extrabold text-white">{typeof value === 'number' ? value.toLocaleString() : value}{suffix}</p>{detail && <p className="mt-1 text-xs text-muted">{detail}</p>}</div><div className={`grid h-9 w-9 place-items-center rounded-xl border ${accents[variant]}`}><Icon size={17} /></div></div></motion.div>;
}
