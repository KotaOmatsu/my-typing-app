'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import CourseCard from '@/components/CourseCard';
import CourseDetailModal from '@/components/CourseDetailModal';
import { Course } from '@/types/typing';
import { useGameSettings } from '@/hooks/useGameSettings';

import Image from 'next/image'; // Import Image

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status, update } = useSession(); // added update
  const { settings, updateSettings } = useGameSettings();
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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

  // Profile Edit Handlers
  const handleEdit = () => {
    setEditName(session?.user?.name || '');
    setEditImage(session?.user?.image || '');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName('');
    setEditImage('');
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, image: editImage }),
      });

      if (!res.ok) throw new Error('Failed to update');

      // Update session on client side to reflect changes immediately
      await update(); // This will re-fetch the session from the server
      
      setIsEditing(false);
      router.refresh(); // Refresh server components if any
    } catch (error) {
      console.error(error);
      alert('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
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
      <main className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        {/* プロフィールヘッダー */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
            {isEditing ? (
                // 編集モード
                <div className="flex flex-col md:flex-row gap-6 w-full">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-100 relative bg-gray-100">
                             {editImage ? (
                                <Image src={editImage} alt="Preview" fill className="object-cover" unoptimized />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">👤</div>
                             )}
                        </div>
                        <span className="text-xs text-gray-500">プレビュー</span>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ユーザー名</label>
                            <input 
                                type="text" 
                                value={editName} 
                                onChange={(e) => setEditName(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">アイコン画像URL</label>
                            <input 
                                type="text" 
                                value={editImage} 
                                onChange={(e) => setEditImage(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                placeholder="https://example.com/my-icon.png"
                            />
                            <p className="text-xs text-gray-500 mt-1">※ 画像のURLを直接入力してください。</p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button 
                                onClick={handleSaveProfile} 
                                disabled={isSaving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isSaving ? '保存中...' : '保存する'}
                            </button>
                            <button 
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                // 通常表示モード
                <>
                    {session?.user?.image ? (
                        <Image src={session.user.image} alt={session.user.name || 'User avatar'} width={96} height={96} className="w-24 h-24 rounded-full border-4 border-blue-50 object-cover" />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-4xl">
                        👤
                        </div>
                    )}
                    <div className="text-center md:text-left flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-800">{session?.user?.name}</h1>
                            <button 
                                onClick={handleEdit}
                                className="text-gray-400 hover:text-blue-600 transition"
                                title="プロフィールを編集"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-6 flex gap-4 justify-center md:justify-start">
                        <Link href="/history" className="px-6 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition">
                            📊 成績履歴を見る
                        </Link>
                        <Link href="/courses/create" className="px-6 py-2 bg-green-50 text-green-700 font-semibold rounded-lg hover:bg-green-100 transition">
                            ＋ コースを作成
                        </Link>
                        </div>
                    </div>
                </>
            )}
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
