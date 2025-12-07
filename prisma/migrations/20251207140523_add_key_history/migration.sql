-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TypingResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "wpm" REAL NOT NULL,
    "accuracy" REAL NOT NULL,
    "mistakeCount" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "totalKeystrokes" INTEGER NOT NULL,
    "correctKeystrokes" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "mistakeDetails" TEXT NOT NULL,
    "keyHistory" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "courseId" TEXT,
    CONSTRAINT "TypingResult_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TypingResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TypingResult" ("accuracy", "correctKeystrokes", "courseId", "createdAt", "id", "mistakeCount", "mistakeDetails", "score", "text", "totalKeystrokes", "userId", "wpm") SELECT "accuracy", "correctKeystrokes", "courseId", "createdAt", "id", "mistakeCount", "mistakeDetails", "score", "text", "totalKeystrokes", "userId", "wpm" FROM "TypingResult";
DROP TABLE "TypingResult";
ALTER TABLE "new_TypingResult" RENAME TO "TypingResult";
CREATE INDEX "TypingResult_userId_idx" ON "TypingResult"("userId");
CREATE INDEX "TypingResult_courseId_idx" ON "TypingResult"("courseId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
