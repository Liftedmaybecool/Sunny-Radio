import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
  Share2,
  X,
  Radio,
  Mic,
  Sparkles,
  Music,
  FileText,
  Car,
  Wifi,
} from 'lucide-react';
import { RadioShow, ShowSegment } from '../types';
import { AudioWaveform } from './AudioWaveform';
import { CarModeModal } from './CarModeModal';
import { ConnectRadioModal } from './ConnectRadioModal';
import {
  speechController,
  playSoundCue,
  playAirhorn,
  playScratch,
  playJingle,
  playCheer,
  playNewsFlash,
} from '../utils/audioSynthesizer';

interface RadioPlayerStudioProps {
  show: RadioShow;
  onClose: () => void;
}

export const RadioPlayerStudio: React.FC<RadioPlayerStudioProps> = ({ show, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegmentIdx, setCurrentSegmentIdx] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSFX, setActiveSFX] = useState<string | null>(null);
  const [showCarMode, setShowCarMode] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const segmentRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const currentSegment = show.segments[currentSegmentIdx] || show.segments[0];

  // Auto-scroll transcript to current active segment
  useEffect(() => {
    if (segmentRefs.current[currentSegmentIdx]) {
      segmentRefs.current[currentSegmentIdx]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentSegmentIdx]);

  // Handle segment speech playback chain
  useEffect(() => {
    if (!isPlaying) {
      speechController.stop();
      return;
    }

    if (currentSegmentIdx >= show.segments.length) {
      setIsPlaying(false);
      setCurrentSegmentIdx(0);
      return;
    }

    const seg = show.segments[currentSegmentIdx];

    // Trigger sound cue if specified in segment
    if (seg.sfxCue && !isMuted) {
      playSoundCue(seg.sfxCue);
    }

    // Speak line
    speechController.speak(
      seg.text,
      seg.speaker,
      playbackSpeed,
      () => {
        // Move to next segment
        setCurrentSegmentIdx((prev) => prev + 1);
      }
    );

    return () => {
      speechController.stop();
    };
  }, [isPlaying, currentSegmentIdx, playbackSpeed, isMuted, show.segments]);

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleRestart = () => {
    speechController.stop();
    setCurrentSegmentIdx(0);
    setIsPlaying(true);
  };

  const handleSkipBack = () => {
    setCurrentSegmentIdx((prev) => Math.max(0, prev - 1));
  };

  const handleSkipForward = () => {
    setCurrentSegmentIdx((prev) => Math.min(show.segments.length - 1, prev + 1));
  };

  const triggerLiveSFX = (name: string, fn: () => void) => {
    setActiveSFX(name);
    fn();
    setTimeout(() => setActiveSFX(null), 300);
  };

  const handleDownloadScript = () => {
    const scriptContent = `
=====================================================
${show.title.toUpperCase()}
${show.tagline}
Station: AI Studio Radio Live
Topic: ${show.topic}
Hosts: ${show.host1Name} (${show.host1Title}) & ${show.host2Name} (${show.host2Title})
=====================================================

${show.segments
  .map(
    (s) =>
      `[${s.timestamp}] ${s.speakerName.toUpperCase()} (${s.speakerRole}):\n${s.text}${
        s.sfxCue ? ` [SFX CUE: ${s.sfxCue.toUpperCase()}]` : ''
      }\n`
  )
  .join('\n')}`;

    const blob = new Blob([scriptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${show.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-script.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl h-[90vh] bg-[#0d0d12] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Studio Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#12121a]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="font-mono text-xs font-bold text-red-400 tracking-wider">
                LIVE BROADCAST STUDIO
              </span>
            </div>
            <span className="text-neutral-500 text-xs font-mono">
              EPISODE #{show.id.slice(-6)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCarMode(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition-colors border border-amber-500/30"
              title="Car Play Mode"
            >
              <Car className="w-3.5 h-3.5 text-amber-400" />
              <span>CAR PLAY</span>
            </button>
            <button
              onClick={() => setShowConnectModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold transition-colors border border-cyan-500/30"
              title="Connect to Car, Bluetooth, or Stream"
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>CONNECT RADIO</span>
            </button>
            <button
              onClick={handleDownloadScript}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 text-neutral-300 text-xs font-semibold transition-colors border border-white/10"
              title="Download Script"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Script</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Panel: Show Info & Host Studio Spotlight (5 cols) */}
          <div className="lg:col-span-5 p-6 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between overflow-y-auto bg-[#0f0f16]">
            <div>
              <div className="mb-4">
                <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
                  {show.tone} • {show.durationMinutes} MIN
                </span>
                <h2 className="text-2xl font-black text-white leading-tight mb-2">
                  {show.title}
                </h2>
                <p className="text-xs text-neutral-400 italic mb-4">"{show.tagline}"</p>
                <p className="text-xs text-neutral-300 bg-white/5 p-3 rounded-xl border border-white/5 leading-relaxed">
                  {show.summary}
                </p>
              </div>

              {/* Hosts Spotlight */}
              <div className="space-y-3 mb-6">
                <span className="text-[10px] font-mono font-bold tracking-wider text-neutral-500 uppercase">
                  ON-AIR HOSTS
                </span>

                {/* Host 1 */}
                <div
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    currentSegment.speaker === 'host1' && isPlaying
                      ? 'bg-blue-950/40 border-blue-500/50 ring-1 ring-blue-500/30'
                      : 'bg-[#161622] border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{show.host1Name}</span>
                        <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                          LEAD HOST
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-400">{show.host1Title}</div>
                    </div>
                  </div>
                  {currentSegment.speaker === 'host1' && isPlaying && (
                    <div className="flex items-center gap-1">
                      <span className="w-1 h-3 bg-blue-400 rounded-full animate-bounce"></span>
                      <span className="w-1 h-4 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  )}
                </div>

                {/* Host 2 */}
                <div
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    currentSegment.speaker === 'host2' && isPlaying
                      ? 'bg-purple-950/40 border-purple-500/50 ring-1 ring-purple-500/30'
                      : 'bg-[#161622] border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{show.host2Name}</span>
                        <span className="text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                          CO-HOST
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-400">{show.host2Title}</div>
                    </div>
                  </div>
                  {currentSegment.speaker === 'host2' && isPlaying && (
                    <div className="flex items-center gap-1">
                      <span className="w-1 h-3 bg-purple-400 rounded-full animate-bounce"></span>
                      <span className="w-1 h-4 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Real-time Visual Audio Waveform */}
              <div className="mb-4">
                <AudioWaveform
                  isPlaying={isPlaying}
                  speaker={currentSegment.speaker}
                  sfxCue={currentSegment.sfxCue}
                  height={52}
                />
              </div>
            </div>

            {/* Live Studio DJ Soundboard Overlay */}
            <div className="bg-[#14141e] p-3.5 rounded-2xl border border-white/5">
              <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                DJ LIVE SOUNDBOARD
              </span>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => triggerLiveSFX('airhorn', playAirhorn)}
                  className={`p-2 rounded-xl text-center text-xs font-semibold transition-all ${
                    activeSFX === 'airhorn' ? 'bg-amber-500 text-black scale-95' : 'bg-white/5 hover:bg-white/15 text-amber-300'
                  }`}
                >
                  📣 Horn
                </button>
                <button
                  onClick={() => triggerLiveSFX('scratch', playScratch)}
                  className={`p-2 rounded-xl text-center text-xs font-semibold transition-all ${
                    activeSFX === 'scratch' ? 'bg-purple-500 text-white scale-95' : 'bg-white/5 hover:bg-white/15 text-purple-300'
                  }`}
                >
                  🏉 Scratch
                </button>
                <button
                  onClick={() => triggerLiveSFX('jingle', playJingle)}
                  className={`p-2 rounded-xl text-center text-xs font-semibold transition-all ${
                    activeSFX === 'jingle' ? 'bg-blue-500 text-white scale-95' : 'bg-white/5 hover:bg-white/15 text-blue-300'
                  }`}
                >
                  🎵 Jingle
                </button>
                <button
                  onClick={() => triggerLiveSFX('cheer', playCheer)}
                  className={`p-2 rounded-xl text-center text-xs font-semibold transition-all ${
                    activeSFX === 'cheer' ? 'bg-emerald-500 text-black scale-95' : 'bg-white/5 hover:bg-white/15 text-emerald-300'
                  }`}
                >
                  👏 Cheer
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Live Scrolling Transcript (7 cols) */}
          <div className="lg:col-span-7 flex flex-col h-full bg-[#0b0b10]">
            <div className="p-4 border-b border-white/5 bg-[#101017] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-400 uppercase">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>LIVE SCRIPT TRANSCRIPT</span>
              </div>
              <span className="text-xs text-neutral-500 font-mono">
                {currentSegmentIdx + 1} / {show.segments.length} TURNS
              </span>
            </div>

            {/* Scrolling Transcript */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {show.segments.map((seg, idx) => {
                const isActive = idx === currentSegmentIdx;
                return (
                  <div
                    key={seg.id || idx}
                    ref={(el) => (segmentRefs.current[idx] = el)}
                    onClick={() => {
                      setCurrentSegmentIdx(idx);
                      setIsPlaying(true);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#181826] border-cyan-500/50 shadow-lg ring-1 ring-cyan-500/20'
                        : 'bg-[#111118] border-white/5 hover:border-white/15 hover:bg-[#151520]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-extrabold ${
                            seg.speaker === 'host1'
                              ? 'text-blue-400'
                              : seg.speaker === 'host2'
                              ? 'text-purple-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {seg.speakerName}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {seg.speakerRole}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {seg.sfxCue && (
                          <span className="text-[9px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                            🔊 {seg.sfxCue}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-neutral-500 bg-white/5 px-2 py-0.5 rounded">
                          {seg.timestamp}
                        </span>
                      </div>
                    </div>
                    <p
                      className={`text-sm leading-relaxed ${
                        isActive ? 'text-white font-medium' : 'text-neutral-300'
                      }`}
                    >
                      {seg.text}
                    </p>
                  </div>
                );
              })}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        </div>

        {/* Bottom Audio Broadcast Controls Bar */}
        <div className="p-4 border-t border-white/10 bg-[#12121c] flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Progress & Speed */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleRestart}
              className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-neutral-300 transition-colors"
              title="Restart Broadcast"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleSkipBack}
              className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-neutral-300 transition-colors"
              title="Previous Turn"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="w-12 h-12 rounded-full bg-white text-black hover:bg-neutral-200 flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-black" />
              ) : (
                <Play className="w-6 h-6 fill-black ml-0.5" />
              )}
            </button>

            <button
              onClick={handleSkipForward}
              className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-neutral-300 transition-colors"
              title="Next Turn"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Speed Selector */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5 text-[10px] font-mono font-bold">
              {[1.0, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-0.5 rounded-full transition-colors ${
                    playbackSpeed === speed
                      ? 'bg-cyan-500 text-black font-extrabold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Currently Playing Status Indicator */}
          <div className="text-center sm:text-right text-xs font-mono">
            <div className="text-neutral-400 flex items-center gap-2 justify-center sm:justify-end">
              <span>CURRENT SPEAKER:</span>
              <span className="text-cyan-300 font-bold uppercase">
                {currentSegment.speakerName}
              </span>
            </div>
            <div className="text-[10px] text-neutral-500 mt-0.5">
              BROADCAST TIMING: {currentSegment.timestamp}
            </div>
          </div>
        </div>
      </div>

      {/* Car Play Fullscreen Dashboard Mode */}
      {showCarMode && (
        <CarModeModal show={show} onClose={() => setShowCarMode(false)} />
      )}

      {/* Connect to Radio & Car Studio Hub Modal */}
      {showConnectModal && (
        <ConnectRadioModal show={show} onClose={() => setShowConnectModal(false)} />
      )}
    </div>
  );
};
