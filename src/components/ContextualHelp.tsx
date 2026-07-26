import React, { useState } from 'react';
import { HelpCircle, X, Sparkles, Info } from 'lucide-react';

interface ContextualHelpProps {
  topic: 'smart_import' | 'test_center' | 'recurring_tasks' | 'todays_focus';
  label?: string;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({ topic, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  const helpContent = {
    smart_import: {
      buttonLabel: label || 'What can I upload?',
      title: 'Smart Import Guide',
      subtitle: 'Supported Document Formats & AI Matching',
      body: (
        <div className="space-y-2.5 text-xs text-slate-300">
          <p>You can upload syllabus PDFs, test scorecards, exam schedules, or screenshots:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-200">
            <li><strong>Test Scorecard PDFs/Images:</strong> CAT, XAT, IMS, CL, TIME score reports. AI parses overall percentile, section scores (VARC, DILR, QA), accuracy, and time spent.</li>
            <li><strong>Syllabus PDFs:</strong> Automatically extracts Subjects, Modules, and Topic lists.</li>
            <li><strong>Timetables & Exam Schedules:</strong> Converts exam dates into scheduled tests and deadlines.</li>
          </ul>
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-200 font-medium">
            Always review extracted fields on the AI Review screen before confirming!
          </div>
        </div>
      ),
    },
    test_center: {
      buttonLabel: label || 'How do tests work?',
      title: 'Test Center & Lifecycle Guide',
      subtitle: 'Mock Debt, Sectionals, & Analysis Tracking',
      body: (
        <div className="space-y-2.5 text-xs text-slate-300">
          <p>Every test follows a four-stage workflow:</p>
          <ol className="list-decimal pl-5 space-y-1 text-slate-200">
            <li><strong>Schedule:</strong> Add upcoming full mocks, sectionals, or university exams with date & time. Scheduled tests appear in your Planner.</li>
            <li><strong>Take Test:</strong> Mark test status as completed.</li>
            <li><strong>Add Results:</strong> Enter scores manually or upload a scorecard via Smart Import (auto-matched).</li>
            <li><strong>Analyse & Log Mistakes:</strong> Complete analysis to clear "Mock Debt" and log mistake error categories in your Mistake Book.</li>
          </ol>
        </div>
      ),
    },
    recurring_tasks: {
      buttonLabel: label || 'How does recurrence work?',
      title: 'Recurring Tasks Guide',
      subtitle: 'Daily Habits & Measurable Habit Streaks',
      body: (
        <div className="space-y-2.5 text-xs text-slate-300">
          <p>Recurring tasks (e.g. "2 RCs Daily", "30 QA Questions") keep your master schedule clean:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-200">
            <li>They maintain a <strong>single canonical task entry</strong> rather than generating hundreds of duplicate future task rows.</li>
            <li>Completing the task today logs a completion record and increments your habit streak.</li>
            <li>The task automatically resets for tomorrow.</li>
          </ul>
        </div>
      ),
    },
    todays_focus: {
      buttonLabel: label || 'How are these selected?',
      title: "Today's Focus Selection Rules",
      subtitle: 'Intelligent Academic Priority Order',
      body: (
        <div className="space-y-2.5 text-xs text-slate-300">
          <p>Academicos automatically prioritizes items in your Today view using this logic:</p>
          <ol className="list-decimal pl-5 space-y-1 text-slate-200">
            <li><strong>Non-Negotiable Target:</strong> The single primary task selected during your Daily Check-In.</li>
            <li><strong>Overdue & Due Deadlines:</strong> Time-critical assignment deadlines and exam registration dates.</li>
            <li><strong>Revision Due Topics:</strong> Topics with low confidence or flagged for spaced repetition.</li>
            <li><strong>Pending Daily Habits:</strong> Your high-priority daily study tasks.</li>
          </ol>
        </div>
      ),
    },
  };

  const current = helpContent[topic];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800/80 hover:bg-zinc-700 text-cyan-300 hover:text-cyan-200 border border-zinc-700/80 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0"
      >
        <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
        <span>{current.buttonLabel}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#27272A] flex items-center justify-between bg-zinc-900/60">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-white text-xs">{current.title}</h3>
                  <p className="text-[10px] text-slate-400">{current.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">{current.body}</div>

            <div className="p-3 bg-zinc-900/80 border-t border-[#27272A] flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
