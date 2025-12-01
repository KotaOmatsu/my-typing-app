// src/utils/resultUtils.ts

import { Mistake } from "@/types/typing";

/**
 * ミスの詳細情報を格納するオブジェクトの型
 * キーは仮名のインデックス
 */
export interface MistakeDetails {
  [index: number]: {
    char: string;
    expected: string;
    actual: string;
  }[];
}

/**
 * ミスタイプされたキーとその回数を格納するオブジェクトの型
 */
export interface MistypedKeys {
  [key: string]: number;
}

/**
 * ミスの配列から、仮名インデックスをキーとした詳細なミスマップを作成する
 * @param mistakes - TypingResultから取得したミスの配列
 * @returns 仮名インデックスごとのミスの詳細
 */
export const createMistakeDetails = (mistakes: Mistake[]): MistakeDetails => {
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

/**
 * ミスの配列から、どのキーで何回ミスしたかを分析する
 * @param mistakes - TypingResultから取得したミスの配列
 * @returns キーごとのミス回数
 */
export const analyzeMistypedKeys = (mistakes: Mistake[]): MistypedKeys => {
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
