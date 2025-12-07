import React from 'react';
import { Course } from '@/types/typing';

interface CourseCardProps {
  course: Course;
  onSelect: (course: Course) => void;
  onToggleFavorite?: (courseId: string) => void; // 追加
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onSelect, onToggleFavorite }) => {
  const difficultyColor = {
    Easy: 'bg-green-100 text-green-800',
    Normal: 'bg-blue-100 text-blue-800',
    Hard: 'bg-red-100 text-red-800',
  }[course.difficulty] || 'bg-gray-100 text-gray-800'; // Default fallback

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(course.id);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer border border-gray-200 flex flex-col h-full group relative"
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
        
        {/* お気に入りボタン */}
        {onToggleFavorite && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none z-10"
            title={course.isFavorite ? "お気に入り解除" : "お気に入り登録"}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 ${course.isFavorite ? 'text-pink-500 fill-current' : 'text-gray-400'}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
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
