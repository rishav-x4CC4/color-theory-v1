import { useState, useRef, useEffect, useCallback } from 'react';
import { hslHex, rgbToHex, DEFINITIONS } from '../utils/colorUtils';

export default function GradientCard({ mode, onCopy, onExpand }) {
    const [stops, setStops] = useState(['#FF0000', '#FF8800', '#FFFF00']);
    const [gradType, setGradType] = useState('linear');
    const [angle, setAngle] = useState(90);
    const [activeStop, setActiveStop] = useState(0);
    const canvasRef = useRef(null);

    const handleReset = useCallback(() => {
        setStops(['#FF0000', '#FF8800', '#FFFF00']);
        setGradType('linear');
        setAngle(90);
        setActiveStop(0);
    }, []);

    const render = useCallback(() => {
        const cv = canvasRef.current; if (!cv) return;
        const container = cv.parentElement; if (!container) return;
        const maxW = mode === 'expanded' ? Math.min(container.clientWidth - 40, 1200) : Math.min(container.clientWidth - 20, 400);
        const maxH = mode === 'expanded' ? Math.min(container.clientHeight - 60, 700) : Math.min(container.clientHeight - 20, 180);
        cv.width = Math.max(maxW, 100); cv.height = Math.max(maxH, 60);
        const ctx = cv.getContext('2d'), w = cv.width, h = cv.height;
        ctx.clearRect(0, 0, w, h);
        ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, w, h, 10); ctx.clip();
        let grad;
        if (gradType === 'linear') {
            const rad = angle * Math.PI / 180, dx = Math.cos(rad), dy = Math.sin(rad);
            grad = ctx.createLinearGradient(w / 2 - dx * w / 2, h / 2 - dy * h / 2, w / 2 + dx * w / 2, h / 2 + dy * h / 2);
        } else if (gradType === 'radial') {
            grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.min(w, h) / 2);
        } else {
            grad = ctx.createConicGradient(angle * Math.PI / 180, w / 2, h / 2);
        }
        stops.forEach((c, i) => grad.addColorStop(i / (stops.length - 1), c));
        ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
        ctx.restore();
    }, [stops, gradType, angle, mode]);

    useEffect(() => {
        render();
        window.addEventListener('resize', render);
        return () => window.removeEventListener('resize', render);
    }, [render]);

    const cssStops = stops.map((c, i) => `${c} ${Math.round(i / (stops.length - 1) * 100)}%`).join(', ');
    const cssCode = gradType === 'linear' ? `linear-gradient(${angle}deg, ${cssStops})`
        : gradType === 'radial' ? `radial-gradient(circle, ${cssStops})`
            : `conic-gradient(from ${angle}deg, ${cssStops})`;

    const addStop = () => { setStops([...stops, hslHex(Math.random() * 360, 80, 55)]); setActiveStop(stops.length); };
    const removeStop = () => { if (stops.length <= 2) return; setStops(stops.filter((_, i) => i !== activeStop)); setActiveStop(Math.min(activeStop, stops.length - 2)); };
    const updateStop = (i, v) => { const s = [...stops]; s[i] = v; setStops(s); };

    const pickFromCanvas = (e) => {
        const cv = canvasRef.current, ctx = cv.getContext('2d'), rect = cv.getBoundingClientRect();
        const x = Math.round((e.clientX - rect.left) * (cv.width / rect.width));
        const y = Math.round((e.clientY - rect.top) * (cv.height / rect.height));
        if (x < 0 || x >= cv.width || y < 0 || y >= cv.height) return;
        const d = ctx.getImageData(x, y, 1, 1).data;
        onCopy(rgbToHex(d[0], d[1], d[2]));
    };

    // ── CARD VIEW ──
    if (mode === 'card') {
        return (
            <div className="card card--gradient" onClick={onExpand}>
                <div className="card-head">
                    <span className="card-title">Gradient Builder</span>
                    <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}>
                        <button className="sch-btn" onClick={(e) => { e.stopPropagation(); handleReset(); }} style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Reset</button>
                        <span className="card-badge">{gradType}</span>
                        <button className="expand-btn" onClick={e => { e.stopPropagation(); onExpand() }}>⤢</button>
                    </div>
                </div>
                <div className="card-body">
                    <div className="grad-stops" style={{ marginBottom: '.5rem' }}>
                        {stops.map((c, i) => (
                            <div key={i} className={`gstop ${i === activeStop ? 'active' : ''}`} style={{ background: c }}
                                onClick={e => { e.stopPropagation(); setActiveStop(i) }}>
                                <input type="color" value={c} onClick={e => e.stopPropagation()} onChange={e => updateStop(i, e.target.value)} />
                            </div>
                        ))}
                        <button className="act-btn" onClick={e => { e.stopPropagation(); addStop() }} style={{ fontSize: '.7rem' }}>+</button>
                    </div>
                    <div className="card-canvas-wrap" style={{ minHeight: 140 }}>
                        <canvas ref={canvasRef} onClick={e => { e.stopPropagation(); pickFromCanvas(e) }} style={{ cursor: 'crosshair' }} />
                    </div>
                    <div style={{ marginTop: '.4rem', display: 'flex', gap: '.3rem' }}>
                        {['linear', 'radial', 'conic'].map(t => (
                            <button key={t} className={`sch-btn ${gradType === t ? 'active' : ''}`}
                                onClick={e => { e.stopPropagation(); setGradType(t) }}>
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ── EXPANDED VIEW ──
    return (
        <>
            <div className="modal-left">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
                    <div className="section-title" style={{ marginBottom: 0 }}>Gradient Stops</div>
                    <button className="sch-btn" onClick={handleReset} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>Reset</button>
                </div>
                <div className="grad-stops">
                    {stops.map((c, i) => (
                        <div key={i} className={`gstop ${i === activeStop ? 'active' : ''}`} style={{ background: c, boxShadow: i === activeStop ? `0 0 10px ${c}55` : 'none' }}
                            onClick={() => setActiveStop(i)}>
                            <input type="color" value={c} onChange={e => updateStop(i, e.target.value)} />
                        </div>
                    ))}
                </div>
                <button className="add-stop" onClick={addStop}>+ Add Stop</button>
                {stops.length > 2 && <button className="act-btn" style={{ width: '100%', marginTop: '.3rem' }} onClick={removeStop}>Remove Selected</button>}
                <div style={{ marginTop: '.75rem' }}>
                    <div className="section-title">Preview</div>
                    <div style={{
                        height: 40, borderRadius: 8, backgroundImage: cssCode,
                        border: '1px solid var(--b)'
                    }} />
                </div>
                <div style={{ marginTop: '.75rem' }}>
                    <div className="section-title">Type</div>
                    <div className="sch-btns">
                        {['linear', 'radial', 'conic'].map(t => (
                            <button key={t} className={`sch-btn ${gradType === t ? 'active' : ''}`} onClick={() => setGradType(t)}>
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="ctrl-row" style={{ marginTop: '.5rem' }}>
                    <div className="ctrl-label">Angle <code>{angle}°</code></div>
                    <input type="range" min="0" max="360" value={angle} onChange={e => setAngle(+e.target.value)} />
                </div>
                <div style={{ marginTop: '.75rem' }}>
                    <div className="def-box">
                        <div className="def-title">{gradType} Gradient</div>
                        <div className="def-body">{DEFINITIONS[gradType + '-gradient'].body}</div>
                    </div>
                </div>
            </div>
            <div className="modal-center">
                <canvas ref={canvasRef} style={{ cursor: 'crosshair' }} onClick={pickFromCanvas} />
                <div className="modal-hint">Click to pick a color</div>
            </div>
            <div className="modal-right">
                <div className="section-title">CSS Output</div>
                <div className="css-output">background: {cssCode};</div>
                <button className="act-btn" style={{ width: '100%', marginTop: '.5rem' }} onClick={() => onCopy(`background: ${cssCode};`)}>Copy CSS</button>
                <div style={{ marginTop: '.75rem' }}>
                    <div className="section-title">Color Values</div>
                    {stops.map((c, i) => (
                        <div key={i} className="color-chip" onClick={() => onCopy(c)}>
                            <div className="color-chip-swatch" style={{ background: c }} />
                            <div><code>{c.toUpperCase()}</code><span style={{ display: 'block' }}>Stop {i + 1}</span></div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
