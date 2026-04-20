import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

let _prisma: PrismaClient | null = null;
function getPrisma() {
  if (!_prisma) _prisma = new PrismaClient();
  return _prisma;
}

export async function startServer(options?: { port?: number; host?: string }) {
  const app = express();
  const PORT = options?.port ?? Number(process.env.PORT || 3000);
  const HOST = options?.host ?? (process.env.HOST || '0.0.0.0');
  const isProduction = process.env.NODE_ENV === 'production';
  const corsOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: corsOrigins.length > 0 ? corsOrigins : true,
      credentials: true,
    })
  );
  app.use(express.json());

  // --- Auth Middleware ---
  // Single-user local app: authenticate by x-user-id header
  const authenticate = async (req: any, res: any, next: any) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await getPrisma().user.findUnique({ where: { id: userId } });
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = { userId };
    next();
  };

  const getRealmByCultivation = async (totalCultivation: number) => {
    return getPrisma().realmLevel.findFirst({
      where: { minCultivation: { lte: totalCultivation } },
      orderBy: { minCultivation: 'desc' },
    });
  };

  const getFirstRealm = async () => {
    return getPrisma().realmLevel.findFirst({ orderBy: { minCultivation: 'asc' } });
  };

  // --- API Routes ---

  // Auth — local single-user app

  // Check if a local profile exists (no auth needed)
  app.get('/api/auth/status', async (_req, res) => {
    const user = await getPrisma().user.findFirst({
      include: { realm: true, mainBodyType: true, progressSummary: true },
    });
    if (!user) return res.json({ user: null });
    const resolvedRealm = (await getRealmByCultivation(user.totalCultivation)) || (await getFirstRealm());
    res.json({
      user: { ...user, currentRealmId: resolvedRealm?.id || null, realm: resolvedRealm || null },
    });
  });

  // Create local profile (first launch only)
  app.post('/api/auth/setup', async (req, res) => {
    const { nickname } = req.body;
    if (!nickname || typeof nickname !== 'string' || nickname.trim().length === 0) {
      return res.status(400).json({ error: '請輸入道號' });
    }
    const existing = await getPrisma().user.findFirst();
    if (existing) return res.status(400).json({ error: '本地修士已存在' });
    try {
      const user = await getPrisma().user.create({
        data: { nickname: nickname.trim(), progressSummary: { create: {} } },
      });
      res.json({ user });
    } catch (error) {
      res.status(400).json({ error: '建立修士失敗' });
    }
  });

  app.get('/api/auth/me', authenticate, async (req: any, res) => {
    const user = await getPrisma().user.findUnique({
      where: { id: req.user.userId },
      include: { realm: true, mainBodyType: true, progressSummary: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const resolvedRealm = (await getRealmByCultivation(user.totalCultivation)) || (await getFirstRealm());
    res.json({ ...user, currentRealmId: resolvedRealm?.id || null, realm: resolvedRealm || null });
  });

  // Body Types
  app.get('/api/body-types', async (req, res) => {
    const bodyTypes = await getPrisma().bodyType.findMany();
    res.json(bodyTypes);
  });

  app.post('/api/user/body-type', authenticate, async (req: any, res) => {
    const { bodyTypeId } = req.body;
    try {
      const user = await getPrisma().user.update({
        where: { id: req.user.userId },
        data: { mainBodyTypeId: bodyTypeId }
      });
      // Also create UserBodyType entry if it doesn't exist
      await getPrisma().userBodyType.upsert({
        where: { userId_bodyTypeId: { userId: req.user.userId, bodyTypeId } },
        update: {},
        create: { userId: req.user.userId, bodyTypeId }
      });
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: 'Failed to set body type' });
    }
  });

  app.patch('/api/user/nickname', authenticate, async (req: any, res) => {
    const { nickname } = req.body;
    if (!nickname || typeof nickname !== 'string' || nickname.trim().length === 0) {
      return res.status(400).json({ error: '道號不可為空' });
    }
    if (nickname.trim().length > 20) {
      return res.status(400).json({ error: '道號不可超過 20 字' });
    }
    try {
      const user = await getPrisma().user.update({
        where: { id: req.user.userId },
        data: { nickname: nickname.trim() },
      });
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update nickname' });
    }
  });

  app.delete('/api/user', authenticate, async (req: any, res) => {
    const userId = req.user.userId;
    try {
      await getPrisma().$transaction([
        getPrisma().reviewHistory.deleteMany({ where: { problemLog: { userId } } }),
        getPrisma().cultivationNote.deleteMany({ where: { problemLog: { userId } } }),
        getPrisma().problemLogTag.deleteMany({ where: { problemLog: { userId } } }),
        getPrisma().problemLog.deleteMany({ where: { userId } }),
        getPrisma().userTagProgress.deleteMany({ where: { userId } }),
        getPrisma().userBodyType.deleteMany({ where: { userId } }),
        getPrisma().dailyCheckin.deleteMany({ where: { userId } }),
        getPrisma().userProgressSummary.deleteMany({ where: { userId } }),
        getPrisma().user.delete({ where: { id: userId } }),
      ]);
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  // Tags
  app.get('/api/tags', async (req, res) => {
    const tags = await getPrisma().tag.findMany();
    res.json(tags);
  });

  // Dashboard Data
  app.get('/api/dashboard', authenticate, async (req: any, res) => {
    const userId = req.user.userId;
    const user = await getPrisma().user.findUnique({
      where: { id: userId },
      include: { realm: true, mainBodyType: true, progressSummary: true }
    });
    
    const bodyTypes = await getPrisma().userBodyType.findMany({
      where: { userId },
      include: { bodyType: true }
    });

    const sutras = await getPrisma().userTagProgress.findMany({
      where: { userId },
      include: { tag: true }
    });

    const recentLogs = await getPrisma().problemLog.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 5,
      include: { tags: { include: { tag: true } } }
    });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const checkin = await getPrisma().dailyCheckin.findUnique({
      where: { userId_date: { userId, date: today } }
    });

    const resolvedRealm = user
      ? (await getRealmByCultivation(user.totalCultivation)) || (await getFirstRealm())
      : null;

    // Find next realm
    let nextRealm = null;
    if (resolvedRealm) {
      nextRealm = await getPrisma().realmLevel.findFirst({
        where: { minCultivation: { gt: resolvedRealm.minCultivation } },
        orderBy: { minCultivation: 'asc' }
      });
    } else {
      nextRealm = await getPrisma().realmLevel.findFirst({
        orderBy: { minCultivation: 'asc' }
      });
    }

    res.json({
      user: user
        ? {
            ...user,
            currentRealmId: resolvedRealm?.id || null,
            realm: resolvedRealm || null,
          }
        : null,
      bodyTypes,
      sutras,
      recentLogs,
      checkedInToday: !!checkin,
      nextRealm
    });
  });

  // Realm Overview
  app.get('/api/realms-overview', authenticate, async (req: any, res) => {
    const userId = req.user.userId;

    const user = await getPrisma().user.findUnique({
      where: { id: userId },
      include: { realm: true },
    });

    const realms = await getPrisma().realmLevel.findMany({
      orderBy: [{ minCultivation: 'asc' }, { id: 'asc' }],
    });

    const totalCultivation = user?.totalCultivation || 0;
    const resolvedCurrentRealm = realms.reduce<any>((current, realm) => {
      if (realm.minCultivation <= totalCultivation) return realm;
      return current;
    }, null);
    const resolvedCurrentRealmId = resolvedCurrentRealm?.id || null;

    const realmsWithMeta = realms.map((realm, index) => {
      const previousRealm = realms[index - 1] || null;
      const nextRealm = realms[index + 1] || null;
      const stageLevels = realm.stage === '仙界' ? ['前期', '中期', '後期'] : ['一重天', '二重天', '三重天', '四重天', '五重天', '六重天', '七重天', '八重天', '九重天'];
      const currentStageIndex = Math.max(0, stageLevels.indexOf(realm.level) + 1);

      return {
        ...realm,
        order: index + 1,
        currentStageIndex,
        stageTotal: stageLevels.length,
        unlockGap: previousRealm ? realm.minCultivation - previousRealm.minCultivation : realm.minCultivation,
        nextGap: nextRealm ? nextRealm.minCultivation - realm.minCultivation : null,
        isUnlocked: !!user && user.totalCultivation >= realm.minCultivation,
        isCurrent: resolvedCurrentRealmId === realm.id,
      };
    });

    const grouped = realmsWithMeta.reduce((groups: any[], realm) => {
      const existing = groups.find((group) => group.stage === realm.stage);
      if (existing) {
        existing.realms.push(realm);
      } else {
        groups.push({ stage: realm.stage, realms: [realm] });
      }
      return groups;
    }, []);

    const nextRealm = resolvedCurrentRealm
      ? realms.find((realm) => realm.minCultivation > resolvedCurrentRealm.minCultivation) || null
      : realms[0] || null;

    res.json({
      user: {
        totalCultivation: user?.totalCultivation || 0,
        currentRealmId: resolvedCurrentRealmId,
        currentRealm: resolvedCurrentRealm || null,
      },
      nextRealm,
      grouped,
      realms: realmsWithMeta,
    });
  });

  // Sutras Overview (include locked and unlocked)
  app.get('/api/sutras-overview', authenticate, async (req: any, res) => {
    const userId = req.user.userId;

    const tags = await getPrisma().tag.findMany({
      orderBy: { name: 'asc' },
    });

    const progressList = await getPrisma().userTagProgress.findMany({
      where: { userId },
    });

    const progressByTagId = new Map(progressList.map((item) => [item.tagId, item]));

    const sutras = tags.map((tag) => {
      const progress = progressByTagId.get(tag.id);
      return {
        tagId: tag.id,
        tagName: tag.name,
        sutraName: tag.sutraName,
        solvedCount: progress?.solvedCount || 0,
        level: progress?.level || 0,
        levelName: progress?.levelName || '未入門',
        status: (progress?.solvedCount ?? 0) > 0 ? 'cultivating' : 'locked',
      };
    });

    res.json(sutras);
  });

  // Record Problem
  app.post('/api/problems', authenticate, async (req: any, res) => {
    const userId = req.user.userId;
    const { title, problemNumber, difficulty, language, link, tags, completedAt, summary, stuckPoints, reviewReminders, initialReviewResult } = req.body;

    if (!summary || !stuckPoints || !reviewReminders) {
      return res.status(400).json({ error: '修行手札不可為空' });
    }

    const pointsMap: Record<string, number> = { 'Easy': 10, 'Medium': 25, 'Hard': 50 };
    const points = pointsMap[difficulty] || 10;
    const date = new Date(completedAt);

    // Derive a stable UTC-midnight date from the input date string to avoid timezone drift
    const completedAtStr = (typeof completedAt === 'string' ? completedAt : new Date(completedAt).toISOString()).substring(0, 10);
    const completedDateUTC = new Date(completedAtStr + 'T00:00:00.000Z');

    const todayStr = new Date().toISOString().substring(0, 10);
    const todayUTC = new Date(todayStr + 'T00:00:00.000Z');

    // Calculate nextReviewDate based on user's self-assessment (default: ok = 3 days)
    const reviewDaysMap: Record<string, number> = { fail: 1, ok: 3, easy: 7, done: 14 };
    const reviewDays = reviewDaysMap[initialReviewResult as string] ?? 3;
    const initialReviewDate = new Date(completedDateUTC);
    initialReviewDate.setUTCDate(initialReviewDate.getUTCDate() + reviewDays);

    try {
      const result = await getPrisma().$transaction(async (tx) => {
        // 1. Create Log & Note
        const log = await tx.problemLog.create({
          data: {
            userId, title, problemNumber, difficulty, language, link, completedAt: date, cultivationEarned: points,
            reviewLevel: 0, nextReviewDate: initialReviewDate,
            note: { create: { summary, stuckPoints, reviewReminders } },
            tags: { create: tags.map((tagId: number) => ({ tagId })) }
          }
        });

        // 2. Update User Cultivation
        const user = await tx.user.update({
          where: { id: userId },
          data: { totalCultivation: { increment: points } }
        });

        // 3. Update Realm
        const newRealm = await tx.realmLevel.findFirst({
          where: { minCultivation: { lte: user.totalCultivation } },
          orderBy: { minCultivation: 'desc' }
        });
        
        let realmBreakthrough = false;
        let newRealmName = null;
        if (newRealm && newRealm.id !== user.currentRealmId) {
          await tx.user.update({ where: { id: userId }, data: { currentRealmId: newRealm.id } });
          realmBreakthrough = true;
          newRealmName = newRealm.name;
        }

        // 4. Update Body Type
        const bodyType = await tx.bodyType.findUnique({ where: { language } });
        let bodyUpgrade = false;
        if (bodyType) {
          const userBody = await tx.userBodyType.upsert({
            where: { userId_bodyTypeId: { userId, bodyTypeId: bodyType.id } },
            update: { solvedCount: { increment: 1 } },
            create: { userId, bodyTypeId: bodyType.id, solvedCount: 1 }
          });
          
          let newLevel = '初成';
          if (userBody.solvedCount >= 150) newLevel = '大成';
          else if (userBody.solvedCount >= 60) newLevel = '中成';
          else if (userBody.solvedCount >= 20) newLevel = '小成';

          if (userBody.level !== newLevel) {
            await tx.userBodyType.update({
              where: { id: userBody.id },
              data: { level: newLevel }
            });
            bodyUpgrade = true;
          }
        }

        // 5. Update Sutras (Tags)
        const upgradedSutras = [];
        for (const tagId of tags) {
          const userTag = await tx.userTagProgress.upsert({
            where: { userId_tagId: { userId, tagId } },
            update: { solvedCount: { increment: 1 } },
            create: { userId, tagId, solvedCount: 1, level: 1, levelName: '入門' },
            include: { tag: true }
          });

          let newLevel = 1;
          let newLevelName = '入門';
          if (userTag.solvedCount >= 50) { newLevel = 5; newLevelName = '圓滿'; }
          else if (userTag.solvedCount >= 30) { newLevel = 4; newLevelName = '大成'; }
          else if (userTag.solvedCount >= 15) { newLevel = 3; newLevelName = '中成'; }
          else if (userTag.solvedCount >= 5) { newLevel = 2; newLevelName = '小成'; }
          else { newLevel = 1; newLevelName = '入門'; }

          if (userTag.level !== newLevel) {
            await tx.userTagProgress.update({
              where: { id: userTag.id },
              data: { level: newLevel, levelName: newLevelName }
            });
            upgradedSutras.push(userTag.tag.sutraName);
          }
        }

        // 6. Daily Checkin – always record for completedDate (not restricted to today)
        let checkedInToday = false;
        const existingCheckin = await tx.dailyCheckin.findUnique({
          where: { userId_date: { userId, date: completedDateUTC } }
        });
        if (!existingCheckin) {
          await tx.dailyCheckin.create({ data: { userId, date: completedDateUTC } });
          checkedInToday = completedDateUTC.getTime() === todayUTC.getTime();

          // Update summary + streak (streak is based on real today)
          const summary = await tx.userProgressSummary.findUnique({ where: { userId } });
          if (summary) {
            const yesterday = new Date(todayUTC);
            yesterday.setUTCDate(yesterday.getUTCDate() - 1);
            const isConsecutive = summary.lastCheckinDate?.getTime() === yesterday.getTime();
            const newStreak = isConsecutive ? summary.currentStreak + 1 : 1;
            const longestStreak = Math.max(summary.longestStreak, newStreak);
            await tx.userProgressSummary.update({
              where: { userId },
              data: {
                currentStreak: newStreak,
                longestStreak,
                lastCheckinDate: todayUTC,
                totalSolved: { increment: 1 },
                easySolved: difficulty === 'Easy' ? { increment: 1 } : undefined,
                mediumSolved: difficulty === 'Medium' ? { increment: 1 } : undefined,
                hardSolved: difficulty === 'Hard' ? { increment: 1 } : undefined,
              }
            });
          }
        } else {
          // Check-in already exists for this date; still count the solved stat
          await tx.userProgressSummary.update({
            where: { userId },
            data: {
              totalSolved: { increment: 1 },
              easySolved: difficulty === 'Easy' ? { increment: 1 } : undefined,
              mediumSolved: difficulty === 'Medium' ? { increment: 1 } : undefined,
              hardSolved: difficulty === 'Hard' ? { increment: 1 } : undefined,
            }
          });
        }

        return {
          pointsEarned: points,
          realmBreakthrough,
          newRealmName,
          bodyUpgrade,
          upgradedSutras,
          checkedInToday,
          totalCultivation: user.totalCultivation + points
        };
      });

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to record problem' });
    }
  });

  // Helper: recalculate currentStreak + longestStreak from DailyCheckin table
  async function recalculateStreak(userId: string, tx: any) {
    const checkins = await tx.dailyCheckin.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
      select: { date: true },
    });
    let longestStreak = 0, tempStreak = 0;
    let prevDate: Date | null = null;
    for (const { date } of checkins) {
      if (!prevDate) {
        tempStreak = 1;
      } else {
        const diff = Math.round((date.getTime() - prevDate.getTime()) / 86400000);
        tempStreak = diff === 1 ? tempStreak + 1 : 1;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
      prevDate = date;
    }
    const todayUTC = new Date(); todayUTC.setUTCHours(0, 0, 0, 0);
    let currentStreak = 0;
    let d = new Date(todayUTC);
    while (checkins.some((c: any) => c.date.getTime() === d.getTime())) {
      currentStreak++;
      d.setUTCDate(d.getUTCDate() - 1);
    }
    await tx.userProgressSummary.update({
      where: { userId },
      data: { currentStreak, longestStreak },
    });
  }

  // Helper: compute level from solvedCount
  function tagLevel(count: number): { level: number; levelName: string } {
    if (count >= 50) return { level: 5, levelName: '圓滿' };
    if (count >= 30) return { level: 4, levelName: '大成' };
    if (count >= 15) return { level: 3, levelName: '中成' };
    if (count >= 5)  return { level: 2, levelName: '小成' };
    if (count >= 1)  return { level: 1, levelName: '入門' };
    return { level: 0, levelName: '未解鎖' };
  }

  // Delete problem log — cascade: cultivation, tags, checkin, streak
  app.delete('/api/problems/:id', authenticate, async (req: any, res) => {
    const logId = parseInt(req.params.id);
    const userId = req.user.userId;
    if (isNaN(logId)) return res.status(400).json({ error: 'Invalid id' });
    try {
      await getPrisma().$transaction(async (tx) => {
        const log = await tx.problemLog.findFirst({
          where: { id: logId, userId },
          include: { tags: true },
        });
        if (!log) throw new Error('Not found');

        const { difficulty, cultivationEarned, completedAt } = log;
        const raw = completedAt instanceof Date ? completedAt : new Date(String(completedAt));
        const completedDateUTC = new Date(raw.toISOString().substring(0, 10) + 'T00:00:00.000Z');
        const nextDay = new Date(completedDateUTC);
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);

        // Delete log (cascades CultivationNote + ProblemLogTag)
        await tx.problemLog.delete({ where: { id: logId } });

        // Subtract cultivation
        await tx.user.update({ where: { id: userId }, data: { totalCultivation: { decrement: cultivationEarned } } });

        // Decrement tag progress
        for (const lt of log.tags) {
          const progress = await tx.userTagProgress.findUnique({ where: { userId_tagId: { userId, tagId: lt.tagId } } });
          if (progress) {
            const newCount = Math.max(0, progress.solvedCount - 1);
            await tx.userTagProgress.update({ where: { id: progress.id }, data: { solvedCount: newCount, ...tagLevel(newCount) } });
          }
        }

        // Decrement summary
        await tx.userProgressSummary.update({
          where: { userId },
          data: {
            totalSolved: { decrement: 1 },
            easySolved: difficulty === 'Easy' ? { decrement: 1 } : undefined,
            mediumSolved: difficulty === 'Medium' ? { decrement: 1 } : undefined,
            hardSolved: difficulty === 'Hard' ? { decrement: 1 } : undefined,
          },
        });

        // If no logs remain for that date, remove checkin + recalculate streak
        const remaining = await tx.problemLog.count({ where: { userId, completedAt: { gte: completedDateUTC, lt: nextDay } } });
        if (remaining === 0) {
          await tx.dailyCheckin.deleteMany({ where: { userId, date: completedDateUTC } });
          await recalculateStreak(userId, tx);
        }
      });
      res.json({ success: true });
    } catch (err) {
      console.error('[delete problem]', err);
      res.status(500).json({ error: 'Failed to delete problem log' });
    }
  });

  // Update problem log — recalculates cultivation/tags/checkin as needed
  app.put('/api/problems/:id', authenticate, async (req: any, res) => {
    const logId = parseInt(req.params.id);
    const userId = req.user.userId;
    if (isNaN(logId)) return res.status(400).json({ error: 'Invalid id' });
    const { title, problemNumber, difficulty, language, link, completedAt, tags = [], summary, stuckPoints, reviewReminders, nextReviewDate: nextReviewDateInput } = req.body;
    const POINTS: Record<string, number> = { Easy: 10, Medium: 25, Hard: 50 };
    try {
      await getPrisma().$transaction(async (tx) => {
        const oldLog = await tx.problemLog.findFirst({
          where: { id: logId, userId },
          include: { tags: true, note: true },
        });
        if (!oldLog) throw new Error('Not found');

        const oldPoints = POINTS[oldLog.difficulty] || 10;
        const newPoints = POINTS[difficulty] || 10;
        const cultivationDelta = newPoints - oldPoints;

        const raw = oldLog.completedAt instanceof Date ? oldLog.completedAt : new Date(String(oldLog.completedAt));
        const oldDateUTC = new Date(raw.toISOString().substring(0, 10) + 'T00:00:00.000Z');
        const newDateUTC = new Date(completedAt + 'T00:00:00.000Z');
        const dateChanged = oldDateUTC.getTime() !== newDateUTC.getTime();

        const oldTagIds: number[] = oldLog.tags.map((t: any) => t.tagId);
        const newTagIds: number[] = (Array.isArray(tags) ? tags : []).map(Number);
        const removedTagIds = oldTagIds.filter(id => !newTagIds.includes(id));
        const addedTagIds = newTagIds.filter(id => !oldTagIds.includes(id));

        // Adjust cultivation
        if (cultivationDelta !== 0) {
          await tx.user.update({ where: { id: userId }, data: { totalCultivation: { increment: cultivationDelta } } });
        }

        // Adjust difficulty counts
        if (oldLog.difficulty !== difficulty) {
          await tx.userProgressSummary.update({
            where: { userId },
            data: {
              easySolved:   oldLog.difficulty === 'Easy'   ? { decrement: 1 } : difficulty === 'Easy'   ? { increment: 1 } : undefined,
              mediumSolved: oldLog.difficulty === 'Medium' ? { decrement: 1 } : difficulty === 'Medium' ? { increment: 1 } : undefined,
              hardSolved:   oldLog.difficulty === 'Hard'   ? { decrement: 1 } : difficulty === 'Hard'   ? { increment: 1 } : undefined,
            },
          });
        }

        // Decrement removed tags
        for (const tagId of removedTagIds) {
          const p = await tx.userTagProgress.findUnique({ where: { userId_tagId: { userId, tagId } } });
          if (p) {
            const newCount = Math.max(0, p.solvedCount - 1);
            await tx.userTagProgress.update({ where: { id: p.id }, data: { solvedCount: newCount, ...tagLevel(newCount) } });
          }
        }

        // Increment added tags
        for (const tagId of addedTagIds) {
          const existing = await tx.userTagProgress.findUnique({ where: { userId_tagId: { userId, tagId } } });
          const newCount = (existing?.solvedCount ?? 0) + 1;
          await tx.userTagProgress.upsert({
            where: { userId_tagId: { userId, tagId } },
            update: { solvedCount: { increment: 1 }, ...tagLevel(newCount) },
            create: { userId, tagId, solvedCount: 1, ...tagLevel(1) },
          });
        }

        // Update the log
        await tx.problemLog.update({
          where: { id: logId },
          data: {
            title,
            problemNumber: problemNumber || null,
            difficulty,
            language,
            link: link || null,
            completedAt: newDateUTC,
            cultivationEarned: newPoints,
            ...(nextReviewDateInput ? { nextReviewDate: new Date(nextReviewDateInput + 'T00:00:00.000Z') } : {}),
            tags: {
              deleteMany: removedTagIds.length > 0 ? { tagId: { in: removedTagIds } } : undefined,
              create: addedTagIds.map((tagId: number) => ({ tagId })),
            },
          },
        });

        // Update or create note
        if (oldLog.note) {
          await tx.cultivationNote.update({ where: { problemLogId: logId }, data: { summary, stuckPoints, reviewReminders } });
        } else {
          await tx.cultivationNote.create({ data: { problemLogId: logId, summary, stuckPoints, reviewReminders } });
        }

        // Handle date change
        if (dateChanged) {
          const oldNextDay = new Date(oldDateUTC); oldNextDay.setUTCDate(oldNextDay.getUTCDate() + 1);
          const remainingOld = await tx.problemLog.count({ where: { userId, completedAt: { gte: oldDateUTC, lt: oldNextDay } } });
          if (remainingOld === 0) {
            await tx.dailyCheckin.deleteMany({ where: { userId, date: oldDateUTC } });
          }
          await tx.dailyCheckin.upsert({
            where: { userId_date: { userId, date: newDateUTC } },
            update: {},
            create: { userId, date: newDateUTC },
          });
          await recalculateStreak(userId, tx);
        }
      });
      res.json({ success: true });
    } catch (err) {
      console.error('[update problem]', err);
      res.status(500).json({ error: 'Failed to update problem log' });
    }
  });

  // Checkin history — merged from ProblemLog (historical compat) + DailyCheckin (covers review-only days)
  app.get('/api/checkins', authenticate, async (req: any, res) => {
    try {
      const [logs, checkins] = await Promise.all([
        getPrisma().problemLog.findMany({
          where: { userId: req.user.userId },
          select: { completedAt: true },
        }),
        getPrisma().dailyCheckin.findMany({
          where: { userId: req.user.userId },
          select: { date: true },
        }),
      ]);
      const dateSet = new Set<string>();
      for (const log of logs) {
        const raw = log.completedAt;
        const iso = raw instanceof Date ? raw.toISOString() : String(raw);
        dateSet.add(iso.substring(0, 10));
      }
      for (const c of checkins) {
        const raw = c.date;
        const iso = raw instanceof Date ? raw.toISOString() : String(raw);
        dateSet.add(iso.substring(0, 10));
      }
      res.json([...dateSet].sort().reverse());
    } catch (err) {
      console.error('[checkins]', err);
      res.status(500).json({ error: 'Failed to fetch checkins' });
    }
  });

  // ─── Review System ──────────────────────────────────────────────────────────

  // GET /api/review — return all problems due for review today
  app.get('/api/review', authenticate, async (req: any, res) => {
    const userId = req.user.userId;
    const todayStr = new Date().toISOString().substring(0, 10);
    const todayUTC = new Date(todayStr + 'T00:00:00.000Z');
    try {
      const logs = await getPrisma().problemLog.findMany({
        where: { userId, nextReviewDate: { lte: todayUTC } },
        orderBy: { nextReviewDate: 'asc' },
        include: { note: true, tags: { include: { tag: true } } },
      });
      res.json(logs);
    } catch (err) {
      console.error('[review list]', err);
      res.status(500).json({ error: 'Failed to fetch review list' });
    }
  });

  // POST /api/review/:id — submit review result
  app.post('/api/review/:id', authenticate, async (req: any, res) => {
    const logId = parseInt(req.params.id);
    const userId = req.user.userId;
    if (isNaN(logId)) return res.status(400).json({ error: 'Invalid id' });

    const { result, summary, stuckPoints, reviewReminders, customNextReviewDate } = req.body;
    if (!['fail', 'ok', 'easy', 'done'].includes(result)) {
      return res.status(400).json({ error: '無效的重修結果' });
    }

    const todayStr = new Date().toISOString().substring(0, 10);
    const todayUTC = new Date(todayStr + 'T00:00:00.000Z');

    const daysMap: Record<string, number> = { fail: 1, ok: 3, easy: 7, done: 14 };
    const levelDelta: Record<string, number> = { fail: -1, ok: 1, easy: 2, done: 3 };

    try {
      await getPrisma().$transaction(async (tx) => {
        const log = await tx.problemLog.findFirst({ where: { id: logId, userId } });
        if (!log) throw new Error('Not found');

        const newReviewLevel = Math.max(0, (log.reviewLevel ?? 0) + levelDelta[result]);
        // Allow caller to override the calculated next review date
        const nextReviewDate = customNextReviewDate
          ? new Date(customNextReviewDate + 'T00:00:00.000Z')
          : (() => { const d = new Date(todayUTC); d.setUTCDate(d.getUTCDate() + daysMap[result]); return d; })();

        // Update problem log review fields
        await tx.problemLog.update({
          where: { id: logId },
          data: { reviewLevel: newReviewLevel, nextReviewDate, lastReviewResult: result },
        });

        // Update note (pre-filled, user may have edited/appended)
        if (summary !== undefined || stuckPoints !== undefined || reviewReminders !== undefined) {
          const existingNote = await tx.cultivationNote.findUnique({ where: { problemLogId: logId } });
          if (existingNote) {
            await tx.cultivationNote.update({
              where: { problemLogId: logId },
              data: {
                summary: summary ?? existingNote.summary,
                stuckPoints: stuckPoints ?? existingNote.stuckPoints,
                reviewReminders: reviewReminders ?? existingNote.reviewReminders,
              },
            });
          } else {
            await tx.cultivationNote.create({
              data: { problemLogId: logId, summary: summary || '', stuckPoints: stuckPoints || '', reviewReminders: reviewReminders || '' },
            });
          }
        }

        // Record review history
        await tx.reviewHistory.create({ data: { problemLogId: logId, reviewDate: todayUTC, result } });

        // Daily checkin — trigger for today if not already done
        const existingCheckin = await tx.dailyCheckin.findUnique({
          where: { userId_date: { userId, date: todayUTC } },
        });
        if (!existingCheckin) {
          await tx.dailyCheckin.create({ data: { userId, date: todayUTC } });
          const progressSummary = await tx.userProgressSummary.findUnique({ where: { userId } });
          if (progressSummary) {
            const yesterday = new Date(todayUTC);
            yesterday.setUTCDate(yesterday.getUTCDate() - 1);
            const isConsecutive = progressSummary.lastCheckinDate?.getTime() === yesterday.getTime();
            const newStreak = isConsecutive ? progressSummary.currentStreak + 1 : 1;
            const longestStreak = Math.max(progressSummary.longestStreak, newStreak);
            await tx.userProgressSummary.update({
              where: { userId },
              data: { currentStreak: newStreak, longestStreak, lastCheckinDate: todayUTC },
            });
          }
        }
      });
      res.json({ success: true });
    } catch (err) {
      console.error('[review submit]', err);
      res.status(500).json({ error: 'Failed to submit review' });
    }
  });

  // History
  app.get('/api/history', authenticate, async (req: any, res) => {
    const logs = await getPrisma().problemLog.findMany({
      where: { userId: req.user.userId },
      orderBy: { completedAt: 'desc' },
      include: {
        note: true,
        tags: { include: { tag: true } }
      }
    });
    res.json(logs);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = process.env.STATIC_DIST_PATH || path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  return { app, server };
}

if (process.env.LEET_CULTIVATOR_EMBEDDED !== '1') {
  startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}
