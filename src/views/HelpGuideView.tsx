import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  HelpCircle,
  Search,
  RotateCcw,
  BookOpen,
  CalendarCheck,
  Calendar,
  CheckSquare,
  Target,
  FileUp,
  LineChart,
  Radio,
  Zap,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  CheckCircle2,
  ListTodo,
  Layers,
  BarChart2,
  Clock,
  Award,
} from 'lucide-react';

export const HelpGuideView: React.FC = () => {
  const { startOnboardingTour, setCurrentView } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setExpandedFaq((prev) => (prev === id ? null : id));
  };

  const guideSections = [
    {
      id: 'getting_started',
      title: 'Getting Started',
      icon: BookOpen,
      color: 'text-cyan-400',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p className="leading-relaxed">
            Academicos is structured around a structured 6-step setup flow to get your entire academic workspace configured:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 font-medium text-slate-200">
            <li>
              <strong className="text-cyan-300">Create your Programs:</strong> Add your degree (e.g. B.Tech), competitive exams (e.g. CAT 2026), or online certifications.
            </li>
            <li>
              <strong className="text-cyan-300">Add/Import Syllabus:</strong> Set up subjects, modules, and topics manually or upload a PDF syllabus using Smart Import.
            </li>
            <li>
              <strong className="text-cyan-300">Add Important Deadlines:</strong> Track university exam dates, registration windows, and assignment submission deadlines.
            </li>
            <li>
              <strong className="text-cyan-300">Schedule Upcoming Tests/Mocks:</strong> Pre-schedule full mocks, sectionals, or mid-term exams in Test Center.
            </li>
            <li>
              <strong className="text-cyan-300">Create Recurring Study Tasks:</strong> Build daily habits (e.g., "2 RCs Daily", "30 QA Questions").
            </li>
            <li>
              <strong className="text-cyan-300">Start Using Today Daily:</strong> Perform your 1-minute daily check-in to set focus goals and available hours.
            </li>
          </ol>
        </div>
      ),
    },
    {
      id: 'daily_workflow',
      title: 'Daily Workflow',
      icon: CalendarCheck,
      color: 'text-teal-400',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>Recommended routine for maximum productivity:</p>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="px-2.5 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-teal-300">Daily Check-In</span>
            <span>&rarr;</span>
            <span className="px-2.5 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-teal-300">Today's Focus</span>
            <span>&rarr;</span>
            <span className="px-2.5 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-teal-300">Start Study Session</span>
            <span>&rarr;</span>
            <span className="px-2.5 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-teal-300">Finish/Log Session</span>
            <span>&rarr;</span>
            <span className="px-2.5 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-teal-300">Complete Tasks</span>
            <span>&rarr;</span>
            <span className="px-2.5 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-teal-300">Check Progress</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Completing check-ins and study sessions automatically maintains your daily academic activity streak!
          </p>
        </div>
      ),
    },
    {
      id: 'programs_syllabus',
      title: 'Programs & Syllabus Hierarchy',
      icon: Layers,
      color: 'text-indigo-400',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>Syllabus is organized hierarchically:</p>
          <div className="p-3 bg-[#09090B] border border-[#27272A] rounded-xl font-mono text-[11px] text-indigo-300 space-y-1">
            <p>&bull; Program (e.g. CAT 2026)</p>
            <p className="pl-4">&bull; Subject (e.g. Quantitative Aptitude)</p>
            <p className="pl-8">&bull; Module (e.g. Arithmetic)</p>
            <p className="pl-12">&bull; Topic (e.g. Time & Work, Percentages)</p>
          </div>
          <p>
            <strong>Topic Statuses:</strong> Not Started &bull; In Progress &bull; Completed &bull; Revision Due
          </p>
          <p className="text-indigo-300">
            <strong>Confidence Rating:</strong> Rated independently from status (1 to 5 stars or Low/Med/High). Even if a topic is "Completed", a low confidence rating alerts you to schedule revision sessions.
          </p>
        </div>
      ),
    },
    {
      id: 'planner',
      title: 'Planner & Master Schedule',
      icon: Calendar,
      color: 'text-amber-400',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Planner brings together all time-sensitive elements into one master view: Tasks, Deadlines, Scheduled Mocks, Sectionals, Exams, Assignments, Analysis Dates, and Academic Events.
          </p>
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200">
            <strong className="block font-bold mb-1 text-amber-300">Calendar is a VIEW, not a separate object!</strong>
            <p className="text-[11px] leading-relaxed">
              You do not need to create duplicate calendar events for existing tasks or tests. Creating a Task or scheduling a Mock automatically surfaces it on the Calendar view.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'tasks',
      title: 'Tasks & Recurrence Engine',
      icon: CheckSquare,
      color: 'text-emerald-400',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>Academicos supports 3 distinct task types:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-200">
            <li>
              <strong>One-time tasks:</strong> e.g., <em>"Submit CSE Assignment 2"</em>
            </li>
            <li>
              <strong>Recurring tasks:</strong> e.g., <em>"2 RCs Daily"</em> (resets daily without cluttering future dates)
            </li>
            <li>
              <strong>Measurable tasks:</strong> e.g., <em>"30 QA Questions"</em> (tracks progress count incrementally)
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'test_center',
      title: 'Test Center & Mock Debt',
      icon: Target,
      color: 'text-purple-400',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>Lifecycle of a test in Academicos:</p>
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl font-mono text-[11px] text-purple-200 flex flex-wrap items-center gap-2">
            <span>Schedule Test</span>
            <span>&rarr;</span>
            <span>Take Test</span>
            <span>&rarr;</span>
            <span>Add / Smart Import Result</span>
            <span>&rarr;</span>
            <span>Perform Analysis</span>
          </div>
          <p className="text-[11px]">
            Scheduled mocks automatically appear in your Planner. When you upload a scorecard PDF via Smart Import, Academicos intelligently matches it to your scheduled mock!
          </p>
        </div>
      ),
    },
    {
      id: 'smart_import',
      title: 'Smart Import AI Parser',
      icon: FileUp,
      color: 'text-rose-400',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>Smart Import Lifecycle:</p>
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl font-mono text-[11px] text-rose-200 flex flex-wrap items-center gap-2">
            <span>Upload Document</span>
            <span>&rarr;</span>
            <span>AI Extraction</span>
            <span>&rarr;</span>
            <span>Review Parsed Data</span>
            <span>&rarr;</span>
            <span>Match Entity</span>
            <span>&rarr;</span>
            <span>Confirm Import</span>
          </div>
          <p className="text-rose-300 font-semibold text-[11px]">
            Crucial Note: Always review AI-extracted scores, topic names, and dates in the review step before final confirmation.
          </p>
        </div>
      ),
    },
    {
      id: 'insights',
      title: 'Insights & Performance Analytics',
      icon: LineChart,
      color: 'text-cyan-400',
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <p>Analyze your progress across 5 dedicated view tabs:</p>
          <p className="font-mono text-[11px] text-cyan-300">
            Overview &bull; CAT Performance &bull; Study Time &bull; Consistency Streaks &bull; Weekly Review
          </p>
        </div>
      ),
    },
    {
      id: 'updates',
      title: 'Verified Official Updates',
      icon: Radio,
      color: 'text-blue-400',
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <p>
            Updates delivers verified notifications for exam registrations, admit card alerts, and academic schedules from primary portals (IIM CAT, XLRI, IIT Madras, etc.).
          </p>
          <p className="text-blue-300">
            <strong>Important Policy:</strong> Updates do NOT automatically pollute your Planner. When an update contains an actionable deadline, click <strong>[Add Deadline]</strong> to review and add a canonical Task to your Planner.
          </p>
        </div>
      ),
    },
    {
      id: 'streak',
      title: 'Academic Activity Streak Policy',
      icon: Zap,
      color: 'text-amber-400',
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200">
            <strong className="block text-amber-300 font-bold mb-1">Academic Activity Streak vs. Login Streak</strong>
            <p className="text-[11px] leading-relaxed">
              The Academicos streak is NOT earned by merely logging in or visiting the app. It is an <strong>Academic Activity Streak</strong> earned by completing study sessions, logging tasks, finishing check-ins, or analyzing mocks.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const faqs = [
    {
      id: 'faq-1',
      question: "Why isn't something appearing in my Calendar?",
      answer:
        "The Calendar in Academicos is a unified view of existing Tasks and Test Center entries. Make sure your item has a valid Due Date (for Tasks) or Date (for Mocks/Sectionals). Items without dates appear in the un-scheduled task list rather than on specific calendar grid cells.",
    },
    {
      id: 'faq-2',
      question: 'How do I schedule a CAT mock?',
      answer:
        "Go to Test Center, click 'Schedule Test', select CAT Mock as the type, enter the provider (IMS, CL, TIME, etc.), date, and time. It will automatically reflect in your Test Center and Planner.",
    },
    {
      id: 'faq-3',
      question: 'How do I upload a mock result?',
      answer:
        "You can either enter the scores manually by clicking 'Enter Result' on a scheduled test in Test Center, or go to Smart Import and upload a PDF/screenshot of your scorecard. Smart Import will auto-detect the provider and scores for review.",
    },
    {
      id: 'faq-4',
      question: 'How do recurring tasks work?',
      answer:
        "Recurring tasks (e.g., '2 RCs Daily') maintain a single master entry. When completed today, your completion history and streak increase, and the task automatically resets for tomorrow without cluttering future calendar days with duplicate items.",
    },
    {
      id: 'faq-5',
      question: 'How is my streak calculated?',
      answer:
        'Your streak increments whenever you perform meaningful academic activity on a given date (such as completing a task, logging study minutes, submitting a check-in, or completing a test analysis). Missing a day breaks the streak.',
    },
    {
      id: 'faq-6',
      question: 'How do I add another degree or exam?',
      answer:
        "Navigate to Programs view, click '+ Add Program', select the program type (Degree, Competitive Exam, Course, Certification), enter the institution and target date, and save.",
    },
    {
      id: 'faq-7',
      question: 'Can I edit AI-imported data?',
      answer:
        'Yes! Smart Import presents a preliminary Review Screen where every detected field (scores, topic names, dates, section percentiles) is fully editable before you confirm the import.',
    },
    {
      id: 'faq-8',
      question: "Why didn't Smart Import find my scheduled mock?",
      answer:
        "Smart Import matches uploaded scorecards based on provider name, test title keywords, and proximity to the test date. If a match isn't automatically suggested, you can manually select the scheduled test from the dropdown on the review screen.",
    },
    {
      id: 'faq-9',
      question: 'How is syllabus progress calculated?',
      answer:
        "Syllabus completion percentage is calculated as: (Completed Topics / Total Topics) * 100 per program and subject. Topics marked as 'Revision Due' are counted towards total topics but flagged for review.",
    },
  ];

  const filteredSections = guideSections.filter(
    (s) =>
      !searchTerm ||
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFaqs = faqs.filter(
    (f) =>
      !searchTerm ||
      f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272A] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Academicos Help & Knowledge Guide</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Official documentation, workflow explanations, calendar rules, and frequently asked questions.
          </p>
        </div>

        <button
          onClick={() => startOnboardingTour()}
          className="flex items-center gap-2 px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart Onboarding Tour</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative bg-[#18181B] border border-[#27272A] p-2.5 rounded-xl">
        <Search className="w-4 h-4 text-slate-500 absolute left-5 top-4" />
        <input
          type="text"
          placeholder="Search guide topics, workflows, or FAQs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#09090B] border border-[#27272A] focus:border-cyan-400 rounded-lg py-2 pl-9 pr-3 text-xs text-white outline-none"
        />
      </div>

      {/* Guide Sections Grid */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
          Core Workflows & Systems
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSections.map((sec) => {
            const Icon = sec.icon;
            return (
              <div
                key={sec.id}
                className="p-5 bg-[#18181B] border border-[#27272A] rounded-2xl space-y-3 shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-zinc-800 border border-zinc-700">
                    <Icon className={`w-4 h-4 ${sec.color}`} />
                  </div>
                  <h3 className="font-bold text-white text-sm">{sec.title}</h3>
                </div>

                <div>{sec.content}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4 pt-4 border-t border-[#27272A]">
        <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-400" />
          <span>Frequently Asked Questions (FAQ)</span>
        </h2>

        <div className="space-y-2.5">
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedFaq === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs font-bold text-white hover:bg-zinc-800/60 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-cyan-400 font-mono">Q:</span>
                    <span>{faq.question}</span>
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-4 pt-0 text-xs text-slate-300 border-t border-[#27272A]/50 bg-[#09090B]/60 leading-relaxed">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
