'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ProgressiveBlackoutProps {
  mistakeCount: number;
  onBlackoutComplete: () => void;
}

const ProgressiveBlackout: React.FC<ProgressiveBlackoutProps> = ({ mistakeCount, onBlackoutComplete }) => {
  const [isBlackingOut, setIsBlackingOut] = useState(false);
  const lastHandledCount = React.useRef(0);

  const cycleProgress = mistakeCount % 10;
  const isLimitReached = mistakeCount > 0 && cycleProgress === 0;

  useEffect(() => {
    if (isLimitReached && mistakeCount !== lastHandledCount.current) {
      lastHandledCount.current = mistakeCount;
      setIsBlackingOut(true);
      const timer = setTimeout(() => {
        setIsBlackingOut(false);
        onBlackoutComplete();
      }, 10); // 0.01s blackout
      return () => clearTimeout(timer);
    }
  }, [mistakeCount, isLimitReached, onBlackoutComplete]);

  // Special case: When count is 10, cycleProgress is 0. But we want 1.0 during the animation.
  // We handle this via `isBlackingOut`.
  
  const opacity = isBlackingOut ? 1 : cycleProgress * 0.1;

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-50 bg-black"
      animate={{ opacity: opacity }}
      transition={{ duration: 0.05 }} // Minimal fade for standard progress, but instantaneous for reset
    />
  );
};

export default ProgressiveBlackout;
