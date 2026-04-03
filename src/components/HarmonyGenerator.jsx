import { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { generateScheme, hexToRgb } from '../utils/colorUtils';

/* ── Floating Orb ── */
function FloatingOrb({ hex, index, total }) {
    const meshRef = useRef();
    const rgb = hexToRgb(hex);
    const offset = (index / total) * Math.PI * 2;

    useFrame((state) => {
        if (meshRef.current) {
            const t = state.clock.elapsedTime;
            meshRef.current.position.x = Math.cos(offset + t * 0.4) * 2.2;
            meshRef.current.position.y = Math.sin(offset + t * 0.3) * 1.2 + Math.sin(t * 0.7 + index) * 0.3;
            meshRef.current.position.z = Math.sin(offset + t * 0.4) * 0.8;
            meshRef.current.material.color.setRGB(rgb.r / 255, rgb.g / 255, rgb.b / 255);
            meshRef.current.material.emissive.setRGB(rgb.r / 510, rgb.g / 510, rgb.b / 510);
        }
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[0.4, 32, 32]} />
            <meshStandardMaterial
                roughness={0.25}
                metalness={0.5}
            />
        </mesh>
    );
}

const SCHEME_OPTIONS = [
    { value: 'analogous', label: 'Analogous' },
    { value: 'complementary', label: 'Complementary' },
    { value: 'triadic', label: 'Triadic' },
    { value: 'split-complementary', label: 'Split-Complementary' },
    { value: 'tetradic', label: 'Tetradic' },
    { value: 'monochromatic', label: 'Monochromatic' },
];

const SCHEME_LABELS = {
    analogous: ['−30°', '−15°', 'Base', '+15°', '+30°'],
    complementary: ['Base', 'Complement', 'Light Base', 'Light Comp', 'Lightest'],
    triadic: ['Base', '+120°', '+240°', 'Light 1', 'Light 2'],
    'split-complementary': ['Base', '+150°', '+210°', 'Light Base', 'Light Comp'],
    tetradic: ['Base', '+90°', '+180°', '+270°', 'Light Base'],
    monochromatic: ['Dark', 'Medium', 'Base', 'Light', 'Lightest'],
};

export default function HarmonyGenerator({ onCopy }) {
    const [baseColor, setBaseColor] = useState('#6366f1');
    const [hexInput, setHexInput] = useState('#6366f1');
    const [schemeType, setSchemeType] = useState('analogous');

    const handleReset = () => {
        setBaseColor('#6366f1');
        setHexInput('#6366f1');
        setSchemeType('analogous');
    };

    const palette = useMemo(
        () => generateScheme(baseColor, schemeType),
        [baseColor, schemeType]
    );

    const labels = SCHEME_LABELS[schemeType] || [];

    const handleColorPicker = (val) => {
        setBaseColor(val);
        setHexInput(val);
    };

    const handleHexInput = (val) => {
        setHexInput(val);
        if (/^#[0-9a-fA-F]{6}$/.test(val)) {
            setBaseColor(val);
        }
    };

    return (
        <section id="harmony-gen" className="section">
            <div className="section-inner">
                <div className="section-number">04</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem', marginTop: '1rem' }}>
                    <h2 className="section-title" style={{ marginBottom: 0 }}>Harmony Generator</h2>
                    <button className="sch-btn" onClick={handleReset} style={{ padding: '4px 12px', fontSize: '0.85rem' }}>Reset</button>
                </div>
                <p className="section-subtitle">
                    Pick a base color, type a HEX code, and choose a scheme type to
                    instantly generate a harmonious palette. Click any swatch to copy.
                </p>

                <div className="harmony-layout">
                    {/* Controls */}
                    <div className="harmony-controls">
                        <div className="harmony-control-group">
                            <label className="harmony-label">Base Color</label>
                            <input
                                type="color"
                                className="harmony-color-input"
                                value={baseColor}
                                onChange={(e) => handleColorPicker(e.target.value)}
                            />
                        </div>
                        <div className="harmony-control-group">
                            <label className="harmony-label">HEX Code</label>
                            <input
                                type="text"
                                className="wheel-text-input"
                                value={hexInput}
                                onChange={(e) => handleHexInput(e.target.value)}
                                placeholder="#6366f1"
                                maxLength={7}
                            />
                        </div>
                        <div className="harmony-control-group">
                            <label className="harmony-label">Scheme</label>
                            <select
                                className="harmony-select"
                                value={schemeType}
                                onChange={(e) => setSchemeType(e.target.value)}
                            >
                                {SCHEME_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Palette Output */}
                    <div className="harmony-palette-output">
                        {palette.map((hex, i) => (
                            <div
                                key={i}
                                className="harmony-swatch-card"
                                onClick={() => onCopy(hex)}
                            >
                                <div
                                    className="harmony-swatch-color"
                                    style={{ background: hex }}
                                />
                                <div className="harmony-swatch-info">
                                    <div className="harmony-swatch-hex">{hex.toUpperCase()}</div>
                                    <div className="harmony-swatch-label">{labels[i] || ''}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 3D Floating Orbs */}
                    <div className="harmony-3d-container">
                        <Canvas
                            camera={{ position: [0, 0, 6], fov: 45 }}
                            style={{ background: 'transparent' }}
                        >
                            <ambientLight intensity={0.4} />
                            <pointLight position={[5, 5, 5]} intensity={1} />
                            <pointLight position={[-5, -3, 3]} intensity={0.5} color="#a855f7" />
                            {palette.map((hex, i) => (
                                <FloatingOrb key={i} hex={hex} index={i} total={palette.length} />
                            ))}
                        </Canvas>
                    </div>
                </div>
            </div>
        </section>
    );
}
