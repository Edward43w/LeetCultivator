import React from 'react';

export type ReviewResult = 'fail' | 'ok' | 'easy' | 'done';

export const REVIEW_OPTIONS: {
  value: ReviewResult;
  label: string;
  desc: string;
  base: string;
  active: string;
}[] = [
  { value: 'fail', label: '易忘', desc: '明天',    base: 'border-red-600/60 text-red-300 hover:bg-red-900/25',        active: 'bg-red-900/30 border-red-400/80' },
  { value: 'ok',   label: '尚可', desc: '3 天後',  base: 'border-yellow-600/60 text-yellow-300 hover:bg-yellow-900/25', active: 'bg-yellow-900/30 border-yellow-400/80' },
  { value: 'easy', label: '輕鬆', desc: '7 天後',  base: 'border-emerald-600/60 text-emerald-300 hover:bg-emerald-900/25', active: 'bg-emerald-900/30 border-emerald-400/80' },
  { value: 'done', label: '精通', desc: '14 天後', base: 'border-sky-600/60 text-sky-300 hover:bg-sky-900/25',          active: 'bg-sky-900/30 border-sky-400/80' },
];

export const REVIEW_DAYS: Record<ReviewResult, number> = { fail: 1, ok: 3, easy: 7, done: 14 };

export function reviewLevelName(level: number): string {
  if (level >= 10) return '圓滿';
  if (level >= 7)  return '大成';
  if (level >= 4)  return '小成';
  if (level >= 1)  return '入門';
  return '生疏';
}

export function LastResultBadge({ result }: { result: string | null }) {
  if (!result) return null;
  const colorMap: Record<string, string> = {
    fail: 'text-red-400 border-red-700/50',
    ok:   'text-yellow-400 border-yellow-700/50',
    easy: 'text-emerald-400 border-emerald-700/50',
    done: 'text-sky-400 border-sky-700/50',
  };
  const labelMap: Record<string, string> = { fail: '易忘', ok: '尚可', easy: '輕鬆', done: '精通' };
  return (
    <span className={`text-xs border px-2 py-0.5 rounded tracking-wider ${colorMap[result] || 'text-slate-400 border-slate-700/50'}`}>
      上次：{labelMap[result] ?? result}
    </span>
  );
}
