import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/courses/[id]/ranking
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const courseId = params.id;

  try {
    const rankings = await prisma.typingResult.findMany({
      where: {
        courseId: courseId,
      },
      orderBy: {
        score: 'desc',
      },
      take: 10,
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(rankings);
  } catch (error) {
    console.error(`Failed to fetch rankings for course ${courseId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch rankings' },
      { status: 500 }
    );
  }
}
