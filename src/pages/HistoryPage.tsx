import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../lib/api';
import { ChevronDown, BookOpen, Pencil, Trash2, X, Check, Search } from 'lucide-react';
import BackgroundParticles from '../components/BackgroundParticles';
import { motion, AnimatePresence } from 'framer-motion';

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ log, allTags, bodyTypes, onClose, onSaved }: { log: any; allTags: any[]; bodyTypes: string[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: log.title || '',
    problemNumber: log.problemNumber || '',
    difficulty: log.difficulty || 'Easy',
    language: log.language || '',
    link: log.link || '',
    completedAt: log.completedAt ? String(log.completedAt).substring(0, 10) : '',
    selectedTags: log.tags.map((t: any) => t.tagId) as number[],
    summary: log.note?.summary || '',
    stuckPoints: log.note?.stuckPoints || '',
    reviewReminders: log.note?.reviewReminders || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleTag = (id: number) =>
    setForm(p => ({ ...p, selectedTags: p.selectedTags.includes(id) ? p.selectedTags.filter(x => x !== id) : [...p.selectedTags, id] }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await api(`/problems/${log.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...form, tags: form.selectedTags }),
      });
      onSaved();
    } catch (err: any) {
      setError(err.message || '儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        className="bg-slate-950/85 backdrop-blur-xl border border-slate-700/40 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_8px_40px_rgba(0,0,0,0.7)]"
      >
        <div className="px-6 py-5 border-b border-slate-700/30 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-amber-100 tracking-wide">修改修煉紀錄</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition-colors"><X size={20} /></button>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1 custom-scrollbar">
          {error && <div className="mb-4 px-4 py-2 bg-red-950/40 border border-red-700/40 rounded text-red-400 text-sm">{error}</div>}
          <form id="edit-form" onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">題目名稱 *</label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-0 py-2 bg-transparent border-b border-slate-600/50 text-slate-200 focus:outline-none focus:border-amber-500/60 transition-colors" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">題號</label>
                <input value={form.problemNumber} onChange={e => setForm({ ...form, problemNumber: e.target.value })}
                  className="w-full px-0 py-2 bg-transparent border-b border-slate-600/50 text-slate-200 focus:outline-none focus:border-amber-500/60 transition-colors" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">難度 *</label>
                <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}
                  className="w-full px-0 py-2 bg-transparent border-b border-slate-600/50 text-slate-200 focus:outline-none focus:border-amber-500/60 appearance-none">
                  <option value="Easy" className="bg-slate-900">Easy</option>
                  <option value="Medium" className="bg-slate-900">Medium</option>
                  <option value="Hard" className="bg-slate-900">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">語言 *</label>
                <select required value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}
                  className="w-full px-0 py-2 bg-transparent border-b border-slate-600/50 text-slate-200 focus:outline-none focus:border-amber-500/60 appearance-none">
                  <option value="" className="bg-slate-900">選擇語言</option>
                  {bodyTypes.map(bt => <option key={bt} value={bt} className="bg-slate-900">{bt}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-400 mb-1.5">完成日期 *</label>
                <input required type="date" value={form.completedAt} onChange={e => setForm({ ...form, completedAt: e.target.value })}
                  className="w-full px-0 py-2 bg-transparent border-b border-slate-600/50 text-slate-200 focus:outline-none focus:border-amber-500/60 transition-colors" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-400 mb-1.5">題目連結</label>
                <input type="url" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })}
                  className="w-full px-0 py-2 bg-transparent border-b border-slate-600/50 text-slate-200 focus:outline-none focus:border-amber-500/60 transition-colors" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-400 mb-2">Tags · 心經</label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag: any) => (
                    <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1 rounded-full text-xs transition-all ${form.selectedTags.includes(tag.id)
                        ? 'border border-amber-500/60 text-amber-200 bg-amber-900/25'
                        : 'border border-slate-600/40 text-slate-400 hover:border-slate-500'}`}>
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t border-slate-700/30 pt-5 space-y-5">
              <h3 className="text-sm font-semibold text-amber-100/90 tracking-wide">修行手札</h3>
              {[
                { label: '解題思路摘要 *', key: 'summary' as const, rows: 3 },
                { label: '卡關點 / 易錯點 *', key: 'stuckPoints' as const, rows: 2 },
                { label: '複習提醒 *', key: 'reviewReminders' as const, rows: 2 },
              ].map(({ label, key, rows }) => (
                <div key={key}>
                  <label className="block text-sm text-slate-400 mb-1.5">{label}</label>
                  <textarea required rows={rows} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-0 py-2 bg-transparent border-b border-slate-600/50 text-slate-200 focus:outline-none focus:border-amber-500/60 resize-none transition-colors" />
                </div>
              ))}
            </div>
          </form>
        </div>
        <div className="px-6 py-4 border-t border-slate-700/30 flex justify-end gap-4">
          <button type="button" onClick={onClose} className="px-5 py-2 text-slate-400 hover:text-slate-200 transition-colors text-sm">取消</button>
          <button form="edit-form" type="submit" disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-amber-700/80 to-amber-500/80 hover:from-amber-600/90 hover:to-amber-400/90 text-amber-50 rounded-lg text-sm font-medium tracking-wide transition-all border border-amber-500/30 disabled:opacity-50">
            {saving ? '儲存中...' : '儲存修改'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function HistoryPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [bodyTypes, setBodyTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editLog, setEditLog] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([api('/history'), api('/tags'), api('/body-types')]).then(([history, tags, bts]) => {
      setLogs(history);
      setAllTags(tags);
      setBodyTypes((bts as any[]).map((b: any) => b.language));
      setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await api(`/problems/${id}`, { method: 'DELETE' });
      setLogs(prev => prev.filter(l => l.id !== id));
      setDeleteId(null);
    } catch {
      // silent — keep UI open
    } finally {
      setDeletingId(null);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!log.title.toLowerCase().includes(q) && !String(log.problemNumber || '').includes(q)) return false;
    }
    if (difficultyFilter && log.difficulty !== difficultyFilter) return false;
    if (languageFilter && log.language !== languageFilter) return false;
    if (tagFilter && !log.tags.some((t: any) => t.tag.name === tagFilter)) return false;
    return true;
  });

  // Extract unique filter options
  const filterTagNames = Array.from(new Set(logs.flatMap(log => log.tags.map((t: any) => t.tag.name))));
  const allLanguages = Array.from(new Set(logs.map(log => log.language)));

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
      <div className="relative z-10 min-h-screen p-8 text-amber-200/80 tracking-widest text-center mt-20 animate-pulse">讀取歷程中...</div>
    </>
  );

  return (
    <>
      {bgPortal}
      <div className="relative z-10 min-h-screen text-slate-200">
        <div className="p-8 pt-12 max-w-5xl mx-auto">

          {/* 標題區 */}
          <div className="mb-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-sm text-amber-400/70 tracking-[0.4em] mb-2 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">修煉典籍</p>
              <h1 className="text-4xl md:text-5xl font-semibold text-amber-100 tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)] mb-2">修煉歷程</h1>
              <p className="text-slate-400 tracking-widest text-sm">回顧過往的每一分努力</p>
            </div>

            {/* 篩選器 — 無框底線風格 */}
            <div className="flex flex-wrap gap-4 items-end">
              {/* 搜尋輸入 */}
              <div className="relative flex items-center">
                <Search size={13} className="absolute left-0 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="題號或題目名稱"
                  className="bg-transparent border-b border-slate-500/50 text-slate-300 text-sm py-1 pl-5 pr-1 focus:outline-none focus:border-amber-400/60 tracking-wider w-44 placeholder-slate-600"
                />
              </div>
              {[
                { value: difficultyFilter, onChange: (v: string) => setDifficultyFilter(v), placeholder: '所有難度', options: [['Easy','Easy'],['Medium','Medium'],['Hard','Hard']] },
                { value: languageFilter, onChange: (v: string) => setLanguageFilter(v), placeholder: '所有聖體（語言）', options: allLanguages.map(l => [l, l]) },
                { value: tagFilter, onChange: (v: string) => setTagFilter(v), placeholder: '所有心經（Tag）', options: filterTagNames.map(t => [t as string, t as string]) },
              ].map((sel, i) => (
                <select
                  key={i}
                  value={sel.value}
                  onChange={e => sel.onChange(e.target.value)}
                  className="bg-transparent border-b border-slate-500/50 text-slate-300 text-sm py-1 px-1 focus:outline-none focus:border-amber-400/60 tracking-wider cursor-pointer"
                >
                  <option value="" className="bg-slate-900">{sel.placeholder}</option>
                  {sel.options.map(([val, label]) => (
                    <option key={val} value={val} className="bg-slate-900">{label}</option>
                  ))}
                </select>
              ))}
            </div>
          </div>

          {/* 分隔線 */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-500/40 to-transparent mb-6" />

          {/* 記錄列表 — 底線分隔，無框 */}
          <div>
            {filteredLogs.length === 0 ? (
              <p className="text-center py-20 text-slate-400 tracking-widest">找不到符合條件的修煉紀錄</p>
            ) : (
              filteredLogs.map(log => (
                <div key={log.id}>
                  {/* 主列 */}
                  <div className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 -mx-2 rounded-lg group">
                    {/* 左側：點擊展開 */}
                    <div className="flex-1 cursor-pointer" onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                      <div className="flex items-center gap-3 mb-2">
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
                      <div className="flex flex-wrap gap-2 text-sm text-slate-300 tracking-wider">
                        <span>{new Date(log.completedAt).toLocaleDateString()}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-sky-400">{log.language}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-amber-400">+{log.cultivationEarned} 修為</span>
                      </div>
                    </div>

                    {/* 右側：tags + 操作按鈕 */}
                    <div className="flex items-center gap-3">
                      <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                        {log.tags.map((t: any) => (
                          <span key={t.tagId} className="text-sm border border-slate-600/50 text-slate-300 px-2.5 py-0.5 rounded tracking-wider">
                            {t.tag.name}
                          </span>
                        ))}
                      </div>

                      {/* 編輯 / 刪除 */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditLog(log)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition-all"
                          title="修改"
                        >
                          <Pencil size={14} />
                        </button>
                        {deleteId === log.id ? (
                          <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-700/50 rounded-lg px-2 py-1">
                            <span className="text-xs text-slate-400 mr-1">確認刪除?</span>
                            <button
                              onClick={() => handleDelete(log.id)}
                              disabled={deletingId === log.id}
                              className="p-0.5 rounded text-red-400 hover:text-red-300 disabled:opacity-50"
                            >
                              <Check size={13} />
                            </button>
                            <button onClick={() => setDeleteId(null)} className="p-0.5 rounded text-slate-400 hover:text-slate-200">
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteId(log.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="刪除"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

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
              ))
            )}
          </div>

          <div className="h-16" />
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editLog && (
          <EditModal
            log={editLog}
            allTags={allTags}
            bodyTypes={bodyTypes}
            onClose={() => setEditLog(null)}
            onSaved={() => { setEditLog(null); loadData(); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
