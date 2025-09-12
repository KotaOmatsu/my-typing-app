"use client";

import Link from "next/link";
import LoginStatus from "../components/LoginStatus";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 py-2">
      <header className="w-full p-4 flex justify-end absolute top-0 right-0">
        <LoginStatus />
      </header>

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
    </div>
  );
}
