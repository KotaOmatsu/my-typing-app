'use client';

import React from 'react';
import OnScreenKeyboard from '../components/OnScreenKeyboard';
import { useTypingGame } from '../hooks/useTypingGame';

const TypingGame: React.FC = () => {
  const {
    isMapLoaded,
    typingUnits,
    currentKanaIndex,
    inputBuffer,
    error,
    flashCorrect,
    isGameStarted,
    lastTypedKey,
    mistakes,
    handleKeyDown,
  } = useTypingGame();

  const renderText = () => {
    return typingUnits.map((unit, index) => {
      let color = 'text-gray-400'; // 未入力
      let bgColor = '';

      if (index < currentKanaIndex) {
        color = 'text-green-500'; // 入力済み
      } else if (index === currentKanaIndex) {
        color = error ? 'text-red-500' : 'text-blue-600'; // 現在入力中
        if (flashCorrect) {
          bgColor = 'bg-yellow-200'; // 正解時のフラッシュ
        }
      }
      return (
        <span key={index} className={`text-5xl font-bold ${color} ${bgColor}`}>
          {unit}
        </span>
      );
    });
  };

  if (!isMapLoaded) {
    return <div className="text-xl">Loading typing data...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="mb-8 p-8 bg-white rounded-lg shadow-lg min-w-[800px] min-h-[150px] flex items-center justify-center">
        {renderText()}
      </div>
      <div className="text-4xl font-bold text-gray-700 mt-4 h-12">
        {inputBuffer} {/* 入力バッファを表示 */}
      </div>
      {error && <p className="text-red-500 text-xl mt-4">入力が間違っています。正しいローマ字を入力してください。</p>}
      {!isGameStarted && <p className="text-gray-600 text-xl mt-4">キーを押してタイピングを開始してください。</p>} {/* ゲーム開始前のメッセージ（オプション） */}
      <OnScreenKeyboard lastTypedKey={lastTypedKey} /> {/* オン・スクリーン・キーボードを追加 */}
    </div>
  );
};

export default TypingGame;
