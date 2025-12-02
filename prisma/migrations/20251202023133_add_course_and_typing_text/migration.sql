-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'Normal',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "authorId" TEXT NOT NULL,
    CONSTRAINT "Course_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TypingText" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "display" TEXT NOT NULL,
    "reading" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "courseId" TEXT NOT NULL,
    CONSTRAINT "TypingText_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TypingResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "wpm" REAL NOT NULL,
    "accuracy" REAL NOT NULL,
    "mistakeCount" INTEGER NOT NULL,
    "totalKeystrokes" INTEGER NOT NULL,
    "correctKeystrokes" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "mistakeDetails" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "courseId" TEXT,
    CONSTRAINT "TypingResult_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TypingResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TypingResult" ("accuracy", "correctKeystrokes", "createdAt", "id", "mistakeCount", "mistakeDetails", "text", "totalKeystrokes", "userId", "wpm") SELECT "accuracy", "correctKeystrokes", "createdAt", "id", "mistakeCount", "mistakeDetails", "text", "totalKeystrokes", "userId", "wpm" FROM "TypingResult";
DROP TABLE "TypingResult";
ALTER TABLE "new_TypingResult" RENAME TO "TypingResult";
CREATE INDEX "TypingResult_userId_idx" ON "TypingResult"("userId");
CREATE INDEX "TypingResult_courseId_idx" ON "TypingResult"("courseId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
