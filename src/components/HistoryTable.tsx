'use client';

import { TypingResult } from '@prisma/client';

// page.tsxから渡される結果の型。Dateが文字列にシリアライズされている。
type SerializableResult = Omit<TypingResult, 'createdAt'> & {
  createdAt: string;
};

interface HistoryTableProps {
  results: SerializableResult[];
}

export default function HistoryTable({ results }: HistoryTableProps) {
  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="py-3 px-6">
              実施日時
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
          {results.map((result) => (
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
  );
}
