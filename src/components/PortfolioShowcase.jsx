import React from 'react';
import './ColorTheory.css';
import useIntersectionObserver from '../hooks/useIntersectionObserver';

const paletteColors = [
    {
        name: 'Deep Violet', hex: '#7C3AFF', rgb: '124, 58, 255',
        role: 'Primary Color', scheme: 'Near-Triadic Anchor (~260°)',
        uses: 'Loader progress bar · scrollbar thumb · marquee top border · nav logo conic gradient · "About" nav active pill · Skills "Tools" heading outline stroke · Color Theory "Applied" heading outline stroke · experience timeline line gradient · About & Skills eyebrow labels · Languages group skill bars (C++, Python, JavaScript, TypeScript, Java, C#) · hero badge pill background · primary hover accents'
    },
    {
        name: 'Electric Cyan', hex: '#00E5FF', rgb: '0, 229, 255',
        role: 'Secondary Color', scheme: 'Analogous Accent (~186°)',
        uses: 'Loader bar fill · loader logo second letter · scrollbar gradient · Skills nav active pill gradient · marquee bottom border · terminal JSON key text · contact form input focus border · send button gradient (with Violet) · footer link hover · "Projects shipped" stat number · Frontend group skill bars (React, Tailwind, HTML/CSS, TypeScript) · contact "something" heading text & eyebrow label · footer logo dot pulse · React orbit chip icon'
    },
    {
        name: 'Neon Mint', hex: '#00D68F', rgb: '0, 214, 143',
        role: 'Triadic Color', scheme: 'Near-Triadic Anchor (~160°)',
        uses: '"Open to work" navbar badge dot · page progress bar gradient · experience timeline line gradient · PassVault & ColorLab "Live" project status dot · form success button gradient (with Acid Green) · Node.js & MongoDB marquee item colors · hero quick-highlight typewriter text · About terminal success output line'
    },
    {
        name: 'Hot Pink', hex: '#FF3CAC', rgb: '255, 60, 172',
        role: 'Accent / Complementary', scheme: 'Warm Accent (~326°, near complement to Mint)',
        uses: 'Nav logo conic gradient · page progress bar · "Projects" nav active pill · "Experience" nav active pill gradient (with Coral) · Tools & Design group skill bars (Git, Figma, Blender, Unreal Engine) · Figma marquee item color · hero tagline three-stop gradient (Mint -> Pink -> Violet) · color theory section heading gradient text'
    },
    {
        name: 'Vivid Yellow', hex: '#FFD600', rgb: '255, 214, 0',
        role: 'Triadic Color', scheme: 'Near-Triadic Anchor (~50°)',
        uses: 'Terminal middle window dot · rainbow footer line · "Cybersec Learner" About chip · Blender marquee item color · Hire Me button star icon'
    },
    {
        name: 'Ocean Blue', hex: '#00B4D8', rgb: '0, 180, 216',
        role: 'Analogous Color', scheme: 'Analogous to Cyan (~190°)',
        uses: 'Skills nav active pill gradient (with Cyan) · Contact nav active pill gradient (with Mint) · React orbit chip text label · "Dehradun, India" About location chip · Swiftze UI & Modern To-Do project status badge color · TypeScript marquee item color · LinkedIn contact icon color'
    },
    {
        name: 'Acid Green', hex: '#A8FF3E', rgb: '168, 255, 62',
        role: 'Analogous Color', scheme: 'Analogous to Mint (90°)',
        uses: 'Terminal string value text (.t-str) · rainbow footer line segment · Python & Tailwind marquee item colors · contact form success button gradient (with Mint)'
    },
    {
        name: 'Coral', hex: '#FF6B6B', rgb: '255, 107, 107',
        role: 'Warm Accent', scheme: 'Warm Accent (~0°)',
        uses: 'Terminal red close-window dot · "Experience" nav active pill gradient (with Pink) · Java & Git marquee item colors · particle canvas color pool'
    },
];

export default function PortfolioShowcase() {
    const headRef = useIntersectionObserver();
    const wheelRef = useIntersectionObserver();
    const sheetRef = useIntersectionObserver();
    const tableRef = useIntersectionObserver();
    const rgbRef = useIntersectionObserver();

    return (
        <section id="colortheory">
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(124,58,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,255,.04) 1px,transparent 1px)', backgroundSize: '48px 48px' }}></div>
            <div style={{ maxWidth: 'var(--section-max-width)', margin: '0 auto', position: 'relative', zIndex: 1 }}>

                <div className="reveal" ref={headRef} style={{ textAlign: 'center', marginBottom: '72px' }}>
                    <div className="ct-eyebrow">CSGG2012P &middot; Part B Evidence</div>
                    <h2 className="ct-h2">Color Theory<br /><span className="ct-h2-stroke">Applied</span> in this <span className="ct-h2-gradient">Portfolio</span></h2>
                    <p className="ct-p">This portfolio uses a <strong>Near-Triadic + Analogous hybrid</strong> scheme: Violet (#7C3AFF, ~260°), Mint (#00D68F, ~160°), and Yellow (#FFD600, ~50°) as the three main anchors, extended by analogous blues Cyan (#00E5FF, ~186°) and Ocean (#00B4D8, ~190°), with Hot Pink (#FF3CAC, ~326°) as a high-contrast warm accent. The same token set is applied across both light surfaces (icy #F8FAFF) and dark-theme sections.</p>
                </div>

                <div className="ct-grid-wheel reveal" ref={wheelRef}>
                    <div>
                        <div className="ct-grid-eyebrow">Selected Scheme</div>
                        <h3 className="ct-h3">Near-Triadic + Analogous <span style={{ color: 'var(--c2)' }}>Hybrid</span></h3>
                        <p className="ct-desc">The core anchors are <strong style={{ color: 'var(--c2)' }}>Violet (#7C3AFF, ~260°)</strong>, <strong style={{ color: 'var(--c3)' }}>Mint (#00D68F, ~160°)</strong>, and <strong style={{ color: 'var(--c5)' }}>Yellow (#FFD600, ~50°)</strong>. They are intentionally <strong>near-triadic</strong> (not mathematically perfect 120° spacing), then supported with analogous blues: <strong style={{ color: 'var(--c1)' }}>Cyan (#00E5FF, ~186°)</strong> and <strong style={{ color: 'var(--c6)' }}>Ocean (#00B4D8, ~190°)</strong>. <strong style={{ color: 'var(--c4)' }}>Hot Pink (#FF3CAC, ~326°)</strong> adds contrast and sits near the opposite side of Mint (~340°) on the wheel.</p>

                        <div className="ct-swatch-grid">
                            <div className="ct-swatch" style={{ background: 'rgba(124,58,255,.07)', borderColor: 'rgba(124,58,255,.2)' }}>
                                <span className="ct-swatch-color" style={{ background: 'var(--c2)', boxShadow: '0 2px 8px rgba(124,58,255,.4)' }}></span>
                                <div><div className="ct-swatch-type" style={{ color: 'var(--c2)' }}>PRIMARY</div><div className="ct-swatch-name">Deep Violet &middot; #7C3AFF</div></div>
                            </div>
                            <div className="ct-swatch" style={{ background: 'rgba(0,229,255,.07)', borderColor: 'rgba(0,229,255,.2)' }}>
                                <span className="ct-swatch-color" style={{ background: 'var(--c1)', boxShadow: '0 2px 8px rgba(0,229,255,.4)' }}></span>
                                <div><div className="ct-swatch-type" style={{ color: 'var(--c1)' }}>SECONDARY</div><div className="ct-swatch-name">Electric Cyan &middot; #00E5FF</div></div>
                            </div>
                            <div className="ct-swatch" style={{ background: 'rgba(255,60,172,.07)', borderColor: 'rgba(255,60,172,.2)' }}>
                                <span className="ct-swatch-color" style={{ background: 'var(--c4)', boxShadow: '0 2px 8px rgba(255,60,172,.4)' }}></span>
                                <div><div className="ct-swatch-type" style={{ color: 'var(--c4)' }}>ACCENT</div><div className="ct-swatch-name">Hot Pink &middot; #FF3CAC</div></div>
                            </div>
                            <div className="ct-swatch" style={{ background: 'rgba(10,10,26,.04)', borderColor: 'rgba(10,10,26,.12)' }}>
                                <span className="ct-swatch-color" style={{ background: '#F8FAFF', border: '1.5px solid #D4DBFF', width: '11px', height: '11px' }}></span>
                                <div><div className="ct-swatch-type" style={{ color: 'var(--muted)' }}>BACKGROUND</div><div className="ct-swatch-name">Icy Snow &middot; #F8FAFF</div></div>
                            </div>
                        </div>
                    </div>

                    <div className="ct-wheel-wrap">
                        <svg width="210" height="210" viewBox="0 0 210 210">
                            <defs>
                                <filter id="cglow">
                                    <feGaussianBlur stdDeviation="3" result="b" />
                                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                                </filter>
                            </defs>
                            <circle cx="105" cy="105" r="88" fill="none" stroke="#7C3AFF" strokeWidth="22" strokeDasharray="46 506" strokeDashoffset="0" />
                            <circle cx="105" cy="105" r="88" fill="none" stroke="#5500DD" strokeWidth="22" strokeDasharray="46 506" strokeDashoffset="-46" />
                            <circle cx="105" cy="105" r="88" fill="none" stroke="#00B4D8" strokeWidth="22" strokeDasharray="46 506" strokeDashoffset="-92" />
                            <circle cx="105" cy="105" r="88" fill="none" stroke="#00E5FF" strokeWidth="22" strokeDasharray="46 506" strokeDashoffset="-138" />
                            <circle cx="105" cy="105" r="88" fill="none" stroke="#00D68F" strokeWidth="22" strokeDasharray="46 506" strokeDashoffset="-184" />
                            <circle cx="105" cy="105" r="88" fill="none" stroke="#A8FF3E" strokeWidth="22" strokeDasharray="46 506" strokeDashoffset="-230" />
                            <circle cx="105" cy="105" r="88" fill="none" stroke="#FFD600" strokeWidth="22" strokeDasharray="46 506" strokeDashoffset="-276" />
                            <circle cx="105" cy="105" r="88" fill="none" stroke="#FF8C00" strokeWidth="22" strokeDasharray="46 506" strokeDashoffset="-322" />
                            <circle cx="105" cy="105" r="88" fill="none" stroke="#FF3CAC" strokeWidth="22" strokeDasharray="46 506" strokeDashoffset="-368" />
                            <circle cx="105" cy="105" r="88" fill="none" stroke="#CC0066" strokeWidth="22" strokeDasharray="46 506" strokeDashoffset="-414" />
                            <circle cx="105" cy="105" r="54" fill="white" stroke="#EEF2FF" strokeWidth="2" />
                            <text x="105" y="100" textAnchor="middle" fontFamily="Cabinet Grotesk,sans-serif" fontWeight="900" fontSize="11" fill="#0A0A1A">TRIADIC</text>
                            <text x="105" y="116" textAnchor="middle" fontFamily="Cabinet Grotesk,sans-serif" fontWeight="700" fontSize="9" fill="#5B6B8A">+ ANALOGOUS</text>
                            <polygon points="105,19 187,149 23,149" fill="none" stroke="#7C3AFF" strokeWidth="1.5" strokeDasharray="5,4" opacity=".55" />
                            <circle cx="105" cy="19" r="9" fill="#7C3AFF" filter="url(#cglow)" />
                            <circle cx="185" cy="148" r="9" fill="#00D68F" filter="url(#cglow)" />
                            <circle cx="25" cy="148" r="9" fill="#FFD600" filter="url(#cglow)" />
                            <circle cx="164" cy="38" r="6" fill="#FF3CAC" filter="url(#cglow)" />
                            <circle cx="46" cy="38" r="6" fill="#00E5FF" filter="url(#cglow)" />
                        </svg>
                        <div className="ct-legend">
                            <span style={{ color: 'var(--c2)' }}>&#9679;</span> Violet &nbsp;<span style={{ color: 'var(--c3)' }}>&#9679;</span> Mint &nbsp;<span style={{ color: 'var(--c5)' }}>&#9679;</span> Yellow = Triad<br />
                            <span style={{ color: 'var(--c1)' }}>&#9679;</span> Cyan = Analogous &nbsp;<span style={{ color: 'var(--c4)' }}>&#9679;</span> Pink = Accent
                        </div>
                    </div>
                </div>

                <div className="reveal" ref={sheetRef} style={{ marginBottom: '40px' }}>
                    <div className="ct-section-title" style={{ color: 'var(--c3)' }}>Color Palette Sheet &mdash; HEX &amp; RGB Values</div>
                    <div className="ct-palette-grid">
                        {paletteColors.map((c, i) => (
                            <div key={i} className="ct-palette-card">
                                <div className="ct-pc-top" style={{ background: c.hex }}>
                                    <div className="ct-pc-hex">{c.hex}</div>
                                </div>
                                <div className="ct-pc-body">
                                    <div className="ct-pc-name">{c.name}</div>
                                    <div className="ct-pc-rgb">RGB({c.rgb})</div>
                                    <div className="ct-pc-tags">
                                        <span className="ct-pc-tag primary" style={{ background: `${c.hex}18`, color: c.hex, borderColor: `${c.hex}44` }}>{c.role}</span>
                                        <span className="ct-pc-tag secondary">{c.scheme}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="reveal" ref={tableRef} style={{ marginBottom: '40px' }}>
                    <div className="ct-section-title" style={{ color: 'var(--c4)' }}>Color Application &mdash; Where Each Color Is Used</div>
                    <div className="ct-table-wrap">
                        <table className="ct-table">
                            <thead>
                                <tr>
                                    <th>Swatch</th>
                                    <th>Color Name</th>
                                    <th>HEX</th>
                                    <th>RGB</th>
                                    <th>Role</th>
                                    <th>Applied To in Portfolio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paletteColors.map((c, i) => (
                                    <tr key={i}>
                                        <td>
                                            <div className="ct-td-swatch" style={{ background: c.hex, boxShadow: `0 4px 12px ${c.hex}55` }}></div>
                                        </td>
                                        <td style={{ fontWeight: 800, color: 'var(--ink)' }}>{c.name}</td>
                                        <td className="ct-td-code" style={{ color: c.hex }}>{c.hex}</td>
                                        <td className="ct-td-code" style={{ color: 'var(--muted)', fontSize: '11px' }}>rgb({c.rgb})</td>
                                        <td>
                                            <span className="ct-td-role" style={{ background: `${c.hex}18`, color: c.hex, borderColor: `${c.hex}44` }}>{c.role}</span>
                                        </td>
                                        <td style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>{c.uses}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="reveal ct-rgb-box" ref={rgbRef}>
                    <div>
                        <div className="ct-section-title" style={{ color: 'var(--c2)', marginBottom: '12px' }}>RGB Additive Color Model</div>
                        <h3 className="ct-h3" style={{ marginBottom: '14px' }}>All colors defined<br />using <span style={{ color: 'var(--c2)' }}>RGB model</span></h3>
                        <p className="ct-desc" style={{ marginBottom: '16px' }}>Every color in this portfolio uses <strong>Hexadecimal RGB</strong> — the additive model used in digital displays. Three channels (Red, Green, Blue) each range 0&ndash;255 and mix to create all visible colors.</p>
                        <div className="ct-rgb-code-list">
                            <div className="ct-rgb-code"><span style={{ color: 'var(--c2)' }}>#7C3AFF</span> = <span style={{ color: '#FF4444' }}>R(124)</span> <span style={{ color: '#00CC44' }}>G(58)</span> <span style={{ color: '#3366FF' }}>B(255)</span> &rarr; Deep Violet</div>
                            <div className="ct-rgb-code"><span style={{ color: 'var(--c1)' }}>#00E5FF</span> = <span style={{ color: '#FF4444' }}>R(0)</span> <span style={{ color: '#00CC44' }}>G(229)</span> <span style={{ color: '#3366FF' }}>B(255)</span> &rarr; Electric Cyan</div>
                            <div className="ct-rgb-code"><span style={{ color: 'var(--c4)' }}>#FF3CAC</span> = <span style={{ color: '#FF4444' }}>R(255)</span> <span style={{ color: '#00CC44' }}>G(60)</span> <span style={{ color: '#3366FF' }}>B(172)</span> &rarr; Hot Pink</div>
                        </div>
                    </div>
                    <div className="ct-rgb-visuals">
                        <div className="ct-rgb-channels">
                            <div className="ct-channel r">
                                <div className="ct-ch-letter">R</div>
                                <div className="ct-ch-label">Red<br />0&ndash;255</div>
                            </div>
                            <div className="ct-channel g">
                                <div className="ct-ch-letter">G</div>
                                <div className="ct-ch-label">Green<br />0&ndash;255</div>
                            </div>
                            <div className="ct-channel b">
                                <div className="ct-ch-letter">B</div>
                                <div className="ct-ch-label">Blue<br />0&ndash;255</div>
                            </div>
                        </div>
                        <div className="ct-rgb-gradient-bar"></div>
                        <div className="ct-rgb-caption">Additive mixing &rarr; White at full intensity (255,255,255)</div>
                    </div>
                </div>

                <div className="portfolio-redirect reveal" style={{ marginTop: '60px', marginBottom: '30px', textAlign: 'center' }}>
                    <a href="https://portfolio-v1-mu-ten.vercel.app/" target="_blank" rel="noopener noreferrer"
                        style={{
                            display: 'inline-block',
                            background: 'var(--c2)',
                            color: 'white',
                            padding: '16px 36px',
                            borderRadius: '50px',
                            textDecoration: 'none',
                            fontWeight: '800',
                            fontSize: '16px',
                            letterSpacing: '0.05em',
                            boxShadow: '0 10px 24px rgba(124, 58, 255, 0.25)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 16px 36px rgba(124, 58, 255, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 24px rgba(124, 58, 255, 0.25)';
                        }}
                    >
                        🚀 View Live Portfolio
                    </a>
                    <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--muted)', fontWeight: '600' }}>Click to see these color theory principles applied in a live environment.</p>
                </div>

            </div>
        </section>
    );
}
