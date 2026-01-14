import React from 'react';
import TypingGame from '@/components/TypingGame';

const TypingPage = ({ params }: { params: { courseId: string } }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-64px)] overflow-hidden bg-gray-100">
      <main className="flex flex-col items-center justify-center w-full h-full px-4">
        <TypingGame courseId={params.courseId} />
      </main>
    </div>
  );
};

export default TypingPage;
