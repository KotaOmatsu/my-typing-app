'use client';

import React, { useMemo } from 'react';
import OnScreenKeyboard from '../components/OnScreenKeyboard';
import FingerGuide from '../components/FingerGuide';
import { useTypingGame } from '../hooks/useTypingGame';
import { getRecommendedRomaji } from '../utils/romajiUtils';
import { useGameSettings } from '../hooks/useGameSettings';
import { Card } from '@/components/ui/card';

interface TypingGameProps {
  courseId: string;
}

const TypingGame: React.FC<TypingGameProps> = ({ courseId }) => {
  const {
    typingUnits,
    currentKanaIndex,
    inputBuffer,
    error,
    flashCorrect,
    currentDisplayText,
    mistakes,
    totalKeystrokes,
    correctKeystrokes,
    lastTypedKey,
    currentTextIndex,
    courseTexts,
  } = useTypingGame(courseId);

  const { settings, isSettingsLoaded } = useGameSettings();

  // Live Stats Calculation
  const stats = useMemo(() => {
    const accuracy = totalKeystrokes > 0 
      ? Math.round((correctKeystrokes / totalKeystrokes) * 100) 
      : 100;
    return { accuracy };
  }, [totalKeystrokes, correctKeystrokes]);

  // Calculate next key for guides
  const nextKey = React.useMemo(() => {
    if (typingUnits.length > 0 && currentKanaIndex < typingUnits.length) {
        const currentUnit = typingUnits[currentKanaIndex];
        const nextUnit = typingUnits[currentKanaIndex + 1];
        const recommendedRomaji = getRecommendedRomaji(currentUnit, nextUnit);
        
        let i = 0;
        while (i < inputBuffer.length && i < recommendedRomaji.length && inputBuffer[i] === recommendedRomaji[i]) {
            i++;
        }
        
        if (i === inputBuffer.length && i < recommendedRomaji.length) {
             return recommendedRomaji[i];
        }
    }
    return null;
  }, [typingUnits, currentKanaIndex, inputBuffer]);

  const renderText = () => {
    return typingUnits.map((unit, index) => {
      let color = 'text-muted-foreground/40'; // Untyped
      let bgColor = '';

      if (index < currentKanaIndex) {
        color = 'text-primary'; // Typed
      } else if (index === currentKanaIndex) {
        color = error ? 'text-destructive' : 'text-foreground'; // Current
        if (flashCorrect) {
          bgColor = 'bg-accent'; // Flash
        }
      }
      
      const nextUnit = typingUnits[index + 1];
      const recommendedRomaji = getRecommendedRomaji(unit, nextUnit);

      return (
        <div key={index} className="flex flex-col items-center mx-1">
          {settings.showKana && (
            <span className={`text-2xl font-bold ${color} ${bgColor} transition-colors duration-100`}>
              {unit}
            </span>
          )}
          
          {settings.showRomaji && (
            <span className="text-lg font-mono mt-1 h-6 flex">
              {index === currentKanaIndex ? (
                (() => {
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
                      <span className="text-primary">{matchedPart}</span>
                      <span className="text-destructive bg-destructive/10">{wrongPart}</span>
                      
                      {nextChar ? (
                        <span className="text-foreground font-bold border-b-2 border-primary">
                          {nextChar}
                        </span>
                      ) : null}
                      <span className="text-muted-foreground/30">{rest}</span>
                    </span>
                  );
                })()
              ) : index < currentKanaIndex ? (
                <span className="text-primary/30">{recommendedRomaji}</span>
              ) : (
                <span className="text-muted-foreground/20">{recommendedRomaji}</span>
              )}
            </span>
          )}
        </div>
      );
    });
  };

  if (!isMapLoaded || !isSettingsLoaded) {
    return <div className="text-xl p-8">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-start w-full min-h-0 py-1 gap-1">
      
      {/* Top Stats Bar */}
      <div className="flex w-full max-w-xl justify-center gap-4 px-4">
        <Card className="flex-1 p-2 flex flex-col items-center justify-center bg-card/50 shadow-sm border-t-2 border-t-primary">
           <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">正確率</span>
           <span className="text-xl font-bold text-foreground">{stats.accuracy}%</span>
        </Card>
        
        <Card className="flex-1 p-2 flex flex-col items-center justify-center bg-card/50 shadow-sm border-t-2 border-t-destructive">
           <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">ミス数</span>
           <span className="text-xl font-bold text-foreground">{mistakes.length}</span>
        </Card>
      </div>

      {/* Status/Error Message (Replacing Title) */}
      <div className="h-4 flex items-center justify-center">
        {error && !settings.hardcoreMode && (
          <span className="text-destructive font-extrabold animate-pulse text-xs tracking-widest">Miss!</span>
        )}
      </div>

      {/* Typing Area */}
      <Card className="w-full max-w-4xl py-4 px-6 flex flex-col items-center justify-center bg-background shadow-md border-border min-h-[140px] relative"> 
        {/* Kanji / Display Text */}
        <div className="text-3xl font-black text-foreground/90 tracking-wider mb-2 text-center"> 
          {currentDisplayText}
        </div>

        {/* Kana & Romaji Guides */}
        {(settings.showKana || settings.showRomaji) && (
          <div className="flex flex-wrap justify-center items-end">
            {renderText()}
          </div>
        )}

        {/* Page Number */}
        {courseTexts.length > 1 && (
          <div className="absolute bottom-2 right-3 text-xs text-muted-foreground/50 font-mono">
            {currentTextIndex + 1} / {courseTexts.length}
          </div>
        )}
      </Card>
      
      {/* Keyboard */}
      <div className="flex flex-col items-center transform scale-[0.8] origin-top mt-[-15px]">
        <OnScreenKeyboard lastTypedKey={lastTypedKey} nextKey={nextKey} />
      </div>

      {/* Finger Guide - Emerging from bottom */}
      <div className="fixed bottom-0 left-0 w-full pointer-events-none z-10 flex justify-center items-end opacity-80 overflow-hidden h-32">
        <FingerGuide nextKey={nextKey} />
      </div>
    </div>
  );
};

export default TypingGame;
