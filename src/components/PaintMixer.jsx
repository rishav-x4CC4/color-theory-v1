import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { hexToRgbArray, rgbToHex, lerpRgb, clamp, DEFINITIONS } from '../utils/colorUtils';

export default function PaintCard({ mode, hex, setColor, onCopy, onExpand }) {
    const [c1, setC1] = useState(() => {
        try { return hex || '#FF4400'; } catch { return '#FF4400'; }
    });
    const [c2, setC2] = useState('#0044FF');
    const [c3, setC3] = useState('#00BB00');
    const [ratio, setRatio] = useState(50);
    const [cWeight, setCWeight] = useState(0);
    const [mixMode, setMixMode] = useState('subtractive');
    const [steps, setSteps] = useState(8);
    const vizRef = useRef(null);

    // Sync c1 with the global hex when it changes
    useEffect(() => {
        if (hex) setC1(hex);
    }, [hex]);

    const handleReset = useCallback(() => {
        setC1(hex || '#FF4400');
        setC2('#0044FF');
        setC3('#00BB00');
        setRatio(50);
        setCWeight(0);
        setMixMode('subtractive');
        setSteps(8);
    }, [hex]);

    const [r1, g1, b1] = hexToRgbArray(c1), [r2, g2, b2] = hexToRgbArray(c2), [r3, g3, b3] = hexToRgbArray(c3);
    const rt = ratio / 100, cw = cWeight / 100;

    const getMixedColor = useCallback((t) => {
        let sr, sg, sb;
        if (mixMode === 'subtractive') {
            const invR1 = 1 - r1 / 255, invR2 = 1 - r2 / 255, invR3 = 1 - r3 / 255;
            const invG1 = 1 - g1 / 255, invG2 = 1 - g2 / 255, invG3 = 1 - g3 / 255;
            const invB1 = 1 - b1 / 255, invB2 = 1 - b2 / 255, invB3 = 1 - b3 / 255;
            
            sr = clamp(Math.round(255 * (1 - (invR1 * t * 2 + invR2 * (1 - t) * 2) * (1 - cw) * (invR3 * cw + 1 - cw))), 0, 255);
            sg = clamp(Math.round(255 * (1 - (invG1 * t * 2 + invG2 * (1 - t) * 2) * (1 - cw) * (invG3 * cw + 1 - cw))), 0, 255);
            sb = clamp(Math.round(255 * (1 - (invB1 * t * 2 + invB2 * (1 - t) * 2) * (1 - cw) * (invB3 * cw + 1 - cw))), 0, 255);
        } else if (mixMode === 'additive') {
            sr = clamp(Math.round(r1 * (t * 2) + r2 * ((1 - t) * 2) + r3 * (cw * 2)), 0, 255);
            sg = clamp(Math.round(g1 * (t * 2) + g2 * ((1 - t) * 2) + g3 * (cw * 2)), 0, 255);
            sb = clamp(Math.round(b1 * (t * 2) + b2 * ((1 - t) * 2) + b3 * (cw * 2)), 0, 255);
        } else {
            const r12 = r1 * t + r2 * (1 - t);
            const g12 = g1 * t + g2 * (1 - t);
            const b12 = b1 * t + b2 * (1 - t);
            sr = clamp(Math.round(r12 * (1 - cw) + r3 * cw), 0, 255);
            sg = clamp(Math.round(g12 * (1 - cw) + g3 * cw), 0, 255);
            sb = clamp(Math.round(b12 * (1 - cw) + b3 * cw), 0, 255);
        }
        return [sr, sg, sb];
    }, [r1, g1, b1, r2, g2, b2, r3, g3, b3, cw, mixMode]);

    const [mr, mg, mb] = getMixedColor(rt);
    const mixed = rgbToHex(mr, mg, mb);

    const blendSteps = useMemo(() => Array.from({ length: steps }, (_, i) => {
        const t = i / (steps - 1);
        const [sr, sg, sb] = getMixedColor(t);
        return rgbToHex(clamp(sr, 0, 255), clamp(sg, 0, 255), clamp(sb, 0, 255));
    }), [steps, getMixedColor]);

    const draw = useCallback(() => {
        const cv = vizRef.current; if (!cv) return;
        const container = cv.parentElement; if (!container) return;
        cv.width = Math.min(container.clientWidth - 20, mode === 'expanded' ? 800 : 280);
        cv.height = Math.round(cv.width * 0.4);
        const ctx = cv.getContext('2d'), w = cv.width, h = cv.height;
        ctx.clearRect(0, 0, w, h);
        // Gradient strip
        ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, w, h, 10); ctx.clip();
        for (let i = 0; i <= 50; i++) {
            const t = i / 50;
            const [sr, sg, sb] = getMixedColor(t);
            ctx.fillStyle = `rgb(${sr},${sg},${sb})`;
            ctx.fillRect(Math.floor(i / 50 * w), 0, Math.ceil(w / 50) + 1, h);
        }
        ctx.restore();
        const rx = Math.round(w * rt);
        ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(rx, 0); ctx.lineTo(rx, h); ctx.stroke();
        ctx.setLineDash([]);
    }, [rt, mode, getMixedColor]);

    useEffect(() => { draw() }, [draw]);

    // ── CARD VIEW ──
    if (mode === 'card') {
        return (
            <div className="card card--paint" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onExpand(); }} onClick={onExpand}>
                <div className="card-head">
                    <span className="card-title">Paint Mixer</span>
                    <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}>
                        <button className="sch-btn" onClick={(e) => { e.stopPropagation(); handleReset(); }} style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Reset</button>
                        <button className="expand-btn" onClick={e => { e.stopPropagation(); onExpand() }}>⤢</button>
                    </div>
                </div>
                <div className="card-body">
                    <div className="mix-wells" style={{ marginBottom: '.5rem' }}>
                        <div className="well" style={{ background: c1, height: 50 }}>
                            <input type="color" value={c1} onClick={e => e.stopPropagation()} onChange={e => setC1(e.target.value)} />
                            <div className="well-label">A</div>
                        </div>
                        <div className="well" style={{ background: c2, height: 50 }}>
                            <input type="color" value={c2} onClick={e => e.stopPropagation()} onChange={e => setC2(e.target.value)} />
                            <div className="well-label">B</div>
                        </div>
                        <div className="well" style={{ background: c3, height: 50 }}>
                            <input type="color" value={c3} onClick={e => e.stopPropagation()} onChange={e => setC3(e.target.value)} />
                            <div className="well-label">C</div>
                        </div>
                    </div>
                    <div className="mix-result" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onCopy(mixed); } }} style={{ background: mixed, height: 45, marginBottom: '.5rem', boxShadow: `0 3px 14px ${mixed}22` }}
                        onClick={e => { e.stopPropagation(); onCopy(mixed) }}>
                        <code style={{ color: (mr * 299 + mg * 587 + mb * 114) / 1000 > 128 ? '#000' : '#fff' }}>{mixed}</code>
                    </div>
                    <div className="card-canvas-wrap" style={{ minHeight: 80 }}>
                        <canvas ref={vizRef} />
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
                    <div className="section-title" style={{ marginBottom: 0 }}>Mix Colors</div>
                    <button className="sch-btn" onClick={handleReset} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>Reset</button>
                </div>
                <div className="mix-wells" style={{ marginBottom: '.5rem' }}>
                    <div className="well" style={{ background: c1 }}><input type="color" value={c1} onChange={e => setC1(e.target.value)} /><div className="well-label">A</div></div>
                    <div className="well" style={{ background: c2 }}><input type="color" value={c2} onChange={e => setC2(e.target.value)} /><div className="well-label">B</div></div>
                    <div className="well" style={{ background: c3 }}><input type="color" value={c3} onChange={e => setC3(e.target.value)} /><div className="well-label">C</div></div>
                </div>
                <div className="ctrl-row">
                    <div className="ctrl-label">A:B Ratio <code>{ratio}%</code></div>
                    <input type="range" min="0" max="100" value={ratio} style={{ background: `linear-gradient(90deg,${c1},${c2})` }} onChange={e => setRatio(+e.target.value)} />
                </div>
                <div className="ctrl-row">
                    <div className="ctrl-label">Include C <code>{cWeight}%</code></div>
                    <input type="range" min="0" max="100" value={cWeight} onChange={e => setCWeight(+e.target.value)} />
                </div>
                <div style={{ marginTop: '.5rem' }}>
                    <div className="section-title">Result</div>
                    <div className="mix-result" style={{ background: mixed, boxShadow: `0 3px 16px ${mixed}22` }}
                        role="button" tabIndex={0}
                        onClick={() => { onCopy(mixed); setColor(mixed); }}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onCopy(mixed); setColor(mixed); } }}>
                        <code>{mixed}</code>
                    </div>
                </div>
                <div style={{ marginTop: '.75rem' }}>
                    <div className="section-title">Mode</div>
                    <div className="sch-btns">
                        {['subtractive', 'additive', 'average'].map(m => (
                            <button key={m} className={`sch-btn ${mixMode === m ? 'active' : ''}`} onClick={() => setMixMode(m)}>
                                {m === 'subtractive' ? 'Pigment' : m === 'additive' ? 'Light' : 'Average'}
                            </button>
                        ))}
                    </div>
                </div>
                <div style={{ marginTop: '.75rem' }}>
                    <div className="def-box">
                        <div className="def-title">{mixMode === 'subtractive' ? 'Pigment' : mixMode === 'additive' ? 'Light' : 'Average'}</div>
                        <div className="def-body">{DEFINITIONS[mixMode === 'subtractive' ? 'subtractive' : mixMode === 'additive' ? 'additive' : 'average-mix'].body}</div>
                    </div>
                </div>
            </div>
            <div className="modal-center" style={{ flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
                <canvas ref={vizRef} />
            </div>
            <div className="modal-right">
                <div className="section-title">Blend Steps</div>
                <div className="pstrip" style={{ marginBottom: '.4rem' }}>
                    {blendSteps.map((c, i) => <div key={i} className="pc" role="button" tabIndex={0} style={{ background: c }} onClick={() => onCopy(c)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCopy(c); }}><div className="ph">{c}</div></div>)}
                </div>
                <div className="sw-grid">
                    {blendSteps.map((c, i) => <div key={i} className="sw" role="button" tabIndex={0} style={{ background: c, height: 30 }} onClick={() => onCopy(c)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCopy(c); }} title={c} />)}
                </div>
                <div className="ctrl-row" style={{ marginTop: '.75rem' }}>
                    <div className="ctrl-label">Steps <code>{steps}</code></div>
                    <input type="range" min="3" max="16" value={steps} onChange={e => setSteps(+e.target.value)} />
                </div>
            </div>
        </>
    );
}
