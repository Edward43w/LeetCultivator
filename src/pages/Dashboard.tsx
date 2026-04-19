import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { motion } from 'framer-motion';
import { Award, Flame, BookOpen, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import RecordModal from '../components/RecordModal';
import CultivatorImage from '../components/CultivatorImage.tsx';

const SUTRA_LEVEL_COLOR: Record<number, { text: string; bar: string }> = {
  0: { text: 'text-slate-500',   bar: '#475569' },
  1: { text: 'text-emerald-400', bar: '#059669' },
  2: { text: 'text-blue-400',    bar: '#3b82f6' },
  3: { text: 'text-purple-400',  bar: '#8b5cf6' },
  4: { text: 'text-amber-300',   bar: '#f59e0b' },
  5: { text: 'text-red-400',     bar: '#ef4444' },
};

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: 'text-emerald-400',
  Medium: 'text-yellow-400',
  Hard: 'text-red-400',
};

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [checkinDates, setCheckinDates] = useState<Set<string>>(new Set());
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [calViewDate, setCalViewDate] = useState(() => new Date());

  const fetchDashboard = async () => {
    const [res, dates] = await Promise.all([
      api('/dashboard'),
      api('/checkins').catch(() => []),
    ]);
    setData(res);
    setCheckinDates(new Set(dates as string[]));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!data) return <div className="p-8 text-slate-400">凝聚靈氣中...</div>;

  const { user, bodyTypes, nextRealm, recentLogs = [], sutras = [], checkedInToday } = data;
  const mainBody = bodyTypes.find((b: any) => b.bodyTypeId === user.mainBodyTypeId);
  const realmSubStage = user?.realm?.subStage
    || (user?.realm?.name ? String(user.realm.name).replace(/([一二三四五六七八九十]+重天.*$)/, '') : '練氣');
  const realmLevel = user?.realm?.level ? String(user.realm.level).replace('天', '') : '一重';

  const currentRealmMin = user?.realm?.minCultivation || 0;
  const requiredForNext = nextRealm ? Math.max(1, nextRealm.minCultivation - currentRealmMin) : 1;
  const gainedSinceCurrent = Math.max(0, user.totalCultivation - currentRealmMin);
  const remainingToNext = nextRealm ? Math.max(0, nextRealm.minCultivation - user.totalCultivation) : 0;
  const progressPercent = nextRealm
    ? Math.min(100, Math.max(0, (gainedSinceCurrent / requiredForNext) * 100))
    : 100;

  // Mini calendar
  const now = new Date();
  const year = calViewDate.getFullYear();
  const month = calViewDate.getMonth();
  const MONTHS_ZH = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = toDateKey(now);
  const calCells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (calCells.length % 7 !== 0) calCells.push(null);

  // Active sutras — only those with solvedCount > 0, sorted by level desc
  const activeSutras = (sutras as any[])
    .filter((s: any) => s.solvedCount > 0)
    .sort((a: any, b: any) => b.level - a.level || b.solvedCount - a.solvedCount)
    .slice(0, 5);

  return (
    <div className="relative min-h-screen w-full">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <CultivatorImage mode="cover" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,6,23,0.45),rgba(2,6,23,0.15)_35%,rgba(2,6,23,0.5))]" />
      </div>

      {/* 三欄 Grid：左側欄 | 中央 | 右側欄 */}
      <div className="relative z-10 h-screen w-full grid grid-cols-[clamp(140px,17vw,265px)_1fr_clamp(170px,20vw,290px)]">

        {/* ── 左側欄：最近修煉 + 心經進度 ── */}
        <aside className="pt-16 px-3 pb-28 overflow-y-auto h-full custom-scrollbar space-y-4 pr-1">

          {/* 最近修煉 */}
          <div>
            <h3 className="text-xs font-semibold text-amber-100/80 mb-3 flex items-center gap-1.5 drop-shadow-[0_1px_10px_rgba(0,0,0,0.95)] tracking-widest">
              <Clock size={14} className="text-amber-400/80" /> 最近修煉
            </h3>
            {recentLogs.length === 0 ? (
              <p className="text-xs text-slate-500 tracking-wider">尚無修煉紀錄</p>
            ) : (
              <div className="space-y-2">
                {(recentLogs as any[]).slice(0, 5).map((log: any) => (
                  <div key={log.id} className="py-2 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-semibold ${DIFFICULTY_COLOR[log.difficulty] || 'text-slate-400'}`}>
                        {log.difficulty}
                      </span>
                      <span className="text-xs text-slate-200 font-medium leading-tight line-clamp-1 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
                        {log.problemNumber ? `${log.problemNumber}. ` : ''}{log.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{new Date(log.completedAt).toLocaleDateString()}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-sky-400/80">{log.language}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-amber-400/80">+{log.cultivationEarned}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 心經進度 */}
          {activeSutras.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-amber-100/80 mb-3 flex items-center gap-1.5 drop-shadow-[0_1px_10px_rgba(0,0,0,0.95)] tracking-widest">
                <BookOpen size={14} className="text-amber-400/80" /> 心經進度
              </h3>
              <div className="space-y-2.5">
                {activeSutras.map((s: any) => {
                  const cfg = SUTRA_LEVEL_COLOR[s.level] || SUTRA_LEVEL_COLOR[0];
                  const LEVEL_MINS = [0, 1, 5, 15, 30, 50];
                  const nextMin = LEVEL_MINS[s.level + 1] ?? 50;
                  const pct = s.level >= 5 ? 100 : Math.min(100, Math.round((s.solvedCount / Math.max(1, nextMin)) * 100));
                  return (
                    <div key={s.tagId}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-300 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
                          {s.tag?.sutraName || s.tag?.name}
                        </span>
                        <span className={`text-[10px] font-semibold ${cfg.text}`}>{s.levelName}</span>
                      </div>
                      <div className="h-1 bg-slate-900/70 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: cfg.bar }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* ── 中央欄：境界標題 + 聖體 + 進度條 + 丹藥 ── */}
        <div className="relative flex flex-col items-center h-full">
          {/* 境界標題 */}
          <div className="pt-3 pointer-events-none z-30 text-center">
            <h2 className="text-[clamp(1.6rem,3.8vw,3.3rem)] font-semibold text-amber-100 tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
              {realmSubStage}期
              <span className="ml-3 text-[0.62em] font-medium text-amber-50/90">【{realmLevel}/九重】</span>
            </h2>
          </div>

          {/* 聖體徽章 */}
          <div style={{ bottom: 'clamp(6rem, 20vh, 13.5rem)' }} className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 rounded-full border border-amber-500/35 bg-slate-950/70 px-6 py-2 text-sm text-amber-200/90 backdrop-blur-sm shadow-[0_0_25px_rgba(251,191,36,0.2)]">
            {mainBody?.bodyType.name || '未選擇'} · {mainBody?.level || '初成'}
          </div>

          {/* 修為進度條 */}
          <div style={{ bottom: 'clamp(3.5rem, 11vh, 7.5rem)' }} className="absolute left-1/2 z-20 w-[min(90%,840px)] -translate-x-1/2">
            <div className="h-4 bg-slate-900/80 border border-slate-600 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-700 via-amber-400 to-yellow-300"
              />
            </div>
            <div className="mt-2 flex items-center justify-between gap-4 text-sm text-slate-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
              <p>目前修為：{user.totalCultivation}</p>
              {nextRealm ? <p>距離突破還差 {remainingToNext} 修為</p> : <p>已臻此境巔峰</p>}
            </div>
          </div>

          {/* 丹藥 — offset from center of this column */}
          <button
            onClick={() => setIsRecordModalOpen(true)}
            style={{ left: 'calc(50% + clamp(90px, 14%, 250px))', bottom: 'clamp(5.5rem, 18.5vh, 12.5rem)' }}
            className="absolute z-20 transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_22px_rgba(251,191,36,0.9)]"
            title="投入丹藥"
          >
            <img
              src="/pill.png"
              style={{ width: 'clamp(140px, 14vw, 256px)', height: 'clamp(140px, 14vw, 256px)' }}
              className="object-contain drop-shadow-[0_0_12px_rgba(251,191,36,0.7)]"
              alt="投入丹藥"
            />
          </button>
        </div>

        {/* ── 右側欄：修煉統計 + 簽到日曆 ── */}
        <aside className="pt-16 px-3 pb-4 overflow-y-auto h-full custom-scrollbar">

          {/* 修煉統計 */}
          <div className="px-3 py-3">
            <h3 className="text-base font-semibold text-amber-100/90 mb-4 flex items-center drop-shadow-[0_1px_10px_rgba(0,0,0,0.95)]">
              <Award className="mr-2 text-amber-400/90" size={18} /> 修煉統計
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-300/80 text-sm drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">總破陣數</span>
                <span className="text-xl font-bold text-amber-50 drop-shadow-[0_1px_10px_rgba(0,0,0,0.95)]">{user.progressSummary?.totalSolved || 0}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="text-center py-1">
                  <div className="text-xs text-emerald-400 mb-1 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]">Easy</div>
                  <div className="font-bold text-slate-200 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">{user.progressSummary?.easySolved || 0}</div>
                </div>
                <div className="text-center py-1">
                  <div className="text-xs text-yellow-400 mb-1 drop-shadow-[0_0_6px_rgba(250,204,21,0.4)]">Med</div>
                  <div className="font-bold text-slate-200 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">{user.progressSummary?.mediumSolved || 0}</div>
                </div>
                <div className="text-center py-1">
                  <div className="text-xs text-red-400 mb-1 drop-shadow-[0_0_6px_rgba(248,113,113,0.4)]">Hard</div>
                  <div className="font-bold text-slate-200 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">{user.progressSummary?.hardSolved || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 分隔線 */}
          <div className="mx-3 h-px bg-gradient-to-r from-transparent via-slate-600/40 to-transparent my-1" />

          {/* 簽到狀態 + 月曆 */}
          <div className="px-3 py-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-amber-100/90 flex items-center gap-1.5 drop-shadow-[0_1px_10px_rgba(0,0,0,0.95)]">
                <Flame size={15} className="text-amber-400/90" /> 閉關簽到
              </h3>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                checkedInToday
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                  : 'bg-slate-800/60 text-slate-400 border border-slate-700/40'
              }`}>
                {checkedInToday ? '✓ 今日已閉關' : '⚠ 今日未閉關'}
              </span>
            </div>

            {/* 連續天數 */}
            {(user.progressSummary?.currentStreak ?? 0) > 0 && (
              <p className="text-xs text-amber-300/80 mb-2 tracking-wider drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
                🔥 連續閉關 {user.progressSummary.currentStreak} 天
              </p>
            )}

            {/* 總天數 + 最長連續 */}
            <div className="flex gap-4 mb-3 text-center">
              <div className="flex-1">
                <div className="text-base font-bold text-slate-100 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">{checkinDates.size}</div>
                <div className="text-[10px] text-slate-400 tracking-wider mt-0.5">總簽到天數</div>
              </div>
              <div className="w-px bg-slate-600/40 self-stretch" />
              <div className="flex-1">
                <div className="text-base font-bold text-slate-100 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">{user.progressSummary?.longestStreak ?? 0}</div>
                <div className="text-[10px] text-slate-400 tracking-wider mt-0.5">最長連續</div>
              </div>
            </div>

            {/* 月份標題 */}
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setCalViewDate(new Date(year, month - 1, 1))}
                className="text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded hover:bg-slate-700/50"
              >
                <ChevronLeft size={13} />
              </button>
              <p className="text-xs text-slate-400 text-center tracking-widest drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
                {year} 年 {MONTHS_ZH[month]}
              </p>
              <button
                onClick={() => setCalViewDate(new Date(year, month + 1, 1))}
                className="text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded hover:bg-slate-700/50"
              >
                <ChevronRight size={13} />
              </button>
            </div>

            {/* 星期標頭 */}
            <div className="grid grid-cols-7 mb-1">
              {['日','一','二','三','四','五','六'].map(w => (
                <div key={w} className="text-center text-[9px] text-slate-500 py-0.5">{w}</div>
              ))}
            </div>

            {/* 日期格子 */}
            <div className="grid grid-cols-7 gap-px">
              {calCells.map((day, idx) => {
                if (!day) return <div key={idx} />;
                const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const checked = checkinDates.has(key);
                const isToday = key === todayKey;
                return (
                  <div
                    key={key}
                    className={`
                      relative flex aspect-square items-center justify-center rounded text-[10px] font-medium select-none
                      ${checked ? 'bg-amber-500/25 text-amber-200 border border-amber-400/40 shadow-[0_0_6px_rgba(251,191,36,0.2)]' : 'text-slate-500'}
                      ${isToday && !checked ? 'border border-slate-600 text-slate-300' : ''}
                      ${isToday && checked ? 'ring-1 ring-amber-300/60' : ''}
                    `}
                  >
                    {day}
                    {checked && <span className="absolute bottom-[1px] right-[2px] text-[6px] text-amber-400/70">🔥</span>}
                  </div>
                );
              })}
            </div>
          </div>

        </aside>
      </div>{/* end grid */}

      {isRecordModalOpen && (
        <RecordModal
          onClose={() => setIsRecordModalOpen(false)}
          onSuccess={() => {
            setIsRecordModalOpen(false);
            fetchDashboard();
          }}
        />
      )}
    </div>
  );
}
