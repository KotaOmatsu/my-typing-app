'use client';

import { useState } from 'react';
import { HistoryResult } from '@/types/typing';

interface HistoryTableProps {
  results: HistoryResult[];
}

const ITEMS_PER_PAGE = 20;

export default function HistoryTable({ results }: HistoryTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);

  const visibleResults = !isExpanded
    ? results.slice(0, 10)
    : results.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // ページネーションのボタン生成（現在のページの前後を表示）
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="py-3 px-6">
                実施日時
              </th>
              <th scope="col" className="py-3 px-6">
                スコア
              </th>
              <th scope="col" className="py-3 px-6">
                WPM
              </th>
              <th scope="col" className="py-3 px-6">
                正解率
              </th>
              <th scope="col" className="py-3 px-6">
                ミス回数
              </th>
              <th scope="col" className="py-3 px-6">
                練習文章
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleResults.map((result) => (
              <tr key={result.id} className="bg-white border-b hover:bg-gray-50">
                <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                  {new Date(result.createdAt).toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </th>
                <td className="py-4 px-6 font-semibold text-gray-900">
                  {result.score}
                </td>
                <td className="py-4 px-6">
                  {result.wpm.toFixed(2)}
                </td>
                <td className="py-4 px-6">
                  {result.accuracy.toFixed(2)}%
                </td>
                <td className="py-4 px-6">
                  {result.mistakeCount}
                </td>
                <td className="py-4 px-6 max-w-xs truncate" title={result.text}>
                  {result.text}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 「もっと見る」トグルボタン */}
      {!isExpanded && results.length > 10 && (
        <div className="flex justify-center">
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-full shadow-sm text-gray-700 font-medium hover:bg-gray-50 hover:text-blue-600 transition-colors"
          >
            <span>すべての履歴を見る ({results.length}件)</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>
      )}

      {/* ページネーション */}
      {isExpanded && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 py-2">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="最初のページ"
          >
            &laquo;
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="前のページ"
          >
            &lt;
          </button>

          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-10 h-10 flex items-center justify-center rounded-md border ${
                currentPage === page
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="次のページ"
          >
            &gt;
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="最後のページ"
          >
            &raquo;
          </button>
        </div>
      )}
      
      {isExpanded && (
          <div className="flex justify-center">
            <button 
                onClick={() => { setIsExpanded(false); setCurrentPage(1); }}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
                履歴を閉じる
            </button>
          </div>
      )}
    </div>
  );
}
