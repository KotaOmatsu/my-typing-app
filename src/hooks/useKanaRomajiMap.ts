// src/hooks/useKanaRomajiMap.ts
'use client';

import { useEffect, useState } from 'react';
import { loadKanaRomajiMap, getIsKanaRomajiMapLoaded } from '@/lib/romajiMapData';

export const useKanaRomajiMap = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 既にロード済みなら何もしない
    if (getIsKanaRomajiMapLoaded()) {
        setIsLoaded(true);
        return;
    }

    loadKanaRomajiMap().then(() => setIsLoaded(true));
  }, []);

  return isLoaded;
};