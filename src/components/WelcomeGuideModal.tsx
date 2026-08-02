import React from 'react';
import {
  X,
  Radio,
  Mic,
  Volume2,
  Sparkles,
  Tv,
  KeyRound,
  Car,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface WelcomeGuideModalProps {
  show: boolean;
  onClose: () => void;
  onOpenLiveStudio?: () => void;
}

export const WelcomeGuideModal: React.FC<WelcomeGuideModalProps> = ({
  show,
  onClose,
  onOpenLiveStudio,
}) => {
  if (!show) return null;

  const handleLaunchStudio = () => {
    onClose();
    if (onOpenLiveStudio) {
      onOpenLiveStudio();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      {/* Main Modal Card */}
      <div className="relative w-full max-w-2xl bg-[#070e0a] border border-emerald-500/40 rounded-3xl shadow-2xl shadow-emerald-950/60 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glow Top Accent Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-orange-500 to-emerald-400" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-emerald-500/20 bg-gradient-to-b from-emerald-950/30 to-transparent flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shrink-0">
              <Radio className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30 uppercase">
                  🎉 ACCOUNT CREATED SUCCESSFULLY
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-wide mt-1">
                Welcome to Sunny AI Virtual Radio Station!
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar text-neutral-200">
          {/* Main Requested Highlight Box: Virtual Equipment Replacement */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-950/40 via-[#0d1711] to-emerald-950/50 border-2 border-orange-500/50 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-orange-400 font-extrabold text-sm uppercase tracking-wide">
              <Mic className="w-5 h-5 text-orange-400 animate-bounce" />
              <span>🎙️ YOUR PORTABLE VIRTUAL RADIO STUDIO (NO EQUIPMENT NEEDED!)</span>
            </div>
            <p className="text-xs md:text-sm text-neutral-100 leading-relaxed font-medium">
              You can use this application as a complete <strong className="text-orange-300">virtual radio station</strong>! Instead of buying expensive mixing hardware, microphones, or heavy radio equipment:
            </p>
            <div className="p-3.5 rounded-xl bg-black/50 border border-orange-500/30 text-xs text-orange-200 flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold mb-0.5">How to Broadcast Live:</strong>
                Simply enter the <span className="text-emerald-400 font-bold">Live Studio Booth</span>, place your mobile phone or computer close to your microphone (or talk directly into your device), and start hosting your show! The app handles all audio processing, sound effects, music beds, and live broadcast recording directly from your browser.
              </div>
            </div>
          </div>

          {/* Section: Other Core App Functions */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>EXPLORE ALL FEATURES & POWERFUL STUDIO FUNCTIONS</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Feature 1 */}
              <div className="p-4 rounded-xl bg-[#0a120d] border border-emerald-500/20 space-y-1.5 hover:border-emerald-500/40 transition-all">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <Mic className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1. Live Broadcast Booth & Recording</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Real-time microphone input, live speech level metering, synthesized music beds, live teleprompter script reader, and one-click MP3 radio show recording.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-4 rounded-xl bg-[#0a120d] border border-emerald-500/20 space-y-1.5 hover:border-emerald-500/40 transition-all">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>2. 600+ Studio Soundboard Rack</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Instantly trigger airhorns, applause, vinyl scratches, cartoon sound effects, crowd cheers, and custom uploaded audio clips on-the-fly during broadcasts.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-4 rounded-xl bg-[#0a120d] border border-emerald-500/20 space-y-1.5 hover:border-emerald-500/40 transition-all">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>3. AI Radio Show Generator</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Type any topic (e.g. tech news, sports debate, daily comedy, retro 80s rock show) and Gemini AI automatically drafts a full script with multi-host banter and sound cues.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-4 rounded-xl bg-[#0a120d] border border-emerald-500/20 space-y-1.5 hover:border-emerald-500/40 transition-all">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <Tv className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>4. YouTube Music Studio Deck</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Search, load, and play background music or podcast tracks seamlessly directly inside your studio console while speaking.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-4 rounded-xl bg-[#0a120d] border border-emerald-500/20 space-y-1.5 hover:border-emerald-500/40 transition-all">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <KeyRound className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>5. Password & 6-Digit Code Login</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Sign in securely using either your personal password or an instant passwordless 6-digit code delivered straight to your email inbox.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-4 rounded-xl bg-[#0a120d] border border-emerald-500/20 space-y-1.5 hover:border-emerald-500/40 transition-all">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <Car className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>6. Car Mode & On-The-Go Broadcast</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Optimized high-contrast touch interface designed specifically for hosting live shows while commuting, travelling, or broadcasting inside your vehicle.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-4 border-t border-emerald-500/20 bg-gradient-to-t from-emerald-950/40 to-transparent flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Got It, Thanks!
          </button>

          <button
            type="button"
            onClick={handleLaunchStudio}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-emerald-500 hover:from-red-500 hover:to-emerald-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Mic className="w-4 h-4 text-black" />
            <span>ENTER VIRTUAL STUDIO BOOTH →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
