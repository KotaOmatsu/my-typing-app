'use client';

import React from 'react';
import Link from 'next/link';
import LoginStatus from './LoginStatus';

const Header: React.FC = () => {
  return (
    <header className="w-full py-4 px-6 flex justify-between items-center border-b border-border bg-background/80 backdrop-blur-sm z-50 sticky top-0">
      <Link href="/" className="text-xl font-bold font-mono tracking-tight text-foreground hover:text-muted-foreground transition-colors">
        PRECISION_TYPING
      </Link>
      <LoginStatus />
    </header>
  );
};

export default Header;
