import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/user/favorites
// ログインユーザーのお気に入りコース一覧を取得する
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: user.id,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            difficulty: true,
            isPublic: true,
            authorId: true,
            texts: {
              take: 3,
              select: {
                id: true,
                display: true,
                reading: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // フロントエンドで使いやすい形式に整形 (Course[] の形にする)
    const favoriteCourses = favorites.map(fav => ({
      ...fav.course,
      isFavorite: true,
    }));

    return NextResponse.json(favoriteCourses);
  } catch (error) {
    console.error('Failed to fetch favorite courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorite courses' },
      { status: 500 }
    );
  }
}
