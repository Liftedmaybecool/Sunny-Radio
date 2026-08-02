// Web Audio API Audio Synthesizer for Studio Sound Effects & Multi-Voice Speech

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const playAirhorn = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Classic airhorn has 3 layered oscillators jumping in frequency
    const freqs = [280, 370, 470];
    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      
      // Frequency envelope: rapid drop then sustain
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.95, now + 0.35);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.setValueAtTime(0.25, now + 0.28);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    });

    // Add noise burst for blast impact
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
  } catch (err) {
    console.error('Failed to play Airhorn', err);
  }
};

export const playScratch = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const duration = 0.22;

    // Filtered white noise with pitch bend sweep
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 4;
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.1);
    filter.frequency.exponentialRampToValueAtTime(600, now + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  } catch (err) {
    console.error('Failed to play Scratch', err);
  }
};

export const playJingle = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // Bright radio synth chime arpeggio: C5 - E5 - G5 - C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    
    notes.forEach((freq, index) => {
      const startTime = now + index * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.42);
    });
  } catch (err) {
    console.error('Failed to play Jingle', err);
  }
};

export const playCheer = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const duration = 1.2;

    // Crowd applause simulation using modulated filtered noise
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // Simulate multiple claps by adding micro transients
      const env = Math.sin((i / bufferSize) * Math.PI);
      const clapPattern = (Math.random() > 0.94 ? 1.8 : 0.4) * (Math.random() * 2 - 1);
      data[i] = clapPattern * env;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.value = 1.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  } catch (err) {
    console.error('Failed to play Cheer', err);
  }
};

export const playNewsFlash = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Rapid synth teletype beep sequence
    for (let i = 0; i < 4; i++) {
      const startTime = now + i * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200 + i * 200, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.06);
    }
  } catch (err) {
    console.error('Failed to play News Flash', err);
  }
};

export const playSoundCue = (cue?: string | null) => {
  if (!cue) return;
  switch (cue.toLowerCase()) {
    case 'airhorn':
      playAirhorn();
      break;
    case 'scratch':
      playScratch();
      break;
    case 'jingle':
      playJingle();
      break;
    case 'cheer':
    case 'applause':
    case 'laugh':
      playCheer();
      break;
    case 'news_flash':
      playNewsFlash();
      break;
    default:
      break;
  }
};

// Speech Synthesis Helper with distinct pitch / rate for Host 1 vs Host 2
export class SpeechController {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public speak(
    text: string,
    speaker: 'host1' | 'host2' | 'intro' | 'outro' | 'sfx',
    rate = 1.0,
    onEnd?: () => void
  ) {
    if (!this.synth) {
      onEnd?.();
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    // Voice assignment strategy
    const englishVoices = this.voices.filter((v) => v.lang.startsWith('en'));
    const maleVoice = englishVoices.find((v) => v.name.includes('David') || v.name.includes('Male') || v.name.includes('Google US English')) || englishVoices[0];
    const femaleVoice = englishVoices.find((v) => v.name.includes('Zira') || v.name.includes('Female') || v.name.includes('Google UK English Female') || v.name.includes('Samantha')) || englishVoices[1] || englishVoices[0];

    if (speaker === 'host1' || speaker === 'intro') {
      utterance.voice = maleVoice || null;
      utterance.pitch = 0.95;
      utterance.rate = rate * 1.02;
    } else if (speaker === 'host2') {
      utterance.voice = femaleVoice || null;
      utterance.pitch = 1.15;
      utterance.rate = rate * 1.05;
    } else {
      utterance.pitch = 1.0;
      utterance.rate = rate;
    }

    utterance.onend = () => {
      this.currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = () => {
      this.currentUtterance = null;
      onEnd?.();
    };

    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }
}

export const speechController = new SpeechController();
