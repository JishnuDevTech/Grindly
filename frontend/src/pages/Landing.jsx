import { ArrowRight, Check, Crown, Flame, Gamepad2, LockKeyhole, Sparkles, Swords, Target, Trophy, Zap } from 'lucide-react';
import { GrindlyCharacter } from '../components/GrindlyCharacter';

const pillars = [
  { icon: Target, title: 'Turn intent into quests', detail: 'Give the next action a name, a time limit, and a clear win condition.' },
  { icon: Zap, title: 'Earn visible momentum', detail: 'Every honest focus session feeds your XP, streak, level, and rank.' },
  { icon: Trophy, title: 'Build your own legend', detail: 'Collect achievements and make consistency feel like progress you can see.' },
];

export default function Landing({ onEnter }) {
  return <div className="landing-page min-h-screen overflow-hidden bg-ink text-white">
    <div className="landing-grid" />
    <div className="landing-glow landing-glow-one" />
    <div className="landing-glow landing-glow-two" />
    <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3 text-left" aria-label="Back to Grindly home"><span className="brand-mark">G</span><span><span className="block font-display text-lg font-extrabold tracking-tight">Grindly</span><span className="eyebrow text-lime">Life, made playable</span></span></button>
      <div className="flex items-center gap-3"><span className="hidden items-center gap-2 text-xs text-muted sm:flex"><span className="status-dot" /> Your next level is waiting</span><button onClick={onEnter} className="btn-secondary flex items-center gap-2 !px-4 !py-2.5"><LockKeyhole size={14} /> Sign in</button></div>
    </header>

    <main className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 sm:pt-14 lg:px-12 lg:pb-24 lg:pt-20">
      <section className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-20">
        <div className="max-w-3xl">
          <div className="landing-kicker"><Swords size={14} /> Productivity for people who want a story</div>
          <h1 className="mt-6 max-w-3xl font-display text-5xl font-extrabold leading-[.98] tracking-tight sm:text-6xl lg:text-8xl">Make your real life feel <span className="landing-gradient-text">playable.</span></h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">Grindly turns meaningful work into a personal campaign. Choose one quest, protect your focus, and watch small wins become a character arc.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><button onClick={onEnter} className="btn-primary flex items-center justify-center gap-2 !rounded-xl !px-5 !py-3.5"><Sparkles size={17} /> Start your campaign <ArrowRight size={16} /></button><a href="#how-it-works" className="btn-secondary flex items-center justify-center gap-2 !rounded-xl !px-5 !py-3.5">See how it works</a></div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs text-muted"><span className="flex items-center gap-2"><Check size={14} className="text-lime" /> One focused quest at a time</span><span className="flex items-center gap-2"><Check size={14} className="text-lime" /> Server-validated rewards</span></div>
        </div>

        <div className="landing-character-stage">
          <div className="landing-orbit landing-orbit-one" /><div className="landing-orbit landing-orbit-two" />
          <div className="landing-scanline" />
          <div className="landing-character-label"><span className="status-dot" /><span className="eyebrow text-lime">Companion online</span></div>
          <GrindlyCharacter mood="happy" size="lg" />
          <div className="landing-level-badge"><Crown size={15} className="text-[#ffd27a]" /><span><strong>LEVEL 01</strong><small>Begin anywhere</small></span></div>
          <div className="landing-streak-badge"><Flame size={15} className="text-[#ff896d]" /><span><strong>0 → 1</strong><small>Today is the start</small></span></div>
        </div>
      </section>

      <section id="how-it-works" className="mt-20 grid gap-4 border-y border-white/10 py-7 sm:grid-cols-3 lg:mt-28 lg:py-9">
        {pillars.map(({ icon: Icon, title, detail }, index) => <article key={title} className="landing-pillar"><div className="landing-pillar-number">0{index + 1}</div><div className="landing-pillar-icon"><Icon size={18} /></div><div><h2 className="font-display text-lg font-bold">{title}</h2><p className="mt-1.5 text-sm leading-6 text-muted">{detail}</p></div></article>)}
      </section>

      <section className="mt-16 flex flex-col items-start justify-between gap-6 rounded-3xl border border-lime/20 bg-gradient-to-r from-[#19291d] via-[#111b18] to-[#111719] p-6 sm:p-8 lg:mt-20 lg:flex-row lg:items-center lg:p-10">
        <div><p className="eyebrow text-lime">Your campaign starts small</p><h2 className="mt-2 max-w-xl font-display text-3xl font-extrabold sm:text-4xl">The next win is closer than it feels.</h2><p className="mt-3 max-w-lg text-sm leading-7 text-muted">No streaks to maintain before you begin. No perfect plan required. Just choose a fair quest and show up.</p></div>
        <button onClick={onEnter} className="btn-primary flex shrink-0 items-center gap-2 !rounded-xl !px-5 !py-3.5">Enter Grindly <ArrowRight size={16} /></button>
      </section>
    </main>
  </div>;
}

export function LandingStat({ value, label }) { return <div><p className="font-display text-xl font-extrabold text-white">{value}</p><p className="eyebrow mt-1">{label}</p></div>; }
