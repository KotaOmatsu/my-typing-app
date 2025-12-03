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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 苦手なキー (Missed Keys) */}
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <h3 className="text-lg font-semibold text-red-800 mb-3">苦手なキー (打てなかったキー)</h3>
          <ul>
            {analysis.missedKeys.length > 0 ? analysis.missedKeys.map((item, index) => (
              <li key={index} className="flex justify-between items-center border-b border-red-200 last:border-0 py-2">
                <span className="text-2xl font-mono font-bold text-red-600 w-8 text-center">{item.key}</span>
                <span className="text-sm text-red-700">{item.count}回</span>
              </li>
            )) : <li className="text-gray-500 py-2">データなし</li>}
          </ul>
        </div>

        {/* 誤打キー (Accidental Keys) */}
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
          <h3 className="text-lg font-semibold text-orange-800 mb-3">誤打キー (つい押してしまうキー)</h3>
          <ul>
            {analysis.accidentalKeys.length > 0 ? analysis.accidentalKeys.map((item, index) => (
              <li key={index} className="flex justify-between items-center border-b border-orange-200 last:border-0 py-2">
                <span className="text-2xl font-mono font-bold text-orange-600 w-8 text-center">{item.key}</span>
                <span className="text-sm text-orange-700">{item.count}回</span>
              </li>
            )) : <li className="text-gray-500 py-2">データなし</li>}
          </ul>
        </div>

        {/* 詳細なミスパターン (Miss Patterns) */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">ミスパターン (正解 -> 誤打)</h3>
          <ul>
            {analysis.missPatterns.length > 0 ? analysis.missPatterns.map((item, index) => (
              <li key={index} className="flex justify-between items-center border-b border-yellow-200 last:border-0 py-2">
                <span className="text-sm font-mono font-medium text-yellow-900">{item.pattern}</span>
                <span className="text-sm text-yellow-700">{item.count}回</span>
              </li>
            )) : <li className="text-gray-500 py-2">データなし</li>}
          </ul>
        </div>

        {/* 苦手なシーケンス (Sequence Weaknesses) */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">苦手な並び (前のキー -> 苦手キー)</h3>
          <ul>
            {analysis.sequenceWeaknesses.length > 0 ? analysis.sequenceWeaknesses.map((item, index) => (
              <li key={index} className="flex justify-between items-center border-b border-blue-200 last:border-0 py-2">
                <span className="text-sm font-mono font-medium text-blue-900">{item.pattern}</span>
                <span className="text-sm text-blue-700">{item.count}回</span>
              </li>
            )) : <li className="text-gray-500 py-2">データなし</li>}
          </ul>
        </div>

      </div>

      {/* 苦手な指 (Worst Finger) */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col items-center justify-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">最も苦手な指</h3>
        <div className="text-3xl font-bold text-gray-800">
          {analysis.worstFinger}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          この指を使うキー入力でミスが目立ちます。
        </p>
      </div>
    </div>
  );
};

export default WeaknessAnalysisDisplay;
