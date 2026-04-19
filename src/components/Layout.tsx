import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import { BookOpen, History, Settings, Trash2, Home, Menu, X, Layers3, AlertTriangle } from 'lucide-react';

export default function Layout() {
  const { logout, user } = useAuthStore();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteUser = async () => {
    setDeleting(true);
    try {
      await api('/user', { method: 'DELETE' });
      logout();
    } catch {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (location.pathname === '/body-selection') {
    return <Outlet />;
  }

  const navItems = [
    { path: '/', icon: Home, label: '修煉洞府' },
    { path: '/realms', icon: Layers3, label: '一窺道途' },
    { path: '/sutras', icon: BookOpen, label: '心經藏書閣' },
    { path: '/history', icon: History, label: '修煉歷程' },
    { path: '/settings', icon: Settings, label: '個人設定' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100 font-sans bg-slate-950">

      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed left-4 top-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-950/85 text-slate-200 shadow-lg shadow-black/30 hover:bg-slate-900"
        aria-label="開啟選單"
      >
        <Menu size={20} />
      </button>

      <div
        className={`fixed inset-0 z-40 bg-black/55 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside
        className={`fixed left-0 top-0 z-50 h-full w-72 border-r border-slate-700 bg-slate-950/96 backdrop-blur-sm transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between border-b border-slate-800 p-6">
            <div>
              <h1 className="text-2xl font-bold text-amber-400 tracking-wider">Code問仙門</h1>
              <p className="text-sm text-slate-400 mt-2">道友 {user?.nickname}，歡迎歸來</p>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              aria-label="關閉選單"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-amber-900/25 text-amber-300 border border-amber-600/40'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button
              onClick={() => { setShowDeleteConfirm(true); }}
              className="flex items-center space-x-3 px-4 py-3 w-full text-left text-slate-300 hover:bg-slate-800 hover:text-red-400 rounded-lg transition-colors"
            >
              <Trash2 size={20} />
              <span>退出修仙界</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 刪除確認 Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 bg-slate-900 border border-red-800/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={22} className="text-red-400 flex-shrink-0" />
              <h2 className="text-lg font-semibold text-red-300">確認退出修仙界</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-2">
              此操作將永久刪除道友 <span className="text-amber-300 font-semibold">「{user?.nickname}」</span> 的所有修煉資料：
            </p>
            <ul className="text-slate-400 text-xs space-y-1 mb-5 pl-4 list-disc">
              <li>所有修煉紀錄與修行手札</li>
              <li>境界進度與修為</li>
              <li>心經掌握程度</li>
              <li>簽到紀錄</li>
            </ul>
            <p className="text-red-400/80 text-xs mb-6">此操作<strong>無法復原</strong>。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm"
              >
                取消
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg bg-red-700 hover:bg-red-600 text-white font-medium transition-colors text-sm disabled:opacity-60"
              >
                {deleting ? '刪除中...' : '確認刪除'}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="relative z-10 min-h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
