'use client';

import React from 'react';
import OnScreenKeyboard from '../components/OnScreenKeyboard';
import FingerGuide from '../components/FingerGuide';
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
    courseTitle, // Add courseTitle to destructuring
  } = useTypingGame(courseId);

  const { settings, isSettingsLoaded } = useGameSettings();

  // Calculate next key for guides
  const nextKey = React.useMemo(() => {
    if (typingUnits.length > 0 && currentKanaIndex < typingUnits.length) {
        const currentUnit = typingUnits[currentKanaIndex];
        const nextUnit = typingUnits[currentKanaIndex + 1];
        const recommendedRomaji = getRecommendedRomaji(currentUnit, nextUnit);
        const remainingRomaji = recommendedRomaji.slice(inputBuffer.length);
        if (remainingRomaji.length > 0) {
            return remainingRomaji[0];
        }
    }
    return null;
  }, [typingUnits, currentKanaIndex, inputBuffer]);

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
                (() => {
                  const remaining = recommendedRomaji.startsWith(inputBuffer)
                    ? recommendedRomaji.slice(inputBuffer.length)
                    : "";
                  const nextChar = remaining.charAt(0);
                  const rest = remaining.slice(1);

                  return (
                    <span>
                      <span className="text-blue-600">{inputBuffer}</span>
                      {nextChar && (
                        <span className="text-blue-600 font-bold border-b-2 border-blue-600">
                          {nextChar}
                        </span>
                      )}
                      <span className="text-gray-300">{rest}</span>
                    </span>
                  );
                })()
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
    <div className="flex flex-col items-center justify-center w-full relative min-h-[600px]"> {/* Added min-h to ensure space */}
      {courseTitle && (
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{courseTitle}</h1>
      )}
      <div className="mb-4 p-6 bg-white rounded-lg shadow-lg min-w-[600px] flex flex-col items-center justify-center gap-4 transform scale-90 origin-top"> {/* Reduced padding/gap, added scale */}
        {/* 漢字（表示用テキスト） */}
        <div className="text-5xl font-bold text-gray-800 tracking-wider mb-2"> {/* Reduced font size */}
          {currentDisplayText}
        </div>
        {/* ひらがな & ローマ字（入力ガイド） */}
        {(settings.showKana || settings.showRomaji) && (
          <div className="flex flex-wrap justify-center">
            {renderText()}
          </div>
        )}
      </div>
      
      {error && <p className="text-red-500 text-lg mt-2">入力が間違っています。正しいローマ字を入力してください。</p>}
      
      {/* キーボード */}
      <div className="flex flex-col items-center gap-4 transform scale-90 origin-top">
        <OnScreenKeyboard lastTypedKey={lastTypedKey} nextKey={nextKey} />
      </div>

      {/* 運指ガイド (Fixed position handled in component, just render it here) */}
      <FingerGuide nextKey={nextKey} />
    </div>
  );
};

export default TypingGame;