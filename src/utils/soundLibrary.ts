// Comprehensive Soundboard Engine: 600+ Procedural Web Audio FX + Custom Audio File Importer
import { generate500SoundSpecs, ParametricSoundSpec } from './soundSpecsData';

export interface SoundEffect {
  id: string;
  name: string;
  emoji: string;
  category: string;
  color: string; // Tailwind color class or hex
  isCustom?: boolean;
  audioUrl?: string; // For uploaded custom files
  play: () => void;
}

// Global AudioContext Singleton
let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Custom Audio Buffer Cache for uploaded files
const customAudioBuffers: Map<string, AudioBuffer> = new Map();
const customAudioDataUrls: Map<string, string> = new Map();

// IndexedDB persistence for Custom Sounds
const DB_NAME = 'AIStudioRadioSoundboard';
const STORE_NAME = 'custom_sounds';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveCustomSoundToDB(id: string, name: string, emoji: string, dataUrl: string) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ id, name, emoji, dataUrl, createdAt: Date.now() });
  } catch (err) {
    console.error('Failed to save custom sound to DB', err);
  }
}

export async function loadCustomSoundsFromDB(): Promise<Array<{ id: string; name: string; emoji: string; dataUrl: string }>> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch (err) {
    console.error('Failed to load custom sounds from DB', err);
    return [];
  }
}

export async function deleteCustomSoundFromDB(id: string) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    customAudioBuffers.delete(id);
    customAudioDataUrls.delete(id);
  } catch (err) {
    console.error('Failed to delete custom sound from DB', err);
  }
}

// Custom Audio File Player
export function playCustomAudio(id: string) {
  try {
    const ctx = getAudioContext();
    const buffer = customAudioBuffers.get(id);
    if (buffer) {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      return;
    }

    // Fallback HTML5 Audio element
    const dataUrl = customAudioDataUrls.get(id);
    if (dataUrl) {
      const audio = new Audio(dataUrl);
      audio.play().catch(console.error);
    }
  } catch (err) {
    console.error(`Failed to play custom audio sound ${id}`, err);
  }
}

// ----------------------------------------------------------------------
// PROCEDURAL AUDIO SYNTHESIZERS (50+ Sounds)
// ----------------------------------------------------------------------

// 1. Airhorn
export const playAirhorn = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [280, 370, 470].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.95, now + 0.35);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    });
  } catch (e) { console.error(e); }
};

// 2. Vinyl Scratch
export const playScratch = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const dur = 0.22;
    const bufSize = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 4;
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.1);
    filter.frequency.exponentialRampToValueAtTime(600, now + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);
  } catch (e) { console.error(e); }
};

// 3. Radio Jingle
export const playJingle = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const t = now + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.42);
    });
  } catch (e) { console.error(e); }
};

// 4. Cheer / Applause
export const playCheer = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const dur = 1.2;
    const bufSize = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      const env = Math.sin((i / bufSize) * Math.PI);
      data[i] = (Math.random() > 0.94 ? 1.8 : 0.4) * (Math.random() * 2 - 1) * env;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);
  } catch (e) { console.error(e); }
};

// 5. News Teletype Flash
export const playNewsFlash = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const t = now + i * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200 + i * 200, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.06);
    }
  } catch (e) { console.error(e); }
};

// 6. Sub Bass Drop
export const playSubDrop = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 1.2);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.25);
  } catch (e) { console.error(e); }
};

// 7. Rewind Spin
export const playRewind = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const dur = 0.5;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + dur);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur);
  } catch (e) { console.error(e); }
};

// 8. Explosion Punch
export const playExplosion = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const dur = 0.8;
    const bufSize = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(40, now + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);
  } catch (e) { console.error(e); }
};

// 9. Rimshot (Ba-dum-tss)
export const playRimshot = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // Hit 1: Drum 1
    let osc = ctx.createOscillator();
    let gain = ctx.createGain();
    osc.frequency.setValueAtTime(160, now);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.1);

    // Hit 2: Drum 2 (0.12s later)
    osc = ctx.createOscillator();
    gain = ctx.createGain();
    osc.frequency.setValueAtTime(180, now + 0.12);
    gain.gain.setValueAtTime(0.3, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now + 0.12); osc.stop(now + 0.22);

    // Hit 3: Cymbal Tss (0.26s later)
    const bufSize = ctx.sampleRate * 0.3;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 5000;
    const cGain = ctx.createGain();
    cGain.gain.setValueAtTime(0.3, now + 0.26);
    cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    noise.connect(filter); filter.connect(cGain); cGain.connect(ctx.destination);
    noise.start(now + 0.26);
  } catch (e) { console.error(e); }
};

// 10. Sad Trombone (Womp Womp Womp Womppp)
export const playSadTrombone = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [
      { f: 293.66, t: 0 },
      { f: 277.18, t: 0.3 },
      { f: 261.63, t: 0.6 },
      { f: 246.94, t: 0.9, bend: true }
    ];
    notes.forEach((n) => {
      const startTime = now + n.t;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(n.f, startTime);
      if (n.bend) {
        osc.frequency.exponentialRampToValueAtTime(190, startTime + 0.7);
      }
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + (n.bend ? 0.75 : 0.28));
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(startTime); osc.stop(startTime + (n.bend ? 0.75 : 0.29));
    });
  } catch (e) { console.error(e); }
};

// 11. Cash Register Cha-Ching
export const playCashRegister = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // Bell ring + coin slide
    [1500, 2200, 3100].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.5);
    });
  } catch (e) { console.error(e); }
};

// 12. Correct Answer Ding
export const playCorrectDing = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [1046.50, 1318.51].forEach((freq, idx) => {
      const t = now + idx * 0.1;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.4);
    });
  } catch (e) { console.error(e); }
};

// 13. Wrong Buzzer
export const playWrongBuzzer = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.4);
  } catch (e) { console.error(e); }
};

// 14. Cartoon Boing Spring
export const playBoing = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.35);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.36);
  } catch (e) { console.error(e); }
};

// 15. Laser Cannon
export const playLaser = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1600, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.16);
  } catch (e) { console.error(e); }
};

// 16. Power Up Chime
export const playPowerUp = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [220, 277, 330, 440, 554, 659, 880].forEach((freq, idx) => {
      const t = now + idx * 0.05;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.11);
    });
  } catch (e) { console.error(e); }
};

// 17. Power Down Glitch
export const playPowerDown = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.5);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.5);
  } catch (e) { console.error(e); }
};

// 18. Whoosh Transit
export const playWhoosh = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const dur = 0.35;
    const bufSize = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 2;
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(1800, now + dur * 0.5);
    filter.frequency.exponentialRampToValueAtTime(100, now + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.4, now + dur * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    src.start(now);
  } catch (e) { console.error(e); }
};

// 19. Foghorn Ship Blast
export const playFoghorn = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [65, 80, 130].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 1.15);
    });
  } catch (e) { console.error(e); }
};

// 20. Police Siren Wail
export const playSiren = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(1200, now + 0.4);
    osc.frequency.linearRampToValueAtTime(600, now + 0.8);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.85);
  } catch (e) { console.error(e); }
};

// 21. Crowd Boo
export const playBoo = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const dur = 1.0;
    const bufSize = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    src.start(now);
  } catch (e) { console.error(e); }
};

// 22. Gong Strike
export const playGong = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [110, 215, 312, 480].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 1.8);
    });
  } catch (e) { console.error(e); }
};

// 23. Record Stop (Slow Pitch Drop)
export const playRecordStop = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.6);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.65);
  } catch (e) { console.error(e); }
};

// 24. Kick Drum
export const playKick = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.13);
  } catch (e) { console.error(e); }
};

// 25. Snare Snap
export const playSnare = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const dur = 0.15;
    const bufSize = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    noise.start(now);
  } catch (e) { console.error(e); }
};

// 26. Cowbell
export const playCowbell = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [560, 845].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.25);
    });
  } catch (e) { console.error(e); }
};

// 27. Finger Snap
export const playFingerSnap = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const dur = 0.05;
    const bufSize = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2500;
    filter.Q.value = 3;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    noise.start(now);
  } catch (e) { console.error(e); }
};

// 28. Slide Whistle Up
export const playSlideWhistleUp = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.41);
  } catch (e) { console.error(e); }
};

// 29. Slide Whistle Down
export const playSlideWhistleDown = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(250, now + 0.4);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.41);
  } catch (e) { console.error(e); }
};

// 30. Teleport Warp
export const playTeleport = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(3000, now + 0.3);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.31);
  } catch (e) { console.error(e); }
};

// 31. Cyber Glitch
export const playGlitch = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      const t = now + i * 0.03;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(Math.random() * 2000 + 400, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.03);
    }
  } catch (e) { console.error(e); }
};

// 32. Party Horn
export const playPartyHorn = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.linearRampToValueAtTime(500, now + 0.2);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.4);
  } catch (e) { console.error(e); }
};

// 33. Heartbeat Pulse
export const playHeartbeat = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [0, 0.2].forEach((delay) => {
      const t = now + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.1);
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.11);
    });
  } catch (e) { console.error(e); }
};

// 34. Glass Shatter
export const playGlassShatter = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const dur = 0.3;
    const bufSize = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 4000;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    noise.start(now);
  } catch (e) { console.error(e); }
};

// 35. Victory Fanfare
export const playVictoryFanfare = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [
      { f: 523.25, t: 0, d: 0.1 },
      { f: 523.25, t: 0.12, d: 0.1 },
      { f: 523.25, t: 0.24, d: 0.1 },
      { f: 659.25, t: 0.36, d: 0.4 }
    ];
    notes.forEach((n) => {
      const startTime = now + n.t;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, startTime);
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + n.d);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(startTime); osc.stop(startTime + n.d + 0.01);
    });
  } catch (e) { console.error(e); }
};

// 36. Level Up
export const playLevelUp = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [440, 554, 659, 880].forEach((freq, idx) => {
      const t = now + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.2);
    });
  } catch (e) { console.error(e); }
};

// 37. Alien Beep
export const playAlienBeep = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.linearRampToValueAtTime(2400, now + 0.1);
    osc.frequency.linearRampToValueAtTime(800, now + 0.2);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.22);
  } catch (e) { console.error(e); }
};

// 38. Radio Tuning Static
export const playRadioTuning = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const dur = 0.45;
    const bufSize = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.exponentialRampToValueAtTime(3000, now + 0.2);
    filter.frequency.exponentialRampToValueAtTime(500, now + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    noise.start(now);
  } catch (e) { console.error(e); }
};

// 39. Tambourine Shake
export const playTambourine = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.05;
      const bufSize = ctx.sampleRate * 0.04;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let j = 0; j < bufSize; j++) data[j] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 6000;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
      noise.start(t);
    }
  } catch (e) { console.error(e); }
};

// 40. Woodblock Tap
export const playWoodblock = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(850, now);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.07);
  } catch (e) { console.error(e); }
};

// 41. Robot Voice Chime
export const playRobotChime = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [300, 600, 1200].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.3);
    });
  } catch (e) { console.error(e); }
};

// 42. Mic Drop Thud
export const playMicDrop = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.2);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.21);
  } catch (e) { console.error(e); }
};

// 43. Alarm Siren
export const playAlarmSiren = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.setValueAtTime(400, now + 0.15);
    osc.frequency.setValueAtTime(900, now + 0.3);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.45);
  } catch (e) { console.error(e); }
};

// 44. Mystery Chime
export const playMysteryChime = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [440, 523.25, 659.25, 830.61].forEach((freq, idx) => {
      const t = now + idx * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.6);
    });
  } catch (e) { console.error(e); }
};

// 45. Beatbox Kick
export const playBeatboxKick = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.09);
  } catch (e) { console.error(e); }
};

// 46. Bongo Drums
export const playBongos = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [220, 330].forEach((freq, idx) => {
      const t = now + idx * 0.1;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.1);
    });
  } catch (e) { console.error(e); }
};

// 47. Quack Duck
export const playQuack = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.2);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.2);
  } catch (e) { console.error(e); }
};

// 48. Cuckoo Clock
export const playCuckoo = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [523.25, 392.00].forEach((freq, idx) => {
      const t = now + idx * 0.15;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.2);
    });
  } catch (e) { console.error(e); }
};

// 49. Evil Laugh Synth
export const playEvilLaugh = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const t = now + i * 0.15;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160 - i * 15, t);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.13);
    }
  } catch (e) { console.error(e); }
};

// 50. Game Over Sound
export const playGameOver = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [330, 311, 293, 277].forEach((freq, idx) => {
      const t = now + idx * 0.15;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.2);
    });
  } catch (e) { console.error(e); }
};

// 51. Glitch Pop
export const playGlitchPop = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.035);
  } catch (e) { console.error(e); }
};

// 52. Space Shield Hum
export const playSpaceShield = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(600, now + 0.3);
    osc.frequency.linearRampToValueAtTime(400, now + 0.6);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.6);
  } catch (e) { console.error(e); }
};

// 53. Vine Boom Effect
export const playVineBoom = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // Sub bass drop
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(130, now);
    sub.frequency.exponentialRampToValueAtTime(25, now + 0.8);
    subGain.gain.setValueAtTime(0.8, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    sub.connect(subGain); subGain.connect(ctx.destination);
    sub.start(now); sub.stop(now + 0.82);

    // Punch transient
    const bufSize = ctx.sampleRate * 0.1;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.6, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    noise.connect(filter); filter.connect(nGain); nGain.connect(ctx.destination);
    noise.start(now);
  } catch (e) { console.error(e); }
};

// 54. Bruh Sound Effect
export const playBruh = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(85, now + 0.5);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.52);
  } catch (e) { console.error(e); }
};

// 55. Snare Drumroll
export const playDrumroll = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // Rapid snare strikes
    for (let i = 0; i < 12; i++) {
      const t = now + i * 0.05;
      const bufSize = ctx.sampleRate * 0.04;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let j = 0; j < bufSize; j++) data[j] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 800;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.1 + (i / 12) * 0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
      noise.start(t);
    }
    // Final Crash Cymbal
    const crashTime = now + 0.65;
    const bufSize = ctx.sampleRate * 0.6;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const crash = ctx.createBufferSource();
    crash.buffer = buf;
    const cFilter = ctx.createBiquadFilter();
    cFilter.type = 'highpass';
    cFilter.frequency.value = 4000;
    const cGain = ctx.createGain();
    cGain.gain.setValueAtTime(0.4, crashTime);
    cGain.gain.exponentialRampToValueAtTime(0.001, crashTime + 0.6);
    crash.connect(cFilter); cFilter.connect(cGain); cGain.connect(ctx.destination);
    crash.start(crashTime);
  } catch (e) { console.error(e); }
};

// 56. Metal Pipe Drop
export const playMetalPipe = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [1200, 1850, 2400, 3100].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + 0.7);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.7);
    });
  } catch (e) { console.error(e); }
};

// 57. Train Horn Blast
export const playTrainHorn = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [311.13, 370.00, 466.16].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.95);
    });
  } catch (e) { console.error(e); }
};

// 58. Thunder Strike
export const playThunder = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const dur = 1.2;
    const bufSize = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    noise.start(now);
  } catch (e) { console.error(e); }
};

// 59. Phone Ring
export const playPhoneRing = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    for (let r = 0; r < 2; r++) {
      const t = now + r * 0.4;
      [440, 480].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(t); osc.stop(t + 0.26);
      });
    }
  } catch (e) { console.error(e); }
};

// 60. Camera Shutter Click
export const playCameraShutter = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // Shutter click
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1500, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.06);

    // Film advance winder
    const wOsc = ctx.createOscillator();
    const wGain = ctx.createGain();
    wOsc.type = 'sawtooth';
    wOsc.frequency.setValueAtTime(300, now + 0.08);
    wOsc.frequency.linearRampToValueAtTime(800, now + 0.2);
    wGain.gain.setValueAtTime(0.15, now + 0.08);
    wGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    wOsc.connect(wGain); wGain.connect(ctx.destination);
    wOsc.start(now + 0.08); wOsc.stop(now + 0.23);
  } catch (e) { console.error(e); }
};

// 61. Triple Door Knock
export const playDoorKnock = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [0, 0.12, 0.24].forEach((delay) => {
      const t = now + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.05);
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.06);
    });
  } catch (e) { console.error(e); }
};

// 62. Cat Meow
export const playCatMeow = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.linearRampToValueAtTime(750, now + 0.25);
    osc.frequency.linearRampToValueAtTime(350, now + 0.5);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.53);
  } catch (e) { console.error(e); }
};

// 63. Dog Bark
export const playDogBark = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.15);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.16);
  } catch (e) { console.error(e); }
};

// 64. Rooster Crow
export const playRoosterCrow = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(800, now + 0.3);
    osc.frequency.linearRampToValueAtTime(600, now + 0.7);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.76);
  } catch (e) { console.error(e); }
};

// 65. Glass Toast Clink
export const playGlassClink = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [2400, 3600].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.42);
    });
  } catch (e) { console.error(e); }
};

// 66. Sports Whistle
export const playWhistle = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2600, now);
    // Vibrato
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(25, now);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(150, now);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain); gain.connect(ctx.destination);
    lfo.start(now); osc.start(now);
    lfo.stop(now + 0.41); osc.stop(now + 0.41);
  } catch (e) { console.error(e); }
};

// 67. Vuvuzela Stadium Horn
export const playStadiumHorn = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(233, now); // B-flat
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.85);
  } catch (e) { console.error(e); }
};

// 68. 80s Orchestral Hit
export const playOrchestralHit = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [261.63, 329.63, 392.00, 523.25].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.36);
    });
  } catch (e) { console.error(e); }
};

// 69. Cinematic Tension Riser
export const playCinematicRiser = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const dur = 1.0;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + dur);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.4, now + dur);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur + 0.1);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + dur + 0.12);
  } catch (e) { console.error(e); }
};

// 70. Bass Cannon Ultra Pulse
export const playBassCannon = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(18, now + 1.4);
    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 1.45);
  } catch (e) { console.error(e); }
};

// 71. Emergency Alert (EAS) Dual Tone
export const playEASAlert = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [853, 960].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.75);
    });
  } catch (e) { console.error(e); }
};

// 72. Time Machine Spin
export const playTimeMachine = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(2500, now + 0.5);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.9);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.92);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.95);
  } catch (e) { console.error(e); }
};

// 73. 8-Bit Arcade Jump
export const playArcadeJump = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(600, now + 0.15);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.16);
  } catch (e) { console.error(e); }
};

// 74. 8-Bit Coin Collect
export const playCoinCollect = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [987.77, 1318.51].forEach((freq, idx) => {
      const t = now + idx * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.26);
    });
  } catch (e) { console.error(e); }
};

// 75. 1-UP Extra Life Chime
export const playOneUp = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [330, 392, 659, 523, 587, 784];
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.09);
    });
  } catch (e) { console.error(e); }
};

// 76. Mechanical Keyboard Click
export const playClickClack = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(3200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.02);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.025);
  } catch (e) { console.error(e); }
};

// 77. DJ Reverse Scratch Sweep
export const playDJReverse = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(2200, now + 0.3);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.31);
  } catch (e) { console.error(e); }
};

// 78. Plasma Laser Sweep
export const playLaserSweep = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2800, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.13);
  } catch (e) { console.error(e); }
};

// 79. Gulp Swallowing FX
export const playGulp = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.19);
  } catch (e) { console.error(e); }
};

// 80. Burp Comedy Wobble
export const playBurp = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(70, now + 0.3);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);
    osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.32);
  } catch (e) { console.error(e); }
};

// 81. Sneeze Noise Burst
export const playSneeze = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const dur = 0.25;
    const bufSize = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, now);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    noise.start(now);
  } catch (e) { console.error(e); }
};

// 82. Yawn Tone
export const playYawn = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(220, now + 0.8);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.82);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.85);
  } catch (e) { console.error(e); }
};

// 83. Snore Breathing
export const playSnore = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.5);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.72);
  } catch (e) { console.error(e); }
};

// 84. Water Bubble Pop
export const playBubblePop = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.05);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.06);
  } catch (e) { console.error(e); }
};

// 85. Rubber Duck Squeak
export const playDuckSqueak = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.linearRampToValueAtTime(2200, now + 0.1);
    osc.frequency.linearRampToValueAtTime(1200, now + 0.2);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.23);
  } catch (e) { console.error(e); }
};

// 86. Car Horn Honk
export const playCarHonk = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [370, 445].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.36);
    });
  } catch (e) { console.error(e); }
};

// 87. V8 Engine Rev
export const playEngineRev = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.4);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.8);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.82);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.85);
  } catch (e) { console.error(e); }
};

// 88. Tires Screech
export const playTiresScreech = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const dur = 0.4;
    const bufSize = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 6;
    filter.frequency.setValueAtTime(2800, now);
    filter.frequency.linearRampToValueAtTime(3400, now + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    noise.start(now);
  } catch (e) { console.error(e); }
};

// 89. Jet Flyby Whoosh
export const playJetFlyby = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const dur = 0.9;
    const bufSize = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.5;
    filter.frequency.setValueAtTime(150, now);
    filter.frequency.exponentialRampToValueAtTime(1600, now + 0.45);
    filter.frequency.exponentialRampToValueAtTime(100, now + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.45);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    noise.start(now);
  } catch (e) { console.error(e); }
};

// 90. Helicopter Blades Thump
export const playHelicopter = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      const t = now + i * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(80, t);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.08);
    }
  } catch (e) { console.error(e); }
};

// 91. Fireworks Rocket Blast
export const playFireworks = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // Whistle up
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(2500, now + 0.4);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.41);

    // Boom explosion at top
    const expTime = now + 0.42;
    const dur = 0.6;
    const bufSize = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, expTime);
    filter.frequency.exponentialRampToValueAtTime(50, expTime + dur);
    const eGain = ctx.createGain();
    eGain.gain.setValueAtTime(0.5, expTime);
    eGain.gain.exponentialRampToValueAtTime(0.001, expTime + dur);
    noise.connect(filter); filter.connect(eGain); eGain.connect(ctx.destination);
    noise.start(expTime);
  } catch (e) { console.error(e); }
};

// 92. Studio Clock Tick
export const playClockTick = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2000, now);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.02);
  } catch (e) { console.error(e); }
};

// 93. Game Show Fail Buzzer
export const playGameBuzzer = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(135, now);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.46);
  } catch (e) { console.error(e); }
};

// 94. Casino Slot Jackpot
export const playSlotJackpot = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    for (let i = 0; i < 10; i++) {
      const t = now + i * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200 + (i % 3) * 300, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.11);
    }
  } catch (e) { console.error(e); }
};

// 95. Metallic Sword Slice
export const playSwordSlice = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const dur = 0.2;
    const bufSize = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3000, now);
    filter.frequency.exponentialRampToValueAtTime(8000, now + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    noise.start(now);
  } catch (e) { console.error(e); }
};

// 96. Steel Anvil Strike
export const playAnvilStrike = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [1600, 2800].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.52);
    });
  } catch (e) { console.error(e); }
};

// 97. Whip Crack Snap
export const playWhipCrack = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const dur = 0.08;
    const bufSize = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(4500, now);
    filter.Q.value = 5;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    noise.start(now);
  } catch (e) { console.error(e); }
};

// 98. Sparkly Magic Wand
export const playMagicWand = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [1200, 1600, 2000, 2400, 3200].forEach((freq, idx) => {
      const t = now + idx * 0.05;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.26);
    });
  } catch (e) { console.error(e); }
};

// 99. Spatial Echo Pulse
export const playEchoDrop = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const t = now + i * 0.15;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      gain.gain.setValueAtTime(0.3 / (i + 1), t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.11);
    }
  } catch (e) { console.error(e); }
};

// 100. Radio Static Stutter
export const playRadioStutter = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      const t = now + i * 0.06;
      const dur = 0.03;
      const bufSize = ctx.sampleRate * dur;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let j = 0; j < bufSize; j++) data[j] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      noise.connect(gain); gain.connect(ctx.destination);
      noise.start(t);
    }
  } catch (e) { console.error(e); }
};

// 101. Vinyl Pitch Death Drop
export const playDJPitchDown = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(15, now + 0.7);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.72);
  } catch (e) { console.error(e); }
};

// 102. Quick Studio Applause Burst
export const playApplauseBurst = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const dur = 0.5;
    const bufSize = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      const env = Math.sin((i / bufSize) * Math.PI);
      data[i] = (Math.random() > 0.9 ? 1.5 : 0.3) * (Math.random() * 2 - 1) * env;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, now);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    noise.start(now);
  } catch (e) { console.error(e); }
};

// Parametric Sound Spec Synthesizer Engine
export function playSpecSound(spec: ParametricSoundSpec) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const dur = spec.duration || 0.3;
    const att = spec.attack || 0.01;
    const dec = spec.decay || dur;

    if (spec.type === 'noise') {
      const bufSize = Math.floor(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;

      const filter = ctx.createBiquadFilter();
      filter.type = spec.filterType || 'lowpass';
      filter.frequency.setValueAtTime(spec.filterFreq || 1200, now);
      if (spec.filterEnd !== undefined) {
        filter.frequency.exponentialRampToValueAtTime(Math.max(10, spec.filterEnd), now + dur);
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.35, now + att);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      return;
    }

    if (spec.type === 'chord' && spec.notes) {
      spec.notes.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.25 / spec.notes!.length, now + att);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dec);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + dec + 0.05);
      });
      return;
    }

    if (spec.type === 'arpeggio' && spec.notes) {
      const noteDur = dur / spec.notes.length;
      spec.notes.forEach((freq, i) => {
        const t = now + i * noteDur;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.25, t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, t + noteDur * 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + noteDur * 1.3);
      });
      return;
    }

    if (spec.type === 'fm') {
      const carrier = ctx.createOscillator();
      const modulator = ctx.createOscillator();
      const modGain = ctx.createGain();
      const mainGain = ctx.createGain();

      carrier.type = 'sine';
      modulator.type = 'sawtooth';

      const carFreq = spec.freq || 440;
      const modFreq = spec.lfoFreq || 120;
      const modDepth = spec.lfoDepth || 300;

      carrier.frequency.setValueAtTime(carFreq, now);
      modulator.frequency.setValueAtTime(modFreq, now);
      modGain.gain.setValueAtTime(modDepth, now);

      if (spec.freqEnd) {
        carrier.frequency.exponentialRampToValueAtTime(Math.max(10, spec.freqEnd), now + dur);
      }

      modulator.connect(modGain);
      modGain.connect(carrier.frequency);

      mainGain.gain.setValueAtTime(0.001, now);
      mainGain.gain.linearRampToValueAtTime(0.35, now + att);
      mainGain.gain.exponentialRampToValueAtTime(0.001, now + dec);

      carrier.connect(mainGain);
      mainGain.connect(ctx.destination);

      modulator.start(now);
      carrier.start(now);
      modulator.stop(now + dec + 0.05);
      carrier.stop(now + dec + 0.05);
      return;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = (spec.type as OscillatorType) || 'sine';
    const startFreq = spec.freq || 440;
    osc.frequency.setValueAtTime(startFreq, now);

    if (spec.freqEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(10, spec.freqEnd), now + dur);
    }

    if (spec.lfoFreq && spec.lfoDepth) {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(spec.lfoFreq, now);
      lfoGain.gain.setValueAtTime(spec.lfoDepth, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + dec + 0.05);
    }

    if (spec.filterType && spec.filterFreq) {
      const filter = ctx.createBiquadFilter();
      filter.type = spec.filterType;
      filter.frequency.setValueAtTime(spec.filterFreq, now);
      if (spec.filterEnd) {
        filter.frequency.exponentialRampToValueAtTime(Math.max(10, spec.filterEnd), now + dur);
      }
      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.connect(gain);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.35, now + att);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dec);

    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dec + 0.05);
  } catch (err) {
    console.error('Failed to play spec sound', err);
  }
}

const GENERATED_SPECS = generate500SoundSpecs();

const PROCEDURAL_PRESETS: SoundEffect[] = GENERATED_SPECS.map((spec) => ({
  id: spec.id,
  name: spec.name,
  emoji: spec.emoji,
  category: spec.category,
  color: spec.color || 'text-cyan-300 border-cyan-300/30 bg-cyan-950/20',
  play: () => playSpecSound(spec),
}));

// ----------------------------------------------------------------------
// MASTER SOUND REGISTRY (600+ PRESET SOUNDS)
// ----------------------------------------------------------------------
export const PRESET_SOUNDS: SoundEffect[] = [
  // Handcrafted core presets
  { id: 'airhorn', name: 'Airhorn', emoji: '📣', category: 'Studio FX', color: 'text-amber-400 border-amber-400/30 bg-amber-950/20', play: playAirhorn },
  { id: 'scratch', name: 'Vinyl Scratch', emoji: '🏉', category: 'Studio FX', color: 'text-purple-400 border-purple-400/30 bg-purple-950/20', play: playScratch },
  { id: 'jingle', name: 'Radio Jingle', emoji: '🎵', category: 'Studio FX', color: 'text-blue-400 border-blue-400/30 bg-blue-950/20', play: playJingle },
  { id: 'cheer', name: 'Crowd Cheer', emoji: '👏', category: 'Studio FX', color: 'text-emerald-400 border-emerald-400/30 bg-emerald-950/20', play: playCheer },
  { id: 'news_flash', name: 'News Flash', emoji: '📰', category: 'Studio FX', color: 'text-cyan-400 border-cyan-400/30 bg-cyan-950/20', play: playNewsFlash },
  { id: 'foghorn', name: 'Foghorn Blast', emoji: '🚢', category: 'Studio FX', color: 'text-orange-400 border-orange-400/30 bg-orange-950/20', play: playFoghorn },
  { id: 'siren', name: 'Police Siren', emoji: '🚨', category: 'Studio FX', color: 'text-red-400 border-red-400/30 bg-red-950/20', play: playSiren },
  { id: 'radio_tuning', name: 'Radio Tuning', emoji: '📻', category: 'Studio FX', color: 'text-slate-400 border-slate-400/30 bg-slate-950/20', play: playRadioTuning },
  { id: 'phone_ring', name: 'Phone Ring', emoji: '☎️', category: 'Studio FX', color: 'text-emerald-300 border-emerald-300/30 bg-emerald-950/20', play: playPhoneRing },
  { id: 'camera_shutter', name: 'Camera Shutter', emoji: '📸', category: 'Studio FX', color: 'text-zinc-300 border-zinc-300/30 bg-zinc-950/20', play: playCameraShutter },
  { id: 'whistle', name: 'Sports Whistle', emoji: '🎷', category: 'Studio FX', color: 'text-yellow-300 border-yellow-300/30 bg-yellow-950/20', play: playWhistle },
  { id: 'stadium_horn', name: 'Vuvuzela Horn', emoji: '🎺', category: 'Studio FX', color: 'text-amber-500 border-amber-500/30 bg-amber-950/20', play: playStadiumHorn },
  { id: 'orchestral_hit', name: 'Orchestral Hit', emoji: '🎼', category: 'Studio FX', color: 'text-purple-300 border-purple-300/30 bg-purple-950/20', play: playOrchestralHit },
  { id: 'cinematic_riser', name: 'Cinematic Riser', emoji: '📈', category: 'Studio FX', color: 'text-rose-400 border-rose-400/30 bg-rose-950/20', play: playCinematicRiser },

  // DJ Drops
  { id: 'vine_boom', name: 'Vine Boom', emoji: '💥', category: 'DJ Drops', color: 'text-amber-400 border-amber-400/30 bg-amber-950/20', play: playVineBoom },
  { id: 'sub_drop', name: 'Sub Bass Drop', emoji: '🔊', category: 'DJ Drops', color: 'text-indigo-400 border-indigo-400/30 bg-indigo-950/20', play: playSubDrop },
  { id: 'bass_cannon', name: 'Bass Cannon', emoji: '🎛️', category: 'DJ Drops', color: 'text-purple-400 border-purple-400/30 bg-purple-950/20', play: playBassCannon },
  { id: 'eas_alert', name: 'EAS Emergency', emoji: '⚠️', category: 'DJ Drops', color: 'text-red-500 border-red-500/30 bg-red-950/20', play: playEASAlert },
  { id: 'rewind', name: 'Rewind Spin', emoji: '🔄', category: 'DJ Drops', color: 'text-yellow-400 border-yellow-400/30 bg-yellow-950/20', play: playRewind },
  { id: 'dj_reverse', name: 'DJ Scratch Reverse', emoji: '🎚️', category: 'DJ Drops', color: 'text-cyan-400 border-cyan-400/30 bg-cyan-950/20', play: playDJReverse },
  { id: 'dj_pitch_down', name: 'Vinyl Pitch Drop', emoji: '🛑', category: 'DJ Drops', color: 'text-pink-400 border-pink-400/30 bg-pink-950/20', play: playDJPitchDown },
  { id: 'explosion', name: 'Explosion Punch', emoji: '💣', category: 'DJ Drops', color: 'text-red-500 border-red-500/30 bg-red-950/20', play: playExplosion },
  { id: 'record_stop', name: 'Record Stop', emoji: '⏹️', category: 'DJ Drops', color: 'text-pink-400 border-pink-400/30 bg-pink-950/20', play: playRecordStop },
  { id: 'mic_drop', name: 'Mic Drop', emoji: '🎙️', category: 'DJ Drops', color: 'text-violet-400 border-violet-400/30 bg-violet-950/20', play: playMicDrop },
  { id: 'alarm', name: 'Alarm Siren', emoji: '⏰', category: 'DJ Drops', color: 'text-[#ef4444] border-red-500/30 bg-red-950/20', play: playAlarmSiren },

  // Comedy & Fun
  { id: 'bruh', name: 'Bruh Effect', emoji: '🗿', category: 'Comedy', color: 'text-amber-500 border-amber-500/30 bg-amber-950/20', play: playBruh },
  { id: 'sad_trombone', name: 'Sad Trombone', emoji: '🎺', category: 'Comedy', color: 'text-yellow-500 border-yellow-500/30 bg-yellow-950/20', play: playSadTrombone },
  { id: 'rimshot', name: 'Ba-Dum-Tss', emoji: '🥁', category: 'Comedy', color: 'text-amber-400 border-amber-400/30 bg-amber-950/20', play: playRimshot },
  { id: 'metal_pipe', name: 'Metal Pipe Drop', emoji: '🦯', category: 'Comedy', color: 'text-slate-300 border-slate-300/30 bg-slate-950/20', play: playMetalPipe },
  { id: 'cash_register', name: 'Cash Register', emoji: '💰', category: 'Comedy', color: 'text-emerald-300 border-emerald-300/30 bg-emerald-950/20', play: playCashRegister },
  { id: 'boing', name: 'Cartoon Boing', emoji: '🌀', category: 'Comedy', color: 'text-cyan-300 border-cyan-300/30 bg-cyan-950/20', play: playBoing },
  { id: 'cat_meow', name: 'Cat Meow', emoji: '🐱', category: 'Comedy', color: 'text-orange-300 border-orange-300/30 bg-orange-950/20', play: playCatMeow },
  { id: 'dog_bark', name: 'Dog Bark', emoji: '🐶', category: 'Comedy', color: 'text-amber-600 border-amber-600/30 bg-amber-950/20', play: playDogBark },
  { id: 'rooster_crow', name: 'Rooster Crow', emoji: '🐓', category: 'Comedy', color: 'text-yellow-400 border-yellow-400/30 bg-yellow-950/20', play: playRoosterCrow },
  { id: 'glass_clink', name: 'Glass Toast Clink', emoji: '🥂', category: 'Comedy', color: 'text-sky-300 border-sky-300/30 bg-sky-950/20', play: playGlassClink },
  { id: 'door_knock', name: 'Door Knock', emoji: '🚪', category: 'Comedy', color: 'text-stone-400 border-stone-400/30 bg-stone-950/20', play: playDoorKnock },
  { id: 'gulp', name: 'Swallow Gulp', emoji: '🧃', category: 'Comedy', color: 'text-emerald-400 border-emerald-400/30 bg-emerald-950/20', play: playGulp },
  { id: 'burp', name: 'Burp Comedy', emoji: '💬', category: 'Comedy', color: 'text-lime-400 border-lime-400/30 bg-lime-950/20', play: playBurp },
  { id: 'sneeze', name: 'Sneeze Noise', emoji: '🤧', category: 'Comedy', color: 'text-teal-300 border-teal-300/30 bg-teal-950/20', play: playSneeze },
  { id: 'yawn', name: 'Sleep Yawn', emoji: '🥱', category: 'Comedy', color: 'text-indigo-300 border-indigo-300/30 bg-indigo-950/20', play: playYawn },
  { id: 'snore', name: 'Snoring Noise', emoji: '😴', category: 'Comedy', color: 'text-purple-300 border-purple-300/30 bg-purple-950/20', play: playSnore },
  { id: 'bubble_pop', name: 'Bubble Pop', emoji: '🫧', category: 'Comedy', color: 'text-cyan-300 border-cyan-300/30 bg-cyan-950/20', play: playBubblePop },
  { id: 'duck_squeak', name: 'Rubber Duck', emoji: '🐥', category: 'Comedy', color: 'text-yellow-400 border-yellow-400/30 bg-yellow-950/20', play: playDuckSqueak },
  { id: 'slide_whistle_up', name: 'Slide Whistle Up', emoji: '📈', category: 'Comedy', color: 'text-sky-400 border-sky-400/30 bg-sky-950/20', play: playSlideWhistleUp },
  { id: 'slide_whistle_down', name: 'Slide Whistle Down', emoji: '📉', category: 'Comedy', color: 'text-rose-400 border-rose-400/30 bg-rose-950/20', play: playSlideWhistleDown },
  { id: 'boo', name: 'Crowd Boo', emoji: '👎', category: 'Comedy', color: 'text-red-400 border-red-400/30 bg-red-950/20', play: playBoo },
  { id: 'gong', name: 'Gong Strike', emoji: '🔔', category: 'Comedy', color: 'text-amber-500 border-amber-500/30 bg-amber-950/20', play: playGong },
  { id: 'quack', name: 'Quack Duck', emoji: '🦆', category: 'Comedy', color: 'text-yellow-400 border-yellow-400/30 bg-yellow-950/20', play: playQuack },
  { id: 'cuckoo', name: 'Cuckoo Clock', emoji: '🐤', category: 'Comedy', color: 'text-lime-400 border-lime-400/30 bg-lime-950/20', play: playCuckoo },
  { id: 'evil_laugh', name: 'Evil Laugh', emoji: '😈', category: 'Comedy', color: 'text-purple-500 border-purple-500/30 bg-purple-950/20', play: playEvilLaugh },
  { id: 'party_horn', name: 'Party Horn', emoji: '🥳', category: 'Comedy', color: 'text-pink-400 border-pink-400/30 bg-pink-950/20', play: playPartyHorn },

  // Percussion
  { id: 'drumroll', name: 'Snare Drumroll', emoji: '🥁', category: 'Percussion', color: 'text-amber-400 border-amber-400/30 bg-amber-950/20', play: playDrumroll },
  { id: 'kick', name: 'Kick Drum', emoji: '🥁', category: 'Percussion', color: 'text-rose-500 border-rose-500/30 bg-rose-950/20', play: playKick },
  { id: 'snare', name: 'Snare Snap', emoji: '💥', category: 'Percussion', color: 'text-amber-300 border-amber-300/30 bg-amber-950/20', play: playSnare },
  { id: 'cowbell', name: 'More Cowbell', emoji: '🐮', category: 'Percussion', color: 'text-stone-300 border-stone-300/30 bg-stone-950/20', play: playCowbell },
  { id: 'snap', name: 'Finger Snap', emoji: '🤌', category: 'Percussion', color: 'text-teal-300 border-teal-300/30 bg-teal-950/20', play: playFingerSnap },
  { id: 'click_clack', name: 'Keyboard Click', emoji: '⌨️', category: 'Percussion', color: 'text-[#22c55e] border-green-500/30 bg-green-950/20', play: playClickClack },
  { id: 'tambourine', name: 'Tambourine Shake', emoji: '🪘', category: 'Percussion', color: 'text-emerald-400 border-emerald-400/30 bg-emerald-950/20', play: playTambourine },
  { id: 'woodblock', name: 'Woodblock Tap', emoji: '🪵', category: 'Percussion', color: 'text-amber-600 border-amber-600/30 bg-amber-950/20', play: playWoodblock },
  { id: 'beatbox', name: 'Beatbox Kick', emoji: '🎤', category: 'Percussion', color: 'text-cyan-400 border-cyan-400/30 bg-cyan-950/20', play: playBeatboxKick },
  { id: 'bongos', name: 'Bongo Drums', emoji: '🪘', category: 'Percussion', color: 'text-orange-400 border-orange-400/30 bg-orange-950/20', play: playBongos },
  { id: 'anvil', name: 'Anvil Strike', emoji: '🔨', category: 'Percussion', color: 'text-zinc-300 border-zinc-300/30 bg-zinc-950/20', play: playAnvilStrike },
  { id: 'whip', name: 'Whip Crack', emoji: '🤠', category: 'Percussion', color: 'text-yellow-500 border-yellow-500/30 bg-yellow-950/20', play: playWhipCrack },
  { id: 'clock_tick', name: 'Studio Clock Tick', emoji: '⏱️', category: 'Percussion', color: 'text-slate-300 border-slate-300/30 bg-slate-950/20', play: playClockTick },

  // Sci-Fi
  { id: 'laser', name: 'Laser Cannon', emoji: '🔫', category: 'Sci-Fi', color: 'text-cyan-400 border-cyan-400/30 bg-cyan-950/20', play: playLaser },
  { id: 'laser_sweep', name: 'Plasma Sweep', emoji: '⚡', category: 'Sci-Fi', color: 'text-sky-300 border-sky-300/30 bg-sky-950/20', play: playLaserSweep },
  { id: 'teleport', name: 'Teleport Warp', emoji: '✨', category: 'Sci-Fi', color: 'text-purple-400 border-purple-400/30 bg-purple-950/20', play: playTeleport },
  { id: 'time_machine', name: 'Time Machine Spin', emoji: '⌛', category: 'Sci-Fi', color: 'text-violet-300 border-violet-300/30 bg-violet-950/20', play: playTimeMachine },
  { id: 'glitch', name: 'Cyber Glitch', emoji: '👾', category: 'Sci-Fi', color: 'text-[#22c55e] border-green-500/30 bg-green-950/20', play: playGlitch },
  { id: 'power_up', name: 'Power Up', emoji: '⚡', category: 'Sci-Fi', color: 'text-yellow-300 border-yellow-300/30 bg-yellow-950/20', play: playPowerUp },
  { id: 'power_down', name: 'Power Down', emoji: '🔋', category: 'Sci-Fi', color: 'text-red-400 border-red-400/30 bg-red-950/20', play: playPowerDown },
  { id: 'alien_beep', name: 'Alien Beep', emoji: '👽', category: 'Sci-Fi', color: 'text-emerald-400 border-emerald-400/30 bg-emerald-950/20', play: playAlienBeep },
  { id: 'robot_chime', name: 'Robot Chime', emoji: '🤖', category: 'Sci-Fi', color: 'text-blue-400 border-blue-400/30 bg-blue-950/20', play: playRobotChime },
  { id: 'space_shield', name: 'Space Shield', emoji: '🛡️', category: 'Sci-Fi', color: 'text-indigo-300 border-indigo-300/30 bg-indigo-950/20', play: playSpaceShield },
  { id: 'magic_wand', name: 'Magic Wand Dust', emoji: '🪄', category: 'Sci-Fi', color: 'text-pink-300 border-pink-300/30 bg-pink-950/20', play: playMagicWand },

  // Transport & Vehicles
  { id: 'train_horn', name: 'Train Horn', emoji: '🚂', category: 'Studio FX', color: 'text-amber-500 border-amber-500/30 bg-amber-950/20', play: playTrainHorn },
  { id: 'car_honk', name: 'Car Honk', emoji: '🚗', category: 'Studio FX', color: 'text-red-400 border-red-400/30 bg-red-950/20', play: playCarHonk },
  { id: 'engine_rev', name: 'V8 Engine Rev', emoji: '🏎️', category: 'Studio FX', color: 'text-orange-500 border-orange-500/30 bg-orange-950/20', play: playEngineRev },
  { id: 'tires_screech', name: 'Tires Screech', emoji: '🛞', category: 'Studio FX', color: 'text-yellow-400 border-yellow-400/30 bg-yellow-950/20', play: playTiresScreech },
  { id: 'jet_flyby', name: 'Jet Engine Flyby', emoji: '✈️', category: 'Studio FX', color: 'text-cyan-300 border-cyan-300/30 bg-cyan-950/20', play: playJetFlyby },
  { id: 'helicopter', name: 'Helicopter Chopper', emoji: '🚁', category: 'Studio FX', color: 'text-emerald-400 border-emerald-400/30 bg-emerald-950/20', play: playHelicopter },

  // Memes & Gaming
  { id: 'thunder', name: 'Thunder Strike', emoji: '⚡', category: 'Memes', color: 'text-amber-300 border-amber-300/30 bg-amber-950/20', play: playThunder },
  { id: 'arcade_jump', name: '8-Bit Jump', emoji: '🕹️', category: 'Memes', color: 'text-emerald-400 border-emerald-400/30 bg-emerald-950/20', play: playArcadeJump },
  { id: 'coin_collect', name: '8-Bit Coin', emoji: '🪙', category: 'Memes', color: 'text-yellow-300 border-yellow-300/30 bg-yellow-950/20', play: playCoinCollect },
  { id: 'one_up', name: '1-UP Extra Life', emoji: '🍄', category: 'Memes', color: 'text-green-400 border-green-400/30 bg-green-950/20', play: playOneUp },
  { id: 'fireworks', name: 'Fireworks Blast', emoji: '🎆', category: 'Memes', color: 'text-fuchsia-400 border-fuchsia-400/30 bg-fuchsia-950/20', play: playFireworks },
  { id: 'slot_jackpot', name: 'Slot Jackpot', emoji: '🎰', category: 'Memes', color: 'text-amber-400 border-amber-400/30 bg-amber-950/20', play: playSlotJackpot },
  { id: 'sword_slice', name: 'Sword Slice', emoji: '⚔️', category: 'Memes', color: 'text-slate-200 border-slate-200/30 bg-slate-950/20', play: playSwordSlice },
  { id: 'game_buzzer', name: 'Game Show Buzzer', emoji: '🚨', category: 'Memes', color: 'text-red-500 border-red-500/30 bg-red-950/20', play: playGameBuzzer },
  { id: 'ding', name: 'Correct Ding', emoji: '✅', category: 'Memes', color: 'text-emerald-400 border-emerald-400/30 bg-emerald-950/20', play: playCorrectDing },
  { id: 'wrong', name: 'Wrong Buzzer', emoji: '❌', category: 'Memes', color: 'text-red-500 border-red-500/30 bg-red-950/20', play: playWrongBuzzer },
  { id: 'whoosh', name: 'Whoosh Transit', emoji: '💨', category: 'Memes', color: 'text-slate-300 border-slate-300/30 bg-slate-950/20', play: playWhoosh },
  { id: 'glass_shatter', name: 'Glass Shatter', emoji: '🥃', category: 'Memes', color: 'text-sky-300 border-sky-300/30 bg-sky-950/20', play: playGlassShatter },
  { id: 'victory', name: 'Victory Fanfare', emoji: '🏆', category: 'Memes', color: 'text-yellow-400 border-yellow-400/30 bg-yellow-950/20', play: playVictoryFanfare },
  { id: 'level_up', name: 'Level Up', emoji: '📈', category: 'Memes', color: 'text-green-400 border-green-400/30 bg-green-950/20', play: playLevelUp },
  { id: 'heartbeat', name: 'Heartbeat Pulse', emoji: '💓', category: 'Memes', color: 'text-rose-500 border-rose-500/30 bg-rose-950/20', play: playHeartbeat },
  { id: 'mystery', name: 'Mystery Chime', emoji: '🔮', category: 'Memes', color: 'text-purple-300 border-purple-300/30 bg-purple-950/20', play: playMysteryChime },
  { id: 'game_over', name: 'Game Over', emoji: '👾', category: 'Memes', color: 'text-red-400 border-red-400/30 bg-red-950/20', play: playGameOver },
  { id: 'glitch_pop', name: 'Glitch Pop', emoji: '🎈', category: 'Memes', color: 'text-fuchsia-400 border-fuchsia-400/30 bg-fuchsia-950/20', play: playGlitchPop },
  { id: 'echo_drop', name: 'Spatial Echo Pulse', emoji: '🌌', category: 'Memes', color: 'text-cyan-300 border-cyan-300/30 bg-cyan-950/20', play: playEchoDrop },
  { id: 'radio_stutter', name: 'Radio Static Burst', emoji: '📻', category: 'Memes', color: 'text-zinc-400 border-zinc-400/30 bg-zinc-950/20', play: playRadioStutter },
  { id: 'applause_burst', name: 'Applause Burst', emoji: '👏', category: 'Memes', color: 'text-emerald-400 border-emerald-400/30 bg-emerald-950/20', play: playApplauseBurst },

  // Procedural Library (500+ Sounds)
  ...PROCEDURAL_PRESETS,
];

// Helper to register custom uploaded audio files into runtime memory & cache
export async function registerCustomAudioFile(file: File): Promise<SoundEffect> {
  const ctx = getAudioContext();
  const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const arrayBuffer = await file.arrayBuffer();
  
  // Read Data URL for fallback & DB persistence
  const reader = new FileReader();
  const dataUrlPromise = new Promise<string>((resolve) => {
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
  const dataUrl = await dataUrlPromise;

  try {
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    customAudioBuffers.set(id, audioBuffer);
  } catch (err) {
    console.warn('Web Audio decode failed, relying on HTML5 audio data URL', err);
  }

  customAudioDataUrls.set(id, dataUrl);

  const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  const sound: SoundEffect = {
    id,
    name: cleanName,
    emoji: '🎧',
    category: 'Custom Imports',
    color: 'text-cyan-300 border-cyan-400/40 bg-cyan-950/30',
    isCustom: true,
    audioUrl: dataUrl,
    play: () => playCustomAudio(id),
  };

  // Save to IndexedDB
  await saveCustomSoundToDB(id, sound.name, sound.emoji, dataUrl);
  return sound;
}

// Helper to re-hydrate saved IndexedDB custom sounds on initial boot
export async function loadSavedCustomSounds(): Promise<SoundEffect[]> {
  const saved = await loadCustomSoundsFromDB();
  const ctx = getAudioContext();
  const customEffects: SoundEffect[] = [];

  for (const item of saved) {
    customAudioDataUrls.set(item.id, item.dataUrl);

    // Try decoding base64 back into AudioBuffer asynchronously
    try {
      const resp = await fetch(item.dataUrl);
      const ab = await resp.arrayBuffer();
      const audioBuf = await ctx.decodeAudioData(ab);
      customAudioBuffers.set(item.id, audioBuf);
    } catch {
      // Fallback stays in dataUrl
    }

    customEffects.push({
      id: item.id,
      name: item.name,
      emoji: item.emoji || '🎧',
      category: 'Custom Imports',
      color: 'text-cyan-300 border-cyan-400/40 bg-cyan-950/30',
      isCustom: true,
      audioUrl: item.dataUrl,
      play: () => playCustomAudio(item.id),
    });
  }

  return customEffects;
}
