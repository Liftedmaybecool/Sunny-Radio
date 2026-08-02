// Parametric sound specification data generator for 500+ Web Audio procedural sounds

export interface ParametricSoundSpec {
  id: string;
  name: string;
  emoji: string;
  category:
    | 'Studio FX'
    | 'DJ Drops'
    | 'Comedy'
    | 'Percussion'
    | 'Sci-Fi' | 'Memes'
    | 'Musical Tones'
    | 'Nature & Elements'
    | 'Retro Gaming'
    | 'UI & Digital';
  color?: string;
  freq?: number;
  freqEnd?: number;
  type?: OscillatorType | 'noise' | 'fm' | 'chord' | 'arpeggio';
  duration?: number;
  attack?: number;
  decay?: number;
  notes?: number[];
  filterType?: BiquadFilterType;
  filterFreq?: number;
  filterEnd?: number;
  lfoFreq?: number;
  lfoDepth?: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Studio FX': 'text-amber-400 border-amber-400/30 bg-amber-950/20',
  'DJ Drops': 'text-cyan-400 border-cyan-400/30 bg-cyan-950/20',
  'Comedy': 'text-yellow-400 border-yellow-400/30 bg-yellow-950/20',
  'Percussion': 'text-rose-400 border-rose-400/30 bg-rose-950/20',
  'Sci-Fi': 'text-purple-400 border-purple-400/30 bg-purple-950/20',
  'Memes': 'text-emerald-400 border-emerald-400/30 bg-emerald-950/20',
  'Musical Tones': 'text-indigo-300 border-indigo-300/30 bg-indigo-950/20',
  'Nature & Elements': 'text-teal-300 border-teal-300/30 bg-teal-950/20',
  'Retro Gaming': 'text-fuchsia-400 border-fuchsia-400/30 bg-fuchsia-950/20',
  'UI & Digital': 'text-sky-300 border-sky-300/30 bg-sky-950/20',
};

// Helper note frequency calculation (A4 = 440Hz)
function noteToFreq(noteName: string, octave: number): number {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const semitonesFromA4 = notes.indexOf(noteName) - 9 + (octave - 4) * 12;
  return 440 * Math.pow(2, semitonesFromA4 / 12);
}

// Build 500+ procedural sound specs systematically
export function generate500SoundSpecs(): ParametricSoundSpec[] {
  const specs: ParametricSoundSpec[] = [];

  // ==========================================
  // 1. MUSICAL TONES (60 sounds: Piano, Synth, Organs, Harps)
  // ==========================================
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const pianoEmojis = ['🎹', '🎵', '🎼', '🎶', '💫'];
  
  // Piano Keys (C2 to B5)
  for (let oct = 2; oct <= 5; oct++) {
    for (const name of noteNames) {
      const freq = noteToFreq(name, oct);
      const isSharp = name.includes('#');
      specs.push({
        id: `piano_${name.replace('#', 's')}_${oct}`,
        name: `Piano Key ${name}${oct}`,
        emoji: isSharp ? '🎹' : '🎵',
        category: 'Musical Tones',
        type: 'triangle',
        freq,
        duration: 0.8,
        attack: 0.01,
        decay: 0.7,
        color: isSharp ? 'text-indigo-400 border-indigo-400/30 bg-indigo-950/20' : 'text-blue-300 border-blue-300/30 bg-blue-950/20',
      });
    }
  }

  // Synth Lead Stabs (12 notes)
  const synthNotes = ['C3', 'E3', 'G3', 'B3', 'C4', 'E4', 'G4', 'B4', 'C5', 'D5', 'E5', 'G5'];
  synthNotes.forEach((n, idx) => {
    const name = n.substring(0, n.length - 1);
    const oct = parseInt(n.substring(n.length - 1), 10);
    specs.push({
      id: `synth_stab_${n}`,
      name: `Neon Synth Lead ${n}`,
      emoji: '⚡',
      category: 'Musical Tones',
      type: 'sawtooth',
      freq: noteToFreq(name, oct),
      duration: 0.4,
      attack: 0.005,
      decay: 0.35,
      filterType: 'lowpass',
      filterFreq: 2400,
      filterEnd: 600,
    });
  });

  // Celestial Harp & Chords (12 chords)
  const chords: Array<{ name: string; notes: number[]; emoji: string }> = [
    { name: 'C Major 7th Chord', notes: [261.63, 329.63, 392.00, 493.88], emoji: '✨' },
    { name: 'A Minor 9th Chord', notes: [220.00, 261.63, 329.63, 392.00, 493.88], emoji: '🌌' },
    { name: 'F Lydian Sparkle', notes: [174.61, 220.00, 261.63, 329.63, 369.99], emoji: '🌟' },
    { name: 'G Sus4 Shimmer', notes: [196.00, 261.63, 293.66, 392.00], emoji: '🔮' },
    { name: 'E Dorian Harp', notes: [164.81, 196.00, 246.94, 293.66, 369.99], emoji: '🪕' },
    { name: 'D Major Sweep', notes: [146.83, 185.00, 220.00, 293.66], emoji: '🎶' },
    { name: 'B Minor Ambient', notes: [246.94, 293.66, 369.99, 440.00], emoji: '🪐' },
    { name: 'C Harmonic Minor', notes: [261.63, 311.13, 392.00, 493.88], emoji: '🎼' },
    { name: 'Eb Major Lush', notes: [155.56, 196.00, 233.08, 311.13], emoji: '💜' },
    { name: 'Ab Luminous Chord', notes: [207.65, 261.63, 311.13, 415.30], emoji: '💎' },
    { name: 'Glass Harp Arpeggio', notes: [523.25, 659.25, 783.99, 1046.50], emoji: '🍾' },
    { name: 'Tubular Bell Chime', notes: [440.00, 880.00, 1320.00], emoji: '🔔' },
  ];

  chords.forEach((c, idx) => {
    specs.push({
      id: `chord_${idx + 1}`,
      name: c.name,
      emoji: c.emoji,
      category: 'Musical Tones',
      type: idx % 2 === 0 ? 'arpeggio' : 'chord',
      notes: c.notes,
      duration: 0.9,
      attack: 0.02,
      decay: 0.85,
    });
  });

  // ==========================================
  // 2. RETRO GAMING & ARCADE (60 sounds)
  // ==========================================
  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `arcade_laser_${i}`,
      name: `Retro Laser Cannon #${i}`,
      emoji: '👾',
      category: 'Retro Gaming',
      type: 'sawtooth',
      freq: 1200 + i * 150,
      freqEnd: 80 + i * 20,
      duration: 0.15 + i * 0.01,
      attack: 0.002,
      decay: 0.14,
    });
  }

  for (let i = 1; i <= 8; i++) {
    specs.push({
      id: `8bit_jump_${i}`,
      name: `8-Bit Jump Sound #${i}`,
      emoji: '🕹️',
      category: 'Retro Gaming',
      type: 'square',
      freq: 120 + i * 40,
      freqEnd: 500 + i * 80,
      duration: 0.12,
      attack: 0.005,
      decay: 0.11,
    });
  }

  for (let i = 1; i <= 8; i++) {
    specs.push({
      id: `coin_sound_${i}`,
      name: `Pixel Coin Collect #${i}`,
      emoji: '🪙',
      category: 'Retro Gaming',
      type: 'arpeggio',
      notes: [400 + i * 50, 700 + i * 80, 1100 + i * 100],
      duration: 0.22,
    });
  }

  for (let i = 1; i <= 8; i++) {
    specs.push({
      id: `powerup_game_${i}`,
      name: `8-Bit Power Up #${i}`,
      emoji: '⚡',
      category: 'Retro Gaming',
      type: 'arpeggio',
      notes: [220 * i, 275 * i, 330 * i, 440 * i],
      duration: 0.35,
    });
  }

  for (let i = 1; i <= 6; i++) {
    specs.push({
      id: `boss_hit_${i}`,
      name: `Arcade Boss Hit #${i}`,
      emoji: '💥',
      category: 'Retro Gaming',
      type: 'fm',
      freq: 300 - i * 25,
      freqEnd: 40,
      lfoFreq: 60 + i * 10,
      lfoDepth: 250,
      duration: 0.3,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `retro_beep_${i}`,
      name: `Retro Console Beep #${i}`,
      emoji: '📟',
      category: 'Retro Gaming',
      type: 'square',
      freq: 300 + i * 120,
      duration: 0.08,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `game_combo_${i}`,
      name: `Combo Multiplier x${i}`,
      emoji: '🔥',
      category: 'Retro Gaming',
      type: 'arpeggio',
      notes: [300 + i * 40, 450 + i * 50, 600 + i * 60, 900 + i * 70],
      duration: 0.28,
    });
  }

  // ==========================================
  // 3. SCI-FI & CYBER (60 sounds)
  // ==========================================
  for (let i = 1; i <= 12; i++) {
    specs.push({
      id: `plasma_beam_${i}`,
      name: `Plasma Beam Fire #${i}`,
      emoji: '⚡',
      category: 'Sci-Fi',
      type: 'fm',
      freq: 1800 - i * 80,
      freqEnd: 150,
      lfoFreq: 120 + i * 15,
      lfoDepth: 400,
      duration: 0.2,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `teleport_beam_${i}`,
      name: `Warp Teleport #${i}`,
      emoji: '✨',
      category: 'Sci-Fi',
      type: 'sawtooth',
      freq: 100 + i * 100,
      freqEnd: 2400 + i * 100,
      duration: 0.45,
      lfoFreq: 15,
      lfoDepth: 80,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `cyber_glitch_${i}`,
      name: `Cyber Matrix Glitch #${i}`,
      emoji: '👾',
      category: 'Sci-Fi',
      type: 'fm',
      freq: 800 + i * 150,
      freqEnd: 200,
      lfoFreq: 300 + i * 40,
      lfoDepth: 800,
      duration: 0.18,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `robot_chime_${i}`,
      name: `Android Bleep Dialogue #${i}`,
      emoji: '🤖',
      category: 'Sci-Fi',
      type: 'sine',
      freq: 600 + (i % 3) * 400,
      freqEnd: 1200,
      duration: 0.1,
      lfoFreq: 40,
      lfoDepth: 100,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `space_shield_${i}`,
      name: `Space Shield Deflect #${i}`,
      emoji: '🛡️',
      category: 'Sci-Fi',
      type: 'triangle',
      freq: 800 + i * 100,
      freqEnd: 1800 - i * 50,
      duration: 0.25,
      filterType: 'bandpass',
      filterFreq: 1500,
    });
  }

  for (let i = 1; i <= 8; i++) {
    specs.push({
      id: `warp_engine_${i}`,
      name: `Hyperdrive Pulse #${i}`,
      emoji: '🚀',
      category: 'Sci-Fi',
      type: 'sawtooth',
      freq: 60 + i * 15,
      freqEnd: 800 + i * 100,
      duration: 0.6,
      attack: 0.05,
      decay: 0.55,
    });
  }

  // ==========================================
  // 4. STUDIO & BROADCAST FX (60 sounds)
  // ==========================================
  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `airhorn_variant_${i}`,
      name: `Airhorn Pulse Heavy #${i}`,
      emoji: '📢',
      category: 'Studio FX',
      type: 'sawtooth',
      freq: 380 + i * 15,
      duration: 0.45,
      lfoFreq: 8,
      lfoDepth: 15,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `broadcast_beep_${i}`,
      name: `Studio Radio Beep #${i}`,
      emoji: '📻',
      category: 'Studio FX',
      type: 'sine',
      freq: 800 + i * 100,
      duration: 0.15,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `telephone_ring_${i}`,
      name: `Telephone Ring Stinger #${i}`,
      emoji: '☎️',
      category: 'Studio FX',
      type: 'chord',
      notes: [440 + i * 20, 480 + i * 20],
      duration: 0.35,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `camera_flash_${i}`,
      name: `Paparazzi Camera Flash #${i}`,
      emoji: '📸',
      category: 'Studio FX',
      type: 'noise',
      filterType: 'highpass',
      filterFreq: 2000 + i * 300,
      duration: 0.05,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `walkie_talkie_${i}`,
      name: `Walkie Talkie Squelch #${i}`,
      emoji: '📻',
      category: 'Studio FX',
      type: 'noise',
      filterType: 'bandpass',
      filterFreq: 1200 + i * 100,
      duration: 0.12,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `news_chime_${i}`,
      name: `Breaking News Cue #${i}`,
      emoji: '📺',
      category: 'Studio FX',
      type: 'arpeggio',
      notes: [300 + i * 30, 450 + i * 30, 600 + i * 30, 900 + i * 30],
      duration: 0.4,
    });
  }

  // ==========================================
  // 5. DJ DROPS & EDM (60 sounds)
  // ==========================================
  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `sub_bass_drop_${i}`,
      name: `Sub Bass Wobble Drop #${i}`,
      emoji: '🔊',
      category: 'DJ Drops',
      type: 'sine',
      freq: 150 + i * 10,
      freqEnd: 20,
      duration: 0.8 + i * 0.1,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `dj_scratch_${i}`,
      name: `Vinyl Scratch Sweep #${i}`,
      emoji: '🎚️',
      category: 'DJ Drops',
      type: 'sawtooth',
      freq: 200 + i * 80,
      freqEnd: 1800 + i * 100,
      duration: 0.2,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `dubstep_wobble_${i}`,
      name: `Dubstep LFO Wobble #${i}`,
      emoji: '🎛️',
      category: 'DJ Drops',
      type: 'sawtooth',
      freq: 100 + i * 15,
      duration: 0.5,
      lfoFreq: 6 + i * 2,
      lfoDepth: 80,
      filterType: 'lowpass',
      filterFreq: 1000,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `bass_cannon_${i}`,
      name: `Bass Cannon Impact #${i}`,
      emoji: '💣',
      category: 'DJ Drops',
      type: 'fm',
      freq: 220,
      freqEnd: 25,
      lfoFreq: 80,
      lfoDepth: 400,
      duration: 0.7,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `riser_sweep_${i}`,
      name: `EDM Filter Riser #${i}`,
      emoji: '📈',
      category: 'DJ Drops',
      type: 'sawtooth',
      freq: 80 + i * 20,
      freqEnd: 2200 + i * 100,
      duration: 0.9,
      filterType: 'lowpass',
      filterFreq: 200,
      filterEnd: 5000,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `impact_hit_${i}`,
      name: `Cinema Trailer Impact #${i}`,
      emoji: '💥',
      category: 'DJ Drops',
      type: 'noise',
      filterType: 'lowpass',
      filterFreq: 800 - i * 50,
      filterEnd: 30,
      duration: 0.8,
    });
  }

  // ==========================================
  // 6. PERCUSSION & DRUMS (60 sounds)
  // ==========================================
  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `kick_drum_${i}`,
      name: `Punchy Kick Drum #${i}`,
      emoji: '🥁',
      category: 'Percussion',
      type: 'sine',
      freq: 160 + i * 15,
      freqEnd: 30,
      duration: 0.18,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `snare_snap_${i}`,
      name: `Studio Snare Crack #${i}`,
      emoji: '💥',
      category: 'Percussion',
      type: 'noise',
      filterType: 'highpass',
      filterFreq: 800 + i * 100,
      duration: 0.15,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `hihat_tick_${i}`,
      name: `Closed Hi-Hat Tick #${i}`,
      emoji: '📀',
      category: 'Percussion',
      type: 'noise',
      filterType: 'highpass',
      filterFreq: 5000 + i * 400,
      duration: 0.04,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `tom_drum_${i}`,
      name: `Tom Drum Hit #${i}`,
      emoji: '🪘',
      category: 'Percussion',
      type: 'sine',
      freq: 300 - i * 20,
      freqEnd: 60 - i * 3,
      duration: 0.25,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `cowbell_hit_${i}`,
      name: `Funk Cowbell Stinger #${i}`,
      emoji: '🐮',
      category: 'Percussion',
      type: 'triangle',
      freq: 540 + i * 30,
      duration: 0.18,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `anvil_strike_${i}`,
      name: `Steel Anvil Clang #${i}`,
      emoji: '🔨',
      category: 'Percussion',
      type: 'chord',
      notes: [1200 + i * 50, 2200 + i * 80],
      duration: 0.4,
    });
  }

  // ==========================================
  // 7. COMEDY & CARTOON (60 sounds)
  // ==========================================
  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `vine_boom_var_${i}`,
      name: `Vine Boom Thump #${i}`,
      emoji: '🗿',
      category: 'Comedy',
      type: 'sine',
      freq: 140 + i * 10,
      freqEnd: 25,
      duration: 0.7,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `bruh_tone_${i}`,
      name: `Bruh Sound Tone #${i}`,
      emoji: '🗿',
      category: 'Comedy',
      type: 'sawtooth',
      freq: 180 - i * 8,
      freqEnd: 80 - i * 4,
      duration: 0.45,
      filterType: 'lowpass',
      filterFreq: 500,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `metal_pipe_${i}`,
      name: `Metal Pipe Clutter #${i}`,
      emoji: '🦯',
      category: 'Comedy',
      type: 'chord',
      notes: [1100 + i * 40, 1700 + i * 60, 2300 + i * 80],
      duration: 0.5,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `cartoon_boing_${i}`,
      name: `Cartoon Spring Boing #${i}`,
      emoji: '🌀',
      category: 'Comedy',
      type: 'sine',
      freq: 150 + i * 20,
      freqEnd: 600 + i * 50,
      duration: 0.35,
      lfoFreq: 25,
      lfoDepth: 60,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `duck_squeak_${i}`,
      name: `Rubber Duck Squeak #${i}`,
      emoji: '🐥',
      category: 'Comedy',
      type: 'sine',
      freq: 1000 + i * 80,
      freqEnd: 1800 + i * 100,
      duration: 0.18,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `quack_honk_${i}`,
      name: `Comedy Honk Quack #${i}`,
      emoji: '🦆',
      category: 'Comedy',
      type: 'sawtooth',
      freq: 300 + i * 25,
      freqEnd: 180,
      duration: 0.22,
    });
  }

  // ==========================================
  // 8. NATURE & ELEMENTS (60 sounds)
  // ==========================================
  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `thunder_strike_${i}`,
      name: `Storm Thunder Strike #${i}`,
      emoji: '⚡',
      category: 'Nature & Elements',
      type: 'noise',
      filterType: 'lowpass',
      filterFreq: 500 - i * 30,
      filterEnd: 40,
      duration: 1.1,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `wind_gust_${i}`,
      name: `Wind Gust Howl #${i}`,
      emoji: '🌬️',
      category: 'Nature & Elements',
      type: 'noise',
      filterType: 'bandpass',
      filterFreq: 400 + i * 80,
      filterEnd: 150,
      duration: 0.9,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `water_drop_${i}`,
      name: `Water Droplet Pop #${i}`,
      emoji: '💧',
      category: 'Nature & Elements',
      type: 'sine',
      freq: 400 + i * 100,
      freqEnd: 1500 + i * 150,
      duration: 0.08,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `fire_crackle_${i}`,
      name: `Campfire Crackle #${i}`,
      emoji: '🔥',
      category: 'Nature & Elements',
      type: 'noise',
      filterType: 'highpass',
      filterFreq: 2500 + i * 200,
      duration: 0.15,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `ocean_wave_${i}`,
      name: `Ocean Wave Crash #${i}`,
      emoji: '🌊',
      category: 'Nature & Elements',
      type: 'noise',
      filterType: 'lowpass',
      filterFreq: 1200 - i * 60,
      filterEnd: 100,
      duration: 1.2,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `cricket_chirp_${i}`,
      name: `Night Cricket Chirp #${i}`,
      emoji: '🦗',
      category: 'Nature & Elements',
      type: 'sine',
      freq: 4500 + i * 200,
      duration: 0.06,
    });
  }

  // ==========================================
  // 9. UI & DIGITAL (60 sounds)
  // ==========================================
  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `click_clack_${i}`,
      name: `Mechanical Key Tap #${i}`,
      emoji: '⌨️',
      category: 'UI & Digital',
      type: 'triangle',
      freq: 2800 + i * 150,
      freqEnd: 300,
      duration: 0.02,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `notification_pop_${i}`,
      name: `Digital Notif Pop #${i}`,
      emoji: '🔔',
      category: 'UI & Digital',
      type: 'arpeggio',
      notes: [500 + i * 50, 800 + i * 80],
      duration: 0.15,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `success_chime_${i}`,
      name: `App Success Ping #${i}`,
      emoji: '✅',
      category: 'UI & Digital',
      type: 'arpeggio',
      notes: [400 + i * 40, 600 + i * 50, 900 + i * 60],
      duration: 0.22,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `error_buzz_${i}`,
      name: `System Error Buzz #${i}`,
      emoji: '❌',
      category: 'UI & Digital',
      type: 'sawtooth',
      freq: 150 + i * 10,
      duration: 0.2,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `scanner_beep_${i}`,
      name: `Barcode Scan Beep #${i}`,
      emoji: '🏷️',
      category: 'UI & Digital',
      type: 'sine',
      freq: 2200 + i * 100,
      duration: 0.06,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `touch_click_${i}`,
      name: `Haptic Screen Tap #${i}`,
      emoji: '📱',
      category: 'UI & Digital',
      type: 'sine',
      freq: 1200 + i * 80,
      duration: 0.02,
    });
  }

  // ==========================================
  // 10. MEMES, WEAPONS & ACTION (60 sounds)
  // ==========================================
  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `sword_slash_${i}`,
      name: `Steel Sword Slash #${i}`,
      emoji: '⚔️',
      category: 'Memes',
      type: 'noise',
      filterType: 'highpass',
      filterFreq: 2500 + i * 300,
      filterEnd: 7000,
      duration: 0.18,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `explosion_blast_${i}`,
      name: `Detonation Boom #${i}`,
      emoji: '💣',
      category: 'Memes',
      type: 'noise',
      filterType: 'lowpass',
      filterFreq: 800 - i * 40,
      filterEnd: 20,
      duration: 0.9,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `magic_wand_${i}`,
      name: `Magic Spell Sparkle #${i}`,
      emoji: '🪄',
      category: 'Memes',
      type: 'arpeggio',
      notes: [1000 + i * 50, 1400 + i * 60, 1800 + i * 70, 2400 + i * 80],
      duration: 0.35,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `fireball_launch_${i}`,
      name: `Fireball Spell Launch #${i}`,
      emoji: '🔥',
      category: 'Memes',
      type: 'fm',
      freq: 600 + i * 50,
      freqEnd: 100,
      lfoFreq: 80,
      lfoDepth: 300,
      duration: 0.4,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `victory_horn_${i}`,
      name: `Victory Trophy Fanfare #${i}`,
      emoji: '🏆',
      category: 'Memes',
      type: 'arpeggio',
      notes: [261.63, 329.63, 392.00, 523.25 + i * 20],
      duration: 0.5,
    });
  }

  for (let i = 1; i <= 10; i++) {
    specs.push({
      id: `crowd_cheer_${i}`,
      name: `Crowd Applause Burst #${i}`,
      emoji: '👏',
      category: 'Memes',
      type: 'noise',
      filterType: 'bandpass',
      filterFreq: 1400 + i * 100,
      duration: 0.6,
    });
  }

  // Ensure every spec has a valid fallback color
  specs.forEach((s) => {
    if (!s.color) {
      s.color = CATEGORY_COLORS[s.category] || 'text-cyan-300 border-cyan-300/30 bg-cyan-950/20';
    }
  });

  return specs;
}
