import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import './index.css';
import WheelCard from './components/ColorWheel';
import SchemesCard from './components/ColorSchemes';
import RGBCard from './components/RGBModel';
import PaintCard from './components/PaintMixer';
import AdditiveSubtractiveLab from './components/AdditiveSubtractiveLab';
import GradientCard from './components/GradientBuilder';
import ColorTheoryGuide from './components/ColorTheoryGuide';
import PortfolioShowcase from './components/PortfolioShowcase';
import { copyHex } from './utils/colorUtils';

/* ─── Section Config ─── */
const SECTIONS = [
  {
    id: 'guide', num: '01', title: 'Color Theory 101', icon: '📖', accent: '#ff0055',
    desc: 'Understand the basics of color mixing, harmonies, and how they apply to user interfaces.'
  },
  {
    id: 'wheel', num: '02', title: 'Color Wheel', icon: '🎨', accent: '#00e5ff',
    desc: 'Explore the full spectrum — drag, click, and scroll lightness on an interactive HSL wheel.'
  },
  {
    id: 'schemes', num: '03', title: 'Color Schemes', icon: '🔗', accent: '#e040fb',
    desc: 'Generate harmonious palettes — complementary, triadic, split, and more.'
  },
  {
    id: 'rgb', num: '04', title: 'RGB Mixer', icon: '💡', accent: '#76ff03',
    desc: 'Mix Red, Green, and Blue light channels and see how additive color works.'
  },
  {
    id: 'paint', num: '05', title: 'Paint Mixer', icon: '🖌️', accent: '#ff9100',
    desc: 'Blend pigments using subtractive mixing — like real paint on a canvas.'
  },
  {
    id: 'mixing', num: '06', title: 'Additive vs Subtractive', icon: '🧪', accent: '#00d68f',
    desc: 'Learn by doing: compare light mixing and pigment mixing with synchronized interactive controls.'
  },
  {
    id: 'gradient', num: '07', title: 'Gradient Builder', icon: '🌈', accent: '#ff4081',
    desc: 'Create stunning CSS gradients — linear, radial, or conic — with live preview.'
  },
  {
    id: 'showcase', num: '08', title: 'Portfolio Showcase', icon: '🚀', accent: '#ffea00',
    desc: 'Apply + Create: See color theory in action on a real-world portfolio design.'
  },
];

/* ─── Floating Background Letters ─── */
function FloatingLetters() {
  const chars = ['R', 'G', 'B', '#', '&', 'H', 'S', 'L', 'Aa', '°', 'C', 'M', 'Y', 'K', 'V', '!', '?', '{', '}'];
  return (
    <div className="floating-letters" aria-hidden="true">
      {chars.map((ch, i) => (
        <span key={i} className="float-char" style={{
          left: `${5 + (i * 17.2) % 90}%`,
          top: `${5 + (i * 23.7) % 90}%`,
          animationDelay: `${i * -1.5}s`,
          fontSize: `${10 + (i % 5) * 6}rem`,
          opacity: 0.03 + (i % 3) * 0.02
        }}>{ch}</span>
      ))}
    </div>
  );
}

/* ─── Starfield ─── */
function seededNoise(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function Starfield() {
  const stars = useMemo(() =>
    Array.from({ length: 200 }, (_, i) => {
      const base = i + 1;
      return {
        x: seededNoise(base) * 100,
        y: seededNoise(base * 7) * 100,
        size: 1 + seededNoise(base * 13) * 3,
        delay: seededNoise(base * 17) * 4,
      };
    }), []);
  return (
    <div className="starfield" aria-hidden="true">
      {stars.map((s, i) => (
        <span key={i} className="star" style={{
          left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size,
          animationDelay: `${s.delay}s`,
        }} />
      ))}
    </div>
  );
}

function SectionHeader({ section }) {
  return (
    <div className="section-hdr">
      <span className="section-num" style={{ color: section.accent }}>{section.num}</span>
      <h2 className="section-heading">{section.title}</h2>
      <p className="section-desc">{section.desc}</p>
    </div>
  );
}

/* ─── Sticky Nav ─── */
function StickyNav({ activeId, onNavigate, theme, toggleTheme }) {
  return (
    <nav className="sticky-nav" id="sticky-nav">
      <button onClick={() => onNavigate('home')} className={`snav-home ${activeId === 'home' ? 'active' : ''}`} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🏠 Home</button>
      <div className="snav-links">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => onNavigate(s.id)}
            className={`snav-link ${activeId === s.id ? 'active' : ''}`}
            style={{ '--accent': s.accent, background: 'none', border: 'none', cursor: 'pointer' }}>
            {s.title}
          </button>
        ))}
      </div>
      <div className="snav-progress">
        {SECTIONS.map(s => (
          <span key={s.id} className={`snav-dot ${activeId === s.id ? 'active' : ''}`}
            style={{ background: activeId === s.id ? s.accent : undefined }} />
        ))}
      </div>
      <button
        onClick={toggleTheme}
        className="theme-toggle"
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', marginLeft: 'auto' }}
        title="Toggle Theme"
      >
        {theme === 'dark' ? '☀️' : theme === 'light' ? '📜' : '🌙'}
      </button>
    </nav>
  );
}

/* ─── Hero Section ─── */
function HeroSection({ onStart }) {
  return (
    <section className="hero" id="hero">
      <div className="hero-content">
        <div className="hero-meta">
          <span className="hero-meta-item">📚 <b>Course:</b> Graphics & Animation Tools</span>
          <span className="hero-meta-item">👨‍🏫 <b>Faculty:</b> Mr. Pankaj Badoni</span>
        </div>
        <div className="hero-badge">📁 LAB 4 ASSIGNMENT</div>
        <h1 className="hero-title">
          Interactive <span className="gradient-text">Color Theory</span> Explorer
        </h1>
        <p className="hero-subtitle">
          An immersive journey through color science — wheel, schemes, mixing, and gradients.
        </p>
        <div className="hero-author">🎓 <b>Submitted by:</b> Rishav Kumar</div>
        <button onClick={onStart} className="hero-cta" style={{ border: 'none' }}>Start Exploring →</button>
      </div>
    </section>
  );
}

/* ─── Navigation Grid ─── */
function NavGrid({ onNavigate }) {
  return (
    <section className="nav-grid-section" id="nav-grid">
      <h2 className="nav-grid-heading">
        Explore <span className="gradient-text">{SECTIONS.length}</span> Interactive Sections
      </h2>
      <p className="nav-grid-sub">Select a module below to begin learning and experimenting.</p>
      <div className="nav-grid">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => onNavigate(s.id)} className="nav-card" style={{ '--accent': s.accent, cursor: 'pointer' }}>
            <span className="nav-card-icon">{s.icon}</span>
            <span className="nav-card-num">{s.num}</span>
            <h3 className="nav-card-title">{s.title}</h3>
            <p className="nav-card-desc">{s.desc}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ─── Section Footer (Next/Prev) ─── */
function SectionFooter({ activeId, onNavigate }) {
  const currentIndex = SECTIONS.findIndex(s => s.id === activeId);
  if (currentIndex === -1) return null;

  const prev = currentIndex > 0 ? SECTIONS[currentIndex - 1] : null;
  const next = currentIndex < SECTIONS.length - 1 ? SECTIONS[currentIndex + 1] : null;

  return (
    <div className="section-footer">
      {prev ? (
        <button className="footer-nav-btn prev" onClick={() => onNavigate(prev.id)}>
          <span className="fn-arrow">←</span>
          <div className="fn-text">
            <span className="fn-label">Previous</span>
            <span className="fn-name">{prev.title}</span>
          </div>
        </button>
      ) : (
        <button className="footer-nav-btn prev" onClick={() => onNavigate('home')}>
          <span className="fn-arrow">←</span>
          <div className="fn-text">
            <span className="fn-label">Return to</span>
            <span className="fn-name">Home</span>
          </div>
        </button>
      )}

      {next ? (
        <button className="footer-nav-btn next" onClick={() => onNavigate(next.id)}>
          <div className="fn-text">
            <span className="fn-label">Next Up</span>
            <span className="fn-name">{next.title}</span>
          </div>
          <span className="fn-arrow">→</span>
        </button>
      ) : (
        <button className="footer-nav-btn next" onClick={() => onNavigate('home')}>
          <div className="fn-text">
            <span className="fn-label">Finish</span>
            <span className="fn-name">Back to Home</span>
          </div>
          <span className="fn-arrow">↑</span>
        </button>
      )}
    </div>
  );
}

/* ─── Main App ─── */
export default function App() {
  const [globalHex, setGlobalHex] = useState('#FF0000');
  const [toastText, setToastText] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [theme, setTheme] = useState('dark');
  const toastTimerRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : prev === 'light' ? 'cream' : 'dark');
  }, []);

  const showToast = useCallback((text) => {
    clearTimeout(toastTimerRef.current);
    setToastText(text);
    setToastVisible(true);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 1800);
  }, []);

  const onCopy = useCallback((hex) => {
    copyHex(hex, (t) => showToast(`Copied ${t}`));
  }, [showToast]);

  const setColor = useCallback((hex) => {
    setGlobalHex(hex);
  }, []);

  const navigateTo = useCallback((id) => {
    setActiveSection(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleStart = useCallback(() => {
    document.getElementById('nav-grid')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="app-root">
      {/* Global Backgrounds */}
      <Starfield />
      <FloatingLetters />

      <StickyNav activeId={activeSection} onNavigate={navigateTo} theme={theme} toggleTheme={toggleTheme} />

      {activeSection === 'home' && (
        <div className="page-view home-view">
          <HeroSection onStart={handleStart} />
          <NavGrid onNavigate={navigateTo} />
        </div>
      )}

      {activeSection === 'guide' && (
        <section className="section" id="guide">
          <SectionHeader section={SECTIONS[0]} />
          <div className="section-body" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
            <ColorTheoryGuide mode="expanded" hex={globalHex} setColor={setColor} onCopy={onCopy} />
          </div>
          <SectionFooter activeId="guide" onNavigate={navigateTo} />
        </section>
      )}

      {activeSection === 'wheel' && (
        <section className="section" id="wheel">
          <SectionHeader section={SECTIONS[1]} />
          <div className="section-body">
            <WheelCard mode="expanded" hex={globalHex} setColor={setColor} onCopy={onCopy} />
          </div>
          <SectionFooter activeId="wheel" onNavigate={navigateTo} />
        </section>
      )}

      {activeSection === 'schemes' && (
        <section className="section" id="schemes">
          <SectionHeader section={SECTIONS[2]} />
          <div className="section-body">
            <SchemesCard mode="expanded" hex={globalHex} setColor={setColor} onCopy={onCopy} />
          </div>
          <SectionFooter activeId="schemes" onNavigate={navigateTo} />
        </section>
      )}

      {activeSection === 'rgb' && (
        <section className="section" id="rgb">
          <SectionHeader section={SECTIONS[3]} />
          <div className="section-body">
            <RGBCard mode="expanded" hex={globalHex} setColor={setColor} onCopy={onCopy} />
          </div>
          <SectionFooter activeId="rgb" onNavigate={navigateTo} />
        </section>
      )}

      {activeSection === 'paint' && (
        <section className="section" id="paint">
          <SectionHeader section={SECTIONS[4]} />
          <div className="section-body">
            <PaintCard mode="expanded" hex={globalHex} setColor={setColor} onCopy={onCopy} />
          </div>
          <SectionFooter activeId="paint" onNavigate={navigateTo} />
        </section>
      )}

      {activeSection === 'gradient' && (
        <section className="section" id="gradient">
          <SectionHeader section={SECTIONS[6]} />
          <div className="section-body">
            <GradientCard mode="expanded" hex={globalHex} setColor={setColor} onCopy={onCopy} />
          </div>
          <SectionFooter activeId="gradient" onNavigate={navigateTo} />
        </section>
      )}

      {activeSection === 'mixing' && (
        <section className="section" id="mixing">
          <SectionHeader section={SECTIONS[5]} />
          <div className="section-body mixlab-body">
            <AdditiveSubtractiveLab mode="expanded" hex={globalHex} setColor={setColor} onCopy={onCopy} />
          </div>
          <SectionFooter activeId="mixing" onNavigate={navigateTo} />
        </section>
      )}

      {activeSection === 'showcase' && (
        <section className="section" id="showcase">
          <SectionHeader section={SECTIONS[7]} />
          <div className="section-body">
            <PortfolioShowcase mode="expanded" onCopy={onCopy} />
          </div>
          <SectionFooter activeId="showcase" onNavigate={navigateTo} />
        </section>
      )}

      {/* Toast */}
      <div id="toast" className={toastVisible ? 'show' : ''}>{toastText}</div>
    </div>
  );
}
