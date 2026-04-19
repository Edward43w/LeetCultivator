import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import BackgroundParticles from '../components/BackgroundParticles';
import { Pencil, Check, X } from 'lucide-react';

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [bodyTypes, setBodyTypes] = useState<any[]>([]);
  const [selectedBodyTypeId, setSelectedBodyTypeId] = useState<number | null>(user?.mainBodyTypeId || null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // nickname edit state
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(user?.nickname || '');
  const [nicknameSaving, setNicknameSaving] = useState(false);
  const [nicknameError, setNicknameError] = useState('');

  useEffect(() => {
    api('/body-types').then(setBodyTypes);
  }, []);

  const handleSaveNickname = async () => {
    setNicknameError('');
    if (!nicknameInput.trim()) { setNicknameError('道號不可為空'); return; }
    if (nicknameInput.trim().length > 20) { setNicknameError('道號不可超過 20 字'); return; }
    setNicknameSaving(true);
    try {
      const updatedUser = await api('/user/nickname', {
        method: 'PATCH',
        body: JSON.stringify({ nickname: nicknameInput.trim() }),
      });
      setUser({ ...user!, ...updatedUser });
      setEditingNickname(false);
    } catch (err: any) {
      setNicknameError(err.message || '更新失敗');
    } finally {
      setNicknameSaving(false);
    }
  };

  const handleCancelNickname = () => {
    setNicknameInput(user?.nickname || '');
    setNicknameError('');
    setEditingNickname(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const updatedUser = await api('/user/body-type', {
        method: 'POST',
        body: JSON.stringify({ bodyTypeId: selectedBodyTypeId })
      });
      setUser(updatedUser);
      setMessage('設定已更新');
    } catch (error) {
      setMessage('更新失敗');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const bgPortal = createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: 'url(/library-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(2,6,23,0.15) 0%, rgba(2,6,23,0.25) 50%, rgba(2,6,23,0.50) 100%)' }} />
      <BackgroundParticles />
    </div>,
    document.body
  );

  return (
    <>
      {bgPortal}
      <div className="relative z-10 min-h-screen text-slate-200">
        <div className="p-8 pt-12 max-w-3xl mx-auto">

          {/* 標題 */}
          <p className="text-sm text-amber-400/70 tracking-[0.4em] mb-2 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">修士設定</p>
          <h1 className="text-4xl md:text-5xl font-semibold text-amber-100 tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)] mb-10">個人設定</h1>

          {/* 分隔線 */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-500/40 to-transparent mb-10" />

          {/* 基本資料區 */}
          <section className="mb-12">
            <h2 className="text-sm tracking-[0.35em] text-amber-400/80 mb-7 uppercase drop-shadow-[0_0_6px_rgba(251,191,36,0.3)]">基本資料</h2>
            <div className="space-y-7">
              <div>
                <label className="block text-base font-medium text-slate-200 mb-2 tracking-widest">道號（暱稱）</label>
                {editingNickname ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        autoFocus
                        maxLength={20}
                        value={nicknameInput}
                        onChange={(e) => setNicknameInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNickname(); if (e.key === 'Escape') handleCancelNickname(); }}
                        className="flex-1 px-0 py-2 bg-transparent border-b border-amber-500/60 text-amber-100 text-lg font-semibold tracking-widest focus:outline-none"
                      />
                      <button onClick={handleSaveNickname} disabled={nicknameSaving} className="text-emerald-400 hover:text-emerald-300 transition-colors" title="確認">
                        <Check size={18} />
                      </button>
                      <button onClick={handleCancelNickname} className="text-slate-400 hover:text-slate-200 transition-colors" title="取消">
                        <X size={18} />
                      </button>
                    </div>
                    {nicknameError && <p className="text-xs text-red-400 mt-1.5">{nicknameError}</p>}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 group">
                    <span className="text-amber-100 text-lg font-semibold tracking-widest border-b border-slate-600/50 py-2 flex-1">{user.nickname}</span>
                    <button
                      onClick={() => { setNicknameInput(user.nickname); setEditingNickname(true); }}
                      className="text-slate-500 hover:text-amber-400 transition-colors opacity-0 group-hover:opacity-100"
                      title="修改道號"
                    >
                      <Pencil size={15} />
                    </button>
                  </div>
                )}
                {!editingNickname && <p className="text-sm text-slate-400 mt-1.5 tracking-wider">道號為修士身份象徵，可隨時更改。</p>}
              </div>
            </div>
          </section>

          {/* 分隔線 */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-500/40 to-transparent mb-10" />

          {/* 主展示聖體 */}
          <section className="mb-12">
            <h2 className="text-sm tracking-[0.35em] text-amber-400/80 mb-3 uppercase drop-shadow-[0_0_6px_rgba(251,191,36,0.3)]">主展示聖體</h2>
            <p className="text-slate-300 text-base mb-8 tracking-wider">選擇要在洞府主頁展示的本命聖體。這不會影響你其他聖體的修煉進度。</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
              {bodyTypes.map(bt => {
                const active = selectedBodyTypeId === bt.id;
                return (
                  <div
                    key={bt.id}
                    onClick={() => setSelectedBodyTypeId(bt.id)}
                    className="cursor-pointer group py-4 px-2 border-b transition-all duration-300"
                    style={{
                      borderColor: active ? 'rgba(251,191,36,0.6)' : 'rgba(100,116,139,0.25)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* 選中指示點 */}
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300"
                        style={{
                          background: active ? '#fbbf24' : 'rgba(100,116,139,0.4)',
                          boxShadow: active ? '0 0 8px rgba(251,191,36,0.8)' : 'none',
                        }}
                      />
                      <div>
                        <div className={`text-base font-semibold tracking-widest transition-colors duration-300 ${active ? 'text-amber-200' : 'text-slate-200 group-hover:text-slate-100'}`}>
                          {bt.name}
                        </div>
                        <div className={`text-sm mt-0.5 tracking-wider transition-colors duration-300 ${active ? 'text-amber-400/80' : 'text-slate-400 group-hover:text-slate-300'}`}>
                          {bt.language}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-5">
              <button
                onClick={handleSave}
                disabled={saving || selectedBodyTypeId === user.mainBodyTypeId}
                className="px-8 py-2 rounded-lg text-sm font-semibold tracking-widest transition-all duration-300 disabled:opacity-40"
                style={{
                  background: 'linear-gradient(to right, rgba(146,64,14,0.7), rgba(180,83,9,0.7))',
                  border: '1px solid rgba(251,191,36,0.4)',
                  color: '#fde68a',
                  boxShadow: '0 0 15px rgba(251,191,36,0.15)',
                }}
              >
                {saving ? '儲存中...' : '儲存設定'}
              </button>
              {message && (
                <span className={`text-sm tracking-widest ${message.includes('失敗') ? 'text-red-400' : 'text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'}`}>
                  {message}
                </span>
              )}
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
