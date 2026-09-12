import { motion } from 'framer-motion';

export function Avatar({ avatar, size = 'md', className = '', border = true }) {
  const sizes = { xs: 'h-8 w-8 text-sm', sm: 'h-10 w-10 text-base', md: 'h-12 w-12 text-xl', lg: 'h-16 w-16 text-3xl', xl: 'h-24 w-24 text-5xl' };
  return <motion.div whileHover={{ y: -2, rotate: 2 }} className={`relative grid place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#b5e86b] via-[#52783b] to-[#111719] ${border ? 'border border-lime/60' : ''} ${sizes[size]} ${className}`}>{avatar?.startsWith('data:image/') ? <img src={avatar} alt="Custom avatar" className="h-full w-full object-cover" /> : <><div className="absolute inset-[14%] rounded-[38%] border border-white/30 bg-[#d9eea5]/90 shadow-inner" /><div className="relative flex gap-[.35em] text-[.55em] text-[#182217]"><span className="h-[.35em] w-[.35em] rounded-full bg-current" /><span className="h-[.35em] w-[.35em] rounded-full bg-current" /></div></>}</motion.div>;
}
