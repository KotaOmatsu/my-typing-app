"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // Import useSession
import Link from "next/link"; // Import Link
import { useGameSettings } from "../hooks/useGameSettings";
import { Course } from "../types/typing"; // Import from types
import CourseCard from "../components/CourseCard";
import CourseDetailModal from "../components/CourseDetailModal";
import CourseFilters from "../components/CourseFilters";

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession(); // Get session
  const { settings, updateSettings } = useGameSettings();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    let ignore = false;
    const fetchCourses = async () => {
      setLoading(true);
      try {
        let url = '';
        if (showFavoritesOnly) {
          url = '/api/user/favorites';
        } else {
          const params = new URLSearchParams();
          if (searchQuery) params.append('search', searchQuery);
          if (selectedDifficulty !== 'All') params.append('difficulty', selectedDifficulty);
          url = `/api/courses?${params.toString()}`;
        }

        const response = await fetch(url);
        if (response.ok && !ignore) {
          const data = await response.json();
          // お気に入りタブでフィルタリングが必要な場合はクライアントサイドで行う
          // (API側が未対応のため。件数が少なければこれで十分)
          let filteredData = data;
          if (showFavoritesOnly) {
             // 念のためお気に入りフラグを立てておく（APIが返さない場合用）
             filteredData = filteredData.map((c: Course) => ({ ...c, isFavorite: true }));
             
             // クライアントサイドフィルタリング
             if (searchQuery) {
               const query = searchQuery.toLowerCase();
               filteredData = filteredData.filter((c: Course) => 
                 c.title.toLowerCase().includes(query) || 
                 (c.description && c.description.toLowerCase().includes(query))
               );
             }
             if (selectedDifficulty !== 'All') {
               filteredData = filteredData.filter((c: Course) => c.difficulty === selectedDifficulty);
             }
          }
          setCourses(filteredData);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    // デバウンス処理はお気に入りタブでは不要かもしれないが、統一して適用
    const timerId = setTimeout(() => {
      fetchCourses();
    }, 300);

    return () => {
      clearTimeout(timerId);
      ignore = true;
    };
  }, [searchQuery, selectedDifficulty, showFavoritesOnly]);

  const handleToggleFavorite = async (courseId: string) => {
    if (!session) {
      router.push('/login');
      return;
    }

    // 楽観的UI更新
    setCourses(prev => {
      if (showFavoritesOnly) {
        // お気に入り一覧表示時は、解除されたらリストから消す
        return prev.filter(c => c.id !== courseId);
      } else {
        // 通常一覧時はフラグを反転
        return prev.map(c => c.id === courseId ? { ...c, isFavorite: !c.isFavorite } : c);
      }
    });

    try {
      const res = await fetch(`/api/courses/${courseId}/favorite`, { method: 'POST' });
      if (!res.ok) {
        throw new Error('Failed to toggle favorite');
      }
    } catch (error) {
      console.error(error);
      alert('お気に入りの更新に失敗しました');
      // エラー時は再取得するか、状態を戻す処理が必要だが、簡略化のため割愛
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
        // 一覧から削除
        setCourses(courses.filter(c => c.id !== courseId));
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

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 py-2 relative">
      <main className="flex flex-col items-center w-full flex-1 px-4 md:px-20 text-center max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          練習コースを選択
        </h1>

        <p className="text-xl text-gray-600 mb-8">
          自分のレベルや目的に合ったコースを選んで練習を始めましょう。
        </p>

        {/* コース作成ボタン (ログイン時のみ表示) */}
        {session && (
          <div className="mb-12">
            <Link
              href="/courses/create"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              オリジナルコースを作成
            </Link>
          </div>
        )}

        {/* 検索・フィルター */}
        <div className="w-full mb-8">
          <CourseFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedDifficulty={selectedDifficulty}
            onDifficultyChange={setSelectedDifficulty}
            showFavoritesOnly={showFavoritesOnly}
            onShowFavoritesOnlyChange={setShowFavoritesOnly}
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {courses.length > 0 ? (
              courses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  onSelect={handleCourseSelect} 
                  onToggleFavorite={handleToggleFavorite}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                {showFavoritesOnly 
                  ? "お気に入りのコースはまだありません。" 
                  : "条件に一致するコースは見つかりませんでした。"}
              </div>
            )}
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
