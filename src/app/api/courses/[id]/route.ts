import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { TextItem } from '@/types/typing'; // TextItem をインポート

// GET /api/courses/[id]
// 特定のコースの詳細情報を取得するAPI
// params: { id: string } でURLパラメータを受け取れます
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const courseId = params.id;

  try {
    // prisma.course.findUnique() でIDが一致するデータを1つ取得します
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        // 関連する texts (TypingTextモデル) も一緒に取得する
        texts: {
          orderBy: {
            order: 'asc', // 出題順に並べる
          },
          select: {
            id: true,
            display: true,
            reading: true,
            // orderやcourseIdはフロントエンドには不要なので省略可
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error(`Failed to fetch course details for id ${courseId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch course details' },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id]
// コース情報を更新するAPI
export async function PUT(
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

    // 2. ユーザー取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3. コースの存在と所有権確認
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (existingCourse.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 4. リクエストボディの取得
    const body = await request.json();
    const { title, description, difficulty, isPublic, texts }: {
      title: string;
      description?: string;
      difficulty?: string;
      isPublic?: boolean;
      texts: TextItem[];
    } = body;

    if (!title || !texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // 5. コース更新（テキストは全削除して再作成）
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        title,
        description,
        difficulty,
        isPublic,
        texts: {
          deleteMany: {}, // 既存のテキストを全て削除
          create: texts.map((text: TextItem, index: number) => ({
            display: text.display,
            reading: text.reading,
            order: index + 1,
          })),
        },
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error(`Failed to update course ${courseId}:`, error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id]
// 特定のコースを削除するAPI
export async function DELETE(
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

    // 2. ユーザー取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3. コースの存在と所有権確認
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (course.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 4. コース削除
    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error(`Failed to delete course ${courseId}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
