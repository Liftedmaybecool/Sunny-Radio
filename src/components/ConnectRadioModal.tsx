import React, { useState } from 'react';
import {
  Radio,
  Wifi,
  Bluetooth,
  Rss,
  Copy,
  Check,
  X,
  Volume2,
  ExternalLink,
  Car,
  Tv,
  Cast,
} from 'lucide-react';
import { RadioShow } from '../types';

interface ConnectRadioModalProps {
  show: RadioShow;
  onClose: () => void;
}

export const ConnectRadioModal: React.FC<ConnectRadioModalProps> = ({ show, onClose }) => {
  const [activeTab, setActiveTab] = useState<'bluetooth' | 'stream' | 'podcast'>('bluetooth');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const streamUrl = `${window.location.origin}/api/radio/stream/${show.id}.m3u`;
  const rssUrl = `${window.location.origin}/api/radio/rss/${show.id}.xml`;
  const directLink = `${window.location.origin}/?showId=${show.id}`;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0f0f15] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#14141c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">Broadcast & Connect Studio</h2>
              <p className="text-xs text-neutral-400">
                Connect your show to car stereos, Bluetooth, smart speakers, and podcast apps
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#121218] px-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('bluetooth')}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-extrabold tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'bluetooth'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Bluetooth className="w-4 h-4" />
            <span>BLUETOOTH & CAR STEREO</span>
          </button>

          <button
            onClick={() => setActiveTab('stream')}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-extrabold tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'stream'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Wifi className="w-4 h-4" />
            <span>LIVE STREAM (M3U)</span>
          </button>

          <button
            onClick={() => setActiveTab('podcast')}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-extrabold tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'podcast'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Rss className="w-4 h-4" />
            <span>PODCAST RSS</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">

          {/* TAB 2: BLUETOOTH & CAR */}
          {activeTab === 'bluetooth' && (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Bluetooth className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Bluetooth Car Stereo & Speakers</h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Stream high-fidelity 24-bit/48kHz station audio to any paired Bluetooth vehicle or smart speaker.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 font-bold text-xs text-cyan-400 mb-2">
                    <Car className="w-4 h-4" />
                    <span>Apple CarPlay / Android Auto</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Launch our dedicated high-visibility Car Mode with oversized controls for safe on-the-road listening.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-400 mb-2">
                    <Cast className="w-4 h-4" />
                    <span>Smart Speakers / AirPlay</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Use your browser's native Cast or AirPlay audio routing to play live shows on Sonos, HomePod, or Echo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STREAM M3U */}
          {activeTab === 'stream' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-300 leading-relaxed">
                Use this stream link in media player apps (VLC, TuneIn, Car Head Units, WebRadio) to stream your radio show live on any device.
              </p>

              <div className="bg-black/50 border border-white/10 rounded-2xl p-3 flex items-center justify-between gap-3">
                <code className="text-xs text-cyan-300 font-mono truncate select-all">
                  {streamUrl}
                </code>
                <button
                  onClick={() => copyToClipboard(streamUrl, 'stream')}
                  className="px-3 py-1.5 rounded-xl bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 shrink-0 hover:bg-cyan-300 transition-colors"
                >
                  {copiedField === 'stream' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>COPY M3U</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: PODCAST RSS */}
          {activeTab === 'podcast' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-300 leading-relaxed">
                Import this custom generated Podcast RSS feed into Apple Podcasts, Overcast, Pocket Casts, or Spotify to subscribe to ongoing radio show episodes.
              </p>

              <div className="bg-black/50 border border-white/10 rounded-2xl p-3 flex items-center justify-between gap-3">
                <code className="text-xs text-amber-300 font-mono truncate select-all">
                  {rssUrl}
                </code>
                <button
                  onClick={() => copyToClipboard(rssUrl, 'rss')}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 shrink-0 hover:bg-amber-300 transition-colors"
                >
                  {copiedField === 'rss' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>COPY RSS</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-[#121218] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs tracking-wider transition-colors"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
