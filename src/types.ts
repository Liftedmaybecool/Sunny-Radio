export type ShowCategory = 'TECH & AI' | 'ARTS & LIFE' | 'NEWS & SPORTS';

export type ShowTone = 'INFORMATIVE' | 'COMEDIC' | 'DEBATE' | 'DRAMATIC' | 'CASUAL' | 'NIGHT TALK';

export type SoundCue = 'airhorn' | 'scratch' | 'jingle' | 'cheer' | 'applause' | 'laugh' | 'news_flash';

export interface ShowSegment {
  id: string;
  speaker: 'host1' | 'host2' | 'sfx' | 'intro' | 'outro';
  speakerName: string;
  speakerRole: string; // e.g. "Main Host" or "Co-Host & Analyst"
  text: string;
  timestamp: string; // e.g. "0:15"
  sfxCue?: SoundCue | null;
  durationSec: number;
}

export interface RadioShow {
  id: string;
  topic: string;
  title: string;
  tagline: string;
  durationMinutes: number;
  tone: ShowTone;
  host1Name: string;
  host1Title: string;
  host2Name: string;
  host2Title: string;
  segments: ShowSegment[];
  summary: string;
  createdAt: number;
}

export interface ShowTemplate {
  id: string;
  title: string;
  category: ShowCategory;
  prompt: string;
  description: string;
  durationMinutes: number;
  tone: ShowTone;
}
