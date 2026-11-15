import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

const VALID_EXPERIENCE_LEVELS = new Set(['Beginner', 'Intermediate', 'Advanced']);

interface GeneratePayload {
  studentName?: string;
  currentSkills?: string;
  targetRole?: string;
  customRole?: string;
  experienceLevel?: string;
  hoursPerWeek?: number;
  careerGoal?: string;
}

const roadmapResponseSchema = {
  type: Type.OBJECT,
  properties: {
    readinessPercentage: {
      type: Type.INTEGER,
      description: 'Indicative career readiness percentage from 0 to 100 based on current skills vs target role.',
    },
    readinessSummary: {
      type: Type.STRING,
      description: 'Concise 2-sentence assessment of current readiness and biggest opportunity area.',
    },
    existingSkills: {
      type: Type.ARRAY,
      description: 'Relevant skills the student already possesses and how they apply.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          relevance: { type: Type.STRING, description: 'How this skill transfers to the target role.' },
          proficiencyNote: { type: Type.STRING, description: 'Suggested next step to leverage this strength.' },
        },
        required: ['name', 'relevance', 'proficiencyNote'],
      },
    },
    missingSkills: {
      type: Type.ARRAY,
      description: 'Key missing skills required for the target role, ranked by importance.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          priority: {
            type: Type.STRING,
            description: 'Must be exactly one of: Critical, High, Moderate',
          },
          reason: { type: Type.STRING, description: 'Why this gap matters for the target role.' },
        },
        required: ['name', 'priority', 'reason'],
      },
    },
    recommendedSkills: {
      type: Type.ARRAY,
      description: 'High-impact skills and tools recommended to learn during the 8-week plan.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING },
          estimatedHours: { type: Type.INTEGER },
          impact: { type: Type.STRING },
        },
        required: ['name', 'category', 'estimatedHours', 'impact'],
      },
    },
    weeklyRoadmap: {
      type: Type.ARRAY,
      description: 'Personalized 8-week structured learning roadmap (exactly 8 items for Weeks 1 through 8).',
      items: {
        type: Type.OBJECT,
        properties: {
          week: { type: Type.INTEGER },
          title: { type: Type.STRING },
          focusArea: { type: Type.STRING },
          hoursAllocated: { type: Type.INTEGER },
          topics: {
            type: Type.ARRAY,
            description: '4 to 6 specific, detailed study topics for this week.',
            items: { type: Type.STRING },
          },
          practiceTask: {
            type: Type.STRING,
            description: 'Concrete hands-on coding, lab, or practical exercise for this week.',
          },
          resources: {
            type: Type.ARRAY,
            description: '2 to 3 recommended study resources, official docs, or focused guides.',
            items: { type: Type.STRING },
          },
          milestone: { type: Type.STRING },
          deliverable: { type: Type.STRING },
        },
        required: ['week', 'title', 'focusArea', 'hoursAllocated', 'topics', 'practiceTask', 'resources', 'milestone', 'deliverable'],
      },
    },
    projects: {
      type: Type.ARRAY,
      description: 'Exactly 3 practical portfolio projects tailored to bridge the missing skills.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          difficulty: { type: Type.STRING },
          estimatedHours: { type: Type.INTEGER },
          skillsApplied: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          description: { type: Type.STRING },
          outcome: { type: Type.STRING },
        },
        required: ['title', 'difficulty', 'estimatedHours', 'skillsApplied', 'description', 'outcome'],
      },
    },
    careerTips: {
      type: Type.ARRAY,
      description: 'Exactly 5 practical career improvement tips tailored to the student profile and goal.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          category: { type: Type.STRING },
          actionableStep: { type: Type.STRING },
        },
        required: ['title', 'category', 'actionableStep'],
      },
    },
  },
  required: [
    'readinessPercentage',
    'readinessSummary',
    'existingSkills',
    'missingSkills',
    'recommendedSkills',
    'weeklyRoadmap',
    'projects',
    'careerTips',
  ],
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithRetry(ai: GoogleGenAI, prompt: string, maxRetries = 2) {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a senior technical career strategist and curriculum architect. Produce thorough, deeply detailed, industry-aligned skill gap evaluations and 8-week learning plans. Tailor study depth strictly to the user\'s weekly study hours, current skills, experience level, and career goal. Include 4 to 6 specific sub-topics, a concrete hands-on practiceTask, and 2 to 3 recommended study resources for every single week. Always provide exactly 8 weeks in weeklyRoadmap (numbered 1 through 8), exactly 3 comprehensive practical projects in projects, and exactly 5 detailed career tips in careerTips. Never hallucinate proficiency the user did not list.',
          responseMimeType: 'application/json',
          responseSchema: roadmapResponseSchema,
        },
      });
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      const isTransient = status === 429 || status === 503 || status === 500 || status === undefined;
      if (!isTransient || attempt === maxRetries) {
        throw err;
      }
      await sleep(700 * Math.pow(2, attempt));
    }
  }
  throw lastError;
}

function normalizePriority(value: string): 'Critical' | 'High' | 'Moderate' {
  const lower = String(value || '').toLowerCase();
  if (lower.includes('crit')) return 'Critical';
  if (lower.includes('high')) return 'High';
  return 'Moderate';
}

function safeParseJsonObject(rawText: string): Record<string, unknown> | null {
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  try {
    const parsed = JSON.parse(cleaned);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.post('/api/roadmap/generate', async (req, res) => {
    const body = (req.body ?? {}) as GeneratePayload;

    const studentName = typeof body.studentName === 'string' ? body.studentName.trim().slice(0, 100) : '';
    const currentSkills = typeof body.currentSkills === 'string' ? body.currentSkills.trim() : '';
    const rawTargetRole = typeof body.targetRole === 'string' ? body.targetRole.trim() : '';
    const customRole = typeof body.customRole === 'string' ? body.customRole.trim() : '';
    const effectiveRole = rawTargetRole === 'Other' ? customRole : rawTargetRole;
    const experienceLevel = typeof body.experienceLevel === 'string' ? body.experienceLevel.trim() : '';
    const hoursPerWeek = Number(body.hoursPerWeek);
    const careerGoal = typeof body.careerGoal === 'string' ? body.careerGoal.trim() : '';

    if (!currentSkills || currentSkills.length < 2) {
      res.status(400).json({ error: 'Please list your current skills so we can evaluate your starting point.' });
      return;
    }

    if (!effectiveRole || effectiveRole.length < 2) {
      res.status(400).json({ error: 'Please select or specify a target career role.' });
      return;
    }

    if (!VALID_EXPERIENCE_LEVELS.has(experienceLevel)) {
      res.status(400).json({ error: 'Please select a valid experience level (Beginner, Intermediate, or Advanced).' });
      return;
    }

    if (!Number.isFinite(hoursPerWeek) || hoursPerWeek < 1 || hoursPerWeek > 80) {
      res.status(400).json({ error: 'Available study hours per week must be between 1 and 80.' });
      return;
    }

    if (!careerGoal || careerGoal.length < 5) {
      res.status(400).json({ error: 'Please describe your career goal (at least 5 characters).' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        error: 'Gemini API key is not configured on the server. Please add GEMINI_API_KEY in Settings > Secrets.',
        code: 'MISSING_API_KEY',
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = [
        `Analyze the following student profile and generate a personalized career skill gap analysis and 8-week learning roadmap:`,
        `- Student Name: ${studentName || 'Not provided'}`,
        `- Target Career Role: ${effectiveRole}`,
        `- Current Experience Level: ${experienceLevel}`,
        `- Available Study Hours Per Week: ${Math.round(hoursPerWeek)} hours/week`,
        `- Current Skills Listed by Student: ${currentSkills}`,
        `- Career Goal: ${careerGoal}`,
        ``,
        `Requirements:`,
        `1. Calculate a realistic indicative readinessPercentage (0-100) comparing their current skills and experience level against market expectations for "${effectiveRole}".`,
        `2. Group and evaluate their existingSkills (only skills grounded in what they listed or directly implied foundational sub-skills).`,
        `3. Identify key missingSkills with priority ("Critical", "High", or "Moderate") and clear reasoning.`,
        `4. Recommend high-leverage recommendedSkills with realistic estimatedHours.`,
        `5. Design a comprehensive, actionable 8-week roadmap (Week 1 to Week 8) where each week's hoursAllocated aligns with ~${Math.round(hoursPerWeek)} hours/week, listing 4-6 detailed topics, a hands-on practiceTask, 2-3 study resources, a clear milestone, and a tangible deliverable.`,
        `6. Recommend exactly 3 practical, portfolio-ready projects with thorough implementation descriptions that directly exercise the missing and recommended skills.`,
        `7. Provide exactly 5 detailed, actionable career improvement tips covering portfolio, networking, interviews, and technical execution.`,
      ].join('\n');

      const response = await generateWithRetry(ai, prompt);
      const rawText = (response.text ?? '').trim();

      if (!rawText) {
        res.status(502).json({ error: 'The AI model returned an empty response. Please try again.' });
        return;
      }

      const parsed = safeParseJsonObject(rawText);
      if (!parsed) {
        res.status(502).json({ error: 'The AI response could not be parsed cleanly. Please try again.' });
        return;
      }

      const readinessPercentage = Math.max(0, Math.min(100, Math.round(Number(parsed.readinessPercentage) || 0)));

      const normalizedWeekly = Array.isArray(parsed.weeklyRoadmap)
        ? parsed.weeklyRoadmap.slice(0, 8).map((w: Record<string, unknown>, idx: number) => ({
            week: Number(w.week) || idx + 1,
            title: String(w.title || `Week ${idx + 1}`),
            focusArea: String(w.focusArea || effectiveRole),
            hoursAllocated: Math.max(1, Math.round(Number(w.hoursAllocated) || hoursPerWeek)),
            topics: Array.isArray(w.topics) ? w.topics.map((t) => String(t)) : [],
            practiceTask: w.practiceTask ? String(w.practiceTask) : '',
            resources: Array.isArray(w.resources) ? w.resources.map((r) => String(r)) : [],
            milestone: String(w.milestone || ''),
            deliverable: String(w.deliverable || ''),
          }))
        : [];

      const normalizedResult = {
        studentName,
        targetRole: effectiveRole,
        experienceLevel,
        hoursPerWeek: Math.round(hoursPerWeek),
        careerGoal,
        readinessPercentage,
        readinessSummary: String(parsed.readinessSummary || ''),
        existingSkills: Array.isArray(parsed.existingSkills)
          ? parsed.existingSkills.map((s: Record<string, unknown>) => ({
              name: String(s.name || ''),
              relevance: String(s.relevance || ''),
              proficiencyNote: String(s.proficiencyNote || ''),
            }))
          : [],
        missingSkills: Array.isArray(parsed.missingSkills)
          ? parsed.missingSkills.map((s: Record<string, unknown>) => ({
              name: String(s.name || ''),
              priority: normalizePriority(String(s.priority || 'High')),
              reason: String(s.reason || ''),
            }))
          : [],
        recommendedSkills: Array.isArray(parsed.recommendedSkills)
          ? parsed.recommendedSkills.map((s: Record<string, unknown>) => ({
              name: String(s.name || ''),
              category: String(s.category || 'Core'),
              estimatedHours: Math.max(1, Math.round(Number(s.estimatedHours) || 8)),
              impact: String(s.impact || ''),
            }))
          : [],
        weeklyRoadmap: normalizedWeekly,
        projects: Array.isArray(parsed.projects)
          ? parsed.projects.slice(0, 3).map((p: Record<string, unknown>) => ({
              title: String(p.title || ''),
              difficulty: String(p.difficulty || experienceLevel),
              estimatedHours: Math.max(2, Math.round(Number(p.estimatedHours) || 12)),
              skillsApplied: Array.isArray(p.skillsApplied) ? p.skillsApplied.map((x) => String(x)) : [],
              description: String(p.description || ''),
              outcome: String(p.outcome || ''),
            }))
          : [],
        careerTips: Array.isArray(parsed.careerTips)
          ? parsed.careerTips.slice(0, 5).map((t: Record<string, unknown>) => ({
              title: String(t.title || ''),
              category: String(t.category || 'Strategy'),
              actionableStep: String(t.actionableStep || ''),
            }))
          : [],
        generatedAt: new Date().toISOString(),
      };

      res.json(normalizedResult);
    } catch (err: unknown) {
      const errorObj = err as { status?: number; message?: string };
      const status = errorObj?.status;
      const message = errorObj?.message || 'Unexpected error while communicating with Gemini AI.';

      console.error('Gemini API Error:', status, message);

      if (status === 403 || status === 401 || message.includes('API_KEY_INVALID') || message.includes('PERMISSION_DENIED')) {
        res.status(403).json({
          error: 'Gemini API authentication failed. Please verify GEMINI_API_KEY in Settings > Secrets.',
          code: 'AUTH_ERROR',
        });
        return;
      }

      if (status === 429 || message.includes('RESOURCE_EXHAUSTED')) {
        res.status(429).json({
          error: 'Gemini API rate limit reached. Please wait a moment and try generating your roadmap again.',
          code: 'RATE_LIMIT',
        });
        return;
      }

      if (status === 404 || message.includes('NOT_FOUND')) {
        res.status(502).json({
          error: 'Configured Gemini model was unavailable. Please try again shortly.',
          code: 'MODEL_NOT_FOUND',
        });
        return;
      }

      res.status(500).json({
        error: 'Unable to generate your career roadmap right now. Please try again in a few moments.',
        code: 'GENERATION_FAILED',
      });
    }
  });

  app.post('/api/mentor/ask', async (req, res) => {
    const body = (req.body ?? {}) as {
      question?: string;
      roadmap?: Record<string, unknown> | null;
      history?: Array<{ role?: string; text?: string }>;
    };

    const question = typeof body.question === 'string' ? body.question.trim() : '';
    if (!question || question.length < 2) {
      res.status(400).json({ error: 'Please enter a career question for Google Gemini AI.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        error: 'Gemini API key is not configured on the server. Please add GEMINI_API_KEY in Settings > Secrets.',
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const roadmapSummary = body.roadmap
        ? JSON.stringify({
            targetRole: body.roadmap.targetRole,
            experienceLevel: body.roadmap.experienceLevel,
            hoursPerWeek: body.roadmap.hoursPerWeek,
            readinessPercentage: body.roadmap.readinessPercentage,
            careerGoal: body.roadmap.careerGoal,
            existingSkills: Array.isArray(body.roadmap.existingSkills)
              ? body.roadmap.existingSkills.map((s: Record<string, unknown>) => s.name)
              : [],
            missingSkills: Array.isArray(body.roadmap.missingSkills)
              ? body.roadmap.missingSkills.map((s: Record<string, unknown>) => `${s.name} (${s.priority})`)
              : [],
            projects: Array.isArray(body.roadmap.projects)
              ? body.roadmap.projects.map((p: Record<string, unknown>) => p.title)
              : [],
          })
        : 'No roadmap generated yet — provide practical, role-specific career guidance.';

      const recentHistory = Array.isArray(body.history)
        ? body.history
            .slice(-6)
            .map((m) => `${m.role === 'user' ? 'Student' : 'Gemini Mentor'}: ${String(m.text || '')}`)
            .join('\n')
        : '';

      const prompt = [
        `Student Career Context: ${roadmapSummary}`,
        recentHistory ? `\nRecent Conversation:\n${recentHistory}` : '',
        `\nStudent Question: ${question}`,
        `\nProvide a thorough, practical, actionable response using clear bullet points or short paragraphs tailored to their career path.`,
      ]
        .filter(Boolean)
        .join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a senior technical career mentor powered by Google Gemini AI inside AI Career Navigator. Give direct, encouraging, actionable career, learning, and project advice.',
        },
      });

      const answer = (response.text ?? '').trim();
      if (!answer) {
        res.status(502).json({ error: 'Gemini AI returned an empty response. Please try again.' });
        return;
      }

      res.json({ answer });
    } catch (err: unknown) {
      const errorObj = err as { status?: number; message?: string };
      const status = errorObj?.status;
      console.error('Gemini Mentor Error:', status, errorObj?.message);

      if (status === 429) {
        res.status(429).json({ error: 'Gemini AI rate limit reached. Please wait briefly and try again.' });
        return;
      }
      if (status === 403 || status === 401) {
        res.status(403).json({ error: 'Gemini API authentication failed. Please check GEMINI_API_KEY in Settings > Secrets.' });
        return;
      }
      res.status(500).json({ error: 'Unable to reach Google Gemini AI right now. Please try again.' });
    }
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Career Navigator server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
