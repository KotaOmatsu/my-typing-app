'use client';

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface MissEffectProps {
    triggerKey: number; // Trigger on change
}

const MissEffect: React.FC<MissEffectProps> = ({ triggerKey }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (triggerKey > 0) {
            // Trigger Shake Effect (Restartable)
            // To restart a CSS animation, we must remove the class, force reflow, and add it back.
            document.body.classList.remove('hardcore-shake');
            
            // Force reflow
            void document.body.offsetWidth;
            
            document.body.classList.add('hardcore-shake');
        }
    }, [triggerKey]);

    // Cleanup shake on unmount
    useEffect(() => {
        return () => {
            document.body.classList.remove('hardcore-shake');
        };
    }, []);

    if (!mounted) return null;

    // Portal is kept empty if we only use body class effects, 
    // or we can remove it entirely if no DOM elements are needed.
    // Since flash is removed and shake is a body class, we render nothing.
    return null;
};

export default MissEffect;
