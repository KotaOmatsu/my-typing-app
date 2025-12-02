"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import LoginStatus from "../components/LoginStatus";
import { useGameSettings } from "../hooks/useGameSettings";
import { Course } from "../types/typing"; // Import from types
import CourseCard from "../components/CourseCard";
import CourseDetailModal from "../components/CourseDetailModal";

export default function Home() {
  const router = useRouter();
  const { settings, updateSettings } = useGameSettings();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        if (response.ok) {
          const data = await response.json();
          setCourses(data);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseSelect = (course: Course) => {
    // 詳細モーダル表示のために詳細データが必要な場合、ここで再度fetchするか、
    // 一覧APIで必要なデータ（description等）は取得済みとする。
    // 現在のAPI実装では description も取得しているのでそのまま使える。
    // ただし、texts は一覧には含まれないため、Start時にfetchするか、モーダルでfetchする必要がある。
    // モーダルで「収録テキスト例」を表示しているため、ここで詳細APIを叩くのがベスト。
    
    // 今回は簡易的に、一覧のデータをそのままセットし、モーダル内でテキスト例が表示されなくてもエラーにならないようにする（Optional chainなどで対応済）
    // または、CourseDetailModal内でfetchロジックを追加する。
    // ここでは一旦そのままセットする。テキスト例が表示されない場合は後でモーダルを改修する。
    setSelectedCourse(course);
  };

  const handleStart = (courseId: string) => {
    router.push(`/typing/${courseId}`);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 py-2 relative">
      {/* ヘッダー（ログイン状態など） */}
      <header className="w-full p-4 flex justify-between items-center shadow-sm bg-white z-50 mb-8">
         <div className="text-xl font-bold text-gray-800 ml-4">Typing App</div>
         <LoginStatus />
      </header>

      <main className="flex flex-col items-center w-full flex-1 px-4 md:px-20 text-center max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          練習コースを選択
        </h1>

        <p className="text-xl text-gray-600 mb-12">
          自分のレベルや目的に合ったコースを選んで練習を始めましょう。
        </p>

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
        />
      )}
    </div>
  );
}
