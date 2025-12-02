'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import CourseForm, { CourseFormData } from '@/components/CourseForm';

export default function CreateCoursePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleCreate = async (data: CourseFormData) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to create course');
      }

      router.push('/'); // 作成後はトップページへ
    } catch (err) {
      console.error(err);
      setError('コースの作成に失敗しました。');
      // エラーをCourseForm側で表示させるためにthrowするか、
      // ここでstate管理して渡すか。
      // 今回はCourseForm内のerror stateはローカルなので、
      // 親でエラー表示するか、throwしてCourseFormでcatchさせる。
      // CourseFormは `await onSubmit` してcatchしているので、ここでthrowすればOK。
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          新しいコースを作成
        </h1>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        <CourseForm
          onSubmit={handleCreate}
          isSubmitting={loading}
          submitLabel="コースを作成して公開"
        />
      </div>
    </div>
  );
}
