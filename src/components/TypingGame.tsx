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
    lastTypedKey,
    currentDisplayText,
    courseTitle,
    penaltyBackspacesNeeded
  } = useTypingGame(courseId);

  const { settings, isSettingsLoaded } = useGameSettings();

  // Calculate next key for guides
  const nextKey = React.useMemo(() => {
    if (typingUnits.length > 0 && currentKanaIndex < typingUnits.length) {
        const currentUnit = typingUnits[currentKanaIndex];
        const nextUnit = typingUnits[currentKanaIndex + 1];
        const recommendedRomaji = getRecommendedRomaji(currentUnit, nextUnit);
        
        // Find match length to determine next needed key
        let i = 0;
        while (i < inputBuffer.length && i < recommendedRomaji.length && inputBuffer[i] === recommendedRomaji[i]) {
            i++;
        }
        
        // If buffer has wrong chars (i < inputBuffer.length), next key is Backspace?
        // But FingerGuide usually shows alphabet. 
        // If we are in penalty mode or wrong buffer, maybe show nothing or Backspace indication?
        // For now, if buffer matches prefix, show next char of romaji.
        if (i === inputBuffer.length && i < recommendedRomaji.length) {
             return recommendedRomaji[i];
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
            <span className="text-2xl font-mono mt-1 h-8 flex">
              {index === currentKanaIndex ? (
                (() => {
                    // Logic to split inputBuffer and recommendedRomaji
                    let matchLen = 0;
                    while (matchLen < inputBuffer.length && matchLen < recommendedRomaji.length && inputBuffer[matchLen] === recommendedRomaji[matchLen]) {
                        matchLen++;
                    }

                    const matchedPart = inputBuffer.slice(0, matchLen);
                    const wrongPart = inputBuffer.slice(matchLen);
                    const remainingTarget = recommendedRomaji.slice(matchLen);
                    
                    const nextChar = remainingTarget.charAt(0);
                    const rest = remainingTarget.slice(1);

                  return (
                    <span>
                      <span className="text-blue-600">{matchedPart}</span>
                      <span className="text-red-500 bg-red-100">{wrongPart}</span>
                      
                      {/* Only show target if we haven't typed wrong stuff over it? 
                          Actually we should show target as hint. 
                          If wrongPart exists, user needs to Backspace. 
                          Target should be visible but maybe separate? 
                          Or just append it.
                      */}
                      
                      {nextChar ? (
                        <span className="text-blue-600 font-bold border-b-2 border-blue-600">
                          {nextChar}
                        </span>
                      ) : null}
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

  // Hardcore Shake Effect
  const shakeClass = (settings.hardcoreMode && error) ? 'shake' : '';

  return (
    <div className={`flex flex-col items-center justify-center w-full relative min-h-[600px] ${shakeClass}`}>
      {courseTitle && (
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{courseTitle}</h1>
      )}
      
      {/* Penalty Overlay or Indicator */}
      {penaltyBackspacesNeeded > 0 && (
          <div className="absolute top-10 text-red-600 font-bold text-2xl animate-pulse z-10 bg-white/80 p-2 rounded">
              Backspace x {penaltyBackspacesNeeded}
          </div>
      )}

      <div className="mb-4 p-6 bg-white rounded-lg shadow-lg min-w-[600px] flex flex-col items-center justify-center gap-4 transform scale-90 origin-top"> 
        {/* 漢字（表示用テキスト） */}
        <div className="text-5xl font-bold text-gray-800 tracking-wider mb-2"> 
          {currentDisplayText}
        </div>
        {/* ひらがな & ローマ字（入力ガイド） */}
        {(settings.showKana || settings.showRomaji) && (
          <div className="flex flex-wrap justify-center">
            {renderText()}
          </div>
        )}
      </div>
      
      {error && !settings.hardcoreMode && <p className="text-red-500 text-lg mt-2">入力が間違っています。</p>}
      
      {/* キーボード */}
      <div className="flex flex-col items-center gap-4 transform scale-90 origin-top">
        <OnScreenKeyboard lastTypedKey={lastTypedKey} nextKey={nextKey} />
      </div>

      {/* 運指ガイド */}
      <FingerGuide nextKey={nextKey} />
    </div>
  );
};

export default TypingGame;
