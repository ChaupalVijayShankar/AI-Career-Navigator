export const CAREER_ROLES = [
  'AI Engineer',
  'Machine Learning Engineer',
  'Data Scientist',
  'Data Analyst',
  'Python Developer',
  'Full Stack Developer',
  'Web Developer',
  'Cybersecurity Analyst',
  'Cloud Engineer',
  'Other',
] as const;

export type CareerRoleOption = (typeof CAREER_ROLES)[number];

export const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export interface RoadmapFormInput {
  studentName: string;
  currentSkills: string;
  targetRole: CareerRoleOption;
  customRole: string;
  experienceLevel: ExperienceLevel;
  hoursPerWeek: number;
  careerGoal: string;
}

export interface ExistingSkillItem {
  name: string;
  relevance: string;
  proficiencyNote: string;
}

export interface MissingSkillItem {
  name: string;
  priority: 'Critical' | 'High' | 'Moderate';
  reason: string;
}

export interface RecommendedSkillItem {
  name: string;
  category: string;
  estimatedHours: number;
  impact: string;
}

export interface WeeklyPlanItem {
  week: number;
  title: string;
  focusArea: string;
  hoursAllocated: number;
  topics: string[];
  practiceTask?: string;
  resources?: string[];
  milestone: string;
  deliverable: string;
}

export interface ProjectRecommendation {
  title: string;
  difficulty: string;
  estimatedHours: number;
  skillsApplied: string[];
  description: string;
  outcome: string;
}

export interface CareerTip {
  title: string;
  category: string;
  actionableStep: string;
}

export interface CareerRoadmapResult {
  studentName: string;
  targetRole: string;
  experienceLevel: ExperienceLevel;
  hoursPerWeek: number;
  careerGoal: string;
  readinessPercentage: number;
  readinessSummary: string;
  existingSkills: ExistingSkillItem[];
  missingSkills: MissingSkillItem[];
  recommendedSkills: RecommendedSkillItem[];
  weeklyRoadmap: WeeklyPlanItem[];
  projects: ProjectRecommendation[];
  careerTips: CareerTip[];
  generatedAt: string;
}

export type BackgroundMode = 'split' | 'white' | 'black';

export type ThemeMode = 'light' | 'dark';

export interface MentorMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string;
}

