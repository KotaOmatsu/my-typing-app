import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TypingResult, HistoryResult } from '@/types/typing';
import { analyzeWeaknesses } from '@/utils/analysisUtils';
import HistoryView from '@/components/HistoryView';

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { range?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect('/login');
  }

  // 期間フィルタリングの日付計算
  let startDate: Date | undefined;
  const now = new Date();
  const range = searchParams.range;

  if (range === 'week') {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 7);
  } else if (range === 'month') {
    startDate = new Date(now);
    startDate.setMonth(now.getMonth() - 1);
  } else if (range === 'year') {
    startDate = new Date(now);
    startDate.setFullYear(now.getFullYear() - 1);
  }
  // 'all' または未指定の場合は startDate は undefined のまま

  const rawResults = await prisma.typingResult.findMany({
    where: {
      user: {
        email: session.user.email,
      },
      ...(startDate && {
        createdAt: {
          gte: startDate,
        },
      }),
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // データの整形（分析用と表示用を一度に生成してパフォーマンス最適化）
  const analysisData: TypingResult[] = [];
  const viewData: HistoryResult[] = [];

  for (const r of rawResults) {
    const createdAtStr = r.createdAt.toISOString();
    
    // 表示用 (HistoryResult)
    viewData.push({
      ...r,
      createdAt: createdAtStr,
    });

    // 分析用 (TypingResult - mistakesをパース)
    let parsedMistakes = [];
    try {
        parsedMistakes = JSON.parse(r.mistakeDetails);
    } catch (e) {
        console.error("Failed to parse mistakes for result " + r.id, e);
    }

    analysisData.push({
      wpm: r.wpm,
      accuracy: r.accuracy,
      score: r.score,
      mistakes: parsedMistakes,
      startTime: 0,
      endTime: 0,
      totalKeystrokes: r.totalKeystrokes,
      correctKeystrokes: r.correctKeystrokes,
      correctKanaUnits: 0,
      typedText: '',
      displayText: r.text,
      displayUnits: [],
    });
  }

  // 苦手分析の実行
  const weaknessAnalysis = analyzeWeaknesses(analysisData.flatMap((r) => r.mistakes));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          成績履歴 & 分析
        </h1>
        
        <HistoryView results={viewData} weaknessAnalysis={weaknessAnalysis} />
      </div>
    </div>
  );
}
