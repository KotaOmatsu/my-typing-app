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
  previousInputBuffer: string; // ミス直前の入力バッファ
}

export interface KeyLog {
  key: string;
  isMistake: boolean;
  timestamp: number;
}

/**
 * 1回のタイピングゲームの結果
 */
export interface TypingResult {
  id?: string;
  wpm: number;
  accuracy: number;
  mistakeCount: number;
  score: number;
  mistakes: Mistake[];
  keyHistory: KeyLog[];
  startTime: number;
  endTime: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  correctKanaUnits: number;
  typedText: string; // 実際にユーザーが入力したローマ字列全体
  displayText: string; // 問題文
  displayUnits: DisplayUnit[]; // 問題文の構造データ
  createdAt?: string;
}

/**
 * フォームで扱う問題文の型
 */
export interface TextItem {
  id?: string; // 編集時のためにIDを持てるようにする
  display: string;
  reading: string;
}

/**
 * コース作成/編集フォームのデータ型
 */
export interface CourseFormData {
  title: string;
  description: string;
  difficulty: string;
  isPublic: boolean;
  texts: TextItem[];
}

/**
 * コース情報の型定義
 */
export interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail?: string | null;
  difficulty: 'Easy' | 'Normal' | 'Hard' | string;
  isPublic: boolean;
  authorId?: string;
  texts?: TextItem[];
  isFavorite?: boolean; // お気に入り状態
}

/**
 * 履歴画面表示用の結果型 (Prismaモデルベース + createdAt文字列化)
 */
export interface HistoryResult {
  id: string;
  userId: string;
  wpm: number;
  accuracy: number;
  mistakeCount: number;
  score: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  text: string;
  mistakeDetails: string; // JSON string in DB
  createdAt: string; // Serialized date
  courseId: string | null;
}
