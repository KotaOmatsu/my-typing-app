import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      wpm,
      accuracy,
      mistakeCount,
      score,
      totalKeystrokes,
      correctKeystrokes,
      text,
      mistakeDetails,
      keyHistory,
      courseId, // Added courseId
    } = body;

    // Basic validation
    if (
      typeof wpm !== 'number' ||
      typeof accuracy !== 'number' ||
      typeof mistakeCount !== 'number' ||
      typeof totalKeystrokes !== 'number' ||
      typeof correctKeystrokes !== 'number' ||
      typeof text !== 'string' ||
      !Array.isArray(mistakeDetails) ||
      !Array.isArray(keyHistory) ||
      (courseId !== undefined && typeof courseId !== 'string')
    ) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const result = await prisma.typingResult.create({
      data: {
        userId: session.user.id,
        wpm,
        accuracy,
        mistakeCount,
        score: score ?? 0, // Use 0 if score is undefined
        totalKeystrokes,
        correctKeystrokes,
        text,
        // Convert mistakeDetails array to a JSON string
        mistakeDetails: JSON.stringify(mistakeDetails),
        keyHistory: JSON.stringify(keyHistory),
        courseId, // Added courseId
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error saving typing result:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
