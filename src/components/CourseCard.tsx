import React from 'react';
import { Course } from '@/types/typing';

interface CourseCardProps {
  course: Course;
  onSelect: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onSelect }) => {
  const difficultyColor = {
    Easy: 'bg-green-100 text-green-800',
    Normal: 'bg-blue-100 text-blue-800',
    Hard: 'bg-red-100 text-red-800',
  }[course.difficulty] || 'bg-gray-100 text-gray-800'; // Default fallback

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer border border-gray-200 flex flex-col h-full"
      onClick={() => onSelect(course)}
    >
      <div className="h-32 bg-gray-200 flex items-center justify-center relative">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400 text-4xl">⌨️</span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow text-left">
        <div className="flex justify-between items-start mb-2">
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${difficultyColor}`}>
            {course.difficulty}
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h3>
        <p className="text-gray-600 text-sm flex-grow">{course.description}</p>
        <div className="mt-4 text-right text-sm text-blue-600 font-semibold group-hover:underline">
          選択する →
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
