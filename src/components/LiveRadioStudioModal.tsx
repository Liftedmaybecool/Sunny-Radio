import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Radio,
  Volume2,
  VolumeX,
  Play,
  Square,
  Download,
  Sliders,
  Music,
  Sparkles,
  Copy,
  Check,
  X,
  Share2,
  Activity,
  FileText,
  Zap,
  RotateCcw,
  Info,
  Tv,
} from 'lucide-react';
import {
  SoundEffect,
  PRESET_SOUNDS,
  getAudioContext,
  loadSavedCustomSounds,
} from '../utils/soundLibrary';
import { SoundboardModal } from './SoundboardModal';
import { YouTubeMusicStudioDeck } from './YouTubeMusicStudioDeck';

interface LiveRadioStudioModalProps {
  show: boolean;
  onClose: () => void;
  initialScript?: string;
}

export const LiveRadioStudioModal: React.FC<LiveRadioStudioModalProps> = ({
  show,
  onClose,
  initialScript = '',
}) => {
  // Mic & Audio Engine state
  const [isMicActive, setIsMicActive] = useState(false);
  const [micGainValue, setMicGainValue] = useState(1.0);
  const [monitorMic, setMonitorMic] = useState(false);
  const [voiceFilter, setVoiceFilter] = useState<'clean' | 'warm_fm' | 'telephone' | 'deep_bass'>('warm_fm');
  const [micError, setMicError] = useState<string | null>(null);

  // Background Music Bed state
  const [activeBed, setActiveBed] = useState<'none' | 'lofi' | 'news' | 'synth' | 'funk'>('none');
  const [bedVolume, setBedVolume] = useState(0.25);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);

  // Teleprompter / Host Notes
  const [scriptText, setScriptText] = useState(initialScript || '');
  const [teleprompterFontSize, setTeleprompterFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');

  // Soundboard Integration
  const [showFullSoundboard, setShowFullSoundboard] = useState(false);
  const [customSounds, setCustomSounds] = useState<SoundEffect[]>([]);
  const [pinnedIds, setPinnedIds] = useState<string[]>([
    'airhorn',
    'scratch',
    'jingle',
    'cheer',
    'vine_boom',
    'sub_drop',
    'news_flash',
    'metal_pipe',
  ]);
  const [lastTriggeredFx, setLastTriggeredFx] = useState<string | null>(null);
  const [copiedStreamLink, setCopiedStreamLink] = useState(false);

  // Web Audio Nodes Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterType | BiquadFilterNode | null>(null);
  const monitorGainNodeRef = useRef<GainNode | null>(null);
  const masterDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const bedOscillatorsRef = useRef<{ stop: () => void } | null>(null);

  // Load custom sounds for soundboard
  useEffect(() => {
    loadSavedCustomSounds().then((sounds) => setCustomSounds(sounds));
  }, [showFullSoundboard]);

  const allSounds: SoundEffect[] = [...PRESET_SOUNDS, ...customSounds];
  const quickPads = allSounds.filter((s) => pinnedIds.includes(s.id));

  // Initialize/Reset Script if provided
  useEffect(() => {
    if (initialScript && !scriptText) {
      setScriptText(initialScript);
    }
  }, [initialScript]);

  // Clean up audio nodes on unmount or modal close
  useEffect(() => {
    if (!show) {
      stopMicrophone();
      stopBackgroundBed();
      if (isRecording) stopRecording();
    }
  }, [show]);

  // Handle Recording Timer
  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording]);

  // Canvas Audio Visualizer Loop
  useEffect(() => {
    if (!show) return;

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderVisualizer = () => {
      animId = requestAnimationFrame(renderVisualizer);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Background subtle grid
      ctx.fillStyle = '#0a0b10';
      ctx.fillRect(0, 0, width, height);

      if (analyserRef.current && isMicActive) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        const barWidth = (width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height * 0.85;

          // Color gradient depending on pitch and intensity
          const hue = (i / bufferLength) * 240 + 120; // Emerald to Cyan to Purple
          ctx.fillStyle = `hsla(${hue}, 90%, 55%, 0.85)`;

          // Centered bars effect
          const y = (height - barHeight) / 2;
          ctx.fillRect(x, y, barWidth - 1, barHeight);

          x += barWidth + 1;
        }
      } else {
        // Idle heartbeat line when mic is muted
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const time = Date.now() * 0.003;
        for (let x = 0; x < width; x += 5) {
          const y = height / 2 + Math.sin(x * 0.02 + time) * 4;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    renderVisualizer();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [show, isMicActive]);

  // Start Microphone
  const startMicrophone = async () => {
    setMicError(null);
    try {
      const actx = getAudioContext();
      audioCtxRef.current = actx;

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = mediaStream;

      // Create Audio Nodes
      const source = actx.createMediaStreamSource(mediaStream);
      micSourceRef.current = source;

      const gainNode = actx.createGain();
      gainNode.gain.setValueAtTime(micGainValue, actx.currentTime);
      gainNodeRef.current = gainNode;

      const monitorGainNode = actx.createGain();
      monitorGainNode.gain.setValueAtTime(monitorMic ? 0.8 : 0.0, actx.currentTime);
      monitorGainNodeRef.current = monitorGainNode;

      const analyser = actx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      // Filter effect
      const biquad = actx.createBiquadFilter();
      applyVoiceFilter(biquad, voiceFilter, actx);

      // Node Chain: Mic Source -> Gain -> Filter -> Analyser -> Monitor Gain -> Audio Destination
      source.connect(gainNode);
      gainNode.connect(biquad);
      biquad.connect(analyser);

      // Connect to speakers if monitor is enabled
      biquad.connect(monitorGainNode);
      monitorGainNode.connect(actx.destination);

      // Master stream destination for recording
      const masterDest = actx.createMediaStreamDestination();
      masterDestinationRef.current = masterDest;
      biquad.connect(masterDest);

      setIsMicActive(true);
    } catch (err: unknown) {
      console.error('Microphone access denied or error:', err);
      setMicError('Microphone permission denied or no audio input device found.');
      setIsMicActive(false);
    }
  };

  // Stop Microphone
  const stopMicrophone = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (micSourceRef.current) {
      micSourceRef.current.disconnect();
      micSourceRef.current = null;
    }
    setIsMicActive(false);
  };

  const toggleMic = () => {
    if (isMicActive) {
      stopMicrophone();
    } else {
      startMicrophone();
    }
  };

  // Voice Filter Switch
  const applyVoiceFilter = (
    biquad: BiquadFilterNode,
    filterType: 'clean' | 'warm_fm' | 'telephone' | 'deep_bass',
    actx: AudioContext
  ) => {
    if (!biquad) return;
    const now = actx.currentTime;
    if (filterType === 'clean') {
      biquad.type = 'allpass';
    } else if (filterType === 'warm_fm') {
      biquad.type = 'peaking';
      biquad.frequency.setValueAtTime(250, now);
      biquad.gain.setValueAtTime(4, now); // boost low warm resonance
      biquad.Q.setValueAtTime(1.0, now);
    } else if (filterType === 'telephone') {
      biquad.type = 'bandpass';
      biquad.frequency.setValueAtTime(1400, now);
      biquad.Q.setValueAtTime(2.5, now);
    } else if (filterType === 'deep_bass') {
      biquad.type = 'lowshelf';
      biquad.frequency.setValueAtTime(180, now);
      biquad.gain.setValueAtTime(8, now);
    }
  };

  const handleVoiceFilterChange = (filter: 'clean' | 'warm_fm' | 'telephone' | 'deep_bass') => {
    setVoiceFilter(filter);
    if (filterNodeRef.current && audioCtxRef.current) {
      applyVoiceFilter(filterNodeRef.current as BiquadFilterNode, filter, audioCtxRef.current);
    }
  };

  // Monitor Mic Switch
  const toggleMonitor = () => {
    const next = !monitorMic;
    setMonitorMic(next);
    if (monitorGainNodeRef.current && audioCtxRef.current) {
      monitorGainNodeRef.current.gain.setValueAtTime(
        next ? 0.8 : 0.0,
        audioCtxRef.current.currentTime
      );
    }
  };

  // Gain slider change
  const handleGainChange = (val: number) => {
    setMicGainValue(val);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(val, audioCtxRef.current.currentTime);
    }
  };

  // Background Bed Music Generator
  const playBackgroundBed = (type: 'none' | 'lofi' | 'news' | 'synth' | 'funk') => {
    stopBackgroundBed();
    setActiveBed(type);

    if (type === 'none') return;

    try {
      const actx = getAudioContext();
      const masterBedGain = actx.createGain();
      masterBedGain.gain.setValueAtTime(bedVolume, actx.currentTime);
      masterBedGain.connect(actx.destination);

      let isPlaying = true;
      let intervalId: NodeJS.Timeout;

      if (type === 'lofi') {
        // Soft lofi chords loop
        const chords = [
          [261.63, 329.63, 392.0, 493.88], // Cmaj7
          [220.0, 261.63, 329.63, 392.0], // Am7
          [174.61, 220.0, 261.63, 329.63], // Fmaj7
          [196.0, 246.94, 293.66, 349.23], // G7
        ];
        let chordIdx = 0;

        const playChordStep = () => {
          if (!isPlaying) return;
          const currentChord = chords[chordIdx];
          chordIdx = (chordIdx + 1) % chords.length;

          currentChord.forEach((freq) => {
            const osc = actx.createOscillator();
            const g = actx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, actx.currentTime);

            g.gain.setValueAtTime(0.001, actx.currentTime);
            g.gain.linearRampToValueAtTime(0.08, actx.currentTime + 0.1);
            g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 2.4);

            osc.connect(g);
            g.connect(masterBedGain);

            osc.start(actx.currentTime);
            osc.stop(actx.currentTime + 2.5);
          });
        };

        playChordStep();
        intervalId = setInterval(playChordStep, 2500);
      } else if (type === 'news') {
        // Pulse electronic breaking news ticker loop
        let step = 0;
        const playTicker = () => {
          if (!isPlaying) return;
          const freq = step % 4 === 3 ? 880 : 440;
          step++;

          const osc = actx.createOscillator();
          const g = actx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, actx.currentTime);

          g.gain.setValueAtTime(0.1, actx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.12);

          osc.connect(g);
          g.connect(masterBedGain);

          osc.start(actx.currentTime);
          osc.stop(actx.currentTime + 0.15);
        };

        playTicker();
        intervalId = setInterval(playTicker, 400);
      } else if (type === 'synth') {
        // Synthwave bass pulse
        const notes = [110, 110, 130.81, 146.83, 110, 110, 98.0, 123.47];
        let noteIdx = 0;

        const playSynthPulse = () => {
          if (!isPlaying) return;
          const freq = notes[noteIdx];
          noteIdx = (noteIdx + 1) % notes.length;

          const osc = actx.createOscillator();
          const g = actx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, actx.currentTime);

          g.gain.setValueAtTime(0.12, actx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.3);

          osc.connect(g);
          g.connect(masterBedGain);

          osc.start(actx.currentTime);
          osc.stop(actx.currentTime + 0.35);
        };

        playSynthPulse();
        intervalId = setInterval(playSynthPulse, 350);
      } else if (type === 'funk') {
        // Funky slap bass & stabs
        const notes = [164.81, 196.0, 220.0, 246.94, 293.66];
        let idx = 0;

        const playFunkStep = () => {
          if (!isPlaying) return;
          const freq = notes[idx % notes.length];
          idx++;

          const osc = actx.createOscillator();
          const g = actx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, actx.currentTime);

          g.gain.setValueAtTime(0.09, actx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.22);

          osc.connect(g);
          g.connect(masterBedGain);

          osc.start(actx.currentTime);
          osc.stop(actx.currentTime + 0.25);
        };

        playFunkStep();
        intervalId = setInterval(playFunkStep, 300);
      }

      bedOscillatorsRef.current = {
        stop: () => {
          isPlaying = false;
          if (intervalId) clearInterval(intervalId);
          masterBedGain.disconnect();
        },
      };
    } catch (err) {
      console.error('Failed to start background bed:', err);
    }
  };

  const stopBackgroundBed = () => {
    if (bedOscillatorsRef.current) {
      bedOscillatorsRef.current.stop();
      bedOscillatorsRef.current = null;
    }
    setActiveBed('none');
  };

  // Start Live Recording
  const startRecording = async () => {
    setRecordedBlobUrl(null);
    recordedChunksRef.current = [];
    setRecordSeconds(0);

    const actx = getAudioContext();

    // Use stream from Master Destination or capture Mic Stream directly
    let recordStream: MediaStream;
    if (masterDestinationRef.current) {
      recordStream = masterDestinationRef.current.stream;
    } else if (streamRef.current) {
      recordStream = streamRef.current;
    } else {
      // If mic is off, create dummy audio stream or start mic first
      await startMicrophone();
      if (masterDestinationRef.current) {
        recordStream = masterDestinationRef.current.stream;
      } else {
        alert('Please enable Microphone or Audio source before recording.');
        return;
      }
    }

    try {
      const recorder = new MediaRecorder(recordStream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '',
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedBlobUrl(url);
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start MediaRecorder:', err);
      alert('Recording failed on this browser device.');
    }
  };

  // Stop Live Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
  };

  // Trigger Sound Effect
  const triggerSound = (s: SoundEffect) => {
    setLastTriggeredFx(s.name);
    s.play();
    setTimeout(() => setLastTriggeredFx(null), 800);
  };

  // Copy Stream Link
  const handleCopyStreamLink = () => {
    const streamUrl = `${window.location.origin}?live_radio_studio=active&room=FM-${Math.floor(
      100 + Math.random() * 900
    )}`;
    navigator.clipboard.writeText(streamUrl);
    setCopiedStreamLink(true);
    setTimeout(() => setCopiedStreamLink(false), 2000);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-fade-in overflow-y-auto">
      {/* Modal Card Window */}
      <div className="relative w-full max-w-5xl bg-[#0d0e15] border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Studio Top Bar */}
        <div className="px-6 py-4 bg-[#121420] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 shadow-lg shadow-red-500/20">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-wide text-white uppercase">
                  LIVE RADIO BROADCAST STUDIO
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-widest animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  ON AIR
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Speak live, drop 600+ sound FX, stream to OBS or record full broadcasts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Stream Out Share Link */}
            <button
              onClick={handleCopyStreamLink}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 transition-colors"
              title="Copy Live Stream Studio Link for OBS / Discord / Audience"
            >
              {copiedStreamLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Stream Out Link</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Top Live Dashboard: Visualizer + Mic Console + Broadcast Recorder */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Live Visualizer & Mic Main Deck (7 cols) */}
            <div className="lg:col-span-7 bg-[#131522] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              {/* Canvas Audio Spectrum Visualizer */}
              <div className="relative w-full h-28 rounded-xl overflow-hidden border border-white/10 shadow-inner">
                <canvas ref={canvasRef} width={600} height={112} className="w-full h-full block" />
                <div className="absolute top-2 left-3 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] font-mono text-emerald-400/90 tracking-wider uppercase font-bold">
                    {isMicActive ? 'MIC ACTIVE • LIVE SPECTRUM' : 'MIC MUTED • STANDBY'}
                  </span>
                </div>

                {lastTriggeredFx && (
                  <div className="absolute bottom-2 right-3 px-2.5 py-1 rounded-lg bg-amber-500 text-black text-[11px] font-black uppercase tracking-wider animate-bounce shadow-lg">
                    ⚡ {lastTriggeredFx}
                  </div>
                )}
              </div>

              {/* Mic Controls Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                {/* Main Mic On/Mute Button */}
                <button
                  onClick={toggleMic}
                  className={`flex-1 flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl font-extrabold text-sm tracking-wide transition-all shadow-xl ${
                    isMicActive
                      ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white shadow-red-500/30 hover:brightness-110 active:scale-98'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 active:scale-98'
                  }`}
                >
                  {isMicActive ? (
                    <>
                      <MicOff className="w-5 h-5 text-white" />
                      <span>MUTE MICROPHONE</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5 text-emerald-400 animate-pulse" />
                      <span>GO LIVE (ENABLE MIC)</span>
                    </>
                  )}
                </button>

                {/* Headphone Monitor Toggle */}
                <button
                  onClick={toggleMonitor}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border text-xs font-bold transition-colors ${
                    monitorMic
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                      : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white'
                  }`}
                  title="Hear your microphone through headphones (use headphones to prevent echo)"
                >
                  {monitorMic ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
                  <span>MONITOR</span>
                </button>
              </div>

              {/* Mic Gain Slider & Voice Filter Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                {/* Mic Gain Boost */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-neutral-300">Mic Boost Gain</span>
                    <span className="font-mono text-xs text-amber-400 font-bold">
                      {Math.round(micGainValue * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="2.5"
                    step="0.05"
                    value={micGainValue}
                    onChange={(e) => handleGainChange(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                {/* Voice EQ Profile selector */}
                <div>
                  <span className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Studio Voice Filter
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(
                      [
                        { id: 'warm_fm', label: 'Warm Studio' },
                        { id: 'clean', label: 'Clean' },
                        { id: 'deep_bass', label: 'Deep' },
                        { id: 'telephone', label: 'Phone' },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        onClick={() => handleVoiceFilterChange(f.id)}
                        className={`py-1 px-1.5 rounded-lg text-[10px] font-bold tracking-tight text-center transition-colors border ${
                          voiceFilter === f.id
                            ? 'bg-amber-400 text-black border-amber-400 font-black'
                            : 'bg-white/5 text-neutral-400 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {micError && (
                <p className="text-xs text-red-400 bg-red-950/30 border border-red-500/20 p-2 rounded-xl">
                  ⚠️ {micError}
                </p>
              )}
            </div>

            {/* Right: Background Bed Player & Broadcast Recorder Deck (5 cols) */}
            <div className="lg:col-span-5 bg-[#131522] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              {/* Broadcast Recording Engine */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Tv className="w-4 h-4 text-red-400" />
                    SHOW RECORDER
                  </span>
                  {isRecording && (
                    <span className="font-mono text-xs font-bold text-red-400 animate-pulse bg-red-950/40 px-2 py-0.5 rounded-full border border-red-500/30">
                      🔴 REC {Math.floor(recordSeconds / 60)}:
                      {String(recordSeconds % 60).padStart(2, '0')}
                    </span>
                  )}
                </div>

                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-600/20 text-red-300 border border-red-500/40 font-bold text-xs hover:bg-red-600/30 transition-all"
                  >
                    <Square className="w-3.5 h-3.5 fill-red-400 text-red-400" />
                    <span>START RECORDING BROADCAST</span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-600 text-white font-black text-xs hover:bg-red-500 transition-all shadow-lg shadow-red-500/30 animate-pulse"
                  >
                    <Square className="w-3.5 h-3.5 fill-white text-white" />
                    <span>STOP & SAVE RECORDING</span>
                  </button>
                )}

                {recordedBlobUrl && (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-2">
                    <div className="truncate">
                      <span className="block text-xs font-bold text-emerald-300">
                        Broadcast Saved (.webm)
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        Includes Voice + Sound FX + Music
                      </span>
                    </div>
                    <a
                      href={recordedBlobUrl}
                      download={`Radio_Show_Broadcast_${Date.now()}.webm`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-extrabold hover:bg-emerald-400 transition-colors shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Background Music Bed Selector */}
              <div className="space-y-2.5 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Music className="w-4 h-4 text-purple-400" />
                    BACKGROUND MUSIC BED
                  </span>
                  <span className="font-mono text-xs text-purple-400 font-bold">
                    {Math.round(bedVolume * 100)}%
                  </span>
                </div>

                {/* Preset Bed Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'lofi', label: '☕ Chill Lofi' },
                    { id: 'news', label: '📻 Breaking News' },
                    { id: 'synth', label: '⚡ Synth Drive' },
                    { id: 'funk', label: '🎷 Funky Talk' },
                  ].map((bed) => {
                    const isActive = activeBed === bed.id;
                    return (
                      <button
                        key={bed.id}
                        onClick={() =>
                          isActive ? stopBackgroundBed() : playBackgroundBed(bed.id as any)
                        }
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-left flex items-center justify-between ${
                          isActive
                            ? 'bg-purple-500/30 text-purple-200 border-purple-500 shadow-md shadow-purple-500/20'
                            : 'bg-white/5 text-neutral-400 border-white/5 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span>{bed.label}</span>
                        {isActive && <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />}
                      </button>
                    );
                  })}
                </div>

                {/* Bed Volume Slider */}
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.02"
                  value={bedVolume}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setBedVolume(v);
                  }}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Live Studio Music Deck Section */}
          <div className="space-y-3">
            <YouTubeMusicStudioDeck />
          </div>

          {/* Quick Trigger Soundboard Deck & Modal Trigger */}
          <div className="bg-[#131522] border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">
                  INSTANT SOUNDBOARD PADS
                </h3>
                <span className="text-xs text-neutral-400">(Trigger live on air)</span>
              </div>

              <button
                onClick={() => setShowFullSoundboard(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all hover:scale-105"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>OPEN ALL 600+ FX LIBRARY</span>
              </button>
            </div>

            {/* Quick Trigger FX Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              {quickPads.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => triggerSound(sound)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-150 text-center ${sound.color} hover:scale-105 active:scale-95 shadow-md`}
                >
                  <span className="text-2xl mb-1">{sound.emoji}</span>
                  <span className="text-[11px] font-bold leading-tight truncate w-full">
                    {sound.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Teleprompter / Host Scratchpad Section */}
          <div className="bg-[#131522] border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">
                  LIVE HOST TELEPROMPTER & SHOW NOTES
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Font:</span>
                {(['sm', 'base', 'lg', 'xl'] as const).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setTeleprompterFontSize(sz)}
                    className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      teleprompterFontSize === sz
                        ? 'bg-cyan-500 text-black'
                        : 'bg-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              placeholder="Paste your AI radio show script or type live talk points here to read while host on air..."
              className={`w-full h-36 p-4 rounded-xl bg-[#090a0f] border border-white/10 text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-cyan-500/50 leading-relaxed font-sans resize-y custom-scrollbar ${
                teleprompterFontSize === 'sm'
                  ? 'text-xs'
                  : teleprompterFontSize === 'base'
                  ? 'text-sm'
                  : teleprompterFontSize === 'lg'
                  ? 'text-base'
                  : 'text-lg font-medium'
              }`}
            />
          </div>
        </div>

        {/* Studio Bottom Bar */}
        <div className="px-6 py-3.5 bg-[#090a0f] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs text-neutral-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Engine: Web Audio API Synthesis</span>
            </span>
            <span className="hidden sm:inline">• 600+ FX FX Rack Connected</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
          >
            Exit Live Studio
          </button>
        </div>
      </div>

      {/* Embedded 600+ Full Soundboard Modal */}
      <SoundboardModal
        show={showFullSoundboard}
        onClose={() => setShowFullSoundboard(false)}
        pinnedSoundIds={pinnedIds}
        onTogglePin={(id) =>
          setPinnedIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
        }
      />
    </div>
  );
};
