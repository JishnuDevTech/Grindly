import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Search, Users, Zap } from 'lucide-react';
import { Avatar } from '../components/Avatar';

export default function Leaderboard({ user, entries: allEntries, friendEntries = [] }) {
  const [tab, setTab] = useState('global');
  const entries = tab === 'global' ? allEntries : friendEntries;
  return (
    <div className="min-h-screen bg-ink">
      <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8 lg:px-12 lg:py-10">
        <header className="flex flex-col justify-between gap-5 border-b border-white/8 pb-7 sm:flex-row sm:items-end">
          <div><p className="eyebrow">Friendly competition</p><h1 className="mt-2 font-display text-4xl font-extrabold">Climb the ranks.</h1><p className="mt-2 text-sm text-muted">A little visibility makes the work feel real.</p></div>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-panel p-1"><button onClick={() => setTab('global')} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${tab === 'global' ? 'bg-lime text-ink' : 'text-muted hover:text-white'}`}>Global</button><button onClick={() => setTab('friends')} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${tab === 'friends' ? 'bg-lime text-ink' : 'text-muted hover:text-white'}`}><Users size={13} /> Friends</button></div>
        </header>
        {entries.length ? <div className="mt-8 grid gap-4 md:grid-cols-3">{entries.slice(0, 3).map((player, index) => <PodiumCard key={player.username} player={player} place={index + 1} />)}</div> : <div className="mt-8 rounded-3xl border border-dashed border-white/15 bg-panel p-8 text-center text-sm text-muted">No friends are ranked yet. Search for a grinder and send a request to build your circle.</div>}
        <div className="mt-8 flex items-center justify-between"><div><p className="eyebrow">{tab === 'global' ? 'All players' : 'Your circle'}</p><h2 className="mt-2 font-display text-2xl font-extrabold">This week</h2></div><button className="icon-button" aria-label="Search players"><Search size={17} /></button></div>
        <div className="mt-4 space-y-2">{entries.slice(3).map((player, index) => <PlayerRow key={player.username} player={player} index={index} />)}</div>
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-dashed border-lime/25 bg-lime/5 p-4"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-lime text-ink"><ArrowUp size={17} /></div><div><p className="text-sm font-bold">You’re moving up</p><p className="text-xs text-muted">18 places gained this week</p></div></div><p className="font-display text-2xl font-extrabold text-lime">#{user.globalRank}</p></div>
      </div>
    </div>
  );
}

function PodiumCard({ player, place }) {
  const colors = { 1: 'from-[#725d24]/50 to-panel border-[#ffd27a]/35', 2: 'from-[#35434a]/50 to-panel border-white/20', 3: 'from-[#5b3b2e]/50 to-panel border-[#ffab91]/25' };
  return <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: place * .08 }} className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br p-5 ${colors[place]}`}><div className="absolute right-4 top-3 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/20 font-display text-lg font-extrabold text-[#ffd27a]">{place}</div><div className="flex items-center gap-3"><span className="font-mono text-xs text-muted">0{place}</span><Avatar avatar={player.avatar} size="md" border={false} /><div className="min-w-0"><p className="truncate font-bold">{player.displayName}</p><p className="truncate text-xs text-muted">@{player.username}</p></div></div><div className="mt-6 flex items-end justify-between"><div><p className="eyebrow">Level</p><p className="mt-1 font-display text-2xl font-extrabold">{player.level}</p></div><div className="text-right"><p className="eyebrow">XP points</p><p className="mt-1 font-mono text-lg font-bold text-[#ffd27a]">{player.xp.toLocaleString()}</p></div></div></motion.div>;
}

function PlayerRow({ player, index }) {
  return <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * .04 }} className={`flex items-center gap-3 rounded-2xl border p-3 sm:gap-5 sm:p-4 ${player.isCurrentUser ? 'border-lime/35 bg-lime/8' : 'border-white/10 bg-panel'}`}><span className="w-8 text-center font-mono text-xs text-muted">#{player.rank}</span><Avatar avatar={player.avatar} size="sm" border={false} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{player.displayName} {player.isCurrentUser && <span className="ml-1 text-[.6rem] font-normal text-lime">YOU</span>}</p><p className="mt-1 truncate text-xs text-muted">@{player.username}</p></div><div className="hidden items-center gap-1 text-xs text-muted sm:flex"><Zap size={13} className="text-lime" /> Level {player.level}</div><div className="text-right"><p className="font-mono text-sm font-bold text-[#ffd27a]">{player.xp.toLocaleString()}</p><p className="text-[.6rem] text-muted">points</p></div></motion.div>;
}
