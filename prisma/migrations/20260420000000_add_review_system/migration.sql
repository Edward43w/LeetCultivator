-- AlterTable: add review fields to ProblemLog
ALTER TABLE "ProblemLog" ADD COLUMN "reviewLevel" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ProblemLog" ADD COLUMN "nextReviewDate" DATETIME;
ALTER TABLE "ProblemLog" ADD COLUMN "lastReviewResult" TEXT;

-- Set default nextReviewDate for existing records: completedAt + 3 days
UPDATE "ProblemLog" SET "nextReviewDate" = datetime("completedAt", '+3 days');

-- CreateTable: ReviewHistory
CREATE TABLE "ReviewHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "problemLogId" INTEGER NOT NULL,
    "reviewDate" DATETIME NOT NULL,
    "result" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReviewHistory_problemLogId_fkey" FOREIGN KEY ("problemLogId") REFERENCES "ProblemLog" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
