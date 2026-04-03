import { useMemo, useState, useEffect, useCallback } from 'react';
import { clamp, rgbToHex, hexToRgbArray, DEFINITIONS } from '../utils/colorUtils';

function describeAdditive(r, g, b) {
  const high = [r, g, b].filter((v) => v > 210).length;
  const low = [r, g, b].filter((v) => v < 45).length;

  if (high === 3) return 'All three light channels are strong, so the result approaches white.';
  if (low === 3) return 'All channels are low, so the result approaches black.';
  if (r > 190 && g > 190 && b < 80) return 'Red and green light combine to make yellow on displays.';
  if (r > 190 && b > 190 && g < 80) return 'Red and blue light combine to make magenta on displays.';
  if (g > 190 && b > 190 && r < 80) return 'Green and blue light combine to make cyan on displays.';

  return 'Additive mixing gets brighter as you add more light energy.';
}

function describeSubtractive(c, m, y, k) {
  const avg = (c + m + y) / 3;

  if (k > 70) return 'A high black (K) value absorbs most light, so the result is very dark.';
  if (avg < 15 && k < 10) return 'Low CMY means little ink absorption, so paper stays near white.';
  if (c > 70 && m > 70 && y < 35) return 'Cyan + magenta pigments absorb red and green, leaving a blue-purple feel.';
  if (m > 70 && y > 70 && c < 35) return 'Magenta + yellow pigments absorb green and blue, leaving warmer red-orange tones.';
  if (c > 70 && y > 70 && m < 35) return 'Cyan + yellow pigments absorb red and blue, leaving greenish tones.';

  return 'Subtractive mixing gets darker as you add more pigment or ink.';
}

function initRgbFromHex(hex) {
  try { return hexToRgbArray(hex || '#FF0000'); }
  catch { return [255, 0, 0]; }
}

function rgbToCmyk(r, g, b) {
  const rN = r / 255;
  const gN = g / 255;
  const bN = b / 255;
  const k = 1 - Math.max(rN, gN, bN);
  if (k === 1) return [0, 0, 0, 100];
  const c = (1 - rN - k) / (1 - k);
  const m = (1 - gN - k) / (1 - k);
  const y = (1 - bN - k) / (1 - k);
  return [Math.round(c * 100), Math.round(m * 100), Math.round(y * 100), Math.round(k * 100)];
}

export default function AdditiveSubtractiveLab({ hex, setColor, onCopy }) {
  const [lessonMode, setLessonMode] = useState('compare');
  const [r, setR] = useState(() => initRgbFromHex(hex)[0]);
  const [g, setG] = useState(() => initRgbFromHex(hex)[1]);
  const [b, setB] = useState(() => initRgbFromHex(hex)[2]);

  const initialCmyk = useMemo(() => rgbToCmyk(r, g, b), []); // r,g,b are initialized above
  const [c, setC] = useState(initialCmyk[0]);
  const [m, setM] = useState(initialCmyk[1]);
  const [y, setY] = useState(initialCmyk[2]);
  const [k, setK] = useState(initialCmyk[3]);

  // Sync additive RGB and subtractive CMYK when global hex changes
  useEffect(() => {
    if (!hex) return;
    try {
      const [rr, gg, bb] = hexToRgbArray(hex);
      setR(rr); setG(gg); setB(bb);
      
      const [newC, newM, newY, newK] = rgbToCmyk(rr, gg, bb);
      setC(newC); setM(newM); setY(newY); setK(newK);
    } catch { /* ignore malformed hex */ }
  }, [hex]);

  const handleReset = useCallback(() => {
    setLessonMode('compare');
    try {
      const [rr, gg, bb] = hexToRgbArray(hex || '#FF0000');
      setR(rr); setG(gg); setB(bb);
      const [newC, newM, newY, newK] = rgbToCmyk(rr, gg, bb);
      setC(newC); setM(newM); setY(newY); setK(newK);
    } catch { /* ignore malformed hex */ }
    setBlend(50);
  }, [hex]);

  const [blend, setBlend] = useState(50);

  const additiveHex = useMemo(() => rgbToHex(r, g, b), [r, g, b]);

  const subtractiveRgb = useMemo(() => {
    const cN = c / 100;
    const mN = m / 100;
    const yN = y / 100;
    const kN = k / 100;

    const rr = Math.round(255 * (1 - cN) * (1 - kN));
    const gg = Math.round(255 * (1 - mN) * (1 - kN));
    const bb = Math.round(255 * (1 - yN) * (1 - kN));

    return [clamp(rr, 0, 255), clamp(gg, 0, 255), clamp(bb, 0, 255)];
  }, [c, m, y, k]);

  const subtractiveHex = useMemo(
    () => rgbToHex(subtractiveRgb[0], subtractiveRgb[1], subtractiveRgb[2]),
    [subtractiveRgb]
  );

  const compareRgb = useMemo(() => {
    const t = blend / 100;
    return [
      Math.round(r * (1 - t) + subtractiveRgb[0] * t),
      Math.round(g * (1 - t) + subtractiveRgb[1] * t),
      Math.round(b * (1 - t) + subtractiveRgb[2] * t),
    ];
  }, [blend, r, g, b, subtractiveRgb]);

  const compareHex = useMemo(
    () => rgbToHex(compareRgb[0], compareRgb[1], compareRgb[2]),
    [compareRgb]
  );

  const activeHex = lessonMode === 'additive' ? additiveHex : lessonMode === 'subtractive' ? subtractiveHex : compareHex;

  const additiveInsight = useMemo(() => describeAdditive(r, g, b), [r, g, b]);
  const subtractiveInsight = useMemo(() => describeSubtractive(c, m, y, k), [c, m, y, k]);

  return (
    <>
      <div className="modal-left">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.6rem' }}>
            <div className="section-title" style={{ marginBottom: 0 }}>Learning Mode</div>
            <button className="sch-btn" onClick={handleReset} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>Reset</button>
        </div>
        <div className="mixlab-mode-row">
          {['additive', 'subtractive', 'compare'].map((mode) => (
            <button
              key={mode}
              className={`sch-btn ${lessonMode === mode ? 'active' : ''}`}
              style={{ padding: '.5rem .85rem', fontSize: '.9rem' }}
              onClick={() => setLessonMode(mode)}
            >
              {mode[0].toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        <div className="def-box" style={{ marginTop: '.75rem' }}>
          <div className="def-title">Additive (Light)</div>
          <div className="def-body">{DEFINITIONS['additive'].body}</div>
        </div>

        <div className="def-box">
          <div className="def-title">Subtractive (Pigment)</div>
          <div className="def-body">{DEFINITIONS['subtractive'].body}</div>
        </div>

        <div className="mixlab-grid-head">Additive Controls (RGB)</div>
        <div className="ctrl-row">
          <div className="ctrl-label">Red <code>{r}</code></div>
          <input type="range" min="0" max="255" value={r} onChange={(e) => setR(+e.target.value)} style={{ background: 'linear-gradient(90deg,#111,#ff0000)' }} />
        </div>
        <div className="ctrl-row">
          <div className="ctrl-label">Green <code>{g}</code></div>
          <input type="range" min="0" max="255" value={g} onChange={(e) => setG(+e.target.value)} style={{ background: 'linear-gradient(90deg,#111,#00ff00)' }} />
        </div>
        <div className="ctrl-row">
          <div className="ctrl-label">Blue <code>{b}</code></div>
          <input type="range" min="0" max="255" value={b} onChange={(e) => setB(+e.target.value)} style={{ background: 'linear-gradient(90deg,#111,#0000ff)' }} />
        </div>

        <div className="mixlab-action-row">
          <button className="act-btn" onClick={() => { setR(255); setG(255); setB(255); }}>White Light</button>
          <button className="act-btn" onClick={() => { setR(255); setG(0); setB(0); }}>Red Light</button>
          <button className="act-btn" onClick={() => { setR(0); setG(0); setB(0); }}>Blackout</button>
        </div>

        <div className="mixlab-grid-head" style={{ marginTop: '.8rem' }}>Subtractive Controls (CMYK)</div>
        <div className="ctrl-row">
          <div className="ctrl-label">Cyan <code>{c}%</code></div>
          <input type="range" min="0" max="100" value={c} onChange={(e) => setC(+e.target.value)} style={{ background: 'linear-gradient(90deg,#fff,#00d0ff)' }} />
        </div>
        <div className="ctrl-row">
          <div className="ctrl-label">Magenta <code>{m}%</code></div>
          <input type="range" min="0" max="100" value={m} onChange={(e) => setM(+e.target.value)} style={{ background: 'linear-gradient(90deg,#fff,#ff00d4)' }} />
        </div>
        <div className="ctrl-row">
          <div className="ctrl-label">Yellow <code>{y}%</code></div>
          <input type="range" min="0" max="100" value={y} onChange={(e) => setY(+e.target.value)} style={{ background: 'linear-gradient(90deg,#fff,#ffd900)' }} />
        </div>
        <div className="ctrl-row">
          <div className="ctrl-label">Black (K) <code>{k}%</code></div>
          <input type="range" min="0" max="100" value={k} onChange={(e) => setK(+e.target.value)} style={{ background: 'linear-gradient(90deg,#fff,#000)' }} />
        </div>

        <div className="mixlab-action-row">
          <button className="act-btn" onClick={() => { setC(0); setM(0); setY(0); setK(0); }}>Clean Paper</button>
          <button className="act-btn" onClick={() => { setC(100); setM(100); setY(100); setK(0); }}>Rich Mix</button>
          <button className="act-btn" onClick={() => { setC(0); setM(0); setY(0); setK(100); }}>Deep Black</button>
        </div>

        <div className="ctrl-row" style={{ marginTop: '.8rem' }}>
          <div className="ctrl-label">Compare Blend <code>{blend}%</code></div>
          <input type="range" min="0" max="100" value={blend} onChange={(e) => setBlend(+e.target.value)} />
        </div>
      </div>

      <div className="modal-center mixlab-center">
        <div className="mixlab-stage-row">
          <div className="mixlab-stage mixlab-dark">
            <div className="mixlab-stage-title">Additive: Light on dark</div>
            <div className="mixlab-venn">
              <span className="mixlab-circle" style={{ background: `rgba(255,0,0,${Math.max(r / 255, 0.05)})` }} />
              <span className="mixlab-circle" style={{ background: `rgba(0,255,0,${Math.max(g / 255, 0.05)})` }} />
              <span className="mixlab-circle" style={{ background: `rgba(0,0,255,${Math.max(b / 255, 0.05)})` }} />
            </div>
            <button className="mixlab-result" style={{ background: additiveHex }} onClick={() => onCopy(additiveHex)}>
              <code>{additiveHex}</code>
            </button>
          </div>

          <div className="mixlab-stage mixlab-light">
            <div className="mixlab-stage-title">Subtractive: Ink on paper</div>
            <div className="mixlab-venn mixlab-venn-paint">
              <span className="mixlab-circle" style={{ background: `rgba(0,208,255,${Math.max(c / 100, 0.06)})` }} />
              <span className="mixlab-circle" style={{ background: `rgba(255,0,212,${Math.max(m / 100, 0.06)})` }} />
              <span className="mixlab-circle" style={{ background: `rgba(255,217,0,${Math.max(y / 100, 0.06)})` }} />
              <span className="mixlab-k-overlay" style={{ opacity: k / 100 }} />
            </div>
            <button className="mixlab-result" style={{ background: subtractiveHex }} onClick={() => onCopy(subtractiveHex)}>
              <code>{subtractiveHex}</code>
            </button>
          </div>
        </div>

        <div className="mixlab-final-box" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCopy(activeHex); }} style={{ background: activeHex }} onClick={() => onCopy(activeHex)}>
          <div className="mixlab-final-label">Current Lesson Output</div>
          <code>{activeHex}</code>
          <div className="mixlab-final-actions">
            <button className="act-btn" onClick={(e) => { e.stopPropagation(); setColor(activeHex); }}>Use as Global Color</button>
            <button className="act-btn" onClick={(e) => { e.stopPropagation(); onCopy(activeHex); }}>Copy HEX</button>
          </div>
        </div>
      </div>

      <div className="modal-right">
        <div className="section-title">What You Are Learning</div>
        <div className="def-box">
          <div className="def-title">Additive Insight</div>
          <div className="def-body">{additiveInsight}</div>
        </div>
        <div className="def-box">
          <div className="def-title">Subtractive Insight</div>
          <div className="def-body">{subtractiveInsight}</div>
        </div>

        <div className="mixlab-math">
          <div className="section-title">Math Model</div>
          <div className="mixlab-equation">
            Additive: RGB = ({r}, {g}, {b})
          </div>
          <div className="mixlab-equation">
            Subtractive: RGB = ({subtractiveRgb[0]}, {subtractiveRgb[1]}, {subtractiveRgb[2]}) from CMYK ({c},{m},{y},{k})
          </div>
          <div className="mixlab-equation">
            Compare blend ({blend}%): {compareHex}
          </div>
        </div>

        <div style={{ marginTop: '.8rem' }}>
          <div className="section-title">Quick Pick</div>
          <div className="sw-grid">
            {[additiveHex, subtractiveHex, compareHex].map((col, i) => (
              <div key={i} className="sw" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCopy(col); }} style={{ background: col }} onClick={() => onCopy(col)} title={col} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
