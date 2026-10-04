import { useEffect, useRef, useState } from 'react';
import Boot from './Boot';
import Matrix from './Matrix';
import Register from './Register';
import Admin from './Admin';

// ---- Event Configuration ----
const EVENT_DATE = new Date('2026-11-14T09:00:00+05:30');

const TIMELINE = [
  ['14 Nov · 09:00', 'git init', 'Check-in, breakfast & opening ceremony'],
  ['14 Nov · 10:30', 'git checkout -b build', 'Hacking begins: team formation locked'],
  ['14 Nov · 13:00', 'git fetch --lunch', 'Networking lunch & mentor pairing'],
  ['14 Nov · 20:00', 'git rebase mentors', 'Design review & architectural unblocking'],
  ['15 Nov · 03:00', 'git commit -m "midnight-oil"', 'Midnight snacks, mini-games & coffee blitz'],
  ['15 Nov · 09:00', 'git push --force-with-lease', 'Code freeze & devpost repo lock'],
  ['15 Nov · 11:30', 'git tag --demo v1.0', 'Expo rounds & live judge evaluation'],
  ['15 Nov · 14:30', 'git checkout release/winners', 'Podium ceremony & swag distribution'],
];

const TRACKS = [
  {
    name: 'Autonomous AI & Agents',
    tag: 'ai-agents',
    desc: 'Self-governing agentic workflows, multi-modal LLM applications, or automated code-review pipelines.',
  },
  {
    name: 'Full-Stack & Web3 Infrastructure',
    tag: 'realtime-web',
    desc: 'Ultra-low latency platforms, decentralized coordination layers, or peer-to-peer developer tooling.',
  },
  {
    name: 'Smart Hardware & Edge Systems',
    tag: 'iot-edge',
    desc: 'Microcontroller telemetry, smart robotics protocols, or sensor integration running directly on the edge.',
  },
  {
    name: 'Open Innovation & Wildcard',
    tag: 'wildcard',
    desc: 'No arbitrary constraints. Bring your wildest technical proof-of-concept and solve a genuine friction point.',
  },
];

const PRIZES = [
  {
    tag: 'v1.0.0-gold',
    place: '1st Place · Champion',
    reward: '₹25,000',
    perks: 'Direct interview fast-track + Winner Trophy + Mechanical Keyboards',
    isWinner: true,
  },
  {
    tag: 'v0.9.0-silver',
    place: '2nd Place · Runner Up',
    reward: '₹15,000',
    perks: 'Official Cherry Network merch pack + Premium developer tooling credits',
    isWinner: false,
  },
  {
    tag: 'v0.8.0-bronze',
    place: '3rd Place · Second Runner',
    reward: '₹10,000',
    perks: 'Smart tech vouchers + Certificate of Technical Distinction',
    isWinner: false,
  },
];

const SPECIAL_PRIZES = [
  ['Best All-Women Team', '₹5,000 + Tech Gift Kits'],
  ['Best Hardware / Edge Prototype', '₹5,000 + Microcontroller Dev Kits'],
  ['Best UI/UX Terminal Aesthetic', '₹5,000 + Mechanical Keycaps & Swag'],
];

const FAQS = [
  {
    q: 'Who is eligible to participate?',
    a: 'Open to all undergraduate students across universities. Teams can consist of 1 to 4 members.',
  },
  {
    q: 'Is there any registration fee?',
    a: 'Zero. Participation, meals, midnight coffee, and swag are 100% free.',
  },
  {
    q: 'What if I don’t have a team yet?',
    a: 'Register as an individual. We host a dedicated team-formation session right after git init on day one.',
  },
];

// Fades and slides a section in when it scrolls into view
function Reveal({ children, className = '' }: { children: any; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (e.target.classList.add('in'), io.disconnect()), { threshold: 0.15 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

// Card that tilts toward the mouse
function Tilt({ children, className = '', style = {} }: { children: any; className?: string; style?: React.CSSProperties }) {
  const move = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
  };
  return (
    <div
      className={`card ${className}`}
      style={style}
      onMouseMove={move}
      onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
    >
      {children}
    </div>
  );
}

function Countdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const s = Math.max(0, Math.floor((EVENT_DATE.getTime() - now) / 1000));
  const parts = [
    ['days', Math.floor(s / 86400)],
    ['hrs', Math.floor(s / 3600) % 24],
    ['min', Math.floor(s / 60) % 60],
    ['sec', s % 60],
  ];
  return (
    <div className="count">
      {parts.map(([l, v]) => (
        <div key={l as string}>
          <b>{String(v).padStart(2, '0')}</b>
          <span>{l}</span>
        </div>
      ))}
    </div>
  );
}

function Site() {
  return (
    <>
      <nav className="nav">
        <div></div>
        <div>
          <a href="#about">about</a>
          <a href="#timeline">timeline</a>
          <a href="#tracks">tracks</a>
          <a href="#prizes">prizes</a>
          <a href="#faq">faq</a>
          <a href="#register" className="btn sm">register</a>
        </div>
      </nav>

      <header id="top" className="hero">
        <p className="cmd">$ ./hackathon --duration 24h --mode intense</p>
        <h1 className="glitch" data-text="THE LAST COMMIT">THE LAST COMMIT</h1>
        <p className="tag">
          24 hours. One branch. <span className="amber">Make your last commit count.</span>
        </p>
        <Countdown />
        <a href="#register" className="btn big">$ git push --register</a>
        <p className="dim small">14 – 15 Nov 2026 · SRM Institute of Science and Technology · Chennai, India</p>
      </header>

      <section id="about">
        <Reveal>
          <h2><span className="amber">$</span> git log --summary</h2>
          <div className="grid3">
            {[
              ['24h', 'Sprint duration'],
              ['₹65k+', 'Total bounty pool'],
              ['4', 'Specialized tracks'],
            ].map(([n, t]) => (
              <Tilt key={t}>
                <b className="big-n">{n}</b>
                <span>{t}</span>
              </Tilt>
            ))}
          </div>
          <p className="lead" style={{ marginTop: '1.5rem', lineHeight: '1.8' }}>
            Every breakthrough project starts with a single commit. At <b>The Last Commit</b>, you get 24 continuous hours, top-tier mentors, and zero distractions to turn your vision into working software before the final push.
          </p>
        </Reveal>
      </section>

      <section id="timeline">
        <Reveal>
          <h2><span className="amber">$</span> git log --timeline --graph</h2>
          <div className="log">
            {TIMELINE.map(([when, cmd, what], i) => (
              <div className="commit" key={i} style={{ animationDelay: `${i * 70}ms` }}>
                <i className="dot" />
                <div>
                  <code>{cmd}</code>
                  <p>{what}</p>
                  <small>{when}</small>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section id="tracks">
        <Reveal>
          <h2><span className="amber">$</span> git branch --tracks</h2>
          <div className="grid2 tracks">
            {TRACKS.map((t) => (
              <Tilt key={t.name}>
                <span className="dim small" style={{ letterSpacing: '0.05em' }}>refs/heads/{t.tag}</span>
                <h3 style={{ marginTop: '0.4rem', color: '#00ff88' }}>* {t.name}</h3>
                <p style={{ marginTop: '0.5rem', color: '#bbb' }}>{t.desc}</p>
              </Tilt>
            ))}
          </div>
        </Reveal>
      </section>

      <section id="prizes">
        <Reveal>
          <h2><span className="amber">$</span> git tag --prizes</h2>
          <div className="grid3">
            {PRIZES.map((p) => (
              <Tilt
                key={p.tag}
                style={p.isWinner ? { borderColor: 'rgba(255, 184, 0, 0.55)', boxShadow: '0 0 24px rgba(255, 184, 0, 0.15)' } : {}}
              >
                <code style={p.isWinner ? { color: '#ffb800' } : {}}>{p.tag}</code>
                <h3 style={p.isWinner ? { color: '#ffb800' } : {}}>{p.place}</h3>
                <b className="big-n" style={{ margin: '0.75rem 0', color: p.isWinner ? '#ffb800' : '#00ff88' }}>
                  {p.reward}
                </b>
                <p className="dim small">{p.perks}</p>
              </Tilt>
            ))}
          </div>

          <div style={{ marginTop: '2rem' }}>
            <p className="dim small" style={{ marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Special Track Bounties &gt;
            </p>
            <div className="grid3">
              {SPECIAL_PRIZES.map(([title, reward]) => (
                <Tilt key={title} style={{ padding: '1rem' }}>
                  <h4 style={{ color: '#00ff88', marginBottom: '0.25rem' }}>{title}</h4>
                  <span className="amber">{reward}</span>
                </Tilt>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section id="faq">
        <Reveal>
          <h2><span className="amber">$</span> git help --faq</h2>
          <div className="grid3">
            {FAQS.map((f) => (
              <Tilt key={f.q}>
                <h3 style={{ fontSize: '1rem', color: '#ffb800', marginBottom: '0.5rem' }}>? {f.q}</h3>
                <p className="dim small" style={{ lineHeight: '1.6' }}>{f.a}</p>
              </Tilt>
            ))}
          </div>
        </Reveal>
      </section>

      <section id="register">
        <Reveal>
          <h2><span className="amber">$</span> git push --register origin</h2>
          <Register />
        </Reveal>
      </section>

      <footer>
        <p>&gt;_ The Last Commit · Crafted for Cherry Network WebDev Trainee Task</p>
        <a href="#/admin" className="dim">admin portal</a>
      </footer>
    </>
  );
}

export default function App() {
  const [booted, setBooted] = useState(!!sessionStorage.getItem('tlc_booted'));
  const [route, setRoute] = useState(location.hash);

  useEffect(() => {
    const h = () => setRoute(location.hash);
    addEventListener('hashchange', h);
    return () => removeEventListener('hashchange', h);
  }, []);

  useEffect(() => {
    const m = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mx', e.clientX + 'px');
      document.documentElement.style.setProperty('--my', e.clientY + 'px');
    };
    addEventListener('mousemove', m);
    return () => removeEventListener('mousemove', m);
  }, []);

  const done = () => {
    sessionStorage.setItem('tlc_booted', '1');
    setBooted(true);
  };

  if (route.startsWith('#/admin')) return <Admin />;
  return (
    <>
      <Matrix />
      <div className="glow" />
      {!booted && <Boot onDone={done} />}
      <Site />
    </>
  );
}