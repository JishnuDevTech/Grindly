import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Check, Search, UserPlus, Users, X, Zap } from 'lucide-react';
import { api } from '../services/api';
import { Avatar } from '../components/Avatar';

export default function Leaderboard({
  user, entries: allEntries, friendEntries = [], getToken, friends: initialFriends = [],
  friendRequests: initialRequests = { incoming: [], outgoing: [] }, onFriendsChange,
  onRequestsChange, onFriendLeaderboardChange,
}) {
  const [tab, setTab] = useState('global');
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [friends, setFriends] = useState(initialFriends);
  const [requests, setRequests] = useState(initialRequests);
  const [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const entries = tab === 'global' ? allEntries : friendEntries;

  useEffect(() => setFriends(initialFriends), [initialFriends]);
  useEffect(() => setRequests(initialRequests), [initialRequests]);
  useEffect(() => {
    let cancelled = false;
    const refreshSocial = async () => {
      try {
        const [nextFriends, nextRequests, nextLeaderboard] = await Promise.all([
          api.getFriends(getToken), api.getFriendRequests(getToken), api.getFriendLeaderboard(getToken),
        ]);
        if (!cancelled) {
          setFriends(nextFriends);
          setRequests(nextRequests);
          onFriendsChange?.(nextFriends);
          onRequestsChange?.(nextRequests);
          onFriendLeaderboardChange?.(nextLeaderboard);
        }
      } catch {
        // The existing page error state handles explicit user actions; polling should not interrupt the leaderboard.
      }
    };
    const interval = window.setInterval(refreshSocial, 15000);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [getToken, onFriendLeaderboardChange, onFriendsChange, onRequestsChange]);

  const updateFriends = (next) => { setFriends(next); onFriendsChange?.(next); };
  const updateRequests = (next) => { setRequests(next); onRequestsChange?.(next); };
  const openProfile = async (username) => {
    setProfileLoading(true); setError('');
    try { setProfile(await api.getPublicProfile(username, getToken)); } catch (e) { setError(e.message); } finally { setProfileLoading(false); }
  };
  const search = async (event) => {
    event.preventDefault();
    if (!query.trim()) { setResults([]); return; }
    try { setResults(await api.searchFriends(query.trim(), getToken)); setError(''); } catch (e) { setError(e.message); }
  };
  const sendRequest = async (person) => {
    if (person.id === user.id) return;
    setPendingAction(`send-${person.id}`); setError('');
    try {
      await api.sendFriendRequest(person.id, getToken);
      setResults((items) => items.map((item) => item.id === person.id ? { ...item, relationship: 'pending' } : item));
      setRequests((current) => ({ ...current, outgoing: [...current.outgoing, { userId: person.id, username: person.username, displayName: person.displayName, avatar: person.avatar }] }));
      setProfile((current) => current?.id === person.id ? { ...current, relationship: 'pending' } : current);
    } catch (e) { setError(e.message); } finally { setPendingAction(null); }
  };
  const changeRequest = async (request, action) => {
    setPendingAction(`${action}-${request.id}`); setError('');
    try {
      if (action === 'accept') {
        await api.acceptFriendRequest(request.id, getToken);
        const nextFriends = await api.getFriends(getToken);
        updateFriends(nextFriends);
        onFriendLeaderboardChange?.(await api.getFriendLeaderboard(getToken));
        setProfile((current) => current?.id === request.userId ? { ...current, relationship: 'friends', friendCount: (current.friendCount || 0) + 1 } : current);
      } else await api.rejectFriendRequest(request.id, getToken);
      const nextRequests = await api.getFriendRequests(getToken);
      updateRequests(nextRequests);
    } catch (e) { setError(e.message); } finally { setPendingAction(null); }
  };
  const removeFriend = async (person) => {
    setPendingAction(`remove-${person.id}`); setError('');
    try {
      await api.removeFriend(person.id, getToken);
      const [nextFriends, nextLeaderboard] = await Promise.all([api.getFriends(getToken), api.getFriendLeaderboard(getToken)]);
      updateFriends(nextFriends);
      onFriendLeaderboardChange?.(nextLeaderboard);
      setProfile((current) => current?.id === person.id ? { ...current, relationship: 'none', friendCount: Math.max(0, (current.friendCount || 1) - 1) } : current);
    } catch (e) { setError(e.message); } finally { setPendingAction(null); }
  };

  return (
    <div className="min-h-screen bg-ink"><div className="mx-auto max-w-6xl px-5 py-7 sm:px-8 lg:px-12 lg:py-10">
      <header className="flex flex-col justify-between gap-5 border-b border-white/8 pb-7 sm:flex-row sm:items-end">
        <div><p className="eyebrow">Friendly competition</p><h1 className="mt-2 font-display text-4xl font-extrabold">Climb the ranks.</h1><p className="mt-2 text-sm text-muted">A little visibility makes the work feel real.</p></div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-panel p-1"><button onClick={() => setTab('global')} className={`rounded-lg px-3 py-2 text-xs font-bold ${tab === 'global' ? 'bg-lime text-ink' : 'text-muted'}`}>Global</button><button onClick={() => setTab('friends')} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${tab === 'friends' ? 'bg-lime text-ink' : 'text-muted'}`}><Users size={13} /> Friends</button></div>
      </header>
      {entries.length ? <div className="mt-8 grid gap-4 md:grid-cols-3">{entries.slice(0, 3).map((player, index) => <PodiumCard key={player.username} player={player} place={index + 1} onOpen={openProfile} currentUserId={user.id} />)}</div> : <div className="mt-8 rounded-3xl border border-dashed border-white/15 bg-panel p-8 text-center text-sm text-muted">No friends are ranked yet. Search for a grinder and send a request to build your circle.</div>}
      <div className="mt-8 flex items-center justify-between"><div><p className="eyebrow">{tab === 'global' ? 'All players' : 'Your circle'}</p><h2 className="mt-2 font-display text-2xl font-extrabold">This week</h2></div><p className="flex items-center gap-2 text-xs text-muted"><Search size={14} /> Search and manage friends below</p></div>
      <SocialPanel query={query} setQuery={setQuery} search={search} results={results} sendRequest={sendRequest} friends={friends} requests={requests} changeRequest={changeRequest} openProfile={openProfile} pendingAction={pendingAction} />
      {error && <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-100">{error}</p>}
      <div className="mt-4 space-y-2">{entries.slice(3).map((player, index) => <PlayerRow key={player.username} player={player} index={index} onOpen={openProfile} />)}</div>
      <div className="mt-6 flex items-center justify-between rounded-2xl border border-dashed border-lime/25 bg-lime/5 p-4"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-lime text-ink"><ArrowUp size={17} /></div><div><p className="text-sm font-bold">You’re moving up</p><p className="text-xs text-muted">Your current global position</p></div></div><p className="font-display text-2xl font-extrabold text-lime">#{user.globalRank}</p></div>
      {profile && <ProfileModal profile={profile} currentUserId={user.id} loading={profileLoading} pendingAction={pendingAction} onClose={() => setProfile(null)} onSendRequest={sendRequest} onChangeRequest={changeRequest} onRemoveFriend={removeFriend} />}
      {profileLoading && !profile && <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 text-sm text-muted">Loading profile…</div>}
    </div></div>
  );
}

function SocialPanel({ query, setQuery, search, results, sendRequest, friends, requests, changeRequest, openProfile, pendingAction }) {
  return <section className="mt-4 grid gap-4 rounded-2xl border border-white/10 bg-panel p-4 lg:grid-cols-2">
    <div><p className="eyebrow">Find your people</p><form onSubmit={search} className="mt-3 flex gap-2"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search username or name" className="field-input min-w-0 flex-1" /><button className="btn-primary px-4"><Search size={15} /></button></form><div className="mt-3 space-y-2">{results.map((person) => <div key={person.id} className="flex items-center gap-3 rounded-xl border border-white/8 p-2"><Avatar avatar={person.avatar} size="sm" border={false} /><button onClick={() => openProfile(person.username)} className="min-w-0 flex-1 text-left"><p className="truncate text-sm font-bold">{person.displayName}</p><p className="truncate text-xs text-muted">@{person.username}</p></button>{person.relationship === 'none' && <button disabled={pendingAction === `send-${person.id}`} onClick={() => sendRequest(person)} className="rounded-lg bg-lime px-2 py-1.5 text-xs font-bold text-ink disabled:opacity-50"><UserPlus size={14} /></button>}{person.relationship !== 'none' && <span className="text-[.65rem] capitalize text-muted">{person.relationship === 'pending' ? 'Request sent' : person.relationship}</span>}</div>)}</div></div>
    <div><p className="eyebrow">Your circle · {friends.length}</p>{requests.incoming?.length > 0 && <div className="mt-3 space-y-2"><p className="text-xs font-bold text-lime">Incoming requests · accept below</p>{requests.incoming.map((request) => <div key={request.id} className="flex items-center gap-2 rounded-xl border border-lime/20 bg-lime/5 p-2"><Avatar avatar={request.avatar} size="sm" border={false} /><button onClick={() => openProfile(request.username)} className="min-w-0 flex-1 truncate text-left text-xs">@{request.username}</button><button disabled={pendingAction === `accept-${request.id}`} onClick={() => changeRequest(request, 'accept')} className="rounded-lg bg-lime p-1.5 text-ink disabled:opacity-50" aria-label={`Accept request from ${request.username}`}><Check size={14} /></button><button disabled={pendingAction === `reject-${request.id}`} onClick={() => changeRequest(request, 'reject')} className="rounded-lg bg-white/10 p-1.5 text-muted disabled:opacity-50" aria-label={`Reject request from ${request.username}`}><X size={14} /></button></div>)}</div>}<div className="mt-3 space-y-2">{friends.map((friend) => <button key={friend.id} onClick={() => openProfile(friend.username)} className="flex w-full items-center gap-3 rounded-xl border border-white/8 p-3 text-left"><Avatar avatar={friend.avatar} size="sm" border={false} /><span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold">@{friend.username}</span><span className="mt-1 block text-[.65rem] text-muted">{friend.completedQuests || 0} quests · {friend.streak || 0} day streak</span></span><span className="text-xs text-muted">{friend.xp?.toLocaleString?.() || 0} XP</span></button>)}</div></div>
  </section>;
}

function ProfileModal({ profile, currentUserId, pendingAction, onClose, onSendRequest, onChangeRequest, onRemoveFriend }) {
  const isSelf = profile.id === currentUserId;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5" onClick={onClose}><div className="w-full max-w-md rounded-3xl border border-white/15 bg-panel p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="flex items-start justify-between"><div className="flex items-center gap-3"><Avatar avatar={profile.avatar} size="lg" border={false} /><div><p className="font-display text-2xl font-extrabold">{profile.displayName} {isSelf && <span className="text-sm text-lime">YOU</span>}</p><p className="text-sm text-muted">@{profile.username}</p><p className="mt-1 text-xs text-muted">{profile.friendCount || 0} {profile.friendCount === 1 ? 'friend' : 'friends'}</p></div></div><button onClick={onClose} className="icon-button" aria-label="Close profile"><X size={17} /></button></div>{isSelf ? <p className="mt-5 rounded-xl border border-lime/25 bg-lime/10 px-4 py-3 text-center text-sm font-bold text-lime-soft">This is your player profile.</p> : <>{!profile.private && profile.relationship === 'none' && <button disabled={Boolean(pendingAction)} onClick={() => onSendRequest({ id: profile.id, username: profile.username, displayName: profile.displayName, avatar: profile.avatar })} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-lime px-4 py-3 text-sm font-bold text-ink disabled:opacity-50"><UserPlus size={16} /> Add friend</button>}{profile.relationship === 'incoming' && <div className="mt-5 flex gap-2"><button disabled={pendingAction === `accept-${profile.relationshipId}`} onClick={() => onChangeRequest({ id: profile.relationshipId, userId: profile.id }, 'accept')} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-lime px-4 py-3 text-sm font-bold text-ink disabled:opacity-50"><Check size={16} /> Accept friend</button><button disabled={pendingAction === `reject-${profile.relationshipId}`} onClick={() => onChangeRequest({ id: profile.relationshipId, userId: profile.id }, 'reject')} className="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-muted disabled:opacity-50">Decline</button></div>}{!profile.private && profile.relationship === 'pending' && <p className="mt-5 rounded-xl border border-lime/25 bg-lime/10 px-4 py-3 text-center text-sm font-bold text-lime-soft">Friend request sent</p>}{profile.relationship === 'friends' && <button disabled={pendingAction === `remove-${profile.id}`} onClick={() => onRemoveFriend(profile)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm font-bold text-rose-200 disabled:opacity-50"><Users size={16} /> Remove friend</button>}</>}{profile.private ? <p className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted">This player keeps their profile private.</p> : <><div className="mt-6 grid grid-cols-3 gap-3">{[['Level', profile.level], ['Streak', `${profile.streak}d`], ['XP', profile.experience?.toLocaleString?.()]].map(([label, value]) => <div key={label} className="rounded-xl border border-white/10 p-3"><p className="eyebrow">{label}</p><p className="mt-1 font-display text-xl font-bold">{value}</p></div>)}</div>{profile.achievements?.length > 0 && <div className="mt-5"><p className="eyebrow">Showcased achievements</p><div className="mt-2 flex flex-wrap gap-2">{profile.achievements.map((achievement) => <span key={achievement.id} className="rounded-full border border-lime/25 bg-lime/10 px-2.5 py-1 text-xs text-lime-soft">{achievement.name}</span>)}</div></div>}{profile.equippedItems?.length > 0 && <div className="mt-5"><p className="eyebrow">Equipped cosmetics</p><div className="mt-2 flex flex-wrap gap-2">{profile.equippedItems.map((item) => <span key={item.id} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">{item.name}</span>)}</div></div>}{profile.attributes && <p className="mt-5 text-xs text-muted">Stats are visible because this player has chosen to share them.</p>}</>}</div></div>;
}

function PodiumCard({ player, place, onOpen, currentUserId }) {
  const colors = { 1: 'from-[#725d24]/50 to-panel border-[#ffd27a]/35', 2: 'from-[#35434a]/50 to-panel border-white/20', 3: 'from-[#5b3b2e]/50 to-panel border-[#ffab91]/25' };
  const isSelf = player.id === currentUserId || player.isCurrentUser;
  return <button onClick={() => onOpen(player.username)} className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br p-5 text-left ${colors[place]}`}><div className="absolute right-4 top-3 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/20 font-display text-lg font-extrabold text-[#ffd27a]">{place}</div><div className="flex items-center gap-3"><span className="font-mono text-xs text-muted">0{place}</span><Avatar avatar={player.avatar} size="md" border={false} /><div className="min-w-0"><p className="truncate font-bold">{player.displayName} {isSelf && <span className="text-xs text-lime">YOU</span>}</p><p className="truncate text-xs text-muted">@{player.username}</p></div></div><div className="mt-6 flex items-end justify-between"><div><p className="eyebrow">Level</p><p className="mt-1 font-display text-2xl font-extrabold">{player.level}</p></div><div className="text-right"><p className="eyebrow">XP points</p><p className="mt-1 font-mono text-lg font-bold text-[#ffd27a]">{player.xp.toLocaleString()}</p></div></div></button>;
}

function PlayerRow({ player, index, onOpen }) {
  return <motion.button onClick={() => onOpen(player.username)} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * .04 }} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left sm:gap-5 sm:p-4 ${player.isCurrentUser ? 'border-lime/35 bg-lime/8' : 'border-white/10 bg-panel'}`}><span className="w-8 text-center font-mono text-xs text-muted">#{player.rank}</span><Avatar avatar={player.avatar} size="sm" border={false} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{player.displayName} {player.isCurrentUser && <span className="ml-1 text-[.6rem] font-normal text-lime">YOU</span>}</p><p className="mt-1 truncate text-xs text-muted">@{player.username}</p></div><div className="hidden items-center gap-1 text-xs text-muted sm:flex"><Zap size={13} className="text-lime" /> Level {player.level}</div><div className="text-right"><p className="font-mono text-sm font-bold text-[#ffd27a]">{player.xp.toLocaleString()}</p><p className="text-[.6rem] text-muted">points</p></div></motion.button>;
}
