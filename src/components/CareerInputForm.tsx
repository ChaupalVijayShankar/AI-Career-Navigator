import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Clock, Plus, RotateCcw, Target, User } from 'lucide-react';
import {
  CAREER_ROLES,
  EXPERIENCE_LEVELS,
  type CareerRoleOption,
  type ExperienceLevel,
  type RoadmapFormInput,
} from '../types/roadmap';

interface CareerInputFormProps {
  formData: RoadmapFormInput;
  isLoading: boolean;
  onChange: (updated: RoadmapFormInput) => void;
  onSubmit: (data: RoadmapFormInput) => void;
  onClearAll: () => void;
}

const QUICK_SKILLS_BY_ROLE: Record<CareerRoleOption, string[]> = {
  'AI Engineer': ['Python', 'REST APIs', 'Prompt Engineering', 'Git', 'SQL', 'FastAPI'],
  'Machine Learning Engineer': ['Python', 'NumPy', 'Pandas', 'Scikit-learn', 'Linear Algebra', 'Git'],
  'Data Scientist': ['Python', 'SQL', 'Statistics', 'Pandas', 'Data Visualization', 'Excel'],
  'Data Analyst': ['Excel', 'SQL', 'Tableau', 'Power BI', 'Python', 'Statistics'],
  'Python Developer': ['Python', 'Git', 'OOP', 'REST APIs', 'SQL', 'Pytest'],
  'Full Stack Developer': ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git'],
  'Web Developer': ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design', 'React', 'Git'],
  'Cybersecurity Analyst': ['Networking', 'Linux', 'TCP/IP', 'Windows Admin', 'Python', 'SIEM Basics'],
  'Cloud Engineer': ['Linux', 'Networking', 'Docker', 'AWS Basics', 'Bash', 'Git'],
  Other: ['Problem Solving', 'Git', 'Communication', 'Python', 'SQL', 'Project Management'],
};

interface ValidationErrors {
  currentSkills?: string;
  customRole?: string;
  hoursPerWeek?: string;
  careerGoal?: string;
}

export function CareerInputForm({
  formData,
  isLoading,
  onChange,
  onSubmit,
  onClearAll,
}: CareerInputFormProps) {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const suggestedSkills = QUICK_SKILLS_BY_ROLE[formData.targetRole] ?? QUICK_SKILLS_BY_ROLE.Other;

  const handleAddQuickSkill = (skill: string) => {
    const existingList = formData.currentSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const alreadyExists = existingList.some((s) => s.toLowerCase() === skill.toLowerCase());
    if (alreadyExists) return;

    const nextValue = existingList.length > 0 ? `${existingList.join(', ')}, ${skill}` : skill;
    onChange({ ...formData, currentSkills: nextValue });
    if (errors.currentSkills) {
      setErrors((prev) => ({ ...prev, currentSkills: undefined }));
    }
  };

  const validate = (data: RoadmapFormInput): ValidationErrors => {
    const nextErrors: ValidationErrors = {};
    if (!data.currentSkills.trim() || data.currentSkills.trim().length < 2) {
      nextErrors.currentSkills = 'Please enter at least one current skill or click a suggestion above.';
    }
    if (data.targetRole === 'Other' && (!data.customRole.trim() || data.customRole.trim().length < 2)) {
      nextErrors.customRole = 'Please specify your target career role.';
    }
    if (!Number.isFinite(data.hoursPerWeek) || data.hoursPerWeek < 1 || data.hoursPerWeek > 80) {
      nextErrors.hoursPerWeek = 'Enter weekly study hours between 1 and 80.';
    }
    if (!data.careerGoal.trim() || data.careerGoal.trim().length < 5) {
      nextErrors.careerGoal = 'Please describe your career goal (at least 5 characters).';
    }
    return nextErrors;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    onSubmit(formData);
  };

  const handleClear = () => {
    setErrors({});
    onClearAll();
  };

  return (
    <motion.section
      id="analyzer"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-[#161B24] sm:p-8"
      aria-labelledby="analyzer-heading"
    >
      <div className="border-b border-slate-100 pb-5 dark:border-slate-800">
        <h2 id="analyzer-heading" className="font-display text-xl font-bold text-[#0A192F] dark:text-white sm:text-2xl">
          Skill Gap &amp; Career Profile Input
        </h2>
        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
          Enter your existing skills, target role, and weekly availability.{' '}
          <span className="font-semibold text-[#0A192F] dark:text-sky-300">Google Gemini AI</span>{' '}
          will calculate your readiness and generate a tailored 8-week roadmap.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Student Name (Optional) */}
          <div>
            <label htmlFor="studentName" className="flex items-center gap-2 text-sm font-semibold text-[#0A192F] dark:text-slate-100">
              <User className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              <span>Student Name</span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">(Optional)</span>
            </label>
            <input
              id="studentName"
              name="studentName"
              type="text"
              value={formData.studentName}
              onChange={(e) => onChange({ ...formData, studentName: e.target.value })}
              placeholder="e.g., Alex Morgan"
              maxLength={80}
              disabled={isLoading}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:bg-slate-50 dark:border-slate-700 dark:bg-[#0F131A] dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-900"
            />
          </div>

          {/* Target Career Role */}
          <div>
            <label htmlFor="targetRole" className="flex items-center gap-2 text-sm font-semibold text-[#0A192F] dark:text-slate-100">
              <Target className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              <span>Target Career Role</span>
            </label>
            <select
              id="targetRole"
              name="targetRole"
              value={formData.targetRole}
              onChange={(e) => {
                const nextRole = e.target.value as CareerRoleOption;
                onChange({ ...formData, targetRole: nextRole });
                if (errors.customRole && nextRole !== 'Other') {
                  setErrors((prev) => ({ ...prev, customRole: undefined }));
                }
              }}
              disabled={isLoading}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 transition-colors focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:bg-slate-50 dark:border-slate-700 dark:bg-[#0F131A] dark:text-slate-100 dark:disabled:bg-slate-900"
            >
              {CAREER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            {formData.targetRole === 'Other' && (
              <div className="mt-3">
                <label htmlFor="customRole" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Specify Target Role
                </label>
                <input
                  id="customRole"
                  name="customRole"
                  type="text"
                  value={formData.customRole}
                  onChange={(e) => {
                    onChange({ ...formData, customRole: e.target.value });
                    if (errors.customRole) {
                      setErrors((prev) => ({ ...prev, customRole: undefined }));
                    }
                  }}
                  placeholder="e.g., DevOps Engineer, Product Manager, Robotics Engineer"
                  disabled={isLoading}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-[#0F131A] dark:text-slate-100 dark:placeholder:text-slate-500"
                />
                {errors.customRole && (
                  <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400" role="alert">
                    {errors.customRole}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Experience Level */}
          <div>
            <span className="flex items-center gap-2 text-sm font-semibold text-[#0A192F] dark:text-slate-100">
              <BookOpen className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              <span>Experience Level</span>
            </span>
            <div
              role="radiogroup"
              aria-label="Experience Level"
              className="mt-2 grid grid-cols-3 gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1.5 dark:border-slate-700 dark:bg-[#0F131A]"
            >
              {EXPERIENCE_LEVELS.map((level: ExperienceLevel) => {
                const isSelected = formData.experienceLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={isLoading}
                    onClick={() => onChange({ ...formData, experienceLevel: level })}
                    className={`cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                      isSelected
                        ? 'bg-[#0A192F] text-white shadow-sm dark:bg-sky-400 dark:text-[#0A192F]'
                        : 'text-slate-600 hover:bg-white hover:text-[#0A192F] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Available Study Hours per Week */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="hoursPerWeek" className="flex items-center gap-2 text-sm font-semibold text-[#0A192F] dark:text-slate-100">
                <Clock className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                <span>Available Study Hours / Week</span>
              </label>
              <span className="font-mono text-sm font-semibold text-sky-700 tabular-nums dark:text-sky-300">
                {formData.hoursPerWeek} hrs/wk
              </span>
            </div>

            <div className="mt-2 flex items-center gap-4">
              <input
                id="hoursSlider"
                type="range"
                min={2}
                max={50}
                step={1}
                aria-label="Study hours per week slider"
                value={Math.min(50, Math.max(2, formData.hoursPerWeek || 10))}
                onChange={(e) => {
                  onChange({ ...formData, hoursPerWeek: Number(e.target.value) });
                  if (errors.hoursPerWeek) {
                    setErrors((prev) => ({ ...prev, hoursPerWeek: undefined }));
                  }
                }}
                disabled={isLoading}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-sky-100 accent-[#0A192F] dark:bg-slate-800 dark:accent-sky-400"
              />
              <input
                id="hoursPerWeek"
                name="hoursPerWeek"
                type="number"
                min={1}
                max={80}
                value={formData.hoursPerWeek}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onChange({ ...formData, hoursPerWeek: Number.isNaN(val) ? 0 : val });
                  if (errors.hoursPerWeek) {
                    setErrors((prev) => ({ ...prev, hoursPerWeek: undefined }));
                  }
                }}
                disabled={isLoading}
                className="w-20 shrink-0 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-center font-mono text-sm font-semibold text-slate-900 tabular-nums focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-[#0F131A] dark:text-slate-100"
              />
            </div>
            {errors.hoursPerWeek && (
              <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400" role="alert">
                {errors.hoursPerWeek}
              </p>
            )}
          </div>
        </div>

        {/* Current Skills */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="currentSkills" className="text-sm font-semibold text-[#0A192F] dark:text-slate-100">
              Current Skills
            </label>
            <span className="text-xs text-slate-500 dark:text-slate-400">Separate skills with commas</span>
          </div>
          <textarea
            id="currentSkills"
            name="currentSkills"
            rows={3}
            value={formData.currentSkills}
            onChange={(e) => {
              onChange({ ...formData, currentSkills: e.target.value });
              if (errors.currentSkills) {
                setErrors((prev) => ({ ...prev, currentSkills: undefined }));
              }
            }}
            placeholder="e.g., Python, HTML, CSS, basic SQL, Git, data cleaning with Pandas"
            disabled={isLoading}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:bg-slate-50 dark:border-slate-700 dark:bg-[#0F131A] dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-900"
          />
          {errors.currentSkills && (
            <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400" role="alert">
              {errors.currentSkills}
            </p>
          )}

          {/* Quick-add role skill suggestions */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              Quick add for {formData.targetRole}:
            </span>
            {suggestedSkills.map((skill) => (
              <button
                key={skill}
                type="button"
                disabled={isLoading}
                onClick={() => handleAddQuickSkill(skill)}
                className="cursor-pointer inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50/70 px-2.5 py-1 text-xs font-medium text-[#0A192F] transition-colors hover:border-sky-400 hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 whitespace-nowrap shrink-0 dark:border-sky-800/70 dark:bg-sky-950/50 dark:text-sky-200 dark:hover:border-sky-500 dark:hover:bg-sky-900/60"
              >
                <Plus className="h-3 w-3 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                <span>{skill}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Career Goal */}
        <div>
          <label htmlFor="careerGoal" className="text-sm font-semibold text-[#0A192F] dark:text-slate-100">
            Career Goal
          </label>
          <textarea
            id="careerGoal"
            name="careerGoal"
            rows={2}
            value={formData.careerGoal}
            onChange={(e) => {
              onChange({ ...formData, careerGoal: e.target.value });
              if (errors.careerGoal) {
                setErrors((prev) => ({ ...prev, careerGoal: undefined }));
              }
            }}
            placeholder="e.g., Land an entry-level AI Engineer internship or junior role by building production LLM applications."
            disabled={isLoading}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:bg-slate-50 dark:border-slate-700 dark:bg-[#0F131A] dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-900"
          />
          {errors.careerGoal && (
            <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400" role="alert">
              {errors.careerGoal}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5 dark:border-slate-800">
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading}
            className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-50 whitespace-nowrap shrink-0 dark:border-slate-700 dark:bg-[#0F131A] dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <RotateCcw className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
            <span>Clear All</span>
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#0A192F] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#112A4E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap shrink-0 dark:bg-sky-400 dark:text-[#0A192F] dark:hover:bg-sky-300 dark:focus-visible:ring-offset-[#161B24]"
          >
            <span>{isLoading ? 'Analyzing Profile...' : 'Generate My Career Roadmap'}</span>
            <ArrowRight className="h-4 w-4 text-sky-300 dark:text-[#0A192F]" aria-hidden="true" />
          </button>
        </div>
      </form>
    </motion.section>
  );
}
