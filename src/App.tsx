import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { AnimatedBackground } from './components/AnimatedBackground';
import { CareerInputForm } from './components/CareerInputForm';
import { GeminiMentorPanel } from './components/GeminiMentorPanel';
import { GeneratingState } from './components/GeneratingState';
import { HeroSection } from './components/HeroSection';
import { Navbar } from './components/Navbar';
import { ResultsDashboard } from './components/ResultsDashboard';
import type {
  BackgroundMode,
  CareerRoadmapResult,
  MentorMessage,
  RoadmapFormInput,
  ThemeMode,
} from './types/roadmap';

const STORAGE_KEY = 'ai_career_navigator_state_v1';

const DEFAULT_FORM_INPUT: RoadmapFormInput = {
  studentName: '',
  currentSkills: '',
  targetRole: 'AI Engineer',
  customRole: '',
  experienceLevel: 'Beginner',
  hoursPerWeek: 10,
  careerGoal: '',
};

interface PersistedState {
  formData: RoadmapFormInput;
  roadmap: CareerRoadmapResult | null;
  completedWeeks: number[];
  backgroundMode: BackgroundMode;
  themeMode: ThemeMode;
  mentorMessages: MentorMessage[];
}

function loadPersistedState(): PersistedState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        formData: DEFAULT_FORM_INPUT,
        roadmap: null,
        completedWeeks: [],
        backgroundMode: 'split',
        themeMode: 'light',
        mentorMessages: [],
      };
    }
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    const validMode =
      parsed.backgroundMode === 'black' ||
      parsed.backgroundMode === 'white' ||
      parsed.backgroundMode === 'split'
        ? parsed.backgroundMode
        : 'split';

    const validTheme: ThemeMode = parsed.themeMode === 'dark' ? 'dark' : 'light';

    const candidateRoadmap = parsed.roadmap;
    const isValidRoadmap =
      candidateRoadmap &&
      typeof candidateRoadmap === 'object' &&
      Array.isArray(candidateRoadmap.existingSkills) &&
      Array.isArray(candidateRoadmap.missingSkills) &&
      Array.isArray(candidateRoadmap.recommendedSkills) &&
      Array.isArray(candidateRoadmap.weeklyRoadmap) &&
      Array.isArray(candidateRoadmap.projects) &&
      Array.isArray(candidateRoadmap.careerTips);

    return {
      formData: { ...DEFAULT_FORM_INPUT, ...(parsed.formData ?? {}) },
      roadmap: isValidRoadmap ? candidateRoadmap : null,
      completedWeeks: Array.isArray(parsed.completedWeeks) ? parsed.completedWeeks : [],
      backgroundMode: validMode,
      themeMode: validTheme,
      mentorMessages: Array.isArray(parsed.mentorMessages) ? parsed.mentorMessages : [],
    };
  } catch {
    return {
      formData: DEFAULT_FORM_INPUT,
      roadmap: null,
      completedWeeks: [],
      backgroundMode: 'split',
      themeMode: 'light',
      mentorMessages: [],
    };
  }
}

export default function App() {
  const initialState = loadPersistedState();

  const [formData, setFormData] = useState<RoadmapFormInput>(initialState.formData);
  const [roadmap, setRoadmap] = useState<CareerRoadmapResult | null>(initialState.roadmap);
  const [completedWeeks, setCompletedWeeks] = useState<number[]>(initialState.completedWeeks);
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>(initialState.backgroundMode);
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialState.themeMode);
  const [mentorMessages, setMentorMessages] = useState<MentorMessage[]>(initialState.mentorMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resultsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
  }, [themeMode]);

  useEffect(() => {
    try {
      const payload: PersistedState = {
        formData,
        roadmap,
        completedWeeks,
        backgroundMode,
        themeMode,
        mentorMessages,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors cleanly
    }
  }, [formData, roadmap, completedWeeks, backgroundMode, themeMode, mentorMessages]);

  const handleToggleTheme = () => {
    setThemeMode((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      setBackgroundMode(next === 'dark' ? 'black' : 'split');
      return next;
    });
  };

  const handleChangeBackgroundMode = (mode: BackgroundMode) => {
    setBackgroundMode(mode);
    if (mode === 'white' && themeMode === 'dark') {
      setThemeMode('light');
    }
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleGenerateRoadmap = async (input: RoadmapFormInput) => {
    setIsLoading(true);
    setErrorMessage(null);

    window.setTimeout(() => {
      resultsContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);

    try {
      const response = await fetch('/api/roadmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Unable to generate your career roadmap. Please try again.');
      }

      setRoadmap(data as CareerRoadmapResult);
      setCompletedWeeks([]);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Network error while reaching the server. Please verify your connection and retry.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = () => {
    setFormData(DEFAULT_FORM_INPUT);
    setRoadmap(null);
    setCompletedWeeks([]);
    setMentorMessages([]);
    setErrorMessage(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    scrollToSection('analyzer');
  };

  const handleGenerateNew = () => {
    scrollToSection('analyzer');
    const skillsEl = document.getElementById('currentSkills');
    if (skillsEl instanceof HTMLTextAreaElement) {
      window.setTimeout(() => skillsEl.focus(), 350);
    }
  };

  const handleToggleWeek = (weekNum: number) => {
    setCompletedWeeks((prev) =>
      prev.includes(weekNum) ? prev.filter((w) => w !== weekNum) : [...prev, weekNum]
    );
  };

  const effectiveBackgroundMode: BackgroundMode =
    themeMode === 'dark' && backgroundMode === 'white' ? 'black' : backgroundMode;
  const isDarkCanvas = themeMode === 'dark' || effectiveBackgroundMode === 'black';

  return (
    <div
      className={`relative min-h-screen transition-colors duration-300 ${
        isDarkCanvas ? 'bg-[#111318] text-slate-100' : 'bg-white text-slate-900'
      }`}
    >
      <AnimatedBackground mode={effectiveBackgroundMode} />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar
          hasRoadmap={Boolean(roadmap)}
          themeMode={themeMode}
          backgroundMode={effectiveBackgroundMode}
          onStartNew={handleGenerateNew}
          onNavigate={scrollToSection}
        />

        <HeroSection
          themeMode={themeMode}
          backgroundMode={effectiveBackgroundMode}
          onToggleTheme={handleToggleTheme}
          onChangeBackgroundMode={handleChangeBackgroundMode}
          onJumpToAnalyzer={() => scrollToSection('analyzer')}
        />

        <main className="mx-auto w-full max-w-6xl flex-1 space-y-10 px-4 py-10 sm:px-6 lg:py-12">
          <CareerInputForm
            formData={formData}
            isLoading={isLoading}
            onChange={setFormData}
            onSubmit={handleGenerateRoadmap}
            onClearAll={handleClearAll}
          />

          <div ref={resultsContainerRef} className="scroll-mt-20 space-y-6">
            <AnimatePresence mode="wait">
              {errorMessage && !isLoading && (
                <motion.div
                  key="error-banner"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  role="alert"
                  className="flex flex-col justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900 dark:border-red-900/70 dark:bg-red-950/70 dark:text-red-200 sm:flex-row sm:items-center"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
                    <div>
                      <h3 className="text-sm font-bold text-red-900 dark:text-red-100">
                        Analysis Could Not Be Completed
                      </h3>
                      <p className="mt-0.5 text-sm text-red-800 dark:text-red-200">{errorMessage}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleGenerateRoadmap(formData)}
                      className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-red-700 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-800 whitespace-nowrap"
                    >
                      <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Retry</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setErrorMessage(null)}
                      aria-label="Dismiss error"
                      className="cursor-pointer rounded-lg p-1.5 text-red-700 transition-colors hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900/60"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {isLoading ? (
                <GeneratingState key="loading" />
              ) : roadmap ? (
                <ResultsDashboard
                  key={roadmap.generatedAt}
                  roadmap={roadmap}
                  completedWeeks={completedWeeks}
                  onToggleWeek={handleToggleWeek}
                  onGenerateNew={handleGenerateNew}
                  onClearAll={handleClearAll}
                />
              ) : (
                <motion.section
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`rounded-2xl border border-dashed p-8 text-center backdrop-blur-sm sm:p-10 no-print ${
                    isDarkCanvas
                      ? 'border-sky-400/35 bg-[#161B24]/90 text-white'
                      : 'border-slate-300 bg-slate-50/90 text-[#111318]'
                  }`}
                >
                  <h3 className="font-display text-lg font-bold">
                    Your Personalized Career Dashboard Will Appear Here
                  </h3>
                  <p className={`mx-auto mt-2 max-w-xl text-sm ${isDarkCanvas ? 'text-slate-300' : 'text-slate-600'}`}>
                    Fill out your skills, target role, and weekly study hours above, then click{' '}
                    <span className={`font-semibold ${isDarkCanvas ? 'text-sky-300' : 'text-[#0A192F]'}`}>
                      Generate My Career Roadmap
                    </span>{' '}
                    to receive your readiness score, gap breakdown, 8-week schedule, 3 practical projects, and 5 career tips from Google Gemini AI.
                  </p>
                </motion.section>
              )}
            </AnimatePresence>
          </div>

          <GeminiMentorPanel
            roadmap={roadmap}
            messages={mentorMessages}
            onAddMessage={(msg) => setMentorMessages((prev) => [...prev, msg])}
            onClearChat={() => setMentorMessages([])}
          />
        </main>

        <footer
          className={`border-t py-6 transition-colors duration-300 no-print ${
            effectiveBackgroundMode === 'white' && themeMode === 'light'
              ? 'border-slate-200 bg-white text-slate-600'
              : 'border-slate-800 bg-[#111318] text-slate-400'
          }`}
        >
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-xs sm:flex-row sm:px-6">
            <span
              className={`font-semibold ${
                effectiveBackgroundMode === 'white' && themeMode === 'light'
                  ? 'text-[#111318]'
                  : 'text-white'
              }`}
            >
              AI Career Navigator – Smart Skill Gap Analyzer
            </span>
            <span>Discover Your Skills. Identify Your Gaps. Build Your Future.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
