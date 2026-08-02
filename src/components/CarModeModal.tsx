import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Radio,
  Volume2,
  VolumeX,
  X,
  Mic,
  Maximize2,
  Sun,
  Moon,
  Compass,
  Zap,
} from 'lucide-react';
import { RadioShow } from '../types';
import { speechController, playSoundCue } from '../utils/audioSynthesizer';
import { AudioWaveform } from './AudioWaveform';

interface CarModeModalProps {
  show: RadioShow;
  onClose: () => void;
}

export const CarModeModal: React.FC<CarModeModalProps> = ({ show, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSegmentIdx, setCurrentSegmentIdx] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const currentSegment = show.segments[currentSegmentIdx] || show.segments[0];

  const togglePlayPause = () => {
    if (isPlaying) {
      speechController.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  const handleSkipBack = () => {
    setCurrentSegmentIdx((prev) => Math.max(0, prev - 1));
  };

  const handleSkipForward = () => {
    setCurrentSegmentIdx((prev) => Math.min(show.segments.length - 1, prev + 1));
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between p-6 transition-colors duration-300 ${
        isDarkMode ? 'bg-[#050508] text-white' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Top CarPlay Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-red-600 px-3.5 py-1.5 rounded-full text-white font-mono text-xs font-black tracking-widest animate-pulse">
            <Radio className="w-4 h-4" />
            <span>CAR PLAY ON-AIR</span>
          </div>
          <div className="text-sm font-extrabold font-mono text-cyan-400 tracking-wider uppercase">
            BLUETOOTH AUDIO STREAM
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-3 rounded-full transition-colors ${
              isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-200 hover:bg-slate-300'
            }`}
            title="Toggle Day/Night Mode"
          >
            {isDarkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-slate-800" />}
          </button>
          <button
            onClick={onClose}
            className="p-3 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            title="Exit Car Dashboard"
          >
            <X className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Main Center Display (Car Screen Centerpiece) */}
      <div className="flex-1 my-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Column: Station Info */}
        <div className="md:col-span-5 flex flex-col justify-between h-full space-y-4">
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md flex-1 flex flex-col justify-center">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase block mb-2">
              CURRENT SHOW & BROADCAST
            </span>
            <h1 className="text-3xl font-black mb-2 line-clamp-2">{show.title}</h1>
            <p className="text-sm opacity-80 mb-6 italic">"{show.tagline}"</p>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10 text-xs font-mono">
              <span className="bg-cyan-500/20 text-cyan-300 px-3.5 py-1.5 rounded-full font-bold">
                {show.tone}
              </span>
              <span className="bg-white/10 px-3.5 py-1.5 rounded-full font-bold">
                {show.durationMinutes} MIN EPISODE
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: High-Visibility Active Speaker & Waveform */}
        <div className="md:col-span-7 flex flex-col justify-between h-full space-y-4">
          <div className="flex-1 bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-lg">
                  <Mic className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-lg font-bold text-cyan-300">
                    {currentSegment.speakerName}
                  </div>
                  <div className="text-xs opacity-70 font-mono">
                    {currentSegment.speakerRole}
                  </div>
                </div>
              </div>
              <span className="font-mono text-sm font-bold bg-white/10 px-3 py-1.5 rounded-full">
                {currentSegment.timestamp}
              </span>
            </div>

            <p className="text-xl md:text-2xl font-semibold leading-snug my-4 text-white">
              "{currentSegment.text}"
            </p>

            {/* Audio Waveform */}
            <div className="mt-4">
              <AudioWaveform
                isPlaying={isPlaying}
                speaker={currentSegment.speaker}
                sfxCue={currentSegment.sfxCue}
                height={64}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Driver Control Controls Bar (Extra Large Touch Targets) */}
      <div className="bg-white/5 border border-white/10 p-4 rounded-3xl flex items-center justify-between gap-6">
        <button
          onClick={handleSkipBack}
          className="p-5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white"
          title="Previous Turn"
        >
          <SkipBack className="w-8 h-8" />
        </button>

        <button
          onClick={togglePlayPause}
          className="flex-1 max-w-xs py-5 rounded-3xl bg-cyan-400 text-black hover:bg-cyan-300 active:scale-95 transition-all flex items-center justify-center gap-3 font-extrabold text-xl shadow-xl shadow-cyan-500/20"
        >
          {isPlaying ? (
            <>
              <Pause className="w-8 h-8 fill-black" />
              <span>PAUSE</span>
            </>
          ) : (
            <>
              <Play className="w-8 h-8 fill-black ml-1" />
              <span>PLAY</span>
            </>
          )}
        </button>

        <button
          onClick={handleSkipForward}
          className="p-5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white"
          title="Next Turn"
        >
          <SkipForward className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};
