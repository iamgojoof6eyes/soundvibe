import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Disc3, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="py-24 max-w-lg mx-auto text-center space-y-5 animate-in fade-in duration-200">
      <div className="w-20 h-20 rounded-3xl bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center mx-auto text-brand-purple shadow-xl">
        <Disc3 className="w-10 h-10 animate-spin-slow" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-3xl font-extrabold font-display text-white">404 - Page Off Beat</h1>
        <p className="text-sm text-slate-400">
          The music page or vibe you're looking for doesn't exist or has moved.
        </p>
      </div>
      <div>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-violet via-brand-purple to-brand-pink text-white font-bold text-xs shadow-lg shadow-brand-purple/25 hover:scale-105 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to SoundVibe Feed</span>
        </button>
      </div>
    </div>
  );
};
