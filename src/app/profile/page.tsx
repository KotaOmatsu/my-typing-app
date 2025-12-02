'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import LoginStatus from '@/components/LoginStatus';
import CourseCard from '@/components/CourseCard';
import CourseDetailModal from '@/components/CourseDetailModal';
import { Course } from '@/types/typing';
import { useGameSettings } from '@/hooks/useGameSettings';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { settings, updateSettings } = useGameSettings();
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.id) {
      const fetchMyCourses = async () => {
        try {
          const res = await fetch(`/api/courses?authorId=${session.user.id}`);
          if (res.ok) {
            const data = await res.json();
            setMyCourses(data);
          }
        } catch (error) {
          console.error('Failed to fetch my courses:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchMyCourses();
    }
  }, [status, session, router]);

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleStart = (courseId: string) => {
    router.push(`/typing/${courseId}`);
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const res = await fetch(`/api/courses/${courseId}`, { method: 'DELETE' });
      if (res.ok) {
        setMyCourses(myCourses.filter(c => c.id !== courseId));
        setSelectedCourse(null);
        alert('コースを削除しました');
      } else {
        alert('削除に失敗しました');
      }
    } catch (error) {
      console.error(error);
      alert('エラーが発生しました');
    }
  };

  const handleEditCourse = (courseId: string) => {
    router.push(`/courses/${courseId}/edit`);
  };

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-2 relative">
      <header className="w-full p-4 flex justify-between items-center shadow-sm bg-white z-50 mb-8">
         <Link href="/" className="text-xl font-bold text-gray-800 ml-4 hover:text-blue-600 transition">
           Typing App
         </Link>
         <LoginStatus />
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        {/* プロフィールヘッダー */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          {session?.user?.image ? (
            <img src={session.user.image} alt={session.user.name || ''} className="w-24 h-24 rounded-full border-4 border-blue-50" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-4xl">
              👤
            </div>
          )}
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{session?.user?.name}</h1>
            <p className="text-gray-500">{session?.user?.email}</p>
            <div className="mt-6 flex gap-4 justify-center md:justify-start">
              <Link href="/history" className="px-6 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition">
                📊 成績履歴を見る
              </Link>
              <Link href="/courses/create" className="px-6 py-2 bg-green-50 text-green-700 font-semibold rounded-lg hover:bg-green-100 transition">
                ＋ コースを作成
              </Link>
            </div>
          </div>
        </div>

        {/* 作成したコース */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-blue-500 pl-4">
          作成したコース ({myCourses.length})
        </h2>

        {myCourses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border-dashed border-2 border-gray-200">
            <p className="text-gray-500 text-lg mb-4">まだコースを作成していません。</p>
            <Link href="/courses/create" className="text-blue-600 hover:underline font-medium">
              最初のコースを作ってみましょう！
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {myCourses.map((course) => (
              <div key={course.id} className="relative">
                {!course.isPublic && (
                  <div className="absolute top-2 right-2 z-10 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-75">
                    非公開
                  </div>
                )}
                <CourseCard 
                  course={course} 
                  onSelect={handleCourseSelect} 
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedCourse && (
        <CourseDetailModal
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          course={selectedCourse}
          settings={settings}
          onUpdateSettings={updateSettings}
          onStart={handleStart}
          onDelete={handleDeleteCourse}
          onEdit={handleEditCourse}
        />
      )}
    </div>
  );
}
