-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nickname" TEXT NOT NULL,
    "totalCultivation" INTEGER NOT NULL DEFAULT 0,
    "currentRealmId" INTEGER,
    "mainBodyTypeId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_currentRealmId_fkey" FOREIGN KEY ("currentRealmId") REFERENCES "RealmLevel" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_mainBodyTypeId_fkey" FOREIGN KEY ("mainBodyTypeId") REFERENCES "BodyType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RealmLevel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "minCultivation" INTEGER NOT NULL,
    "stage" TEXT NOT NULL,
    "subStage" TEXT NOT NULL,
    "level" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BodyType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UserBodyType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "bodyTypeId" INTEGER NOT NULL,
    "solvedCount" INTEGER NOT NULL DEFAULT 0,
    "level" TEXT NOT NULL DEFAULT '初成',
    CONSTRAINT "UserBodyType_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserBodyType_bodyTypeId_fkey" FOREIGN KEY ("bodyTypeId") REFERENCES "BodyType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "sutraName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ProblemLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "problemNumber" TEXT,
    "difficulty" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "link" TEXT,
    "completedAt" DATETIME NOT NULL,
    "cultivationEarned" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProblemLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CultivationNote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "problemLogId" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "stuckPoints" TEXT NOT NULL,
    "reviewReminders" TEXT NOT NULL,
    CONSTRAINT "CultivationNote_problemLogId_fkey" FOREIGN KEY ("problemLogId") REFERENCES "ProblemLog" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProblemLogTag" (
    "problemLogId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    PRIMARY KEY ("problemLogId", "tagId"),
    CONSTRAINT "ProblemLogTag_problemLogId_fkey" FOREIGN KEY ("problemLogId") REFERENCES "ProblemLog" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProblemLogTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserTagProgress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "tagId" INTEGER NOT NULL,
    "solvedCount" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 0,
    "levelName" TEXT NOT NULL DEFAULT '未解鎖',
    CONSTRAINT "UserTagProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserTagProgress_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyCheckin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyCheckin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserProgressSummary" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "totalSolved" INTEGER NOT NULL DEFAULT 0,
    "easySolved" INTEGER NOT NULL DEFAULT 0,
    "mediumSolved" INTEGER NOT NULL DEFAULT 0,
    "hardSolved" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastCheckinDate" DATETIME,
    CONSTRAINT "UserProgressSummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BodyType_language_key" ON "BodyType"("language");

-- CreateIndex
CREATE UNIQUE INDEX "UserBodyType_userId_bodyTypeId_key" ON "UserBodyType"("userId", "bodyTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CultivationNote_problemLogId_key" ON "CultivationNote"("problemLogId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTagProgress_userId_tagId_key" ON "UserTagProgress"("userId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyCheckin_userId_date_key" ON "DailyCheckin"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgressSummary_userId_key" ON "UserProgressSummary"("userId");
