import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  BookOpen,
  CalendarCheck,
  Calendar,
  Clock,
  Target,
  FileUp,
  LineChart,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Compass,
} from 'lucide-react';

interface OnboardingTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingTourModal: React.FC<OnboardingTourModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { setCurrentView, updateSettings } = useApp();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: 'Programs',
      subtitle: 'Set up your Academic Scope',
      icon: BookOpen,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      description: "Add everything you're currently studying or preparing for.",
      targetView: 'programs',
      detail:
        'Group your subjects, modules, and topics under specific degrees, competitive exams, or certifications.',
    },
    {
      title: 'Today',
      subtitle: 'Daily Focus & Non-Negotiables',
      icon: CalendarCheck,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/30',
      description: 'Check in and see what deserves your attention today.',
      targetView: 'dashboard',
      detail:
        'Complete your quick Daily Check-in to set available study hours, energy levels, and a single non-negotiable target task.',
    },
    {
      title: 'Planner',
      subtitle: 'Unified Academic Master Schedule',
      icon: Calendar,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30',
      description:
        'Your tasks, deadlines, mocks, sectionals and exams appear here automatically.',
      targetView: 'tasks',
      detail:
        'No duplicate calendar entries! One-time tasks, recurring habits, and official exam deadlines sync seamlessly across List and Calendar views.',
    },
    {
      title: 'Study',
      subtitle: 'Deep Focus & Session Logging',
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      description: 'Start a study session and Academicos tracks your time and progress.',
      targetView: 'study',
      detail:
        'Use the built-in Pomodoro/Stopwatch timer to log actual study minutes against specific topics and maintain your Academic Activity Streak.',
    },
    {
      title: 'Test Center',
      subtitle: 'Mocks, Sectionals & Mock Debt Analysis',
      icon: Target,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      description:
        'Schedule mocks, sectionals, quizzes and exams, then add results and analysis.',
      targetView: 'test_center',
      detail:
        'Keep track of unanalysed test debt, sectional percentiles, and mistake error categories to eliminate repeating mistakes.',
    },
    {
      title: 'Smart Import',
      subtitle: 'AI Document & Result Parser',
      icon: FileUp,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
      description:
        'Upload syllabus PDFs, mock-result PDFs or screenshots instead of entering everything manually.',
      targetView: 'smart_import',
      detail:
        'Extract topics, scorecards, or exam dates automatically with AI review before confirming changes to your workspace.',
    },
    {
      title: 'Insights',
      subtitle: 'Analytics & Weekly Performance Reviews',
      icon: LineChart,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      description: 'See your study, test and consistency trends.',
      targetView: 'analytics_study',
      detail:
        'Generate deterministic weekly performance summaries, track accuracy trends, and share or email your study review.',
    },
  ];

  const handleFinish = () => {
    updateSettings({ hasSeenTour: true });
    onClose();
    setCurrentView('dashboard');
  };

  const isFinalStep = currentStep === tourSteps.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative space-y-0">
        {/* Top Header */}
        <div className="p-4 border-b border-[#27272A] flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
            <span className="text-xs font-bold text-white tracking-wide uppercase font-mono">
              Academicos Tour &bull; Step {Math.min(currentStep + 1, tourSteps.length + 1)} of{' '}
              {tourSteps.length + 1}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-1 rounded bg-zinc-800 border border-zinc-700 transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>Skip Tour</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step Body */}
        {!isFinalStep ? (
          <div className="p-6 space-y-5">
            {/* Step Icon Header */}
            {(() => {
              const step = tourSteps[currentStep];
              const StepIcon = step.icon;
              return (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl ${step.bgColor} border ${step.borderColor} flex items-center justify-center shrink-0`}
                    >
                      <StepIcon className={`w-6 h-6 ${step.color}`} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                        Core Workflow #{currentStep + 1}
                      </span>
                      <h2 className="text-xl font-extrabold text-white">{step.title}</h2>
                      <p className="text-xs text-slate-400">{step.subtitle}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-[#09090B] border border-[#27272A] rounded-xl space-y-2">
                    <p className="text-sm font-bold text-cyan-300 leading-snug">
                      "{step.description}"
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">{step.detail}</p>
                  </div>
                </div>
              );
            })()}

            {/* Navigation Indicators */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5">
                {tourSteps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === currentStep
                        ? 'w-6 bg-cyan-400'
                        : 'w-2 bg-zinc-800 hover:bg-zinc-700'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                    className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-slate-300 border border-zinc-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    const nextStep = currentStep + 1;
                    if (nextStep < tourSteps.length) {
                      setCurrentStep(nextStep);
                    } else {
                      setCurrentStep(tourSteps.length);
                    }
                  }}
                  className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Final Completion Screen */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                Setup Complete
              </span>
              <h2 className="text-2xl font-extrabold text-white">
                You're ready to use Academicos.
              </h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Your programs, syllabus progress, test center, and deadlines are synchronized and ready for focus.
              </p>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Go to Today</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
