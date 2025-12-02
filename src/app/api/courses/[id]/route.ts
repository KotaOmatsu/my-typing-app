import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
