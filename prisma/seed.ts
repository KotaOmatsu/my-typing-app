import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. 管理者ユーザーを作成（または取得）
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      image: 'https://avatars.githubusercontent.com/u/0?v=4', // ダミーアバター
    },
  });

  console.log(`Created/Found admin user: ${adminUser.name} (${adminUser.id})`);

  // 2. コースデータの定義
  const coursesData = [
    {
      title: "夏目漱石「吾輩は猫である」",
      description: "有名な書き出しを練習してみましょう。基礎的な文章です。",
      difficulty: "Normal",
      isPublic: true,
      texts: [
        { display: "吾輩は猫である。", reading: "わがはいはねこである。", order: 1 },
        { display: "名前はまだ無い。", reading: "なまえはまだない。", order: 2 },
        { display: "どこで生れたかとんと見当がつかぬ。", reading: "どこでうまれたかとんとけんとうがつかぬ。", order: 3 }
      ]
    },
    {
      title: "短文練習セット",
      description: "短い文章で指の運動をしましょう。初心者向け。",
      difficulty: "Easy",
      isPublic: true,
      texts: [
        { display: "こんにちは。", reading: "こんにちは。", order: 1 },
        { display: "テストです。", reading: "てすとです。", order: 2 },
        { display: "今日もいい天気。", reading: "きょうもいいてんき。", order: 3 }
      ]
    },
    {
      title: "プログラミング用語",
      description: "エンジニアなら頻繁に打つ単語の練習です。",
      difficulty: "Hard",
      isPublic: true,
      texts: [
        { display: "アルゴリズム", reading: "あるごりずむ", order: 1 },
        { display: "データベース", reading: "でーたべーす", order: 2 },
        { display: "オブジェクト指向", reading: "おぶじぇくとしこう", order: 3 }
      ]
    }
  ];

  // 3. コースデータの投入
  let courseIds: string[] = [];
  for (const courseData of coursesData) {
    const createdCourse = await prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        difficulty: courseData.difficulty,
        isPublic: courseData.isPublic,
        authorId: adminUser.id,
        texts: {
          create: courseData.texts,
        },
      },
    });
    courseIds.push(createdCourse.id);
    console.log(`Created course: ${createdCourse.title} (${createdCourse.id})`);
  }

  // 4. ダミーのタイピング結果データの投入 (分析機能テスト用)
  console.log("Creating dummy typing results...");

  // Helper to create timestamp
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  // Data 1: 同指連打ミス多め (右手人差し指 h->u でのミスを想定: uを打つべきときにjを打つなど)
  // Context: "hu" (ふ) -> typing "h", then "j" (miss) instead of "u".
  const keyHistory1 = [
    { key: 'h', isMistake: false, timestamp: now - 10000 },
    { key: 'j', isMistake: true, timestamp: now - 9900 }, // Miss: expected u, typed j (same finger)
    { key: 'u', isMistake: false, timestamp: now - 9800 },
    { key: 't', isMistake: false, timestamp: now - 9700 },
    { key: 'a', isMistake: false, timestamp: now - 9600 },
  ];
  const mistakes1 = [
    {
      char: 'ふ', expected: 'u', actual: 'hj', typedKey: 'j', kanaIndex: 1, previousInputBuffer: 'h'
    }
  ];

  await prisma.typingResult.create({
    data: {
      userId: adminUser.id,
      courseId: courseIds[0], // 吾輩は猫である
      wpm: 60,
      accuracy: 90.0,
      score: 100,
      mistakeCount: 1,
      totalKeystrokes: 100,
      correctKeystrokes: 90,
      text: "吾輩は猫である。",
      mistakeDetails: JSON.stringify(mistakes1),
      keyHistory: JSON.stringify(keyHistory1),
      createdAt: new Date(Date.now() - day * 1), // 1日前
    }
  });

  // Data 2: 順序逆転ミス多め (tamago -> tamaog)
  // Context: "tamago" -> t, a, m, a, o (miss), g (miss?), o
  // Mistake: expected 'g', typed 'o'.
  const keyHistory2 = [
    { key: 't', isMistake: false, timestamp: now - 5000 },
    { key: 'a', isMistake: false, timestamp: now - 4900 },
    { key: 'm', isMistake: false, timestamp: now - 4800 },
    { key: 'a', isMistake: false, timestamp: now - 4700 },
    { key: 'o', isMistake: true, timestamp: now - 4600 }, // Miss: expected g, typed o (next char)
    { key: 'g', isMistake: false, timestamp: now - 4500 },
    { key: 'o', isMistake: false, timestamp: now - 4400 },
  ];
  const mistakes2 = [
    {
      char: 'ご', expected: 'g', actual: 'tamo', typedKey: 'o', kanaIndex: 2, previousInputBuffer: 'tama'
    }
  ];

  await prisma.typingResult.create({
    data: {
      userId: adminUser.id,
      courseId: courseIds[1], // 短文練習
      wpm: 80,
      accuracy: 85.0,
      score: 150,
      mistakeCount: 5, // 少し多めに
      totalKeystrokes: 200,
      correctKeystrokes: 170,
      text: "たまご。",
      mistakeDetails: JSON.stringify([...mistakes2, ...mistakes2, ...mistakes2]), // 同じミスを繰り返したことにする
      keyHistory: JSON.stringify([...keyHistory2, ...keyHistory2, ...keyHistory2]),
      createdAt: new Date(Date.now() - day * 2), // 2日前
    }
  });

  // Data 3: 正常・高スコア
  await prisma.typingResult.create({
    data: {
      userId: adminUser.id,
      courseId: courseIds[2],
      wpm: 120,
      accuracy: 98.0,
      score: 300,
      mistakeCount: 0,
      totalKeystrokes: 300,
      correctKeystrokes: 300,
      text: "アルゴリズム",
      mistakeDetails: "[]",
      keyHistory: JSON.stringify([]), // 簡略化
      createdAt: new Date(Date.now() - day * 3), // 3日前
    }
  });

  console.log("Dummy typing results created.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
