import { TypingText } from "@/types/typing";

export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Normal' | 'Hard';
  thumbnail?: string; // 将来的には画像URL
  texts: TypingText[];
}

export const COURSES: Course[] = [
  {
    id: "sample-1",
    title: "夏目漱石「吾輩は猫である」",
    description: "有名な書き出しを練習してみましょう。基礎的な文章です。",
    difficulty: "Normal",
    texts: [
      { id: "1-1", display: "吾輩は猫である。", reading: "わがはいはねこである。" },
      { id: "1-2", display: "名前はまだ無い。", reading: "なまえはまだない。" },
      { id: "1-3", display: "どこで生れたかとんと見当がつかぬ。", reading: "どこでうまれたかとんとけんとうがつかぬ。" }
    ]
  },
  {
    id: "sample-2",
    title: "短文練習セット",
    description: "短い文章で指の運動をしましょう。初心者向け。",
    difficulty: "Easy",
    texts: [
      { id: "2-1", display: "こんにちは。", reading: "こんにちは。" },
      { id: "2-2", display: "テストです。", reading: "てすとです。" },
      { id: "2-3", display: "今日もいい天気。", reading: "きょうもいいてんき。" }
    ]
  },
  {
    id: "sample-3",
    title: "プログラミング用語",
    description: "エンジニアなら頻繁に打つ単語の練習です。",
    difficulty: "Hard",
    texts: [
      { id: "3-1", display: "アルゴリズム", reading: "あるごりずむ" },
      { id: "3-2", display: "データベース", reading: "でーたべーす" },
      { id: "3-3", display: "オブジェクト指向", reading: "おぶじぇくとしこう" }
    ]
  }
];
