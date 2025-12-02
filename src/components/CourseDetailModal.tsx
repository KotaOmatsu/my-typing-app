import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
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
}

const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  isOpen,
  onClose,
  course,
  settings,
  onUpdateSettings,
  onStart,
  onDelete,
}) => {
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  // 削除ハンドラ
  const handleDelete = async () => {
    if (!confirm('本当にこのコースを削除しますか？この操作は取り消せません。')) return;
    
    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(course.id);
      }
    } catch (error) {
      alert('削除に失敗しました');
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

          {/* 設定エリア (簡易版) */}
          <div className="border-t pt-4">
            <h3 className="font-bold text-gray-800 mb-3">プレイ設定</h3>
            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  checked={settings.showKana}
                  onChange={(e) => onUpdateSettings({ showKana: e.target.checked })}
                />
                <span className="ml-2 text-gray-700">かなガイドを表示</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  checked={settings.showRomaji}
                  onChange={(e) => onUpdateSettings({ showRomaji: e.target.checked })}
                />
                <span className="ml-2 text-gray-700">ローマ字ガイドを表示</span>
              </label>
            </div>
          </div>
        </div>

        {/* フッターアクション */}
        <div className="bg-gray-50 p-4 flex justify-end gap-3 border-t">
          {isAuthor && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="mr-auto px-4 py-2 text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg transition text-sm font-bold"
            >
              {isDeleting ? '削除中...' : 'このコースを削除'}
            </button>
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
