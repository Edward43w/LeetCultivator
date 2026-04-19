import { app, BrowserWindow, shell, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;
let serverPort = 3000;

// Show any unhandled crash as a visible dialog instead of silently exiting
process.on('uncaughtException', (err) => {
  dialog.showErrorBox('Code問仙門 啟動失敗', err.stack ?? err.message);
  app.quit();
});
process.on('unhandledRejection', (reason: any) => {
  dialog.showErrorBox('Code問仙門 啟動失敗', reason?.stack ?? String(reason));
  app.quit();
});

function getDatabasePath(): string {
  return path.join(app.getPath('userData'), 'leet-cultivator.db');
}

function setupPrismaEnv() {
  if (!isDev) {
    // With asar:false, all node_modules are directly on disk under resources/app/
    const appBase = path.join(process.resourcesPath, 'app', 'node_modules');
    process.env.PRISMA_QUERY_ENGINE_BINARY = path.join(
      appBase, '.prisma', 'client', 'query_engine-windows.exe'
    );
    process.env.PRISMA_QUERY_ENGINE_LIBRARY = path.join(
      appBase, '.prisma', 'client', 'query_engine-windows.dll.node'
    );
  }
}

async function runMigrations() {
  const { PrismaClient } = await import('@prisma/client');
  const dbPath = getDatabasePath();
  const prisma = new PrismaClient({ datasources: { db: { url: `file:${dbPath}` } } } as any);

  try {
    await prisma.$queryRaw`SELECT 1 FROM "User" LIMIT 1`;
    console.log('[electron] Database already initialized');
  } catch {
    // Tables don't exist — apply migration SQL files
    const migrationsDir = isDev
      ? path.join(process.cwd(), 'prisma', 'migrations')
      : path.join(process.resourcesPath, 'prisma', 'migrations');

    const entries = fs.readdirSync(migrationsDir).sort();
    for (const entry of entries) {
      const sqlFile = path.join(migrationsDir, entry, 'migration.sql');
      if (!fs.existsSync(sqlFile)) continue;
      const sql = fs.readFileSync(sqlFile, 'utf-8');
      const statements = sql
        .split(/;\s*\n/)
        .map((s) => s.replace(/--[^\n]*/g, '').trim())
        .filter((s) => s.length > 0);
      for (const stmt of statements) {
        await prisma.$executeRawUnsafe(stmt);
      }
    }
    console.log('[electron] Migrations applied');
  }

  // Seed reference data on a fresh DB
  const bodyTypeCount = await prisma.bodyType.count();
  if (bodyTypeCount === 0) {
    await seedDatabase(prisma);
    console.log('[electron] Database seeded');
  }

  await prisma.$disconnect();
}

async function seedDatabase(prisma: any) {
  const bodyTypes = [
    { name: 'C++ 聖體', language: 'C++', description: '劍走偏鋒，極致效能，萬劍歸宗。' },
    { name: 'Python 聖體', language: 'Python', description: '大道至簡，萬法自然，言出法隨。' },
    { name: 'Java 聖體', language: 'Java', description: '中正平和，根基深厚，萬法不侵。' },
    { name: 'JavaScript 聖體', language: 'JavaScript', description: '千變萬化，靈動飄逸，無處不在。' },
  ];
  for (const bt of bodyTypes) {
    await prisma.bodyType.upsert({ where: { language: bt.language }, update: {}, create: bt });
  }

  const tags = [
    { name: 'array', sutraName: '萬陣真經' }, { name: 'string', sutraName: '天音心法' },
    { name: 'hash-table', sutraName: '玄元散列錄' }, { name: 'math', sutraName: '太一算經' },
    { name: 'sorting', sutraName: '歸序真訣' }, { name: 'two-pointers', sutraName: '陰陽雙指訣' },
    { name: 'prefix-sum', sutraName: '前綴積海經' }, { name: 'matrix', sutraName: '九宮矩陣譜' },
    { name: 'linked-list', sutraName: '靈絲牽引術' }, { name: 'tree', sutraName: '建木生生訣' },
    { name: 'binary-tree', sutraName: '太極雙枝經' }, { name: 'graph', sutraName: '星辰羅網' },
    { name: 'depth-first-search', sutraName: '幽冥尋脈訣' }, { name: 'breadth-first-search', sutraName: '千層擴域法' },
    { name: 'dp', sutraName: '推演天機錄' }, { name: 'binary-search', sutraName: '兩儀分光劍' },
    { name: 'greedy', sutraName: '吞天噬地功' }, { name: 'backtracking', sutraName: '輪迴溯源法' },
    { name: 'stack', sutraName: '疊嶺鎮魂訣' }, { name: 'queue', sutraName: '流轉長河經' },
    { name: 'sliding-window', sutraName: '移窗觀天術' }, { name: 'union-find', sutraName: '萬象歸宗篇' },
    { name: 'trie', sutraName: '千言靈樹錄' }, { name: 'bit-manipulation', sutraName: '陰陽位元經' },
    { name: 'recursion', sutraName: '迴天返照訣' }, { name: 'topological-sort', sutraName: '天機序位圖' },
    { name: 'shortest-path', sutraName: '極徑通玄錄' }, { name: 'monotonic-stack', sutraName: '單調鎮岳功' },
    { name: 'monotonic-queue', sutraName: '單調流光訣' }, { name: 'design', sutraName: '機關造化篇' },
    { name: 'simulation', sutraName: '萬象演法錄' }, { name: 'heap', sutraName: '聚沙成塔訣' },
  ];
  for (const tag of tags) {
    await prisma.tag.upsert({ where: { name: tag.name }, update: {}, create: tag });
  }

  const mortalGapConfig = [
    { subStage: '練氣', baseGap: 6, levelStep: 1 }, { subStage: '築基', baseGap: 9, levelStep: 1 },
    { subStage: '金丹', baseGap: 13, levelStep: 2 }, { subStage: '元嬰', baseGap: 18, levelStep: 2 },
    { subStage: '化神', baseGap: 24, levelStep: 3 }, { subStage: '煉虛', baseGap: 31, levelStep: 3 },
    { subStage: '合體', baseGap: 40, levelStep: 4 }, { subStage: '大乘', baseGap: 50, levelStep: 5 },
    { subStage: '渡劫', baseGap: 62, levelStep: 6 },
  ];
  const immortalGapConfig = [
    { subStage: '地仙', baseGap: 130, levelStep: 25 }, { subStage: '天仙', baseGap: 170, levelStep: 30 },
    { subStage: '金仙', baseGap: 220, levelStep: 40 }, { subStage: '太乙金仙', baseGap: 285, levelStep: 50 },
    { subStage: '大羅金仙', baseGap: 360, levelStep: 65 }, { subStage: '仙帝', baseGap: 460, levelStep: 90 },
  ];
  const mortalLevels = ['一重天','二重天','三重天','四重天','五重天','六重天','七重天','八重天','九重天'];
  const immortalLevels = ['前期','中期','後期'];

  let currentCultivation = 0;
  await prisma.realmLevel.deleteMany();
  for (const { subStage, baseGap, levelStep } of mortalGapConfig) {
    for (let i = 0; i < mortalLevels.length; i++) {
      await prisma.realmLevel.create({ data: { name: `${subStage}${mortalLevels[i]}`, minCultivation: currentCultivation, stage: '人界', subStage, level: mortalLevels[i] } });
      currentCultivation += baseGap + levelStep * i;
    }
  }
  for (const { subStage, baseGap, levelStep } of immortalGapConfig) {
    for (let i = 0; i < immortalLevels.length; i++) {
      await prisma.realmLevel.create({ data: { name: `${subStage}${immortalLevels[i]}`, minCultivation: currentCultivation, stage: '仙界', subStage, level: immortalLevels[i] } });
      currentCultivation += baseGap + levelStep * i;
    }
  }
}

async function startExpressServer(): Promise<number> {
  setupPrismaEnv();
  process.env.DATABASE_URL = `file:${getDatabasePath()}`;
  process.env.LEET_CULTIVATOR_EMBEDDED = '1';
  process.env.NODE_ENV = isDev ? 'development' : 'production';
  process.env.STATIC_DIST_PATH = isDev
    ? path.join(process.cwd(), 'dist')
    : path.join(app.getAppPath(), 'dist');

  await runMigrations();

  // @ts-ignore — server.cjs is generated by esbuild at build time, not tsc
  const { startServer } = await import('./server.cjs');
  const { server } = await startServer({ port: serverPort, host: '127.0.0.1' });

  return new Promise((resolve, reject) => {
    if (server.listening) {
      const addr = server.address() as { port: number };
      serverPort = addr?.port ?? serverPort;
      resolve(serverPort);
      return;
    }
    server.on('listening', () => {
      const addr = server.address() as { port: number };
      serverPort = addr.port;
      console.log(`[electron] Express server listening on port ${serverPort}`);
      resolve(serverPort);
    });
    server.on('error', (err: Error) => reject(err));
  });
}

function createWindow(port: number) {
  const iconPath = isDev
    ? path.join(process.cwd(), 'public', 'leetcultivator-logo.png')
    : path.join(app.getAppPath(), 'dist', 'leetcultivator-logo.png');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    title: 'Code問仙門 · LeetCultivator',
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(`http://127.0.0.1:${port}`);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    const port = await startExpressServer();
    createWindow(port);

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow(port);
    });
  } catch (err: any) {
    dialog.showErrorBox('Code問仙門 啟動失敗', err?.stack ?? String(err));
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
