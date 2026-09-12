import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, Bell, Home as HomeIcon, LogOut, MessageCircle, Plus, ShoppingBag, Sparkles, User, X, Route, Settings, Medal } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { firebaseAuth, firebaseConfigured } from './services/firebase';
import { api } from './services/api';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Shop from './pages/Shop';
import Leaderboard from './pages/Leaderboard';
import Onboarding from './pages/Onboarding';
import Progression from './pages/Progression';
import SettingsPage from './pages/Settings';
import Achievements from './pages/Achievements';
import { GrindlyCharacter } from './components/GrindlyCharacter';
import { Avatar } from './components/Avatar';
import { shopCatalog } from './data/mockData';

const navItems = [
  { id: 'home', label: 'Today', icon: HomeIcon },
  { id: 'leaderboard', label: 'Ranks', icon: Award },
  { id: 'shop', label: 'Vault', icon: ShoppingBag },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'progression', label: 'Journey', icon: Route },
  { id: 'achievements', label: 'Medals', icon: Medal },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');
  const [dataReloadKey, setDataReloadKey] = useState(0);
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [quests, setQuests] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [friendLeaderboard, setFriendLeaderboard] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState({ incoming: [], outgoing: [] });
  const [notifications, setNotifications] = useState({ items: [], unreadCount: 0 });
  const [preferences, setPreferences] = useState({});
  const [inventory, setInventory] = useState([]);
  const [aiContext, setAiContext] = useState(null);
  const [toast, setToast] = useState(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [theme, setTheme] = useState(() => window.localStorage.getItem('grindly-theme') || 'dark');

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
    if (!firebaseUser || !firebaseAuth?.currentUser) {
      setUser(null);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoadingData(true);
      setDataError('');
      try {
        const token = () => firebaseAuth.currentUser.getIdToken();
        const [me, nextQuests, nextLeaderboard, nextShop, nextFriendLeaderboard, nextFriends, nextRequests, nextNotifications, nextPreferences, nextInventory, nextAIContext] = await Promise.all([api.getMe(token), api.getQuests(token), api.getLeaderboard(token), api.getShop(token), api.getFriendLeaderboard(token), api.getFriends(token), api.getFriendRequests(token), api.getNotifications(token), api.getPreferences(token), api.getInventory(token), api.getAIContext(token)]);
        if (!cancelled) {
          setUser(me);
          setQuests(nextQuests);
          setLeaderboard(nextLeaderboard);
          setFriendLeaderboard(nextFriendLeaderboard);
          setFriends(nextFriends);
          setFriendRequests(nextRequests);
          setNotifications(nextNotifications);
          setPreferences(nextPreferences.preferences || {});
          setInventory(nextInventory.items || []);
          setAiContext(nextAIContext);
          const liveIds = new Set(nextShop.map((item) => item.id));
          setShopItems([...nextShop, ...shopCatalog.filter((item) => !liveIds.has(item.id))]);
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
  }, [firebaseUser, dataReloadKey]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const token = () => {
    const currentUser = firebaseAuth?.currentUser;
    if (!currentUser || typeof currentUser.getIdToken !== 'function') {
      throw new Error('Your Firebase session is no longer valid. Please sign in again.');
    }
    return currentUser.getIdToken();
  };
  const showToast = (message, tone = 'success') => setToast({ message, tone });

  const handleStartQuest = async (questId) => {
    if (quests.some((quest) => quest.status === 'active' && quest.id !== questId)) {
      showToast('Finish your current quest first.', 'warning');
      return;
    }
    try {
      const started = await api.startQuest(questId, token);
      setQuests((current) => current.map((quest) => quest.id === questId ? started : quest));
      showToast('Quest started. Stay with it until the timer is satisfied.');
    } catch (error) { showToast(error.payload?.message || error.message, 'warning'); }
  };

  const handleOnboardingComplete = async (payload) => {
    try {
      const nextUser = await api.updateMe(payload, token);
      setUser(nextUser);
      showToast('Your first run is ready. Welcome to Grindly.');
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
      return result;
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
      setInventory((current) => [...current, result.item]);
      setUser(result.user);
      showToast(`${result.item.name} added to your collection.`);
    } catch (error) { showToast(error.message, 'warning'); }
  };
  const handleEquip = async (itemId, equipped) => {
    try {
      const result = equipped ? await api.unequipItem(itemId, token) : await api.equipItem(itemId, token);
      setInventory((current) => current.map((item) => item.id === itemId ? { ...item, equipped: result.equipped } : item));
      setShopItems((current) => current.map((item) => item.id === itemId ? { ...item, equipped: result.equipped } : item));
      showToast(result.equipped ? 'Cosmetic equipped.' : 'Cosmetic unequipped.');
    } catch (error) { showToast(error.message, 'warning'); }
  };
  const handlePreferences = async (values) => {
    try {
      const result = await api.updatePreferences(values, token);
      setPreferences(result.preferences || {});
    } catch (error) { showToast(error.message, 'warning'); }
  };
  const handleAvatarChange = async (avatar) => {
    const previous = user.avatar;
    setUser((current) => ({ ...current, avatar }));
    try {
      const nextUser = await api.updateMe({ display_name: user.displayName, username: user.username, avatar }, token);
      setUser(nextUser);
      showToast('Avatar identity saved.');
    } catch (error) {
      setUser((current) => ({ ...current, avatar: previous }));
      showToast(error.message, 'warning');
    }
  };
  const markNotificationRead = async (id) => {
    try {
      await api.markNotificationRead(id, token);
      setNotifications((current) => ({ ...current, unreadCount: Math.max(0, current.unreadCount - 1), items: current.items.map((item) => item.id === id ? { ...item, read: true } : item) }));
    } catch (error) { showToast(error.message, 'warning'); }
  };
  const markAllNotificationsRead = async () => {
    try { await api.markAllNotificationsRead(token); setNotifications((current) => ({ ...current, unreadCount: 0, items: current.items.map((item) => ({ ...item, read: true })) })); } catch (error) { showToast(error.message, 'warning'); }
  };

  if (loadingAuth) return <LoadingScreen message="Connecting to Grindly..." />;
  if (!firebaseConfigured || !firebaseUser) return <Auth onAuthenticated={setFirebaseUser} />;
  if (loadingData) return <LoadingScreen message="Loading your progression..." />;
  if (dataError || !user) return <DataErrorScreen message={dataError || 'Your profile could not be loaded.'} onRetry={() => { setUser(null); setDataReloadKey((key) => key + 1); }} onSignOut={() => signOut(firebaseAuth)} />;
  if (!user.onboardingCompleted) return <Onboarding user={user} onComplete={handleOnboardingComplete} />;

  const activeQuest = quests.find((quest) => quest.status === 'active');
  const updateTheme = (nextTheme) => {
    setTheme(nextTheme);
    window.localStorage.setItem('grindly-theme', nextTheme);
    api.updatePreferences({ theme: nextTheme }, token).catch((error) => showToast(error.message, 'warning'));
  };

  const page = {
    home: <Home user={user} quests={quests} activeQuestId={activeQuest?.id} onStart={handleStartQuest} onComplete={handleCompleteQuest} onCreateQuest={handleCreateQuest} onOpenAssistant={() => setAssistantOpen(true)} />,
    profile: <Profile user={user} activity={user.activity || []} inventory={inventory} />,
    progression: <Progression user={user} />,
    achievements: <Achievements user={user} />,
    settings: <SettingsPage user={user} theme={theme} onThemeChange={updateTheme} preferences={preferences} onPreferencesChange={handlePreferences} onAvatarChange={handleAvatarChange} onSignOut={() => signOut(firebaseAuth)} />,
    shop: <Shop user={user} items={shopItems} inventory={inventory} onPurchase={handlePurchase} onEquip={handleEquip} />,
    leaderboard: <Leaderboard user={user} entries={leaderboard} friendEntries={friendLeaderboard} getToken={token} friends={friends} friendRequests={friendRequests} onFriendsChange={setFriends} onRequestsChange={setFriendRequests} onFriendLeaderboardChange={setFriendLeaderboard} />,
  }[currentPage];

  const lightTheme = theme === 'light' || (theme === 'system' && window.matchMedia?.('(prefers-color-scheme: light)').matches);
  const reducedMotion = preferences.animations === false;
  return <div className={`min-h-screen text-white ${lightTheme ? 'light-theme' : ''} ${reducedMotion ? 'reduce-motion' : ''}`}><div className="app-noise" /><div className="relative mx-auto flex min-h-screen max-w-[1600px]"><aside className="hidden w-24 shrink-0 flex-col items-center border-r border-white/10 bg-ink/80 py-7 lg:flex"><button onClick={() => setCurrentPage('home')} className="brand-mark" aria-label="Go to today's quests">G</button><button onClick={() => setCurrentPage('profile')} className="mt-4 rounded-2xl" aria-label="Open your profile"><Avatar avatar={user.avatar} size="sm" /></button><div className="mt-8 flex flex-col gap-3">{navItems.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setCurrentPage(id)} className={`nav-rail-button ${currentPage === id ? 'nav-rail-button-active' : ''}`} title={label}><Icon size={18} strokeWidth={1.8} /><span>{label}</span></button>)}</div><button className="mt-auto nav-rail-button" onClick={() => signOut(firebaseAuth)} title="Sign out"><LogOut size={19} strokeWidth={1.8} /><span>Sign out</span></button></aside><main className="min-w-0 flex-1 pb-24 lg:pb-0"><AnimatePresence mode="wait"><motion.div key={currentPage} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .22 }}>{page}</motion.div></AnimatePresence></main></div><NotificationCenter notifications={notifications} onRead={markNotificationRead} onReadAll={markAllNotificationsRead} /><CompanionPeek onOpen={() => setAssistantOpen(true)} /><nav className="fixed inset-x-0 bottom-0 z-40 overflow-x-auto border-t border-white/10 bg-ink/90 px-3 py-2 backdrop-blur-xl lg:hidden"><div className="mx-auto flex min-w-max max-w-lg items-center justify-around gap-2">{navItems.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setCurrentPage(id)} className={`mobile-nav-button ${currentPage === id ? 'mobile-nav-button-active' : ''}`}><Icon size={18} /><span>{label}</span></button>)}</div></nav><AnimatePresence>{assistantOpen && <CompanionPanel context={aiContext} onAction={async (action, input) => { const result = await api.runAIAction(action, input, token); if (result.quest) { setQuests((current) => [result.quest, ...current]); setAiContext((current) => ({ ...current, quests: [result.quest, ...(current.quests || [])] })); showToast('Grindly created your quest.'); } return result; }} user={user} quests={quests} onClose={() => setAssistantOpen(false)} />} {toast && <Toast toast={toast} />}</AnimatePresence></div>;
}

function LoadingScreen({ message }) { return <div className="grid min-h-screen place-items-center bg-ink"><div className="text-center"><span className="brand-mark mx-auto">G</span><p className="mt-5 text-sm text-muted">{message}</p></div></div>; }

function DataErrorScreen({ message, onRetry, onSignOut }) { return <div className="grid min-h-screen place-items-center bg-ink px-5"><div className="max-w-lg rounded-3xl border border-[#ff8060]/25 bg-panel p-8 text-center"><span className="brand-mark mx-auto">G</span><h1 className="mt-6 font-display text-3xl font-extrabold">We couldn’t load your progression.</h1><p className="mt-3 text-sm leading-7 text-muted">{message}</p><div className="mt-6 flex justify-center gap-3"><button onClick={onRetry} className="btn-primary">Try again</button><button onClick={onSignOut} className="btn-secondary">Sign out</button></div></div></div>; }

function CompanionCard({ onOpen }) { return <div className="companion-card"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="status-dot" /><span className="eyebrow">Your companion</span></div><Sparkles size={16} className="text-lime" /></div><div className="mt-7 flex items-center gap-3"><GrindlyCharacter mood="idle" size="sm" /><div><p className="font-display text-lg font-semibold">Grindly</p><p className="text-xs text-muted">Focus companion · always on</p></div></div><p className="mt-5 text-sm leading-6 text-slate-300">Turn the thing you’re avoiding into a quest. I’ll help you make it clear, doable, and worth showing up for.</p><button onClick={onOpen} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-lime px-4 py-3 text-sm font-bold text-ink transition hover:bg-lime-soft"><MessageCircle size={16} /> Talk to Grindly</button></div>; }
function CompanionPeek({ onOpen }) { return <motion.button initial={{ x: 32 }} animate={{ x: 0 }} whileHover={{ x: -7 }} onClick={onOpen} className="companion-peek" aria-label="Open Grindly companion"><GrindlyCharacter mood="idle" size="md" /><span className="companion-peek-label">Grindly</span></motion.button>; }

function CompanionPanel({ onClose, context, onAction }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([{ id: 1, from: 'bot', text: context?.user?.level ? `I have your current run: level ${context.user.level}, ${context.user.streak} day streak, and ${context.quests?.length || 0} open quests.` : 'What are we turning into a quest today?' }]);
  const send = async (value = message) => {
    const text = value.trim();
    if (!text) return;
    setMessages((current) => [...current, { id: Date.now(), from: 'user', text }]);
    setMessage('');
    const normalized = text.toLowerCase();
    let reply = 'I can read your Grindly context and help you choose the next honest quest.';
    const createMatch = text.match(/^create(?: a)? quest(?: called)? (.+?) for (\d+)\s*(?:minutes?|mins?)$/i);
    if (createMatch) {
      try {
        const result = await onAction('CREATE_QUEST', { title: createMatch[1].trim(), estimatedMinutes: Number(createMatch[2]), category: 'Personal', difficulty: 'Medium', priority: 'Medium' });
        reply = result.message || `Created ${createMatch[1].trim()} as a focused quest.`;
      } catch (error) {
        reply = error.message || 'I could not create that quest. Try a title and a time between 5 and 480 minutes.';
      }
    } else if (normalized.includes('level')) reply = `You are level ${context?.user?.level ?? 'unknown'} with ${context?.user?.experience ?? 0} XP toward your next level.`;
    else if (normalized.includes('streak')) reply = `Your current streak is ${context?.user?.streak ?? 0} days. Protect it with one finishable quest today.`;
    else if (normalized.includes('reward') || normalized.includes('xp')) reply = `You have ${context?.user?.coins ?? 0} coins and ${context?.user?.experience ?? 0} XP. Rewards come from completed focus sessions, not clicks.`;
    else if (normalized.includes('quest') || normalized.includes('task')) reply = context?.quests?.length ? `Your next open quest is ${context.quests[0].title}. Start there and keep one timer active.` : 'You have no open quests. Create a realistic quest with a time estimate first.';
    if (!createMatch) {
      try { await onAction('GET_PROGRESS', { question: text }); } catch { /* The local context answer remains available if the action log is unavailable. */ }
    }
    setMessages((current) => [...current, { id: Date.now() + 1, from: 'bot', text: reply }]);
  };
  return <motion.div className="fixed inset-0 z-50 flex items-end justify-end bg-black/50 p-4 backdrop-blur-sm sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex h-[min(680px,calc(100vh-2rem))] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/15 bg-panel shadow-2xl"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div className="flex items-center gap-3"><GrindlyCharacter mood="talking" size="sm" /><div><p className="font-semibold">Grindly</p><p className="text-xs text-muted">Context-aware focus co-pilot</p></div></div><button onClick={onClose} className="icon-button"><X size={18} /></button></div><div className="flex-1 space-y-4 overflow-y-auto p-5">{messages.map((entry) => <div key={entry.id} className={`flex ${entry.from === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${entry.from === 'user' ? 'rounded-br-sm bg-lime text-ink' : 'rounded-bl-sm bg-white/8 text-slate-200'}`}>{entry.text}</div></div>)}<div className="flex flex-wrap gap-2"><button onClick={() => send('What is my level?')} className="chip-button">My level</button><button onClick={() => send('What quest should I do next?')} className="chip-button"><Plus size={13} /> Next quest</button><button onClick={() => send('How is my streak?')} className="chip-button">Check streak</button></div></div><form onSubmit={(event) => { event.preventDefault(); send(); }} className="border-t border-white/10 p-4"><div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 p-2"><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask about your Grindly run..." className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-muted" /><button className="rounded-xl bg-lime p-2.5 text-ink" aria-label="Send message"><MessageCircle size={16} /></button></div></form></motion.div></motion.div>;
}

function Toast({ toast }) { return <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className={`fixed bottom-20 right-5 z-[60] max-w-sm rounded-2xl border px-4 py-3 text-sm font-medium shadow-2xl lg:bottom-6 ${toast.tone === 'warning' ? 'border-amber-400/30 bg-amber-400/10 text-amber-100' : 'border-lime/30 bg-[#172117] text-lime-soft'}`}>{toast.message}</motion.div>; }
function NotificationCenter({ notifications, onRead, onReadAll }) {
  const [open, setOpen] = useState(false);
  return <div className="fixed right-5 top-5 z-40"><button onClick={() => setOpen((current) => !current)} className="relative grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-panel/90 text-muted shadow-xl backdrop-blur hover:text-white" aria-label="Open notifications"><Bell size={18} />{notifications.unreadCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-lime px-1 text-[.6rem] font-extrabold text-ink">{notifications.unreadCount}</span>}</button>{open && <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border border-white/10 bg-panel shadow-2xl"><div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><p className="font-display font-bold">Notifications</p><button onClick={onReadAll} className="text-[.65rem] text-lime-soft">Mark all read</button></div><div className="max-h-80 overflow-y-auto">{notifications.items.length ? notifications.items.map((item) => <button key={item.id} onClick={() => onRead(item.id)} className={`block w-full border-b border-white/5 px-4 py-3 text-left ${item.read ? 'opacity-60' : 'bg-lime/5'}`}><p className="text-sm font-bold">{item.title}</p><p className="mt-1 text-xs leading-5 text-muted">{item.message}</p><p className="mt-1 text-[.6rem] text-muted">{new Date(item.createdAt).toLocaleString()}</p></button>) : <p className="p-5 text-sm text-muted">No notifications yet.</p>}</div></div>}</div>;
}
