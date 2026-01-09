import React, { useEffect, useState } from "react";

interface MissEffectProps {
    trigger: boolean;
}

type EffectType = 'flash' | 'ripple' | 'shake' | null;

const MissEffect: React.FC<MissEffectProps> = ({ trigger }) => {
    const [activeEffect, setActiveEffect] = useState<EffectType>(null);

    useEffect(() => {
        if (trigger) {
            const effects: EffectType[] = ['flash', 'ripple', 'shake'];
            const randomEffect = effects[Math.floor(Math.random() * effects.length)];
            setActiveEffect(randomEffect);

            // Reset after animation duration
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

    if (!activeEffect) return null;

    return (
        <>
            {activeEffect === 'flash' && (
                <div className="fixed inset-0 pointer-events-none z-[9999] flash-screen" aria-hidden="true" />
            )}
            
            {activeEffect === 'ripple' && (
                <div className="shockwave-ripple" aria-hidden="true" />
            )}
            
            {/* Shake is handled via body class side-effect */}
        </>
    );
};

export default MissEffect;
