import { Mistake, TypingResult, KeyLog } from "@/types/typing";
import { getTypingUnits } from "./typingUtils";
import { getRomajiCandidates } from "@/lib/romajiMapData";

// --- Interfaces ---

export interface FingerScore {
  finger: string;
  score: number; // 0 (perfect) to 100 (bad)
  missCount: number;
}

export interface KeyScore {
  key: string;
  score: number; // 0 to 100
  missCount: number;
}

export interface MissCategory {
  type: 'FatFinger' | 'Mirror' | 'Basic' | 'Transposition' | 'Coordination';
  count: number;
  label: string;
  description: string;
}

export interface WeaknessAnalysis {
  totalMistakes: number;
  fingerScores: FingerScore[];
  keyScores: KeyScore[];
  missCategories: MissCategory[];
  sequenceWeaknesses: { pattern: string; count: number }[];
  missPatterns: { pattern: string; count: number }[];
  worstFinger: string;
  // 新機能用
  fingerTransitionWeaknesses: { pattern: string; count: number }[];
  transpositionErrorCount: number;
  transpositionErrorRate: number;
  specificTranspositions: { pattern: string; count: number }[];
}

// --- Constants & Data ---

const KEY_LAYOUT: { [key: string]: [number, number, number] } = {
  '1': [0, 0, 0], '2': [0, 1, 1], '3': [0, 2, 2], '4': [0, 3, 3], '5': [0, 4, 3],
  '6': [0, 5, 6], '7': [0, 6, 6], '8': [0, 7, 7], '9': [0, 8, 8], '0': [0, 9, 9],
  'q': [1, 0, 0], 'w': [1, 1, 1], 'e': [1, 2, 2], 'r': [1, 3, 3], 't': [1, 4, 3],
  'y': [1, 5, 6], 'u': [1, 6, 6], 'i': [1, 7, 7], 'o': [1, 8, 8], 'p': [1, 9, 9],
  'a': [2, 0, 0], 's': [2, 1, 1], 'd': [2, 2, 2], 'f': [2, 3, 3], 'g': [2, 4, 3],
  'h': [2, 5, 6], 'j': [2, 6, 6], 'k': [2, 7, 7], 'l': [2, 8, 8], ';': [2, 9, 9],
  'z': [3, 0, 0], 'x': [3, 1, 1], 'c': [3, 2, 2], 'v': [3, 3, 3], 'b': [3, 4, 3],
  'n': [3, 5, 6], 'm': [3, 6, 6], ',': [3, 7, 7], '.': [3, 8, 8], '/': [3, 9, 9],
  '-': [0, 10, 9], // Hyphen (Right Pinky)
};

const FINGER_NAMES = [
  '左小', '左薬', '左中', '左人', '左親', '右親', '右人', '右中', '右薬', '右小'
];

// --- Helper Functions ---

function getDistance(key1: string, key2: string): number {
  const p1 = KEY_LAYOUT[key1];
  const p2 = KEY_LAYOUT[key2];
  if (!p1 || !p2) return 999;
  return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]);
}

function isMirrorKey(key1: string, key2: string): boolean {
  const p1 = KEY_LAYOUT[key1];
  const p2 = KEY_LAYOUT[key2];
  if (!p1 || !p2) return false;
  return (p1[2] + p2[2] === 9) && (p1[0] === p2[0]);
}

// 0-4: Left, 5-9: Right
function getHand(fingerIndex: number): 'Left' | 'Right' {
  return fingerIndex <= 4 ? 'Left' : 'Right';
}

export function analyzeWeaknesses(results: TypingResult[]): WeaknessAnalysis {
  const allMistakes = results.flatMap(r => r.mistakes);
  
  const sequenceCounts: { [key: string]: number } = {};
  const missPatternCounts: { [key: string]: number } = {};
  const fingerMissCounts: { [index: number]: number } = {};
  const keyMissCounts: { [key: string]: number } = {};
  
  const transitionCounts: { [key: string]: number } = {};
  const transpositionCounts: { [key: string]: number } = {};

  let fatFingerCount = 0;
  let mirrorCount = 0;
  let basicCount = 0;
  let transpositionCount = 0;
  let coordinationCount = 0; // Count of "bad" coordination issues detected in history

  // --- 1. Basic Mistake Analysis ---
  allMistakes.forEach(mistake => {
    const bufferLen = mistake.previousInputBuffer?.length || 0;
    const primaryExpectedPattern = mistake.expected.split('/')[0];
    const expectedKey = primaryExpectedPattern.charAt(bufferLen).toLowerCase(); 
    const precedingKey = bufferLen > 0 ? mistake.previousInputBuffer!.slice(-1) : "Start";
    const actualKey = mistake.typedKey.toLowerCase();

    if (expectedKey && KEY_LAYOUT[expectedKey]) {
        // Sequence
        const sequencePattern = `${precedingKey} -> ${expectedKey}`;
        sequenceCounts[sequencePattern] = (sequenceCounts[sequencePattern] || 0) + 1;

        const missPattern = `${expectedKey} -> ${actualKey}`;
        missPatternCounts[missPattern] = (missPatternCounts[missPattern] || 0) + 1;

        // Stats
        const fingerIdx = KEY_LAYOUT[expectedKey][2];
        fingerMissCounts[fingerIdx] = (fingerMissCounts[fingerIdx] || 0) + 1;
        keyMissCounts[expectedKey] = (keyMissCounts[expectedKey] || 0) + 1;

        // Classification
        if (getDistance(expectedKey, actualKey) === 1) {
            fatFingerCount++;
        } else if (isMirrorKey(expectedKey, actualKey)) {
            mirrorCount++;
        } else {
            basicCount++;
        }
    }
  });

  // --- 2. Transposition Analysis (Lookahead) ---
  results.forEach(result => {
    if (!result.mistakes || result.mistakes.length === 0) return;
    
    // テキストをパースして期待される読み（ローマ字）のシーケンスを構築するのはコストが高いので
    // 簡易的に、現在のkanaIndexの「次」のkanaのローマ字を取得して比較する
    const units = getTypingUnits(result.text || result.displayText); // displayTextからユニット生成
    
    result.mistakes.forEach(mistake => {
        const currentKanaIndex = mistake.kanaIndex;
        // 次の文字が存在するか
        if (currentKanaIndex + 1 < units.length) {
            const nextKana = units[currentKanaIndex + 1];
            const nextRomajiCandidates = getRomajiCandidates(nextKana);
            
            // 入力されたキーが、次の文字のローマ字の1文字目と一致するか？
            // 例: tamago -> 't', 'a', 'm', 'a', 'g', 'o'
            // expected: 'a' (index 3), typed: 'g' (index 4's start)
            const typedKey = mistake.typedKey.toLowerCase();
            const isLookahead = nextRomajiCandidates.some(romaji => romaji.toLowerCase().startsWith(typedKey));
            
            if (isLookahead) {
                transpositionCount++;
                const pattern = `${units[currentKanaIndex]}(${mistake.expected.charAt(0)}) -> ${nextKana}(${typedKey})`;
                transpositionCounts[pattern] = (transpositionCounts[pattern] || 0) + 1;
                basicCount--; // Reclassify from Basic to Transposition (adjust count)
            }
        }
    });
  });

  // --- 3. Finger Coordination Analysis (Key History) ---
  results.forEach(result => {
    if (!result.keyHistory || result.keyHistory.length < 2) return;

    for (let i = 1; i < result.keyHistory.length; i++) {
      const prevLog = result.keyHistory[i - 1];
      const currLog = result.keyHistory[i];
      
      const prevKey = prevLog.key.toLowerCase();
      const currKey = currLog.key.toLowerCase();

      if (!KEY_LAYOUT[prevKey] || !KEY_LAYOUT[currKey]) continue;

      const prevFinger = KEY_LAYOUT[prevKey][2];
      const currFinger = KEY_LAYOUT[currKey][2];
      const prevHand = getHand(prevFinger);
      const currHand = getHand(currFinger);

      // Bad Coordination: Same Finger, Different Key (Slide/Jump)
      if (prevFinger === currFinger && prevKey !== currKey) {
        const pattern = `${FINGER_NAMES[prevFinger]}連打 (${prevKey}→${currKey})`;
        transitionCounts[pattern] = (transitionCounts[pattern] || 0) + 1;
        
        // If this transition resulted in a mistake (currLog.isMistake), count it heavily?
        // Ideally we count usage frequency vs error frequency.
        // For now, let's just identify "frequent awkward transitions".
        // Or "Transitions that led to mistakes".
        if (currLog.isMistake) {
             coordinationCount++;
        }
      }
    }
  });

  // --- Aggregation Helper ---
  const getTop = (counts: { [key: string]: number }, limit: number = 5) => 
    Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([key, count]) => ({ pattern: key, count }));

  // Normalize Scores
  const maxFingerMiss = Math.max(...Object.values(fingerMissCounts), 1);
  const fingerScores: FingerScore[] = FINGER_NAMES.map((name, idx) => ({
      finger: name,
      missCount: fingerMissCounts[idx] || 0,
      score: Math.round(((fingerMissCounts[idx] || 0) / maxFingerMiss) * 100)
  }));

  const maxKeyMiss = Math.max(...Object.values(keyMissCounts), 1);
  const keyScores: KeyScore[] = Object.entries(keyMissCounts).map(([key, count]) => ({
      key,
      missCount: count,
      score: Math.round((count / maxKeyMiss) * 100)
  }));

  const missCategories: MissCategory[] = [
      { type: 'FatFinger' as const, count: fatFingerCount, label: '隣接キー誤打', description: '打つべきキーの隣を誤って打鍵しています。指の横移動がスムーズでないか、ホームポジションの意識が低い可能性があります。' },
      { type: 'Mirror' as const, count: mirrorCount, label: '逆手誤打', description: '左右対称の位置にあるキーを間違えています。脳内でキー配置が混乱している可能性があります。' },
      { type: 'Transposition' as const, count: transpositionCount, label: '順序逆転 (早とちり)', description: '「tamago」を「tamaog」と打つような、次の文字を先に打ってしまうミスです。指が走りすぎています。少しリズムを落としてみましょう。' },
      { type: 'Coordination' as const, count: coordinationCount, label: '運指の連動性', description: '同じ指での連続打鍵など、物理的に打ちにくい動きでミスが発生しています。手首を柔軟に使うか、打鍵リズムを調整しましょう。' },
      { type: 'Basic' as const, count: Math.max(0, basicCount), label: 'その他', description: '特定の傾向がないミスです。基礎的な精度を高めましょう。' },
  ].sort((a, b) => b.count - a.count);

  const worstFinger = [...fingerScores].sort((a, b) => b.missCount - a.missCount)[0].finger;

  return {
    totalMistakes: allMistakes.length,
    sequenceWeaknesses: getTop(sequenceCounts),
    missPatterns: getTop(missPatternCounts),
    fingerScores,
    keyScores,
    missCategories,
    worstFinger,
    fingerTransitionWeaknesses: getTop(transitionCounts),
    transpositionErrorCount: transpositionCount,
    transpositionErrorRate: allMistakes.length > 0 ? (transpositionCount / allMistakes.length) * 100 : 0,
    specificTranspositions: getTop(transpositionCounts),
  };
}
