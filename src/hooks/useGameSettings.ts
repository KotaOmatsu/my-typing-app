import { useState, useEffect } from 'react';

export interface GameSettings {
  showRomaji: boolean;
  showKana: boolean;
}

const DEFAULT_SETTINGS: GameSettings = {
  showRomaji: true,
  showKana: true,
};

const SETTINGS_KEY = 'typingGameSettings';

export const useGameSettings = () => {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  useEffect(() => {
    const storedSettings = localStorage.getItem(SETTINGS_KEY);
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        if (parsed && typeof parsed === 'object') {
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        }
      } catch (error) {
        console.error("Failed to parse settings from local storage:", error);
      }
    }
    setIsSettingsLoaded(true);
  }, []);

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  };

  return {
    settings,
    updateSettings,
    isSettingsLoaded,
  };
};
