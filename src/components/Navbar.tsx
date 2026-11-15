import { Compass } from 'lucide-react';
import type { BackgroundMode, ThemeMode } from '../types/roadmap';

interface NavbarProps {
  hasRoadmap: boolean;
  themeMode: ThemeMode;
  backgroundMode: BackgroundMode;
  onStartNew: () => void;
  onNavigate: (sectionId: string) => void;
}

export function Navbar({
  hasRoadmap,
  themeMode,
  backgroundMode,
  onStartNew,
  onNavigate,
}: NavbarProps) {
  const isLightHeader = backgroundMode === 'white' && themeMode === 'light';

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-300 no-print ${
        isLightHeader
          ? 'border-slate-200 bg-white/95 text-[#111318]'
          : 'border-slate-800/80 bg-[#111318]/92 text-white'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
        {/* Zone 1: Single-line brand mark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('top');
          }}
          className={`flex items-center gap-2.5 text-lg font-bold tracking-tight whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-md ${
            isLightHeader ? 'text-[#111318]' : 'text-white'
          }`}
        >
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
              isLightHeader
                ? 'bg-[#111318] border-slate-800 text-sky-400'
                : 'bg-[#0F274A] border-sky-400/30 text-sky-400'
            }`}
          >
            <Compass className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <span className="font-display text-[1.08rem] font-extrabold tracking-[-0.025em]">
            AI Career Navigator
          </span>
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav
          className={`hidden md:flex items-center gap-7 text-sm font-medium ${
            isLightHeader ? 'text-slate-600' : 'text-slate-300'
          }`}
          aria-label="Primary Navigation"
        >
          <a
            href="#analyzer"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('analyzer');
            }}
            className={`hover:underline underline-offset-4 decoration-sky-400 transition-colors whitespace-nowrap shrink-0 ${
              isLightHeader ? 'hover:text-[#111318]' : 'hover:text-white'
            }`}
          >
            Analyzer
          </a>
          <a
            href="#roadmap"
            onClick={(e) => {
              e.preventDefault();
              onNavigate(hasRoadmap ? 'roadmap' : 'analyzer');
            }}
            className={`hover:underline underline-offset-4 decoration-sky-400 transition-colors whitespace-nowrap shrink-0 ${
              isLightHeader ? 'hover:text-[#111318]' : 'hover:text-white'
            }`}
          >
            Roadmap
          </a>
          <a
            href="#projects"
            onClick={(e) => {
              e.preventDefault();
              onNavigate(hasRoadmap ? 'projects' : 'analyzer');
            }}
            className={`hover:underline underline-offset-4 decoration-sky-400 transition-colors whitespace-nowrap shrink-0 ${
              isLightHeader ? 'hover:text-[#111318]' : 'hover:text-white'
            }`}
          >
            Projects
          </a>
          <a
            href="#gemini-mentor"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('gemini-mentor');
            }}
            className={`hover:underline underline-offset-4 decoration-sky-400 transition-colors whitespace-nowrap shrink-0 ${
              isLightHeader ? 'hover:text-[#111318]' : 'hover:text-white'
            }`}
          >
            Gemini AI
          </a>
        </nav>

        {/* Zone 3: 1 primary action button */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onStartNew}
            className={`cursor-pointer rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 whitespace-nowrap shrink-0 ${
              isLightHeader
                ? 'bg-[#111318] text-white hover:bg-slate-800'
                : 'bg-white text-[#111318] hover:bg-sky-100'
            }`}
          >
            {hasRoadmap ? 'New Roadmap' : 'Start Analysis'}
          </button>
        </div>
      </div>
    </header>
  );
}
