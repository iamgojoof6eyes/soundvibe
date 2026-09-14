import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Disc3, 
  Sparkles,
  ShieldCheck,
  Music2
} from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { loginWithGoogle } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is not enabled yet in your Firebase Console. Please enable it under Authentication > Sign-in method.');
      } else {
        setError(err.message || 'Google sign in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="glass-dropdown border border-white/15 rounded-3xl w-full max-w-sm p-6 sm:p-8 shadow-2xl relative bg-dark-950/95 my-auto text-center"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="space-y-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-blue/15 border border-brand-blue/30 text-brand-blue flex items-center justify-center mx-auto shadow-lg shadow-brand-blue/20">
            <Disc3 className="w-8 h-8 animate-spin-slow" />
          </div>
          <h2 className="text-2xl font-bold font-display text-white">
            Welcome to SoundVibe
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            Connect your Google account to drop music vibes, rate records, follow curators, and join live listening lounges.
          </p>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* 1-Click Google Sign-In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-dark-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-lg shadow-white/10 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <Disc3 className="w-5 h-5 animate-spin text-dark-950" />
          ) : (
            <>
              {/* Google SVG Logo */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.4C.6 9.4 0 11.6 0 14s.6 4.6 1.6 6.6l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 15.9C3.5 19.8 7.4 23 12 23z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Benefits Strip */}
        <div className="mt-6 pt-5 border-t border-white/10 space-y-2 text-left">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-blue shrink-0" />
            <span>Fast & secure 1-click Google authentication</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Music2 className="w-3.5 h-3.5 text-brand-purple shrink-0" />
            <span>Instant profile creation with zero passwords</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Save favorite tracks, reviews, and community lounges</span>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
