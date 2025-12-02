import { getRomajiCandidates } from "@/components/KanaRomajiMap";

/**
 * 入力されたローマ字バッファが、現在の仮名に対して一致するかどうかを判定する
 * @param kana - 現在の仮名 (e.g., "か")
 * @param buffer - 現在の入力バッファ (e.g., "ka")
 * @param nextTypingUnit - 次のタイピング単位 (促音・撥音の判定に使う)
 * @returns { exact: 完全一致か, partial: 部分一致か }
 */
export const checkRomajiMatch = (
  kana: string,
  buffer: string,
  nextTypingUnit?: string
): { exact: boolean; partial: boolean } => {
  // 記号の直接マッピング
  const symbolMap: { [key: string]: string } = { "。": ".", "、": ",", "「": "[", "」": "]" };
  if (symbolMap[kana]) {
    const expectedKey = symbolMap[kana];
    return { exact: buffer === expectedKey, partial: expectedKey.startsWith(buffer) };
  }

  let possibleRomajiCandidates: string[] = getRomajiCandidates(kana);

  // 促音「っ」の特殊処理
  if (kana === "っ" && nextTypingUnit) {
    const nextKanaRomaji = getRomajiCandidates(nextTypingUnit);
    if (nextKanaRomaji.length > 0 && nextKanaRomaji[0][0]) {
      // 次の文字の子音を重ねるパターン (e.g., "か" -> "kka")
      possibleRomajiCandidates = [...possibleRomajiCandidates, nextKanaRomaji[0][0].repeat(2)];
    }
  }
  // 撥音「ん」の特殊処理
  else if (kana === "ん") {
    // 次が母音やヤ行の場合、'n'一文字では確定しないようにする
    possibleRomajiCandidates = (nextTypingUnit && "あいうえおやゆよ".includes(nextTypingUnit))
      ? ["nn", "n'"]
      : ["n", "nn", "n'"];
  }

  const exact = possibleRomajiCandidates.some(c => c === buffer);
  const partial = !exact && possibleRomajiCandidates.some(c => c.startsWith(buffer));
  
  return { exact, partial };
};

/**
 * 表示用の推奨ローマ字を取得する
 * 将来的にはユーザー設定や入力履歴に基づいて動的に変更する余地を残す
 */
export const getRecommendedRomaji = (kana: string, nextTypingUnit?: string): string => {
  const symbolMap: { [key: string]: string } = { "。": ".", "、": ",", "「": "[", "」": "]" };
  if (symbolMap[kana]) {
    return symbolMap[kana];
  }

  const candidates = getRomajiCandidates(kana);
  if (candidates.length === 0) return "";

  // 促音「っ」の特殊処理
  if (kana === "っ" && nextTypingUnit) {
    const nextCandidates = getRomajiCandidates(nextTypingUnit);
    if (nextCandidates.length > 0 && nextCandidates[0][0]) {
      return nextCandidates[0][0]; // 次の文字の最初の子音を返す (例: "ka" -> "k")
    }
  }
  
  // デフォルトは最初の候補（ヘボン式など）を返す
  return candidates[0];
};
