'use client';

import React, { useState, useEffect } from 'react';

export interface TextItem {
  id?: string; // 編集時のためにIDを持てるようにする
  display: string;
  reading: string;
}

export interface CourseFormData {
  title: string;
  description: string;
  thumbnail?: string;
  difficulty: string;
  isPublic: boolean;
  texts: TextItem[];
}

interface CourseFormProps {
  initialData?: CourseFormData;
  onSubmit: (data: CourseFormData) => Promise<void>;
  isSubmitting: boolean;
  submitLabel: string;
}

const CourseForm: React.FC<CourseFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || '');
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || 'Normal');
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true);
  const [texts, setTexts] = useState<TextItem[]>(initialData?.texts || [{ display: '', reading: '' }]);
  const [error, setError] = useState('');

  // initialDataが遅延して渡された場合にstateを更新する（編集時）
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setThumbnail(initialData.thumbnail || '');
      setDifficulty(initialData.difficulty);
      setIsPublic(initialData.isPublic);
      setTexts(initialData.texts);
    }
  }, [initialData]);

  const handleTextChange = (index: number, field: keyof TextItem, value: string) => {
    const newTexts = [...texts];
    newTexts[index] = { ...newTexts[index], [field]: value };
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
    setError('');

    // バリデーション
    if (!title.trim()) {
      setError('タイトルは必須です。');
      return;
    }
    if (texts.some(t => !t.display.trim() || !t.reading.trim())) {
      setError('すべての問題文（表示・読み）を入力してください。');
      return;
    }

    // 読みのバリデーション（ひらがなと記号のみ）
    const hiraganaRegex = /^[ぁ-んー。、！？（）「」・：；\s]+$/;
    const invalidReading = texts.find(t => !hiraganaRegex.test(t.reading));
    if (invalidReading) {
      setError(`「${invalidReading.reading}」にひらがな以外の文字が含まれています。読みはひらがなで入力してください。`);
      return;
    }

    try {
      await onSubmit({
        title,
        description,
        thumbnail,
        difficulty,
        isPublic,
        texts,
      });
    } catch (err) {
      console.error(err);
      setError('エラーが発生しました。');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700">
          {error}
        </div>
      )}

      {/* 基本情報 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">タイトル</label>
          <input
            type="text"
            name="title"
            value={title || ''}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            placeholder="例: J-POP歌詞タイピング"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">説明文</label>
          <textarea
            name="description"
            value={description || ''}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            placeholder="コースの説明を入力してください"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">サムネイル画像URL (任意)</label>
          <input
            type="text"
            name="thumbnail"
            value={thumbnail || ''}
            onChange={(e) => setThumbnail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            placeholder="例: https://example.com/image.jpg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">難易度</label>
            <select
              name="difficulty"
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
              name="isPublic"
              checked={!!isPublic}
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
                  name={`text-display-${index}`}
                  value={item.display || ''}
                  onChange={(e) => handleTextChange(index, 'display', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="表示テキスト (漢字など)"
                  required
                />
                <input
                  type="text"
                  name={`text-reading-${index}`}
                  value={item.reading || ''}
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
          disabled={isSubmitting}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? '処理中...' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default CourseForm;
