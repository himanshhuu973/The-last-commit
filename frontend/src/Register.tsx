import { useState } from 'react';
import { api } from './api';

const TRACKS = ['AI/ML', 'Web', 'App', 'Open Innovation'];
const empty = { name: '', email: '', phone: '', college: '', year: '2', track: 'Web', teamName: '', experience: '' };

// The registration form is styled as a `git push`
export default function Register() {
  const [f, setF] = useState(empty);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'ok'>('idle');
  const [msg, setMsg] = useState('');
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrs({}); setMsg(''); setState('sending');
    try {
      const body: any = { ...f, year: Number(f.year) };
      for (const k of ['phone', 'teamName', 'experience']) if (!body[k]) delete body[k];
      const r = await api('/api/register', { method: 'POST', body: JSON.stringify(body) });
      setMsg(r.message); setState('ok'); setF(empty);
    } catch (err: any) {
      setState('idle');
      if (err.details) setErrs(Object.fromEntries(err.details.map((d: any) => [d.field, d.message])));
      setMsg(err.status === 409 ? 'This email is already registered.' : err.message);
    }
  }

  if (state === 'ok')
    return (
      <div className="push-ok">
        <p className="cmd">$ git push origin you</p>
        <p>Enumerating objects... done</p>
        <p>Writing objects: 100% (1/1)</p>
        <p className="good">✔ {msg}</p>
        <button className="btn" onClick={() => setState('idle')}>Register another person</button>
      </div>
    );

  const field = (k: string, label: string, props: any = {}) => (
    <label className={errs[k] ? 'err' : ''}>
      <span>{label}</span>
      <input value={(f as any)[k]} onChange={set(k)} {...props} />
      {errs[k] && <em>{errs[k]}</em>}
    </label>
  );

  return (
    <form className="form" onSubmit={submit} noValidate>
      <p className="cmd">$ git add --participant you</p>
      <div className="grid2">
        {field('name', 'name *', { autoComplete: 'name' })}
        {field('email', 'email *', { type: 'email', autoComplete: 'email' })}
        {field('phone', 'phone', { placeholder: '+919876543210' })}
        {field('college', 'college *')}
        <label>
          <span>year *</span>
          <select value={f.year} onChange={set('year')}>{[1, 2, 3, 4].map((y) => <option key={y}>{y}</option>)}</select>
        </label>
        <label>
          <span>track *</span>
          <select value={f.track} onChange={set('track')}>{TRACKS.map((t) => <option key={t}>{t}</option>)}</select>
        </label>
      </div>
      {field('teamName', 'team name (optional)')}
      <label>
        <span>what have you built before? (optional)</span>
        <textarea rows={3} value={f.experience} onChange={set('experience')} />
      </label>
      {msg && <p className="bad">✖ {msg}</p>}
      <button className="btn" disabled={state === 'sending'}>
        {state === 'sending' ? 'pushing...' : '$ git push origin you'}
      </button>
    </form>
  );
}
