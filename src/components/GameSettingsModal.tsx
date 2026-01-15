import React from 'react';
import { GameSettings } from '../hooks/useGameSettings';

interface GameSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

const GameSettingsModal: React.FC<GameSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-background rounded-sm shadow-xl p-6 w-96 max-w-full border border-border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">表示設定</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
  
          <div className="space-y-4">
            {/* ガイド設定 */}
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-2">ガイド</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">ローマ字ガイド</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="showRomaji"
                  className="sr-only peer"
                  checked={settings.showRomaji}
                  onChange={(e) => onUpdateSettings({ showRomaji: e.target.checked })}
                />
                <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
  
            <hr className="my-4 border-border" />
  
            {/* ゲームモード設定 */}
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-2">モード</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">リアルモード</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="realisticMode"
                  className="sr-only peer"
                  checked={settings.realisticMode}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    onUpdateSettings({
                      realisticMode: isChecked,
                      hardcoreMode: isChecked ? false : settings.hardcoreMode
                    });
                  }}
                />
                <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-muted-foreground">間違えたら最初からモード</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="hardcoreMode"
                  className="sr-only peer"
                  checked={settings.hardcoreMode}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    onUpdateSettings({
                      hardcoreMode: isChecked,
                      realisticMode: isChecked ? false : settings.realisticMode
                    });
                  }}
                />
                <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
  
          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition duration-200 text-sm font-bold uppercase tracking-widest"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default GameSettingsModal;