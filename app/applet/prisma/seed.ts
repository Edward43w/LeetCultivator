import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed BodyTypes
  const bodyTypes = [
    { name: 'C++ 聖體', language: 'C++', description: '劍走偏鋒，極致效能，萬劍歸宗。' },
    { name: 'Python 聖體', language: 'Python', description: '大道至簡，萬法自然，言出法隨。' },
    { name: 'Java 聖體', language: 'Java', description: '中正平和，根基深厚，萬法不侵。' },
    { name: 'JavaScript 聖體', language: 'JavaScript', description: '千變萬化，靈動飄逸，無處不在。' },
  ];

  for (const bt of bodyTypes) {
    await prisma.bodyType.upsert({
      where: { language: bt.language },
      update: {},
      create: bt,
    });
  }

  // 2. Seed Tags (Sutras)
  const tags = [
    { name: 'array', sutraName: '萬陣真經' },
    { name: 'string', sutraName: '天音心法' },
    { name: 'hash-table', sutraName: '玄元散列錄' },
    { name: 'math', sutraName: '太一算經' },
    { name: 'sorting', sutraName: '歸序真訣' },
    { name: 'two-pointers', sutraName: '陰陽雙指訣' },
    { name: 'prefix-sum', sutraName: '前綴積海經' },
    { name: 'matrix', sutraName: '九宮矩陣譜' },
    { name: 'linked-list', sutraName: '靈絲牽引術' },
    { name: 'tree', sutraName: '建木生生訣' },
    { name: 'binary-tree', sutraName: '太極雙枝經' },
    { name: 'graph', sutraName: '星辰羅網' },
    { name: 'depth-first-search', sutraName: '幽冥尋脈訣' },
    { name: 'breadth-first-search', sutraName: '千層擴域法' },
    { name: 'dp', sutraName: '推演天機錄' },
    { name: 'binary-search', sutraName: '兩儀分光劍' },
    { name: 'greedy', sutraName: '吞天噬地功' },
    { name: 'backtracking', sutraName: '輪迴溯源法' },
    { name: 'stack', sutraName: '疊嶺鎮魂訣' },
    { name: 'queue', sutraName: '流轉長河經' },
    { name: 'sliding-window', sutraName: '移窗觀天術' },
    { name: 'union-find', sutraName: '萬象歸宗篇' },
    { name: 'trie', sutraName: '千言靈樹錄' },
    { name: 'bit-manipulation', sutraName: '陰陽位元經' },
    { name: 'recursion', sutraName: '迴天返照訣' },
    { name: 'topological-sort', sutraName: '天機序位圖' },
    { name: 'shortest-path', sutraName: '極徑通玄錄' },
    { name: 'monotonic-stack', sutraName: '單調鎮岳功' },
    { name: 'monotonic-queue', sutraName: '單調流光訣' },
    { name: 'design', sutraName: '機關造化篇' },
    { name: 'simulation', sutraName: '萬象演法錄' },
    { name: 'heap', sutraName: '聚沙成塔訣' },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag,
    });
  }

  // 3. Seed Realm Levels
  const mortalRealms = ['練氣', '築基', '金丹', '元嬰', '化神', '煉虛', '合體', '大乘', '渡劫'];
  const mortalLevels = ['一重天', '二重天', '三重天', '四重天', '五重天', '六重天', '七重天', '八重天', '九重天'];
  
  const immortalRealms = ['地仙', '天仙', '金仙', '太乙金仙', '大羅金仙', '仙帝'];
  const immortalLevels = ['前期', '中期', '後期'];

  const mortalGapConfig = [
    { subStage: '練氣', baseGap: 6, levelStep: 1 },
    { subStage: '築基', baseGap: 9, levelStep: 1 },
    { subStage: '金丹', baseGap: 13, levelStep: 2 },
    { subStage: '元嬰', baseGap: 18, levelStep: 2 },
    { subStage: '化神', baseGap: 24, levelStep: 3 },
    { subStage: '煉虛', baseGap: 31, levelStep: 3 },
    { subStage: '合體', baseGap: 40, levelStep: 4 },
    { subStage: '大乘', baseGap: 50, levelStep: 5 },
    { subStage: '渡劫', baseGap: 62, levelStep: 6 },
  ] as const;

  const immortalGapConfig = [
    { subStage: '地仙', baseGap: 130, levelStep: 25 },
    { subStage: '天仙', baseGap: 170, levelStep: 30 },
    { subStage: '金仙', baseGap: 220, levelStep: 40 },
    { subStage: '太乙金仙', baseGap: 285, levelStep: 50 },
    { subStage: '大羅金仙', baseGap: 360, levelStep: 65 },
    { subStage: '仙帝', baseGap: 460, levelStep: 90 },
  ] as const;

  let currentCultivation = 0;

  // Rebuild realms so threshold changes are deterministic after reseed.
  await prisma.user.updateMany({ data: { currentRealmId: null } });
  await prisma.realmLevel.deleteMany();

  // Mortal Realms
  for (const { subStage, baseGap, levelStep } of mortalGapConfig) {
    for (let levelIndex = 0; levelIndex < mortalLevels.length; levelIndex += 1) {
      const level = mortalLevels[levelIndex];
      const name = `${subStage}${level}`;
      await prisma.realmLevel.create({
        data: {
          name,
          minCultivation: currentCultivation,
          stage: '人界',
          subStage,
          level,
        },
      });
      currentCultivation += baseGap + levelStep * levelIndex;
    }
  }

  // Immortal Realms
  for (const { subStage, baseGap, levelStep } of immortalGapConfig) {
    for (let levelIndex = 0; levelIndex < immortalLevels.length; levelIndex += 1) {
      const level = immortalLevels[levelIndex];
      const name = `${subStage}${level}`;
      await prisma.realmLevel.create({
        data: {
          name,
          minCultivation: currentCultivation,
          stage: '仙界',
          subStage,
          level,
        },
      });
      currentCultivation += baseGap + levelStep * levelIndex;
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
