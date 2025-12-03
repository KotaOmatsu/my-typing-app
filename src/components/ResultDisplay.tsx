'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OnScreenKeyboard from './OnScreenKeyboard';
import { TypingResult } from '@/types/typing';
import { LOCAL_STORAGE_RESULT_KEY } from '@/constants/typing';
import { 
  MistakeDetails, 
  MistypedKeys, 
  createMistakeDetails, 
  analyzeMistypedKeys 
} from '@/utils/resultUtils';

const ResultDisplay: React.FC = () => {
  const [result, setResult] = useState<TypingResult | null>(null);
  const [mistakeDetails, setMistakeDetails] = useState<MistakeDetails | null>(null);
  const [mistypedKeys, setMistypedKeys] = useState<MistypedKeys | null>(null);
  const [tooltip, setTooltip] = useState<{ content: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const storedResult = localStorage.getItem(LOCAL_STORAGE_RESULT_KEY);
    if (storedResult) {
      const parsedResult: TypingResult = JSON.parse(storedResult);
      setResult(parsedResult);
      setMistakeDetails(createMistakeDetails(parsedResult.mistakes));
      setMistypedKeys(analyzeMistypedKeys(parsedResult.mistakes));
    }
  }, []);

  const handleMouseOver = (e: React.MouseEvent<HTMLSpanElement>, details: {char: string, expected: string, actual: string}[]) => {
    const content = details.map(d => `「${d.char}」で「${d.expected}」を「${d.actual}」と入力`).join('\n');
    setTooltip({ content, x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  if (!result) {
    return (
      <div className="text-xl text-gray-700">
        結果がありません。タイピング練習を完了してください。
        <div className="mt-8">
          <Link href="/" className="px-8 py-4 bg-blue-600 text-white text-2xl font-bold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300">
            スタート画面に戻る
          </Link>
        </div>
      </div>
    );
  }

  const accuracyPercentage = result.accuracy.toFixed(2);
  const wpm = result.wpm.toFixed(2);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {tooltip && (
        <div 
          className="absolute bg-gray-800 text-white p-2 rounded shadow-lg z-10 whitespace-pre-wrap"
          style={{ top: tooltip.y + 10, left: tooltip.x + 10 }}
        >
          {tooltip.content}
        </div>
      )}
      <div className="mb-8 p-8 bg-white rounded-lg shadow-lg min-w-[800px]">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">タイピング結果</h2>
        {result.displayText && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
             <p className="text-sm text-gray-500 mb-1">練習した文章</p>
             <p className="text-2xl font-bold text-gray-800">{result.displayText}</p>
          </div>
        )}
        <p className="text-xl text-gray-700 mb-2">正確性: {accuracyPercentage}%</p>
        <p className="text-xl text-gray-700 mb-2">タイピング速度 (WPM): {wpm}</p>
        {result.score !== undefined && (
          <p className="text-2xl text-blue-600 font-bold mb-2">スコア: {result.score}</p>
        )}
        <p className="text-xl text-gray-700 mb-4">総打鍵数: {result.totalKeystrokes} (正解打鍵数: {result.correctKeystrokes})</p>

        {result.typedText && mistakeDetails && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">文章内のミス (詳細)</h3>
            <div className="text-2xl leading-relaxed p-4 border rounded-lg bg-gray-50 font-mono">
              {result.displayUnits
                ? // New logic for data with displayUnits
                  result.displayUnits.map((unit, index) => {
                    if (unit === '\n') {
                      return <br key={index} />;
                    }
                    const mistakesAtThisIndex = mistakeDetails[index];
                    if (mistakesAtThisIndex) {
                      return (
                        <span
                          key={index}
                          className="text-red-500 underline decoration-wavy cursor-pointer"
                          onMouseMove={(e) => handleMouseOver(e, mistakesAtThisIndex)}
                          onMouseLeave={handleMouseLeave}
                        >
                          {unit}
                        </span>
                      );
                    }
                    return <span key={index}>{unit}</span>;
                  })
                : // Fallback for old data without displayUnits
                  result.typedText &&
                  result.typedText.split('').map((char, index) => {
                    const mistakesAtThisIndex = mistakeDetails[index];
                    if (mistakesAtThisIndex) {
                      return (
                        <span
                          key={index}
                          className="text-red-500 underline decoration-wavy cursor-pointer"
                          onMouseMove={(e) => handleMouseOver(e, mistakesAtThisIndex)}
                          onMouseLeave={handleMouseLeave}
                        >
                          {char}
                        </span>
                      );
                    }
                    return <span key={index}>{char}</span>;
                  })}
            </div>
          </div>
        )}

        {mistypedKeys && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">苦手なキー</h3>
            <OnScreenKeyboard mistypedKeys={mistypedKeys} />
            <div className="flex items-center justify-center mt-2 text-gray-600">
              <span>ミスが少ない</span>
              <div className="w-32 h-4 mx-2 rounded-full bg-gradient-to-r from-red-200 to-red-600"></div>
              <span>ミスが多い</span>
            </div>
          </div>
        )}

      </div>
      <Link href="/" className="mt-8 px-8 py-4 bg-blue-600 text-white text-2xl font-bold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300">
        ホームに戻る
      </Link>
    </div>
  );
};

export default ResultDisplay;
