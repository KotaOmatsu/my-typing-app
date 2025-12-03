import React from 'react';
import TypingGame from '@/components/TypingGame';

const TypingPage = ({ params }: { params: { courseId: string } }) => {
  // ここでcourseIdを使ってデータをフェッチしたり、設定を行ったりする予定
  // 現在はTypingGameがTYPING_TEXTSを直接インポートしているので、
  // TypingGameにcourseIdまたはtextsを渡すように変更が必要
  
  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <TypingGame courseId={params.courseId} />
      </main>
    </div>
  );
};

export default TypingPage;
