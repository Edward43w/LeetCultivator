import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RecordModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [tags, setTags] = useState<any[]>([]);
  const [bodyTypes, setBodyTypes] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    problemNumber: '',
    difficulty: 'Easy',
    language: '',
    link: '',
    completedAt: new Date().toISOString().split('T')[0],
    selectedTags: [] as number[],
    summary: '',
    stuckPoints: '',
    reviewReminders: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    api('/tags').then(setTags);
    api('/body-types').then(setBodyTypes);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api('/problems', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          tags: formData.selectedTags
        })
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tagId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter(id => id !== tagId)
        : [...prev.selectedTags, tagId]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="bg-slate-950/80 backdrop-blur-xl border border-slate-700/40 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_8px_40px_rgba(0,0,0,0.7)]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-700/30 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-amber-100 tracking-wide">記錄修煉 · 修行手札</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition-colors">
            <X size={22} />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1 custom-scrollbar">
          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 space-y-5"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                className="text-7xl mb-2"
              >✨</motion.div>
              <h3 className="text-2xl font-semibold text-amber-100 tracking-wide">煉化成功！</h3>
              <div className="space-y-2 text-slate-300">
                <p>獲得修為：<span className="text-amber-300 font-bold">+{result.pointsEarned}</span></p>
                {result.realmBreakthrough && (
                  <p className="text-yellow-300 font-semibold animate-pulse"> 境界突破至：{result.newRealmName}！</p>
                )}
                {result.bodyUpgrade && (
                  <p className="text-sky-400 font-semibold"> 聖體進階！</p>
                )}
                {result.upgradedSutras?.length > 0 && (
                  <p className="text-purple-300"> 心經升級：{result.upgradedSutras.join(', ')}</p>
                )}
                {result.checkedInToday && (
                  <p className="text-amber-300"> 今日閉關成功！</p>
                )}
              </div>
              <button
                onClick={onSuccess}
                className="mt-6 px-8 py-2.5 bg-gradient-to-r from-amber-700/80 to-amber-500/80 hover:from-amber-600/90 hover:to-amber-400/90 text-amber-50 rounded-lg font-medium tracking-wide transition-all border border-amber-500/30"
              >
                返回洞府
              </button>
            </motion.div>
          ) : (
            <form id="record-form" onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="px-4 py-2.5 bg-red-950/40 border border-red-700/40 rounded-lg text-red-400 text-sm">{error}</div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">題目名稱 *</label>
                  <input
                    required type="text" value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-0 py-2 bg-transparent border-b border-slate-600/50 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 transition-colors"
                    placeholder="Two Sum"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">題號</label>
                  <input
                    type="text" value={formData.problemNumber}
                    onChange={e => setFormData({...formData, problemNumber: e.target.value})}
                    className="w-full px-0 py-2 bg-transparent border-b border-slate-600/50 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 transition-colors"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">難度 *</label>
                  <select
                    value={formData.difficulty}
                    onChange={e => setFormData({...formData, difficulty: e.target.value})}
                    className="w-full px-0 py-2 bg-transparent border-b border-slate-600/50 text-slate-200 focus:outline-none focus:border-amber-500/60 transition-colors appearance-none"
                  >
                    <option value="Easy" className="bg-slate-900">Easy (10 修為)</option>
                    <option value="Medium" className="bg-slate-900">Medium (25 修為)</option>
                    <option value="Hard" className="bg-slate-900">Hard (50 修為)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">使用語言 *</label>
                  <select
                    required value={formData.language}
                    onChange={e => setFormData({...formData, language: e.target.value})}
                    className="w-full px-0 py-2 bg-transparent border-b border-slate-600/50 text-slate-200 focus:outline-none focus:border-amber-500/60 transition-colors appearance-none"
                  >
                    <option value="" className="bg-slate-900">選擇語言</option>
                    {bodyTypes.map(bt => (
                      <option key={bt.id} value={bt.language} className="bg-slate-900">{bt.language}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-1.5">題目連結</label>
                  <input
                    type="url" value={formData.link}
                    onChange={e => setFormData({...formData, link: e.target.value})}
                    className="w-full px-0 py-2 bg-transparent border-b border-slate-600/50 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 transition-colors"
                    placeholder="https://leetcode.com/problems/..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-2.5">Tags · 心經</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleTagToggle(tag.id)}
                        className={`px-3 py-1 rounded-full text-xs transition-all ${
                          formData.selectedTags.includes(tag.id)
                            ? 'border border-amber-500/60 text-amber-200 bg-amber-900/25'
                            : 'border border-slate-600/40 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-1.5">完成日期 *</label>
                  <input
                    required type="date" value={formData.completedAt}
                    onChange={e => setFormData({...formData, completedAt: e.target.value})}
                    className="w-full px-0 py-2 bg-transparent border-b border-slate-600/50 text-slate-200 focus:outline-none focus:border-amber-500/60 transition-colors"
                  />
                </div>
              </div>

              <div className="border-t border-slate-700/30 pt-5 mt-2">
                <h3 className="text-base font-semibold text-amber-100/90 mb-4 tracking-wide">修行手札 (必填)</h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">解題思路摘要 *</label>
                    <textarea
                      required rows={3} value={formData.summary}
                      onChange={e => setFormData({...formData, summary: e.target.value})}
                      className="w-full px-0 py-2 bg-transparent border-b border-slate-600/50 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 resize-none transition-colors"
                      placeholder="你是怎麼想出解法的？用了什麼演算法？"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">卡關點 / 易錯點 *</label>
                    <textarea
                      required rows={2} value={formData.stuckPoints}
                      onChange={e => setFormData({...formData, stuckPoints: e.target.value})}
                      className="w-full px-0 py-2 bg-transparent border-b border-slate-600/50 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 resize-none transition-colors"
                      placeholder="哪裡卡住了？有什麼 edge case 沒想到？"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">複習提醒 *</label>
                    <textarea
                      required rows={2} value={formData.reviewReminders}
                      onChange={e => setFormData({...formData, reviewReminders: e.target.value})}
                      className="w-full px-0 py-2 bg-transparent border-b border-slate-600/50 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 resize-none transition-colors"
                      placeholder="下次遇到類似題目要注意什麼？"
                    />
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {!result && (
          <div className="px-6 py-4 border-t border-slate-700/30 flex justify-end gap-4">
            <button
              type="button" onClick={onClose}
              className="px-5 py-2 text-slate-400 hover:text-slate-200 transition-colors text-sm"
            >
              取消
            </button>
            <button
              form="record-form" type="submit" disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-amber-700/80 to-amber-500/80 hover:from-amber-600/90 hover:to-amber-400/90 text-amber-50 rounded-lg text-sm font-medium tracking-wide transition-all border border-amber-500/30 disabled:opacity-50"
            >
              {loading ? '煉化中...' : '儲存並煉化'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
