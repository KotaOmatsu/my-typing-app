'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProgressiveBlackoutProps {
  mistakeCount: number;
  onBlackoutComplete: () => void;
}

const ProgressiveBlackout: React.FC<ProgressiveBlackoutProps> = ({ mistakeCount, onBlackoutComplete }) => {
  const [isBlackingOut, setIsBlackingOut] = useState(false);

  // Calculate darkness level (0 to 9 -> 0.0 to 0.9)
  // If mistakeCount % 10 === 0 and > 0, it means we hit the limit.
  // However, immediately after reset, mistakeCount % 10 is still 0 (since count preserves).
  // We need to track *when* we hit the limit.
  
  // Actually, opacity should correspond to the count *within the current cycle*.
  // But if mistake count is cumulative, how do we know we "reset"?
  // We don't reset mistake count.
  // So opacity = (mistakeCount % 10) / 10.
  // When mistakeCount % 10 == 0 (e.g. 10), opacity becomes 0? No, we want 1.
  // So 1..9 -> 0.1..0.9.
  // 10 -> 1.0 -> Then reset.
  // After reset, we are at "0 progress" for the NEW cycle?
  // But mistakeCount is still 10. 10 % 10 is 0.
  // So visually it goes from 0.9 (9 mistakes) -> 1.0 (10 mistakes) -> Reset -> 0.0 (10 mistakes but new cycle).
  
  // This logic works if we consider `mistakeCount` as the driver.
  
  const cycleProgress = mistakeCount % 10;
  const isLimitReached = mistakeCount > 0 && cycleProgress === 0;

  useEffect(() => {
    if (isLimitReached) {
      setIsBlackingOut(true);
      const timer = setTimeout(() => {
        setIsBlackingOut(false);
        onBlackoutComplete();
      }, 500); // 0.5s blackout
      return () => clearTimeout(timer);
    }
  }, [mistakeCount, isLimitReached, onBlackoutComplete]);

  // If we are in the middle of blacking out (limit reached), showing full black.
  // Otherwise show progressive darkness.
  // If limit reached (10), opacity is 1.
  // If 1..9, opacity is 0.1..0.9.
  // If 0 (start), opacity 0.
  
  // Special case: When count is 10, cycleProgress is 0. But we want 1.0 during the animation.
  // We handle this via `isBlackingOut`.
  
  const opacity = isBlackingOut ? 1 : cycleProgress * 0.1;

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-50 bg-black"
      animate={{ opacity: opacity }}
      transition={{ duration: 0.2 }}
    />
  );
};

export default ProgressiveBlackout;
