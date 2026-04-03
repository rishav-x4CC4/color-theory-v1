import { useState, useRef, useEffect, useCallback } from 'react';
import {
    hslToRgb, rgbToHsl, rgbToHex, hexToRgbArray, hslHex, clamp,
    DEFINITIONS, contrastRatio, simulateColorBlindness
} from '../utils/colorUtils';

function initHslFromHex(hex) {
    try {
        const [r, g, b] = hexToRgbArray(hex || '#FF0000');
        const [h, s, l] = rgbToHsl(r, g, b);
        return [Math.round(h), Math.round(s), Math.round(l)];
    } catch { return [0, 100, 50]; }
}

export default function WheelCard({ mode, hex, setColor, onCopy, onExpand }) {
    const canvasRef = useRef(null);
    const [curH, setCurH] = useState(() => initHslFromHex(hex)[0]);
    const [curS, setCurS] = useState(() => initHslFromHex(hex)[1]);
    const [curL, setCurL] = useState(() => initHslFromHex(hex)[2]);
    const [history, setHistory] = useState([]);
    const dragging = useRef(false);
    const imgCache = useRef(null);

    const curHex = hslHex(curH, curS, curL);
    const [r, g, b] = hslToRgb(curH, curS, curL);

    useEffect(() => {
        if (!hex) return;
        let frameId;
        try {
            const [rr, gg, bb] = hexToRgbArray(hex);
            const [h, s, l] = rgbToHsl(rr, gg, bb);
            frameId = requestAnimationFrame(() => {
                setCurH(Math.round(h));
                setCurS(Math.round(s));
                setCurL(Math.round(l));
            });
        } catch {
            // Ignore malformed colors from external sources.
        }
        return () => {
            if (frameId) cancelAnimationFrame(frameId);
        };
    }, [hex]);

    // Helper: set local + push to parent
    const setHSL = useCallback((h, s, l) => {
        setCurH(h); setCurS(s); setCurL(l);
        setColor(hslHex(h, s, l));
    }, [setColor]);

    const handleReset = useCallback(() => {
        const [h, s, l] = initHslFromHex(hex);
        setCurH(h); setCurS(s); setCurL(l);
        setHistory([]);
    }, [hex]);

    // WCAG
    const crWhite = contrastRatio(r, g, b, 255, 255, 255);
    const crBlack = contrastRatio(r, g, b, 0, 0, 0);
    const cbTypes = ['protanopia', 'deuteranopia', 'tritanopia'];
    const cbResults = cbTypes.map(type => {
        const [cr, cg, cb] = simulateColorBlindness(r, g, b, type);
        return { type, hex: rgbToHex(cr, cg, cb), label: type.charAt(0).toUpperCase() + type.slice(1) };
    });

    const buildImage = useCallback((ctx, w, h, cx, cy, radius) => {
        const img = ctx.createImageData(w, h);
        const d = img.data;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const dx = x - cx, dy = y - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > radius) continue;
                const hue = ((Math.atan2(dy, dx) * 180 / Math.PI) + 90 + 360) % 360;
                const sat = dist / radius;
                const [cr, cg, cb] = hslToRgb(hue, sat * 100, 50);
                const i = (y * w + x) * 4;
                d[i] = cr; d[i + 1] = cg; d[i + 2] = cb; d[i + 3] = 255;
            }
        }
        imgCache.current = img;
    }, []);

    const renderWheel = useCallback(() => {
        const cv = canvasRef.current;
        if (!cv) return;
        const ctx = cv.getContext('2d');
        const container = cv.parentElement;
        if (!container) return;
        const maxSize = mode === 'expanded'
            ? Math.min(container.clientWidth - 40, container.clientHeight - 60, 800)
            : Math.min(container.clientWidth - 20, container.clientHeight - 20, 340);
        const size = Math.max(maxSize, 100);
        cv.width = cv.height = size;
        const radius = size / 2 - 8;
        const cx = size / 2, cy = size / 2;

        if (!imgCache.current || imgCache.current.width !== size) buildImage(ctx, size, size, cx, cy, radius);

        ctx.putImageData(imgCache.current, 0, 0);
        ctx.save(); ctx.globalCompositeOperation = 'destination-in';
        ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill(); ctx.restore();

        if (curL !== 50) {
            ctx.save(); ctx.globalAlpha = Math.min(1, Math.abs(curL - 50) / 50);
            ctx.fillStyle = curL > 50 ? '#fff' : '#000';
            ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        }

        // Marker
        const rad = (curH - 90) * Math.PI / 180;
        const sr = curS / 100;
        const mx = cx + radius * sr * Math.cos(rad);
        const my = cy + radius * sr * Math.sin(rad);
        const mgrd = ctx.createRadialGradient(mx, my, 0, mx, my, 18);
        mgrd.addColorStop(0, `${curHex}55`); mgrd.addColorStop(1, 'transparent');
        ctx.fillStyle = mgrd; ctx.fillRect(mx - 18, my - 18, 36, 36);
        ctx.beginPath(); ctx.arc(mx, my, 8, 0, Math.PI * 2);
        ctx.fillStyle = curHex; ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    }, [curH, curS, curL, curHex, mode, buildImage]);

    useEffect(() => {
        renderWheel();
        const h = () => { imgCache.current = null; renderWheel(); };
        window.addEventListener('resize', h);
        return () => window.removeEventListener('resize', h);
    }, [renderWheel]);

    const applyClick = useCallback((x, y) => {
        const cv = canvasRef.current;
        const s = cv.width, cx = s / 2, cy = s / 2, radius = s / 2 - 8;
        const dx = x - cx, dy = y - cy;
        if (Math.sqrt(dx * dx + dy * dy) > radius) return;
        const newH = Math.round(((Math.atan2(dy, dx) * 180 / Math.PI) + 90 + 360) % 360);
        const newS = Math.round(clamp(Math.sqrt(dx * dx + dy * dy) / radius * 100, 0, 100));
        setHSL(newH, newS, curL);
    }, [curL, setHSL]);

    const getPos = useCallback((e) => {
        const cv = canvasRef.current;
        const rect = cv.getBoundingClientRect();
        const t = e.touches ? e.touches[0] : e;
        return [(t.clientX - rect.left) * (cv.width / rect.width), (t.clientY - rect.top) * (cv.height / rect.height)];
    }, []);

    const onDown = (e) => { dragging.current = true; applyClick(...getPos(e)); };
    const onMove = (e) => { if (dragging.current) applyClick(...getPos(e)); };
    const onUp = () => { dragging.current = false; };
    const onWheel = (e) => { e.preventDefault(); const newL = clamp(curL - (e.deltaY > 0 ? 2 : -2), 5, 95); setHSL(curH, curS, newL); };

    const tints = [];
    for (let i = 9; i >= 1; i--) tints.push(hslHex(curH, curS, 10 + i * 8));

    // ───── CARD VIEW ─────
    if (mode === 'card') {
        return (
            <div className="card card--wheel" onClick={(e) => {
                if (e.target.tagName === 'CANVAS') return;
                onExpand();
            }}>
                <div className="card-head">
                    <span className="card-title">Color Wheel</span>
                    <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}>
                        <button className="sch-btn" onClick={(e) => { e.stopPropagation(); handleReset(); }} style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Reset</button>
                        <span className="card-badge">Interactive</span>
                        <button className="expand-btn" onClick={(e) => { e.stopPropagation(); onExpand(); }}>⤢</button>
                    </div>
                </div>
                <div className="card-body" style={{ display: 'flex', gap: '1rem' }}>
                    <div className="card-canvas-wrap" style={{ flex: 1 }}>
                        <canvas ref={canvasRef}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
                            onTouchStart={e => { onDown(e); e.preventDefault(); }}
                            onTouchMove={e => { onMove(e); e.preventDefault(); }}
                            onTouchEnd={onUp} onWheel={onWheel}
                        />
                    </div>
                    <div style={{ width: 180, flexShrink: 0 }}>
                        <div style={{
                            height: 50, borderRadius: 8, background: curHex, marginBottom: '.5rem',
                            border: '1px solid var(--b)', boxShadow: `0 4px 16px ${curHex}22`,
                            display: 'flex', alignItems: 'flex-end', padding: '.3rem .5rem'
                        }}>
                            <code style={{
                                fontSize: '.65rem', fontFamily: 'var(--mono)', fontWeight: 700,
                                color: (r * 299 + g * 587 + b * 114) / 1000 > 128 ? '#000' : '#fff',
                                textShadow: '0 1px 3px rgba(0,0,0,.4)'
                            }}>{curHex}</code>
                        </div>
                        <div className="ctrl-row">
                            <div className="ctrl-label">Hue <code>{Math.round(curH)}°</code></div>
                            <input type="range" min="0" max="359" value={curH}
                                style={{ background: 'linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)' }}
                                onClick={e => e.stopPropagation()} onChange={e => setHSL(+e.target.value, curS, curL)} />
                        </div>
                        <div className="ctrl-row">
                            <div className="ctrl-label">Saturation <code>{Math.round(curS)}%</code></div>
                            <input type="range" min="0" max="100" value={curS}
                                onClick={e => e.stopPropagation()} onChange={e => setHSL(curH, +e.target.value, curL)} />
                        </div>
                        <div className="ctrl-row">
                            <div className="ctrl-label">Lightness <code>{Math.round(curL)}%</code></div>
                            <input type="range" min="5" max="95" value={curL}
                                onClick={e => e.stopPropagation()} onChange={e => setHSL(curH, curS, +e.target.value)} />
                        </div>
                        <div className="sw-grid" style={{ marginTop: '.4rem' }}>
                            {tints.slice(0, 8).map((c, i) => (
                                <div key={i} className="sw" role="button" tabIndex={0} style={{ background: c, height: 28 }}
                                    onClick={(e) => { e.stopPropagation(); onCopy(c); }}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onCopy(c); } }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ───── EXPANDED VIEW ─────
    return (
        <>
            <div className="modal-left">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.6rem' }}>
                    <div style={{
                        height: 60, borderRadius: 10, background: curHex, flex: 1, marginRight: '.5rem',
                        border: '1px solid var(--b)', boxShadow: `0 4px 20px ${curHex}22`,
                        display: 'flex', alignItems: 'flex-end', padding: '.4rem .6rem'
                    }}>
                        <code style={{
                            fontSize: '.72rem', fontFamily: 'var(--mono)', fontWeight: 700,
                            color: (r * 299 + g * 587 + b * 114) / 1000 > 128 ? '#000' : '#fff'
                        }}>{curHex}</code>
                    </div>
                    <button className="sch-btn" onClick={handleReset} style={{ padding: '4px 10px', fontSize: '0.8rem', height: 'fit-content' }}>Reset</button>
                </div>
                <div className="info-grid" style={{ marginBottom: '.6rem' }}>
                    <div className="info-item"><div className="label">HEX</div><div className="val">{curHex}</div></div>
                    <div className="info-item"><div className="label">RGB</div><div className="val">{r},{g},{b}</div></div>
                    <div className="info-item"><div className="label">HSL</div><div className="val">{Math.round(curH)}°,{Math.round(curS)}%,{Math.round(curL)}%</div></div>
                </div>
                <div className="ctrl-row">
                    <div className="ctrl-label">Hue <code>{Math.round(curH)}°</code></div>
                    <input type="range" min="0" max="359" value={curH}
                        style={{ background: 'linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)' }}
                        onChange={e => setHSL(+e.target.value, curS, curL)} />
                </div>
                <div className="ctrl-row">
                    <div className="ctrl-label">Saturation <code>{Math.round(curS)}%</code></div>
                    <input type="range" min="0" max="100" value={curS} onChange={e => setHSL(curH, +e.target.value, curL)} />
                </div>
                <div className="ctrl-row">
                    <div className="ctrl-label">Lightness <code>{Math.round(curL)}%</code></div>
                    <input type="range" min="5" max="95" value={curL} onChange={e => setHSL(curH, curS, +e.target.value)} />
                </div>
                <div style={{ marginTop: '.6rem' }}>
                    <div className="section-title">History</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {history.map((h, i) => (
                            <div key={i} role="button" tabIndex={0} style={{
                                width: 22, height: 22, borderRadius: 4, background: h, cursor: 'pointer',
                                border: '1px solid rgba(255,255,255,.05)'
                            }}
                                onClick={() => {
                                    try {
                                        const [rr, gg, bb] = hexToRgbArray(h); const [hh, ss, ll] = rgbToHsl(rr, gg, bb);
                                        setHSL(Math.round(hh), Math.round(ss), Math.round(ll));
                                    } catch {
                                        // Ignore malformed history values.
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        try {
                                            const [rr, gg, bb] = hexToRgbArray(h); const [hh, ss, ll] = rgbToHsl(rr, gg, bb);
                                            setHSL(Math.round(hh), Math.round(ss), Math.round(ll));
                                        } catch {
                                            // Ignore malformed history values.
                                        }
                                    }
                                }} />
                        ))}
                    </div>
                    <button className="act-btn" style={{ width: '100%', marginTop: '.4rem' }}
                        onClick={() => setHistory(p => [curHex, ...p.filter(x => x !== curHex)].slice(0, 16))}>
                        + Save
                    </button>
                </div>
            </div>
            <div className="modal-center">
                <canvas ref={canvasRef}
                    onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
                    onTouchStart={e => { onDown(e); e.preventDefault(); }}
                    onTouchMove={e => { onMove(e); e.preventDefault(); }}
                    onTouchEnd={onUp} onWheel={onWheel} />
                <div className="modal-hint">Drag · Click · Scroll lightness</div>
            </div>
            <div className="modal-right">
                <div className="section-title">Contrast Check</div>
                <div className="contrast-row">
                    <div className="contrast-ratio">{crWhite.toFixed(1)}</div>
                    <div className="contrast-label">vs White</div>
                    <span className={`contrast-badge ${crWhite >= 4.5 ? 'pass' : 'fail'}`}>AA {crWhite >= 4.5 ? '✓' : '✗'}</span>
                    <span className={`contrast-badge ${crWhite >= 7 ? 'pass' : 'fail'}`}>AAA {crWhite >= 7 ? '✓' : '✗'}</span>
                </div>
                <div className="contrast-row">
                    <div className="contrast-ratio">{crBlack.toFixed(1)}</div>
                    <div className="contrast-label">vs Black</div>
                    <span className={`contrast-badge ${crBlack >= 4.5 ? 'pass' : 'fail'}`}>AA {crBlack >= 4.5 ? '✓' : '✗'}</span>
                    <span className={`contrast-badge ${crBlack >= 7 ? 'pass' : 'fail'}`}>AAA {crBlack >= 7 ? '✓' : '✗'}</span>
                </div>
                <div className="section-title" style={{ marginTop: '.75rem' }}>Color Blindness</div>
                {cbResults.map(({ type, hex, label }) => (
                    <div key={type} className="cb-row" onClick={() => onCopy(hex)} style={{ cursor: 'pointer' }}>
                        <div className="cb-swatch" style={{ background: hex }} />
                        <div><div className="cb-label">{label}</div><div className="cb-hex">{hex}</div></div>
                    </div>
                ))}
                <div className="section-title" style={{ marginTop: '.75rem' }}>Tints & Shades</div>
                <div className="sw-grid">
                    {tints.map((c, i) => <div key={i} className="sw" role="button" tabIndex={0} style={{ background: c }} onClick={() => onCopy(c)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCopy(c); }} />)}
                </div>
            </div>
        </>
    );
}
