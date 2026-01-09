'use client';

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface MissEffectProps {
    triggerKey: number; // Trigger on change
}

interface ActiveEffect {
    id: number;
    type: 'flash';
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
            // 1. Add Flash Effect (Stackable)
            const id = Date.now() + Math.random();
            setActiveEffects(prev => [...prev, { id, type: 'flash' }]);

            // Remove flash after duration
            setTimeout(() => {
                setActiveEffects(prev => prev.filter(e => e.id !== id));
            }, 400); // Match CSS flash duration

            // 2. Trigger Shake Effect (Restartable)
            // To restart a CSS animation, we must remove the class, force reflow, and add it back.
            document.body.classList.remove('hardcore-shake');
            
            // Force reflow
            void document.body.offsetWidth;
            
            document.body.classList.add('hardcore-shake');

            // We don't necessarily need to remove the class after 500ms if another miss comes in.
            // But we should clean up if no misses happen for a while.
            // Since we re-add it on every miss, we can just set a timeout to remove it, 
            // but we need to be careful not to remove it if a NEW miss just happened.
            // Actually, simpler: let it run. If user stops missing, it will finish its iteration (0.5s) and stop visually.
            // But the class will remain. It's better to clean it up.
            // We can use a ref or just a timeout that we don't clear? 
            // If we remove the class mid-animation of a SUBSEQUENT miss, it looks bad.
            // So we strictly restart on trigger. 
            // Cleanup is only needed when unmounting or if we want to be clean.
            // Let's rely on the animation ending visually. 
            // But if we want to support "shake ending", we should remove class.
            
            // For simplicity and robustness against rapid fire: 
            // We rely on the "remove, reflow, add" sequence above to restart it.
            // We can leave the class on `body` and just remove it on unmount. 
            // OR set a timeout to remove it, but check if we are still "shaking"?
            // Let's just set a timeout. If it removes the class while another shake is pending? 
            // No, because the NEXT trigger will add it back immediately.
            // The only risk is if the timeout from Miss A fires *during* Miss B's animation.
            // To fix this, we can track the "last shake time".
        }
    }, [triggerKey]);

    // Cleanup shake on unmount
    useEffect(() => {
        return () => {
            document.body.classList.remove('hardcore-shake');
        };
    }, []);

    if (!mounted) return null;

    return createPortal(
        <>
            {activeEffects.map(effect => (
                <div 
                    key={effect.id}
                    className="fixed inset-0 pointer-events-none z-[9999] flash-screen" 
                    aria-hidden="true" 
                />
            ))}
        </>,
        document.body
    );
};

export default MissEffect;