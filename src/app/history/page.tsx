import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import HistoryTable from '@/components/HistoryTable';
import HistoryChart from '@/components/HistoryChart';

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">アクセス権がありません</h1>
        <p className="mb-6">成績履歴を閲覧するには、ログインが必要です。</p>
        <Link href="/login" className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
          ログインページへ
        </Link>
      </div>
    );
  }

  const results = await prisma.typingResult.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // `mistakeDetails`はJSON文字列なので、クライアントコンポーネントに渡す前にパースする必要はない。
  // しかし、Dateオブジェクトはシリアライズできないため、文字列に変換する必要がある。
  const serializableResults = results.map(result => ({
    ...result,
    createdAt: result.createdAt.toISOString(),
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">成績履歴</h1>
      {serializableResults.length > 0 ? (
        <>
          <HistoryChart results={serializableResults} />
          <HistoryTable results={serializableResults} />
        </>
      ) : (
        <div className="text-center text-gray-500">
          <p>まだタイピング履歴がありません。</p>
          <p>最初のタイピングに挑戦してみましょう！</p>
          <Link href="/typing" className="mt-4 inline-block px-6 py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">
            タイピングを開始する
          </Link>
        </div>
      )}
    </div>
  );
}
