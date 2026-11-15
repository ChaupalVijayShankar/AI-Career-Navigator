import { useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Download,
  FolderGit2,
  Lightbulb,
  Printer,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Target,
} from 'lucide-react';
import type { CareerRoadmapResult } from '../types/roadmap';
import { downloadRoadmapReport } from '../utils/downloadRoadmap';

interface ResultsDashboardProps {
  roadmap: CareerRoadmapResult;
  completedWeeks: number[];
  onToggleWeek: (weekNum: number) => void;
  onGenerateNew: () => void;
  onClearAll: () => void;
}

type WeekFilter = 'all' | 'phase1' | 'phase2';

function getReadinessTier(percentage: number): { label: string; toneClass: string } {
  if (percentage >= 80) {
    return {
      label: 'Role Ready',
      toneClass:
        'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800/70',
    };
  }
  if (percentage >= 60) {
    return {
      label: 'Strong Alignment',
      toneClass:
        'text-sky-800 bg-sky-50 border-sky-200 dark:text-sky-300 dark:bg-sky-950/60 dark:border-sky-800/70',
    };
  }
  if (percentage >= 35) {
    return {
      label: 'Developing Readiness',
      toneClass:
        'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/60 dark:border-amber-800/70',
    };
  }
  return {
    label: 'Foundation Stage',
    toneClass:
      'text-slate-700 bg-slate-100 border-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700',
  };
}

function getPriorityStyle(priority: 'Critical' | 'High' | 'Moderate') {
  if (priority === 'Critical') {
    return {
      container:
        'border-red-200 bg-red-50/60 text-red-800 dark:border-red-800/70 dark:bg-red-950/60 dark:text-red-300',
      Icon: ShieldAlert,
    };
  }
  if (priority === 'High') {
    return {
      container:
        'border-amber-200 bg-amber-50/70 text-amber-800 dark:border-amber-800/70 dark:bg-amber-950/60 dark:text-amber-300',
      Icon: AlertTriangle,
    };
  }
  return {
    container:
      'border-sky-200 bg-sky-50/70 text-sky-800 dark:border-sky-800/70 dark:bg-sky-950/60 dark:text-sky-300',
    Icon: Target,
  };
}

export function ResultsDashboard({
  roadmap,
  completedWeeks,
  onToggleWeek,
  onGenerateNew,
  onClearAll,
}: ResultsDashboardProps) {
  const [weekFilter, setWeekFilter] = useState<WeekFilter>('all');

  const readinessTier = getReadinessTier(roadmap.readinessPercentage);
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (roadmap.readinessPercentage / 100) * circumference;

  const filteredWeeks = roadmap.weeklyRoadmap.filter((item) => {
    if (weekFilter === 'phase1') return item.week <= 4;
    if (weekFilter === 'phase2') return item.week >= 5;
    return true;
  });

  const totalEightWeekHours = roadmap.hoursPerWeek * 8;
  const parsedDate = roadmap.generatedAt ? new Date(roadmap.generatedAt) : null;
  const formattedDate =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? parsedDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Today';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      {/* Dashboard Header & Actions */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-[#161B24] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>{roadmap.targetRole}</span>
              <span aria-hidden="true">·</span>
              <span>{roadmap.experienceLevel} Level</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{roadmap.hoursPerWeek} hrs/week</span>
              <span aria-hidden="true">·</span>
              <span>Generated {formattedDate}</span>
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold text-[#0A192F] dark:text-white sm:text-3xl">
              {roadmap.studentName
                ? `${roadmap.studentName}'s Career Roadmap`
                : 'Personalized Career Roadmap'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-800 dark:text-slate-100">Goal:</span>{' '}
              {roadmap.careerGoal}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 no-print">
            <button
              type="button"
              onClick={() => downloadRoadmapReport(roadmap)}
              className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#0A192F] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#112A4E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 whitespace-nowrap shrink-0 dark:bg-sky-400 dark:text-[#0A192F] dark:hover:bg-sky-300"
            >
              <Download className="h-4 w-4 text-sky-300 dark:text-[#0A192F]" aria-hidden="true" />
              <span>Download Roadmap</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 whitespace-nowrap shrink-0 dark:border-slate-700 dark:bg-[#0F131A] dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <Printer className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={onGenerateNew}
              className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-sky-300 bg-sky-50 px-4 py-2.5 text-xs font-semibold text-[#0A192F] transition-colors hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 whitespace-nowrap shrink-0 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-200 dark:hover:bg-sky-900/70"
            >
              <RefreshCw className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              <span>Generate New Roadmap</span>
            </button>

            <button
              type="button"
              onClick={onClearAll}
              className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 whitespace-nowrap shrink-0 dark:border-slate-700 dark:bg-[#0F131A] dark:text-slate-300 dark:hover:border-red-800 dark:hover:bg-red-950/60 dark:hover:text-red-300"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Clear All</span>
            </button>
          </div>
        </div>

        {/* Readiness Gauge & Summary Strip */}
        <div className="mt-8 grid gap-6 border-t border-slate-100 pt-8 dark:border-slate-800 lg:grid-cols-12 lg:items-center">
          <div className="flex flex-col items-center gap-5 sm:flex-row lg:col-span-7">
            <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
              <svg className="h-36 w-36 -rotate-90" viewBox="0 0 132 132" aria-hidden="true">
                <circle
                  cx="66"
                  cy="66"
                  r={radius}
                  fill="none"
                  className="stroke-sky-100 dark:stroke-slate-800"
                  strokeWidth="10"
                />
                <motion.circle
                  cx="66"
                  cy="66"
                  r={radius}
                  fill="none"
                  stroke="#0EA5E9"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: dashOffset }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-3xl font-bold text-[#0A192F] tabular-nums dark:text-white">
                  {roadmap.readinessPercentage}%
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Readiness</span>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="font-display text-lg font-bold text-[#0A192F] dark:text-white">
                  Career Readiness Score
                </h3>
                <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold ${readinessTier.toneClass}`}>
                  {readinessTier.label}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {roadmap.readinessSummary}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-slate-50/70 dark:divide-slate-800 dark:border-slate-800 dark:bg-[#0F131A] lg:col-span-5">
            <div className="p-4 text-center">
              <div className="font-mono text-2xl font-bold text-[#0A192F] tabular-nums dark:text-white">
                {roadmap.existingSkills.length}
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">Existing Skills</div>
            </div>
            <div className="p-4 text-center">
              <div className="font-mono text-2xl font-bold text-sky-700 tabular-nums dark:text-sky-400">
                {roadmap.missingSkills.length}
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">Skill Gaps</div>
            </div>
            <div className="p-4 text-center">
              <div className="font-mono text-2xl font-bold text-[#0A192F] tabular-nums dark:text-white">
                {totalEightWeekHours}h
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">8-Week Plan</div>
            </div>
          </div>
        </div>
      </section>

      {/* Skill Gap Matrix: Existing / Missing / Recommended */}
      <section className="grid gap-6 lg:grid-cols-3" aria-label="Skill Gap Analysis">
        {/* Existing Skills */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-[#161B24]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <h3 className="font-display text-lg font-bold text-[#0A192F] dark:text-white">Existing Skills</h3>
            </div>
            <span className="font-mono text-xs font-semibold text-slate-500 tabular-nums dark:text-slate-400">
              {roadmap.existingSkills.length} verified
            </span>
          </div>

          {roadmap.existingSkills.length > 0 ? (
            <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {roadmap.existingSkills.map((skill, idx) => (
                <li key={`${skill.name}-${idx}`} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[#0A192F] dark:text-slate-100">{skill.name}</span>
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Strength</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{skill.relevance}</p>
                  <p className="mt-1 text-xs text-sky-700 dark:text-sky-400">Next: {skill.proficiencyNote}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              Starting fresh — focus on the foundational skills in Week 1.
            </p>
          )}
        </div>

        {/* Missing Skills */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-[#161B24]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                <AlertTriangle className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <h3 className="font-display text-lg font-bold text-[#0A192F] dark:text-white">Missing Skills</h3>
            </div>
            <span className="font-mono text-xs font-semibold text-slate-500 tabular-nums dark:text-slate-400">
              {roadmap.missingSkills.length} gaps
            </span>
          </div>

          {roadmap.missingSkills.length > 0 ? (
            <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {roadmap.missingSkills.map((skill, idx) => {
                const style = getPriorityStyle(skill.priority);
                const PriorityIcon = style.Icon;
                return (
                  <li key={`${skill.name}-${idx}`} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[#0A192F] dark:text-slate-100">{skill.name}</span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap shrink-0 ${style.container}`}
                      >
                        <PriorityIcon className="h-3 w-3" aria-hidden="true" />
                        <span>{skill.priority}</span>
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{skill.reason}</p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              No critical gaps detected — focus on portfolio depth and system architecture.
            </p>
          )}
        </div>

        {/* Recommended Skills */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-[#161B24]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400">
                <Sparkles className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <h3 className="font-display text-lg font-bold text-[#0A192F] dark:text-white">Recommended Skills</h3>
            </div>
            <span className="font-mono text-xs font-semibold text-slate-500 tabular-nums dark:text-slate-400">
              {roadmap.recommendedSkills.length} targets
            </span>
          </div>

          {roadmap.recommendedSkills.length > 0 ? (
            <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {roadmap.recommendedSkills.map((skill, idx) => (
                <li key={`${skill.name}-${idx}`} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[#0A192F] dark:text-slate-100">{skill.name}</span>
                    <span className="font-mono text-xs font-semibold text-sky-700 tabular-nums whitespace-nowrap shrink-0 dark:text-sky-400">
                      ~{skill.estimatedHours}h
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">{skill.category}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{skill.impact}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              Follow the 8-week learning roadmap below for your recommended focus topics.
            </p>
          )}
        </div>
      </section>

      {/* 8-Week Learning Roadmap */}
      <section id="roadmap" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-[#161B24] sm:p-8">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-xl font-bold text-[#0A192F] dark:text-white sm:text-2xl">
              8-Week Personalized Learning Roadmap
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Track your weekly milestones. Progress is saved automatically in your browser.
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-[#0F131A] no-print">
            <button
              type="button"
              onClick={() => setWeekFilter('all')}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                weekFilter === 'all'
                  ? 'bg-[#0A192F] text-white dark:bg-sky-400 dark:text-[#0A192F]'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              All 8 Weeks
            </button>
            <button
              type="button"
              onClick={() => setWeekFilter('phase1')}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                weekFilter === 'phase1'
                  ? 'bg-[#0A192F] text-white dark:bg-sky-400 dark:text-[#0A192F]'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              Weeks 1–4
            </button>
            <button
              type="button"
              onClick={() => setWeekFilter('phase2')}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                weekFilter === 'phase2'
                  ? 'bg-[#0A192F] text-white dark:bg-sky-400 dark:text-[#0A192F]'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              Weeks 5–8
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {filteredWeeks.map((week, idx) => {
            const isCompleted = completedWeeks.includes(week.week);
            return (
              <motion.article
                key={week.week}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                className={`rounded-xl border p-5 transition-colors ${
                  isCompleted
                    ? 'border-sky-300 bg-sky-50/40 dark:border-sky-700 dark:bg-sky-950/30'
                    : 'border-slate-200 bg-white hover:border-sky-200 dark:border-slate-800 dark:bg-[#0F131A] dark:hover:border-sky-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-sky-700 dark:text-sky-400">
                      <span className="font-mono tabular-nums">
                        Week {String(week.week).padStart(2, '0')}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{week.focusArea}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 font-mono tabular-nums text-slate-600 dark:text-slate-400">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {week.hoursAllocated}h
                      </span>
                    </div>
                    <h4 className="mt-1.5 font-display text-base font-bold text-[#0A192F] dark:text-white">
                      {week.title}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleWeek(week.week)}
                    aria-pressed={isCompleted}
                    className={`cursor-pointer inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 no-print ${
                      isCompleted
                        ? 'border-sky-500 bg-[#0A192F] text-white dark:bg-sky-400 dark:text-[#0A192F]'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-sky-300 hover:text-[#0A192F] dark:border-slate-700 dark:bg-[#161B24] dark:text-slate-300 dark:hover:border-sky-500 dark:hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{isCompleted ? 'Completed' : 'Mark Done'}</span>
                  </button>
                </div>

                <div className="mt-3">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Key Topics</p>
                  <ul className="mt-1.5 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {week.topics.map((topic, tIdx) => (
                      <li key={tIdx} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-sky-500 dark:bg-sky-400" aria-hidden="true" />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                  {week.practiceTask && (
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-semibold text-[#0A192F] dark:text-white">Hands-On Practice:</span>{' '}
                      {week.practiceTask}
                    </p>
                  )}
                  <p className="text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-[#0A192F] dark:text-white">Milestone:</span> {week.milestone}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-sky-700 dark:text-sky-400">Deliverable:</span> {week.deliverable}
                  </p>
                  {week.resources && week.resources.length > 0 && (
                    <p className="pt-1 text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Study Resources:</span>{' '}
                      {week.resources.join(' · ')}
                    </p>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* 3 Practical Portfolio Projects */}
      <section id="projects" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-[#161B24] sm:p-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0A192F] text-sky-300 dark:bg-sky-400/15 dark:text-sky-300">
            <FolderGit2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-display text-xl font-bold text-[#0A192F] dark:text-white sm:text-2xl">
              3 Practical Portfolio Projects
            </h3>
            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
              Hands-on builds engineered to demonstrate real capability in your target role.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {roadmap.projects.map((project, idx) => (
            <article
              key={`${project.title}-${idx}`}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/40 p-5 transition-colors hover:border-sky-300 hover:bg-white dark:border-slate-800 dark:bg-[#0F131A] dark:hover:border-sky-700 dark:hover:bg-[#141923]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="font-mono font-semibold text-sky-700 tabular-nums dark:text-sky-400">
                    Project 0{idx + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{project.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{project.estimatedHours}h</span>
                  </div>
                </div>

                <h4 className="mt-2 font-display text-base font-bold text-[#0A192F] dark:text-white">
                  {project.title}
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {project.description}
                </p>

                <div className="mt-4">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Skills Applied</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {project.skillsApplied.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="rounded-md border border-sky-200 bg-white px-2 py-0.5 text-[11px] font-medium text-[#0A192F] dark:border-slate-700 dark:bg-[#161B24] dark:text-sky-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-200/80 pt-3 dark:border-slate-800">
                <p className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                  <span>
                    <strong className="font-semibold text-[#0A192F] dark:text-white">Portfolio Outcome:</strong>{' '}
                    {project.outcome}
                  </span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 5 Career Improvement Tips */}
      <section id="tips" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-[#161B24] sm:p-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400">
            <Lightbulb className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-display text-xl font-bold text-[#0A192F] dark:text-white sm:text-2xl">
              5 Career Improvement Tips
            </h3>
            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
              High-leverage habits to stand out in technical hiring and accelerate progression.
            </p>
          </div>
        </div>

        <ol className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {roadmap.careerTips.map((tip, idx) => (
            <li key={`${tip.title}-${idx}`} className="flex flex-col gap-2 py-4 first:pt-2 last:pb-0 sm:flex-row sm:items-start sm:gap-5">
              <span className="font-mono text-sm font-bold text-sky-700 tabular-nums shrink-0 pt-0.5 dark:text-sky-400">
                0{idx + 1}.
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-display text-base font-bold text-[#0A192F] dark:text-white">{tip.title}</h4>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">· {tip.category}</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{tip.actionableStep}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </motion.div>
  );
}
