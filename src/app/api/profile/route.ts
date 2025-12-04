import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT /api/profile
// ユーザープロフィール（名前、アイコン画像）の更新
export async function PUT(request: Request) {
  try {
    // 1. セッション取得と認証チェック
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. リクエストボディの検証
    const body = await request.json();
    const { name, image } = body;

    // 名前は必須ではないが、空文字や空白のみは許可しないなどのバリデーションが可能
    if (name !== undefined && typeof name !== 'string') {
        return NextResponse.json({ error: 'Invalid name format' }, { status: 400 });
    }
    
    // 画像URLの簡単な検証（本来はURL形式チェックなどを行うべき）
    if (image !== undefined) {
        if (typeof image !== 'string') {
             return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
        }
        try {
            new URL(image);
        } catch {
             return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 });
        }
    }

    // 3. データベース更新
    // session.user.email をキーにしてユーザーを特定
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name !== undefined ? name : undefined, // undefinedの場合は更新しない
        image: image !== undefined ? image : undefined,
      },
      select: {
        id: true,
        name: true,
        image: true,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
