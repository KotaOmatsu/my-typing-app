'use client';

import React, { useState } from 'react';
import { WeaknessAnalysis, KeyScore } from '@/utils/analysisUtils';

interface WeaknessAnalysisDisplayProps {
  analysis: WeaknessAnalysis | null;
}

const WeaknessAnalysisDisplay: React.FC<WeaknessAnalysisDisplayProps> = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState<'patterns' | 'trends'>('patterns');

  if (!analysis || analysis.totalMistakes === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow text-center text-gray-500">
        <p>十分なデータがありません。</p>
      </div>
    );
  }

  // Helper for heat color (Monotone Red Scale)
  const getHeatColor = (score: number) => {
    if (score === 0) return 'bg-muted';
    if (score < 20) return 'bg-red-100'; // Very light red
    if (score < 50) return 'bg-red-300';
    return 'bg-red-600 text-white'; // Deep red
  };

  const topCategory = analysis.missCategories[0];

  return (
    <div className="bg-card rounded-sm shadow-sm mb-8 overflow-hidden border border-border">
      <div className="p-6 border-b border-border bg-muted/20">
        <h2 className="text-xl font-bold font-mono text-foreground mb-2 uppercase tracking-widest">Typing Diagnosis</h2>
        <p className="text-sm text-muted-foreground">
          Weakest Finger: <span className="font-bold text-destructive">{analysis.worstFinger}</span> / Top Pattern: <span className="font-bold text-destructive">{topCategory?.label || 'None'}</span>
        </p>
        {topCategory && (
            <div className="mt-4 p-3 bg-card border-l-4 border-foreground rounded-sm text-foreground text-xs font-mono">
                <span className="font-bold uppercase tracking-widest mr-2">PRESCRIPTION:</span> {topCategory.description}
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        
        {/* Left: Visual Heatmap (Finger & Keyboard) */}
        <div className="col-span-1 lg:col-span-1 p-6 border-r border-border">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">Finger Heatmap</h3>
            <div className="flex justify-center items-end space-x-8 mb-8"> 
                
                {/* Left Hand */}
                <div className="flex space-x-1 items-end">
                    {analysis.fingerScores.slice(0, 5).map((fs) => { 
                        const heights = { '左小': 12, '左薬': 16, '左中': 20, '左人': 18, '左親': 10 }; 
                        return (
                            <div key={fs.finger} className="flex flex-col items-center group relative">
                                <div 
                                    className={`w-4 rounded-t-full border border-border transition-colors ${getHeatColor(fs.score)}`}
                                    style={{ height: `${(heights[fs.finger as keyof typeof heights] || 10) * 4}px` }} 
                                    title={`${fs.finger}: ${fs.missCount} miss`}
                                ></div>
                                <span className="text-[10px] mt-1 text-muted-foreground font-mono">{fs.finger.slice(-1)}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Right Hand */}
                <div className="flex space-x-1 items-end">
                    {analysis.fingerScores.slice(5, 10).map((fs) => { 
                        const heights = { '右親': 10, '右人': 18, '右中': 20, '右薬': 16, '右小': 12 }; 
                        return (
                            <div key={fs.finger} className="flex flex-col items-center group relative">
                                <div 
                                    className={`w-4 rounded-t-full border border-border transition-colors ${getHeatColor(fs.score)}`}
                                    style={{ height: `${(heights[fs.finger as keyof typeof heights] || 10) * 4}px` }} 
                                    title={`${fs.finger}: ${fs.missCount} miss`}
                                ></div>
                                <span className="text-[10px] mt-1 text-muted-foreground font-mono">{fs.finger.slice(-1)}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Key Heatmap</h3>
            <div className="grid grid-cols-10 gap-1 text-xs mb-2">
                {['1','2','3','4','5','6','7','8','9','0'].map(k => <Key key={k} char={k} score={getKeyScore(k, analysis.keyScores)} />)}
                {['q','w','e','r','t','y','u','i','o','p'].map(k => <Key key={k} char={k} score={getKeyScore(k, analysis.keyScores)} />)}
                {['a','s','d','f','g','h','j','k','l',';'].map(k => <Key key={k} char={k} score={getKeyScore(k, analysis.keyScores)} />)}
                {['z','x','c','v','b','n','m',',','.','/'].map(k => <Key key={k} char={k} score={getKeyScore(k, analysis.keyScores)} />)}
            </div>
            <p className="text-[10px] text-muted-foreground text-center font-mono mt-2">MISS FREQUENCY DISTRIBUTION</p>
        </div>

        {/* Right: Detailed Data with Tabs */}
        <div className="col-span-1 lg:col-span-2 flex flex-col">
            <div className="flex border-b border-border">
                <button 
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'patterns' ? 'text-foreground border-b-2 border-foreground bg-muted/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/5'}`}
                    onClick={() => setActiveTab('patterns')}
                >
                    Miss Patterns
                </button>
                <button 
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'trends' ? 'text-foreground border-b-2 border-foreground bg-muted/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/5'}`}
                    onClick={() => setActiveTab('trends')}
                >
                    Analysis & Tips
                </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto max-h-[400px]">
                {activeTab === 'patterns' && (
                    <div className="space-y-8">
                        <div>
                            <h4 className="text-xs font-bold text-foreground mb-3 uppercase tracking-widest border-b border-border pb-1">Common Mistakes (Expected → Actual)</h4>
                            <ul className="space-y-1">
                                {(analysis.missPatterns || []).slice(0, 8).map((item, i) => (
                                    <li key={i} className="flex justify-between items-center py-1.5 border-b border-border/50 last:border-0 hover:bg-muted/10 px-2 rounded-sm transition-colors">
                                        <span className="font-mono text-sm text-foreground">{item.pattern}</span>
                                        <span className="text-xs font-mono text-muted-foreground">{item.count}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-foreground mb-3 uppercase tracking-widest border-b border-border pb-1">Sequence Weakness (Prev → Target)</h4>
                            <ul className="space-y-1">
                                {(analysis.sequenceWeaknesses || []).slice(0, 8).map((item, i) => (
                                    <li key={i} className="flex justify-between items-center py-1.5 border-b border-border/50 last:border-0 hover:bg-muted/10 px-2 rounded-sm transition-colors">
                                        <span className="font-mono text-sm text-foreground">{item.pattern}</span>
                                        <span className="text-xs font-mono text-muted-foreground">{item.count}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'trends' && (
                    <div>
                        <h4 className="text-xs font-bold text-foreground mb-4 uppercase tracking-widest">Trend Classification</h4>
                        <div className="space-y-3">
                            {analysis.missCategories.map((cat, i) => (
                                <div key={i} className="p-3 border border-border rounded-sm hover:bg-muted/10 transition">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-foreground text-sm">{cat.label}</span>
                                        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded-sm text-muted-foreground">{cat.count}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{cat.type === 'FatFinger' ? 'Adjacent key error. Check finger positioning and reduce lateral movement errors.' : cat.type === 'Mirror' ? 'Mirror key error. Brain might be confusing left/right mapping. Slow down and verify hand placement.' : 'General error. Focus on home position and practice fundamental key reaches.'}</p>
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
    // Color scale: Muted -> Red
    let bgColor = 'bg-card text-muted-foreground';
    if (score > 0) bgColor = 'bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-100';
    if (score > 30) bgColor = 'bg-red-200 text-red-950 dark:bg-red-800/40 dark:text-red-50';
    if (score > 60) bgColor = 'bg-red-400 text-white dark:bg-red-700 dark:text-white';
    if (score > 80) bgColor = 'bg-red-600 text-white dark:bg-red-600 dark:text-white';

    return (
        <div className={`aspect-square flex items-center justify-center border border-border rounded-sm ${bgColor} font-mono uppercase font-bold shadow-sm text-[10px] transition-colors`}>
            {char}
        </div>
    );
}

function getKeyScore(key: string, scores: KeyScore[]): number {
    const found = scores.find(s => s.key.toLowerCase() === key.toLowerCase());
    return found ? found.score : 0;
}

export default WeaknessAnalysisDisplay;
