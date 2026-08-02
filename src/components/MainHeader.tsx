import React from 'react';
import { User, LogOut, KeyRound, Sparkles, ShieldCheck, HelpCircle } from 'lucide-react';
import { UserProfile } from './AuthModal';

interface MainHeaderProps {
  user: UserProfile | null;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onSignOut: () => void;
  onOpenWelcomeGuide?: () => void;
}

export const MainHeader: React.FC<MainHeaderProps> = ({
  user,
  onOpenAuth,
  onSignOut,
  onOpenWelcomeGuide,
}) => {
  return (
    <div className="w-full mb-8 select-none flex flex-col items-center">
      {/* Top Bar for User Auth & Guide */}
      <div className="w-full flex items-center justify-between pb-6 mb-4 border-b border-emerald-500/20 gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">
              SUNNY AI RADIO &bull; LIVE STUDIO
            </span>
          </div>

          {onOpenWelcomeGuide && (
            <button
              type="button"
              onClick={onOpenWelcomeGuide}
              className="px-3 py-1 rounded-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="How to use as a Virtual Radio Station"
            >
              <HelpCircle className="w-3.5 h-3.5 text-orange-400" />
              <span>How to Use / Station Guide</span>
            </button>
          )}
        </div>

        <div>
          {user ? (
            <div className="flex items-center gap-3 bg-[#0d1711] border border-emerald-500/40 px-3.5 py-1.5 rounded-full shadow-lg shadow-emerald-950/40">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-white">{user.name}</span>
                <span className="text-[10px] text-neutral-400 hidden sm:inline font-mono">({user.email})</span>
              </div>
              <button
                type="button"
                onClick={onSignOut}
                className="ml-1 text-neutral-400 hover:text-red-400 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenAuth('signin')}
                className="px-3.5 py-1.5 rounded-xl bg-[#0e1711] hover:bg-[#142319] text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenAuth('signup')}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-extrabold text-xs transition-all cursor-pointer shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-4 font-sans text-center">
        Generate a{' '}
        <span className="inline-flex">
          <span className="text-[#3b82f6]">r</span>
          <span className="text-[#38bdf8]">a</span>
          <span className="text-[#22c55e]">d</span>
          <span className="text-[#a3e635]">i</span>
          <span className="text-[#facc15]">o</span>
        </span>{' '}
        <span className="inline-flex">
          <span className="text-[#facc15]">s</span>
          <span className="text-[#f97316]">h</span>
          <span className="text-[#ef4444]">o</span>
          <span className="text-[#f43f5e]">w</span>
        </span>
      </h1>

      <p className="text-base md:text-lg text-[#9ca3af] font-medium tracking-wide text-center">
        powered by{' '}
        <a
          href="https://ai.google.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#d1d5db] underline underline-offset-4 decoration-[#6b7280] hover:decoration-white hover:text-white transition-colors font-medium"
        >
          gemini managed agents
        </a>
      </p>
    </div>
  );
};

