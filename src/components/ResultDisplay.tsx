'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OnScreenKeyboard from './OnScreenKeyboard';

interface TypingResult {
  accuracy: number;
  wpm: number;
  mistakes: { char: string; expected: string; actual: string; typedKey: string }[];
  startTime: number;
  endTime: number;
  totalKeystrokes: number; // 総打鍵数
  correctKeystrokes: number; // 正解打鍵数
  correctKanaUnits: number; // 正解仮名数
}

interface MistakeAnalysis {
  [char: string]: {
    count: number;
    patterns: { [pattern: string]: number };
  };
}

interface MistypedKeys {
  [key: string]: number;
}

const analyzeMistakes = (mistakes: TypingResult['mistakes']): MistakeAnalysis => {
  const analysis: MistakeAnalysis = {};

  mistakes.forEach(mistake => {
    const { char, expected, actual } = mistake;
    if (!analysis[char]) {
      analysis[char] = { count: 0, patterns: {} };
    }
    analysis[char].count++;

    const pattern = `${expected} -> ${actual}`;
    if (!analysis[char].patterns[pattern]) {
      analysis[char].patterns[pattern] = 0;
    }
    analysis[char].patterns[pattern]++;
  });

  return analysis;
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
  const [mistakeAnalysis, setMistakeAnalysis] = useState<MistakeAnalysis | null>(null);
  const [mistypedKeys, setMistypedKeys] = useState<MistypedKeys | null>(null);

  useEffect(() => {
    const storedResult = localStorage.getItem('typingResult');
    if (storedResult) {
      const parsedResult: TypingResult = JSON.parse(storedResult);
      setResult(parsedResult);
      setMistakeAnalysis(analyzeMistakes(parsedResult.mistakes));
      setMistypedKeys(analyzeMistypedKeys(parsedResult.mistakes));
    }
  }, []);

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
      <div className="mb-8 p-8 bg-white rounded-lg shadow-lg min-w-[800px]">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">タイピング結果</h2>
        <p className="text-xl text-gray-700 mb-2">正確性: {accuracyPercentage}%</p>
        <p className="text-xl text-gray-700 mb-2">タイピング速度 (WPM): {wpm}</p>
        <p className="text-xl text-gray-700 mb-4">総打鍵数: {result.totalKeystrokes} (正解打鍵数: {result.correctKeystrokes})</p>

        {mistypedKeys && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">苦手なキー</h3>
            <OnScreenKeyboard mistypedKeys={mistypedKeys} />
          </div>
        )}

        {result.mistakes.length > 0 && (
          <div className="mt-6">
            <h3 className="text-2xl font-bold text-red-600 mb-3">ミスタイプ箇所一覧</h3>
            <ul className="list-disc list-inside text-left max-h-60 overflow-y-auto">
              {result.mistakes.map((mistake, index) => (
                <li key={index} className="text-lg text-gray-800">
                  <span className="font-semibold">文字:</span> {mistake.char}, <span className="font-semibold">期待されるローマ字:</span> {mistake.expected}, <span className="font-semibold">実際の入力:</span> {mistake.actual}
                </li>
              ))}
            </ul>
          </div>
        )}

        {mistakeAnalysis && Object.keys(mistakeAnalysis).length > 0 && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">ミス傾向分析</h3>
            {Object.entries(mistakeAnalysis).map(([char, data]) => (
              <div key={char} className="mb-4 p-3 border rounded-lg bg-gray-50">
                <p className="text-lg font-semibold">「{char}」でのミス: {data.count}回</p>
                <ul className="list-disc list-inside ml-4 text-base">
                  {Object.entries(data.patterns).map(([pattern, count]) => (
                    <li key={pattern}>「{pattern}」パターン: {count}回</li>
                  ))}
                </ul>
              </div>
            ))}
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