import { useState } from 'react';
import { Bell, Check, ChevronRight, Moon, Palette, Shield, Volume2, Sun } from 'lucide-react';

const rows = [
  { id: 'notifications', label: 'Notifications', detail: 'Quest reminders and reward moments', icon: Bell },
  { id: 'sound', label: 'Sound effects', detail: 'Tactile feedback for starts and unlocks', icon: Volume2 },
  { id: 'animation', label: 'Motion & animation', detail: 'Keep the satisfying moments turned on', icon: Palette },
];

export default function SettingsPage({ theme, onThemeChange }) {
  const [preferences, setPreferences] = useState(() => Object.fromEntries(rows.map((row) => [row.id, window.localStorage.getItem(`grindly-${row.id}`) !== 'off'])));
  const toggle = (id) => setPreferences((current) => { const next = { ...current, [id]: !current[id] }; window.localStorage.setItem(`grindly-${id}`, next[id] ? 'on' : 'off'); return next; });
  return <div className="min-h-screen bg-ink"><div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10"><header className="border-b border-white/8 pb-8"><p className="eyebrow text-lime">Control room</p><h1 className="mt-2 font-display text-4xl font-extrabold">Settings</h1><p className="mt-2 text-sm text-muted">Tune Grindly so the world around your focus feels right.</p></header>
    <section className="mt-8"><p className="eyebrow">Appearance</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><ThemeButton active={theme === 'dark'} icon={Moon} label="Dark mode" onClick={() => onThemeChange('dark')} /><ThemeButton active={theme === 'light'} icon={Sun} label="Light mode" onClick={() => onThemeChange('light')} /></div></section>
    <section className="mt-8"><p className="eyebrow">Experience</p><div className="card mt-3 divide-y divide-white/8 p-0">{rows.map(({ id, label, detail, icon: Icon }) => <div key={id} className="flex items-center gap-4 p-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-lime/10 text-lime"><Icon size={18} /></div><div className="min-w-0 flex-1"><p className="text-sm font-bold">{label}</p><p className="mt-1 text-xs text-muted">{detail}</p></div><button onClick={() => toggle(id)} aria-pressed={preferences[id]} className={`relative h-6 w-11 rounded-full transition ${preferences[id] ? 'bg-lime' : 'bg-white/15'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${preferences[id] ? 'left-6' : 'left-1'}`} /></button></div>)}</div></section>
    <section className="mt-8"><p className="eyebrow">Account & trust</p><div className="card mt-3 divide-y divide-white/8 p-0">{[['Account settings', 'Update your identity and sign-in details'], ['Privacy', 'Choose what your profile shares'], ['Community guidelines', 'Keep the grind respectful'], ['Terms & Conditions', 'The rules of the journey'], ['Privacy Policy', 'How Grindly handles your data']].map(([label, detail]) => <button key={label} className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-white/[.03]"><Shield size={18} className="text-muted" /><span className="min-w-0 flex-1"><span className="block text-sm font-bold">{label}</span><span className="mt-1 block text-xs text-muted">{detail}</span></span><ChevronRight size={16} className="text-muted" /></button>)}</div></section>
  </div></div>;
}

function ThemeButton({ active, icon: Icon, label, onClick }) { return <button onClick={onClick} className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${active ? 'border-lime/40 bg-lime/10' : 'border-white/10 bg-panel hover:border-lime/25'}`}><Icon size={18} className={active ? 'text-lime' : 'text-muted'} /><span className="flex-1 text-sm font-bold">{label}</span>{active && <Check size={16} className="text-lime" />}</button>; }
