'use client';

import ResultDisplay from '@/components/ResultDisplay';

export default function ResultPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          結果
        </h1>
        <ResultDisplay />
      </main>
    </div>
  );
}
