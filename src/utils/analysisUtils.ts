import { Mistake } from "@/types/typing";

export interface WeaknessAnalysis {
  totalMistakes: number;
  worstKeys: { key: string; count: number }[];
  worstFinger: string;
  missPatterns: { pattern: string; count: number }[]; // e.g., "r -> e" (intended 'r', typed 'e')
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
  const keyCounts: { [key: string]: number } = {};
  const fingerCounts: { [key: string]: number } = {};
  const patternCounts: { [key: string]: number } = {};

  mistakes.forEach(mistake => {
    // Count mistyped expected keys (what they SHOULD have typed)
    // Or count the key they actually typed?
    // Usually weakness is "I can't hit 'P'", so we count the expected key.
    // BUT, the `mistake` object has `typedKey` (what they pressed) and `expected` (romaji string).
    // `expected` might be "shi" but they typed "si" (valid) or "ci" (valid).
    // Wait, `INCORRECT_KEY` is fired when they type a key that is NOT valid.
    // So we should analyze:
    // 1. Which key did they TRY to type? (This is hard to know exactly if they typed a wrong key)
    //    Actually, we know the `currentKana` and `expected` romaji.
    //    However, in the `INCORRECT_KEY` payload, we have `typedKey`.
    //    We also have `expected` string (e.g., "ka/ca").
    //    If they typed 'r', and expected was 'k', then they missed 'k'.
    //    But if they typed 't' for 'chi', maybe they were going for 'ti'.
    
    // Let's focus on the KEY they PRESSED incorrectly first (finger error).
    // No, that shows "I accidentally press X a lot".
    // We want "I fail to press Y a lot".
    
    // The `mistake` object has: `char` (kana), `expected` (full romaji string), `actual` (buffer), `typedKey`.
    // It's hard to map exactly "which key they missed" without complex logic.
    // Simple approach: Analyze the `typedKey` (the wrong input) to see "which finger is misfiring".
    // AND analyze the `expected` char (kana) to see "which kana is hard".
    
    // For this initial version, let's count the `typedKey` as "Keys I accidentally press"
    // And we can try to infer the target key if `inputBuffer` was empty?
    
    // Let's stick to a simpler metric for now:
    // "Worst Keys": Keys that were pressed incorrectly. (Finger coordination issue)
    const badKey = mistake.typedKey.toLowerCase();
    keyCounts[badKey] = (keyCounts[badKey] || 0) + 1;

    const finger = FINGER_MAP[badKey];
    if (finger) {
      fingerCounts[finger] = (fingerCounts[finger] || 0) + 1;
    }

    // Miss pattern: Expected vs Typed
    // We don't have the exact "target key" in the mistake object easily, 
    // but we have the kana.
    const pattern = `${mistake.char} で ${badKey}`; // e.g. "あ で r"
    patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
  });

  // Sort and extract top items
  const sortedKeys = Object.entries(keyCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([key, count]) => ({ key, count }));

  const worstFinger = Object.entries(fingerCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || "なし";

  const sortedPatterns = Object.entries(patternCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([pattern, count]) => ({ pattern, count }));

  return {
    totalMistakes: mistakes.length,
    worstKeys: sortedKeys,
    worstFinger,
    missPatterns: sortedPatterns
  };
}
