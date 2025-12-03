'use client';

import React from 'react';
import { FingerName, KEY_TO_FINGER, FINGER_LABELS } from '../constants/fingerMapping';

interface FingerGuideProps {
  nextKey: string | null;
}

const FingerGuide: React.FC<FingerGuideProps> = ({ nextKey }) => {
  const activeFinger: FingerName | null = nextKey ? KEY_TO_FINGER[nextKey.toLowerCase()] || null : null;

  // Hand SVG/CSS implementation
  // Using a simple representation with divs for now, structured as two hands
  
  const renderFinger = (finger: FingerName, label: string, height: string) => {
    const isActive = activeFinger === finger;
    // Shared styles for fingers
    const baseStyle = `w-8 rounded-t-lg border-2 border-gray-300 flex items-end justify-center pb-1 text-xs transition-colors duration-150 mx-1`;
    const activeStyle = `bg-blue-400 border-blue-500 text-white transform -translate-y-2 shadow-md`;
    const inactiveStyle = `bg-white text-gray-400`;

    return (
      <div 
        className={`${baseStyle} ${height} ${isActive ? activeStyle : inactiveStyle}`}
      >
        {label}
      </div>
    );
  };

  return (
    <div className="flex justify-center items-end mt-6 space-x-12 select-none">
      {/* Left Hand */}
      <div className="flex items-end">
        {renderFinger('left-pinky', '小', 'h-16')}
        {renderFinger('left-ring', '薬', 'h-20')}
        {renderFinger('left-middle', '中', 'h-24')}
        {renderFinger('left-index', '人', 'h-20')}
        <div className="w-12 h-12 -ml-2 rotate-12 transform translate-y-2">
            {/* Thumb representation is tricky with simple divs, simplified here */}
             <div className={`w-full h-full border-2 border-gray-300 rounded-full flex items-center justify-center text-xs ${activeFinger === 'left-thumb' ? 'bg-blue-400 text-white' : 'bg-white text-gray-400'}`}>親</div>
        </div>
      </div>

      {/* Right Hand */}
      <div className="flex items-end">
        <div className="w-12 h-12 -mr-2 -rotate-12 transform translate-y-2">
             <div className={`w-full h-full border-2 border-gray-300 rounded-full flex items-center justify-center text-xs ${activeFinger === 'right-thumb' ? 'bg-blue-400 text-white' : 'bg-white text-gray-400'}`}>親</div>
        </div>
        {renderFinger('right-index', '人', 'h-20')}
        {renderFinger('right-middle', '中', 'h-24')}
        {renderFinger('right-ring', '薬', 'h-20')}
        {renderFinger('right-pinky', '小', 'h-16')}
      </div>
    </div>
  );
};

export default FingerGuide;
