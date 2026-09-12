import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, Check, Coins, Crown, Gift, Lock, Orbit, Palette, Sparkles, Shield, ShoppingBag, Star, Trophy, Zap } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { getRarityColor } from '../data/mockData';

const categories = ['All', 'Profile Frame', 'Nameplate', 'Theme', 'XP Effect', 'Avatar Effect', 'Badge', 'Trophy Display'];
const rarityStyles = {
  Common: { panel: 'from-slate-700/80 to-slate-950', border: 'border-slate-400/30', glow: '', artifact: 'bg-slate-500/20' },
  Rare: { panel: 'from-sky-500/45 to-slate-950', border: 'border-sky-300/50', glow: 'shadow-[0_0_28px_rgba(56,189,248,.18)]', artifact: 'bg-sky-300/20' },
  Epic: { panel: 'from-violet-500/50 to-slate-950', border: 'border-violet-300/55', glow: 'shadow-[0_0_34px_rgba(167,139,250,.22)]', artifact: 'bg-violet-300/20' },
  Elite: { panel: 'from-rose-500/50 to-slate-950', border: 'border-rose-300/55', glow: 'shadow-[0_0_38px_rgba(251,113,133,.24)]', artifact: 'bg-rose-300/20' },
  Legendary: { panel: 'from-amber-400/60 to-slate-950', border: 'border-amber-200/70', glow: 'shadow-[0_0_44px_rgba(251,191,36,.3)]', artifact: 'bg-amber-200/25' },
  Mythic: { panel: 'from-fuchsia-500/70 via-indigo-900 to-slate-950', border: 'border-fuchsia-200/80', glow: 'shadow-[0_0_58px_rgba(217,70,239,.38)]', artifact: 'bg-fuchsia-200/25' },
};

export default function Shop({ user, items, onPurchase, onEquip }) {
  const [category, setCategory] = useState('All');
  const filteredItems = useMemo(() => category === 'All' ? items : items.filter((item) => item.category === category), [category, items]);
  return <div className="min-h-screen bg-ink"><div className="mx-auto max-w-6xl px-5 py-7 sm:px-8 lg:px-12 lg:py-10">
    <header className="flex flex-col justify-between gap-5 border-b border-white/8 pb-7 sm:flex-row sm:items-end"><div><p className="eyebrow text-lime">Inventory · reward vault</p><h1 className="mt-2 font-display text-4xl font-extrabold">Collect your identity.</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted">Cosmetics change how your character shows up. Inspect the artifact, check its rarity, then decide what belongs in your loadout.</p></div><div className="flex items-center gap-3 rounded-2xl border border-[#ffd27a]/20 bg-[#ffd27a]/8 px-4 py-3"><Coins size={18} className="text-[#ffd27a]" /><div><p className="eyebrow">Coin pouch</p><p className="font-display text-lg font-extrabold text-[#ffd27a]">{user.coins.toLocaleString()}</p></div></div></header>
    <div className="mt-7 flex gap-2 overflow-x-auto pb-1">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition ${category === item ? 'border-lime/40 bg-lime/10 text-lime-soft' : 'border-white/10 bg-white/[.03] text-muted hover:bg-white/[.07]'}`}>{item}</button>)}</div>
    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filteredItems.map((item, index) => <ShopItem key={item.id} item={item} index={index} user={user} onPurchase={onPurchase} onEquip={onEquip} canAfford={user.coins >= item.price} />)}</div>
    <div className="mt-10 flex items-start gap-4 border-t border-white/8 pt-7"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-lime text-ink"><Gift size={20} /></div><div><p className="font-display text-lg font-bold">Some artifacts are discovered, not bought.</p><p className="mt-1 max-w-2xl text-sm leading-6 text-muted">Keep your streak alive and open milestone chests for the rarest frames, effects, and trophy displays. Your work determines what your character can wear.</p></div></div>
  </div></div>;
}

function ShopItem({ item, index, user, onPurchase, onEquip, canAfford }) {
  const rarity = item.rarity || 'Common';
  const style = rarityStyles[rarity] || rarityStyles.Common;
  const locked = item.locked || item.unlocksAt;
  return <motion.article initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .05 }} whileHover={{ y: -5 }} className={`group overflow-hidden border bg-panel ${style.border} ${style.glow} vault-artifact-card`}>
    <ArtifactPreview item={item} user={user} style={style} rarity={rarity} variant={index % 5} />
    <div className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-display font-bold">{item.name}</p><p className="mt-1 text-xs text-muted">{item.category} · {locked ? 'Discovery item' : 'Vault item'}</p></div><span className={`font-mono text-[.6rem] font-bold tracking-widest ${getRarityColor(rarity)}`}>{rarity.toUpperCase()}</span></div>
         {locked ? <div className="mt-5 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-xs font-semibold text-muted"><Lock size={13} /> {item.unlocksAt || 'Unlock in Chest'}</div> : item.owned ? <div className="mt-5 flex items-center justify-between rounded-xl bg-[#5bdc96]/10 px-3 py-2.5 text-xs font-bold text-[#8ff0b6]"><span className="flex items-center gap-2"><Check size={14} /> Owned</span><button onClick={() => onEquip(item.id, item.equipped)} className="text-lime-soft hover:underline">{item.equipped ? 'Unequip' : 'Equip'}</button></div> : item.catalogOnly ? <div className="mt-5 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-xs font-semibold text-muted"><Lock size={13} /> {item.unlocksAt || 'Unlock in Chest'}</div> : <button onClick={() => onPurchase(item.id)} disabled={!canAfford} className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${canAfford ? 'bg-white/8 text-white hover:bg-lime hover:text-ink' : 'cursor-not-allowed bg-white/5 text-muted'}`}><Coins size={14} className="text-[#ffd27a]" /> {item.price.toLocaleString()} coins</button>}</div>
  </motion.article>;
}

function ArtifactPreview({ item, user, style, rarity, variant }) {
  const category = item.category;
  const ArtifactIcon = { Badge: BadgeCheck, 'Trophy Display': Crown, 'XP Effect': Orbit, Theme: Palette, 'Avatar Effect': Sparkles, Nameplate: ShoppingBag }[category] || Shield;
  return <div className={`relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br ${style.panel} artifact-preview artifact-preview-${variant}`}>
    <div className="artifact-stars" />
    {category === 'Profile Frame' ? <div className={`artifact-frame artifact-frame-${rarity.toLowerCase()} artifact-frame-v${variant} relative grid h-28 w-28 place-items-center ${style.glow}`}><i /><i /><Avatar avatar={user.avatar} size="lg" border={false} /></div> : category === 'Nameplate' ? <div className={`artifact-nameplate artifact-nameplate-${rarity.toLowerCase()} artifact-nameplate-v${variant} border px-5 py-3 text-center`}><div className="flex items-center justify-center gap-2"><Star size={11} /><span className="font-mono text-[.58rem] tracking-[.24em]">LEVEL {user.level}</span><Star size={11} /></div><p className="mt-1 font-display text-lg font-extrabold">@{user.username || 'grinder'}</p></div> : category === 'Avatar Effect' ? <div className={`artifact-avatar-effect artifact-avatar-effect-${rarity.toLowerCase()} artifact-avatar-v${variant} relative rounded-full p-3 ${style.glow}`}><span /><span /><Avatar avatar={user.avatar} size="lg" /></div> : category === 'Theme' ? <div className={`artifact-theme artifact-theme-${rarity.toLowerCase()} artifact-theme-v${variant} w-48 border p-3 ${style.border}`}><div className="flex items-center gap-2"><Avatar avatar={user.avatar} size="xs" border={false} /><span className="text-xs font-bold text-white">@{user.username || 'grinder'}</span></div><div className="mt-3 h-2 w-20 rounded bg-white/70" /><div className="mt-2 h-2 w-32 rounded bg-white/25" /><div className="mt-4 h-10 border border-white/20 bg-black/25" /></div> : category === 'XP Effect' ? <div className={`artifact-xp-effect artifact-xp-v${variant} text-center`}><span /><span /><div className="flex items-center justify-center gap-2"><Zap size={18} className="text-white" /><span className="font-display text-3xl font-extrabold text-white">+120</span></div><span className="mt-1 block font-mono text-[.58rem] tracking-[.24em] text-white/70">XP GAINED</span></div> : category === 'Badge' ? <div className={`artifact-badge artifact-badge-${rarity.toLowerCase()} artifact-badge-v${variant} grid h-24 w-24 place-items-center`}><BadgeCheck size={42} strokeWidth={1.2} /></div> : category === 'Trophy Display' ? <div className={`artifact-trophy artifact-trophy-${rarity.toLowerCase()} artifact-trophy-v${variant} relative flex h-28 w-24 items-end justify-center`}><Trophy size={62} strokeWidth={1.1} /><span className="absolute bottom-0 h-2 w-20 rounded-full bg-white/30" /></div> : <div className={`relative grid h-24 w-24 place-items-center rounded-[2rem] border ${style.border} ${style.artifact} ${style.glow}`}><ArtifactIcon size={42} strokeWidth={1.2} className="text-white" /></div>}
    <span className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-black/25 px-2 py-1 font-mono text-[.58rem] font-bold tracking-widest text-white/80">{rarity}</span>
  </div>;
}
