'use client';

import React, { useState, useEffect } from 'react';

interface OnScreenKeyboardProps {
  lastTypedKey: string | null;
}

const keyboardLayout = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'backspace'],
  ['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['capslock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'enter'],
  ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'shift'],
  ['ctrl', 'alt', 'space', 'alt', 'ctrl'],
];

const OnScreenKeyboard: React.FC<OnScreenKeyboardProps> = ({ lastTypedKey }) => {
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
    if (key === activeKey) {
      baseClass += ' bg-blue-400 text-white'; // アクティブなキーの色
    } else {
      baseClass += ' bg-gray-200 hover:bg-gray-300';
    }

    switch (key) {
      case 'backspace':
      case 'tab':
      case 'capslock':
      case 'enter':
        return `${baseClass} w-20`; // 幅広のキー
      case 'shift':
        return `${baseClass} w-24`; // さらに幅広のキー
      case 'space':
        return `${baseClass} w-96`; // スペースキー
      case 'ctrl':
      case 'alt':
        return `${baseClass} w-16`;
      default:
        return `${baseClass} w-10 h-10`; // 通常のキー
    }
  };

  return (
    <div className="mt-8 p-4 bg-gray-100 rounded-lg shadow-lg">
      {keyboardLayout.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center space-x-1 mb-1">
          {row.map((key, keyIndex) => (
            <div key={keyIndex} className={getKeyClass(key)}>
              {key === 'backspace' ? '←' : key === 'tab' ? 'Tab' : key === 'capslock' ? 'Caps' : key === 'enter' ? 'Enter' : key === 'shift' ? 'Shift' : key === 'ctrl' ? 'Ctrl' : key === 'alt' ? 'Alt' : key === 'space' ? 'Space' : key}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default OnScreenKeyboard;
