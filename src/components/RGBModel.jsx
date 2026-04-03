import { useState, useRef, useEffect, useCallback } from 'react';
import { rgbToHex, rgbToHsl, hexToRgbArray, hslHex, getColorName, DEFINITIONS } from '../utils/colorUtils';

function initRgbFromHex(hex) {
    try { return hexToRgbArray(hex || '#FF0000'); }
    catch { return [255, 0, 0]; }
}

const PRESETS = [[255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 0], [0, 255, 255], [255, 0, 255], [255, 255, 255], [0, 0, 0]];

export default function RGBCard({ mode, hex, setColor, onCopy, onExpand }) {
    const [r, setR] = useState(() => initRgbFromHex(hex)[0]);
    const [g, setG] = useState(() => initRgbFromHex(hex)[1]);
    const [b, setB] = useState(() => initRgbFromHex(hex)[2]);
    const circlesRef = useRef(null);
    const curHex = rgbToHex(r, g, b);
    const [h, s, l] = rgbToHsl(r, g, b);
    const compHex = hslHex((h + 180) % 360, s, l);
    const bright = (r * 299 + g * 587 + b * 114) / 1000;

    useEffect(() => {
        if (!hex) return;
        let frameId;
        try {
            const [rr, gg, bb] = hexToRgbArray(hex);
            frameId = requestAnimationFrame(() => {
                setR(rr);
                setG(gg);
                setB(bb);
            });
        } catch {
            // Ignore malformed colors from external sources.
        }
        return () => {
            if (frameId) cancelAnimationFrame(frameId);
        };
    }, [hex]);

    const setRGB = useCallback((nr, ng, nb) => {
        setR(nr); setG(ng); setB(nb);
        setColor(rgbToHex(nr, ng, nb));
    }, [setColor]);

    const handleReset = useCallback(() => {
        const [r, g, b] = initRgbFromHex(hex);
        setRGB(r, g, b);
    }, [hex, setRGB]);

    const drawCircles = useCallback(() => {
        const cv = circlesRef.current; if (!cv) return;
        const container = cv.parentElement; if (!container) return;
        const w = Math.min(container.clientWidth - 20, mode === 'expanded' ? 600 : 280);
        cv.width = w; cv.height = Math.round(w * 0.55);
        const ctx = cv.getContext('2d');
        ctx.clearRect(0, 0, cv.width, cv.height);
        const cx = cv.width / 2, cy = cv.height / 2, cr = cv.width * 0.16;
        const pos = [[-cr * 1.1, -cr * 0.5], [cr * 1.1, -cr * 0.5], [0, cr * 0.7]];
        const cols = [`rgba(${r},0,0,.8)`, `rgba(0,${g},0,.8)`, `rgba(0,0,${b},.8)`];
        const labs = ['R', 'G', 'B'];
        ctx.save(); ctx.globalCompositeOperation = 'screen';
        pos.forEach(([ox, oy], i) => { ctx.beginPath(); ctx.arc(cx + ox, cy + oy, cr, 0, Math.PI * 2); ctx.fillStyle = cols[i]; ctx.fill(); });
        ctx.restore();
        pos.forEach(([ox, oy], i) => {
            ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.font = `bold ${Math.round(cr * 0.4)}px Inter`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(labs[i], cx + ox, cy + oy);
        });
    }, [r, g, b, mode]);

    useEffect(() => { drawCircles(); }, [drawCircles]);

    // ── CARD VIEW ──
    if (mode === 'card') {
        return (
            <div className="card card--rgb" onClick={onExpand}>
                <div className="card-head">
                    <span className="card-title">RGB Mixer</span>
                    <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}>
                        <button className="sch-btn" onClick={(e) => { e.stopPropagation(); handleReset(); }} style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Reset</button>
                        <button className="expand-btn" onClick={e => { e.stopPropagation(); onExpand() }}>⤢</button>
                    </div>
                </div>
                <div className="card-body">
                    <div style={{
                        height: 60, borderRadius: 8, background: curHex, marginBottom: '.6rem',
                        border: '1px solid var(--b)', boxShadow: `0 4px 16px ${curHex}22`,
                        display: 'flex', alignItems: 'flex-end', padding: '.3rem .5rem'
                    }}>
                        <code style={{
                            fontSize: '.72rem', fontFamily: 'var(--mono)', fontWeight: 700,
                            color: bright > 128 ? '#000' : '#fff', textShadow: '0 1px 3px rgba(0,0,0,.4)'
                        }}>{curHex}</code>
                    </div>
                    {[['Red', r, 'r', '#f00'], ['Green', g, 'g', '#0f0'], ['Blue', b, 'b', '#00f']].map(([name, val, ch, col]) => (
                        <div key={name} className="ctrl-row" style={{ marginBottom: '.4rem' }}>
                            <div className="ctrl-label">{name} <code>{val}</code></div>
                            <input type="range" min="0" max="255" value={val}
                                style={{ background: `linear-gradient(90deg,#111,${col})` }}
                                onClick={e => e.stopPropagation()} onChange={e => {
                                    const v = +e.target.value;
                                    setRGB(ch === 'r' ? v : r, ch === 'g' ? v : g, ch === 'b' ? v : b);
                                }} />
                        </div>
                    ))}
                    <div className="card-canvas-wrap" style={{ minHeight: 100 }}>
                        <canvas ref={circlesRef} />
                    </div>
                </div>
            </div>
        );
    }

    // ── EXPANDED VIEW ──
    return (
        <>
            <div className="modal-left">
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '.5rem' }}>
                    <button className="sch-btn" onClick={handleReset} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>Reset</button>
                </div>
                {[['Red', r, 'r'], ['Green', g, 'g'], ['Blue', b, 'b']].map(([name, val, ch]) => (
                    <div key={name} className="ctrl-row">
                        <div className="ctrl-label">{name} <code>{val}</code></div>
                        <input type="range" min="0" max="255" value={val} onChange={e => {
                            const v = +e.target.value;
                            setRGB(ch === 'r' ? v : r, ch === 'g' ? v : g, ch === 'b' ? v : b);
                        }} />
                    </div>
                ))}
                <div style={{ marginTop: '.75rem' }}>
                    <div className="section-title">Presets</div>
                    <div className="preset-grid">
                        {PRESETS.map(([pr, pg, pb], i) => (
                            <div key={i} className="preset-sw" role="button" tabIndex={0} style={{ background: rgbToHex(pr, pg, pb) }}
                                onClick={() => setRGB(pr, pg, pb)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setRGB(pr, pg, pb); }} />
                        ))}
                    </div>
                </div>
                <div style={{ marginTop: '.75rem' }}>
                    <div className="section-title">Hex Input</div>
                    <input className="hex-input" type="text" value={curHex} maxLength={7}
                        onChange={e => { const v = e.target.value; if (/^#[0-9a-fA-F]{6}$/.test(v)) { const [rr, gg, bb] = hexToRgbArray(v); setRGB(rr, gg, bb); } }} />
                </div>
                <div style={{ marginTop: '.75rem' }}>
                    <div className="def-box">
                        <div className="def-title">RGB Model</div>
                        <div className="def-body">{DEFINITIONS['rgb'].body}</div>
                    </div>
                </div>
            </div>
            <div className="modal-center" style={{ flexDirection: 'column', gap: '1rem' }}>
                <div className="rgb-preview"
                    style={{ background: curHex, boxShadow: `0 6px 30px ${curHex}33` }}
                    onClick={() => onCopy(curHex)}>
                    <code style={{ color: bright > 128 ? 'rgba(0,0,0,.7)' : 'rgba(255,255,255,.85)' }}>{curHex}</code>
                </div>
                <canvas ref={circlesRef} />
            </div>
            <div className="modal-right">
                <div className="info-item" style={{ marginBottom: '.4rem' }}><div className="label">Name</div><div className="val">{getColorName(h)}</div></div>
                <div className="info-item" style={{ marginBottom: '.4rem' }}><div className="label">HEX</div><div className="val">{curHex}</div></div>
                <div className="info-item" style={{ marginBottom: '.4rem' }}><div className="label">RGB</div><div className="val">{r},{g},{b}</div></div>
                <div className="info-item" style={{ marginBottom: '.4rem' }}><div className="label">HSL</div><div className="val">{Math.round(h)}°,{Math.round(s)}%,{Math.round(l)}%</div></div>
                <div style={{ marginTop: '.75rem' }}>
                    <div className="section-title">Complementary</div>
                    <div style={{
                        height: 50, borderRadius: 8, background: compHex, border: '1px solid var(--b)', cursor: 'pointer',
                        display: 'flex', alignItems: 'flex-end', padding: '.3rem .5rem'
                    }}
                        role="button" tabIndex={0}
                        onClick={() => { const [cr, cg, cb] = hexToRgbArray(compHex); setRGB(cr, cg, cb); }}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const [cr, cg, cb] = hexToRgbArray(compHex); setRGB(cr, cg, cb); } }}>
                        <code style={{ fontSize: '.65rem', fontFamily: 'var(--mono)', fontWeight: 700, color: 'rgba(255,255,255,.7)' }}>{compHex}</code>
                    </div>
                    <div style={{ fontSize: '.6rem', color: 'var(--t2)', marginTop: '.2rem' }}>Click to switch</div>
                </div>
            </div>
        </>
    );
}
