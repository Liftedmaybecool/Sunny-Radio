import React, { useState, useEffect } from 'react';
import { Sliders, Plus, Upload, Music } from 'lucide-react';
import { SoundboardModal } from './SoundboardModal';
import {
  SoundEffect,
  PRESET_SOUNDS,
  loadSavedCustomSounds,
} from '../utils/soundLibrary';

interface SoundboardToolbarProps {
  onOpenLiveStudio?: () => void;
}

export const SoundboardToolbar: React.FC<SoundboardToolbarProps> = ({ onOpenLiveStudio }) => {
  const [activeBtn, setActiveBtn] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [customSounds, setCustomSounds] = useState<SoundEffect[]>([]);
  const [pinnedSoundIds, setPinnedSoundIds] = useState<string[]>([
    'airhorn',
    'scratch',
    'jingle',
    'cheer',
  ]);

  useEffect(() => {
    loadSavedCustomSounds().then((sounds) => {
      setCustomSounds(sounds);
    });
  }, [showModal]);

  const allSounds: SoundEffect[] = [...PRESET_SOUNDS, ...customSounds];

  const triggerFX = (sound: SoundEffect) => {
    setActiveBtn(sound.id);
    sound.play();
    setTimeout(() => setActiveBtn(null), 300);
  };

  const handleTogglePin = (id: string) => {
    setPinnedSoundIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const pinnedSounds = allSounds.filter((s) => pinnedSoundIds.includes(s.id));

  return (
    <div className="flex flex-col items-center mb-10">
      <div className="inline-flex items-center gap-3 sm:gap-5 bg-[#0b0b12]/95 border border-white/10 rounded-full px-4 py-2.5 sm:px-6 sm:py-3 shadow-2xl backdrop-blur-md max-w-full overflow-x-auto">
        {/* On Air Studio Live Mic Booth Button */}
        <button
          id="open-live-studio-btn"
          onClick={onOpenLiveStudio}
          className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-400 font-mono text-xs font-bold tracking-wider uppercase transition-all duration-200 hover:scale-105 active:scale-95 shrink-0 shadow-lg shadow-red-500/10 cursor-pointer"
          title="Open Live Radio Studio with Microphone, FX, Beds & Recorder"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-pulse" />
          <span className="whitespace-nowrap">🎙️ ON AIR STUDIO</span>
        </button>

        {/* Pinned Soundboard FX Pills */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {pinnedSounds.map((sound) => {
            const isActive = activeBtn === sound.id;
            return (
              <button
                key={sound.id}
                id={`fx-${sound.id}-btn`}
                onClick={() => triggerFX(sound)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-150 border whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-400 text-black scale-95 shadow-lg shadow-amber-500/50 border-transparent'
                    : sound.color
                }`}
              >
                <span className="text-sm">{sound.emoji}</span>
                <span>{sound.name}</span>
              </button>
            );
          })}

          {/* "+ 600 FX & MP4 Custom" Modal Trigger */}
          <button
            id="open-soundboard-modal-btn"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-cyan-500/20 hover:from-amber-500/30 hover:to-cyan-500/30 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
            title="Open Full 600+ FX Soundboard & Import Custom MP4 Video or Audio"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>+ 600 FX & IMPORTS</span>
          </button>
        </div>
      </div>

      {/* Soundboard Modal */}
      <SoundboardModal
        show={showModal}
        onClose={() => setShowModal(false)}
        pinnedSoundIds={pinnedSoundIds}
        onTogglePin={handleTogglePin}
      />
    </div>
  );
};
