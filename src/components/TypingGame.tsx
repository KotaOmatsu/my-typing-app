'use client';

import React from 'react';
import OnScreenKeyboard from '../components/OnScreenKeyboard';
import { useTypingGame } from '../hooks/useTypingGame';
import { getRecommendedRomaji } from '../utils/romajiUtils';
import { useGameSettings } from '../hooks/useGameSettings';

interface TypingGameProps {
  courseId: string;
}

const TypingGame: React.FC<TypingGameProps> = ({ courseId }) => {
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
  } = useTypingGame(courseId);

  const { settings, isSettingsLoaded } = useGameSettings();

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
          {settings.showKana && (
            <span className={`text-3xl font-bold ${color} ${bgColor}`}>
              {unit}
            </span>
          )}
          
          {/* ローマ字ガイド表示 */}
          {settings.showRomaji && (
            <span className="text-2xl font-mono mt-1 h-8">
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
          )}
        </div>
      );
    });
  };

  if (!isMapLoaded || !isSettingsLoaded) {
    return <div className="text-xl">Loading typing data...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full relative">
      <div className="mb-8 p-8 bg-white rounded-lg shadow-lg min-w-[800px] flex flex-col items-center justify-center gap-6">
        {/* 漢字（表示用テキスト） */}
        <div className="text-6xl font-bold text-gray-800 tracking-wider mb-4">
          {currentDisplayText}
        </div>
        {/* ひらがな & ローマ字（入力ガイド） */}
        {(settings.showKana || settings.showRomaji) && (
          <div className="flex flex-wrap justify-center">
            {renderText()}
          </div>
        )}
      </div>
      
      {error && <p className="text-red-500 text-xl mt-4">入力が間違っています。正しいローマ字を入力してください。</p>}
      {!isGameStarted && <p className="text-gray-600 text-xl mt-4">キーを押してタイピングを開始してください。</p>} {/* ゲーム開始前のメッセージ（オプション） */}
      <OnScreenKeyboard lastTypedKey={lastTypedKey} /> {/* オン・スクリーン・キーボードを追加 */}
    </div>
  );
};

export default TypingGame;