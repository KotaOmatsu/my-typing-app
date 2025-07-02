'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getRomajiCandidates, useKanaRomajiMap } from './KanaRomajiMap';
import OnScreenKeyboard from './OnScreenKeyboard'; // OnScreenKeyboardをインポート

const TYPING_TEXTS = [
  "わがはいはねこである。なまえはまだない。",
  "どこでうまれたかとんとけんとうがつかぬ。",
  "なんでもうすぐらいじめじめしたところでにゃーにゃーないていたことだけはきおくしている。",
  "せんせいはえらい。",
  "なつめそうせき",
];

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

// Helper function to break down text into typing units (handling 拗音 and 促音)
const getTypingUnits = (text: string): string[] => {
  const units: string[] = [];
  let i = 0;
  while (i < text.length) {
    let currentUnit = text[i];
    let foundUnit = false;

    // Try to form a two-character unit first (e.g., 拗音, 促音)
    if (i + 1 < text.length) {
      const potentialTwoCharUnit = text.substring(i, i + 2);
      if (getRomajiCandidates(potentialTwoCharUnit).length > 0) {
        currentUnit = potentialTwoCharUnit;
        units.push(currentUnit);
        i += 2;
        foundUnit = true;
      }
    }

    // If no two-character unit found, try a single character unit
    if (!foundUnit) {
      if (getRomajiCandidates(currentUnit).length > 0) {
        units.push(currentUnit);
      } else {
        // If it's not a kana with romaji candidates (e.g., punctuation, space), add as is
        units.push(currentUnit);
      }
      i++;
    }
  }
  return units;
};

const TypingGame: React.FC = () => {
  const router = useRouter();
  const isMapLoaded = useKanaRomajiMap();

  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [typingUnits, setTypingUnits] = useState<string[]>([]);
  const [currentKanaIndex, setCurrentKanaIndex] = useState(0);
  const [inputBuffer, setInputBuffer] = useState('');
  const [error, setError] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0); // 総打鍵数
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0); // 正解打鍵数
  const [correctKanaUnits, setCorrectKanaUnits] = useState(0); // 正解仮名数
  const [mistakes, setMistakes] = useState<{ char: string; expected: string; actual: string; typedKey: string }[]>([]);
  const [isGameStarted, setIsGameStarted] = useState(false); // ゲーム開始状態
  const [flashCorrect, setFlashCorrect] = useState(false); // 正解時のフラッシュ
  const [lastTypedKey, setLastTypedKey] = useState<string | null>(null); // 最後に打たれたキー

  useEffect(() => {
    if (isMapLoaded) {
      setTypingUnits(getTypingUnits(TYPING_TEXTS[currentTextIndex]));
      if (startTime === null) {
        setStartTime(Date.now());
        setIsGameStarted(true); // マップロード後、すぐにゲームを開始状態にする
      }
    }
  }, [isMapLoaded, currentTextIndex, startTime]);

  const currentKana = typingUnits[currentKanaIndex];

  const calculateResult = useCallback(() => {
    const endTime = Date.now();
    const durationSeconds = (endTime - (startTime || endTime)) / 1000;
    const accuracy = (correctKeystrokes / totalKeystrokes) * 100; // 正解打鍵数 / 総打鍵数
    const wpm = (correctKanaUnits / 5) / (durationSeconds / 60); // 正解仮名数 / 5文字/ワード

    const result: TypingResult = {
      accuracy: isNaN(accuracy) ? 0 : accuracy,
      wpm: isNaN(wpm) ? 0 : wpm,
      mistakes,
      startTime: startTime || 0,
      endTime,
      totalKeystrokes,
      correctKeystrokes,
      correctKanaUnits,
    };
    localStorage.setItem('typingResult', JSON.stringify(result));
    router.push('/result');
  }, [correctKeystrokes, correctKanaUnits, mistakes, router, startTime, totalKeystrokes]);

  const checkRomajiMatch = useCallback((kana: string, buffer: string, nextTypingUnit?: string): { exact: boolean; partial: boolean; } => {
    let possibleRomajiCandidates: string[] = [];

    if (kana === 'っ') {
        possibleRomajiCandidates = [...getRomajiCandidates(kana)];
        if (nextTypingUnit) {
            const nextKanaRomajiCandidates = getRomajiCandidates(nextTypingUnit);
            if (nextKanaRomajiCandidates.length > 0) {
                const firstCharOfNextRomaji = nextKanaRomajiCandidates[0]?.[0];
                if (firstCharOfNextRomaji) {
                    possibleRomajiCandidates.push(firstCharOfNextRomaji + firstCharOfNextRomaji);
                }
            }
        }
    } else if (kana === 'ん') {
        if (nextTypingUnit && 'あいうえおやゆよ'.includes(nextTypingUnit)) {
            possibleRomajiCandidates = ['nn', "n'"];
        } else {
            possibleRomajiCandidates = ['n', 'nn', "n'"];
        }
    } else {
        possibleRomajiCandidates = getRomajiCandidates(kana);
    }

    let exact = false;
    let partial = false;

    for (const candidate of possibleRomajiCandidates) {
        if (candidate === buffer) {
            exact = true;
            break; // Found an exact match
        }
        if (candidate.startsWith(buffer)) {
            partial = true; // Found a partial match
        }
    }

    if (exact) {
        partial = false;
    }

    return { exact, partial };
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isMapLoaded || !isGameStarted) return; // マップがロードされていない、またはゲームが開始されていない場合は処理しない

    if (e.key === 'Escape') {
      router.push('/'); // Escキーでスタート画面に戻る
      return;
    }

    const typedChar = e.key;
    setLastTypedKey(typedChar); // 最後に打たれたキーを更新

    // タイピングに必要なキーのみを処理
    const isTypingKey = /^[a-zA-Z]$/.test(typedChar) || [
      '-', ',', '.', '/', '?', '!', '(', ')', '[', ']', ':', ';'
    ].includes(typedChar);

    if (!isTypingKey) {
      return; // タイピングに関係ないキーは無視
    }

    e.preventDefault(); // ブラウザのデフォルト動作（スペースキーでのスクロールなど）を防止

    const newBuffer = inputBuffer + typedChar;
    setInputBuffer(newBuffer);
    setTotalKeystrokes(prev => prev + 1); // 総打鍵数をインクリメント

    const { exact: isExactMatch, partial: isPartialMatch } = checkRomajiMatch(currentKana, newBuffer, typingUnits[currentKanaIndex + 1]);

    if (isExactMatch) {
      setCorrectKeystrokes(prev => prev + newBuffer.length); // 正解打鍵数をインクリメント
      setCorrectKanaUnits(prev => prev + 1); // 正解仮名数をインクリメント
      setError(false);
      setInputBuffer(''); // 即座にクリア
      setFlashCorrect(true); // フラッシュ開始
      setTimeout(() => setFlashCorrect(false), 200); // 200ms後にフラッシュ終了

      if (currentKanaIndex < typingUnits.length - 1) { // Use typingUnits.length
        setCurrentKanaIndex(prev => prev + 1);
      } else {
        if (currentTextIndex < TYPING_TEXTS.length - 1) {
          setCurrentTextIndex(prev => prev + 1);
          setCurrentKanaIndex(0);
        } else {
          calculateResult();
        }
      }
    } else if (!isPartialMatch) {
      setError(true);
      const expectedRomajiForError = currentKana === 'っ' ? '次の子音' : getRomajiCandidates(currentKana).join('/');
      setMistakes(prev => [...prev, { char: currentKana, expected: expectedRomajiForError, actual: newBuffer, typedKey: typedChar }]);
      setInputBuffer(''); // エラー時はバッファをクリア
    }
  }, [calculateResult, checkRomajiMatch, currentKana, currentKanaIndex, currentTextIndex, inputBuffer, isMapLoaded, mistakes, router, isGameStarted, typingUnits]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const renderText = () => {
    return typingUnits.map((unit, index) => { // Use typingUnits for rendering
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