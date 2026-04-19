import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../lib/api';
import { getRealmDisplay } from '../lib/realmDisplay';
import { motion } from 'framer-motion';
import BackgroundParticles from '../components/BackgroundParticles';

type RealmItem = {
  id: number;
  name: string;
  stage: string;
  subStage: string;
  level: string;
  minCultivation: number;
  order: number;
  currentStageIndex: number;
  stageTotal: number;
  unlockGap: number;
  nextGap: number | null;
  isUnlocked: boolean;
  isCurrent: boolean;
};

const mortalLevels = ['一重天', '二重天', '三重天', '四重天', '五重天', '六重天', '七重天', '八重天', '九重天'];
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
];

const immortalGapConfig = [
  { subStage: '地仙', baseGap: 130, levelStep: 25 },
  { subStage: '天仙', baseGap: 170, levelStep: 30 },
  { subStage: '金仙', baseGap: 220, levelStep: 40 },
  { subStage: '太乙金仙', baseGap: 285, levelStep: 50 },
  { subStage: '大羅金仙', baseGap: 360, levelStep: 65 },
  { subStage: '仙帝', baseGap: 460, levelStep: 90 },
];

function buildFallbackRealms(currentCultivation: number, currentRealmName?: string | null): RealmItem[] {
  const realms: RealmItem[] = [];
  let fallbackCultivation = 0;

  for (const { subStage, baseGap, levelStep } of mortalGapConfig) {
    for (let levelIndex = 0; levelIndex < mortalLevels.length; levelIndex += 1) {
      const level = mortalLevels[levelIndex];
      realms.push({
        id: realms.length + 1,
        name: `${subStage}${level}`,
        stage: '人界',
        subStage,
        level,
        minCultivation: fallbackCultivation,
        order: realms.length + 1,
        currentStageIndex: mortalLevels.indexOf(level) + 1,
        stageTotal: mortalLevels.length,
        unlockGap: 0,
        nextGap: null,
        isUnlocked: false,
        isCurrent: false,
      });
      fallbackCultivation += baseGap + levelStep * levelIndex;
    }
  }

  for (const { subStage, baseGap, levelStep } of immortalGapConfig) {
    for (let levelIndex = 0; levelIndex < immortalLevels.length; levelIndex += 1) {
      const level = immortalLevels[levelIndex];
      realms.push({
        id: realms.length + 1,
        name: `${subStage}${level}`,
        stage: '仙界',
        subStage,
        level,
        minCultivation: fallbackCultivation,
        order: realms.length + 1,
        currentStageIndex: immortalLevels.indexOf(level) + 1,
        stageTotal: immortalLevels.length,
        unlockGap: 0,
        nextGap: null,
        isUnlocked: false,
        isCurrent: false,
      });
      fallbackCultivation += baseGap + levelStep * levelIndex;
    }
  }

  let currentIndex = -1;
  for (let index = 0; index < realms.length; index += 1) {
    if (realms[index].minCultivation <= currentCultivation) {
      currentIndex = index;
    } else {
      break;
    }
  }

  const currentByNameIndex = currentRealmName ? realms.findIndex((realm) => realm.name === currentRealmName) : -1;
  if (currentByNameIndex >= 0) {
    currentIndex = currentByNameIndex;
  }

  for (let index = 0; index < realms.length; index += 1) {
    const previousRealm = realms[index - 1] || null;
    const nextRealm = realms[index + 1] || null;
    realms[index] = {
      ...realms[index],
      unlockGap: previousRealm ? realms[index].minCultivation - previousRealm.minCultivation : realms[index].minCultivation,
      nextGap: nextRealm ? nextRealm.minCultivation - realms[index].minCultivation : null,
      isUnlocked: currentCultivation >= realms[index].minCultivation,
      isCurrent: index === currentIndex,
    };
  }

  return realms;
}

function groupRealms(realms: RealmItem[]) {
  return realms.reduce((groups: any[], realm) => {
    const existing = groups.find((group) => group.stage === realm.stage);
    if (existing) {
      existing.realms.push(realm);
    } else {
      groups.push({ stage: realm.stage, realms: [realm] });
    }
    return groups;
  }, []);
}

type TowerFloor = {
  subStage: string;
  stage: string;
  totalLevels: number;
  firstMin: number;
  currentLevelIndex: number | null;
  isUnlocked: boolean;
  isFullyUnlocked: boolean;
  hasCurrent: boolean;
  progressInTier: number;
  gapToNextTier: number | null;
};

function buildTowerFloors(realms: RealmItem[], currentCultivation: number): TowerFloor[] {
  const map = new Map<string, RealmItem[]>();
  for (const r of realms) {
    if (!map.has(r.subStage)) map.set(r.subStage, []);
    map.get(r.subStage)!.push(r);
  }
  return Array.from(map.entries()).map(([subStage, tierRealms]) => {
    const first = tierRealms[0];
    const last = tierRealms[tierRealms.length - 1];
    const nextTierMin = last.nextGap !== null ? last.minCultivation + last.nextGap : null;
    const currentRealm = tierRealms.find(r => r.isCurrent) ?? null;
    const isUnlocked = currentCultivation >= first.minCultivation;
    const isFullyUnlocked = nextTierMin !== null
      ? currentCultivation >= nextTierMin
      : currentCultivation >= last.minCultivation;
    let progressInTier = 0;
    if (isFullyUnlocked) {
      progressInTier = 100;
    } else if (isUnlocked && nextTierMin !== null) {
      const range = nextTierMin - first.minCultivation;
      progressInTier = Math.min(100, Math.round(((currentCultivation - first.minCultivation) / Math.max(1, range)) * 100));
    }
    const gapToNextTier = nextTierMin !== null ? Math.max(0, nextTierMin - currentCultivation) : null;
    return {
      subStage, stage: first.stage, totalLevels: tierRealms.length, firstMin: first.minCultivation,
      currentLevelIndex: currentRealm ? tierRealms.indexOf(currentRealm) + 1 : null,
      isUnlocked, isFullyUnlocked, hasCurrent: !!currentRealm,
      progressInTier, gapToNextTier,
    };
  });
}

export default function RealmsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [loadError, setLoadError] = useState('');
  const [selectedTower, setSelectedTower] = useState<'人界' | '仙界'>('人界');

  useEffect(() => {
    api('/realms-overview')
      .then((response) => { setData(response); setLoadError(''); })
      .catch(async () => {
        try {
          const dashboard = await api('/dashboard');
          const fallbackCultivation = dashboard?.user?.totalCultivation || 0;
          const fallbackCurrentRealmName = dashboard?.user?.realm?.name || null;
          const fallbackRealms = buildFallbackRealms(fallbackCultivation, fallbackCurrentRealmName);
          const fallbackCurrentRealm = fallbackRealms.find((realm) => realm.isCurrent) || null;
          const fallbackNextRealm = fallbackCurrentRealm
            ? fallbackRealms.find((realm) => realm.order === fallbackCurrentRealm.order + 1) || null
            : fallbackRealms[0] || null;
          setData({
            user: { totalCultivation: fallbackCultivation, currentRealm: fallbackCurrentRealm },
            realms: fallbackRealms,
            grouped: groupRealms(fallbackRealms),
            nextRealm: fallbackNextRealm,
          });
          setLoadError('境界服務暫時不可用，已使用本機境界曲線。');
        } catch {
          const fallbackRealms = buildFallbackRealms(0, null);
          setData({
            user: { totalCultivation: 0, currentRealm: null },
            realms: fallbackRealms,
            grouped: groupRealms(fallbackRealms),
            nextRealm: fallbackRealms[0] || null,
          });
          setLoadError('境界資料暫時讀取失敗，已切換到本機預設預覽。');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const currentCultivation = data?.user?.totalCultivation || 0;
  const currentRealm = data?.user?.currentRealm || null;
  const realmDisplay = getRealmDisplay(currentRealm);
  const allRealms: RealmItem[] = data?.realms || [];

  const mortalFloors = buildTowerFloors(allRealms.filter(r => r.stage === '人界'), currentCultivation);
  const immortalFloors = buildTowerFloors(allRealms.filter(r => r.stage === '仙界'), currentCultivation);

  const bgPortal = createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: 'url(/library-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(2,6,23,0.15) 0%, rgba(2,6,23,0.25) 50%, rgba(2,6,23,0.50) 100%)' }} />
      <BackgroundParticles />
    </div>,
    document.body
  );

  if (loading) return (
    <>
      {bgPortal}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <p className="text-amber-200/80 text-lg tracking-[0.3em] animate-pulse">翻閱境界譜中...</p>
      </div>
    </>
  );

  const isImmortal = selectedTower === '仙界';
  const activeFloors = isImmortal ? immortalFloors : mortalFloors;
  const accentColor = isImmortal ? '#fbbf24' : '#2dd4bf';

  return (
    <>
      {bgPortal}
      <div className="relative z-10 min-h-screen text-slate-200">
        <div className="p-8 pt-12 max-w-[1100px] mx-auto space-y-8">

          {/* 標題區 */}
          <div className="mb-4">
            <p className="text-sm text-teal-400/80 tracking-[0.4em] mb-2 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">修煉境界</p>
            <div className="flex items-end justify-between flex-wrap gap-6">
              <div>
                <div className="flex items-center gap-6">
                  <h1 className="text-4xl md:text-5xl font-semibold text-amber-100 tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">一窺道途</h1>
                  
                  {/* 塔選擇器 (移到標題旁邊) */}
                  <div className="flex bg-slate-900/60 p-1 rounded-lg border border-slate-700/50 backdrop-blur-sm">
                    {(['人界', '仙界'] as const).map((tower) => {
                      const active = selectedTower === tower;
                      return (
                        <button
                          key={tower}
                          onClick={() => setSelectedTower(tower)}
                          className={`px-6 py-2 rounded-md tracking-widest text-sm font-semibold transition-all duration-300 ${
                            active
                              ? tower === '仙界' 
                                ? 'bg-amber-900/60 text-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.3)]' 
                                : 'bg-teal-950/60 text-teal-200 shadow-[0_0_15px_rgba(45,212,191,0.3)]'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                          }`}
                        >
                          {tower}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <p className="text-slate-400 mt-4 text-sm tracking-widest">踏破虛空，超脫輪迴，晉升無上大道</p>
              </div>
              
              <div className="flex gap-10 text-center bg-slate-950/40 p-4 rounded-xl border border-slate-700/30 backdrop-blur-md shadow-lg">
                <div>
                  <div className="text-xs text-slate-400 mb-2 tracking-widest">當前境界</div>
                  <div className="text-2xl font-bold text-teal-100 drop-shadow-[0_2px_10px_rgba(20,184,166,0.5)]">{realmDisplay.title}</div>
                </div>
                <div className="w-px bg-slate-700/50"></div>
                <div>
                  <div className="text-xs text-slate-400 mb-2 tracking-widest">目前修為</div>
                  <div className="text-2xl font-bold text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]">{currentCultivation}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 裝飾分隔線 */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-600/50 to-transparent mb-8" />

          {loadError && <p className="text-sm text-center text-amber-300/70 tracking-wide">{loadError}</p>}

          {/* 境界路徑 */}
          <RealmPath
            floors={activeFloors}
            title={isImmortal ? '仙界' : '人界'}
            isImmortal={isImmortal}
            accentColor={accentColor}
          />

          <div className="h-10" />
        </div>
      </div>
    </>
  );
}

function RealmPath({ floors, title, isImmortal, accentColor }: {
  floors: TowerFloor[];
  title: string;
  isImmortal: boolean;
  accentColor: string;
}) {
  const reversed = [...floors].reverse(); // top tier at top

  const neonGlow = isImmortal ? 'rgba(251,191,36,0.4)' : 'rgba(45,212,191,0.4)';
  const bgActive = isImmortal ? 'rgba(58,26,4,0.7)' : 'rgba(8,48,60,0.7)';
  const borderActive = isImmortal ? 'rgba(251,191,36,0.6)' : 'rgba(45,212,191,0.6)';

  return (
    <div className="relative flex flex-col items-center w-full max-w-[800px] mx-auto pb-20 mt-12">
      {/* 中心發光軸線 */}
      <div className="absolute top-0 bottom-0 w-1 rounded-full" style={{
        background: `linear-gradient(to bottom, transparent, ${accentColor}55 10%, ${accentColor}55 90%, transparent)`,
        boxShadow: `0 0 15px ${accentColor}44`,
        left: 'calc(40% - 2px)'
      }} />

      <div className="w-full flex flex-col gap-6 relative z-10">
        {reversed.map((floor, i) => {
          const isLocked = !floor.isUnlocked;
          const isPassed = floor.isFullyUnlocked && !floor.hasCurrent;
          const isCurrent = floor.hasCurrent;

          return (
            <motion.div
              key={floor.subStage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="flex items-center w-full"
            >
              {/* 左側：等級與狀態 */}
              <div className="w-[40%] text-right pr-10">
                <div 
                  className={`text-2xl font-bold tracking-widest ${isCurrent ? 'text-white' : isPassed ? 'text-slate-300' : 'text-slate-500'}`} 
                  style={{ textShadow: isCurrent ? `0 0 10px ${accentColor}` : isPassed ? `0 0 5px rgba(255,255,255,0.3)` : 'none' }}
                >
                  {floor.subStage}期
                </div>
                <div className={`text-sm tracking-widest mt-1 ${isCurrent ? (isImmortal ? 'text-amber-200' : 'text-teal-200') : 'text-slate-500'}`}>
                  {floor.currentLevelIndex !== null
                    ? `第 ${floor.currentLevelIndex} / ${floor.totalLevels} 重`
                    : `共 ${floor.totalLevels} 重`
                  }
                </div>
              </div>

              {/* 中間：節點 */}
              <div className="relative flex justify-center w-0 shrink-0">
                <div className={`absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 bg-slate-950 z-10 transition-all duration-500 ${isCurrent ? 'scale-125' : ''}`}
                  style={{
                    borderColor: isCurrent || isPassed ? accentColor : '#334155',
                    boxShadow: isCurrent ? `0 0 20px ${accentColor}, inset 0 0 10px ${accentColor}` : isPassed ? `0 0 8px ${accentColor}88` : 'none'
                  }}
                />
              </div>

              {/* 右側：進度卡片 */}
              <div className="w-[60%] pl-10">
                <div className={`p-5 rounded-xl border backdrop-blur-md transition-all duration-300 ${isCurrent ? 'scale-[1.02]' : ''}`}
                  style={{
                    background: isCurrent ? bgActive : isPassed ? 'rgba(30,41,59,0.3)' : 'rgba(15,23,42,0.4)',
                    borderColor: isCurrent ? borderActive : isPassed ? `${accentColor}44` : 'rgba(51,65,85,0.4)',
                    boxShadow: isCurrent ? `0 10px 30px -10px ${neonGlow}, inset 0 0 20px ${neonGlow}` : 'none'
                  }}
                >
                  <div className="flex justify-between items-center text-sm mb-3">
                    <span className={`tracking-wider font-semibold ${isCurrent ? 'text-white' : 'text-slate-400'}`}>
                      {isCurrent ? '修煉中' : isPassed ? '已突破' : '未解鎖'}
                    </span>
                    <span className={`font-mono ${isCurrent ? (isImmortal ? 'text-amber-300' : 'text-teal-300') : 'text-slate-500'}`}>
                      {isCurrent && floor.gapToNextTier !== null ? `距突破需 ${floor.gapToNextTier}` :
                       isCurrent && floor.gapToNextTier === null ? '已臻巔峰' :
                       isLocked ? `門檻 ${floor.firstMin}` : ''}
                    </span>
                  </div>

                  {floor.isUnlocked && (
                    <div className="h-1.5 rounded-full bg-slate-950/80 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000 relative"
                        style={{
                          width: `${floor.progressInTier}%`,
                          background: isImmortal ? 'linear-gradient(to right, #b45309, #fde68a)' : 'linear-gradient(to right, #0f766e, #5eead4)',
                          opacity: isPassed ? 0.4 : 1
                        }}
                      >
                         {isCurrent && floor.progressInTier > 0 && (
                            <div className="absolute right-0 top-0 bottom-0 w-6 bg-white/50 blur-[2px]" />
                         )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
