import React from 'react';

interface CourseFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (value: string) => void;
  showFavoritesOnly: boolean;
  onShowFavoritesOnlyChange: (value: boolean) => void;
}

const CourseFilters: React.FC<CourseFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedDifficulty,
  onDifficultyChange,
  showFavoritesOnly,
  onShowFavoritesOnlyChange,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-8 border border-gray-100">
      {/* タブ切り替え (すべて / お気に入り) */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`py-2 px-4 text-sm font-medium focus:outline-none border-b-2 transition-colors duration-200 ${
            !showFavoritesOnly
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => onShowFavoritesOnlyChange(false)}
        >
          すべてのコース
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium focus:outline-none border-b-2 transition-colors duration-200 flex items-center ${
            showFavoritesOnly
              ? 'border-pink-500 text-pink-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => onShowFavoritesOnlyChange(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          お気に入り
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* 検索バー */}
        <div className="relative flex-grow w-full md:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {/* 検索アイコン (SVG) */}
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
            placeholder="コースを検索 (タイトル、説明文)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* 難易度フィルター */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <label htmlFor="difficulty" className="text-sm font-medium text-gray-700 whitespace-nowrap">
            難易度:
          </label>
          <select
            id="difficulty"
            className="block w-full md:w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={selectedDifficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
          >
            <option value="All">すべて</option>
            <option value="Easy">Easy</option>
            <option value="Normal">Normal</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default CourseFilters;
