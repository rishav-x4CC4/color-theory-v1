import { useEffect, useRef } from 'react';

export default function useIntersectionObserver(options = { threshold: 0.1 }) {
    const elementRef = useRef(null);
    // Stabilise the options reference so it never triggers the effect unnecessarily.
    const optionsRef = useRef(options);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                if (elementRef.current) {
                    elementRef.current.classList.add('visible');
                    observer.unobserve(elementRef.current);
                }
            }
        }, optionsRef.current);

        const observedElement = elementRef.current;
        if (observedElement) {
            observer.observe(observedElement);
        }

        return () => {
            if (observedElement) {
                observer.unobserve(observedElement);
            }
        };
    }, []); // empty deps — options is read from a stable ref

    return elementRef;
}
