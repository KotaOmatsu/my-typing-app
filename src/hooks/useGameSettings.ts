import { useState, useEffect } from 'react';

export interface GameSettings {
  showRomaji: boolean;
  showKana: boolean;
  soundEnabled: boolean;
  missEffectEnabled: boolean;
  realisticMode: boolean;
  hardcoreMode: boolean;
}

const DEFAULT_SETTINGS: GameSettings = {
  showRomaji: true,
  showKana: true,
  soundEnabled: true,
  missEffectEnabled: true,
  realisticMode: false,
  hardcoreMode: false,
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
          // Enforce mandatory settings
          setSettings({ 
            ...DEFAULT_SETTINGS, 
            ...parsed,
            // Force these to be ON/Standard
            showKana: true,
            soundEnabled: true, 
            missEffectEnabled: true,
          });
        }
      } catch (error) {
        console.error("Failed to parse settings from local storage:", error);
      }
    }
    // Also enforce if no stored settings (already in DEFAULT, but good to be explicit if DEFAULT changes)
    setIsSettingsLoaded(true);
  }, []);

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    // Prevent disabling mandatory settings
    const filteredSettings = { ...newSettings };
    if ('showKana' in filteredSettings) filteredSettings.showKana = true;
    if ('soundEnabled' in filteredSettings) filteredSettings.soundEnabled = true;
    if ('missEffectEnabled' in filteredSettings) filteredSettings.missEffectEnabled = true;

    const updated = { ...settings, ...filteredSettings };
    setSettings(updated);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  };

  return {
    settings,
    updateSettings,
    isSettingsLoaded,
  };
};
