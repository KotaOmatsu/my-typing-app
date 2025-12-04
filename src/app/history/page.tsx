import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TypingResult } from '@/types/typing';
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

  // 1. 分析用データ (Mistake[]が必要なので、従来のTypingResult型に整形してmistakesをパース)
  const analysisData: TypingResult[] = rawResults.map((r) => ({
    ...r,
    score: r.score,
    mistakes: JSON.parse(r.mistakeDetails),
    startTime: 0,
    endTime: 0,
    correctKanaUnits: 0,
    typedText: '',
    displayText: r.text,
    displayUnits: [],
    createdAt: r.createdAt.toISOString(), // 実際には使用されないが型合わせのため
  }));

  // 2. 表示用データ (HistoryResult型)
  const viewData = rawResults.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

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
