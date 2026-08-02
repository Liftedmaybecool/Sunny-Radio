import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Search,
  Upload,
  Volume2,
  Trash2,
  Sparkles,
  Music,
  Sliders,
  Play,
  Check,
  Zap,
} from 'lucide-react';
import {
  SoundEffect,
  PRESET_SOUNDS,
  registerCustomAudioFile,
  loadSavedCustomSounds,
  deleteCustomSoundFromDB,
} from '../utils/soundLibrary';

interface SoundboardModalProps {
  show: boolean;
  onClose: () => void;
  onSelectSound?: (sound: SoundEffect) => void;
  pinnedSoundIds?: string[];
  onTogglePin?: (id: string) => void;
}

export const SoundboardModal: React.FC<SoundboardModalProps> = ({
  show,
  onClose,
  onSelectSound,
  pinnedSoundIds = ['airhorn', 'scratch', 'jingle', 'cheer'],
  onTogglePin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [customSounds, setCustomSounds] = useState<SoundEffect[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load custom sounds from IndexedDB on open
  useEffect(() => {
    if (show) {
      loadSavedCustomSounds().then((sounds) => {
        setCustomSounds(sounds);
      });
    }
  }, [show]);

  if (!show) return null;

  const allSounds: SoundEffect[] = [...PRESET_SOUNDS, ...customSounds];

  const presetCategories = Array.from(new Set(PRESET_SOUNDS.map((s) => s.category)));
  const categories = ['All', ...presetCategories, 'Custom Imports'];

  const filteredSounds = allSounds.filter((sound) => {
    const matchesCategory =
      selectedCategory === 'All' || sound.category === selectedCategory;
    const matchesSearch =
      sound.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sound.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePlaySound = (sound: SoundEffect) => {
    setActiveSoundId(sound.id);
    sound.play();
    onSelectSound?.(sound);
    setTimeout(() => {
      setActiveSoundId(null);
    }, 400);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const newCustoms: SoundEffect[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (
          file.type.startsWith('audio/') ||
          file.type.startsWith('video/') ||
          file.name.match(/\.(mp3|wav|ogg|m4a|flac|aac|mp4|webm|mov|mkv)$/i)
        ) {
          const sound = await registerCustomAudioFile(file);
          newCustoms.push(sound);
        }
      }
      setCustomSounds((prev) => [...prev, ...newCustoms]);
      setSelectedCategory('Custom Imports');
    } catch (err) {
      console.error('Failed to import audio files', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCustomSound = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteCustomSoundFromDB(id);
    setCustomSounds((prev) => prev.filter((s) => s.id !== id));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-[#0b0c10] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#12141c] border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-500/30 text-amber-400">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-wide">
                  STUDIO SOUNDBOARD LIBRARY
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {allSounds.length} FX Available
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Trigger 600+ procedural radio stings or import custom MP4, MP3, WAV & Video files from your laptop.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search, Upload & Category Controls */}
        <div className="p-6 bg-[#0f1118] border-b border-white/5 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search 600+ sounds, airhorns, drops, comedy, sci-fi, memes, FX..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#161822] border border-white/10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Custom Import Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'IMPORTING...' : 'IMPORT MP4 / MP3 / WAV'}</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e.target.files)}
              accept="audio/*,video/*,.mp3,.wav,.ogg,.m4a,.flac,.aac,.mp4,.webm,.mov,.mkv"
              multiple
              className="hidden"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const count =
                cat === 'All'
                  ? allSounds.length
                  : allSounds.filter((s) => s.category === cat).length;
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    active
                      ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20 scale-105'
                      : 'bg-[#141620] text-neutral-400 hover:text-white hover:bg-white/10 border-white/10'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      active ? 'bg-black/20 text-black' : 'bg-white/10 text-neutral-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`mx-6 mt-4 p-3 rounded-xl border-2 border-dashed transition-all ${
            dragActive
              ? 'border-cyan-400 bg-cyan-500/10'
              : 'border-white/10 hover:border-cyan-500/30 bg-[#12141c]/50'
          }`}
        >
          <div className="flex items-center justify-center gap-3 text-xs text-neutral-400">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>
              Drag & drop audio or video files (MP4, MP3, WAV, M4A, WEBM, MOV) from your laptop to add custom studio FX
            </span>
          </div>
        </div>

        {/* Sound Effects Grid */}
        <div className="flex-1 p-6 overflow-y-auto min-h-[320px] max-h-[50vh]">
          {filteredSounds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-400">
              <Volume2 className="w-12 h-12 mb-3 text-neutral-600" />
              <p className="text-sm font-semibold text-white">No sound effects match your search</p>
              <p className="text-xs text-neutral-500 mt-1">Try another search term or import your own audio files.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredSounds.map((sound) => {
                const isActive = activeSoundId === sound.id;
                const isPinned = pinnedSoundIds.includes(sound.id);
                return (
                  <div
                    key={sound.id}
                    onClick={() => handlePlaySound(sound)}
                    className={`relative group flex flex-col justify-between p-3.5 rounded-xl border cursor-pointer select-none transition-all duration-150 ${
                      isActive
                        ? 'scale-95 ring-2 ring-amber-400 shadow-xl bg-amber-500/20 border-amber-400'
                        : `${sound.color} hover:scale-[1.02] hover:shadow-lg hover:border-white/30`
                    }`}
                  >
                    {/* Top Row: Category Tag & Actions */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                        {sound.category}
                      </span>
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        {/* Pin Button */}
                        {onTogglePin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTogglePin(sound.id);
                            }}
                            className={`p-1 rounded hover:bg-white/20 text-xs transition-colors ${
                              isPinned ? 'text-amber-400' : 'text-neutral-500 hover:text-white'
                            }`}
                            title={isPinned ? 'Unpin from On-Air Toolbar' : 'Pin to On-Air Toolbar'}
                          >
                            <Zap className="w-3 h-3 fill-current" />
                          </button>
                        )}
                        {/* Custom Sound Delete Button */}
                        {sound.isCustom && (
                          <button
                            onClick={(e) => handleDeleteCustomSound(e, sound.id)}
                            className="p-1 rounded hover:bg-red-500/30 text-neutral-400 hover:text-red-400 transition-colors"
                            title="Delete custom sound"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Middle: Emoji & Sound Name */}
                    <div className="flex items-center gap-2.5 my-1">
                      <span className="text-2xl transition-transform group-hover:scale-125">
                        {sound.emoji}
                      </span>
                      <span className="text-xs font-bold leading-tight line-clamp-2 text-white">
                        {sound.name}
                      </span>
                    </div>

                    {/* Bottom Play Trigger Indicator */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] opacity-75">
                      <span className="flex items-center gap-1">
                        <Play className="w-2.5 h-2.5 fill-current" /> Play FX
                      </span>
                      {isActive && <span className="font-mono text-amber-300 font-bold animate-pulse">PLAYING</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3 bg-[#12141c] border-t border-white/10 text-xs text-neutral-400 gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Click any sound to test or inject live into your radio broadcast stream.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
