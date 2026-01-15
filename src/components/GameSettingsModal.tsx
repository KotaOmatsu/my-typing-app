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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">表示設定</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* ガイド設定 */}
          <h3 className="text-md font-semibold text-gray-600 mb-2">ガイド</h3>
          <div className="flex items-center justify-between">
            <span className="text-lg text-gray-700">ローマ字ガイド</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="showRomaji"
                className="sr-only peer"
                checked={settings.showRomaji}
                onChange={(e) => onUpdateSettings({ showRomaji: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <hr className="my-4 border-gray-200" />

          {/* ゲームモード設定 */}
          <h3 className="text-md font-semibold text-gray-600 mb-2">モード</h3>
          <div className="flex items-center justify-between">
            <span className="text-lg text-gray-700">リアルモード</span>
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
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-lg text-red-600 font-bold">間違えたら最初からモード</span>
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
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameSettingsModal;