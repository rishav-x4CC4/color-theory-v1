import { useState, useRef, useEffect, useCallback } from 'react';
import { hslToRgb, hslHex, hexToRgbArray, rgbToHsl } from '../utils/colorUtils';

const SCHEMES = {
    complementary: { a: h => [h, (h + 180) % 360], l: ['Base', 'Comp'], desc: '180° apart', info: 'Opposite colors that create high contrast and energy.' },
    analogous: { a: h => [h, (h + 30) % 360, (h - 30 + 360) % 360], l: ['Base', '+30°', '-30°'], desc: 'Adjacent', info: 'Side-by-side colors that feel serene and comfortable.' },
    triadic: { a: h => [h, (h + 120) % 360, (h + 240) % 360], l: ['Base', '+120°', '+240°'], desc: '120° apart', info: 'Equally spaced colors that provide vibrant, bold balance.' },
    split: { a: h => [h, (h + 150) % 360, (h + 210) % 360], l: ['Base', 'Split A', 'Split B'], desc: 'Soft contrast', info: 'One base and two neighbors of its complement for soft tension.' },
    tetradic: { a: h => [h, (h + 90) % 360, (h + 180) % 360, (h + 270) % 360], l: ['1', '2', '3', '4'], desc: '4 colors', info: 'Two complementary pairs forming a rich, complex square.' },
    mono: { a: h => [h], l: ['Base'], desc: 'One hue', info: 'Variations of a single color through tints and shades.' },
};

export default function SchemesCard({ mode, hex, setColor, onCopy, onExpand }) {
    const canvasRef = useRef(null);
    const [schType, setSchType] = useState('complementary');
    const [baseH, setBaseH] = useState(() => {
        if (!hex) return 0;
        try {
            const [r, g, b] = hexToRgbArray(hex);
            const [h] = rgbToHsl(r, g, b);
            return h;
        } catch {
            return 0;
        }
    });
    const [schL, setSchL] = useState(50);
    const [schS, setSchS] = useState(100);
    const dragging = useRef(-1);
    const imgCache = useRef(null);

    // Sync baseH when the global hex changes
    useEffect(() => {
        if (!hex) return;
        try {
            const [r, g, b] = hexToRgbArray(hex);
            const [h] = rgbToHsl(r, g, b);
            setBaseH(h);
        } catch { /* ignore malformed hex */ }
    }, [hex]);

    const handleReset = useCallback(() => {
        setSchType('complementary');
        setSchL(50);
        setSchS(100);
        if (hex) {
            try {
                const [r, g, b] = hexToRgbArray(hex);
                const [h] = rgbToHsl(r, g, b);
                setBaseH(h);
            } catch { setBaseH(0); }
        } else {
            setBaseH(0);
        }
    }, [hex]);

    const def = SCHEMES[schType];
    const angles = def.a(baseH);
    const paletteColors = angles.map(a => hslHex(a, schS, schL));

    const buildImage = useCallback((ctx, size, cx, cy, radius) => {
        const img = ctx.createImageData(size, size);
        const d = img.data;
        for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
            const dx = x - cx, dy = y - cy, dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > radius) continue;
            const hue = ((Math.atan2(dy, dx) * 180 / Math.PI) + 90 + 360) % 360;
            const [r, g, b] = hslToRgb(hue, dist / radius * 100, 50);
            const i = (y * size + x) * 4; d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255;
        }
        imgCache.current = img;
    }, []);

    const render = useCallback(() => {
        const cv = canvasRef.current; if (!cv) return;
        const ctx = cv.getContext('2d');
        const container = cv.parentElement; if (!container) return;
        const maxSize = mode === 'expanded'
            ? Math.min(container.clientWidth - 40, container.clientHeight - 60, 700)
            : Math.min(container.clientWidth - 20, container.clientHeight - 20, 240);
        const size = Math.max(maxSize, 80);
        cv.width = cv.height = size;
        const radius = size / 2 - 8, cx = size / 2, cy = size / 2;

        if (!imgCache.current || imgCache.current.width !== size) buildImage(ctx, size, cx, cy, radius);
        ctx.putImageData(imgCache.current, 0, 0);
        ctx.save(); ctx.globalCompositeOperation = 'destination-in';
        ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill(); ctx.restore();

        if (schL !== 50) {
            ctx.save(); ctx.globalAlpha = Math.min(1, Math.abs(schL - 50) / 50);
            ctx.fillStyle = schL > 50 ? '#fff' : '#000';
            ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        }

        const mr = radius * 0.72;
        const curAngles = def.a(baseH);
        // Lines
        if (curAngles.length > 1) {
            const pts = curAngles.map(a => { const r = (a - 90) * Math.PI / 180; return [cx + mr * Math.cos(r), cy + mr * Math.sin(r)]; });
            ctx.save(); ctx.beginPath(); ctx.moveTo(...pts[0]);
            pts.slice(1).forEach(p => ctx.lineTo(...p));
            if (schType !== 'analogous' && schType !== 'split') ctx.closePath();
            ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
        }
        // Markers
        curAngles.forEach((a, i) => {
            const rad = (a - 90) * Math.PI / 180, mx = cx + mr * Math.cos(rad), my = cy + mr * Math.sin(rad);
            const markerHex = hslHex(a, schS, schL);
            ctx.beginPath(); ctx.arc(mx, my, 8, 0, Math.PI * 2); ctx.fillStyle = markerHex; ctx.fill();
            ctx.strokeStyle = i === 0 ? '#fff' : 'rgba(255,255,255,.5)'; ctx.lineWidth = 2; ctx.stroke();
        });
    }, [baseH, schL, schS, schType, def, mode, buildImage]);

    useEffect(() => {
        render();
        const h = () => { imgCache.current = null; render(); };
        window.addEventListener('resize', h); return () => window.removeEventListener('resize', h);
    }, [render]);

    const getPos = (e) => {
        const cv = canvasRef.current, rect = cv.getBoundingClientRect();
        const t = e.touches ? e.touches[0] : e;
        return [(t.clientX - rect.left) * (cv.width / rect.width), (t.clientY - rect.top) * (cv.height / rect.height)];
    };

    const onDown = (e) => {
        const [x, y] = getPos(e);
        const cv = canvasRef.current, size = cv.width, cx = size / 2, cy = size / 2, radius = size / 2 - 8, mr = radius * 0.72;
        const curAngles = def.a(baseH);
        let hit = -1;
        curAngles.forEach((a, i) => {
            const r = (a - 90) * Math.PI / 180;
            if (Math.hypot(x - (cx + mr * Math.cos(r)), y - (cy + mr * Math.sin(r))) < 20) hit = i;
        });
        if (hit >= 0) dragging.current = hit;
        else { const d = Math.hypot(x - cx, y - cy); if (d < radius) setBaseH(((Math.atan2(y - cy, x - cx) * 180 / Math.PI) + 90 + 360) % 360); }
    };
    const onMove = (e) => {
        if (dragging.current < 0) return;
        const [x, y] = getPos(e), cv = canvasRef.current, cx = cv.width / 2, cy = cv.height / 2;
        const newA = ((Math.atan2(y - cy, x - cx) * 180 / Math.PI) + 90 + 360) % 360;
        const off = def.a(baseH).map(a => a - baseH);
        setBaseH((newA - off[dragging.current] + 360) % 360);
    };
    const onUp = () => { dragging.current = -1; };

    // ── CARD VIEW ──
    if (mode === 'card') {
        return (
            <div className="card card--schemes" onClick={onExpand}>
                <div className="card-head">
                    <span className="card-title">Color Schemes</span>
                    <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}>
                        <button className="sch-btn" onClick={(e) => { e.stopPropagation(); handleReset(); }} style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Reset</button>
                        <span className="card-badge">{schType}</span>
                        <button className="expand-btn" onClick={e => { e.stopPropagation(); onExpand() }}>⤢</button>
                    </div>
                </div>
                <div className="card-body" style={{ display: 'flex', gap: '1rem' }}>
                    <div className="card-canvas-wrap" style={{ flex: '0 0 auto', width: 'auto' }}>
                        <canvas ref={canvasRef} onClick={e => e.stopPropagation()}
                            onMouseDown={e => { e.stopPropagation(); onDown(e) }} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="sch-btns" style={{ marginBottom: '.5rem' }}>
                            {Object.keys(SCHEMES).map(k => (
                                <button key={k} className={`sch-btn ${schType === k ? 'active' : ''}`}
                                    onClick={e => { e.stopPropagation(); setSchType(k) }}>
                                    {k === 'complementary' ? 'Comp' : k === 'mono' ? 'Mono' : k === 'split' ? 'Split' : k.charAt(0).toUpperCase() + k.slice(1)}
                                </button>
                            ))}
                        </div>
                        <div style={{ fontSize: '.85rem', color: 'var(--t2)', fontStyle: 'italic', marginBottom: '.6rem', lineHeight: 1.4, minHeight: '2.8em' }}>
                            {def.info}
                        </div>
                        <div className="pstrip" style={{ marginBottom: '.4rem' }}>
                            {paletteColors.map((c, i) => (
                                <div key={i} className="pc" style={{ background: c }} onClick={e => { e.stopPropagation(); onCopy(c) }}>
                                    <div className="ph">{c}</div>
                                </div>
                            ))}
                        </div>
                        <div className="pstrip">
                            {angles.map((a) => [15, 35, 55, 75, 90].map(l => hslHex(a, schS, l))).flat().map((c, i) => (
                                <div key={i} className="pc" style={{ background: c }} onClick={e => { e.stopPropagation(); onCopy(c) }}>
                                    <div className="ph">{c}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── EXPANDED VIEW ──
    return (
        <>
            <div className="modal-left">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
                    <div className="section-title" style={{ marginBottom: 0 }}>Scheme Type</div>
                    <button className="sch-btn" onClick={handleReset} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>Reset</button>
                </div>
                <div className="sch-btns" style={{ marginBottom: '.75rem' }}>
                    {Object.keys(SCHEMES).map((k) => (
                        <button key={k} className={`sch-btn ${schType === k ? 'active' : ''}`} onClick={() => setSchType(k)}>
                            {k === 'complementary' ? 'Comp' : k === 'mono' ? 'Mono' : k === 'split' ? 'Split' : k.charAt(0).toUpperCase() + k.slice(1)}
                        </button>
                    ))}
                </div>
                <div style={{ fontSize: '.95rem', color: 'var(--t)', marginBottom: '.5rem', fontWeight: 600 }}>{def.desc}</div>
                <div style={{ fontSize: '.9rem', color: 'var(--t2)', fontStyle: 'italic', marginBottom: '.85rem', lineHeight: 1.5 }}>
                    {def.info}
                </div>
                <div className="ctrl-row">
                    <div className="ctrl-label">Base Hue <code>{Math.round(baseH)}°</code></div>
                    <input type="range" min="0" max="359" value={Math.round(baseH)}
                        style={{ background: 'linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)' }}
                        onChange={e => setBaseH(+e.target.value)} />
                </div>
                <div className="ctrl-row">
                    <div className="ctrl-label">Lightness <code>{schL}%</code></div>
                    <input type="range" min="5" max="95" value={schL} onChange={e => setSchL(+e.target.value)} />
                </div>
                <div className="ctrl-row">
                    <div className="ctrl-label">Saturation <code>{schS}%</code></div>
                    <input type="range" min="0" max="100" value={schS} onChange={e => setSchS(+e.target.value)} />
                </div>
                <div style={{ marginTop: '.75rem' }}>
                    <div className="section-title">Colors</div>
                    {angles.map((a, i) => {
                        const chipHex = hslHex(a, schS, schL);
                        return (
                            <div key={i} className="color-chip" role="button" tabIndex={0}
                                onClick={() => { onCopy(chipHex); setColor(chipHex); }}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onCopy(chipHex); setColor(chipHex); } }}>
                                <div className="color-chip-swatch" style={{ background: chipHex }} />
                                <div><code>{chipHex}</code><span style={{ display: 'block' }}>{def.l[i] || ''}</span></div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="modal-center">
                <canvas ref={canvasRef}
                    onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} />
                <div className="modal-hint">Drag dots · Click wheel to set base</div>
            </div>
            <div className="modal-right">
                <div className="section-title">Main Palette</div>
                <div className="pstrip" style={{ marginBottom: '.5rem' }}>
                    {paletteColors.map((c, i) => <div key={i} className="pc" role="button" tabIndex={0} style={{ background: c }} onClick={() => onCopy(c)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCopy(c); }}><div className="ph">{c}</div></div>)}
                </div>
                <div className="section-title" style={{ marginTop: '.5rem' }}>Variations</div>
                {angles.map((a, ri) => (
                    <div key={ri} className="pstrip" style={{ marginTop: 4 }}>
                        {[15, 30, 50, 70, 85].map(l => { const c = hslHex(a, schS, l); return <div key={l} className="pc" role="button" tabIndex={0} style={{ background: c }} onClick={() => onCopy(c)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCopy(c); }}><div className="ph">{c}</div></div>; })}
                    </div>
                ))}
            </div>
        </>
    );
}
