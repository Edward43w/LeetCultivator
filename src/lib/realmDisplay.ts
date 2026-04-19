export type RealmLike = {
  stage?: string;
  subStage?: string;
  level?: string;
  name?: string;
};

const mortalLevels = [
  '一重天',
  '二重天',
  '三重天',
  '四重天',
  '五重天',
  '六重天',
  '七重天',
  '八重天',
  '九重天',
];

const immortalLevels = ['前期', '中期', '後期'];

export function getRealmDisplay(realm?: RealmLike | null) {
  if (!realm) {
    return {
      title: '練氣期',
      mode: 'mortal' as const,
      currentIndex: 0,
      currentLabel: '一重',
      total: 9,
      phases: mortalLevels.map((level) => level.replace('天', '')),
      stage: '人界',
      subStage: '練氣',
    };
  }

  if (realm.stage === '仙界') {
    const currentIndex = Math.max(0, immortalLevels.indexOf(realm.level || '前期'));
    return {
      title: `${realm.stage} · ${realm.subStage || '地仙'}`,
      mode: 'immortal' as const,
      currentIndex,
      currentLabel: immortalLevels[currentIndex] || '前期',
      total: 3,
      phases: immortalLevels,
      stage: realm.stage,
      subStage: realm.subStage || '地仙',
    };
  }

  const currentIndex = Math.max(0, mortalLevels.indexOf(realm.level || '一重天'));
  return {
    title: `${realm.subStage || realm.name || '練氣'}期`,
    mode: 'mortal' as const,
    currentIndex,
    currentLabel: mortalLevels[currentIndex]?.replace('天', '') || '一重',
    total: 9,
    phases: mortalLevels.map((level) => level.replace('天', '')),
    stage: realm.stage || '人界',
    subStage: realm.subStage || '練氣',
  };
}
