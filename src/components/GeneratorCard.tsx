import React, { useState } from 'react';
import { Clock, Menu, Loader2, ChevronDown } from 'lucide-react';
import { ShowTone } from '../types';

interface GeneratorCardProps {
  prompt: string;
  setPrompt: (value: string) => void;
  durationMinutes: number;
  setDurationMinutes: (val: number) => void;
  tone: ShowTone;
  setTone: (tone: ShowTone) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const TONE_OPTIONS: { label: string; value: ShowTone }[] = [
  { label: 'INFORMATIVE', value: 'INFORMATIVE' },
  { label: 'COMEDIC', value: 'COMEDIC' },
  { label: 'DEBATE', value: 'DEBATE' },
  { label: 'DRAMATIC', value: 'DRAMATIC' },
  { label: 'CASUAL', value: 'CASUAL' },
  { label: 'NIGHT TALK', value: 'NIGHT TALK' },
];

const DURATION_OPTIONS = [1, 3, 5, 10];

export const GeneratorCard: React.FC<GeneratorCardProps> = ({
  prompt,
  setPrompt,
  durationMinutes,
  setDurationMinutes,
  tone,
  setTone,
  onGenerate,
  isGenerating,
}) => {
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  const [showToneDropdown, setShowToneDropdown] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      onGenerate();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-10">
      {/* Main Generator Card */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-[#101015]/95 border border-white/10 rounded-[32px] p-6 shadow-2xl transition-all duration-300"
      >
        <textarea
          id="radio-prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="I want a talk radio show about...."
          rows={4}
          disabled={isGenerating}
          className="w-full bg-transparent text-[#d4d4d8] text-lg md:text-xl placeholder-[#52525b] resize-none outline-none font-sans leading-relaxed"
        />

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            {/* Duration Selector */}
            <div className="relative">
              <button
                id="duration-select-btn"
                type="button"
                onClick={() => {
                  setShowDurationDropdown(!showDurationDropdown);
                  setShowToneDropdown(false);
                }}
                className="flex items-center gap-2 bg-[#1b1b22] hover:bg-[#252530] text-white px-4 py-2 rounded-full text-xs font-bold tracking-widest transition-colors border border-white/5"
              >
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>{durationMinutes} MIN</span>
              </button>

              {showDurationDropdown && (
                <div className="absolute top-full left-0 mt-2 w-32 bg-[#1b1b24] border border-white/10 rounded-2xl shadow-xl z-30 py-2">
                  {DURATION_OPTIONS.map((min) => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => {
                        setDurationMinutes(min);
                        setShowDurationDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${
                        durationMinutes === min
                          ? 'bg-white/10 text-white font-bold'
                          : 'text-neutral-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {min} {min === 1 ? 'Minute' : 'Minutes'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tone Selector */}
            <div className="relative">
              <button
                id="tone-select-btn"
                type="button"
                onClick={() => {
                  setShowToneDropdown(!showToneDropdown);
                  setShowDurationDropdown(false);
                }}
                className="flex items-center gap-2 bg-[#1b1b22] hover:bg-[#252530] text-white px-4 py-2 rounded-full text-xs font-bold tracking-widest transition-colors border border-white/5"
              >
                <Menu className="w-3.5 h-3.5 text-neutral-400" />
                <span>{tone}</span>
              </button>

              {showToneDropdown && (
                <div className="absolute top-full left-0 mt-2 w-40 bg-[#1b1b24] border border-white/10 rounded-2xl shadow-xl z-30 py-2">
                  {TONE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setTone(opt.value);
                        setShowToneDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${
                        tone === opt.value
                          ? 'bg-white/10 text-white font-bold'
                          : 'text-neutral-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Generate Action Button */}
          <button
            id="generate-show-btn"
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-extrabold tracking-wider transition-all duration-200 shadow-lg ${
              !prompt.trim() || isGenerating
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
                : 'bg-white text-black hover:bg-neutral-200 hover:scale-105 active:scale-95 shadow-white/10'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>BROADCASTING...</span>
              </>
            ) : (
              <>
                <span>GENERATE</span>
                {/* Custom Multi-Color Gradient Diamond Sparkle Icon */}
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                    fill="url(#sparkle-gradient)"
                  />
                  <defs>
                    <linearGradient
                      id="sparkle-gradient"
                      x1="2"
                      y1="2"
                      x2="22"
                      y2="22"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#38bdf8" />
                      <stop offset="0.5" stopColor="#f43f5e" />
                      <stop offset="1" stopColor="#facc15" />
                    </linearGradient>
                  </defs>
                </svg>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Footer Notices */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4 px-2 text-xs text-[#71717a]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#eab308]" />
          <span>
            Each radio show generation takes{' '}
            <strong className="text-[#d4d4d8] font-bold">~5 minutes</strong> to research and voice.
          </span>
        </div>
        <div className="text-[#71717a]">
          Please do not submit any sensitive or personal information.
        </div>
      </div>
    </div>
  );
};

