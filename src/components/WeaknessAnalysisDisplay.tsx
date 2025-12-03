import React from 'react';
import { WeaknessAnalysis } from '@/utils/analysisUtils';

interface WeaknessAnalysisDisplayProps {
  analysis: WeaknessAnalysis | null;
}

const WeaknessAnalysisDisplay: React.FC<WeaknessAnalysisDisplayProps> = ({ analysis }) => {
  if (!analysis || analysis.totalMistakes === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow text-center text-gray-500">
        <p>十分なデータがありません。</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">苦手分析レポート</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ワーストキー */}
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <h3 className="text-lg font-semibold text-red-800 mb-3">誤タイプが多いキー</h3>
          <ul>
            {analysis.worstKeys.map((item, index) => (
              <li key={index} className="flex justify-between items-center border-b border-red-200 last:border-0 py-2">
                <span className="text-2xl font-mono font-bold text-red-600 w-8 text-center">{item.key}</span>
                <span className="text-sm text-red-700">{item.count}回</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 苦手な指 */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">最も苦手な指</h3>
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {analysis.worstFinger}
          </div>
          <p className="text-sm text-blue-700 text-center">
            この指を使うキー入力でミスが目立ちます。
          </p>
        </div>

        {/* ミスパターン */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">ミスの傾向</h3>
          <ul>
            {analysis.missPatterns.map((item, index) => (
              <li key={index} className="flex justify-between items-center border-b border-yellow-200 last:border-0 py-2">
                <span className="text-sm font-medium text-yellow-900">{item.pattern}</span>
                <span className="text-sm text-yellow-700">{item.count}回</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WeaknessAnalysisDisplay;
