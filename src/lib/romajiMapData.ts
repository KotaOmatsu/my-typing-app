// src/lib/romajiMapData.ts

export interface KanaRomajiMap {
  [key: string]: string[];
}

let kanaRomajiMap: KanaRomajiMap = {};
let isMapLoaded: boolean = false;

export const setKanaRomajiMap = (data: KanaRomajiMap) => {
  kanaRomajiMap = data;
  isMapLoaded = true;
};

export const getRomajiCandidates = (kana: string): string[] => {
  if (!isMapLoaded) {
    console.warn("Kana-Romaji map is not loaded when getRomajiCandidates was called.");
    return [];
  }
  return kanaRomajiMap[kana] || [];
};

export const getIsKanaRomajiMapLoaded = (): boolean => {
    return isMapLoaded;
};