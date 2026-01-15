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
  const [favoriteCourses, setFavoriteCourses] = useState<Course[]>([]);
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
      const fetchData = async () => {
        try {
          // 並行してデータ取得
          const [myCoursesRes, favCoursesRes] = await Promise.all([
            fetch(`/api/courses?authorId=${session.user.id}`),
            fetch('/api/user/favorites')
          ]);

          if (myCoursesRes.ok) {
            const data = await myCoursesRes.json();
            setMyCourses(data);
          }
          if (favCoursesRes.ok) {
            const data = await favCoursesRes.json();
            setFavoriteCourses(data);
          }
        } catch (error) {
          console.error('Failed to fetch data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [status, session, router]);

  const handleToggleFavorite = async (courseId: string) => {
    // お気に入り状態の確認 (お気に入りリストに含まれているか)
    const isCurrentlyFavorite = favoriteCourses.some(c => c.id === courseId);

    // 1. お気に入りリストの更新 (楽観的)
    if (isCurrentlyFavorite) {
      // 削除
      setFavoriteCourses(prev => prev.filter(c => c.id !== courseId));
    } else {
      // 追加 (自分のコースから追加された場合)
      const courseToAdd = myCourses.find(c => c.id === courseId);
      if (courseToAdd) {
        setFavoriteCourses(prev => [{ ...courseToAdd, isFavorite: true }, ...prev]);
      }
    }

    // 2. 作成したコースリストの更新 (フラグ反転)
    setMyCourses(prev => prev.map(c => c.id === courseId ? { ...c, isFavorite: !c.isFavorite } : c));

    try {
      const res = await fetch(`/api/courses/${courseId}/favorite`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to toggle favorite');
    } catch (error) {
      console.error(error);
      alert('お気に入りの更新に失敗しました');
      // 失敗時はリロードなどを促すのが無難だが、ここでは簡易化
    }
  };

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
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 relative">
      <main className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        {/* プロフィールヘッダー */}
        <div className="bg-card border border-border rounded-sm p-8 mb-12 flex flex-col md:flex-row items-center md:items-start gap-8">
            {isEditing ? (
                // 編集モード
                <div className="flex flex-col md:flex-row gap-8 w-full">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-24 h-24 rounded-full overflow-hidden border border-border relative bg-muted">
                             {editImage ? (
                                <Image src={editImage} alt="Preview" fill className="object-cover" unoptimized />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-4xl">👤</div>
                             )}
                        </div>
                        <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">PREVIEW</span>
                    </div>
                    <div className="flex-1 space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">USERNAME</label>
                            <input 
                                type="text"
                                name="username" 
                                value={editName || ''} 
                                onChange={(e) => setEditName(e.target.value)}
                                className="block w-full rounded-sm border-input bg-background shadow-sm focus:border-primary focus:ring-ring sm:text-sm p-3 border font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">ICON URL</label>
                            <input 
                                type="text"
                                name="iconUrl" 
                                value={editImage || ''} 
                                onChange={(e) => setEditImage(e.target.value)}
                                className="block w-full rounded-sm border-input bg-background shadow-sm focus:border-primary focus:ring-ring sm:text-sm p-3 border font-mono"
                                placeholder="https://example.com/my-icon.png"
                            />
                            <p className="text-xs text-muted-foreground mt-2 font-mono">Input direct image URL.</p>
                        </div>
                        <div className="flex gap-4 pt-2">
                            <button 
                                onClick={handleSaveProfile} 
                                disabled={isSaving}
                                className="px-6 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 disabled:opacity-50 text-sm font-bold uppercase tracking-widest"
                            >
                                {isSaving ? 'SAVING...' : 'SAVE'}
                            </button>
                            <button 
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                                className="px-6 py-2 bg-muted text-foreground border border-border rounded-sm hover:bg-muted/80 text-sm font-bold uppercase tracking-widest"
                            >
                                CANCEL
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                // 通常表示モード
                <>
                    {session?.user?.image ? (
                        <Image src={session.user.image} alt={session.user.name || 'User avatar'} width={96} height={96} className="w-24 h-24 rounded-full border border-border object-cover" unoptimized />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-4xl border border-border">
                        👤
                        </div>
                    )}
                    <div className="text-center md:text-left flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                            <h1 className="text-3xl font-bold text-foreground font-mono tracking-tight">{session?.user?.name}</h1>
                            <button 
                                onClick={handleEdit}
                                className="text-muted-foreground hover:text-foreground transition p-1"
                                title="Edit Profile"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex gap-4 justify-center md:justify-start">
                        <Link href="/history" className="px-6 py-2 bg-muted text-foreground border border-border font-medium rounded-sm hover:bg-muted/80 transition text-xs uppercase tracking-widest">
                            View History
                        </Link>
                        <Link href="/courses/create" className="px-6 py-2 bg-background text-foreground border border-input font-medium rounded-sm hover:bg-muted transition text-xs uppercase tracking-widest">
                            + CREATE ORIGINAL COURSE
                        </Link>
                        </div>
                    </div>
                </>
            )}
        </div>

        {/* 作成したコース */}
        <h2 className="text-sm font-bold text-muted-foreground mb-6 uppercase tracking-widest border-b border-border pb-2">
          Created Courses ({myCourses.length})
        </h2>

        {myCourses.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-sm border border-dashed border-border mb-12">
            <p className="text-muted-foreground text-sm font-mono mb-4">NO_COURSES_CREATED</p>
            <Link href="/courses/create" className="text-foreground hover:underline font-medium text-sm uppercase tracking-widest">
              CREATE YOUR FIRST MODULE
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {myCourses.map((course) => (
              <div key={course.id} className="relative group">
                {!course.isPublic && (
                  <div className="absolute top-2 right-2 z-10 bg-foreground text-background text-[10px] px-2 py-0.5 rounded-sm font-mono uppercase">
                    Private
                  </div>
                )}
                <CourseCard 
                  course={course} 
                  onSelect={handleCourseSelect} 
                  onToggleFavorite={handleToggleFavorite}
                />
              </div>
            ))}
          </div>
        )}

        {/* お気に入りのコース */}
        <h2 className="text-sm font-bold text-muted-foreground mb-6 uppercase tracking-widest border-b border-border pb-2">
          Favorite Courses ({favoriteCourses.length})
        </h2>

        {favoriteCourses.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-sm border border-dashed border-border">
            <p className="text-muted-foreground text-sm font-mono mb-4">NO_FAVORITES</p>
            <Link href="/" className="text-foreground hover:underline font-medium text-sm">
              Explore the archive
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteCourses.map((course) => (
              <div key={course.id} className="relative">
                <CourseCard 
                  course={course} 
                  onSelect={handleCourseSelect} 
                  onToggleFavorite={handleToggleFavorite}
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
