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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* ヘッダー */}
        <div className="bg-blue-600 p-6 text-white flex justify-between items-start">
          <div>
            <span className="inline-block bg-blue-800 text-xs font-semibold px-2 py-1 rounded mb-2">
              {course.difficulty}
            </span>
            <h2 className="text-3xl font-bold">{course.title}</h2>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white" aria-label="閉じる">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 overflow-y-auto">
          <p className="text-gray-700 text-lg mb-6 leading-relaxed">
            {course.description}
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-2">収録テキスト例:</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              {course.texts?.slice(0, 3).map((text) => (
                <li key={text.id} className="truncate">
                  {text.display}
                </li>
              ))}
              {(course.texts?.length || 0) > 3 && <li className="list-none text-gray-400 ml-5">...他 {(course.texts?.length || 0)} 件</li>}
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
            {/* プレイ設定 (ガイド) */}
            <div>
              <h3 className="font-bold text-gray-800 mb-3">ガイド設定</h3>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="showKana"
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    checked={settings.showKana}
                    onChange={(e) => onUpdateSettings({ showKana: e.target.checked })}
                  />
                  <span className="ml-2 text-gray-700">かなガイド</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="showRomaji"
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    checked={settings.showRomaji}
                    onChange={(e) => onUpdateSettings({ showRomaji: e.target.checked })}
                  />
                  <span className="ml-2 text-gray-700">ローマ字ガイド</span>
                </label>
              </div>
            </div>

            {/* サウンド・演出 */}
            <div>
              <h3 className="font-bold text-gray-800 mb-3">サウンド・演出</h3>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="soundEnabled"
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    checked={settings.soundEnabled}
                    onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                  />
                  <span className="ml-2 text-gray-700">サウンド (SE)</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="missEffectEnabled"
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    checked={settings.missEffectEnabled}
                    onChange={(e) => onUpdateSettings({ missEffectEnabled: e.target.checked })}
                  />
                  <span className="ml-2 text-gray-700">ミス時の揺れ</span>
                </label>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            {/* モード */}
            <h3 className="font-bold text-gray-800 mb-3">ゲームモード</h3>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="realisticMode"
                  className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                  checked={settings.realisticMode}
                  onChange={(e) => onUpdateSettings({ realisticMode: e.target.checked })}
                />
                <span className="ml-2 text-gray-700">リアル挙動 (修正必須)</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="hardcoreMode"
                  className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                  checked={settings.hardcoreMode}
                  onChange={(e) => onUpdateSettings({ hardcoreMode: e.target.checked })}
                />
                <span className="ml-2 text-red-600 font-bold">超高難易度 (即死)</span>
              </label>
            </div>
          </div>

          {/* 区切り線と余白 */}
          <div className="mt-8 border-t border-gray-200 pt-6"></div>

          {/* ランキングエリア */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center">
              <span className="mr-2">🏆</span> トップランキング
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {isLoadingRanking ? (
                <div className="p-4 text-center text-gray-500">読み込み中...</div>
              ) : rankings.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-4 py-2 text-left w-16">順位</th>
                      <th className="px-4 py-2 text-left">ユーザー</th>
                      <th className="px-4 py-2 text-right">スコア</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rankings.map((rank, index) => (
                      <tr key={rank.id} className={index < 3 ? 'bg-yellow-50/50' : ''}>
                        <td className="px-4 py-2 font-bold text-gray-600">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        </td>
                        <td className="px-4 py-2 flex items-center gap-2">
                          <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                            {rank.user.image ? (
                              <Image 
                                src={rank.user.image} 
                                alt={rank.user.name || 'User'} 
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <span className="flex items-center justify-center h-full w-full text-xs text-gray-500">?</span>
                            )}
                          </div>
                          <span className="truncate max-w-[120px] sm:max-w-[200px]">
                            {rank.user.name || '名無しさん'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right font-mono font-semibold text-blue-600">
                          {rank.score.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  まだランキングデータがありません。挑戦して1位を目指そう！
                </div>
              )}
            </div>
          </div>
        </div>

        {/* フッターアクション */}
        <div className="bg-gray-50 p-4 flex justify-end gap-3 border-t">
          {isAuthor && (
            <div className="mr-auto flex gap-2">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg transition text-sm font-bold"
              >
                {isDeleting ? '削除中...' : '削除'}
              </button>
              {onEdit && (
                <button
                  onClick={() => onEdit(course.id)}
                  className="px-4 py-2 text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-sm font-bold"
                >
                  編集
                </button>
              )}
            </div>
          )}
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition"
          >
            キャンセル
          </button>
          <button
            onClick={() => onStart(course.id)}
            className="px-8 py-3 bg-blue-600 text-white text-xl font-bold rounded-lg shadow hover:bg-blue-700 transform hover:-translate-y-0.5 transition duration-200"
          >
            練習スタート
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailModal;
