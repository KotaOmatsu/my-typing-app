import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// POST /api/courses/[id]/favorite
// お気に入りの登録・解除を切り替える (Toggle)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const courseId = params.id;

  try {
    // 1. セッションチェック
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. ユーザーID取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3. お気に入り状態の確認
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId,
        },
      },
    });

    let isFavorite: boolean;

    if (existingFavorite) {
      // 登録済みの場合は削除 (解除)
      await prisma.favorite.delete({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: courseId,
          },
        },
      });
      isFavorite = false;
    } else {
      // 未登録の場合は作成 (登録)
      await prisma.favorite.create({
        data: {
          userId: user.id,
          courseId: courseId,
        },
      });
      isFavorite = true;
    }

    return NextResponse.json({ isFavorite });

  } catch (error) {
    console.error(`Failed to toggle favorite for course ${courseId}:`, error);
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500 }
    );
  }
}
