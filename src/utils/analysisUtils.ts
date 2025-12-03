import { Mistake } from "@/types/typing";

// --- Interfaces ---

export interface FingerScore {
  finger: string;
  score: number; // 0 (perfect) to 100 (bad) based on miss rate relative to total strokes (approx)
  missCount: number;
}

export interface KeyScore {
  key: string;
  score: number; // 0 to 100 heatmap intensity
  missCount: number;
}

export interface MissCategory {
  type: 'FatFinger' | 'Mirror' | 'Basic';
  count: number;
  label: string;
  description: string;
}

export interface WeaknessAnalysis {
  totalMistakes: number;
  fingerScores: FingerScore[];
  keyScores: KeyScore[];
  missCategories: MissCategory[];
  missedKeys: { key: string; count: number }[];
  accidentalKeys: { key: string; count: number }[];
  sequenceWeaknesses: { pattern: string; count: number }[];
  worstFinger: string; // For summary
}

// --- Constants & Data ---

// Simple layout map for distance/finger calc. 
// Format: [row, col, finger_index (0=L-Pinky, 9=R-Pinky)]
// Row 0=Number, 1=Top(Q), 2=Home(A), 3=Bottom(Z)
const KEY_LAYOUT: { [key: string]: [number, number, number] } = {
  '1': [0, 0, 0], '2': [0, 1, 1], '3': [0, 2, 2], '4': [0, 3, 3], '5': [0, 4, 3],
  '6': [0, 5, 6], '7': [0, 6, 6], '8': [0, 7, 7], '9': [0, 8, 8], '0': [0, 9, 9],
  'q': [1, 0, 0], 'w': [1, 1, 1], 'e': [1, 2, 2], 'r': [1, 3, 3], 't': [1, 4, 3],
  'y': [1, 5, 6], 'u': [1, 6, 6], 'i': [1, 7, 7], 'o': [1, 8, 8], 'p': [1, 9, 9],
  'a': [2, 0, 0], 's': [2, 1, 1], 'd': [2, 2, 2], 'f': [2, 3, 3], 'g': [2, 4, 3],
  'h': [2, 5, 6], 'j': [2, 6, 6], 'k': [2, 7, 7], 'l': [2, 8, 8], ';': [2, 9, 9],
  'z': [3, 0, 0], 'x': [3, 1, 1], 'c': [3, 2, 2], 'v': [3, 3, 3], 'b': [3, 4, 3],
  'n': [3, 5, 6], 'm': [3, 6, 6], ',': [3, 7, 7], '.': [3, 8, 8], '/': [3, 9, 9],
};

const FINGER_NAMES = [
  '左小', '左薬', '左中', '左人', '左親', '右親', '右人', '右中', '右薬', '右小'
];

// --- Helper Functions ---

// Manhattan distance on keyboard grid
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
  // Check if fingers are symmetric (e.g. 0 and 9, 1 and 8)
  // Left hand fingers are 0-4, Right are 5-9. (Skipping thumbs 4,5 for simple mapping logic above? No, layout has 0-9 index mapped to fingers)
  // Let's use the finger index from KEY_LAYOUT.
  // Standard map: L-Pinky=0, R-Pinky=9. Sum is 9.
  // L-Ring=1, R-Ring=8. Sum is 9.
  return (p1[2] + p2[2] === 9) && (p1[0] === p2[0]); // Same row, symmetric finger
}

export function analyzeWeaknesses(mistakes: Mistake[]): WeaknessAnalysis {
  const missedKeyCounts: { [key: string]: number } = {};
  const accidentalKeyCounts: { [key: string]: number } = {};
  const sequenceCounts: { [key: string]: number } = {};
  
  const fingerMissCounts: { [index: number]: number } = {};
  const keyMissCounts: { [key: string]: number } = {}; // For heatmap (based on expected key)

  let fatFingerCount = 0;
  let mirrorCount = 0;
  let basicCount = 0;

  mistakes.forEach(mistake => {
    const bufferLen = mistake.previousInputBuffer?.length || 0;
    const primaryExpectedPattern = mistake.expected.split('/')[0];
    const expectedKey = primaryExpectedPattern.charAt(bufferLen).toLowerCase(); 
    const precedingKey = bufferLen > 0 ? mistake.previousInputBuffer!.slice(-1) : "Start";
    const actualKey = mistake.typedKey.toLowerCase();

    if (expectedKey && KEY_LAYOUT[expectedKey]) {
        // 1. Counts
        missedKeyCounts[expectedKey] = (missedKeyCounts[expectedKey] || 0) + 1;
        accidentalKeyCounts[actualKey] = (accidentalKeyCounts[actualKey] || 0) + 1;
        
        const sequencePattern = `${precedingKey} -> ${expectedKey}`;
        sequenceCounts[sequencePattern] = (sequenceCounts[sequencePattern] || 0) + 1;

        // 2. Finger & Key Scores (Based on Missed Key - "Hard to hit")
        const fingerIdx = KEY_LAYOUT[expectedKey][2];
        fingerMissCounts[fingerIdx] = (fingerMissCounts[fingerIdx] || 0) + 1;
        keyMissCounts[expectedKey] = (keyMissCounts[expectedKey] || 0) + 1;

        // 3. Classification
        if (getDistance(expectedKey, actualKey) === 1) {
            fatFingerCount++;
        } else if (isMirrorKey(expectedKey, actualKey)) {
            mirrorCount++;
        } else {
            basicCount++;
        }
    }
  });

  // --- Aggregation ---

  // Helper to sort and slice
  const getTop = (counts: { [key: string]: number }, limit: number = 5) => 
    Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([key, count]) => ({ key, count }));

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
      { type: 'FatFinger', count: fatFingerCount, label: '隣接キー誤打', description: '隣のキーを打っています。指の位置を確認しましょう。' },
      { type: 'Mirror', count: mirrorCount, label: '逆手誤打', description: '左右対称の指で打っています。脳内マップを整理しましょう。' },
      { type: 'Basic', count: basicCount, label: 'その他', description: '基本的なキー配置の練習が必要です。' },
  ].sort((a, b) => b.count - a.count);

  const worstFinger = fingerScores.sort((a, b) => b.missCount - a.missCount)[0].finger;

  return {
    totalMistakes: mistakes.length,
    missedKeys: getTop(missedKeyCounts),
    accidentalKeys: getTop(accidentalKeyCounts),
    sequenceWeaknesses: getTop(sequenceCounts),
    fingerScores,
    keyScores,
    missCategories,
    worstFinger
  };
}
