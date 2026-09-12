import { motion } from 'framer-motion';
import { avatarOptions } from '../data/mockData';

export function Avatar({ avatar, size = 'md', className = '', border = true }) {
  const sizes = { xs: 'h-8 w-8 text-sm', sm: 'h-10 w-10 text-base', md: 'h-12 w-12 text-xl', lg: 'h-16 w-16 text-3xl', xl: 'h-24 w-24 text-5xl' };
  const selected = avatarOptions.find((option) => option.id === avatar);
  const emoji = selected?.emoji || avatar || '🙂';
  return <motion.div whileHover={{ y: -2, rotate: 2 }} className={`grid place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#27352e] to-[#111719] ${border ? 'border border-lime/40' : ''} ${sizes[size]} ${className}`}>{avatar?.startsWith('data:image/') ? <img src={avatar} alt="Custom avatar" className="h-full w-full object-cover" /> : <span>{emoji}</span>}</motion.div>;
}
