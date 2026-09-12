import { useEffect, useRef, useState } from 'react';
import { Github, Mail, Phone, ShieldCheck, Sparkles } from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
} from 'firebase/auth';
import { firebaseAuth, firebaseConfigured, githubProvider, googleProvider } from '../services/firebase';

const countries = [
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+1', name: 'United States', flag: '🇺🇸' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: '+971', name: 'UAE', flag: '🇦🇪' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬' },
];

export default function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState('signin');
  const [method, setMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState(countries[0]);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [agreements, setAgreements] = useState({ terms: false, privacy: false, community: false });
  const recaptcha = useRef(null);

  useEffect(() => () => { if (recaptcha.current) recaptcha.current.clear(); }, []);

  const run = async (callback) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await callback();
      onAuthenticated(result.user || result);
    } catch (authError) {
      setError(readableError(authError));
    } finally {
      setBusy(false);
    }
  };

  const submitEmail = (event) => {
    event.preventDefault();
    if (mode === 'signup' && !Object.values(agreements).every(Boolean)) {
      setError('Please accept all three agreements before creating your account.');
      return;
    }
    run(() => mode === 'signin'
      ? signInWithEmailAndPassword(firebaseAuth, email, password)
      : createUserWithEmailAndPassword(firebaseAuth, email, password));
  };

  const resetPassword = async () => {
    if (!email) {
      setError('Enter your email address first.');
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
      setNotice('Password reset email sent. Check your inbox.');
    } catch (authError) {
      setError(readableError(authError));
    } finally {
      setBusy(false);
    }
  };

  const social = (provider) => {
    if (mode === 'signup' && !Object.values(agreements).every(Boolean)) {
      setError('Please accept all three agreements before creating your account.');
      return;
    }
    run(() => signInWithPopup(firebaseAuth, provider));
  };

  const sendPhoneCode = async () => {
    if (!phone.trim()) {
      setError('Enter your phone number.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      recaptcha.current = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', { size: 'invisible' });
      const result = await signInWithPhoneNumber(firebaseAuth, `${country.code}${phone.replace(/\D/g, '')}`, recaptcha.current);
      setConfirmation(result);
      setNotice(`Verification code sent to ${country.code} ${phone}.`);
    } catch (authError) {
      setError(readableError(authError));
    } finally {
      setBusy(false);
    }
  };

  const verifyPhoneCode = () => run(() => confirmation.confirm(code));

  if (!firebaseConfigured) return <SetupRequired />;
  return <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-5 py-8"><div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-lime/10 blur-[120px]" /><div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-panel shadow-2xl lg:grid-cols-[1.05fr_.95fr]"><div className="hidden flex-col justify-between bg-gradient-to-br from-[#1b2b1e] to-[#101615] p-10 lg:flex"><div><div className="flex items-center gap-2"><span className="brand-mark">G</span><span className="font-display text-lg font-bold">Grindly</span></div><p className="eyebrow mt-24 text-lime">Life, made playable</p><h1 className="mt-4 max-w-sm font-display text-5xl font-extrabold leading-[1.05]">Your real work deserves a <span className="text-lime">real reward.</span></h1><p className="mt-6 max-w-sm text-sm leading-7 text-muted">Start quests, build momentum, and let your consistency become visible.</p></div><div className="flex items-center gap-3 text-xs text-muted"><ShieldCheck size={16} className="text-lime" /> Rewards are validated server-side.</div></div><div className="p-6 sm:p-10"><div className="flex items-center justify-between"><div><p className="eyebrow text-lime">Welcome back</p><h2 className="mt-2 font-display text-3xl font-extrabold">{mode === 'signin' ? 'Sign in to grind.' : 'Create your account.'}</h2></div><Sparkles className="text-lime" size={21} /></div><div className="mt-7 grid grid-cols-3 gap-2 rounded-xl bg-black/20 p-1"><button onClick={() => setMethod('email')} className={`rounded-lg py-2 text-xs font-bold ${method === 'email' ? 'bg-white/10 text-white' : 'text-muted'}`}><Mail size={14} className="mx-auto mb-1" />Email</button><button onClick={() => setMethod('phone')} className={`rounded-lg py-2 text-xs font-bold ${method === 'phone' ? 'bg-white/10 text-white' : 'text-muted'}`}><Phone size={14} className="mx-auto mb-1" />Phone</button><button onClick={() => setMethod('social')} className={`rounded-lg py-2 text-xs font-bold ${method === 'social' ? 'bg-white/10 text-white' : 'text-muted'}`}><Github size={14} className="mx-auto mb-1" />Social</button></div>{error && <p className="mt-4 rounded-xl border border-[#ff8060]/25 bg-[#ff8060]/10 p-3 text-sm text-[#ffb09b]">{error}</p>}{notice && <p className="mt-4 rounded-xl border border-lime/25 bg-lime/10 p-3 text-sm text-lime-soft">{notice}</p>}{mode === 'signup' && <AgreementList agreements={agreements} setAgreements={setAgreements} />}{method === 'email' && <form onSubmit={submitEmail} className="mt-6 space-y-4"><label><span className="field-label">Email</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="field-input" placeholder="you@example.com" /></label><label><span className="field-label">Password</span><input required minLength="6" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="field-input" placeholder="6+ characters" /></label><div className="flex items-center justify-between gap-3"><button type="button" onClick={resetPassword} disabled={busy || mode !== 'signin'} className="text-xs font-bold text-lime disabled:cursor-not-allowed disabled:opacity-40">Forgot password?</button><button disabled={busy} className="btn-primary flex-1 disabled:opacity-50">{busy ? 'Working...' : mode === 'signin' ? 'Sign in' : 'Create account'}</button></div></form>}{method === 'phone' && <div className="mt-6 space-y-4"><label><span className="field-label">Country</span><select value={country.code} onChange={(event) => setCountry(countries.find((item) => item.code === event.target.value) || countries[0])} className="field-input">{countries.map((item) => <option key={item.code} value={item.code}>{item.flag} {item.name} ({item.code})</option>)}</select></label><label><span className="field-label">Phone number</span><div className="flex gap-2"><div className="grid min-w-16 place-items-center rounded-xl border border-white/10 bg-black/20 px-2 text-sm text-lime">{country.code}</div><input type="tel" inputMode="numeric" value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, ''))} className="field-input" placeholder="9876543210" /></div></label>{confirmation && <label><span className="field-label">Verification code</span><input type="text" inputMode="numeric" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} className="field-input" placeholder="123456" /></label>}<button onClick={confirmation ? verifyPhoneCode : sendPhoneCode} disabled={busy} className="btn-primary w-full disabled:opacity-50">{busy ? 'Working...' : confirmation ? 'Verify code' : 'Send code'}</button><div id="recaptcha-container" /></div>}{method === 'social' && <div className="mt-6 space-y-3"><button onClick={() => social(googleProvider)} disabled={busy} className="btn-secondary flex w-full items-center justify-center gap-2"><span className="font-bold text-[#4285f4]">G</span> Continue with Google</button><button onClick={() => social(githubProvider)} disabled={busy} className="btn-secondary flex w-full items-center justify-center gap-2"><Github size={17} /> Continue with GitHub</button></div>}<p className="mt-7 text-center text-sm text-muted">{mode === 'signin' ? 'New to Grindly?' : 'Already have an account?'} <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setNotice(''); }} className="font-bold text-lime">{mode === 'signin' ? 'Create one' : 'Sign in'}</button></p></div></div></div>;
}

function AgreementList({ agreements, setAgreements }) { const items = [{ key: 'terms', label: 'I agree to the', link: 'Terms & Conditions' }, { key: 'privacy', label: 'I have read and agree to the', link: 'Privacy Policy' }, { key: 'community', label: 'I agree to the', link: 'Community Guidelines' }]; return <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.03] p-4"><p className="field-label">Before you begin</p>{items.map((item) => <label key={item.key} className="mt-3 flex items-start gap-3 text-xs leading-5 text-muted"><input type="checkbox" checked={agreements[item.key]} onChange={(event) => setAgreements((current) => ({ ...current, [item.key]: event.target.checked }))} className="mt-1 accent-lime" /><span>{item.label} <a href={`/${item.key}.html`} target="_blank" rel="noreferrer" className="font-bold text-lime underline">{item.link}</a>.</span></label>)}</div>; }

function SetupRequired() { return <div className="flex min-h-screen items-center justify-center bg-ink px-5"><div className="max-w-lg rounded-3xl border border-white/10 bg-panel p-8 text-center"><span className="brand-mark mx-auto">G</span><h1 className="mt-6 font-display text-3xl font-extrabold">Firebase is almost ready.</h1><p className="mt-3 text-sm leading-7 text-muted">Add the VITE_FIREBASE_* values from your Firebase web app to frontend/.env.local, then reload Grindly.</p></div></div>; }

function readableError(error) { const messages = { 'auth/invalid-credential': 'That email or password is not correct.', 'auth/email-already-in-use': 'That email is already registered.', 'auth/popup-closed-by-user': 'The sign-in window was closed.', 'auth/invalid-phone-number': 'Enter a valid phone number.', 'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.' }; return messages[error.code] || error.message || 'Authentication failed. Check your Firebase settings.'; }
