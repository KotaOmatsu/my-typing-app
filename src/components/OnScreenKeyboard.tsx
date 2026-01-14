'use client';

import React, { useState, useEffect } from 'react';

interface OnScreenKeyboardProps {
  lastTypedKey?: string | null;
  mistypedKeys?: { [key: string]: number };
  nextKey?: string | null;
}

const keyboardLayout = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'backspace'],
  ['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['capslock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'enter'],
  ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'shift'],
  ['ctrl', 'alt', 'space', 'alt', 'ctrl'],
];

const OnScreenKeyboard: React.FC<OnScreenKeyboardProps> = ({ lastTypedKey, mistypedKeys = {}, nextKey }) => {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    if (lastTypedKey) {
      setActiveKey(lastTypedKey.toLowerCase());
      const timer = setTimeout(() => {
        setActiveKey(null);
      }, 150); // キーのハイライト表示時間
      return () => clearTimeout(timer);
    }
  }, [lastTypedKey]);

  const getKeyClass = (key: string) => {
    let baseClass = 'flex items-center justify-center rounded-md shadow-sm font-semibold transition-colors duration-150';
    const mistakeCount = mistypedKeys[key.toLowerCase()] || 0;
    const isNextKey = nextKey && key.toLowerCase() === nextKey.toLowerCase();

    if (key === activeKey) {
      baseClass += ' bg-blue-400 text-white';
    } else if (mistakeCount > 0) {
      // Background and color will be handled by inline style
      baseClass += ' border border-red-200';
    } else if (isNextKey) {
      baseClass += ' bg-yellow-200 ring-2 ring-yellow-400 text-gray-800';
    } else {
      baseClass += ' bg-muted/30 text-muted-foreground hover:bg-muted/50';
    }

    switch (key) {
      case 'backspace':
      case 'tab':
      case 'capslock':
      case 'enter':
        return `${baseClass} w-28 h-14 text-lg`;
      case 'shift':
        return `${baseClass} w-[8.75rem] h-14 text-lg`;
      case 'space':
        return `${baseClass} w-[32.5rem] h-14 text-lg`;
      case 'ctrl':
      case 'alt':
        return `${baseClass} w-20 h-14 text-lg`;
      default:
        return `${baseClass} w-14 h-14 text-xl`;
    }
  };

  const maxMistakes = Math.max(...Object.values(mistypedKeys), 1);

  return (
    <div className="p-4 bg-transparent">
      {keyboardLayout.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center space-x-1 mb-1">
          {row.map((key, keyIndex) => {
            const mistakeCount = mistypedKeys[key.toLowerCase()] || 0;
            const intensity = mistakeCount / maxMistakes;
            
            // Heatmap color logic: Very Light Red -> Deep Red
            let heatStyle = {};
            if (mistakeCount > 0) {
              // Start: (255, 235, 235) -> End: (220, 38, 38)
              const r = Math.floor(255 - (255 - 220) * intensity);
              const g = Math.floor(235 - (235 - 38) * intensity);
              const b = Math.floor(235 - (235 - 38) * intensity);
              heatStyle = { backgroundColor: `rgb(${r}, ${g}, ${b})`, color: intensity > 0.5 ? 'white' : 'black' };
            }

            return (
              <div 
                key={keyIndex} 
                className={getKeyClass(key)} 
                style={heatStyle}
              >
                {key === 'backspace' ? '←' : key === 'tab' ? 'Tab' : key === 'capslock' ? 'Caps' : key === 'enter' ? 'Enter' : key === 'shift' ? 'Shift' : key === 'ctrl' ? 'Ctrl' : key === 'alt' ? 'Alt' : key === 'space' ? 'Space' : key}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default OnScreenKeyboard;