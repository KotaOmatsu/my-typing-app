'use client';

import ResultDisplay from '@/components/ResultDisplay';

export default function ResultPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-64px)] overflow-hidden bg-gray-100">
      <main className="flex flex-col items-center justify-center w-full h-full px-4 text-center">
        <ResultDisplay />
      </main>
    </div>
  );
}
