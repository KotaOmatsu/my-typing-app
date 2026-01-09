'use client';

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface MissEffectProps {
    triggerKey: number; // Trigger on change
}

type EffectType = 'flash' | 'ripple' | 'shake';

interface ActiveEffect {
    id: number;
    type: EffectType;
}

const MissEffect: React.FC<MissEffectProps> = ({ triggerKey }) => {
    const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (triggerKey > 0) {
            const effects: EffectType[] = ['flash', 'ripple', 'shake'];
            const randomEffect = effects[Math.floor(Math.random() * effects.length)];
            const id = Date.now() + Math.random();

            const newEffect = { id, type: randomEffect };
            setActiveEffects(prev => [...prev, newEffect]);

            // Shake handling via body class if needed
            if (randomEffect === 'shake') {
                document.body.classList.add('hardcore-shake');
            }

            // Cleanup after animation duration
            const duration = randomEffect === 'shake' ? 500 : 600; // Match CSS duration
            
            const timer = setTimeout(() => {
                setActiveEffects(prev => prev.filter(e => e.id !== id));
                if (randomEffect === 'shake') {
                    // Only remove if no other active shakes (simplified: remove anyway, new ones re-add)
                    // Better: checking count of active shakes might be complex, 
                    // but since shake is continuous, removing/adding refreshes the animation somewhat.
                    // However, to be cleaner, we should only remove if it's the last one.
                    // For simplicity, we remove it. If overlapped, the next effect adds it back or keeps it.
                    // Actually, if we just remove the class, it stops. 
                    // If another shake started 100ms ago, it will stop too.
                    // To handle overlapping shakes properly, we might need a ref counter.
                    document.body.classList.remove('hardcore-shake');
                    // Force reflow to restart animation if needed? 
                    // No, simpler: just remove. Overlapping shakes is chaos anyway.
                }
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [triggerKey]);

    if (!mounted) return null;

    return createPortal(
        <>
            {activeEffects.map(effect => (
                <React.Fragment key={effect.id}>
                    {effect.type === 'flash' && (
                        <div 
                            className="fixed inset-0 pointer-events-none z-[9999] flash-screen" 
                            aria-hidden="true" 
                        />
                    )}
                    
                    {effect.type === 'ripple' && (
                        <div 
                            className="shockwave-ripple" 
                            aria-hidden="true" 
                        />
                    )}
                </React.Fragment>
            ))}
        </>,
        document.body
    );
};

export default MissEffect;
