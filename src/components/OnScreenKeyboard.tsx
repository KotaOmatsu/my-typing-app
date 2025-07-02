'use client';

import React, { useState, useEffect } from 'react';

interface OnScreenKeyboardProps {
  lastTypedKey: string | null;
  mistypedKeys?: { [key: string]: number };
}

const keyboardLayout = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'backspace'],
  ['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['capslock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'enter'],
  ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'shift'],
  ['ctrl', 'alt', 'space', 'alt', 'ctrl'],
];

const OnScreenKeyboard: React.FC<OnScreenKeyboardProps> = ({ lastTypedKey, mistypedKeys = {} }) => {
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
    let baseClass = 'flex items-center justify-center rounded-md shadow-sm text-gray-800 font-semibold';
    const mistakeCount = mistypedKeys[key.toLowerCase()] || 0;

    if (key === activeKey) {
      baseClass += ' bg-blue-400 text-white'; // アクティブなキーの色
    } else if (mistakeCount > 0) {
      const maxMistakes = Math.max(...Object.values(mistypedKeys), 1);
      baseClass += ` bg-red-500`
      baseClass = `${baseClass} text-white`
    } else {
      baseClass += ' bg-gray-200 hover:bg-gray-300';
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

  return (
    <div className="mt-8 p-4 bg-gray-100 rounded-lg shadow-lg">
      {keyboardLayout.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center space-x-1 mb-1">
          {row.map((key, keyIndex) => (
            <div key={keyIndex} className={getKeyClass(key)} style={mistypedKeys[key.toLowerCase()] > 0 ? { backgroundColor: `rgba(239, 68, 68, ${0.2 + (mistypedKeys[key.toLowerCase()] / Math.max(...Object.values(mistypedKeys))) * 0.6})` } : {}}>
              {key === 'backspace' ? '←' : key === 'tab' ? 'Tab' : key === 'capslock' ? 'Caps' : key === 'enter' ? 'Enter' : key === 'shift' ? 'Shift' : key === 'ctrl' ? 'Ctrl' : key === 'alt' ? 'Alt' : key === 'space' ? 'Space' : key}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default OnScreenKeyboard;