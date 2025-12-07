'use client';

import React, { useState } from 'react';
import { WeaknessAnalysis, KeyScore } from '@/utils/analysisUtils';

interface WeaknessAnalysisDisplayProps {
  analysis: WeaknessAnalysis | null;
}

const WeaknessAnalysisDisplay: React.FC<WeaknessAnalysisDisplayProps> = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState<'patterns' | 'trends' | 'advanced'>('patterns');

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
          あなたの弱点は <span className="font-bold text-red-600">{analysis.worstFinger}指</span> と <span className="font-bold text-red-600">{topCategory?.label || 'その他'}</span> です。
        </p>
        {topCategory && (
            <div className="mt-2 p-3 bg-white border border-l-4 border-l-blue-500 rounded text-blue-800 text-sm">
                <span className="font-bold">処方箋:</span> {topCategory.description}
            </div>
        )}
      </div>

      {/* 弱点インサイト (新機能) */}
      {analysis.insights && analysis.insights.length > 0 && (
        <div className="p-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">💡</span> あなたの弱点インサイト (AI分析)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysis.insights.map((insight, i) => {
                    const severityColor = 
                        insight.severity === 'High' ? 'border-l-red-500 bg-red-50 text-red-900' :
                        insight.severity === 'Medium' ? 'border-l-orange-500 bg-orange-50 text-orange-900' :
                        'border-l-yellow-500 bg-yellow-50 text-yellow-900';
                    
                    const badgeColor = 
                        insight.severity === 'High' ? 'bg-red-200 text-red-800' :
                        insight.severity === 'Medium' ? 'bg-orange-200 text-orange-800' :
                        'bg-yellow-200 text-yellow-800';

                    
                    const badgeText = 
                        insight.severity === 'High' ? '要改善' :
                        insight.severity === 'Medium' ? '注意' :
                        '軽微';

                    return (
                        <div key={i} className={`p-4 rounded-r-lg border border-gray-200 border-l-4 shadow-sm ${severityColor} bg-white`}>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-base">{insight.title}</h4>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${badgeColor}`}>
                                    {badgeText}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 leading-snug">{insight.description}</p>
                        </div>
                    );
                })}
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        
        {/* Left: Visual Heatmap (Finger & Keyboard) */}
        <div className="col-span-1 lg:col-span-1 p-6 border-r border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">指のヒートマップ</h3>
            <div className="flex justify-center items-end space-x-8 mb-8"> {/* Increased gap between hands */}
                
                {/* Left Hand: Pinky(0), Ring(1), Middle(2), Index(3), Thumb(4) */}
                <div className="flex space-x-1 items-end">
                    {analysis.fingerScores.slice(0, 5).map((fs) => { // slice(0,5) for left hand
                        const heights = { '左小': 12, '左薬': 16, '左中': 20, '左人': 18, '左親': 10 }; // Specific heights for each finger
                        return (
                            <div key={fs.finger} className="flex flex-col items-center group relative">
                                <div 
                                    className={`w-4 rounded-t-full border border-gray-300 ${getHeatColor(fs.score)} transition-colors`}
                                    style={{ height: `${(heights[fs.finger as keyof typeof heights] || 10) * 4}px` }} // Use specific height
                                    title={`${fs.finger}: ${fs.missCount} miss`}
                                ></div>
                                <span className="text-xs mt-1 text-gray-500">{fs.finger.slice(-1)}</span> {/* 例: 左小 -> 小 */}
                            </div>
                        );
                    })}
                </div>

                {/* Right Hand: Thumb(5), Index(6), Middle(7), Ring(8), Pinky(9) */}
                <div className="flex space-x-1 items-end">
                    {analysis.fingerScores.slice(5, 10).map((fs) => { // slice(5,10) for right hand
                        const heights = { '右親': 10, '右人': 18, '右中': 20, '右薬': 16, '右小': 12 }; // Specific heights for each finger
                        return (
                            <div key={fs.finger} className="flex flex-col items-center group relative">
                                <div 
                                    className={`w-4 rounded-t-full border border-gray-300 ${getHeatColor(fs.score)} transition-colors`}
                                    style={{ height: `${(heights[fs.finger as keyof typeof heights] || 10) * 4}px` }} // Use specific height
                                    title={`${fs.finger}: ${fs.missCount} miss`}
                                ></div>
                                <span className="text-xs mt-1 text-gray-500">{fs.finger.slice(-1)}</span> {/* 例: 右小 -> 小 */}
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">キーボードヒートマップ</h3>
            <div className="grid grid-cols-10 gap-1 text-xs mb-2">
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
            <p className="text-xs text-gray-400 text-center">打つべきだったのにミスしたキーの頻度</p>
        </div>

        {/* Right: Detailed Data with Tabs */}
        <div className="col-span-1 lg:col-span-2 flex flex-col">
            <div className="flex border-b border-gray-200">
                <button 
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === 'patterns' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('patterns')}
                >
                    ミスパターン
                </button>
                <button 
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === 'advanced' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('advanced')}
                >
                    高度分析
                </button>
                <button 
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === 'trends' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('trends')}
                >
                    傾向と対策
                </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto max-h-[400px]">
                {activeTab === 'patterns' && (
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-bold text-yellow-600 mb-2">よくある間違い (打つべきキー → 誤って入力したキー)</h4>
                            <ul>
                                {(analysis.missPatterns || []).slice(0, 8).map((item, i) => (
                                    <li key={i} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                                        <span className="font-mono text-sm text-gray-700">{item.pattern}</span>
                                        <span className="text-sm text-gray-500">{item.count}回</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-blue-600 mb-2">苦手なキーの連続 (前のキー → 次に打つべきキー)</h4>
                            <ul>
                                {(analysis.sequenceWeaknesses || []).slice(0, 8).map((item, i) => (
                                    <li key={i} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                                        <span className="font-mono text-sm text-gray-700">{item.pattern}</span>
                                        <span className="text-sm text-gray-500">{item.count}回</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'advanced' && (
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-bold text-purple-600 mb-2">
                                運指の連動性 (Same Finger Transitions)
                            </h4>
                            <p className="text-xs text-gray-500 mb-2">同じ指で異なるキーを連続打鍵する「同指連打」はミスの元です。</p>
                            <ul>
                                {(analysis.fingerTransitionWeaknesses || []).slice(0, 8).map((item, i) => (
                                    <li key={i} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                                        <span className="font-mono text-sm text-gray-700">{item.pattern}</span>
                                        <span className="text-sm text-gray-500">{item.count}回</span>
                                    </li>
                                ))}
                                {(!analysis.fingerTransitionWeaknesses || analysis.fingerTransitionWeaknesses.length === 0) && (
                                    <li className="text-sm text-gray-400 py-2">特に問題は見つかりませんでした。</li>
                                )}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-red-600 mb-2">
                                順序逆転・早とちり (Lookahead Errors)
                            </h4>
                            <p className="text-xs text-gray-500 mb-2">
                                「tamago」を「tamaog」と打つような、指が思考より先に走ってしまうミスです。
                                <br />発生率: <strong>{analysis.transpositionErrorRate.toFixed(1)}%</strong> ({analysis.transpositionErrorCount}回)
                            </p>
                            <ul>
                                {(analysis.specificTranspositions || []).slice(0, 8).map((item, i) => (
                                    <li key={i} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                                        <span className="font-mono text-sm text-gray-700">{item.pattern}</span>
                                        <span className="text-sm text-gray-500">{item.count}回</span>
                                    </li>
                                ))}
                                {(!analysis.specificTranspositions || analysis.specificTranspositions.length === 0) && (
                                    <li className="text-sm text-gray-400 py-2">特に問題は見つかりませんでした。</li>
                                )}
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
