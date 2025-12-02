'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import CourseForm, { CourseFormData } from '@/components/CourseForm';

export default function EditCoursePage({ params }: { params: { courseId: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [initialData, setInitialData] = useState<CourseFormData | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${params.courseId}`);
        if (!res.ok) throw new Error('Failed to fetch course');
        const data = await res.json();
        
        // 編集権限チェック (クライアントサイド)
        // ※ API側でもチェックするが、ここでもリダイレクトさせる
        if (session?.user?.id && data.authorId && session.user.id !== data.authorId) {
          router.push('/');
          return;
        }

        setInitialData({
          title: data.title,
          description: data.description || '',
          difficulty: data.difficulty,
          isPublic: data.isPublic,
          texts: data.texts.map((t: any) => ({
            id: t.id,
            display: t.display,
            reading: t.reading,
          })),
        });
      } catch (err) {
        console.error(err);
        setError('コース情報の取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchCourse();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [params.courseId, status, session, router]);

  const handleUpdate = async (data: CourseFormData) => {
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/courses/${params.courseId}`, {
        method: 'PUT', // または PATCH
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to update course');
      }

      router.push('/'); // 完了後はトップへ
    } catch (err) {
      console.error(err);
      setError('コースの更新に失敗しました。');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || status === 'loading') return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          コースを編集
        </h1>

        <CourseForm
          initialData={initialData}
          onSubmit={handleUpdate}
          isSubmitting={submitting}
          submitLabel="変更を保存"
        />
      </div>
    </div>
  );
}
