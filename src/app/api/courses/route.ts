import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client'; // Prisma namespaceをインポート
import { TextItem } from '@/types/typing'; // TextItem をインポート

// GET /api/courses
// コース一覧を取得するAPI
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const authorId = searchParams.get('authorId');
    const searchQuery = searchParams.get('search');
    const difficulty = searchParams.get('difficulty');

    let where: Prisma.CourseWhereInput = { isPublic: true }; // 型を明示

    if (authorId) {
      const session = await getServerSession(authOptions);
      // セッションがあり、かつメールアドレスからユーザーを特定し、IDが一致すれば全コース（非公開含む）を取得
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
        });
        
        if (user && user.id === authorId) {
          // 本人の場合、公開・非公開問わず自分のコースを全て取得
          where = { authorId };
        } else {
          // 他人の場合、その人の公開コースのみ
          where = { authorId, isPublic: true };
        }
      } else {
        // 未ログインの場合、公開コースのみ
        where = { authorId, isPublic: true };
      }
    }

    // 検索クエリがある場合、タイトルまたは説明文で検索
    if (searchQuery) {
      where = {
        ...where,
        OR: [
          { title: { contains: searchQuery } },
          { description: { contains: searchQuery } },
        ],
      };
    }

    // 難易度フィルタがある場合 (All以外)
    if (difficulty && difficulty !== 'All') {
      where = {
        ...where,
        difficulty: difficulty,
      };
    }

    // prisma.course.findMany() で条件に合うデータを複数取得します
    const courses = await prisma.course.findMany({
      where,
      select: {
        // 必要なフィールドだけを指定して取得（パフォーマンス向上）
        id: true,
        title: true,
        description: true,
        difficulty: true,
        thumbnail: true,
        createdAt: true,
        isPublic: true, // マイページで公開状態を確認するために追加
        authorId: true,
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
    const { title, description, thumbnail, difficulty, isPublic, texts } = body;

    if (!title || !texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // validate text items
    for (const text of texts) {
      if (!text.display || !text.reading) {
        return NextResponse.json({ error: 'Invalid text item: missing display or reading' }, { status: 400 });
      }
    }

    // 3. データベースへの保存
    const course = await prisma.course.create({
      data: {
        title,
        description,
        thumbnail,
        difficulty: difficulty || 'Normal',
        isPublic: isPublic !== undefined ? isPublic : true,
        authorId: user.id,
        texts: {
          create: texts.map((text: TextItem, index: number) => ({ // TextItem 型を明示
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
