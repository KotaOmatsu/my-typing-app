'use client';

import { signIn } from 'next-auth/react';
// import { useRouter } from 'next/navigation';

const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
    <path fill="#FF3D00" d="M6.306 14.691l6.057 4.714C14.67 15.905 18.96 14 24 14c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.6-1.977 12.6-5.2l-5.6-4.4c-1.8 1.2-4.1 2-6.9 2-5.2 0-9.6-3.3-11.1-7.9l-6.1 4.7c3.3 6.5 9.9 11 17.1 11z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.16-4.087 5.571l5.6 4.4c3.2-2.8 5.5-7.2 5.5-12.1.1-1.3-.1-2.6-.4-3.9z"/>
  </svg>
);

export default function LoginPage() {
  // const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">ログイン</h1>
        <div className="space-y-4">
          <button
            onClick={() => signIn('github', { callbackUrl: '/' })}
            className="w-full px-4 py-3 font-semibold text-white bg-gray-700 rounded-lg hover:bg-gray-800 transition-colors duration-300 flex items-center justify-center gap-3"
          >
            <GithubIcon />
            GitHubでログイン
          </button>
          <button
            onClick={() => signIn('google', { callbackUrl: '/' }, { prompt: "select_account" })}
            className="w-full px-4 py-3 font-semibold text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-300 flex items-center justify-center gap-3"
          >
            <GoogleIcon />
            Googleでログイン
          </button>
        </div>
        {/* <div className="mt-8 text-center">
          <button onClick={() => router.push('/')} className="text-sm text-gray-600 hover:underline">
            トップページに戻る
          </button>
        </div> */}
      </div>
    </div>
  );
}
