"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import LoginStatus from "../components/LoginStatus";
import { useGameSettings } from "../hooks/useGameSettings";
import { COURSES, Course } from "../data/courses";
import CourseCard from "../components/CourseCard";
import CourseDetailModal from "../components/CourseDetailModal";

export default function Home() {
  const router = useRouter();
  const { settings, updateSettings } = useGameSettings();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const handleCourseSelect = (course: Course) => {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {COURSES.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              onSelect={handleCourseSelect} 
            />
          ))}
        </div>
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
