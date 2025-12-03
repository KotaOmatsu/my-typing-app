'use client';

import React from 'react';
import Link from 'next/link';
import LoginStatus from './LoginStatus';

const Header: React.FC = () => {
  return (
    <header className="w-full p-4 flex justify-between items-center shadow-sm bg-white z-50 mb-8">
      <Link href="/" className="text-xl font-bold text-gray-800 ml-4 hover:text-gray-600 transition">
        Typing App
      </Link>
      <LoginStatus />
    </header>
  );
};

export default Header;
