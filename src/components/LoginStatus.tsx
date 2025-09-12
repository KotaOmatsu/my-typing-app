'use client';

import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginStatus() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="h-10 w-24 animate-pulse bg-gray-200 rounded-md"></div>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        {session.user?.image && (
          <Image
            src={session.user.image}
            alt={session.user.name || 'User avatar'}
            width={40}
            height={40}
            className="rounded-full"
          />
        )}
        <p className="hidden sm:block">
          {session.user?.name}
        </p>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600"
        >
          ログアウト
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/login"
        className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        ログイン
      </Link>
    </div>
  );
}
