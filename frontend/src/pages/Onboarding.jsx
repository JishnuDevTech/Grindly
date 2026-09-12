import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, ChevronLeft, ImagePlus, Sparkles } from 'lucide-react';
import { avatarOptions } from '../data/mockData';
import { Avatar } from '../components/Avatar';
import { GrindlyCharacter } from '../components/GrindlyCharacter';

const steps = ['welcome', 'identity', 'avatar', 'companion', 'tutorial'];

export default function Onboarding({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [username, setUsername] = useState(user.username || '');
  const [avatar, setAvatar] = useState(user.avatar || 'avatar-1');
  const [customAvatar, setCustomAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInput = useRef(null);

  const selectFile = (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => { setCustomAvatar(reader.result); setAvatar(reader.result); };
    reader.readAsDataURL(file);
  };

  const finish = async () => {
    setSaving(true);
    await onComplete({ display_name: displayName || 'Grinder', username: username.replace(/\s/g, '') || 'grinder', avatar });
    setSaving(false);
  };

  const next = () => setStep((current) => Math.min(steps.length - 1, current + 1));
  const previous = () => setStep((current) => Math.max(0, current - 1));
  const content = [
    <WelcomeStep key="welcome" name={displayName} />,
    <IdentityStep key="identity" name={displayName} setName={setDisplayName} username={username} setUsername={setUsername} />,
    <AvatarStep key="avatar" avatar={avatar} customAvatar={customAvatar} setAvatar={setAvatar} onUpload={() => fileInput.current?.click()} />,
    <CompanionStep key="companion" />,
    <TutorialStep key="tutorial" />,
  ][step];

  return <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-5 py-8"><div className="onboarding-glow" /><div className="relative w-full max-w-3xl"><div className="mb-8 flex items-center justify-between"><div className="flex items-center gap-2"><span className="brand-mark">G</span><span className="font-display font-bold">Grindly</span></div><span className="eyebrow">Your first quest · 0{step + 1}/0{steps.length}</span></div><div className="mb-8 flex gap-1.5">{steps.map((item, index) => <div key={item} className={`h-1 flex-1 rounded-full transition ${index <= step ? 'bg-lime' : 'bg-white/10'}`} />)}</div><AnimatePresence mode="wait"><motion.div key={steps[step]} initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }} transition={{ duration: .3 }}>{content}</motion.div></AnimatePresence><div className="mt-9 flex items-center justify-between">{step > 0 ? <button onClick={previous} className="btn-secondary flex items-center gap-2"><ChevronLeft size={16} /> Back</button> : <span />}{step < steps.length - 1 ? <button onClick={next} disabled={step === 1 && (!displayName.trim() || !username.trim())} className="btn-primary flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-40">Continue <ArrowRight size={16} /></button> : <button onClick={finish} disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">{saving ? 'Saving...' : 'Enter Grindly'} <Sparkles size={16} /></button>}</div><input ref={fileInput} type="file" accept="image/*" onChange={selectFile} className="hidden" /></div></div>;
}

function WelcomeStep({ name }) { return <div className="mx-auto max-w-xl text-center"><motion.div initial={{ scale: .7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 170 }}><GrindlyCharacter mood="happy" size="lg" /></motion.div><p className="eyebrow mt-7 text-lime">A new run begins</p><h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-6xl">Welcome{ name ? `, ${name}` : ''}.<br /><span className="text-lime">Let’s make it count.</span></h1><p className="mx-auto mt-5 max-w-md text-sm leading-7 text-muted">Grindly turns real-life work into quests, rewards consistency, and gives your progress a place to glow.</p></div>; }

function IdentityStep({ name, setName, username, setUsername }) { return <div className="mx-auto max-w-xl"><div className="text-center"><p className="eyebrow text-lime">Step 02 · Your identity</p><h1 className="mt-3 font-display text-4xl font-extrabold">Choose your Grindly name.</h1><p className="mt-3 text-sm text-muted">This is how your future wins will be remembered.</p></div><div className="mt-8 grid gap-4 rounded-3xl border border-white/10 bg-panel p-5 sm:p-7"><label><span className="field-label">Display name</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Jishnu" className="field-input text-lg" /></label><label><span className="field-label">Username</span><div className="flex items-center gap-2"><span className="text-muted">@</span><input value={username} onChange={(event) => setUsername(event.target.value.replace(/\s/g, '').slice(0, 24))} placeholder="yourgrind" className="field-input" /></div></label><p className="text-xs text-muted">You can change these later from your profile.</p></div></div>; }

function AvatarStep({ avatar, customAvatar, setAvatar, onUpload }) { return <div className="mx-auto max-w-xl"><div className="text-center"><p className="eyebrow text-lime">Step 03 · Your signal</p><h1 className="mt-3 font-display text-4xl font-extrabold">Choose your avatar.</h1><p className="mt-3 text-sm text-muted">Pick a built-in identity or bring your own image.</p></div><div className="mt-8 grid grid-cols-5 gap-2 sm:gap-3">{avatarOptions.map((option) => <button key={option.id} onClick={() => setAvatar(option.id)} className={`grid aspect-square place-items-center rounded-2xl border transition ${avatar === option.id && !customAvatar ? 'border-lime bg-lime/15 shadow-[0_0_22px_rgba(200,241,105,.2)]' : 'border-white/10 bg-panel hover:scale-105 hover:border-lime/30'}`}><Avatar avatar={option.id} size="sm" border={false} /><span className="sr-only">{option.name}</span></button>)}</div><button onClick={onUpload} className={`mt-5 flex w-full items-center justify-center gap-3 rounded-2xl border border-dashed p-4 transition ${customAvatar ? 'border-lime/50 bg-lime/10' : 'border-white/15 bg-panel hover:border-lime/30'}`}><Avatar avatar={customAvatar} size="sm" border={false} /><span className="text-left"><strong className="block text-sm">{customAvatar ? 'Custom avatar selected' : 'Create custom avatar'}</strong><span className="text-xs text-muted">Choose an image from your device</span></span><ImagePlus size={18} className="ml-auto text-lime" /></button></div>; }

function CompanionStep() { return <div className="mx-auto max-w-xl text-center"><p className="eyebrow text-lime">Step 04 · Meet your companion</p><h1 className="mt-3 font-display text-4xl font-extrabold">This is Grindly.</h1><div className="relative mt-8 rounded-3xl border border-lime/20 bg-gradient-to-br from-[#1b3020] to-panel p-8"><motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}><GrindlyCharacter mood="talking" size="lg" /></motion.div><div className="speech-bubble mx-auto mt-6 max-w-sm text-left"><p className="font-display font-bold text-lime">Hey! I’m Grindly.</p><p className="mt-2 text-sm leading-6 text-slate-200">I’m here to help turn real-life work into quests. Ready to make your next move?</p></div></div></div>; }

function TutorialStep() { return <div className="mx-auto max-w-xl"><div className="text-center"><p className="eyebrow text-lime">Step 05 · The loop</p><h1 className="mt-3 font-display text-4xl font-extrabold">Focus. Finish.<br /><span className="text-lime">Feel the progress.</span></h1><p className="mt-3 text-sm text-muted">One active quest at a time. Your attention is the power-up.</p></div><div className="mt-8 space-y-3">{[['01', 'Start one quest', 'A focus timer starts on the server. Other quests wait for you.'], ['02', 'Stay with it', 'When the required time is complete, confirm your work.'], ['03', 'Get the reward', 'XP, coins, attributes, and streak progress are calculated fairly.']].map(([number, title, text]) => <div key={number} className="flex gap-4 rounded-2xl border border-white/10 bg-panel p-4"><span className="font-mono text-xs text-lime">{number}</span><div><p className="font-bold">{title}</p><p className="mt-1 text-sm leading-6 text-muted">{text}</p></div><Check size={16} className="ml-auto mt-1 text-lime" /></div>)}</div></div>; }
