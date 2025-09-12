'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OnScreenKeyboard from './OnScreenKeyboard';

interface TypingResult {
  accuracy: number;
  wpm: number;
  mistakes: { char: string; expected: string; actual: string; typedKey: string; kanaIndex: number }[];
  startTime: number;
  endTime: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  correctKanaUnits: number;
  typedText: string;
  displayUnits: string[];
}

interface MistakeDetails {
  [index: number]: { 
    char: string;
    expected: string;
    actual: string; 
  }[];
}

interface MistypedKeys {
  [key: string]: number;
}

const createMistakeDetails = (mistakes: TypingResult['mistakes']): MistakeDetails => {
  const details: MistakeDetails = {};
  mistakes.forEach(mistake => {
    if (!details[mistake.kanaIndex]) {
      details[mistake.kanaIndex] = [];
    }
    details[mistake.kanaIndex].push({
      char: mistake.char,
      expected: mistake.expected,
      actual: mistake.actual 
    });
  });
  return details;
};

const analyzeMistypedKeys = (mistakes: TypingResult['mistakes']): MistypedKeys => {
  const analysis: MistypedKeys = {};
  mistakes.forEach(mistake => {
    const key = mistake.typedKey.toLowerCase();
    if (!analysis[key]) {
      analysis[key] = 0;
    }
    analysis[key]++;
  });
  return analysis;
};

const ResultDisplay: React.FC = () => {
  const [result, setResult] = useState<TypingResult | null>(null);
  const [mistakeDetails, setMistakeDetails] = useState<MistakeDetails | null>(null);
  const [mistypedKeys, setMistypedKeys] = useState<MistypedKeys | null>(null);
  const [tooltip, setTooltip] = useState<{ content: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const storedResult = localStorage.getItem('typingResult');
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
        <p className="text-xl text-gray-700 mb-2">正確性: {accuracyPercentage}%</p>
        <p className="text-xl text-gray-700 mb-2">タイピング速度 (WPM): {wpm}</p>
        <p className="text-xl text-gray-700 mb-4">総打鍵数: {result.totalKeystrokes} (正解打鍵数: {result.correctKeystrokes})</p>

        {result.typedText && mistakeDetails && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">文章内のミス</h3>
            <div className="text-2xl leading-relaxed p-4 border rounded-lg bg-gray-50">
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
      <Link href="/" className="px-8 py-4 bg-blue-600 text-white text-2xl font-bold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300">
        スタート画面に戻る
      </Link>
    </div>
  );
};

export default ResultDisplay;
