// src/types/typing.d.ts

/**
 * ミスタイプ一回分の詳細情報
 */
export interface Mistake {
  char: string; // ミスした対象の仮名
  expected: string; // 期待されていたローマ字入力
  actual: string; // 実際のローマ字入力
  typedKey: string; // 実際にタイプされたキー
  kanaIndex: number; // 文章全体における仮名のインデックス
}

/**
 * 練習用の文章データ構造
 */
export interface TypingText {
  id: string;
  display: string; // 表示用（漢字・カタカナ含む）
  reading: string; // 判定用（ひらがな）
}

/**
 * 1回のタイピングゲーム全体の結果
 * localStorageやデータベースに保存される際の型
 */
export interface TypingResult {
  accuracy: number; // 正確性 (%)
  wpm: number; // Words Per Minute
  mistakes: Mistake[]; // ミスの詳細配列
  startTime: number; // 開始時刻 (Unixタイムスタンプ)
  endTime: number; // 終了時刻 (Unixタイムスタンプ)
  totalKeystrokes: number; // 総打鍵数
  correctKeystrokes: number; // 正解打鍵数
  correctKanaUnits: number; // 正解仮名数
  typedText: string; // 対象となった文章全体（判定用：ひらがな）
  displayText: string; // 対象となった文章全体（表示用：漢字・カタカナ）
  displayUnits: string[]; // 表示用に分割された仮名の配列
}
