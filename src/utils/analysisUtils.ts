import { Mistake, TypingResult, KeyLog } from "@/types/typing";
import { getTypingUnits } from "./typingUtils";
import { getRomajiCandidates } from "@/lib/romajiMapData";
import { checkRomajiMatch } from "@/utils/romajiUtils";

// --- Interfaces ---

export interface WeaknessInsight {
  title: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  score: number;
}

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
  insights: WeaknessInsight[]; // インサイトを追加
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
  '左小指', '左薬指', '左中指', '左人差し指', '左親指', '右親指', '右人差し指', '右中指', '右薬指', '右小指'
];

// 難易度重み (小指・薬指は難しいのでミスを少し許容=0.8、人差し指・中指は簡単なのでミスは重い=1.2)
const FINGER_DIFFICULTY_WEIGHTS = [0.8, 0.8, 1.2, 1.2, 1.0, 1.0, 1.2, 1.2, 0.8, 0.8];

// インサイト生成の閾値
const MIN_ATTEMPTS_FOR_INSIGHT = 10;
const INSIGHT_SCORE_THRESHOLD = 5;

// --- Helper Functions ---

// 0-4: Left, 5-9: Right
function getHand(fingerIndex: number): 'Left' | 'Right' {
  return fingerIndex <= 4 ? 'Left' : 'Right';
}

interface SimulationState {
  currentKanaIndex: number;
  inputBuffer: string;
}

function detectCascadingErrors(units: string[], keyHistory: KeyLog[]) {
  let normalState: SimulationState = { currentKanaIndex: 0, inputBuffer: '' };
  let virtualState: SimulationState | null = null;
  
  let cascadeCount = 0;
  let cascadeStartIndex = -1;
  
  const detectedCascades: { startIndex: number, length: number }[] = [];

  for (const log of keyHistory) {
    const key = log.key;
    
    // 1. Normal State Simulation
    let normalHit = false;
    if (normalState.currentKanaIndex < units.length) {
      const currentKana = units[normalState.currentKanaIndex];
      const nextUnit = units[normalState.currentKanaIndex + 1];
      const newBuffer = normalState.inputBuffer + key;
      const match = checkRomajiMatch(currentKana, newBuffer, nextUnit);
      
      if (match.exact) {
        normalHit = true;
        normalState.inputBuffer = ''; // Clear buffer
        normalState.currentKanaIndex++;
      } else if (match.partial) {
        normalHit = true;
        normalState.inputBuffer = newBuffer;
      } else {
        // Miss in normal state: Input buffer reverts (as per game logic)
      }
    }

    // 2. Virtual State Simulation (Lookahead)
    if (virtualState) {
      if (virtualState.currentKanaIndex < units.length) {
        const vKana = units[virtualState.currentKanaIndex];
        const vNext = units[virtualState.currentKanaIndex + 1];
        const vBuffer = virtualState.inputBuffer + key;
        const vMatch = checkRomajiMatch(vKana, vBuffer, vNext);

        if (vMatch.exact) {
          virtualState.inputBuffer = '';
          virtualState.currentKanaIndex++;
          cascadeCount++;
        } else if (vMatch.partial) {
          virtualState.inputBuffer = vBuffer;
          cascadeCount++;
        } else {
          if (cascadeCount >= 2) {
            detectedCascades.push({ startIndex: cascadeStartIndex, length: cascadeCount });
          }
          virtualState = null;
          cascadeCount = 0;
        }
      } else {
        if (cascadeCount >= 2) {
            detectedCascades.push({ startIndex: cascadeStartIndex, length: cascadeCount });
        }
        virtualState = null;
        cascadeCount = 0;
      }
    }

    // 3. Forking Logic
    if (!normalHit && !virtualState) {
      // A. Intra-Unit Skip (e.g. "ko" -> typed "o", skip "k")
      // Assume the user skipped the 1st char of a valid romaji representation.
      const currentKana = units[normalState.currentKanaIndex];
      const nextUnit = units[normalState.currentKanaIndex + 1];
      const candidates = getRomajiCandidates(currentKana);
      
      for (const cand of candidates) {
        if (cand.length >= 2) {
           // Try prepending the first char of this candidate to the typed key
           const skippedChar = cand[0];
           // Check if the typed key matches the expectation *if* we had typed the first char
           // Note: This assumes the typed key is the 2nd char.
           // e.g. cand="ko", key="o". vBuffer="ko". Match!
           // e.g. cand="shi", key="h". vBuffer="sh". Match!
           
           // Optimization: Check if key actually matches 2nd char to avoid false positives?
           // checkRomajiMatch handles fuzzy logic, so relying on it is safer.
           
           const vBuffer = skippedChar + key;
           // We pass normalState.inputBuffer? No, we assume skip happened from *current* buffer state?
           // Usually skip happens from empty buffer state for that char.
           // If normal buffer has "k" and we type "o", that's normal hit.
           // Forking only happens if normal missed. So normal buffer is likely partial mismatch or empty.
           // Let's assume we append to the *skipped* char.
           // Wait, if I typed partial 's' (buffer='s'), then skipped 'h', typed 'i'.
           // Input 'i'. Normal 'si'? Match.
           // If I typed nothing (buffer=''), skipped 'k', typed 'o'.
           // vBuffer = 'k' + 'o' = 'ko'. Match.
           
           // What if buffer has garbage?
           // The simulation clears buffer on exact match.
           // So we assume we are starting fresh or from clean state.
           // Ideally, we use normalState.inputBuffer + skippedChar + key?
           // If I typed 's' (valid), then skipped 'h', typed 'i'.
           // Normal: 'si' -> valid? Yes 'si' is valid for 'し'.
           // So that wouldn't be a miss.
           
           // Conclusion: Only handle case where buffer is empty or irrelevant?
           // Let's stick to: Virtual Buffer = skippedChar + key.
           const fMatch = checkRomajiMatch(currentKana, vBuffer, nextUnit);
           
           if (fMatch.exact || fMatch.partial) {
             virtualState = {
               currentKanaIndex: fMatch.exact ? normalState.currentKanaIndex + 1 : normalState.currentKanaIndex,
               inputBuffer: fMatch.exact ? '' : vBuffer,
             };
             cascadeCount = 1;
             cascadeStartIndex = normalState.currentKanaIndex;
             break; // Found a fork
           }
        }
      }

      // B. Next Unit Skip (Skip entire current kana)
      if (!virtualState) {
        const nextIndex = normalState.currentKanaIndex + 1;
        if (nextIndex < units.length) {
          const fKana = units[nextIndex];
          const fNext = units[nextIndex + 1];
          const fBuffer = key; 
          const fMatch = checkRomajiMatch(fKana, fBuffer, fNext);
          
          if (fMatch.exact || fMatch.partial) {
            virtualState = {
              currentKanaIndex: fMatch.exact ? nextIndex + 1 : nextIndex,
              inputBuffer: fMatch.exact ? '' : fBuffer,
            };
            cascadeCount = 1;
            cascadeStartIndex = normalState.currentKanaIndex;
          }
        }
      }
    }

    // 4. Termination by Normal Success
    if (normalHit && virtualState) {
        virtualState = null;
        cascadeCount = 0;
    }
  }
  
  if (virtualState && cascadeCount >= 2) {
      detectedCascades.push({ startIndex: cascadeStartIndex, length: cascadeCount });
  }

  return detectedCascades;
}

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

export function analyzeWeaknesses(results: TypingResult[]): WeaknessAnalysis {
  const allMistakes = results.flatMap(r => r.mistakes);
  
  const sequenceCounts: { [key: string]: number } = {};
  const missPatternCounts: { [key: string]: number } = {};
  const fingerMissCounts: { [index: number]: number } = {};
  const keyMissCounts: { [key: string]: number } = {};
  
  const transitionCounts: { [key: string]: number } = {};
  const transpositionCounts: { [key: string]: number } = {};

  // For Rate Calculation
  const fingerTotalAttempts: { [index: number]: number } = {};
  const keyTotalAttempts: { [key: string]: number } = {};

  let fatFingerCount = 0;
  let mirrorCount = 0;
  let basicCount = 0;
  let transpositionCount = 0;
  let coordinationCount = 0; // Count of "bad" coordination issues detected in history

  // --- 0. Count Total Attempts (Denominator) - Correct Keystrokes ---
  results.forEach(result => {
    if (!result.keyHistory) return;
    result.keyHistory.forEach(log => {
      if (!log.isMistake) { // Only count correct keystrokes here
        const key = log.key.toLowerCase();
        if (KEY_LAYOUT[key]) {
          keyTotalAttempts[key] = (keyTotalAttempts[key] || 0) + 1;
          const fingerIdx = KEY_LAYOUT[key][2];
          fingerTotalAttempts[fingerIdx] = (fingerTotalAttempts[fingerIdx] || 0) + 1;
        }
      }
    });
  });

  // --- 1. Basic Mistake Analysis ---
  allMistakes.forEach(mistake => {
    const bufferLen = mistake.previousInputBuffer?.length || 0;
    const primaryExpectedPattern = mistake.expected.split('/')[0];
    const expectedKey = primaryExpectedPattern.charAt(bufferLen).toLowerCase(); 
    const precedingKey = bufferLen > 0 ? mistake.previousInputBuffer!.slice(-1) : "Start";
    const actualKey = mistake.typedKey.toLowerCase();

    if (expectedKey && KEY_LAYOUT[expectedKey]) {
        // Add Missed Attempts to Denominator
        keyTotalAttempts[expectedKey] = (keyTotalAttempts[expectedKey] || 0) + 1;
        const expFingerIdx = KEY_LAYOUT[expectedKey][2];
        fingerTotalAttempts[expFingerIdx] = (fingerTotalAttempts[expFingerIdx] || 0) + 1;

        // Sequence
        const sequencePattern = `${precedingKey} -> ${expectedKey}`;
        sequenceCounts[sequencePattern] = (sequenceCounts[sequencePattern] || 0) + 1;

        const missPattern = `${expectedKey} -> ${actualKey}`;
        missPatternCounts[missPattern] = (missPatternCounts[missPattern] || 0) + 1;

        // Stats
        fingerMissCounts[expFingerIdx] = (fingerMissCounts[expFingerIdx] || 0) + 1;
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

  // --- 2. Transposition Analysis (Cascading Lookahead) ---
  results.forEach(result => {
    if (!result.keyHistory || result.keyHistory.length === 0) return;
    
    const units = getTypingUnits(result.text || result.displayText);
    const cascades = detectCascadingErrors(units, result.keyHistory);
    
    cascades.forEach(c => {
        transpositionCount++; // 1 cascade = 1 transposition error unit
        // Record the pattern (Which kana was skipped?)
        if (c.startIndex < units.length) {
            const skippedKana = units[c.startIndex];
            const pattern = `${skippedKana} (早とちり連鎖)`;
            transpositionCounts[pattern] = (transpositionCounts[pattern] || 0) + 1;
        }
        // Adjust basic count: The mistakes involved in this cascade were counted as 'basic' above.
        // We can decrease basicCount if we want strict separation, but optional.
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
      // const prevHand = getHand(prevFinger); // Unused
      // const currHand = getHand(currFinger); // Unused

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

  // --- 4. Insight Generation (Weighted Scoring) ---
  const candidates: { type: string; title: string; description: string; score: number; severity: 'High'|'Medium'|'Low' }[] = [];

  // Finger Insights
  FINGER_NAMES.forEach((name, idx) => {
    const attempts = fingerTotalAttempts[idx] || 0;
    const misses = fingerMissCounts[idx] || 0;
    if (attempts > MIN_ATTEMPTS_FOR_INSIGHT) { // 最低施行回数
        const rate = misses / attempts;
        const weight = FINGER_DIFFICULTY_WEIGHTS[idx];
        const score = rate * weight * 100;
        
        if (score > INSIGHT_SCORE_THRESHOLD) { // 閾値
            candidates.push({
                type: 'finger',
                title: `${name}の精度低下`,
                description: `${name}でのミス率が${(Math.min(rate * 100, 100)).toFixed(1)}%です。${weight > 1 ? '本来打ちやすい指ですが、' : '動きにくい指ですが、'}意識的にトレーニングが必要です。`,
                score: score,
                severity: score > 15 ? 'High' : score > 10 ? 'Medium' : 'Low'
            });
        }
    }
  });

  // Transposition Insight
  if (allMistakes.length > 0) {
      const transRate = transpositionCount / allMistakes.length;
      const transScore = transRate * 2.0 * 100; // Weight 2.0 (Bad habit)
      if (transpositionCount > 2 && transScore > 10) {
          candidates.push({
              type: 'transposition',
              title: '焦りによる順序逆転',
              description: `全体ミスの${(transRate * 100).toFixed(1)}%が「早とちり」によるものです。指が先行しています。`,
              score: transScore,
              severity: transScore > 30 ? 'High' : 'Medium'
          });
      }
  }

  // Coordination Insight
  if (allMistakes.length > 0) {
      const coordRate = coordinationCount / allMistakes.length;
      const coordScore = coordRate * 1.5 * 100; // Weight 1.5 (Efficiency)
      if (coordinationCount > 2 && coordScore > 10) {
          candidates.push({
              type: 'coordination',
              title: '同指連打の弱点',
              description: `全体ミスの${(coordRate * 100).toFixed(1)}%が「同じ指での連続打鍵」で発生しています。`,
              score: coordScore,
              severity: coordScore > 20 ? 'High' : 'Medium'
          });
      }
  }

  // Sort and Pick Top 3
  const insights = candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(c => ({
        title: c.title,
        description: c.description,
        severity: c.severity,
        score: c.score
    }));

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
    insights, // 追加
  };
}
