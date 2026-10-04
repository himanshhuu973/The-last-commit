import { useEffect, useState } from 'react';
import { api, API } from './api';

type Row = { label: string | number; count: number };

function Bars({ title, rows }: { title: string; rows: Row[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="panel">
      <h3>{title}</h3>
      {rows.length === 0 && <p className="dim">no data yet</p>}
      {rows.map((r) => (
        <div className="barrow" key={r.label}>
          <span>{r.label}</span>
          <div><i style={{ width: `${(r.count / max) * 100}%` }} /></div>
          <b>{r.count}</b>
        </div>
      ))}
    </div>
  );
}

function Trend({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const pts = data.map((d, i) => `${(i / Math.max(1, data.length - 1)) * 300},${80 - (d.count / max) * 70}`).join(' ');
  return (
    <div className="panel">
      <h3>Registrations, last 14 days</h3>
      <svg viewBox="0 0 300 90" className="trend"><polyline points={pts} fill="none" stroke="#39ff88" strokeWidth="2" /></svg>
      <div className="dim small">{data[0]?.date} → {data[data.length - 1]?.date}</div>
    </div>
  );
}

export default function Admin() {
  const [token, setToken] = useState(sessionStorage.getItem('tlc_token') || '');
  const [cred, setCred] = useState({ username: '', password: '' });
  const [err, setErr] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [list, setList] = useState<any>({ registrations: [], total: 0 });
  const [q, setQ] = useState({ search: '', track: '', page: 1 });

  const logout = () => { sessionStorage.removeItem('tlc_token'); setToken(''); setStats(null); };

  async function login(e: React.FormEvent) {
    e.preventDefault(); setErr('');
    try {
      const r = await api('/api/admin/login', { method: 'POST', body: JSON.stringify(cred) });
      sessionStorage.setItem('tlc_token', r.token); setToken(r.token);
    } catch (e: any) { setErr(e.message); }
  }

  useEffect(() => {
    if (!token) return;
    api('/api/admin/stats', { token }).then(setStats).catch((e) => e.status === 401 && logout());
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const p = new URLSearchParams({ page: String(q.page), limit: '10' });
    if (q.search) p.set('search', q.search);
    if (q.track) p.set('track', q.track);
    api('/api/admin/registrations?' + p, { token }).then(setList).catch(() => {});
  }, [token, q]);

  async function csv() {
    const r = await fetch(API + '/api/admin/export.csv', { headers: { Authorization: `Bearer ${token}` } });
    const url = URL.createObjectURL(await r.blob());
    Object.assign(document.createElement('a'), { href: url, download: 'registrations.csv' }).click();
  }

  if (!token)
    return (
      <main className="admin">
        <form className="form login" onSubmit={login}>
          <p className="cmd">$ sudo admin --login</p>
          <label><span>username</span><input value={cred.username} onChange={(e) => setCred({ ...cred, username: e.target.value })} /></label>
          <label><span>password</span><input type="password" value={cred.password} onChange={(e) => setCred({ ...cred, password: e.target.value })} /></label>
          {err && <p className="bad">✖ {err}</p>}
          <button className="btn">authenticate</button>
          <a href="#/" className="dim">← back to site</a>
        </form>
      </main>
    );

  const pages = Math.max(1, Math.ceil(list.total / 10));
  return (
    <main className="admin wide">
      <header className="adminbar">
        <h2>The Last Commit / admin</h2>
        <div><button className="btn sm" onClick={csv}>export csv</button> <button className="btn sm ghost" onClick={logout}>logout</button></div>
      </header>
      {stats && (
        <>
          <div className="stats">
            <div className="stat"><b>{stats.total}</b><span>total registrations</span></div>
            <div className="stat"><b>{stats.today}</b><span>registered today</span></div>
            <div className="stat"><b>{stats.withTeamName}</b><span>with a team name</span></div>
            <div className="stat"><b>{stats.topColleges.length}</b><span>top colleges tracked</span></div>
          </div>
          <div className="charts">
            <Trend data={stats.perDay} />
            <Bars title="By track" rows={stats.byTrack} />
            <Bars title="By year" rows={stats.byYear.map((r: Row) => ({ ...r, label: `Year ${r.label}` }))} />
            <Bars title="Top colleges" rows={stats.topColleges} />
          </div>
        </>
      )}
      <div className="panel">
        <div className="filters">
          <input placeholder="search name, email, college" value={q.search} onChange={(e) => setQ({ ...q, search: e.target.value, page: 1 })} />
          <select value={q.track} onChange={(e) => setQ({ ...q, track: e.target.value, page: 1 })}>
            <option value="">all tracks</option>{['AI/ML', 'Web', 'App', 'Open Innovation'].map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="tablewrap">
          <table>
            <thead><tr><th>#</th><th>Name</th><th>Email</th><th>College</th><th>Yr</th><th>Track</th><th>Team</th><th>Registered</th></tr></thead>
            <tbody>
              {list.registrations.map((r: any) => (
                <tr key={r.id}><td>{r.id}</td><td>{r.name}</td><td>{r.email}</td><td>{r.college}</td><td>{r.year}</td><td>{r.track}</td><td>{r.teamName || '-'}</td><td>{new Date(r.createdAt).toLocaleString()}</td></tr>
              ))}
              {list.registrations.length === 0 && <tr><td colSpan={8} className="dim">no registrations found</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="pager">
          <button className="btn sm ghost" disabled={q.page <= 1} onClick={() => setQ({ ...q, page: q.page - 1 })}>prev</button>
          <span>page {q.page} / {pages} · {list.total} total</span>
          <button className="btn sm ghost" disabled={q.page >= pages} onClick={() => setQ({ ...q, page: q.page + 1 })}>next</button>
        </div>
      </div>
    </main>
  );
}
