import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Compass } from 'lucide-react';

const ANALYSIS_STAGES = [
  'Evaluating your current technical skills...',
  'Benchmarking requirements for your target role...',
  'Calculating career readiness & priority gaps...',
  'Structuring your personalized 8-week learning roadmap...',
  'Curating 3 practical portfolio projects & 5 career tips...',
];

export function GeneratingState() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStageIndex((prev) => (prev + 1) % ANALYSIS_STAGES.length);
    }, 1800);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      aria-live="polite"
      className="rounded-2xl border border-sky-200 bg-white p-8 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-[#161B24] sm:p-12"
    >
      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        {/* Orbital Navigator Loader */}
        <div className="relative flex h-24 w-24 items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-sky-100 border-t-sky-500 border-r-sky-300 dark:border-slate-800 dark:border-t-sky-400 dark:border-r-sky-300"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-2.5 rounded-full border-2 border-slate-100 border-b-[#0A192F] dark:border-slate-800 dark:border-b-sky-300"
          />
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A192F] text-sky-300 dark:bg-sky-400/15 dark:text-sky-300">
            <Compass className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>

        <h3 className="mt-6 font-display text-xl font-bold text-[#0A192F] dark:text-white">
          Building Your AI Career Roadmap
        </h3>
        <motion.p
          key={stageIndex}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-2 text-sm font-medium text-sky-700 dark:text-sky-300"
        >
          {ANALYSIS_STAGES[stageIndex]}
        </motion.p>

        {/* Progress step indicator */}
        <div className="mt-6 grid w-full grid-cols-5 gap-2" aria-hidden="true">
          {ANALYSIS_STAGES.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-sm transition-colors duration-300 ${
                idx <= stageIndex ? 'bg-sky-500 dark:bg-sky-400' : 'bg-slate-100 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Skeleton structure preview */}
      <div className="mt-10 grid gap-4 md:grid-cols-3" aria-hidden="true">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-[#0F131A]"
          >
            <div className="h-4 w-28 rounded bg-slate-200/70 dark:bg-slate-800" />
            <div className="mt-3 space-y-2">
              <div className="h-3 w-full rounded bg-slate-200/50 dark:bg-slate-800/70" />
              <div className="h-3 w-5/6 rounded bg-slate-200/50 dark:bg-slate-800/70" />
              <div className="h-3 w-4/6 rounded bg-slate-200/50 dark:bg-slate-800/70" />
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
