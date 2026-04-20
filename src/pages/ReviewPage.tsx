import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../lib/api';
import { ChevronDown, BookOpen, RotateCcw, X, Flame } from 'lucide-react';
import BackgroundParticles from '../components/BackgroundParticles';
import { motion, AnimatePresence } from 'framer-motion';
import { ReviewResult, REVIEW_OPTIONS, reviewLevelName, LastResultBadge } from '../lib/reviewDisplay';

function overdueLabel(nextReviewDate: string) {
  const today = new Date().toISOString().substring(0, 10);
  const due = nextReviewDate.substring(0, 10);
  if (due === today) return <span className="text-xs text-amber-400 border border-amber-600/50 px-2 py-0.5 rounded tracking-wider">今日到期</span>;
  const diffDays = Math.round((new Date(today).getTime() - new Date(due).getTime()) / 86400000);
  if (diffDays > 0) return <span className="text-xs text-red-400 border border-red-600/50 px-2 py-0.5 rounded tracking-wider">逾期 {diffDays} 天</span>;
  return null;
}

// ── Review Modal ──────────────────────────────────────────────────────────────

function ReviewModal({
  log,
  onClose,
  onSaved,
}: {
  log: any;
  onClose: () => void;
  onSaved: (id: number) => void;
}) {
  const [form, setForm] = useState({
    summary: log.note?.summary || '',
    stuckPoints: log.note?.stuckPoints || '',
    reviewReminders: log.note?.reviewReminders || '',
  });
  const [selectedResult, setSelectedResult] = useState<ReviewResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResult) { setError('請選擇重修結果'); return; }
    setSaving(true); setError('');
    try {
      await api(`/review/${log.id}`, {
        method: 'POST',
        body: JSON.stringify({ result: selectedResult, ...form }),
      });
      onSaved(log.id);
    } catch (err: any) {
      setError(err.message || '儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-slate-950/90 backdrop-blur-xl border border-slate-700/40 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_8px_40px_rgba(0,0,0,0.7)]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-700/30 flex justify-between items-start gap-4">
          <div>
            <p className="text-xs text-amber-400/60 tracking-[0.3em] mb-1">回爐重煉</p>
            <h2 className="text-xl font-semibold text-amber-100 tracking-wide leading-snug">
              {log.problemNumber ? `${log.problemNumber}. ` : ''}{log.title}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded border font-semibold tracking-wider ${
                log.difficulty === 'Easy' ? 'text-emerald-300 border-emerald-600/50' :
                log.difficulty === 'Medium' ? 'text-yellow-300 border-yellow-600/50' :
                'text-red-300 border-red-600/50'
              }`}>{log.difficulty}</span>
              <span className="text-xs text-sky-400">{log.language}</span>
              <span className="text-xs text-slate-500">熟練度：{reviewLevelName(log.reviewLevel ?? 0)}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition-colors flex-shrink-0 mt-1">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          {error && <div className="px-4 py-2 bg-red-950/40 border border-red-700/40 rounded text-red-400 text-sm">{error}</div>}

          {/* Note fields — pre-filled, user can edit/append */}
          <form id="review-form" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-amber-100/90 tracking-wide flex items-center gap-2">
                <BookOpen size={14} className="text-amber-400/70" /> 修行手札（可追加新理解）
              </h3>
              {[
                { label: '解題思路摘要', key: 'summary' as const, rows: 4 },
                { label: '卡關點 / 易錯點', key: 'stuckPoints' as const, rows: 3 },
                { label: '複習提醒', key: 'reviewReminders' as const, rows: 2 },
              ].map(({ label, key, rows }) => (
                <div key={key}>
                  <label className="block text-sm text-slate-400 mb-1.5">{label}</label>
                  <textarea
                    rows={rows}
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-0 py-2 bg-transparent border-b border-slate-600/50 text-slate-200 focus:outline-none focus:border-amber-500/60 resize-none transition-colors text-sm leading-relaxed"
                  />
                </div>
              ))}
            </div>

            {/* Result selection */}
            <div className="mt-6 pt-5 border-t border-slate-700/30">
              <p className="text-sm text-slate-400 mb-3 tracking-widest">這次重修的感受如何？</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {REVIEW_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedResult(opt.value)}
                    className={`flex flex-col items-center px-3 py-3 rounded-xl border transition-all ${opt.base} ${
                      selectedResult === opt.value ? `${opt.active} ring-1 ring-offset-0 ring-current` : ''
                    }`}
                  >
                    <span className="text-base font-semibold tracking-wider">{opt.label}</span>
                    <span className="text-xs opacity-70 mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700/30 flex justify-end gap-4">
          <button type="button" onClick={onClose} className="px-5 py-2 text-slate-400 hover:text-slate-200 transition-colors text-sm">
            取消
          </button>
          <button
            form="review-form"
            type="submit"
            disabled={saving || !selectedResult}
            className="px-6 py-2 bg-gradient-to-r from-amber-700/80 to-amber-500/80 hover:from-amber-600/90 hover:to-amber-400/90 text-amber-50 rounded-lg text-sm font-medium tracking-wide transition-all border border-amber-500/30 disabled:opacity-50"
          >
            {saving ? '記錄中...' : '完成重修'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ReviewPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [reviewLog, setReviewLog] = useState<any | null>(null);

  const loadData = () => {
    setLoading(true);
    api('/review').then((data) => {
      setLogs(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleReviewSaved = (id: number) => {
    setReviewLog(null);
    setLogs(prev => prev.filter(l => l.id !== id));
  };

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
      <div className="relative z-10 min-h-screen p-8 text-amber-200/80 tracking-widest text-center mt-20 animate-pulse">
        查閱重修典籍中...
      </div>
    </>
  );

  return (
    <>
      {bgPortal}
      <div className="relative z-10 min-h-screen text-slate-200">
        <div className="p-8 pt-12 max-w-5xl mx-auto">

          {/* 標題區 */}
          <div className="mb-8">
            <p className="text-sm text-amber-400/70 tracking-[0.4em] mb-2 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">每日功課</p>
            <h1 className="text-4xl md:text-5xl font-semibold text-amber-100 tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)] mb-2">
              回爐重煉
            </h1>
            <p className="text-slate-400 tracking-widest text-sm">溫故知新，方能突破瓶頸</p>
          </div>

          {/* 統計列 */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-amber-400/80 text-sm tracking-widest">
              <Flame size={14} />
              <span>今日待修：{logs.length} 題</span>
            </div>
          </div>

          {/* 分隔線 */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-500/40 to-transparent mb-6" />

          {/* 列表 */}
          {logs.length === 0 ? (
            <div className="text-center py-24">
              <RotateCcw size={32} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 tracking-widest text-lg">今日無待修題目</p>
              <p className="text-slate-600 tracking-widest text-sm mt-2">繼續修煉，方可精進</p>
            </div>
          ) : (
            <div>
              {logs.map(log => (
                <div key={log.id}>
                  {/* 主列 */}
                  <div className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 -mx-2 rounded-lg group">
                    {/* 左側：點擊展開 */}
                    <div className="flex-1 cursor-pointer" onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`text-sm px-2.5 py-0.5 rounded font-semibold tracking-wider flex-shrink-0 ${
                          log.difficulty === 'Easy' ? 'text-emerald-300 border border-emerald-600/50' :
                          log.difficulty === 'Medium' ? 'text-yellow-300 border border-yellow-600/50' :
                          'text-red-300 border border-red-600/50'
                        }`}>
                          {log.difficulty}
                        </span>
                        <h3 className="text-lg font-semibold text-slate-100 tracking-wide">
                          {log.problemNumber ? `${log.problemNumber}. ` : ''}{log.title}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300 tracking-wider">
                        <span className="text-sky-400">{log.language}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-amber-400">熟練度：{reviewLevelName(log.reviewLevel ?? 0)}</span>
                        {log.nextReviewDate && overdueLabel(log.nextReviewDate)}
                        <LastResultBadge result={log.lastReviewResult} />
                      </div>
                    </div>

                    {/* 右側：tags + 操作 */}
                    <div className="flex items-center gap-3">
                      <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                        {log.tags.map((t: any) => (
                          <span key={t.tagId} className="text-sm border border-slate-600/50 text-slate-300 px-2.5 py-0.5 rounded tracking-wider">
                            {t.tag.name}
                          </span>
                        ))}
                      </div>

                      {/* 重修按鈕 */}
                      <button
                        onClick={() => setReviewLog(log)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-600/50 text-amber-300 hover:bg-amber-900/20 hover:border-amber-500/70 transition-all text-sm tracking-wider flex-shrink-0"
                      >
                        <RotateCcw size={13} />
                        重修
                      </button>

                      <div
                        className={`text-slate-400 cursor-pointer transition-transform duration-200 ${expandedId === log.id ? 'rotate-180' : ''}`}
                        onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                      >
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>

                  {/* 展開修行手札 */}
                  {expandedId === log.id && log.note && (
                    <div className="pb-6 px-2">
                      <p className="text-sm tracking-[0.3em] text-amber-400/80 mb-5 flex items-center gap-2 drop-shadow-[0_0_6px_rgba(251,191,36,0.3)]">
                        <BookOpen size={16} /> 修行手札
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                        {[
                          { label: '解題思路', content: log.note.summary },
                          { label: '卡關 / 易錯點', content: log.note.stuckPoints },
                          { label: '複習提醒', content: log.note.reviewReminders },
                        ].map(item => (
                          <div key={item.label}>
                            <p className="text-sm tracking-widest text-amber-400/70 mb-2 border-b border-slate-600/30 pb-1">{item.label}</p>
                            <p className="text-base text-slate-200 whitespace-pre-wrap leading-relaxed">{item.content}</p>
                          </div>
                        ))}
                      </div>
                      {log.link && (
                        <div className="mt-5 text-right">
                          <a href={log.link} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-400 hover:text-sky-300 underline tracking-widest">
                            前往題目 →
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 底線分隔 */}
                  <div className="h-px bg-gradient-to-r from-transparent via-slate-600/30 to-transparent" />
                </div>
              ))}
            </div>
          )}

          <div className="h-16" />
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewLog && (
          <ReviewModal
            log={reviewLog}
            onClose={() => setReviewLog(null)}
            onSaved={handleReviewSaved}
          />
        )}
      </AnimatePresence>
    </>
  );
}
