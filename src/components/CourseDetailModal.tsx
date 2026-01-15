import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Course } from '@/types/typing';
import { GameSettings } from '../hooks/useGameSettings';

interface CourseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onStart: (courseId: string) => void;
  onDelete?: (courseId: string) => void; // 削除時のコールバック
  onEdit?: (courseId: string) => void; // 編集時のコールバック
}

type RankingEntry = {
  id: string;
  score: number;
  wpm: number;
  accuracy: number;
  createdAt: string;
  user: {
    name: string | null;
    image: string | null;
  };
};

const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  isOpen,
  onClose,
  course,
  settings,
  onUpdateSettings,
  onStart,
  onDelete,
  onEdit,
}) => {
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [isLoadingRanking, setIsLoadingRanking] = useState(false);

  useEffect(() => {
    if (isOpen && course.id) {
      setIsLoadingRanking(true);
      fetch(`/api/courses/${course.id}/ranking`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Network response was not ok');
          }
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setRankings(data);
          } else {
            setRankings([]);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch rankings:', err);
          setRankings([]);
        })
        .finally(() => {
          setIsLoadingRanking(false);
        });
    }
  }, [isOpen, course.id]);

  if (!isOpen) return null;

  // 削除ハンドラ
  const handleDelete = async () => {
    if (!confirm('本当にこのコースを削除しますか？この操作は取り消せません。')) return;
    
    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(course.id);
      }
    } catch (_error) { // error を _error にリネーム
      alert(`削除に失敗しました: ${(_error as Error).message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // ユーザーIDのチェック（sessionにidが含まれている前提、なければemail等で代用検討だが今回はid）
  // next-authの型拡張が必要な場合がある
  const isAuthor = session?.user?.id === course.authorId;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <div className="bg-background rounded-sm shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-border">
          {/* ヘッダー */}
          <div className="p-6 border-b border-border flex justify-between items-start bg-card/50">
            <div>
              <span className="inline-block bg-primary text-primary-foreground text-xs font-mono px-2 py-1 rounded-sm mb-2 uppercase tracking-widest">
                {course.difficulty}
              </span>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">{course.title}</h2>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="閉じる">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
  
          {/* コンテンツ */}
          <div className="p-6 overflow-y-auto bg-background">
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed font-mono">
              {course.description}
            </p>
  
            <div className="bg-muted/30 rounded-sm p-4 mb-6 border border-border">
              <h3 className="font-bold text-foreground text-xs uppercase tracking-widest mb-2">収録テキスト例:</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 font-mono text-xs">
                {course.texts?.slice(0, 3).map((text) => (
                  <li key={text.id} className="truncate">
                    {text.display}
                  </li>
                ))}
                {(course.texts?.length || 0) > 3 && <li className="list-none opacity-50 ml-5">...他 {(course.texts?.length || 0)} 件</li>}
              </ul>
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border pt-4">
              {/* プレイ設定 (ガイド) */}
              <div>
                <h3 className="font-bold text-foreground text-xs uppercase tracking-widest mb-3">ガイド設定</h3>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="showRomaji"
                      className="w-4 h-4 text-primary rounded-sm focus:ring-ring border-input"
                      checked={!!settings.showRomaji}
                      onChange={(e) => onUpdateSettings({ showRomaji: e.target.checked })}
                    />
                    <span className="ml-2 text-sm text-muted-foreground">ローマ字ガイド</span>
                  </label>
                </div>
              </div>
            </div>
  
            <div className="border-t border-border pt-4 mt-4">
              {/* モード */}
              <h3 className="font-bold text-foreground text-xs uppercase tracking-widest mb-3">ゲームモード</h3>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="realisticMode"
                    className="w-4 h-4 text-primary rounded-sm focus:ring-ring border-input"
                    checked={!!settings.realisticMode}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      onUpdateSettings({
                        realisticMode: isChecked,
                        hardcoreMode: isChecked ? false : settings.hardcoreMode
                      });
                    }}
                  />
                  <span className="ml-2 text-sm text-muted-foreground">リアルモード</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="hardcoreMode"
                    className="w-4 h-4 text-primary rounded-sm focus:ring-ring border-input"
                    checked={!!settings.hardcoreMode}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      onUpdateSettings({
                        hardcoreMode: isChecked,
                        realisticMode: isChecked ? false : settings.realisticMode
                      });
                    }}
                  />
                  <span className="ml-2 text-sm text-muted-foreground">間違えたら最初からモード</span>
                </label>
              </div>
            </div>
  
            {/* 区切り線と余白 */}
            <div className="mt-8 border-t border-border pt-6"></div>
  
            {/* ランキングエリア */}
            <div className="mb-6">
              <h3 className="font-bold text-foreground text-xs uppercase tracking-widest mb-3 flex items-center">
                <span className="mr-2">🏆</span> トップランキング
              </h3>
              <div className="bg-card border border-border rounded-sm overflow-hidden">
                {isLoadingRanking ? (
                  <div className="p-4 text-center text-muted-foreground text-xs font-mono">LOADING_DATA...</div>
                ) : rankings.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-muted-foreground text-xs uppercase">
                      <tr>
                        <th className="px-4 py-2 text-left w-16 font-medium">Rank</th>
                        <th className="px-4 py-2 text-left font-medium">User</th>
                        <th className="px-4 py-2 text-right font-medium">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {rankings.map((rank, index) => (
                        <tr key={rank.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-2 font-mono text-muted-foreground">
                            {index + 1}
                          </td>
                          <td className="px-4 py-2 flex items-center gap-2">
                            <div className="relative w-6 h-6 rounded-full overflow-hidden bg-muted flex-shrink-0">
                              {rank.user.image ? (
                                <Image 
                                  src={rank.user.image} 
                                  alt={rank.user.name || 'User'} 
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <span className="flex items-center justify-center h-full w-full text-xs text-muted-foreground">?</span>
                              )}
                            </div>
                            <span className="truncate max-w-[120px] sm:max-w-[200px] text-foreground font-mono text-xs">
                              {rank.user.name || 'ANONYMOUS'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right font-mono font-bold text-foreground">
                            {rank.score.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-4 text-center text-muted-foreground text-xs font-mono">
                    NO_DATA_AVAILABLE
                  </div>
                )}
              </div>
            </div>
          </div>
  
          {/* フッターアクション */}
          <div className="bg-muted/20 p-4 flex justify-end gap-3 border-t border-border">
            {isAuthor && (
              <div className="mr-auto flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-destructive border border-border bg-background hover:bg-destructive/10 rounded-sm transition text-xs font-mono uppercase tracking-widest"
                >
                  {isDeleting ? 'DELETING...' : 'DELETE'}
                </button>
                {onEdit && (
                  <button
                    onClick={() => onEdit(course.id)}
                    className="px-4 py-2 text-foreground border border-border bg-background hover:bg-muted rounded-sm transition text-xs font-mono uppercase tracking-widest"
                  >
                    EDIT
                  </button>
                )}
              </div>
            )}
            <button
              onClick={onClose}
              className="px-6 py-3 text-muted-foreground font-medium hover:text-foreground hover:bg-muted/50 rounded-sm transition text-xs font-mono uppercase tracking-widest"
            >
              CANCEL
            </button>
            <button
              onClick={() => onStart(course.id)}
              className="px-8 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-sm shadow-sm hover:bg-primary/90 transition duration-200 uppercase tracking-widest"
            >
              START SESSION
            </button>
          </div>
        </div>
      </div>
    );
  };
export default CourseDetailModal;