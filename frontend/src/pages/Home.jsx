import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Bot, CheckCircle2, ChevronDown, Coins, Flame, Plus, Search, Sparkles, Target, Trophy, Users, Zap } from 'lucide-react';
import { XPBar } from '../components/XPBar';
import { QuestCard } from '../components/QuestCard';
import { LevelDisplay } from '../components/LevelDisplay';
import { Avatar } from '../components/Avatar';
import { StatCard } from '../components/StatCard';
import CompletionAnimation from '../components/CompletionAnimation';

const categories = ['All', 'Study', 'Coding', 'Health', 'Work', 'Personal'];
const blankQuest = { title: '', description: '', category: 'Personal', difficulty: 'Medium', duration: 30 };

export default function Home({ user, quests, onStart, onComplete, onCreateQuest, onOpenAssistant }) {
  const [filter, setFilter] = useState('All');
  const [showBuilder, setShowBuilder] = useState(false);
  const [questDraft, setQuestDraft] = useState(blankQuest);
  const [celebration, setCelebration] = useState(null);
  const incompleteQuests = useMemo(() => quests.filter((quest) => !quest.completed && (filter === 'All' || quest.category === filter)), [quests, filter]);
  const completedQuests = useMemo(() => quests.filter((quest) => quest.completed), [quests]);

  const completeQuest = async (questId) => {
    const quest = quests.find((item) => item.id === questId);
    if (!quest) return;
    const accepted = await onComplete(questId);
    if (accepted) {
      setCelebration(quest);
      window.setTimeout(() => setCelebration(null), 1300);
    }
  };

  const submitQuest = (event) => {
    event.preventDefault();
    if (!questDraft.title.trim()) return;
    onCreateQuest({ ...questDraft, duration: Number(questDraft.duration) });
    setQuestDraft(blankQuest);
    setShowBuilder(false);
  };

  return <div className="min-h-screen bg-ink">
    <header className="border-b border-white/8 bg-ink/75 px-5 py-5 backdrop-blur-xl sm:px-8 lg:px-12 lg:py-7">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-start justify-between gap-4">
          <div><p className="eyebrow">Saturday · January 20, 2024</p><h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Make today <span className="text-lime">count.</span></h1><p className="mt-2 text-sm text-muted">Good to see you, {user.displayName.split(' ')[0]}. Your next win is waiting.</p></div>
          <div className="flex items-center gap-3"><button onClick={onOpenAssistant} className="hidden items-center gap-2 rounded-xl border border-lime/25 bg-lime/8 px-3 py-2 text-xs font-bold text-lime-soft transition hover:bg-lime/15 sm:flex"><Bot size={15} /> Ask Grindly</button><Avatar avatar={user.avatar} size="md" /></div>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4"><StatCard label="Available coins" value={user.coins} icon="Coins" variant="blue" detail="Spend in the Vault" /><StatCard label="Current level" value={user.level} icon="Sparkles" variant="primary" detail="Top 12% this week" /><StatCard label="Day streak" value={user.streak} icon="Flame" variant="accent" suffix=" days" detail="Keep it alive" /><StatCard label="Global rank" value={`#${user.globalRank}`} icon="Trophy" variant="success" detail="+18 places this week" /></div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-panel/70 p-4 sm:p-5"><div className="flex items-start gap-4"><LevelDisplay level={user.level} size="md" /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><div><p className="eyebrow">Level {user.level} · Pathfinder</p><p className="mt-1 font-display text-base font-bold">Keep your momentum going</p></div><span className="hidden text-xs text-lime sm:block">{Math.round((user.experience / user.nextLevelExp) * 100)}% to level {user.level + 1}</span></div><div className="mt-3"><XPBar current={user.experience} max={user.nextLevelExp} compact /></div></div></div></div>
      </div>
    </header>

    <main className="mx-auto max-w-6xl px-5 py-7 sm:px-8 lg:px-12 lg:py-9">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section>
          <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="flex items-center gap-2"><span className="status-dot" /><p className="eyebrow">Your daily board</p></div><h2 className="mt-2 font-display text-2xl font-extrabold">Today's quests <span className="ml-1 text-muted">({incompleteQuests.length})</span></h2></div><button onClick={() => setShowBuilder((value) => !value)} className="btn-primary flex items-center gap-2"><Plus size={16} /> New quest</button></div>
          <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1">{categories.map((category) => <button key={category} onClick={() => setFilter(category)} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition ${filter === category ? 'border-lime/40 bg-lime/10 text-lime-soft' : 'border-white/10 bg-white/[.03] text-muted hover:bg-white/[.07]'}`}>{category}</button>)}</div>
          <AnimatePresence>{showBuilder && <QuestBuilder draft={questDraft} setDraft={setQuestDraft} onSubmit={submitQuest} onCancel={() => setShowBuilder(false)} />}</AnimatePresence>
          <div className="mt-5 space-y-3">{incompleteQuests.length ? incompleteQuests.map((quest, index) => <QuestCard key={quest.id} quest={quest} onStart={onStart} onComplete={completeQuest} index={index} />) : <EmptyQuests onCreate={() => setShowBuilder(true)} />}</div>
          {completedQuests.length > 0 && <div className="mt-10"><div className="mb-4 flex items-center gap-2"><CheckCircle2 size={17} className="text-[#8ff0b6]" /><p className="eyebrow">Cleared today · {completedQuests.length}</p></div><div className="space-y-3">{completedQuests.map((quest, index) => <QuestCard key={quest.id} quest={quest} index={index} />)}</div></div>}
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-lime/20 bg-gradient-to-br from-[#1d2d20] to-panel p-5"><div className="flex items-center justify-between"><div className="bot-orb"><Bot size={20} /></div><span className="rounded-full bg-lime/10 px-2 py-1 text-[.6rem] font-bold uppercase tracking-wider text-lime">Online</span></div><p className="mt-5 font-display text-xl font-extrabold">A little context<br /><span className="text-lime">goes a long way.</span></p><p className="mt-2 text-sm leading-6 text-muted">Tell me what’s on your mind and I’ll help shape it into a fair, focused quest.</p><button onClick={onOpenAssistant} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-lime/30 bg-lime/10 py-3 text-sm font-bold text-lime-soft transition hover:bg-lime/20"><Sparkles size={15} /> Talk to Grindly</button></div>
          <div className="rounded-2xl border border-white/10 bg-panel p-5"><div className="flex items-center justify-between"><p className="eyebrow">Momentum</p><ArrowUpRight size={16} className="text-lime" /></div><div className="mt-5 flex items-end gap-2"><span className="font-display text-4xl font-extrabold">84</span><span className="mb-1 text-sm text-lime">+12%</span></div><p className="mt-1 text-xs text-muted">Your consistency score this week</p><div className="mt-5 flex h-14 items-end gap-1.5">{[25, 38, 30, 48, 42, 58, 76].map((height, index) => <div key={index} className="flex-1 rounded-t bg-lime/20" style={{ height: `${height}%` }}><div className="h-full rounded-t bg-lime/70" style={{ height: index === 6 ? '100%' : `${Math.max(35, height - 18)}%` }} /></div>)}</div><div className="mt-2 flex justify-between text-[.62rem] text-muted"><span>Mon</span><span>Today</span></div></div>
          <div className="rounded-2xl border border-white/10 bg-panel p-5"><div className="flex items-center gap-2"><Users size={15} className="text-[#8fd9ff]" /><p className="eyebrow">Social pulse</p></div><p className="mt-4 text-sm leading-6 text-slate-300"><span className="font-bold text-white">Maya</span> just reached a 14 day streak. You’re 32 XP away from passing <span className="text-lime">@CodeWizard</span>.</p><button className="mt-4 flex items-center gap-1 text-xs font-bold text-lime">See the leaderboard <ArrowUpRight size={13} /></button></div>
        </aside>
      </div>
    </main>
    <AnimatePresence>{celebration && <CompletionAnimation quest={celebration} />}</AnimatePresence>
  </div>;
}

function QuestBuilder({ draft, setDraft, onSubmit, onCancel }) {
  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  return <motion.form initial={{ opacity: 0, height: 0, y: -8 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0 }} onSubmit={onSubmit} className="mt-5 overflow-hidden rounded-2xl border border-lime/25 bg-[#151d18] p-5"><div className="mb-5 flex items-start justify-between"><div><p className="eyebrow text-lime">Quest builder</p><h3 className="mt-1 font-display text-xl font-bold">What are you ready to move forward?</h3></div><button type="button" onClick={onCancel} className="text-muted hover:text-white">×</button></div><div className="grid gap-4 sm:grid-cols-2"><label className="sm:col-span-2"><span className="field-label">Quest title</span><input autoFocus required value={draft.title} onChange={(event) => update('title', event.target.value)} placeholder="e.g. Finish the DBMS assignment" className="field-input" /></label><label className="sm:col-span-2"><span className="field-label">A little context <span className="text-muted">(optional)</span></span><input value={draft.description} onChange={(event) => update('description', event.target.value)} placeholder="What does done look like?" className="field-input" /></label><label><span className="field-label">Category</span><select value={draft.category} onChange={(event) => update('category', event.target.value)} className="field-input"><option>Personal</option><option>Study</option><option>Coding</option><option>Health</option><option>Work</option></select></label><label><span className="field-label">Difficulty</span><select value={draft.difficulty} onChange={(event) => update('difficulty', event.target.value)} className="field-input"><option>Easy</option><option>Medium</option><option>Hard</option></select></label><label><span className="field-label">Estimated minutes</span><input type="number" min="5" max="480" value={draft.duration} onChange={(event) => update('duration', event.target.value)} className="field-input" /></label></div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onCancel} className="btn-secondary">Cancel</button><button className="btn-primary flex items-center gap-2"><Sparkles size={15} /> Add to today</button></div></motion.form>;
}

function EmptyQuests({ onCreate }) {
  return <div className="rounded-2xl border border-dashed border-white/15 bg-white/[.02] px-6 py-14 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-lime/10 text-lime"><Target size={22} /></div><h3 className="mt-4 font-display text-lg font-bold">Your board is clear.</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">Take the win. When you’re ready, add one small quest to keep the streak alive.</p><button onClick={onCreate} className="btn-primary mt-5 inline-flex items-center gap-2"><Plus size={15} /> Add a quest</button></div>;
}