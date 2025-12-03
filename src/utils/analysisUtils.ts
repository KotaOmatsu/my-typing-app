import { Mistake } from "@/types/typing";

export interface WeaknessAnalysis {
  totalMistakes: number;
  missedKeys: { key: string; count: number }[]; // 正解だったはずのキー（打てなかったキー）
  accidentalKeys: { key: string; count: number }[]; // 間違って押してしまったキー
  worstFinger: string;
  sequenceWeaknesses: { pattern: string; count: number }[]; // 例: "K" のあとの "U"
  missPatterns: { pattern: string; count: number }[]; // 例: "r -> e" (rを打つべきところでeを打った)
}

const FINGER_MAP: { [key: string]: string } = {
  '1': '左小', 'q': '左小', 'a': '左小', 'z': '左小',
  '2': '左薬', 'w': '左薬', 's': '左薬', 'x': '左薬',
  '3': '左中', 'e': '左中', 'd': '左中', 'c': '左中',
  '4': '左人', 'r': '左人', 'f': '左人', 'v': '左人',
  '5': '左人', 't': '左人', 'g': '左人', 'b': '左人',
  '6': '右人', 'y': '右人', 'h': '右人', 'n': '右人',
  '7': '右人', 'u': '右人', 'j': '右人', 'm': '右人',
  '8': '右中', 'i': '右中', 'k': '右中', ',': '右中',
  '9': '右薬', 'o': '右薬', 'l': '右薬', '.': '右薬',
  '0': '右小', 'p': '右小', ';': '右小', '/': '右小',
  '-': '右小', '[': '右小', "'": '右小', ']': '右小',
};

export function analyzeWeaknesses(mistakes: Mistake[]): WeaknessAnalysis {
  const missedKeyCounts: { [key: string]: number } = {};
  const accidentalKeyCounts: { [key: string]: number } = {};
  const fingerCounts: { [key: string]: number } = {};
  const sequenceCounts: { [key: string]: number } = {};
  const patternCounts: { [key: string]: number } = {};

  mistakes.forEach(mistake => {
    // 1. Extract Expected Key
    // mistake.expected may contain multiple patterns e.g., "ka/ca"
    // We need to find the next char based on previousInputBuffer
    // Since inputBuffer is valid prefix, we look at index = previousInputBuffer.length
    // If multiple patterns, we might have multiple valid next chars.
    // However, usually we just want the primary one or we collect all possible valid next chars.
    // For simplicity, let's take the first pattern's next char, or assume the user was aiming for the most standard one.
    // Better: The game usually prioritizes one, but allows others.
    // If previousInputBuffer is "k", and expected is "ka/ca", the next char could be "a".
    // If previousInputBuffer is "", next could be "k" or "c".
    // Let's assume the first candidate in `expected` is the standard one the user likely aimed for.
    
    const bufferLen = mistake.previousInputBuffer?.length || 0;
    const primaryExpectedPattern = mistake.expected.split('/')[0];
    const expectedKey = primaryExpectedPattern.charAt(bufferLen); // This is the key they SHOULD have typed

    // 2. Extract Preceding Key
    const precedingKey = bufferLen > 0 ? mistake.previousInputBuffer!.slice(-1) : "Start";

    // 3. Extract Actual Key
    const actualKey = mistake.typedKey;

    if (expectedKey) {
        missedKeyCounts[expectedKey] = (missedKeyCounts[expectedKey] || 0) + 1;
        
        // Finger analysis based on what they SHOULD have typed (Missed Key)
        // Or finger analysis based on what they DID type (Accidental Key)?
        // Usually "weak finger" means "I can't control this finger well" (Accidental)
        // OR "I can't move this finger to the right place" (Missed).
        // Let's count Missed Keys for "Worst Finger" as "Hard to press".
        const finger = FINGER_MAP[expectedKey.toLowerCase()];
        if (finger) {
            fingerCounts[finger] = (fingerCounts[finger] || 0) + 1;
        }

        // Sequence Weakness: "After [Preceding], I missed [Expected]"
        const sequencePattern = `${precedingKey} -> ${expectedKey}`;
        sequenceCounts[sequencePattern] = (sequenceCounts[sequencePattern] || 0) + 1;

        // Miss Pattern: "Expected [Expected] but typed [Actual]"
        const missPattern = `${expectedKey} -> ${actualKey}`;
        patternCounts[missPattern] = (patternCounts[missPattern] || 0) + 1;
    }

    // Accidental Key (What they typed)
    accidentalKeyCounts[actualKey] = (accidentalKeyCounts[actualKey] || 0) + 1;
  });

  // Helper to sort and slice
  const getTop = (counts: { [key: string]: number }, limit: number = 5) => 
    Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([key, count]) => ({ key, count, pattern: key })); // mapping key/pattern interchangeably

  return {
    totalMistakes: mistakes.length,
    missedKeys: getTop(missedKeyCounts),
    accidentalKeys: getTop(accidentalKeyCounts),
    worstFinger: Object.entries(fingerCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "なし",
    sequenceWeaknesses: getTop(sequenceCounts),
    missPatterns: getTop(patternCounts),
  };
}
