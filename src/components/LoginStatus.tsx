'use client';

import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LoginStatus() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="h-10 w-24 animate-pulse bg-muted rounded-sm"></div>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        {session.user?.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || 'User avatar'}
            width={32}
            height={32}
            className="rounded-full border border-border"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-muted border border-border" />
        )}
        <p className="hidden sm:block text-sm font-medium text-foreground mr-2">
          {session.user?.name}
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/history">HISTORY</Link>
        </Button>
        <Button asChild variant="default" size="sm">
          <Link href="/profile">PROFILE</Link>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => signOut()}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          LOGOUT
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Button asChild size="sm">
        <Link href="/login">LOGIN</Link>
      </Button>
    </div>
  );
}
