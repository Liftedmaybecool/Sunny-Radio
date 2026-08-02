import React, { useEffect, useRef } from 'react';

interface AudioWaveformProps {
  isPlaying: boolean;
  speaker: 'host1' | 'host2' | 'intro' | 'outro' | 'sfx';
  sfxCue?: string | null;
  height?: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isPlaying,
  speaker,
  sfxCue,
  height = 56,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const numBars = 36;
    const heights = new Array(numBars).fill(4);
    const targetHeights = new Array(numBars).fill(4);

    // Color palette based on current speaker
    let primaryColor = '#3b82f6'; // Blue for host1
    let secondaryColor = '#06b6d4'; // Cyan

    if (speaker === 'host2') {
      primaryColor = '#a855f7'; // Purple
      secondaryColor = '#ec4899'; // Pink
    } else if (speaker === 'intro' || speaker === 'outro' || speaker === 'sfx' || sfxCue) {
      primaryColor = '#f59e0b'; // Amber
      secondaryColor = '#10b981'; // Emerald
    }

    let phase = 0;

    const render = () => {
      if (!canvas || !ctx) return;

      const width = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, width, ch);

      phase += 0.08;

      const barWidth = width / numBars - 2;

      for (let i = 0; i < numBars; i++) {
        if (isPlaying) {
          // Generate realistic audio spectrum wave formula combining multiple sines + random noise
          const centerFactor = 1 - Math.abs(i - numBars / 2) / (numBars / 2);
          const noise = Math.random() * 0.4 + 0.6;
          const sineWave =
            Math.sin(phase + i * 0.3) * 0.3 +
            Math.cos(phase * 1.5 + i * 0.2) * 0.3 +
            Math.sin(phase * 0.7 - i * 0.5) * 0.2 +
            0.5;

          const target = Math.max(6, sineWave * ch * 0.85 * centerFactor * noise);
          targetHeights[i] = target;
        } else {
          targetHeights[i] = 4; // Idle baseline
        }

        // Smooth interpolation (lerp)
        heights[i] += (targetHeights[i] - heights[i]) * 0.2;

        const barH = Math.max(3, heights[i]);
        const x = i * (barWidth + 2);
        const y = (ch - barH) / 2;

        // Gradient for each bar
        const gradient = ctx.createLinearGradient(0, y + barH, 0, y);
        gradient.addColorStop(0, primaryColor);
        gradient.addColorStop(1, secondaryColor);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(x, y, barWidth, barH, 2);
        } else {
          ctx.rect(x, y, barWidth, barH);
        }
        ctx.fill();
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    // Set high DPI canvas resolution
    const updateCanvasSize = () => {
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * (window.devicePixelRatio || 1);
        canvas.height = height * (window.devicePixelRatio || 1);
      }
    };

    updateCanvasSize();
    render();

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [isPlaying, speaker, sfxCue, height]);

  return (
    <div className="w-full bg-[#08080d] border border-white/10 rounded-2xl p-3 flex flex-col justify-between shadow-inner">
      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-neutral-600'
            }`}
          />
          <span className="font-bold uppercase tracking-wider">
            {isPlaying ? 'AUDIO OUTPUT ACTIVE' : 'AUDIO PAUSED'}
          </span>
        </div>
        <span className="text-neutral-500">24-BIT / 48kHz WAVEFORM</span>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-12 block"
        style={{ height: `${height}px` }}
      />
    </div>
  );
};
