"use client";

import React, { useState } from 'react';
import Link from "next/link";
import LoginStatus from "../components/LoginStatus";
import { useGameSettings } from "../hooks/useGameSettings";
import GameSettingsModal from "../components/GameSettingsModal";

export default function Home() {
  const { settings, updateSettings } = useGameSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 py-2 relative">
      {/* ヘッダー（ログイン状態など） */}
      <header className="w-full p-4 flex justify-end absolute top-0 right-0 z-10">
        <LoginStatus />
      </header>

      {/* 設定ボタン（左上） */}
      <div className="absolute top-0 left-0 mt-4 ml-4 z-10">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-3 text-gray-500 hover:text-gray-700 bg-white rounded-full shadow hover:shadow-md transition duration-200 flex items-center gap-2"
          title="表示設定"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-bold text-gray-600">設定</span>
        </button>
      </div>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-6">
          タイピング練習サイト
        </h1>

        <p className="mt-3 text-2xl text-gray-600 mb-8">
          表示された日本語の文章をローマ字で正確に入力しましょう。
        </p>

        <Link
          href="/typing"
          className="px-8 py-4 bg-blue-600 text-white text-2xl font-bold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
        >
          タイピングを開始する
        </Link>
      </main>

      <GameSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
      />
    </div>
  );
}
