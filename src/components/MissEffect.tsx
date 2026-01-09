import React, { useEffect, useState } from "react";

interface MissEffectProps {
    trigger: boolean;
}

const MissEffect: React.FC<MissEffectProps> = ({ trigger }) => {
    const [active, setActive] = useState(false);

    useEffect(() => {
        if (trigger) {
            setActive(true);
            const timer = setTimeout(() => setActive(false), 600); // Reset after animation duration
            return () => clearTimeout(timer);
        }
    }, [trigger]);

    if (!active) return null;

    return (
        <>
            {/* Full screen red flash */}
            <div className="fixed inset-0 pointer-events-none z-[9999] flash-screen" aria-hidden="true" />
            
            {/* Expanding Shockwave Ripple */}
            <div className="shockwave-ripple" aria-hidden="true" />
        </>
    );
};

export default MissEffect;