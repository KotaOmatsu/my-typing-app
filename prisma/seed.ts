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
    console.log(`Created course: ${createdCourse.title} (${createdCourse.id})`);
  }
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
