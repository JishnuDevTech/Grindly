import { motion } from 'framer-motion';

export function GrindlyCharacter({ mood = 'idle', size = 'md' }) {
  const sizes = { sm: 'h-14 w-14', md: 'h-20 w-20', lg: 'h-28 w-28' };
  const eyes = mood === 'happy' ? '◠  ◠' : mood === 'talking' ? '•  •' : '•  •';
  return <motion.div animate={{ y: [0, -3, 0], rotate: mood === 'happy' ? [-2, 2, -2] : 0 }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }} className={`grindly-character ${sizes[size]}`} aria-label="Grindly companion"><div className="grindly-hood" /><div className="grindly-face"><motion.span animate={{ scaleY: mood === 'talking' ? [1, .45, 1] : 1 }} transition={{ duration: .25, repeat: mood === 'talking' ? Infinity : 0 }} className="grindly-eyes">{eyes}</motion.span><span className="grindly-mouth">{mood === 'happy' ? '⌣' : mood === 'talking' ? '◡' : '·'}</span></div><div className="grindly-scarf" /></motion.div>;
}
