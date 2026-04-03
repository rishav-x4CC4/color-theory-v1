import { useState, useCallback, useMemo, useEffect } from 'react';
import { hexToRgbArray, rgbToHsl, hslHex } from '../utils/colorUtils';

// Static data — defined at module level to avoid per-instance useMemo overhead
const WHEEL_DATA = [
    { color: '#FF2D20', label: 'Red', cat: 'primary', desc: 'A Primary color. Cannot be created by mixing other colors.' },
    { color: '#FF5E1F', label: 'Red-Orange', cat: 'tertiary', desc: 'A Tertiary color. Mix Red (Primary) + Orange (Secondary).' },
    { color: '#FF8A00', label: 'Orange', cat: 'secondary', desc: 'A Secondary color. Mix Red + Yellow.' },
    { color: '#FFB300', label: 'Yellow-Orange', cat: 'tertiary', desc: 'A Tertiary color. Mix Yellow (Primary) + Orange (Secondary).' },
    { color: '#FFD600', label: 'Yellow', cat: 'primary', desc: 'A Primary color. Cannot be created by mixing other colors.' },
    { color: '#9CCC1A', label: 'Yellow-Green', cat: 'tertiary', desc: 'A Tertiary color. Mix Yellow (Primary) + Green (Secondary).' },
    { color: '#3BAA3F', label: 'Green', cat: 'secondary', desc: 'A Secondary color. Mix Yellow + Blue.' },
    { color: '#009688', label: 'Blue-Green', cat: 'tertiary', desc: 'A Tertiary color. Mix Blue (Primary) + Green (Secondary).' },
    { color: '#1E4DFF', label: 'Blue', cat: 'primary', desc: 'A Primary color. Cannot be created by mixing other colors.' },
    { color: '#4B3FD9', label: 'Blue-Violet', cat: 'tertiary', desc: 'A Tertiary color. Mix Blue (Primary) + Purple/Violet (Secondary).' },
    { color: '#7B2CBF', label: 'Purple', cat: 'secondary', desc: 'A Secondary color. Mix Blue + Red.' },
    { color: '#C2185B', label: 'Red-Violet', cat: 'tertiary', desc: 'A Tertiary color. Mix Red (Primary) + Purple/Violet (Secondary).' }
];

export default function ColorTheoryGuide({ hex, onCopy }) {
    const [mockBaseHex, setMockBaseHex] = useState(hex || '#ff0055');
    const [mockScheme, setMockScheme] = useState('complementary');

    // Sync mock base color when global hex changes
    useEffect(() => {
        if (hex) setMockBaseHex(hex);
    }, [hex]);

    // Part 1 Interactive Wheel State
    const [activeWheelCategory, setActiveWheelCategory] = useState(null); // 'primary', 'secondary', 'tertiary'
    const [activeSliceDesc, setActiveSliceDesc] = useState('Click a slice on the wheel to learn about its properties.');

    // Part 2 Harmony Scheme State
    const [activeHarmonyScheme, setActiveHarmonyScheme] = useState(null); // 'monochromatic', 'complementary', 'analogous', 'triadic'

    // SVG Wedge Generator
    const createWedge = (startAngle, endAngle, innerRadius, outerRadius) => {
        const startRad = (startAngle - 90) * Math.PI / 180;
        const endRad = (endAngle - 90) * Math.PI / 180;
        const x1 = outerRadius * Math.cos(startRad);
        const y1 = outerRadius * Math.sin(startRad);
        const x2 = outerRadius * Math.cos(endRad);
        const y2 = outerRadius * Math.sin(endRad);
        const ix1 = innerRadius * Math.cos(startRad);
        const iy1 = innerRadius * Math.sin(startRad);
        const ix2 = innerRadius * Math.cos(endRad);
        const iy2 = innerRadius * Math.sin(endRad);

        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        return [
            `M ${x1} ${y1}`,
            `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `L ${ix2} ${iy2}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix1} ${iy1}`,
            "Z"
        ].join(" ");
    };

    // Calculate colors for mock UI
    const mockPalette = useCallback((baseHex, scheme) => {
        try {
            const [r, g, b] = hexToRgbArray(baseHex);
            const [h, s, l] = rgbToHsl(r, g, b);

            let angles = [h];
            if (scheme === 'complementary') angles = [h, (h + 180) % 360];
            else if (scheme === 'analogous') angles = [h, (h + 30) % 360, (h - 30 + 360) % 360];
            else if (scheme === 'triadic') angles = [h, (h + 120) % 360, (h + 240) % 360];
            else if (scheme === 'monochromatic') angles = [h, h, h]; // same hue, we vary lightness below

            return angles.map((ang, i) => {
                let currentL = l;
                let currentS = s;
                if (scheme === 'monochromatic') {
                    if (i === 1) currentL = Math.max(10, l - 30); // darker shade
                    if (i === 2) currentL = Math.min(90, l + 30); // lighter tint
                } else {
                    // Ensure colors are vibrant enough for the mock UI
                    currentS = Math.max(s, 60);
                }
                return hslHex(ang, currentS, currentL);
            });
        } catch {
            return ['#ff0055', '#00ff55', '#ffaa00'];
        }
    }, []);

    const mockColors = useMemo(() => mockPalette(mockBaseHex, mockScheme), [mockBaseHex, mockScheme, mockPalette]);
    const primaryMock = mockColors[0];
    const secondaryMock = mockColors[1] || primaryMock;
    const tertiaryMock = mockColors[2] || primaryMock;

    return (
        <div className="guide-container">
            {/* PART 1: Basics */}
            <div className="guide-part">
                <div className="guide-text">
                    <h3 className="guide-h3">1. The Basics</h3>
                    <p>Color theory starts with the color wheel, a visual representation of colors arranged according to their chromatic relationship.</p>

                    <p style={{ marginBottom: '0.5rem' }}><strong>Select a category below to highlight it on the wheel:</strong></p>
                    <div className="wheel-cat-buttons">
                        <button
                            className={`w-cat-btn ${activeWheelCategory === 'primary' ? 'active' : ''}`}
                            onClick={() => setActiveWheelCategory(activeWheelCategory === 'primary' ? null : 'primary')}
                        >
                            <span className="w-cat-dot" style={{ background: 'linear-gradient(135deg,#FF2D20,#FFD600,#1E4DFF)' }}></span>
                            <span><strong>Primary:</strong> Red, Yellow, Blue</span>
                        </button>

                        <button
                            className={`w-cat-btn ${activeWheelCategory === 'secondary' ? 'active' : ''}`}
                            onClick={() => setActiveWheelCategory(activeWheelCategory === 'secondary' ? null : 'secondary')}
                        >
                            <span className="w-cat-dot" style={{ background: 'linear-gradient(135deg,#FF8A00,#3BAA3F,#7B2CBF)' }}></span>
                            <span><strong>Secondary:</strong> Green, Orange, Purple</span>
                        </button>

                        <button
                            className={`w-cat-btn ${activeWheelCategory === 'tertiary' ? 'active' : ''}`}
                            onClick={() => setActiveWheelCategory(activeWheelCategory === 'tertiary' ? null : 'tertiary')}
                        >
                            <span className="w-cat-dot" style={{ background: 'conic-gradient(from 90deg,#FF5E1F,#FFB300,#9CCC1A,#009688,#4B3FD9,#C2185B,#FF5E1F)' }}></span>
                            <span><strong>Tertiary:</strong> The in-between combinations</span>
                        </button>
                    </div>

                    <div className="slice-desc-box">
                        <strong>Slice Info:</strong> {activeSliceDesc}
                    </div>
                </div>

                <div className="guide-visual">
                    <div className="interactive-wheel-wrap">
                        <svg viewBox="-210 -210 420 420" className="svg-iw">
                            <defs>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            {WHEEL_DATA.map((slice, i) => {
                                const angle = i * 30; // 360 / 12
                                const startAngle = angle - 15;
                                const endAngle = angle + 15;
                                const isDimmed = activeWheelCategory && activeWheelCategory !== slice.cat;

                                return (
                                    <path
                                        key={i}
                                        d={createWedge(startAngle, endAngle, 80, 200)}
                                        fill={slice.color}
                                        className={`svg-wedge ${isDimmed ? 'dimmed' : ''}`}
                                        onClick={() => setActiveSliceDesc(`[${slice.label}] ${slice.desc}`)}
                                        onMouseEnter={() => setActiveSliceDesc(`[${slice.label}] ${slice.desc}`)}
                                    />
                                );
                            })}
                            <circle cx="0" cy="0" r="70" fill="var(--bg)" stroke="var(--b)" strokeWidth="2" />
                            <text x="0" y="5" textAnchor="middle" fill="var(--t2)" fontSize="14px" fontWeight="700" style={{ pointerEvents: 'none' }}>
                                {activeWheelCategory ? activeWheelCategory.toUpperCase() : 'WHEEL'}
                            </text>
                        </svg>
                    </div>
                </div>
            </div>

            <hr className="guide-divider" />

            {/* PART 2: Schemes */}
            <div className="guide-part reverse">
                <div className="guide-text">
                    <h3 className="guide-h3">2. Harmony & Schemes</h3>
                    <p>Using colors together requires balance. A <strong>Color Scheme</strong> is a set of rules for choosing colors that look good together.</p>

                    <p style={{ marginBottom: '0.5rem' }}><strong>Select a scheme below to see how it looks on the wheel:</strong></p>
                    <div className="wheel-cat-buttons">
                        <button
                            className={`w-cat-btn ${activeHarmonyScheme === 'monochromatic' ? 'active' : ''}`}
                            onClick={() => setActiveHarmonyScheme(activeHarmonyScheme === 'monochromatic' ? null : 'monochromatic')}
                            onMouseEnter={() => setActiveHarmonyScheme('monochromatic')}
                            onMouseLeave={() => setActiveHarmonyScheme(null)}
                        >
                            <span className="w-cat-dot mono-dot" style={{ background: '#FF0000', border: '2px solid #fff' }}></span>
                            <span>
                                <strong>Monochromatic:</strong> <br />
                                <small style={{ color: 'var(--t2)', fontSize: '0.85rem' }}>Uses variations in lightness and saturation of a single color. Very cohesive and easy to use.</small>
                            </span>
                        </button>

                        <button
                            className={`w-cat-btn ${activeHarmonyScheme === 'complementary' ? 'active' : ''}`}
                            onClick={() => setActiveHarmonyScheme(activeHarmonyScheme === 'complementary' ? null : 'complementary')}
                            onMouseEnter={() => setActiveHarmonyScheme('complementary')}
                            onMouseLeave={() => setActiveHarmonyScheme(null)}
                        >
                            <span className="w-cat-dot comp-dot" style={{ background: 'linear-gradient(180deg, #FF0000 50%, #00FF00 50%)' }}></span>
                            <span>
                                <strong>Complementary:</strong> <br />
                                <small style={{ color: 'var(--t2)', fontSize: '0.85rem' }}>Colors opposite each other on the wheel. Highly contrasting, creating a vibrant look.</small>
                            </span>
                        </button>

                        <button
                            className={`w-cat-btn ${activeHarmonyScheme === 'analogous' ? 'active' : ''}`}
                            onClick={() => setActiveHarmonyScheme(activeHarmonyScheme === 'analogous' ? null : 'analogous')}
                            onMouseEnter={() => setActiveHarmonyScheme('analogous')}
                            onMouseLeave={() => setActiveHarmonyScheme(null)}
                        >
                            <span className="w-cat-dot ana-dot" style={{ background: 'linear-gradient(90deg, #FF0055, #FF0000, #FF5500)' }}></span>
                            <span>
                                <strong>Analogous:</strong> <br />
                                <small style={{ color: 'var(--t2)', fontSize: '0.85rem' }}>Colors next to each other. Often found in nature, creating a serene and comfortable design.</small>
                            </span>
                        </button>

                        <button
                            className={`w-cat-btn ${activeHarmonyScheme === 'triadic' ? 'active' : ''}`}
                            onClick={() => setActiveHarmonyScheme(activeHarmonyScheme === 'triadic' ? null : 'triadic')}
                            onMouseEnter={() => setActiveHarmonyScheme('triadic')}
                            onMouseLeave={() => setActiveHarmonyScheme(null)}
                        >
                            <span className="w-cat-dot tri-dot" style={{ background: 'conic-gradient(from 0deg, #FF0000 33%, #0000FF 33% 66%, #FFFF00 66%)' }}></span>
                            <span>
                                <strong>Triadic:</strong> <br />
                                <small style={{ color: 'var(--t2)', fontSize: '0.85rem' }}>Three colors evenly spaced. Offers strong visual contrast while retaining balance.</small>
                            </span>
                        </button>
                    </div>
                </div>

                <div className="guide-visual">
                    <div className="interactive-wheel-wrap">
                        <svg viewBox="-210 -210 420 420" className="svg-iw">
                            <defs>
                                <filter id="glow2">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            {WHEEL_DATA.map((slice, i) => {
                                const angle = i * 30; // 360 / 12
                                const startAngle = angle - 15;
                                const endAngle = angle + 15;

                                // Logic for checking if this slice is active in the selected harmony scheme
                                // We anchor the demonstration around Red (Index 0)
                                let isActiveInScheme = false;
                                if (!activeHarmonyScheme) {
                                    isActiveInScheme = true; // All lit up if nothing selected
                                } else if (activeHarmonyScheme === 'monochromatic') {
                                    isActiveInScheme = i === 0;
                                } else if (activeHarmonyScheme === 'complementary') {
                                    isActiveInScheme = i === 0 || i === 6;
                                } else if (activeHarmonyScheme === 'analogous') {
                                    isActiveInScheme = i === 11 || i === 0 || i === 1;
                                } else if (activeHarmonyScheme === 'triadic') {
                                    isActiveInScheme = i === 0 || i === 4 || i === 8;
                                }

                                const isDimmed = !isActiveInScheme;

                                return (
                                    <path
                                        key={`scheme-w-${i}`}
                                        d={createWedge(startAngle, endAngle, 80, 200)}
                                        fill={slice.color}
                                        className={`svg-wedge ${isDimmed ? 'dimmed' : ''}`}
                                        style={{ pointerEvents: 'none' }} /* View only */
                                    />
                                );
                            })}

                            {/* Overlay Lines to physically draw the connections */}
                            {activeHarmonyScheme === 'complementary' && (
                                <line x1="0" y1="-80" x2="0" y2="80" stroke="#fff" strokeWidth="3" strokeDasharray="6,4" opacity="0.8" />
                            )}
                            {activeHarmonyScheme === 'analogous' && (
                                <path d="M -30 -75 Q 0 -90 30 -75" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="6,4" opacity="0.8" />
                            )}
                            {activeHarmonyScheme === 'triadic' && (
                                <polygon points="0,-80 69,40 -69,40" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="6,4" opacity="0.8" />
                            )}

                            <circle cx="0" cy="0" r="70" fill="var(--bg)" stroke="var(--b)" strokeWidth="2" />
                            <text x="0" y="5" textAnchor="middle" fill="var(--t2)" fontSize="14px" fontWeight="700" style={{ pointerEvents: 'none' }}>
                                {activeHarmonyScheme ? activeHarmonyScheme.toUpperCase() : 'SCHEMES'}
                            </text>
                        </svg>
                    </div>
                </div>
            </div>

            <hr className="guide-divider" />

            {/* PART 3: Identifier / Application */}
            <div className="guide-part flex-col">
                <div className="guide-text" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h3 className="guide-h3">3. Put it into Practice</h3>
                    <p>See how different color schemes affect a real user interface. Change the base color and the scheme type below to see the mock-UI update instantly.</p>
                </div>

                <div className="mock-ui-container">
                    <div className="mock-controls">
                        <div className="ctrl-row">
                            <div className="ctrl-label">Base Color <code>{mockBaseHex}</code></div>
                            <input
                                type="color"
                                value={mockBaseHex}
                                className="picker-large"
                                onChange={(e) => setMockBaseHex(e.target.value)}
                            />
                        </div>

                        <div className="section-title" style={{ marginTop: '1.5rem' }}>Select Scheme</div>
                        <div className="sch-btns" style={{ gap: '0.5rem', marginTop: '0.5rem' }}>
                            {['monochromatic', 'complementary', 'analogous', 'triadic'].map(s => (
                                <button
                                    key={s}
                                    className={`sch-btn ${mockScheme === s ? 'active' : ''}`}
                                    onClick={() => setMockScheme(s)}
                                    style={{ padding: '0.5rem 1rem' }}
                                >
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                            ))}
                        </div>

                        <div className="scheme-palette-disp" style={{ marginTop: '2rem' }}>
                            <div className="section-title">Resulting Palette</div>
                            <div className="pstrip" style={{ height: '50px' }}>
                                {mockColors.map((c, i) => (
                                    <div key={i} className="pc" style={{ background: c }} onClick={() => onCopy(c)}>
                                        <div className="ph">{c}</div>
                                    </div>
                                ))}
                            </div>
                            <p style={{ fontSize: '0.7rem', color: 'var(--t2)', marginTop: '0.5rem' }}>Click a color to copy its Hex code.</p>
                        </div>
                    </div>

                    <div className="mock-preview-area" style={{ background: `linear-gradient(135deg, #111, #1a1a2e)` }}>
                        {/* The Mock App Context */}
                        <div className="mock-app-window">
                            <div className="mock-header" style={{ background: tertiaryMock }}>
                                <div className="mock-logo" style={{ color: '#fff' }}>Brand</div>
                                <div className="mock-nav">
                                    <span style={{ background: 'rgba(255,255,255,0.2)' }}></span>
                                    <span style={{ background: 'rgba(255,255,255,0.2)' }}></span>
                                </div>
                            </div>
                            <div className="mock-body">
                                <div className="mock-hero-text" style={{ color: primaryMock }}>
                                    Stand out with color.
                                </div>
                                <div className="mock-sub-text">
                                    This is a mock application demonstrating the selected {mockScheme} harmony.
                                </div>

                                <button className="mock-btn" style={{ background: secondaryMock, color: '#000' }}>
                                    Get Started
                                </button>

                                <div className="mock-cards">
                                    <div className="mock-card" style={{ borderTop: `4px solid ${primaryMock}` }}>
                                        <div className="mc-icon" style={{ background: primaryMock }}></div>
                                        <div className="mc-lines">
                                            <span></span><span></span>
                                        </div>
                                    </div>
                                    <div className="mock-card" style={{ borderTop: `4px solid ${secondaryMock}` }}>
                                        <div className="mc-icon" style={{ background: secondaryMock }}></div>
                                        <div className="mc-lines">
                                            <span></span><span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
