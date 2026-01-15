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
    <div className="space-y-8">
      {results.length > 0 ? (
        <>
            {/* 分析レポート（グラフ＆苦手分析） */}
            <section className="bg-card rounded-sm shadow-sm border border-border overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <h2 className="text-sm font-bold font-mono text-foreground flex items-center gap-2 uppercase tracking-widest">
                        Analytics Report
                        <span className="text-[10px] font-normal text-muted-foreground bg-background px-2 py-0.5 rounded-sm border border-border">
                            {TIME_RANGES.find(r => r.value === currentRange)?.label}
                        </span>
                    </h2>
                    {/* 期間切り替えタブ */}
                    <div className="inline-flex bg-muted p-1 rounded-sm">
                        {TIME_RANGES.map((range) => (
                            <button
                            key={range.value}
                            onClick={() => handleRangeChange(range.value)}
                            className={`px-3 py-1.5 rounded-sm text-xs font-mono transition-colors duration-200 ${
                                currentRange === range.value
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                            }`}
                            >
                            {range.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="p-6 space-y-8">
                    {/* 苦手分析 */}
                    <div>
                        <h3 className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-widest">
                            Weakness Tendency
                        </h3>
                        <WeaknessAnalysisDisplay analysis={weaknessAnalysis} />
                    </div>

                    <div className="border-t border-border pt-8"></div>

                    {/* 成績推移チャート */}
                    <div>
                        <h3 className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-widest">
                            Performance Trend (WPM / Accuracy)
                        </h3>
                        <div className="h-[400px] w-full">
                            <HistoryChart results={results} />
                        </div>
                    </div>
                </div>
            </section>

            {/* 履歴テーブル */}
            <section className="bg-card p-6 rounded-sm shadow-sm border border-border">
                <div className="mb-4 pb-2 border-b border-border">
                    <h2 className="text-sm font-bold font-mono text-foreground uppercase tracking-widest">Detailed History</h2>
                </div>
                <HistoryTable results={results} />
            </section>
        </>
      ) : (
        <div className="text-center py-12 bg-card rounded-sm shadow-sm border border-dashed border-border">
          <p className="text-muted-foreground text-sm font-mono">
            NO_DATA_AVAILABLE<br />
            Start a session to generate records.
          </p>
        </div>
      )}
    </div>
  );
};

export default HistoryView;
