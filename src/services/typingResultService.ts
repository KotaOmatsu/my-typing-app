// src/services/typingResultService.ts

/**
 * APIに送信するタイピング結果のペイロードの型定義
 */
export interface TypingResultPayload {
  wpm: number;
  accuracy: number;
  mistakeCount: number;
  score: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  text: string;
  mistakeDetails: object[]; // Array of mistake objects
  courseId?: string; // Added courseId
}

/**
 * タイピング結果をAPI経由でデータベースに保存する
 * @param resultData - 保存するタイピング結果のデータ
 */
export const saveTypingResult = async (resultData: TypingResultPayload): Promise<void> => {
  try {
    const response = await fetch('/api/typing-results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resultData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Typing result saved successfully:', data);
  } catch (error) {
    console.error('Failed to save typing result:', error);
    // ここでUIにエラーを通知するなどの処理を追加することもできる
  }
};
