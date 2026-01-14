import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import OnScreenKeyboard from './OnScreenKeyboard';
import { TypingResult } from '@/types/typing';
import { LOCAL_STORAGE_RESULT_KEY } from '@/constants/typing';
import { 
  MistakeDetails, 
  MistypedKeys, 
  createMistakeDetails, 
  analyzeMistypedKeys 
} from '@/utils/resultUtils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KEY_TO_FINGER, FingerName } from '@/constants/fingerMapping';

const ResultDisplay: React.FC = () => {
  const [result, setResult] = useState<TypingResult | null>(null);
  const [mistakeDetails, setMistakeDetails] = useState<MistakeDetails | null>(null);
  const [mistypedKeys, setMistypedKeys] = useState<MistypedKeys | null>(null);
  const [tooltip, setTooltip] = useState<{ content: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const storedResult = localStorage.getItem(LOCAL_STORAGE_RESULT_KEY);
    if (storedResult) {
      const parsedResult: TypingResult = JSON.parse(storedResult);
      setResult(parsedResult);
      setMistakeDetails(createMistakeDetails(parsedResult.mistakes));
      setMistypedKeys(analyzeMistypedKeys(parsedResult.mistakes));
    }
  }, []);

  const handleMouseOver = (e: React.MouseEvent<HTMLSpanElement>, details: {char: string, expected: string, actual: string}[]) => {
    const content = details.map(d => `「${d.char}」 正解:${d.expected} / 入力:${d.actual}`).join('\n');
    setTooltip({ content, x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  // Calculate mistakes per finger
  const fingerMistakes = useMemo(() => {
    const counts: Record<string, number> = {};
    if (mistypedKeys) {
      Object.entries(mistypedKeys).forEach(([key, count]) => {
        const finger = KEY_TO_FINGER[key.toLowerCase()];
        if (finger) {
          counts[finger] = (counts[finger] || 0) + count;
        }
      });
    }
    return counts;
  }, [mistypedKeys]);

  const maxFingerMistake = Math.max(1, ...Object.values(fingerMistakes));

  const renderFinger = (finger: FingerName, height: string, rotate: string) => {
    const count = fingerMistakes[finger] || 0;
    const intensity = count / maxFingerMistake; // 0 to 1
    
    // Color interpolation: Very Light Red (255, 235, 235) to Deep Red (220, 38, 38)
    const r = Math.floor(255 - (255 - 220) * intensity);
    const g = Math.floor(235 - (235 - 38) * intensity);
    const b = Math.floor(235 - (235 - 38) * intensity);

    const colorStyle = count > 0 
      ? { backgroundColor: `rgb(${r}, ${g}, ${b})`, borderColor: `rgba(${r}, ${g}, ${b}, 0.8)` }
      : { backgroundColor: 'var(--muted)', borderColor: 'rgba(0,0,0,0.1)' };

    return (
      <div 
        className={`w-6 rounded-t-lg border mx-0.5 relative transition-colors duration-300 ${height} ${rotate}`}
        style={colorStyle}
        title={`${finger}: ${count}ミス`}
      />
    );
  };

  const chunks = useMemo(() => {
    if (!result) return [];
    
    const c = [];
    let offset = 0;
    
    if (result.textLengths && result.textLengths.length > 0) {
      for (const len of result.textLengths) {
        c.push({ 
          units: result.displayUnits.slice(offset, offset + len),
          startIndex: offset 
        });
        offset += len;
      }
    } else {
      c.push({ units: result.displayUnits, startIndex: 0 });
    }
    return c;
  }, [result]);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground mb-4">結果データがありません...</p>
        <Link href="/">
          <Button>ホームに戻る</Button>
        </Link>
      </div>
    );
  }

  const topMistakes = mistypedKeys 
    ? Object.entries(mistypedKeys)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
    : [];

  return (
    <div className="w-full max-w-6xl mx-auto p-2 flex flex-col gap-1 h-[calc(100vh-140px)] overflow-hidden">
      {tooltip && (
        <div 
          className="absolute bg-popover text-popover-foreground p-2 rounded shadow-lg z-50 text-xs border border-border whitespace-pre-wrap"
          style={{ top: tooltip.y + 10, left: tooltip.x + 10 }}
        >
          {tooltip.content}
        </div>
      )}

      {/* Top Stats Row */}
      <div className="grid grid-cols-4 gap-2 h-20 shrink-0">
        <Card className="flex flex-col items-center justify-center p-1 bg-card/50">
          <span className="text-[10px] text-muted-foreground font-bold tracking-widest">正確率</span>
          <span className="text-2xl font-bold text-foreground">{result.accuracy.toFixed(1)}<span className="text-xs text-muted-foreground">%</span></span>
        </Card>
        <Card className="flex flex-col items-center justify-center p-1 bg-card/50">
          <span className="text-[10px] text-muted-foreground font-bold tracking-widest">ミス数</span>
          <span className="text-2xl font-bold text-destructive">{result.mistakes.length}</span>
        </Card>
        <Card className="flex flex-col items-center justify-center p-1 bg-card/50">
          <span className="text-[10px] text-muted-foreground font-bold tracking-widest">スコア</span>
          <span className="text-2xl font-bold text-primary">{result.score}</span>
        </Card>
        <Card className="flex flex-col items-center justify-center p-1 bg-card/50">
          <span className="text-[10px] text-muted-foreground font-bold tracking-widest">WPM</span>
          <span className="text-2xl font-bold text-foreground">{result.wpm.toFixed(0)}</span>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-12 gap-2 flex-grow min-h-0">
        {/* Left: Mistake Log */}
        <Card className="col-span-7 flex flex-col overflow-hidden">
          <CardHeader className="py-2 px-3 border-b border-border bg-muted/20 shrink-0">
            <CardTitle className="text-xs font-bold text-muted-foreground">入力ログ / ミス分析</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto flex-grow bg-muted/10 font-mono text-sm">
            <div className="p-3">
              {chunks.map((chunk, chunkIndex) => (
                  <div key={chunkIndex} className="mb-6 last:mb-0 w-full">
                    {/* Text Content */}
                    <div className="leading-loose break-all">
                      {chunk.units.map((unit, localIndex) => {
                        const globalIndex = chunk.startIndex + localIndex;
                        const mistakesAtThisIndex = mistakeDetails?.[globalIndex];
                        
                        if (mistakesAtThisIndex) {
                          return (
                            <span
                              key={globalIndex}
                              className="text-destructive underline decoration-wavy cursor-help bg-destructive/10 px-0.5 rounded-sm mx-0.5 inline-block"
                              onMouseMove={(e) => handleMouseOver(e, mistakesAtThisIndex)}
                              onMouseLeave={handleMouseLeave}
                            >
                              {unit}
                            </span>
                          );
                        }
                        // Default char
                        return <span key={globalIndex} className="text-foreground/80 inline-block mx-px">{unit}</span>;
                      })}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Right: Weak Keys & Actions */}
        <div className="col-span-5 flex flex-col gap-2 min-h-0">
          <Card className="flex-grow flex flex-col p-2 bg-muted/10 overflow-hidden">
             <div className="flex justify-between items-center mb-2 px-1 border-b border-border/50 pb-1 shrink-0">
               <span className="text-xs font-bold text-muted-foreground">苦手キー分析</span>
             </div>
             
             {/* Ranking List */}
             <div className="flex-grow min-h-0 overflow-y-auto mb-2 px-1">
               {topMistakes.length > 0 ? (
                 <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                   {topMistakes.slice(0, 6).map(([key, count], i) => (
                     <div key={key} className="flex justify-between items-center text-xs font-mono border-b border-border/30 pb-0.5">
                       <span className="text-muted-foreground flex items-center">
                         <span className="w-4 inline-block text-[10px]">{i + 1}.</span>
                         <span className="uppercase text-foreground font-bold bg-muted/20 px-1 rounded">{key}</span>
                       </span>
                       <span className="text-destructive font-semibold">{count}<span className="text-[10px] text-muted-foreground ml-0.5">回</span></span>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="text-xs text-muted-foreground text-center py-4">ミスはありません (Excellent!)</p>
               )}
             </div>

             {/* Gradient Bar (Legend) */}
             <div className="flex items-center justify-center text-[9px] text-muted-foreground w-full mb-4 shrink-0 px-2">
                <span className="mr-2">得意</span>
                <div className="flex-grow h-1 rounded-full bg-gradient-to-r from-red-50 to-red-600 opacity-80"></div>
                <span className="ml-2">苦手</span>
             </div>

             {/* Keyboard Visualization (Fixed Height Container to prevent ghost space) */}
             <div className="h-[125px] w-full flex items-center justify-center shrink-0 relative border-t border-border/20 pt-2">
               <div className="transform scale-[0.45] origin-center absolute inset-0 top-[-20px] flex items-center justify-center">
                 <OnScreenKeyboard mistypedKeys={mistypedKeys || {}} />
               </div>
             </div>
             
             {/* Finger Heatmap (Replacing Gradient Bar) */}
             <div className="flex justify-center items-end h-[60px] w-full shrink-0 select-none pb-2 mt-[-10px] z-10">
                {/* Left Hand */}
                <div className="flex items-end mr-4">
                  {renderFinger('left-pinky', 'h-10', '-rotate-12')}
                  {renderFinger('left-ring', 'h-14', '-rotate-6')}
                  {renderFinger('left-middle', 'h-16', 'rotate-0')}
                  {renderFinger('left-index', 'h-14', 'rotate-6')}
                  {renderFinger('left-thumb', 'h-8', 'rotate-12')}
                </div>
                {/* Right Hand */}
                <div className="flex items-end ml-4">
                  {renderFinger('right-thumb', 'h-8', '-rotate-12')}
                  {renderFinger('right-index', 'h-14', '-rotate-6')}
                  {renderFinger('right-middle', 'h-16', 'rotate-0')}
                  {renderFinger('right-ring', 'h-14', 'rotate-6')}
                  {renderFinger('right-pinky', 'h-10', 'rotate-12')}
                </div>
             </div>
          </Card>

          <Link href="/" className="w-full shrink-0">
            <Button className="w-full h-10 text-base font-bold shadow-md" size="default">
              ホームに戻る
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
