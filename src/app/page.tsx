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

  useEffect(() => {
    let ignore = false;
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (selectedDifficulty !== 'All') params.append('difficulty', selectedDifficulty);

        const response = await fetch(`/api/courses?${params.toString()}`);
        if (response.ok && !ignore) {
          const data = await response.json();
          setCourses(data);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    const timerId = setTimeout(() => {
      fetchCourses();
    }, 300);

    return () => {
      clearTimeout(timerId);
      ignore = true;
    };
  }, [searchQuery, selectedDifficulty]);

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
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {courses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                onSelect={handleCourseSelect} 
              />
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
