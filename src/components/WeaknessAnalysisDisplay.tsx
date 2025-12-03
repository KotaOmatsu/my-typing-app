import React, { useState } from 'react';
import { WeaknessAnalysis, FingerScore, KeyScore, MissCategory } from '@/utils/analysisUtils';

interface WeaknessAnalysisDisplayProps {
  analysis: WeaknessAnalysis | null;
}

const WeaknessAnalysisDisplay: React.FC<WeaknessAnalysisDisplayProps> = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState<'keys' | 'patterns' | 'trends'>('keys');

  if (!analysis || analysis.totalMistakes === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow text-center text-gray-500">
        <p>十分なデータがありません。</p>
      </div>
    );
  }

  // Helper for heat color
  const getHeatColor = (score: number) => {
    if (score === 0) return 'bg-gray-100';
    if (score < 20) return 'bg-yellow-100';
    if (score < 50) return 'bg-orange-200';
    return 'bg-red-300'; // Intense red for bad areas
  };

  const topCategory = analysis.missCategories[0];

  return (
    <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">タイピング診断</h2>
        <p className="text-lg text-gray-600">
          あなたの弱点は <span className="font-bold text-red-600">{analysis.worstFinger}</span> と <span className="font-bold text-red-600">{topCategory?.label || '不明'}</span> です。
        </p>
        {topCategory && (
            <div className="mt-2 p-3 bg-white border border-l-4 border-l-blue-500 rounded text-blue-800 text-sm">
                <span className="font-bold">処方箋:</span> {topCategory.description}
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        
        {/* Left: Visual Heatmap (Finger & Keyboard) */}
        <div className="col-span-1 lg:col-span-1 p-6 border-r border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Finger Heatmap</h3>
            <div className="flex justify-center space-x-1 mb-8">
                {analysis.fingerScores.map((fs, idx) => (
                    <div key={idx} className="flex flex-col items-center group relative">
                        <div 
                            className={`w-4 h-12 rounded-t-full border border-gray-300 ${getHeatColor(fs.score)} transition-colors`}
                            title={`${fs.finger}: ${fs.missCount} miss`}
                        ></div>
                        <span className="text-xs mt-1 text-gray-500">{fs.finger[1]}</span>{/* Show abbreviated finger name e.g. 小 */}
                    </div>
                ))}
            </div>
            
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Keyboard Heatmap</h3>
            <div className="grid grid-cols-10 gap-1 text-xs">
                {/* Simplified Keyboard Grid for visualization */}
                {/* Row 1 */}
                {['1','2','3','4','5','6','7','8','9','0'].map(k => <Key key={k} char={k} score={getKeyScore(k, analysis.keyScores)} />)}
                {/* Row 2 */}
                {['q','w','e','r','t','y','u','i','o','p'].map(k => <Key key={k} char={k} score={getKeyScore(k, analysis.keyScores)} />)}
                {/* Row 3 */}
                {['a','s','d','f','g','h','j','k','l',';'].map(k => <Key key={k} char={k} score={getKeyScore(k, analysis.keyScores)} />)}
                {/* Row 4 */}
                {['z','x','c','v','b','n','m',',','.','/'].map(k => <Key key={k} char={k} score={getKeyScore(k, analysis.keyScores)} />)}
            </div>
        </div>

        {/* Right: Detailed Data with Tabs */}
        <div className="col-span-1 lg:col-span-2 flex flex-col">
            <div className="flex border-b border-gray-200">
                <button 
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === 'keys' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('keys')}
                >
                    苦手キー
                </button>
                <button 
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === 'patterns' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('patterns')}
                >
                    ミスパターン
                </button>
                <button 
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === 'trends' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('trends')}
                >
                    傾向診断
                </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto max-h-[400px]">
                {activeTab === 'keys' && (
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-bold text-red-600 mb-2">打てなかったキー (Missed)</h4>
                            <ul className="grid grid-cols-2 gap-2">
                                {analysis.missedKeys.slice(0, 6).map((item, i) => (
                                    <li key={i} className="flex justify-between p-2 bg-red-50 rounded">
                                        <span className="font-mono font-bold text-gray-700 uppercase">{item.key}</span>
                                        <span className="text-sm text-gray-500">{item.count}回</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-orange-600 mb-2">誤って押したキー (Accidental)</h4>
                            <ul className="grid grid-cols-2 gap-2">
                                {analysis.accidentalKeys.slice(0, 6).map((item, i) => (
                                    <li key={i} className="flex justify-between p-2 bg-orange-50 rounded">
                                        <span className="font-mono font-bold text-gray-700 uppercase">{item.key}</span>
                                        <span className="text-sm text-gray-500">{item.count}回</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'patterns' && (
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-bold text-yellow-600 mb-2">よくある間違い (正解 -> 誤打)</h4>
                            <ul>
                                {analysis.missPatterns.slice(0, 8).map((item, i) => (
                                    <li key={i} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                                        <span className="font-mono text-sm text-gray-700">{item.pattern}</span>
                                        <span className="text-sm text-gray-500">{item.count}回</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-blue-600 mb-2">苦手な流れ (前のキー -> 次のキー)</h4>
                            <ul>
                                {analysis.sequenceWeaknesses.slice(0, 8).map((item, i) => (
                                    <li key={i} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                                        <span className="font-mono text-sm text-gray-700">{item.pattern}</span>
                                        <span className="text-sm text-gray-500">{item.count}回</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'trends' && (
                    <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-4">ミス傾向の分類</h4>
                        <div className="space-y-3">
                            {analysis.missCategories.map((cat, i) => (
                                <div key={i} className="p-3 border border-gray-200 rounded hover:bg-gray-50 transition">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-gray-800">{cat.label}</span>
                                        <span className="text-sm font-mono bg-gray-200 px-2 rounded-full">{cat.count}回</span>
                                    </div>
                                    <p className="text-xs text-gray-500">{cat.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

const Key = ({ char, score }: { char: string, score: number }) => {
    // Color scale
    let bgColor = 'bg-white';
    if (score > 0) bgColor = 'bg-yellow-100';
    if (score > 30) bgColor = 'bg-orange-200';
    if (score > 60) bgColor = 'bg-red-300';
    if (score > 80) bgColor = 'bg-red-500 text-white';

    return (
        <div className={`aspect-square flex items-center justify-center border border-gray-300 rounded ${bgColor} font-mono uppercase font-bold shadow-sm`}>
            {char}
        </div>
    );
}

function getKeyScore(key: string, scores: KeyScore[]): number {
    const found = scores.find(s => s.key.toLowerCase() === key.toLowerCase());
    return found ? found.score : 0;
}

export default WeaknessAnalysisDisplay;
