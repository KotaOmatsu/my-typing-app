import { useEffect, useState } from 'react';

interface KanaRomajiMap {
  [key: string]: string[];
}

let kanaRomajiMap: KanaRomajiMap = {};

export const loadKanaRomajiMap = async () => {
  if (Object.keys(kanaRomajiMap).length === 0) {
    try {
      const response = await fetch('/kana_romaji_map.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      kanaRomajiMap = await response.json();
      console.log("Kana-Romaji map loaded successfully.", kanaRomajiMap); // Re-enabled log
    } catch (error) {
      console.error("Failed to load kana_romaji_map.json:", error);
    }
  }
};

export const getRomajiCandidates = (kana: string): string[] => {
  return kanaRomajiMap[kana] || [];
};

export const useKanaRomajiMap = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadKanaRomajiMap().then(() => setIsLoaded(true));
  }, []);

  return isLoaded;
};