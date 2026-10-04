import { useEffect, useState } from 'react';

const LINES = [
  '$ git init the-last-commit',
  'Initialized empty repository in ~/hackathon/.git',
  '$ git remote add origin srm://hackers',
  '$ npm run hype',
  '> compiling 24 hours of chaos... done',
  '> loading mentors... done',
  '> loading caffeine... done',
  '$ git checkout -b you',
  "Switched to a new branch 'you'",
];

// Loading sequence: terminal lines type out, any key or click skips it
export default function Boot({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => (n >= LINES.length ? onDone() : setN(n + 1)), n >= LINES.length ? 500 : 260);
    return () => clearTimeout(t);
  }, [n]);
  useEffect(() => {
    addEventListener('keydown', onDone);
    return () => removeEventListener('keydown', onDone);
  }, []);
  return (
    <div className="boot" onClick={onDone}>
      <div className="boot-box">
        {LINES.slice(0, n).map((l, i) => (
          <p key={i} className={l.startsWith('$') ? 'cmd' : ''}>{l}</p>
        ))}
        <span className="cursor">█</span>
        <div className="bar"><i style={{ width: `${(n / LINES.length) * 100}%` }} /></div>
        <small>press any key to skip</small>
      </div>
    </div>
  );
}
