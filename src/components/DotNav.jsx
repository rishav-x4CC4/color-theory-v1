import { useState, useEffect } from 'react';

const SECTIONS = [
    { id: 'wheel', label: 'Color Wheel' },
    { id: 'schemes', label: 'Color Schemes' },
    { id: 'rgb', label: 'RGB Model' },
    { id: 'mixing', label: 'Additive vs Subtractive' },
];

export default function DotNav() {
    const [active, setActive] = useState(0);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const idx = SECTIONS.findIndex((s) => s.id === entry.target.id);
                        if (idx >= 0) setActive(idx);
                    }
                });
            },
            { threshold: 0.4 }
        );

        SECTIONS.forEach((s) => {
            const el = document.getElementById(s.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <nav className="dot-nav" aria-label="Section navigation">
            {SECTIONS.map((s, i) => (
                <button
                    key={s.id}
                    className={`dot-nav-item ${i === active ? 'active' : ''}`}
                    onClick={() => scrollTo(s.id)}
                    aria-label={s.label}
                >
                    <span className="tooltip">{s.label}</span>
                </button>
            ))}
        </nav>
    );
}
