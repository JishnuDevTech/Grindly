import { motion } from 'framer-motion';

const palettes = {
  lime: ['#d8f878', '#4f813c', '#101b18'],
  blue: ['#a4e5ff', '#3470a4', '#111827'],
  violet: ['#e1c5ff', '#744a9d', '#191326'],
  amber: ['#ffe09a', '#ad642d', '#21160e'],
  rose: ['#ffc3d3', '#9d456d', '#21131c'],
  cyan: ['#a5fff1', '#278e91', '#0e2225'],
  orange: ['#ffd1a3', '#b25b2d', '#21150f'],
  green: ['#c5f5a5', '#3f824d', '#112017'],
  indigo: ['#c5caff', '#4e5da6', '#12162a'],
  pink: ['#ffc7f0', '#a54c94', '#211326'],
};
const paletteNames = ['lime', 'blue', 'violet', 'amber', 'rose', 'cyan', 'orange', 'green', 'indigo', 'pink'];

// Each identity is deliberately a different silhouette, not a recoloured face.
const identities = {
  'avatar-1': ({ c }) => <><path d="M20 72V45C20 24 32 14 50 14s30 10 30 31v27Z" fill={c[1]} /><path d="M29 42c4-16 38-18 42 0v25H29Z" fill={c[0]} /><path d="M32 39h36M37 57h5m26 0h-5" stroke={c[2]} strokeWidth="4" strokeLinecap="round" /><path d="M42 72h16" stroke={c[0]} strokeWidth="5" strokeLinecap="round" /></>,
  'avatar-2': ({ c }) => <><circle cx="50" cy="42" r="28" fill={c[1]} /><path d="M25 42h50M50 17c9 12 9 38 0 50M50 17c-9 12-9 38 0 50" fill="none" stroke={c[0]} strokeWidth="3" /><path d="M22 73h56" stroke={c[0]} strokeWidth="7" strokeLinecap="round" /><circle cx="50" cy="42" r="7" fill={c[0]} /></>,
  'avatar-3': ({ c }) => <><path d="m50 10 28 16v32L50 74 22 58V26Z" fill={c[1]} stroke={c[0]} strokeWidth="3" /><path d="m34 35 16-9 16 9-16 9Z" fill={c[0]} /><path d="M34 35v16l16 9 16-9V35" fill="none" stroke={c[2]} strokeWidth="4" /><path d="M43 48h14" stroke={c[0]} strokeWidth="4" strokeLinecap="round" /></>,
  'avatar-4': ({ c }) => <><path d="M50 10 61 31l23 3-17 16 4 23-21-11-21 11 4-23-17-16 23-3Z" fill={c[1]} stroke={c[0]} strokeWidth="3" /><circle cx="42" cy="43" r="4" fill={c[0]} /><circle cx="58" cy="43" r="4" fill={c[0]} /><path d="M42 56h16" stroke={c[0]} strokeWidth="4" strokeLinecap="round" /></>,
  'avatar-5': ({ c }) => <><path d="M50 25c-13-18-36-3-23 15-21-3-25 22-4 25-6 19 19 25 27 9 8 16 33 10 27-9 21-3 17-28-4-25 13-18-10-33-23-15Z" fill={c[1]} stroke={c[0]} strokeWidth="3" /><circle cx="41" cy="43" r="4" fill={c[2]} /><circle cx="59" cy="43" r="4" fill={c[2]} /><path d="M42 56q8 7 16 0" fill="none" stroke={c[2]} strokeWidth="3" strokeLinecap="round" /></>,
  'avatar-6': ({ c }) => <><circle cx="50" cy="45" r="26" fill={c[1]} /><path d="M50 12v18M50 60v18M17 45h18M65 45h18" stroke={c[0]} strokeWidth="5" strokeLinecap="round" /><circle cx="50" cy="45" r="10" fill={c[0]} /><circle cx="50" cy="45" r="4" fill={c[2]} /></>,
  'avatar-7': ({ c }) => <><path d="M24 70 31 30l19-15 19 15 7 40Z" fill={c[1]} stroke={c[0]} strokeWidth="3" /><path d="M31 31h38M36 50h10m8 0h10" stroke={c[2]} strokeWidth="4" strokeLinecap="round" /><path d="M42 62h16" stroke={c[0]} strokeWidth="4" strokeLinecap="round" /></>,
  'avatar-8': ({ c }) => <><path d="M50 13c18 0 29 15 29 34S68 77 50 77 21 66 21 47 32 13 50 13Z" fill={c[1]} /><path d="M50 13v64M21 47h58" stroke={c[0]} strokeWidth="3" /><circle cx="40" cy="42" r="5" fill={c[2]} /><circle cx="60" cy="42" r="5" fill={c[2]} /><path d="M40 57h20" stroke={c[2]} strokeWidth="4" strokeLinecap="round" /></>,
  'avatar-9': ({ c }) => <><path d="M50 12 78 50 50 78 22 50Z" fill={c[1]} stroke={c[0]} strokeWidth="3" /><path d="m50 25 13 25-13 25-13-25Z" fill={c[0]} /><path d="M43 48h4m6 0h4" stroke={c[2]} strokeWidth="4" strokeLinecap="round" /><path d="M45 59h10" stroke={c[2]} strokeWidth="3" strokeLinecap="round" /></>,
  'avatar-10': ({ c }) => <><path d="M50 14c16 0 27 13 27 30 0 19-11 33-27 33S23 63 23 44c0-17 11-30 27-30Z" fill={c[1]} /><path d="M28 35q22-19 44 0" fill="none" stroke={c[0]} strokeWidth="7" /><circle cx="40" cy="49" r="4" fill={c[2]} /><circle cx="60" cy="49" r="4" fill={c[2]} /><path d="M43 62h14" stroke={c[0]} strokeWidth="4" strokeLinecap="round" /></>,
};

export function Avatar({ avatar, size = 'md', className = '', border = true }) {
  const sizes = { xs: 'h-8 w-8', sm: 'h-10 w-10', md: 'h-12 w-12', lg: 'h-16 w-16', xl: 'h-24 w-24' };
  const identity = identities[avatar] || identities['avatar-1'];
  const palette = palettes[paletteNames[Math.max(0, (Number(avatar?.replace('avatar-', '')) || 1) - 1)] || 'lime'];
  return <motion.div whileHover={{ y: -2, rotate: 2 }} style={{ background: `linear-gradient(135deg, ${palette[0]}, ${palette[1]} 55%, ${palette[2]})` }} className={`relative grid shrink-0 place-items-center overflow-hidden rounded-2xl ${border ? 'border border-lime/60' : ''} ${sizes[size]} ${className}`}>
    {avatar?.startsWith('data:image/') ? <img src={avatar} alt="Custom avatar" className="h-full w-full object-cover" /> : <svg viewBox="0 0 100 90" aria-label="Grindly avatar" role="img" className="h-full w-full p-1"><rect width="100" height="90" rx="18" fill={palette[2]} />{identity({ c: palette })}</svg>}
  </motion.div>;
}
