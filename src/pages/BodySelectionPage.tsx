import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';

interface BodyType {
  id: number;
  name: string;
  language: string;
  description: string;
}

export default function BodySelectionPage() {
  const [bodyTypes, setBodyTypes] = useState<BodyType[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  useEffect(() => {
    api('/body-types').then(setBodyTypes);
  }, []);

  const handleSelect = async () => {
    if (!selectedId) return;
    try {
      const user = await api('/user/body-type', {
        method: 'POST',
        body: JSON.stringify({ bodyTypeId: selectedId }),
      });
      setUser(user);
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900 via-slate-950 to-slate-950"></div>
      
      <div className="z-10 text-center mb-12">
        <h1 className="text-4xl font-bold text-amber-400 mb-4 tracking-widest">靈根覺醒</h1>
        <p className="text-slate-400 text-lg">初入仙門，請選擇你的本命聖體</p>
      </div>

      <div className="z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">
        {bodyTypes.map((bt, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={bt.id}
            onClick={() => setSelectedId(bt.id)}
            className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 ${
              selectedId === bt.id 
                ? 'border-amber-500 bg-amber-900/20 shadow-[0_0_30px_rgba(251,191,36,0.15)] transform scale-105' 
                : 'border-slate-800 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800/50'
            }`}
          >
            <div className="h-32 flex items-center justify-center mb-6">
              {/* Placeholder for character/body art */}
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold ${
                selectedId === bt.id ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'
              }`}>
                {bt.language}
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-2 text-center">{bt.name}</h3>
            <p className="text-slate-400 text-sm text-center leading-relaxed">{bt.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: selectedId ? 1 : 0 }}
        disabled={!selectedId}
        onClick={handleSelect}
        className="z-10 mt-12 px-12 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-full tracking-widest transition-all shadow-[0_0_20px_rgba(251,191,36,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        確認本命聖體，開始修煉
      </motion.button>
    </div>
  );
}
