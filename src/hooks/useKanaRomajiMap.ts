// src/hooks/useKanaRomajiMap.ts
'use client';

import { useEffect, useState } from 'react';
import { setKanaRomajiMap, getIsKanaRomajiMapLoaded } from '@/lib/romajiMapData';

export const useKanaRomajiMap = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 既にロード済みなら何もしない
    if (getIsKanaRomajiMapLoaded()) {
        setIsLoaded(true);
        return;
    }

    const load = async () => {
        try {
            const response = await fetch('/kana_romaji_map.json');
            if (!response.ok) throw new Error('Failed to fetch map');
            const data = await response.json();
            setKanaRomajiMap(data);
            setIsLoaded(true);
        } catch (error) {
            console.error(error);
        }
    };
    load();
  }, []);

  return isLoaded;
};