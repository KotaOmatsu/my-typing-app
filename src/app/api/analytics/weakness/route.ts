import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { analyzeWeaknesses } from '@/utils/analysisUtils';
import { Mistake, TypingResult, KeyLog } from '@/types/typing';

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
        keyHistory: true,
        text: true,
        wpm: true,
        accuracy: true,
        score: true,
        totalKeystrokes: true,
        correctKeystrokes: true,
      },
    });

    const analysisData: TypingResult[] = [];

    results.forEach(result => {
      try {
        const parsedMistakes: Mistake[] = JSON.parse(result.mistakeDetails);
        let parsedKeyHistory: KeyLog[] = [];
        if (result.keyHistory) {
          parsedKeyHistory = JSON.parse(result.keyHistory);
        }

        if (Array.isArray(parsedMistakes)) {
          analysisData.push({
            // minimal TypingResult for analysis
            wpm: result.wpm,
            accuracy: result.accuracy,
            score: result.score,
            mistakeCount: parsedMistakes.length,
            mistakes: parsedMistakes,
            keyHistory: parsedKeyHistory,
            startTime: 0,
            endTime: 0,
            totalKeystrokes: result.totalKeystrokes,
            correctKeystrokes: result.correctKeystrokes,
            correctKanaUnits: 0,
            typedText: '',
            displayText: result.text,
            displayUnits: [],
          });
        }
      } catch (e) {
        console.error("Failed to parse details", e);
      }
    });

    const analysis = analyzeWeaknesses(analysisData);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing weakness:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
