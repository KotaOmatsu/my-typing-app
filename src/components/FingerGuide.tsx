'use client';

import React from 'react';
import { FingerName, KEY_TO_FINGER } from '../constants/fingerMapping';

interface FingerGuideProps {
  nextKey: string | null;
}

const FingerGuide: React.FC<FingerGuideProps> = ({ nextKey }) => {
  const activeFinger: FingerName | null = nextKey ? KEY_TO_FINGER[nextKey.toLowerCase()] || null : null;

  const renderFinger = (finger: FingerName, height: string, rotate: string = 'rotate-0') => {
    const isActive = activeFinger === finger;
    const baseStyle = `w-10 rounded-t-xl border-2 transition-all duration-150 mx-1 relative`;
    const activeStyle = `bg-blue-400 border-blue-500 transform -translate-y-2 z-10 shadow-lg`;
    const inactiveStyle = `bg-gray-100 border-gray-400`;

    return (
      <div 
        className={`${baseStyle} ${height} ${rotate} ${isActive ? activeStyle : inactiveStyle}`}
      ></div>
    );
  };

  return (
    <div className="flex justify-center items-end space-x-20 select-none translate-y-4">
      {/* Left Hand */}
      <div className="flex items-end">
        {renderFinger('left-pinky', 'h-20', '-rotate-12')}
        {renderFinger('left-ring', 'h-28', '-rotate-6')}
        {renderFinger('left-middle', 'h-32', 'rotate-0')}
        {renderFinger('left-index', 'h-28', 'rotate-6')}
        {renderFinger('left-thumb', 'h-16', 'rotate-12')}
      </div>

      {/* Right Hand */}
      <div className="flex items-end">
        {renderFinger('right-thumb', 'h-16', '-rotate-12')}
        {renderFinger('right-index', 'h-28', '-rotate-6')}
        {renderFinger('right-middle', 'h-32', 'rotate-0')}
        {renderFinger('right-ring', 'h-28', 'rotate-6')}
        {renderFinger('right-pinky', 'h-20', 'rotate-12')}
      </div>
    </div>
  );
};

export default FingerGuide;
