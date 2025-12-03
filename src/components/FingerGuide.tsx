'use client';

import React from 'react';
import { FingerName, KEY_TO_FINGER } from '../constants/fingerMapping';

interface FingerGuideProps {
  nextKey: string | null;
}

const FingerGuide: React.FC<FingerGuideProps> = ({ nextKey }) => {
  const activeFinger: FingerName | null = nextKey ? KEY_TO_FINGER[nextKey.toLowerCase()] || null : null;

  const renderFinger = (finger: FingerName, height: string, rotate: string = 'rotate-0', translate: string = 'translate-y-0') => {
    const isActive = activeFinger === finger;
    // Shared styles for fingers
    const baseStyle = `w-10 rounded-t-xl border-2 border-gray-400 transition-colors duration-150 mx-1 shadow-sm relative top-1`; // 'top-1' to push slightly down to hide bottom border potentially if container clipped, or just aesthetic
    const activeStyle = `bg-blue-400 border-blue-500 transform -translate-y-4 z-10 shadow-md`; // Highlight moves up more
    const inactiveStyle = `bg-gray-100`;

    return (
      <div 
        className={`${baseStyle} ${height} ${rotate} ${isActive ? activeStyle : inactiveStyle} ${!isActive ? translate : ''}`}
      ></div>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 w-full flex justify-center items-end pointer-events-none pb-0 z-50 opacity-90">
       {/* Container fixed to bottom */}
      <div className="flex justify-center items-end space-x-24 select-none translate-y-2"> {/* Space between hands */}
        
        {/* Left Hand */}
        <div className="flex items-end">
          {renderFinger('left-pinky', 'h-24', '-rotate-12', 'translate-y-4')}
          {renderFinger('left-ring', 'h-32', '-rotate-6', 'translate-y-1')}
          {renderFinger('left-middle', 'h-36', 'rotate-0', 'translate-y-0')}
          {renderFinger('left-index', 'h-32', 'rotate-6', 'translate-y-1')}
          {renderFinger('left-thumb', 'h-20', 'rotate-12', 'translate-y-6')}
        </div>

        {/* Right Hand */}
        <div className="flex items-end">
          {renderFinger('right-thumb', 'h-20', '-rotate-12', 'translate-y-6')}
          {renderFinger('right-index', 'h-32', '-rotate-6', 'translate-y-1')}
          {renderFinger('right-middle', 'h-36', 'rotate-0', 'translate-y-0')}
          {renderFinger('right-ring', 'h-32', 'rotate-6', 'translate-y-1')}
          {renderFinger('right-pinky', 'h-24', 'rotate-12', 'translate-y-4')}
        </div>
      </div>
    </div>
  );
};

export default FingerGuide;
