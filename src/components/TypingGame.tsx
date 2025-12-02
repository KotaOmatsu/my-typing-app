'use client';

import React, { useState } from 'react';
import OnScreenKeyboard from '../components/OnScreenKeyboard';
import { useTypingGame } from '../hooks/useTypingGame';
import { getRecommendedRomaji } from '../utils/romajiUtils';
import { useGameSettings } from '../hooks/useGameSettings';
import GameSettingsModal from './GameSettingsModal';

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
    currentDisplayText,
  } = useTypingGame();

  const { settings, updateSettings, isSettingsLoaded } = useGameSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
      
      // ローマ字ガイドの取得
      const nextUnit = typingUnits[index + 1];
      const recommendedRomaji = getRecommendedRomaji(unit, nextUnit);

      return (
        <div key={index} className="flex flex-col items-center mx-1">
          {/* ひらがな表示 */}
          <span className={`text-3xl font-bold ${color} ${bgColor} ${settings.showKana ? '' : 'invisible'}`}>
            {unit}
          </span>
          
          {/* ローマ字ガイド表示 */}
          <span className={`text-2xl font-mono mt-1 h-8 ${settings.showRomaji ? '' : 'invisible'}`}>
             {index === currentKanaIndex ? (
               <span>
                 <span className="text-blue-600">{inputBuffer}</span>
                 <span className="text-gray-300">
                    {recommendedRomaji.startsWith(inputBuffer) 
                      ? recommendedRomaji.slice(inputBuffer.length) 
                      : "" /* 入力が合わない場合はガイドを非表示にする */}
                 </span>
               </span>
             ) : index < currentKanaIndex ? (
               // 入力済みの文字は薄く表示するか、非表示にする
               <span className="text-green-500 opacity-50">{recommendedRomaji}</span>
             ) : (
               // 未入力の文字
               <span className="text-gray-300">{recommendedRomaji}</span>
             )}
          </span>
        </div>
      );
    });
  };

  if (!isMapLoaded || !isSettingsLoaded) {
    return <div className="text-xl">Loading typing data...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full relative">
      {/* 設定ボタン */}
      <div className="absolute top-0 right-0 mt-4 mr-4">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 text-gray-500 hover:text-gray-700 bg-white rounded-full shadow hover:shadow-md transition duration-200"
          title="設定"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      <div className="mb-8 p-8 bg-white rounded-lg shadow-lg min-w-[800px] min-h-[250px] flex flex-col items-center justify-center gap-6">
        {/* 漢字（表示用テキスト） */}
        <div className="text-6xl font-bold text-gray-800 tracking-wider mb-4">
          {currentDisplayText}
        </div>
        {/* ひらがな & ローマ字（入力ガイド） */}
        <div className="flex flex-wrap justify-center">
          {renderText()}
        </div>
      </div>
      
      {error && <p className="text-red-500 text-xl mt-4">入力が間違っています。正しいローマ字を入力してください。</p>}
      {!isGameStarted && <p className="text-gray-600 text-xl mt-4">キーを押してタイピングを開始してください。</p>} {/* ゲーム開始前のメッセージ（オプション） */}
      <OnScreenKeyboard lastTypedKey={lastTypedKey} /> {/* オン・スクリーン・キーボードを追加 */}

      <GameSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
      />
    </div>
  );
};

export default TypingGame;