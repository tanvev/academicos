import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Zap, BookOpen, GraduationCap, Award, Target, Check, ArrowRight, Sparkles, Plus, Trash2 } from 'lucide-react';

export const OnboardingView: React.FC = () => {
  const { completeOnboarding, currentUser } = useApp();

  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [customPrograms, setCustomPrograms] = useState<{ name: string; type: 'degree' | 'competitive_exam' | 'course' | 'certification' | 'placement_prep' | 'other' }[]>([]);
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomType, setNewCustomType] = useState<'degree' | 'competitive_exam' | 'course' | 'certification' | 'placement_prep' | 'other'>('degree');

  const toggleProgram = (id: string) => {
    setSelectedPrograms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleAddCustom = () => {
    if (!newCustomName.trim()) return;
    setCustomPrograms((prev) => [...prev, { name: newCustomName.trim(), type: newCustomType }]);
    setNewCustomName('');
  };

  const handleRemoveCustom = (index: number) => {
    setCustomPrograms((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFinish = () => {
    completeOnboarding(selectedPrograms, [...selectedPrograms, ...customPrograms.map((c) => c.name)]);
  };

  const presetOptions = [
    {
      id: 'cat',
      title: 'CAT 2026 Preparation',
      subtitle: 'Includes VARC, DILR, QA sectionals, syllabus tracking & mock debt analyzer.',
      type: 'competitive_exam',
      badge: 'Popular',
      color: '#2DD4BF',
    },
    {
      id: 'btech',
      title: 'B.Tech CSE / Engineering Degree',
      subtitle: 'Semester course modules, lab assignments, mid-terms & end-terms.',
      type: 'degree',
      color: '#38BDF8',
    },
    {
      id: 'bs_ds',
      title: 'IIT Madras BS in Data Science',
      subtitle: 'Term assignments, online quizzes, programming exams & grading track.',
      type: 'degree',
      color: '#818CF8',
    },
    {
      id: 'xat_snap',
      title: 'XAT / SNAP / NMAT Prep',
      subtitle: 'Decision making, general awareness, speed tests & sectional analysis.',
      type: 'competitive_exam',
      color: '#F43F5E',
    },
    {
      id: 'placement',
      title: 'Campus Placements & Interview Prep',
      subtitle: 'DSA topic tracker, system design, mock interviews & aptitude tests.',
      type: 'course',
      color: '#F59E0B',
    },
    {
      id: 'gmat',
      title: 'GMAT / GRE Study Track',
      subtitle: 'Quantitative reasoning, verbal reasoning, analytical writing.',
      type: 'competitive_exam',
      color: '#A855F7',
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-8">
      <div className="w-full max-w-2xl bg-[#18181B] border border-[#27272A] rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome, {currentUser?.name || 'Academic Scholar'}!</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Welcome to Academicos. What are you working toward?
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Select or add the academic programs, degrees, or competitive exams you are focusing on.
          </p>
        </div>

        {/* Preset Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {presetOptions.map((opt) => {
            const isSelected = selectedPrograms.includes(opt.id);
            return (
              <div
                key={opt.id}
                onClick={() => toggleProgram(opt.id)}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between relative ${
                  isSelected
                    ? 'bg-teal-500/10 border-teal-500/50 shadow-[0_0_15px_rgba(45,212,191,0.1)]'
                    : 'bg-zinc-800/40 border-[#27272A] hover:bg-zinc-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-500">
                      {opt.type.replace('_', ' ')}
                    </span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center text-black">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{opt.title}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{opt.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Program Entry */}
        <div className="p-4 bg-[#09090B] border border-[#27272A] rounded-xl space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            Add Custom Degree / Exam / Certification
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="e.g. Master of Science in AI / GATE 2027"
              value={newCustomName}
              onChange={(e) => setNewCustomName(e.target.value)}
              className="flex-1 bg-[#18181B] border border-[#27272A] focus:border-teal-400 rounded-lg p-2.5 text-xs text-white outline-none"
            />
            <select
              value={newCustomType}
              onChange={(e) => setNewCustomType(e.target.value as any)}
              className="bg-[#18181B] border border-[#27272A] focus:border-teal-400 rounded-lg p-2.5 text-xs text-slate-300 outline-none"
            >
              <option value="degree">Degree</option>
              <option value="competitive_exam">Competitive Exam</option>
              <option value="course">Course</option>
              <option value="certification">Certification</option>
              <option value="placement_prep">Placement Preparation</option>
              <option value="other">Other</option>
            </select>
            <button
              type="button"
              onClick={handleAddCustom}
              className="px-4 py-2.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          {customPrograms.length > 0 && (
            <div className="space-y-1.5 pt-2">
              {customPrograms.map((cp, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/80 text-xs"
                >
                  <span className="font-medium text-white">{cp.name} ({cp.type})</span>
                  <button
                    onClick={() => handleRemoveCustom(idx)}
                    className="text-rose-400 hover:text-rose-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleFinish}
          disabled={selectedPrograms.length === 0 && customPrograms.length === 0}
          className="w-full py-3.5 bg-teal-500 hover:bg-teal-400 text-black text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(45,212,191,0.2)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span>Launch Academicos OS</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
