// src/lib/romajiMapData.ts

// クライアントとサーバー両方で使えるようにfsモジュールは条件付きでインポート
// Next.jsの環境変数などで判別可能だが、ここでは単純にエラーハンドリング
let fs: typeof import('fs/promises') | undefined;
try {
  fs = require('fs/promises');
} catch (e) {
  // 環境がブラウザの場合 (fsモジュールがない場合) は何もしない
}

interface KanaRomajiMap {
  [key: string]: string[];
}

let kanaRomajiMap: KanaRomajiMap = {};
let isMapLoaded: boolean = false;

// マップの読み込み
export const loadKanaRomajiMap = async (): Promise<void> => {
  if (isMapLoaded) {
    return;
  }

  try {
    if (typeof window === 'undefined' && fs) {
      // サーバーサイド (Node.js環境)
      const filePath = process.cwd() + '/public/kana_romaji_map.json';
      const fileContent = await fs.readFile(filePath, 'utf8');
      kanaRomajiMap = JSON.parse(fileContent);
    } else {
      // クライアントサイド (ブラウザ環境)
      const response = await fetch('/kana_romaji_map.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      kanaRomajiMap = await response.json();
    }
    isMapLoaded = true;
    console.log("Kana-Romaji map loaded successfully.");
  } catch (error) {
    console.error("Failed to load kana_romaji_map.json:", error);
    // エラー時もフラグは立てておき、再試行はしない
    isMapLoaded = true;
  }
};

export const getRomajiCandidates = (kana: string): string[] => {
  // マップがまだ読み込まれていない場合は、読み込みを試みる (非同期なので注意)
  // ただし、getRomajiCandidatesは同期的に呼ばれることが多いため、
  // 呼び出し元でloadKanaRomajiMapを事前に呼んでおくのが理想
  if (!isMapLoaded) {
    // throw new Error("Kana-Romaji map is not loaded. Call loadKanaRomajiMap() first.");
    // 開発中の利便性のため、もし読み込まれていなければ空配列を返す
    // 厳密なアプリケーションではエラーを投げるべき
    console.warn("Kana-Romaji map is not loaded when getRomajiCandidates was called.");
    return [];
  }
  return kanaRomajiMap[kana] || [];
};

// マップが読み込まれているか確認するためのヘルパー
export const getIsKanaRomajiMapLoaded = (): boolean => {
    return isMapLoaded;
};
