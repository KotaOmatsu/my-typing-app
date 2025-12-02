import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
        // texts (問題文) はデータ量が多いため一覧では取得しません
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
