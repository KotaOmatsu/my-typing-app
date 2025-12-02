import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/courses
// コース一覧を取得するAPI
export async function GET() {
  try {
    // prisma.course.findMany() で条件に合うデータを複数取得します
    const courses = await prisma.course.findMany({
      where: {
        isPublic: true, // 公開設定のコースのみ
      },
      select: {
        // 必要なフィールドだけを指定して取得（パフォーマンス向上）
        id: true,
        title: true,
        description: true,
        difficulty: true,
        thumbnail: true,
        createdAt: true,
        authorId: true, // 一覧で権限チェックに使用するため取得
        // 一覧表示（モーダル）でのプレビュー用に最初の3件だけ取得
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
      orderBy: {
        createdAt: 'desc', // 新しい順に並べる
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST /api/courses
// 新しいコースを作成するAPI
export async function POST(request: Request) {
  try {
    // 1. セッションチェック（ログインユーザーのみ許可）
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ユーザーIDを取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. リクエストボディの取得と検証
    const body = await request.json();
    const { title, description, difficulty, isPublic, texts } = body;

    if (!title || !texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // 3. データベースへの保存
    const course = await prisma.course.create({
      data: {
        title,
        description,
        difficulty: difficulty || 'Normal',
        isPublic: isPublic !== undefined ? isPublic : true,
        authorId: user.id,
        texts: {
          create: texts.map((text: any, index: number) => ({
            display: text.display,
            reading: text.reading,
            order: index + 1, // 順番を保存
          })),
        },
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error('Failed to create course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
