import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Bot, Loader2, Send, Sparkles, Trash2 } from 'lucide-react';
import type { CareerRoadmapResult, MentorMessage } from '../types/roadmap';

interface GeminiMentorPanelProps {
  roadmap: CareerRoadmapResult | null;
  messages: MentorMessage[];
  onAddMessage: (msg: MentorMessage) => void;
  onClearChat: () => void;
}

const STARTER_QUESTIONS_WITH_ROADMAP = [
  'How should I structure my Week 1 study sessions?',
  'Which missing skill will give me the fastest interview boost?',
  'How can I make Project 1 stand out to recruiters?',
];

const STARTER_QUESTIONS_GENERAL = [
  'What skills matter most for an AI Engineer in 2026?',
  'How many hours a week do I need to transition into Cloud Engineering?',
  'What kind of portfolio project impresses hiring managers?',
];

export function GeminiMentorPanel({
  roadmap,
  messages,
  onAddMessage,
  onClearChat,
}: GeminiMentorPanelProps) {
  const [question, setQuestion] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const starterQuestions = roadmap
    ? STARTER_QUESTIONS_WITH_ROADMAP
    : STARTER_QUESTIONS_GENERAL;

  const sendQuestion = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || isSending) return;

    setErrorText(null);
    const userMessage: MentorMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      createdAt: new Date().toISOString(),
    };
    onAddMessage(userMessage);
    setQuestion('');
    setIsSending(true);

    try {
      const response = await fetch('/api/mentor/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          roadmap,
          history: [...messages, userMessage].slice(-6).map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to get a response from Google Gemini AI.');
      }

      onAddMessage({
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: String(data.answer || ''),
        createdAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      setErrorText(
        err instanceof Error
          ? err.message
          : 'Network error while contacting Google Gemini AI.'
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendQuestion(question);
  };

  return (
    <section
      id="gemini-mentor"
      className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-[#161B24] dark:text-slate-100 sm:p-8 no-print"
      aria-labelledby="gemini-mentor-heading"
    >
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A192F] text-sky-300 dark:bg-sky-400/15 dark:text-sky-300">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 id="gemini-mentor-heading" className="font-display text-xl font-bold text-[#0A192F] dark:text-white">
              Ask Google Gemini AI Career Mentor
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {roadmap
                ? `Contextualized to your ${roadmap.targetRole} roadmap (${roadmap.readinessPercentage}% readiness)`
                : 'Ask any question about target roles, study plans, or technical skill gaps'}
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={onClearChat}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 whitespace-nowrap shrink-0 dark:border-slate-700 dark:bg-[#0F131A] dark:text-slate-300 dark:hover:border-red-800 dark:hover:bg-red-950/60 dark:hover:text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Clear Chat</span>
          </button>
        )}
      </div>

      {/* Starter prompt suggestions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {starterQuestions.map((starter) => (
          <button
            key={starter}
            type="button"
            disabled={isSending}
            onClick={() => void sendQuestion(starter)}
            className="cursor-pointer rounded-lg border border-sky-200 bg-sky-50/70 px-3 py-1.5 text-left text-xs font-medium text-[#0A192F] transition-colors hover:border-sky-400 hover:bg-sky-100 disabled:opacity-50 dark:border-sky-800/70 dark:bg-sky-950/50 dark:text-sky-200 dark:hover:border-sky-500 dark:hover:bg-sky-900/60"
          >
            {starter}
          </button>
        ))}
      </div>

      {/* Conversation history */}
      {messages.length > 0 && (
        <div className="mt-5 max-h-80 space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-[#0F131A]">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0A192F] text-sky-300 dark:bg-sky-400/15 dark:text-sky-300">
                  <Bot className="h-4 w-4" aria-hidden="true" />
                </span>
              )}
              <div
                className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[#0A192F] text-white dark:bg-sky-400 dark:text-[#0A192F] dark:font-medium'
                    : 'border border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-[#161B24] dark:text-slate-200'
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}

          {isSending && (
            <div className="flex items-center gap-2.5 text-xs font-medium text-sky-700 dark:text-sky-300">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Google Gemini AI is thinking...</span>
            </div>
          )}
        </div>
      )}

      {errorText && (
        <p className="mt-3 text-xs font-medium text-red-600 dark:text-red-400" role="alert">
          {errorText}
        </p>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2.5">
        <label htmlFor="gemini-mentor-input" className="sr-only">
          Ask Google Gemini AI a career question
        </label>
        <input
          id="gemini-mentor-input"
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask Google Gemini AI about your roadmap, interview prep, or projects..."
          disabled={isSending}
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:bg-slate-50 dark:border-slate-700 dark:bg-[#0F131A] dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-900"
        />
        <button
          type="submit"
          disabled={isSending || !question.trim()}
          className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#0A192F] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#112A4E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap shrink-0 dark:bg-sky-400 dark:text-[#0A192F] dark:hover:bg-sky-300"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="h-4 w-4 text-sky-300 dark:text-[#0A192F]" aria-hidden="true" />
          )}
          <span>Ask Gemini AI</span>
        </button>
      </form>
    </section>
  );
}
