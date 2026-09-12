import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, Bot, Home as HomeIcon, LogOut, MessageCircle, Plus, ShoppingBag, Sparkles, User, X } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { firebaseAuth, firebaseConfigured } from './services/firebase';
import { api } from './services/api';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Shop from './pages/Shop';
import Leaderboard from './pages/Leaderboard';

const navItems = [
  { id: 'home', label: 'Today', icon: HomeIcon },
  { id: 'leaderboard', label: 'Ranks', icon: Award },
  { id: 'shop', label: 'Vault', icon: ShoppingBag },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [quests, setQuests] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [toast, setToast] = useState(null);
  const [assistantOpen, setAssistantOpen] = useState(false);

  useEffect(() => {
    if (!firebaseAuth) {
      setLoadingAuth(false);
      return undefined;
    }
    return onAuthStateChanged(firebaseAuth, (nextUser) => {
      setFirebaseUser(nextUser);
      setLoadingAuth(false);
    });
  }, []);

  useEffect(() => {
    if (!firebaseUser) {
      setUser(null);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoadingData(true);
      setDataError('');
      try {
        const token = () => firebaseUser.getIdToken();
        const [me, nextQuests, nextLeaderboard, nextShop] = await Promise.all([api.getMe(token), api.getQuests(token), api.getLeaderboard(token), api.getShop(token)]);
        if (!cancelled) {
          setUser(me);
          setQuests(nextQuests);
          setLeaderboard(nextLeaderboard);
          setShopItems(nextShop);
        }
      } catch (error) {
        if (!cancelled) {
          setDataError(error.message || 'Could not load your progression.');
          setToast({ message: error.message, tone: 'warning' });
        }
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [firebaseUser]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const token = () => firebaseUser.getIdToken();
  const showToast = (message, tone = 'success') => setToast({ message, tone });

  const handleStartQuest = async (questId) => {
    try {
      const started = await api.startQuest(questId, token);
      setQuests((current) => current.map((quest) => quest.id === questId ? started : quest));
      showToast('Quest started. Stay with it until the timer is satisfied.');
    } catch (error) { showToast(error.message, 'warning'); }
  };

  const handleCompleteQuest = async (questId) => {
    try {
      const result = await api.completeQuest(questId, token);
      setQuests((current) => current.map((quest) => quest.id === questId ? result.quest : quest));
      setUser(result.user);
      showToast(`Quest cleared. +${result.reward.xp} XP · +${result.reward.coins} coins.`);
      const nextLeaderboard = await api.getLeaderboard(token);
      setLeaderboard(nextLeaderboard);
      return true;
    } catch (error) {
      const remaining = error.payload?.remainingSeconds;
      showToast(remaining ? `Keep going. ${Math.ceil(remaining / 60)} minutes remain on this quest.` : error.message, 'warning');
      return false;
    }
  };

  const handleCreateQuest = async (questData) => {
    try {
      const quest = await api.createQuest({ ...questData, estimated_minutes: Number(questData.duration) }, token);
      setQuests((current) => [quest, ...current]);
      showToast('Quest added. Start it when you are ready to work.');
    } catch (error) { showToast(error.message, 'warning'); }
  };

  const handlePurchase = async (itemId) => {
    try {
      const result = await api.purchase(itemId, token);
      setShopItems((current) => current.map((item) => item.id === itemId ? result.item : item));
      setUser(result.user);
      showToast(`${result.item.name} added to your collection.`);
    } catch (error) { showToast(error.message, 'warning'); }
  };

  if (loadingAuth) return <LoadingScreen message="Connecting to Grindly..." />;
  if (!firebaseConfigured || !firebaseUser) return <Auth onAuthenticated={setFirebaseUser} />;
  if (loadingData) return <LoadingScreen message="Loading your progression..." />;
  if (dataError || !user) return <DataErrorScreen message={dataError || 'Your profile could not be loaded.'} onRetry={() => setFirebaseUser({ ...firebaseUser })} onSignOut={() => signOut(firebaseAuth)} />;

  const page = {
    home: <Home user={user} quests={quests} onStart={handleStartQuest} onComplete={handleCompleteQuest} onCreateQuest={handleCreateQuest} onOpenAssistant={() => setAssistantOpen(true)} />,
    profile: <Profile user={user} activity={user.activity || []} />,
    shop: <Shop user={user} items={shopItems} onPurchase={handlePurchase} />,
    leaderboard: <Leaderboard user={user} entries={leaderboard} />,
  }[currentPage];

  return <div className="min-h-screen bg-ink text-white"><div className="app-noise" /><div className="relative mx-auto flex min-h-screen max-w-[1600px]"><aside className="hidden w-24 shrink-0 flex-col items-center border-r border-white/10 bg-ink/80 py-7 lg:flex"><button onClick={() => setCurrentPage('home')} className="brand-mark" aria-label="Go to today's quests">G</button><div className="mt-20 flex flex-col gap-4">{navItems.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setCurrentPage(id)} className={`nav-rail-button ${currentPage === id ? 'nav-rail-button-active' : ''}`} title={label}><Icon size={19} strokeWidth={1.8} /><span>{label}</span></button>)}</div><button className="mt-auto nav-rail-button" onClick={() => signOut(firebaseAuth)} title="Sign out"><LogOut size={19} strokeWidth={1.8} /><span>Sign out</span></button></aside><main className="min-w-0 flex-1 pb-24 lg:pb-0"><AnimatePresence mode="wait"><motion.div key={currentPage} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .22 }}>{page}</motion.div></AnimatePresence></main><aside className="hidden w-[310px] shrink-0 border-l border-white/10 bg-ink/60 px-5 py-7 xl:block"><CompanionCard onOpen={() => setAssistantOpen(true)} /></aside></div><nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/90 px-3 py-2 backdrop-blur-xl lg:hidden"><div className="mx-auto flex max-w-lg items-center justify-around">{navItems.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setCurrentPage(id)} className={`mobile-nav-button ${currentPage === id ? 'mobile-nav-button-active' : ''}`}><Icon size={19} /><span>{label}</span></button>)}<button onClick={() => signOut(firebaseAuth)} className="mobile-nav-button"><LogOut size={19} /><span>Exit</span></button></div></nav><AnimatePresence>{assistantOpen && <CompanionPanel onClose={() => setAssistantOpen(false)} />} {toast && <Toast toast={toast} />}</AnimatePresence></div>;
}

function LoadingScreen({ message }) { return <div className="grid min-h-screen place-items-center bg-ink"><div className="text-center"><span className="brand-mark mx-auto">G</span><p className="mt-5 text-sm text-muted">{message}</p></div></div>; }

function DataErrorScreen({ message, onRetry, onSignOut }) { return <div className="grid min-h-screen place-items-center bg-ink px-5"><div className="max-w-lg rounded-3xl border border-[#ff8060]/25 bg-panel p-8 text-center"><span className="brand-mark mx-auto">G</span><h1 className="mt-6 font-display text-3xl font-extrabold">We couldn’t load your progression.</h1><p className="mt-3 text-sm leading-7 text-muted">{message}</p><div className="mt-6 flex justify-center gap-3"><button onClick={onRetry} className="btn-primary">Try again</button><button onClick={onSignOut} className="btn-secondary">Sign out</button></div></div></div>; }

function CompanionCard({ onOpen }) { return <div className="companion-card"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="status-dot" /><span className="eyebrow">Your companion</span></div><Sparkles size={16} className="text-lime" /></div><div className="mt-8 flex items-center gap-3"><div className="bot-orb"><Bot size={22} /></div><div><p className="font-display text-lg font-semibold">Grindly</p><p className="text-xs text-muted">Focus coach · always on</p></div></div><p className="mt-6 text-sm leading-6 text-slate-300">Turn the thing you’re avoiding into a quest. I’ll help you make it clear, doable, and worth showing up for.</p><button onClick={onOpen} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-lime px-4 py-3 text-sm font-bold text-ink transition hover:bg-lime-soft"><MessageCircle size={16} /> Talk to Grindly</button></div>; }

function CompanionPanel({ onClose }) { const [message, setMessage] = useState(''); const [messages, setMessages] = useState([{ id: 1, from: 'bot', text: 'What are we turning into a quest today?' }]); const send = (value = message) => { const text = value.trim(); if (!text) return; setMessages((current) => [...current, { id: Date.now(), from: 'user', text }, { id: Date.now() + 1, from: 'bot', text: 'I can help shape that into a focused quest. Open Today and give it a realistic time estimate so your reward stays fair.' }]); setMessage(''); }; return <motion.div className="fixed inset-0 z-50 flex items-end justify-end bg-black/50 p-4 backdrop-blur-sm sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex h-[min(680px,calc(100vh-2rem))] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/15 bg-panel shadow-2xl"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div className="flex items-center gap-3"><div className="bot-orb bot-orb-sm"><Bot size={18} /></div><div><p className="font-semibold">Grindly</p><p className="text-xs text-muted">Your momentum co-pilot</p></div></div><button onClick={onClose} className="icon-button"><X size={18} /></button></div><div className="flex-1 space-y-4 overflow-y-auto p-5">{messages.map((entry) => <div key={entry.id} className={`flex ${entry.from === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${entry.from === 'user' ? 'rounded-br-sm bg-lime text-ink' : 'rounded-bl-sm bg-white/8 text-slate-200'}`}>{entry.text}</div></div>)}<div className="flex flex-wrap gap-2"><button onClick={() => send('How do rewards work?')} className="chip-button">Explain rewards</button><button onClick={() => send('Help me make a task')} className="chip-button"><Plus size={13} /> Make a task</button></div></div><form onSubmit={(event) => { event.preventDefault(); send(); }} className="border-t border-white/10 p-4"><div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 p-2"><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell me what you need to do..." className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-muted" /><button className="rounded-xl bg-lime p-2.5 text-ink" aria-label="Send message"><MessageCircle size={16} /></button></div></form></motion.div></motion.div>; }

function Toast({ toast }) { return <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className={`fixed bottom-20 right-5 z-[60] max-w-sm rounded-2xl border px-4 py-3 text-sm font-medium shadow-2xl lg:bottom-6 ${toast.tone === 'warning' ? 'border-amber-400/30 bg-amber-400/10 text-amber-100' : 'border-lime/30 bg-[#172117] text-lime-soft'}`}>{toast.message}</motion.div>; }
