import { useState } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, ChevronRight, Lock, Medal, Sparkles, Trophy, Swords, ScrollText, Users } from 'lucide-react';
import { achievementCatalog, expandedAchievementCatalog } from '../data/mockData';

const categories = ['All', 'Medals', 'Quest achievements', 'Streaks', 'Milestones', 'Secret'];
const rarityClasses = {
  Common: 'from-slate-500/45 to-slate-950 border-slate-300/35 text-slate-200',
  Rare: 'from-sky-500/45 to-slate-950 border-sky-200/45 text-sky-100',
  Epic: 'from-violet-500/50 to-slate-950 border-violet-200/50 text-violet-100',
  Elite: 'from-rose-500/50 to-slate-950 border-rose-200/55 text-rose-100',
  Legendary: 'from-amber-400/60 to-slate-950 border-amber-200/65 text-amber-100',
  Mythic: 'from-fuchsia-500/70 via-indigo-900 to-slate-950 border-fuchsia-200/75 text-fuchsia-100',
};

export default function Achievements({ user }) {
  const [category, setCategory] = useState('All');
  const ownedIds = new Set((user.achievements || []).map((achievement) => achievement.id));
  const catalog = [...achievementCatalog, ...expandedAchievementCatalog];
  const visible = catalog.filter((achievement) => category === 'All' || achievement.category === category);
  return <div className="medals-page min-h-screen bg-ink"><div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
    <header className="medals-header"><div><p className="eyebrow text-lime">Hall of progression · chess archive</p><h1 className="mt-2 font-display text-4xl font-extrabold sm:text-5xl">Build your board.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted">Every achievement is a piece earned through play. Start as a pawn, develop your ranks, and become the piece your campaign needs.</p></div><div className="medals-score"><div className="medals-score-icon"><Medal size={19} /></div><div><p className="eyebrow">Board control</p><p className="font-display text-2xl font-extrabold text-[#ffd27a]">{ownedIds.size}<span className="text-muted"> / {catalog.length}</span></p><p className="text-[.65rem] text-muted">pieces discovered</p></div></div></header>
    <div className="chess-rank-strip"><RankPiece piece="♟" label="PAWN" detail="First steps" /><RankPiece piece="♞" label="KNIGHT" detail="Streaks" /><RankPiece piece="♝" label="BISHOP" detail="Paths" /><RankPiece piece="♜" label="ROOK" detail="Milestones" /><RankPiece piece="♛" label="QUEEN" detail="Mastery" /><RankPiece piece="♚" label="KING" detail="Endgame" /></div>
    <div className="mt-7 flex gap-2 overflow-x-auto pb-1">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition ${category === item ? 'border-lime/40 bg-lime/10 text-lime-soft' : 'border-white/10 bg-white/[.03] text-muted hover:bg-white/[.07]'}`}>{item}</button>)}</div>
    <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visible.map((achievement, index) => <Achievement key={achievement.id} achievement={achievement} index={index} owned={ownedIds.has(achievement.id)} user={user} />)}</div>
    <RpgRoadmap />
  </div></div>;
}

function Achievement({ achievement, index, owned, user }) {
  const progress = achievement.progress(user);
  const complete = owned || progress >= achievement.goal;
  const role = getChessRole(achievement, index);
  return <motion.article initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .05 }} whileHover={{ y: -6, rotate: index % 2 ? .4 : -.4 }} className={`collection-relic collection-relic-${achievement.category.toLowerCase().replaceAll(' ', '-')} achievement-chess-card overflow-hidden border bg-gradient-to-br ${rarityClasses[achievement.rarity] || rarityClasses.Common} ${complete ? '' : 'opacity-75'}`}><div className="relative flex h-44 items-center justify-center overflow-hidden"><div className="chess-board-glow" /><div className={`medal-emblem chess-emblem chess-emblem-${role.name.toLowerCase()} ${complete ? '' : 'medal-emblem-locked'}`}><span className="chess-piece">{role.piece}</span><span className="relic-engraving">{String(index + 1).padStart(2, '0')}</span></div><div className="achievement-role"><span>{role.name}</span><small>{role.detail}</small></div><span className="absolute bottom-3 left-3 rounded-full bg-black/25 px-2 py-1 font-mono text-[.58rem] tracking-widest">{complete ? achievement.rarity.toUpperCase() : 'LOCKED'}</span>{achievement.secret && !complete && <span className="absolute right-3 top-3 rounded-full bg-black/25 px-2 py-1 text-[.58rem]">SECRET</span>}</div><div className="border-t border-white/10 bg-black/15 p-4"><div className="flex items-start justify-between gap-2"><p className="font-display font-bold">{achievement.secret && !complete ? 'Hidden achievement' : achievement.name}</p><span className="chess-piece-mini">{role.piece}</span></div><p className="mt-1 text-xs leading-5 text-white/65">{achievement.secret && !complete ? 'A discovery waits beyond the visible path.' : achievement.detail}</p>{!complete && !achievement.secret && <><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/20"><div className="h-full rounded-full bg-white/60" style={{ width: `${Math.round((progress / achievement.goal) * 100)}%` }} /></div><p className="mt-2 text-[.62rem] text-white/60">{progress} / {achievement.goal} progress</p></>}{complete && <p className="mt-4 flex items-center gap-2 text-xs font-bold text-[#8ff0b6]"><BadgeCheck size={14} /> Collected · board piece secured</p>}</div></motion.article>;
}

function getChessRole(achievement, index) {
  if (achievement.rarity === 'Mythic') return { name: 'King', detail: 'Endgame piece', piece: '♚' };
  if (achievement.rarity === 'Legendary') return { name: 'Queen', detail: 'Mastery piece', piece: '♛' };
  if (achievement.category === 'Milestones') return { name: 'Rook', detail: 'Fortress piece', piece: '♜' };
  if (achievement.category === 'Quest achievements') return { name: 'Bishop', detail: 'Path piece', piece: '♝' };
  if (achievement.category === 'Streaks') return { name: 'Knight', detail: 'Momentum piece', piece: '♞' };
  return { name: 'Pawn', detail: index % 2 ? 'Opening piece' : 'First-move piece', piece: '♟' };
}

function RankPiece({ piece, label, detail }) { return <div className="chess-rank-piece"><span className="rank-chess-glyph">{piece}</span><span><strong>{label}</strong><small>{detail}</small></span></div>; }

function RpgRoadmap() { const ideas = [{ icon: Swords, title: 'Class paths', text: 'Choose a build such as Scholar, Forger, Guardian, or Wanderer. Each path changes quests and unlocks.' }, { icon: ScrollText, title: 'Story chapters', text: 'Group achievements into campaign chapters with boss goals and cinematic unlock moments.' }, { icon: Users, title: 'Guild raids', text: 'Let friends combine streaks and quests to defeat weekly community objectives.' }]; return <section className="rpg-roadmap"><div><p className="eyebrow text-lime">Next expansion · RPG systems</p><h2 className="mt-2 font-display text-2xl font-extrabold">Make the board part of a bigger world.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">The medal case is the foundation. These systems would turn Grindly into a full role-playing loop.</p></div><div className="rpg-roadmap-grid">{ideas.map(({ icon: Icon, title, text }) => <article key={title}><div className="rpg-roadmap-icon"><Icon size={17} /></div><div><h3 className="font-display font-bold">{title}</h3><p className="mt-1 text-xs leading-5 text-muted">{text}</p></div><ChevronRight size={15} className="ml-auto shrink-0 text-muted" /></article>)}</div></section>; }
