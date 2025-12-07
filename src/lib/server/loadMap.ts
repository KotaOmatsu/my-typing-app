// src/lib/server/loadMap.ts
import fs from 'fs/promises';
import path from 'path';
import { setKanaRomajiMap, getIsKanaRomajiMapLoaded } from '@/lib/romajiMapData';

export const loadKanaRomajiMapServer = async () => {
  if (getIsKanaRomajiMapLoaded()) return;

  try {
    const filePath = path.join(process.cwd(), 'public', 'kana_romaji_map.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    setKanaRomajiMap(data);
    console.log("Kana-Romaji map loaded on server.");
  } catch (error) {
    console.error("Failed to load kana_romaji_map.json on server:", error);
  }
};
