// src/constants/typing.ts

import { TypingText } from "@/types/typing";

/**
 * 練習用の文章
 * 将来的にはAPIやデータベースから取得するように拡張する
 */
export const TYPING_TEXTS: TypingText[] = [
  { id: "1", display: "吾輩は猫である。", reading: "わがはいはねこである。" },
  { id: "2", display: "テスト。", reading: "て。すと。" },
  { id: "3", display: "あいうえお", reading: "あいうえお" }
];

/**
 * タイピング結果をlocalStorageに保存する際のキー
 */
export const LOCAL_STORAGE_RESULT_KEY = 'typingResult';
