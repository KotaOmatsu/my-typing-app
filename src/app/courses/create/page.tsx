'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface TextItem {
  display: string;
  reading: string;
}

export default function CreateCoursePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Normal');
  const [isPublic, setIsPublic] = useState(true);
  const [texts, setTexts] = useState<TextItem[]>([{ display: '', reading: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleTextChange = (index: number, field: keyof TextItem, value: string) => {
    const newTexts = [...texts];
    newTexts[index][field] = value;
    setTexts(newTexts);
  };

  const addTextItem = () => {
    setTexts([...texts, { display: '', reading: '' }]);
  };

  const removeTextItem = (index: number) => {
    if (texts.length > 1) {
      const newTexts = texts.filter((_, i) => i !== index);
      setTexts(newTexts);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // バリデーション
    if (!title.trim()) {
      setError('タイトルは必須です。');
      setLoading(false);
      return;
    }
    if (texts.some(t => !t.display.trim() || !t.reading.trim())) {
      setError('すべての問題文（表示・読み）を入力してください。');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          difficulty,
          isPublic,
          texts,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create course');
      }

      router.push('/'); // 作成後はトップページへ（または自分のコース一覧へ）
    } catch (err) {
      console.error(err);
      setError('コースの作成に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          新しいコースを作成
        </h1>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本情報 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">タイトル</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="例: J-POP歌詞タイピング"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">説明文</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="コースの説明を入力してください"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">難易度</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                >
                  <option value="Easy">Easy (かんたん)</option>
                  <option value="Normal">Normal (ふつう)</option>
                  <option value="Hard">Hard (むずかしい)</option>
                </select>
              </div>
              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                  公開する
                </label>
              </div>
            </div>
          </div>

          <hr className="my-8" />

          {/* 問題文リスト */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">問題文リスト</h2>
            <p className="text-sm text-gray-500 mb-4">
              ※ 読みは「ひらがな」で入力してください（例: こんにちは）
            </p>
            
            <div className="space-y-4">
              {texts.map((item, index) => (
                <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-md border border-gray-200">
                  <span className="pt-2 text-gray-500 font-bold">{index + 1}.</span>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={item.display}
                      onChange={(e) => handleTextChange(index, 'display', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                      placeholder="表示テキスト (漢字など)"
                      required
                    />
                    <input
                      type="text"
                      value={item.reading}
                      onChange={(e) => handleTextChange(index, 'reading', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                      placeholder="読み (ひらがな)"
                      required
                    />
                  </div>
                  {texts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTextItem(index)}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="削除"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={addTextItem}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                ＋ 問題を追加
              </button>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? '作成中...' : 'コースを作成して公開'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
