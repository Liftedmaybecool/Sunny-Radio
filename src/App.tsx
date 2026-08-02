import React, { useState, useEffect } from 'react';
import { SoundboardToolbar } from './components/SoundboardToolbar';
import { MainHeader } from './components/MainHeader';
import { GeneratorCard } from './components/GeneratorCard';
import { TemplateSection } from './components/TemplateSection';
import { RadioPlayerStudio } from './components/RadioPlayerStudio';
import { LiveRadioStudioModal } from './components/LiveRadioStudioModal';
import { AuthModal, UserProfile } from './components/AuthModal';
import { WelcomeGuideModal } from './components/WelcomeGuideModal';
import { RadioShow, ShowTone, ShowTemplate } from './types';
import { Mic, Radio, Sliders, Play } from 'lucide-react';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(3);
  const [tone, setTone] = useState<ShowTone>('INFORMATIVE');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedShow, setGeneratedShow] = useState<RadioShow | null>(null);
  const [showLiveStudio, setShowLiveStudio] = useState(false);
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);

  // User Auth state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Load stored user on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sunny_radio_user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not read stored user', e);
    }
  }, []);

  const handleOpenAuth = (mode: 'signin' | 'signup' | 'forgot') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLoginSuccess = (user: UserProfile, isNewAccount?: boolean) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('sunny_radio_user', JSON.stringify(user));
    } catch (e) {
      console.warn('Could not save user to storage', e);
    }
    if (isNewAccount) {
      setShowWelcomeGuide(true);
    }
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('sunny_radio_user');
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    try {
      const res = await fetch('/api/radio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          durationMinutes,
          tone,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate radio show');
      }

      const data: RadioShow = await res.json();
      setGeneratedShow(data);
    } catch (err) {
      console.warn('API error or local fallback fallback activation:', err);

      // Create fallback radio show script with multi-host banter and sound cues
      const fallbackShow: RadioShow = {
        id: 'show-' + Date.now(),
        topic: prompt,
        title: `${prompt.slice(0, 32)}: Live On-Air`,
        tagline: 'You are tuned into Gemini AI Radio - The Voice of Next-Gen Intelligence',
        durationMinutes,
        tone,
        host1Name: 'Alex Vance',
        host1Title: 'Lead Radio Anchor',
        host2Name: 'Maya Lin',
        host2Title: 'Senior Tech & Trend Analyst',
        summary: `A high-energy ${durationMinutes}-minute breakdown covering "${prompt}" with deep insights and lively studio debate.`,
        createdAt: Date.now(),
        segments: [
          {
            id: 'seg-1',
            speaker: 'intro',
            speakerName: 'Station Announcer',
            speakerRole: 'Station ID',
            text: 'Locked in live across the globe... You are listening to AI Studio Live Radio!',
            timestamp: '0:00',
            sfxCue: 'jingle',
            durationSec: 5,
          },
          {
            id: 'seg-2',
            speaker: 'host1',
            speakerName: 'Alex Vance',
            speakerRole: 'Lead Radio Anchor',
            text: `Good morning and welcome back to the desk! Today we're diving straight into a massive topic: "${prompt}". Maya, how big of a deal is this right now?`,
            timestamp: '0:05',
            sfxCue: 'airhorn',
            durationSec: 10,
          },
          {
            id: 'seg-3',
            speaker: 'host2',
            speakerName: 'Maya Lin',
            speakerRole: 'Senior Analyst',
            text: `Alex, it's huge! What we're seeing here is a fundamental shift in how people interact with real-time intelligence. The momentum behind this is wild.`,
            timestamp: '0:15',
            sfxCue: 'scratch',
            durationSec: 12,
          },
          {
            id: 'seg-4',
            speaker: 'host1',
            speakerName: 'Alex Vance',
            speakerRole: 'Lead Radio Anchor',
            text: 'Break down the key mechanics for our listeners tuning in on their commute. What makes this different from everything else out there?',
            timestamp: '0:27',
            sfxCue: null,
            durationSec: 8,
          },
          {
            id: 'seg-5',
            speaker: 'host2',
            speakerName: 'Maya Lin',
            speakerRole: 'Senior Analyst',
            text: 'First, speed and autonomy. Instead of static answers, you have multi-step reasoning, real-time tool orchestration, and instant audio synthesis!',
            timestamp: '0:35',
            sfxCue: 'cheer',
            durationSec: 12,
          },
          {
            id: 'seg-6',
            speaker: 'host1',
            speakerName: 'Alex Vance',
            speakerRole: 'Lead Radio Anchor',
            text: 'And that is a wrap on our quick-hit breakdown! Stay tuned to AI Studio Live Radio for more updates on the hour.',
            timestamp: '0:47',
            sfxCue: 'news_flash',
            durationSec: 8,
          },
        ],
      };

      setGeneratedShow(fallbackShow);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectTemplate = (tpl: ShowTemplate) => {
    setPrompt(tpl.prompt);
    setDurationMinutes(tpl.durationMinutes);
    setTone(tpl.tone);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-white font-sans relative overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      {/* Background Atmosphere Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-purple-900/20 via-emerald-950/20 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-1/4 right-10 w-[400px] h-[400px] bg-cyan-900/10 blur-3xl pointer-events-none rounded-full" />

      {/* Main Layout Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
        {/* Headline Header */}
        <MainHeader
          user={currentUser}
          onOpenAuth={handleOpenAuth}
          onSignOut={handleSignOut}
          onOpenWelcomeGuide={() => setShowWelcomeGuide(true)}
        />

        {/* Studio Soundboard Toolbar */}
        <SoundboardToolbar onOpenLiveStudio={() => setShowLiveStudio(true)} />

        {/* Live Radio Studio Quick Launcher Banner */}
        <div className="w-full max-w-4xl mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-[#111320] to-purple-950/40 border border-red-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="relative p-3 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 shrink-0">
              <Mic className="w-6 h-6 text-red-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black uppercase text-white tracking-wide">
                  LIVE MIC BROADCAST BOOTH
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-mono font-bold border border-red-500/30">
                  REAL-TIME MIC & 600+ FX
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Host your live radio show with microphone speech, background music beds, 600+ sound FX & broadcast recording!
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowLiveStudio(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95 transition-all shrink-0 flex items-center justify-center gap-2"
          >
            <Radio className="w-4 h-4 text-white" />
            <span>ENTER LIVE STUDIO BOOTH</span>
          </button>
        </div>

        {/* Generator Input Box */}
        <GeneratorCard
          prompt={prompt}
          setPrompt={setPrompt}
          durationMinutes={durationMinutes}
          setDurationMinutes={setDurationMinutes}
          tone={tone}
          setTone={setTone}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />

        {/* Templates Section */}
        <TemplateSection onSelectTemplate={handleSelectTemplate} />
      </div>

      {/* Authentication Modal */}
      <AuthModal
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Live Radio Studio Modal */}
      <LiveRadioStudioModal
        show={showLiveStudio}
        onClose={() => setShowLiveStudio(false)}
      />

      {/* Welcome Onboarding Guide Modal */}
      <WelcomeGuideModal
        show={showWelcomeGuide}
        onClose={() => setShowWelcomeGuide(false)}
        onOpenLiveStudio={() => setShowLiveStudio(true)}
      />

      {/* Radio Broadcast Player Studio Modal */}
      {generatedShow && (
        <RadioPlayerStudio
          show={generatedShow}
          onClose={() => setGeneratedShow(null)}
        />
      )}
    </div>
  );
}
