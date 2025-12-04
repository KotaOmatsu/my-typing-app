'use client';

import React, { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HistoryResult } from '@/types/typing';
import HistoryChart from './HistoryChart';
import HistoryTable from './HistoryTable';
import WeaknessAnalysisDisplay from './WeaknessAnalysisDisplay';
import { WeaknessAnalysis } from '@/utils/analysisUtils';

interface HistoryViewProps {
  results: HistoryResult[];
  weaknessAnalysis: WeaknessAnalysis;
}

const TIME_RANGES = [
  { label: '1週間', value: 'week' },
  { label: '1ヶ月', value: 'month' },
  { label: '1年', value: 'year' },
  { label: '全期間', value: 'all' },
];

const HistoryView: React.FC<HistoryViewProps> = ({ results, weaknessAnalysis }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRange = searchParams.get('range') || 'all';

  const handleRangeChange = useCallback((range: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (range === 'all') {
      params.delete('range');
    } else {
      params.set('range', range);
    }
    router.push(`/history?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="space-y-6"> {/* Reduced space-y here */}
      {results.length > 0 ? (
        <>
            {/* 分析レポート（グラフ＆苦手分析） */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        📊 分析レポート
                        <span className="text-sm font-normal text-gray-500 bg-white px-2 py-1 rounded border">
                            {TIME_RANGES.find(r => r.value === currentRange)?.label}
                        </span>
                    </h2>
                    {/* 期間切り替えタブ */}
                    <div className="inline-flex bg-gray-100 p-1 rounded-lg">
                        {TIME_RANGES.map((range) => (
                            <button
                            key={range.value}
                            onClick={() => handleRangeChange(range.value)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                currentRange === range.value
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                            }`}
                            >
                            {range.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="p-4 space-y-4"> {/* Reduced p and space-y here */}
                    {/* 苦手分析 */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-l-4 border-red-500 pl-3">
                            🎯 苦手傾向分析
                        </h3>
                        <WeaknessAnalysisDisplay analysis={weaknessAnalysis} />
                    </div>

                    <div className="border-t border-gray-100 pt-4"></div> {/* Reduced pt here */}

                    {/* 成績推移チャート */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-l-4 border-blue-500 pl-3">
                            📈 成績推移 (WPM・正確性)
                        </h3>
                        <div className="h-[400px] w-full">
                            <HistoryChart results={results} />
                        </div>
                    </div>
                </div>
            </section>

            {/* 履歴テーブル */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="mb-4 pb-2 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">📝 詳細履歴</h2>
                </div>
                <HistoryTable results={results} />
            </section>
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">
            選択された期間のデータはありません。<br />
            練習をして記録を作りましょう！
          </p>
        </div>
      )}
    </div>
  );
};

export default HistoryView;
