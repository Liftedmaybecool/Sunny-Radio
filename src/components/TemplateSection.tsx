import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { ShowCategory, ShowTemplate } from '../types';

interface TemplateSectionProps {
  onSelectTemplate: (template: ShowTemplate) => void;
}

const CATEGORIES: ShowCategory[] = ['TECH & AI', 'ARTS & LIFE', 'NEWS & SPORTS'];

const TEMPLATES: ShowTemplate[] = [
  // Tech & AI
  {
    id: 'tpl-1',
    title: 'Daily Hacker Bites',
    category: 'TECH & AI',
    prompt: 'Voice a digest of the top stories currently on Hacker News, covering developer trends and AI releases.',
    description: 'Voice a digest of the top stories currently on Hacker News',
    durationMinutes: 3,
    tone: 'INFORMATIVE',
  },
  {
    id: 'tpl-2',
    title: 'GitHub Roundtable',
    category: 'TECH & AI',
    prompt: 'Review the AlphaFold 3 repository and Google DeepMind biology model breakthroughs with expert commentary.',
    description: "Review the AlphaFold 3 repository and Google DeepMind's biology model",
    durationMinutes: 5,
    tone: 'INFORMATIVE',
  },
  {
    id: 'tpl-3',
    title: 'Agentic AI Revolution',
    category: 'TECH & AI',
    prompt: 'Discuss the rise of Gemini autonomous agents, multi-agent frameworks, tool usage, and the future of AI software development.',
    description: 'Deep dive into autonomous Gemini agents, tool calling, and workflow automation',
    durationMinutes: 5,
    tone: 'DEBATE',
  },

  // Arts & Life
  {
    id: 'tpl-4',
    title: 'Midnight Coffee & Chill',
    category: 'ARTS & LIFE',
    prompt: 'A warm, relaxing late-night radio conversation on creative flow, vinyl music, and finding focus in a noisy world.',
    description: 'Relaxing late-night jazz lounge talk about creative inspiration & philosophy',
    durationMinutes: 3,
    tone: 'NIGHT TALK',
  },
  {
    id: 'tpl-5',
    title: 'Pop Culture Pulse',
    category: 'ARTS & LIFE',
    prompt: 'High-energy banter dissecting this week’s top movie premieres, chart-topping albums, and internet viral moments.',
    description: 'Fun banter on trending movies, music releases, and viral memes',
    durationMinutes: 3,
    tone: 'COMEDIC',
  },
  {
    id: 'tpl-6',
    title: 'The Mindful Minute',
    category: 'ARTS & LIFE',
    prompt: 'An uplifting morning show segment on micro-habits, stoic mindfulness, and designing a calm daily routine.',
    description: 'Calm, inspiring discussion on daily habits, focus, and modern productivity',
    durationMinutes: 3,
    tone: 'CASUAL',
  },

  // News & Sports
  {
    id: 'tpl-7',
    title: 'Global Headlines Express',
    category: 'NEWS & SPORTS',
    prompt: 'A fast-moving morning radio briefing on international economic news, central bank decisions, and global market updates.',
    description: 'Fast-paced morning roundup of international news and tech finance',
    durationMinutes: 3,
    tone: 'INFORMATIVE',
  },
  {
    id: 'tpl-8',
    title: 'Game Day Playbook',
    category: 'NEWS & SPORTS',
    prompt: 'High-octane sports talk radio debating weekend match highlights, tactical plays, MVP performance, and clutch moments.',
    description: 'High-energy sports debate on match highlights and tactical breakdown',
    durationMinutes: 5,
    tone: 'DEBATE',
  },
  {
    id: 'tpl-9',
    title: 'Space Exploration Daily',
    category: 'NEWS & SPORTS',
    prompt: 'Live news flash on Artemis lunar missions, Mars rover discoveries, and deep space telescope images.',
    description: 'Live radio report on rocket launches and exoplanet breakthroughs',
    durationMinutes: 3,
    tone: 'INFORMATIVE',
  },
];

export const TemplateSection: React.FC<TemplateSectionProps> = ({ onSelectTemplate }) => {
  const [activeCategory, setActiveCategory] = useState<ShowCategory>('TECH & AI');

  const filteredTemplates = TEMPLATES.filter((t) => t.category === activeCategory);

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#101015]/95 border border-white/10 rounded-[32px] p-6 md:p-8 backdrop-blur-sm">
      {/* Header & Tabs Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-[#a1a1aa] uppercase">
          {/* Sparkles Icon */}
          <svg
            className="w-4 h-4 text-neutral-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2v20M2 12h20M6 6l12 12M6 18L18 6" />
          </svg>
          <span>TRY A TEMPLATE</span>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-1 bg-[#181822] p-1 rounded-full border border-white/5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              id={`cat-tab-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-extrabold tracking-wider transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-white text-black shadow-md'
                  : 'text-[#a1a1aa] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            id={`template-card-${template.id}`}
            onClick={() => onSelectTemplate(template)}
            className="group relative bg-[#171720] hover:bg-[#1f1f2a] border border-white/5 hover:border-white/15 rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-bold text-base group-hover:text-cyan-300 transition-colors">
                  {template.title}
                </h3>
                <ArrowRight className="w-4 h-4 text-[#a1a1aa] group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-[#a1a1aa] font-normal leading-relaxed">
                {template.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

