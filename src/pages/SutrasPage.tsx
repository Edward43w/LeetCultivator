import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../lib/api';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import BackgroundParticles from '../components/BackgroundParticles';

type SutraItem = {
  tagId: number;
  tagName: string;
  sutraName: string;
  solvedCount: number;
  level: number;
  levelName: string;
  status: 'cultivating' | 'locked';
};

type DashboardSutraProgress = {
  tagId: number;
  solvedCount: number;
  level: number;
  levelName: string;
};

// 重新調色：加入 bgColor (半透明) 與 borderColor，讓書本變成通透的「玉簡」材質
const LEVEL_CONFIG: Record<number, { name: string; spineColor: string; bgColor: string; borderColor: string; textColor: string; glowColor: string }> = {
  0: { name: '未入門', spineColor: '#475569', bgColor: 'rgba(15, 23, 42, 0.4)', borderColor: 'rgba(71, 85, 105, 0.4)', textColor: '#94a3b8', glowColor: 'transparent' },
  1: { name: '入門',   spineColor: '#059669', bgColor: 'rgba(2, 44, 34, 0.5)',   borderColor: 'rgba(5, 150, 105, 0.5)',  textColor: '#6ee7b7', glowColor: 'rgba(16,185,129,0.35)' },
  2: { name: '小成',   spineColor: '#3b82f6', bgColor: 'rgba(23, 37, 84, 0.5)',   borderColor: 'rgba(59, 130, 246, 0.5)', textColor: '#93c5fd', glowColor: 'rgba(59,130,246,0.45)' },
  3: { name: '中成',   spineColor: '#8b5cf6', bgColor: 'rgba(46, 16, 101, 0.5)',  borderColor: 'rgba(139, 92, 246, 0.5)', textColor: '#d8b4fe', glowColor: 'rgba(139,92,246,0.5)' },
  4: { name: '大成',   spineColor: '#f59e0b', bgColor: 'rgba(69, 26, 3, 0.5)',    borderColor: 'rgba(245, 158, 11, 0.5)', textColor: '#fde68a', glowColor: 'rgba(245,158,11,0.5)' },
  5: { name: '圓滿',   spineColor: '#ef4444', bgColor: 'rgba(69, 10, 10, 0.5)',   borderColor: 'rgba(239, 68, 68, 0.5)',  textColor: '#fca5a5', glowColor: 'rgba(239,68,68,0.6)' },
};

const LEVEL_MINS = [0, 1, 5, 15, 30, 50];
const LEVEL_NAMES = ['未入門', '入門', '小成', '中成', '大成', '圓滿'];

const BOOKS_PER_SHELF = 5;

function calcProgress(sutra: SutraItem) {
  if (sutra.level >= 5) return { percent: 100, text: '已臻圓滿' };
  const level = Math.max(0, sutra.level);
  // Use absolute progress from 0 → nextMin so that newly-unlocked levels show real progress
  const nextMin = LEVEL_MINS[level + 1] ?? 50;
  const percent = Math.min(100, Math.round((sutra.solvedCount / Math.max(1, nextMin)) * 100));
  const toNext = Math.max(0, nextMin - sutra.solvedCount);
  return { percent, text: `距離${LEVEL_NAMES[level + 1] || '圓滿'}還差 ${toNext} 題` };
}

function SutraModal({ sutra, onClose }: { sutra: SutraItem; onClose: () => void }) {
  const cfg = LEVEL_CONFIG[sutra.level] || LEVEL_CONFIG[0];
  const level = sutra.level;
  const isMax = level >= 5;
  const progress = calcProgress(sutra);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative w-[85vw] max-w-[500px] md:max-w-[560px] rounded-[2rem] border bg-slate-950/85 p-10 shadow-2xl backdrop-blur-xl"
        style={{ borderColor: cfg.borderColor, boxShadow: `0 10px 50px ${cfg.glowColor}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-400 hover:text-amber-200 transition-colors p-2"
        >
          <X size={24} />
        </button>

        {/* Modal 邊緣微光裝飾 */}
        <div className="absolute left-0 top-0 bottom-0 w-2 rounded-l-[2rem] opacity-80" style={{ background: cfg.spineColor, boxShadow: `0 0 20px ${cfg.glowColor}` }} />

        <div className="pl-3">
          <p className="text-base mb-2 tracking-[0.3em] text-slate-400/90">{sutra.tagName}</p>
          <h3 className="text-4xl md:text-5xl font-bold text-amber-50 mb-5 drop-shadow-lg tracking-wider">{sutra.sutraName}</h3>

          <span
            className="inline-flex items-center px-5 py-2 rounded-lg text-base font-semibold mb-8 tracking-[0.2em] backdrop-blur-md shadow-md"
            style={{ background: cfg.bgColor, border: `1px solid ${cfg.borderColor}`, color: cfg.textColor }}
          >
            {cfg.name}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-5 mb-10">
          <div className="rounded-2xl bg-slate-900/50 border border-slate-700/50 p-6 text-center backdrop-blur-sm shadow-inner">
            <div className="text-sm text-slate-400/80 mb-2 tracking-widest">已修題數</div>
            <div className="text-5xl font-bold" style={{ color: cfg.textColor, textShadow: `0 0 15px ${cfg.glowColor}` }}>{sutra.solvedCount}</div>
          </div>
          <div className="rounded-2xl bg-slate-900/50 border border-slate-700/50 p-6 text-center backdrop-blur-sm shadow-inner">
            <div className="text-sm text-slate-400/80 mb-2 tracking-widest">當前境界</div>
            <div className="text-3xl font-bold text-amber-200 mt-3 drop-shadow-[0_0_10px_rgba(253,230,138,0.3)]">{cfg.name}</div>
          </div>
        </div>

        <div className="space-y-4 pl-1">
          <div className="flex justify-between text-sm text-slate-300">
            <span className="tracking-[0.25em]">修煉進度</span>
            <span className="font-mono text-base text-amber-100/90">{progress.percent}%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-900 overflow-hidden shadow-inner border border-slate-700/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.percent}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full relative"
              style={{ background: `linear-gradient(to right, ${cfg.spineColor}99, ${cfg.spineColor})` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-6 bg-white/30 blur-[3px]" />
            </motion.div>
          </div>
          <p className="text-sm text-slate-400/90 tracking-[0.2em] pt-1">
            {isMax ? '已臻此心經圓滿之境' : progress.text}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function SutrasPage() {
  const [sutras, setSutras] = useState<SutraItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'cultivating' | 'locked'>('all');
  const [loadError, setLoadError] = useState('');
  const [selectedSutra, setSelectedSutra] = useState<SutraItem | null>(null);

  useEffect(() => {
    // 模擬載入，請替換為你的真實 API 邏輯
    const loadSutras = async () => {
      setLoadError('');
      try {
        const data = await api('/sutras-overview');
        setSutras(data);
      } catch {
        try {
          const [tags, dashboard] = await Promise.all([api('/tags'), api('/dashboard')]);
          const dashboardSutras: DashboardSutraProgress[] = Array.isArray(dashboard?.sutras) ? dashboard.sutras : [];
          const progressByTagId = new Map<number, DashboardSutraProgress>(dashboardSutras.map((item) => [item.tagId, item]));
          setSutras((Array.isArray(tags) ? tags : []).map((tag: any) => {
            const progress = progressByTagId.get(tag.id);
            return {
              tagId: tag.id, tagName: tag.name, sutraName: tag.sutraName,
              solvedCount: progress?.solvedCount ?? 0, level: progress?.level ?? 0,
              levelName: progress?.levelName ?? '未入門', status: (progress?.solvedCount ?? 0) > 0 ? 'cultivating' : 'locked',
            } as SutraItem;
          }));
        } catch {
          setSutras([]);
          setLoadError('藏書資料讀取失敗，請重新整理頁面。');
        }
      } finally {
        setLoading(false);
      }
    };
    loadSutras();
  }, []);

  const filteredSutras = useMemo(() => {
    if (filter === 'all') return sutras;
    return sutras.filter((s) => s.status === filter);
  }, [filter, sutras]);

  const cultivatingCount = sutras.filter((s) => s.status === 'cultivating').length;
  const totalSolved = sutras.reduce((sum, s) => sum + s.solvedCount, 0);

  const shelves: SutraItem[][] = [];
  for (let i = 0; i < filteredSutras.length; i += BOOKS_PER_SHELF) {
    shelves.push(filteredSutras.slice(i, i + BOOKS_PER_SHELF));
  }

  const bgPortal = createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'url(/library-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(2,6,23,0.15) 0%, rgba(2,6,23,0.25) 50%, rgba(2,6,23,0.50) 100%)' }} />
      <BackgroundParticles />
    </div>,
    document.body
  );

  if (loading) return (
    <>
      {bgPortal}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <p className="text-teal-200/80 text-lg tracking-[0.3em] drop-shadow-[0_0_10px_rgba(45,212,191,0.5)] animate-pulse">神識探入藏經閣中...</p>
      </div>
    </>
  );

  return (
    <>
      {bgPortal}
    <div className="relative z-10 min-h-screen text-slate-200">
      <div className="p-8 pt-12 max-w-[1200px] mx-auto space-y-8">

        {/* 標題區 */}
        <div className="mb-4">
          <p className="text-sm text-teal-400/80 mb-2 tracking-[0.4em] drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">功法秘典</p>
          <div className="flex items-end justify-between flex-wrap gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold text-amber-100 tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">心經藏書閣</h1>
              <p className="text-slate-400 mt-3 text-sm tracking-widest">探查玉簡，觀天地造化，驗修煉進境</p>
            </div>
            <div className="flex gap-10 text-center bg-slate-950/40 p-4 rounded-xl border border-slate-700/30 backdrop-blur-md">
              <div>
                <div className="text-xs text-slate-400 mb-2 tracking-widest">已修心經</div>
                <div className="text-3xl font-bold text-teal-300 drop-shadow-[0_0_12px_rgba(45,212,191,0.4)]">{cultivatingCount}</div>
              </div>
              <div className="w-px bg-slate-700/50"></div>
              <div>
                <div className="text-xs text-slate-400 mb-2 tracking-widest">累計修題</div>
                <div className="text-3xl font-bold text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]">{totalSolved}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 裝飾分隔線 */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-teal-800/50 to-transparent" />

        {/* 篩選器與圖例 */}
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div className="flex gap-3">
            {(['all', 'cultivating', 'locked'] as const).map((f) => {
              const labels = { all: '全部', cultivating: '已修行', locked: '未入門' };
              const active = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-2 rounded-md border text-sm tracking-widest transition-all duration-300 ${
                    active
                      ? 'border-teal-600/60 bg-teal-950/40 text-teal-200 shadow-[0_0_15px_rgba(20,184,166,0.2)]'
                      : 'border-slate-700/40 bg-slate-900/40 text-slate-400 hover:border-teal-800/60 hover:text-teal-100'
                  } backdrop-blur-md`}
                >
                  {labels[f]}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-5 bg-slate-900/30 px-5 py-2.5 rounded-lg border border-slate-700/30 backdrop-blur-md">
            {Object.entries(LEVEL_CONFIG).map(([lvl, cfg]) => (
              <div key={lvl} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: cfg.spineColor,
                    boxShadow: Number(lvl) > 0 ? `0 0 8px ${cfg.glowColor}` : 'none',
                  }}
                />
                <span className="text-sm text-slate-300 tracking-wider">{cfg.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 藏書區 */}
        {loadError ? (
          <p className="text-center text-slate-400 py-20 tracking-widest">{loadError}</p>
        ) : shelves.length === 0 ? (
          <p className="text-center text-slate-400 py-20 tracking-widest">此界尚未尋獲相關心經。</p>
        ) : (
          <div className="mt-8">
            {shelves.map((shelf, shelfIdx) => (
              <div key={shelfIdx} className="mb-14">
                {/* 玉簡(書卷) 擺放區 */}
                <div className="flex items-end justify-center gap-6 px-4 pb-0">
                  {shelf.map((sutra) => {
                    const cfg = LEVEL_CONFIG[sutra.level] || LEVEL_CONFIG[0];
                    // 讓玉簡有高低錯落感
                    const heights = [180, 195, 175, 190, 185];
                    const h = heights[(sutra.tagId) % heights.length];
                    
                    return (
                      <motion.button
                        key={sutra.tagId}
                        onClick={() => setSelectedSutra(sutra)}
                        title={`${sutra.sutraName}（${cfg.name}）`}
                        whileHover={{ y: -12, transition: { duration: 0.2 } }}
                        className="relative shrink-0 rounded-md overflow-hidden cursor-pointer backdrop-blur-md transition-all group"
                        style={{
                          width: 'calc(20% - 24px)', // 扣除 gap 的空間
                          height: `${h}px`,
                          background: cfg.bgColor,
                          border: `1px solid ${cfg.borderColor}`,
                          boxShadow: sutra.level > 0
                            ? `0 10px 20px -10px rgba(0,0,0,0.8), 0 0 15px ${cfg.glowColor}, inset 0 0 20px rgba(255,255,255,0.02)`
                            : '0 10px 20px -10px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.5)',
                        }}
                      >
                        {/* 左側裝飾線 (原書脊) */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 opacity-80" style={{ background: cfg.spineColor }} />
                        
                        {/* 頂部受光面 */}
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20" />

                        {/* 直書文字：修仙玉簡風格 */}
                        <span
                          className="absolute inset-0 flex items-center justify-center text-xl font-bold tracking-[0.2em] transition-transform group-hover:scale-105"
                          style={{
                            color: cfg.textColor,
                            textShadow: sutra.level > 0 ? `0 0 10px ${cfg.glowColor}, 0 2px 4px rgba(0,0,0,0.9)` : '0 2px 4px rgba(0,0,0,0.9)',
                            writingMode: 'vertical-rl', // 直向排版
                            textOrientation: 'upright'
                          }}
                        >
                          {sutra.sutraName}
                        </span>

                        {/* 大成/圓滿 特殊光暈 */}
                        {sutra.level >= 4 && (
                          <div
                            className="absolute bottom-0 left-0 right-0 h-1/3 opacity-30"
                            style={{ background: `linear-gradient(to top, ${cfg.spineColor}, transparent)` }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* 發光陣石層板：取代橘色木板，融入洞穴幽光 */}
                <div
                  className="h-4 rounded-t-sm relative"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.6) 0%, rgba(2, 6, 23, 0.9) 100%)',
                    borderTop: '1px solid rgba(45, 212, 191, 0.25)', // 反射洞穴的青色光
                    boxShadow: '0 8px 20px rgba(0,0,0,0.9), inset 0 1px 15px rgba(45, 212, 191, 0.05)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {/* 層板前緣的微弱能量流光 */}
                  <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="h-10" />
      </div>

      {selectedSutra && (
        <SutraModal sutra={selectedSutra} onClose={() => setSelectedSutra(null)} />
      )}
    </div>
    </>
  );
}