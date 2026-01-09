'use client';

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface MissEffectProps {
    trigger: boolean;
}

type EffectType = 'flash' | 'ripple' | 'shake' | null;

const MissEffect: React.FC<MissEffectProps> = ({ trigger }) => {
    const [activeEffect, setActiveEffect] = useState<EffectType>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (trigger) {
            const effects: EffectType[] = ['flash', 'ripple', 'shake'];
            const randomEffect = effects[Math.floor(Math.random() * effects.length)];
            setActiveEffect(randomEffect);

            const timer = setTimeout(() => {
                setActiveEffect(null);
            }, 600); 

            return () => clearTimeout(timer);
        }
    }, [trigger]);

    // Handle Shake Effect globally on body
    useEffect(() => {
        if (activeEffect === 'shake') {
            document.body.classList.add('hardcore-shake');
        } else {
            document.body.classList.remove('hardcore-shake');
        }

        return () => {
            document.body.classList.remove('hardcore-shake');
        };
    }, [activeEffect]);

    if (!activeEffect || !mounted) return null;

    // Use Portal to ensure effects are top-level and not constrained by parent styles
    return createPortal(
        <>
            {activeEffect === 'flash' && (
                <div className="fixed inset-0 pointer-events-none z-[9999] flash-screen" aria-hidden="true" />
            )}
            
            {activeEffect === 'ripple' && (
                <div className="shockwave-ripple" aria-hidden="true" />
            )}
        </>,
        document.body
    );
};

export default MissEffect;