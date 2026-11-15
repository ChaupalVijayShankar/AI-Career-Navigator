import { motion } from 'motion/react';
import { ArrowDownRight, Compass, Layers, Moon, Sun, Target } from 'lucide-react';
import type { BackgroundMode, ThemeMode } from '../types/roadmap';

interface HeroSectionProps {
  themeMode: ThemeMode;
  backgroundMode: BackgroundMode;
  onToggleTheme: () => void;
  onChangeBackgroundMode: (mode: BackgroundMode) => void;
  onJumpToAnalyzer: () => void;
}

export function HeroSection({
  themeMode,
  backgroundMode,
  onToggleTheme,
  onChangeBackgroundMode,
  onJumpToAnalyzer,
}: HeroSectionProps) {
  const isLightHero = backgroundMode === 'white' && themeMode === 'light';

  return (
    <section
      id="top"
      className={`relative overflow-hidden border-b transition-colors duration-300 ${
        isLightHero
          ? 'border-slate-200 bg-white/90 text-[#111318]'
          : 'border-slate-800 bg-gradient-to-br from-[#0B0D11] via-[#11151E] to-[#0A192F] text-white'
      }`}
    >
      {/* Animated geometric trajectory arcs inside hero */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          initial={{ opacity: 0.14, scale: 0.96 }}
          animate={{ opacity: [0.14, 0.24, 0.14], scale: [0.96, 1.03, 0.96] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute -right-28 -top-32 h-[420px] w-[420px] rounded-full border ${
            isLightHero ? 'border-slate-300/60' : 'border-sky-400/25'
          }`}
        />
        <motion.div
          initial={{ opacity: 0.1, scale: 1 }}
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.05, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className={`absolute -right-12 -top-16 h-[290px] w-[290px] rounded-full border ${
            isLightHero ? 'border-sky-400/35' : 'border-white/15'
          }`}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            <p className={`text-sm font-semibold tracking-wide ${isLightHero ? 'text-sky-700' : 'text-sky-300'}`}>
              Smart Skill Gap Analyzer · Powered by Google Gemini AI
            </p>
            <h1
              className={`mt-2.5 font-display text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl lg:text-[3.5rem] lg:leading-[1.06] [text-wrap:balance] ${
                isLightHero
                  ? 'bg-gradient-to-r from-[#111318] via-[#0F274A] to-sky-600 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-white via-sky-100 to-sky-400 bg-clip-text text-transparent'
              }`}
            >
              AI Career Navigator
            </h1>
            <p
              className={`mt-4 max-w-2xl font-display text-lg font-semibold tracking-[-0.015em] sm:text-2xl ${
                isLightHero ? 'text-slate-800' : 'text-sky-100'
              }`}
            >
              Discover Your Skills. Identify Your Gaps. Build Your Future.
            </p>
            <p
              className={`mt-3 max-w-xl text-sm leading-relaxed sm:text-base ${
                isLightHero ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              Benchmark your current technical strengths against industry expectations, uncover priority skill gaps, and follow a personalized 8-week learning plan with Google Gemini AI.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onJumpToAnalyzer}
                className={`cursor-pointer inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 whitespace-nowrap shrink-0 ${
                  isLightHero
                    ? 'bg-[#111318] text-white hover:bg-slate-800 focus-visible:ring-slate-900'
                    : 'bg-white text-[#111318] hover:bg-sky-100 focus-visible:ring-sky-300'
                }`}
              >
                <span>Analyze Your Skills</span>
                <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
              </button>

              {/* Dark Mode Toggle */}
              <button
                type="button"
                onClick={onToggleTheme}
                aria-pressed={themeMode === 'dark'}
                className={`cursor-pointer inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  isLightHero
                    ? 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
                    : themeMode === 'dark'
                    ? 'border-sky-400/50 bg-sky-400/15 text-sky-200 hover:bg-sky-400/25'
                    : 'border-white/20 bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                {themeMode === 'dark' ? (
                  <>
                    <Sun className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>

              {/* Background Canvas Switcher */}
              <div
                role="group"
                aria-label="Background Style"
                className={`inline-flex items-center gap-1 rounded-lg border p-1 ${
                  isLightHero
                    ? 'border-slate-200 bg-slate-100'
                    : 'border-white/15 bg-white/5'
                }`}
              >
                {(
                  [
                    { id: 'split', label: 'White & Black' },
                    { id: 'black', label: 'Black' },
                    { id: 'white', label: 'White' },
                  ] as const
                ).map((opt) => {
                  const active = backgroundMode === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onChangeBackgroundMode(opt.id)}
                      aria-pressed={active}
                      className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        active
                          ? isLightHero
                            ? 'bg-[#111318] text-white'
                            : 'bg-sky-400 text-[#0A192F]'
                          : isLightHero
                          ? 'text-slate-600 hover:text-slate-900'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div
                className={`flex items-start gap-3.5 rounded-xl border p-4 backdrop-blur-sm ${
                  isLightHero
                    ? 'border-slate-200 bg-slate-50/90'
                    : 'border-white/15 bg-white/5'
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isLightHero ? 'bg-[#111318] text-sky-400' : 'bg-sky-400/15 text-sky-300'
                  }`}
                >
                  <Target className="h-4.5 w-4.5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className={`text-sm font-semibold ${isLightHero ? 'text-[#111318]' : 'text-white'}`}>
                    Google Gemini AI Skill Audit
                  </h2>
                  <p className={`mt-1 text-xs leading-relaxed ${isLightHero ? 'text-slate-600' : 'text-slate-300'}`}>
                    Measures existing capabilities against your target career role to surface critical gaps.
                  </p>
                </div>
              </div>

              <div
                className={`flex items-start gap-3.5 rounded-xl border p-4 backdrop-blur-sm ${
                  isLightHero
                    ? 'border-slate-200 bg-slate-50/90'
                    : 'border-white/15 bg-white/5'
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isLightHero ? 'bg-[#111318] text-sky-400' : 'bg-sky-400/15 text-sky-300'
                  }`}
                >
                  <Compass className="h-4.5 w-4.5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className={`text-sm font-semibold ${isLightHero ? 'text-[#111318]' : 'text-white'}`}>
                    8-Week Paced Curriculum
                  </h2>
                  <p className={`mt-1 text-xs leading-relaxed ${isLightHero ? 'text-slate-600' : 'text-slate-300'}`}>
                    Calibrated to your exact weekly study hours with concrete deliverables each week.
                  </p>
                </div>
              </div>

              <div
                className={`flex items-start gap-3.5 rounded-xl border p-4 backdrop-blur-sm ${
                  isLightHero
                    ? 'border-slate-200 bg-slate-50/90'
                    : 'border-white/15 bg-white/5'
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isLightHero ? 'bg-[#111318] text-sky-400' : 'bg-sky-400/15 text-sky-300'
                  }`}
                >
                  <Layers className="h-4.5 w-4.5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className={`text-sm font-semibold ${isLightHero ? 'text-[#111318]' : 'text-white'}`}>
                    Practical Projects &amp; AI Mentor
                  </h2>
                  <p className={`mt-1 text-xs leading-relaxed ${isLightHero ? 'text-slate-600' : 'text-slate-300'}`}>
                    Three portfolio builds, five career tips, and live Q&amp;A with Google Gemini AI.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
