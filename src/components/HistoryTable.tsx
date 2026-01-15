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
      <div className="overflow-x-auto relative border border-border rounded-sm">
        <table className="w-full text-sm text-left text-muted-foreground font-mono">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
            <tr>
              <th scope="col" className="py-3 px-6 font-medium tracking-wider">
                DATE
              </th>
              <th scope="col" className="py-3 px-6 font-medium tracking-wider">
                SCORE
              </th>
              <th scope="col" className="py-3 px-6 font-medium tracking-wider">
                WPM
              </th>
              <th scope="col" className="py-3 px-6 font-medium tracking-wider">
                ACCURACY
              </th>
              <th scope="col" className="py-3 px-6 font-medium tracking-wider">
                MISS
              </th>
              <th scope="col" className="py-3 px-6 font-medium tracking-wider">
                TEXT
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {visibleResults.map((result) => (
              <tr key={result.id} className="hover:bg-muted/30 transition-colors">
                <th scope="row" className="py-4 px-6 font-medium text-foreground whitespace-nowrap">
                  {new Date(result.createdAt).toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </th>
                <td className="py-4 px-6 font-bold text-foreground">
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
                <td className="py-4 px-6 max-w-xs truncate opacity-80" title={result.text}>
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
            className="flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-sm shadow-sm text-foreground font-medium hover:bg-muted transition-colors text-xs uppercase tracking-widest"
          >
            <span>Show All Records ({results.length})</span>
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
            className="p-2 rounded-sm border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
            aria-label="First Page"
          >
            &laquo;
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-sm border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
            aria-label="Previous Page"
          >
            &lt;
          </button>

          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-10 h-10 flex items-center justify-center rounded-sm border font-mono text-sm transition-colors ${
                currentPage === page
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-foreground border-border hover:bg-muted'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-sm border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
            aria-label="Next Page"
          >
            &gt;
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-sm border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
            aria-label="Last Page"
          >
            &raquo;
          </button>
        </div>
      )}
      
      {isExpanded && (
          <div className="flex justify-center">
            <button 
                onClick={() => { setIsExpanded(false); setCurrentPage(1); }}
                className="text-xs text-muted-foreground hover:text-foreground underline uppercase tracking-widest"
            >
                COLLAPSE HISTORY
            </button>
          </div>
      )}
    </div>
  );
}
