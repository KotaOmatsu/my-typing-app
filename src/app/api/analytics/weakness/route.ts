import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { analyzeWeaknesses } from '@/utils/analysisUtils';
import { Mistake } from '@/types/typing';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch recent typing results (e.g., last 50)
    const results = await prisma.typingResult.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
      select: {
        mistakeDetails: true,
      },
    });

    let allMistakes: Mistake[] = [];

    results.forEach(result => {
      try {
        const parsed: Mistake[] = JSON.parse(result.mistakeDetails);
        if (Array.isArray(parsed)) {
          allMistakes = [...allMistakes, ...parsed];
        }
      } catch (e) {
        console.error("Failed to parse mistake details", e);
      }
    });

    const analysis = analyzeWeaknesses(allMistakes);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing weakness:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
