import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { AppAppearanceMode, AppPalette } from '../types';
import {
  Settings,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  User,
  Calendar,
  Target,
  Mail,
  Send,
  AlertCircle,
  Clock,
  Globe,
  Share2,
  Info,
  Palette,
  Moon,
  Sun,
  Laptop,
  Sparkles,
  Waves,
  Flower2,
  Sunset as SunsetIcon,
  Check,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    loadDemoData: loadStarterData,
    clearDemoData: clearAllData,
    exportData: exportJSON,
    importData: importJSON,
    currentUser,
    sendWeeklyReportEmail,
    setCurrentView,
    startOnboardingTour,
  } = useApp();

  const { mode, palette, resolvedTheme, setMode, setPalette } = useTheme();

  const [userName, setUserName] = useState(settings.userName);
  const [catExamDate, setCatExamDate] = useState(settings.catExamDate);
  const [catMockTarget, setCatMockTarget] = useState(settings.catMockTarget);
  const [catSectionalTarget, setCatSectionalTarget] = useState(settings.catSectionalTarget);

  const modes: Array<{
    id: AppAppearanceMode;
    name: string;
    description: string;
    icon: React.ElementType;
  }> = [
    {
      id: 'light',
      name: 'Light',
      description: 'Crisp, high-clarity light canvas',
      icon: Sun,
    },
    {
      id: 'dark',
      name: 'Dark',
      description: 'Focused, eye-safe dark canvas',
      icon: Moon,
    },
    {
      id: 'system',
      name: 'Follow System',
      description: 'Syncs automatically with device OS preference',
      icon: Laptop,
    },
    {
      id: 'auto',
      name: 'Auto Time',
      description: 'Light (07:00 AM – 06:00 PM) • Dark (06:00 PM – 07:00 AM)',
      icon: Clock,
    },
  ];

  const palettes: Array<{
    id: AppPalette;
    name: string;
    badge: string;
    description: string;
    feeling: string;
    icon: React.ElementType;
    previewBgDark: string;
    previewBgLight: string;
    previewPrimary: string;
  }> = [
    {
      id: 'ocean',
      name: 'Ocean',
      badge: 'Default',
      description: 'Deep navy background (Dark) / Crisp white (Light) with cyan primary accent.',
      feeling: 'Modern, professional, productivity focused.',
      icon: Waves,
      previewBgDark: '#0a1128',
      previewBgLight: '#ffffff',
      previewPrimary: '#06b6d4',
    },
    {
      id: 'blossom',
      name: 'Blossom',
      badge: 'Aesthetic',
      description: 'Charcoal background (Dark) / Soft blush (Light) with pink rose accents.',
      feeling: 'Calm, cozy, aesthetic.',
      icon: Flower2,
      previewBgDark: '#18181b',
      previewBgLight: '#fdf2f8',
      previewPrimary: '#ec4899',
    },
    {
      id: 'sunset',
      name: 'Sunset',
      badge: 'Warm',
      description: 'Deep plum background (Dark) / Warm cream (Light) with orange coral accents.',
      feeling: 'Warm, energetic and motivating.',
      icon: SunsetIcon,
      previewBgDark: '#1f0b1e',
      previewBgLight: '#fffbeb',
      previewPrimary: '#f97316',
    },
  ];

  // Email settings state
  const [emailWeeklyReport, setEmailWeeklyReport] = useState<boolean>(
    settings.emailWeeklyReport ?? true
  );
  const [weeklyReportEmail, setWeeklyReportEmail] = useState<string>(
    settings.weeklyReportEmail || currentUser?.email || ''
  );
  const [reportDay, setReportDay] = useState<string>(settings.reportDay || 'Monday');
  const [reportTime, setReportTime] = useState<string>(settings.reportTime || '08:00');
  const [weeklyEmailTimezone, setWeeklyEmailTimezone] = useState<string>(
    currentUser?.timezone || 'Asia/Kolkata'
  );

  // Email test dispatch delivery tracking
  const [deliveryStatus, setDeliveryStatus] = useState<'idle' | 'pending' | 'sent' | 'failed'>('idle');
  const [deliveryMessage, setDeliveryMessage] = useState<string | null>(null);

  const [isSaved, setIsSaved] = useState(false);

  const handleExport = () => {
    const jsonStr = exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academicos-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      userName: userName.trim(),
      catExamDate,
      catMockTarget: Number(catMockTarget),
      catSectionalTarget: Number(catSectionalTarget),
      emailWeeklyReport,
      weeklyReportEmail: weeklyReportEmail.trim(),
      reportDay,
      reportTime,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSendTestReport = async () => {
    setDeliveryStatus('pending');
    setDeliveryMessage('Contacting server email dispatch service...');

    const result = await sendWeeklyReportEmail(weeklyReportEmail);

    if (result.success) {
      setDeliveryStatus('sent');
      setDeliveryMessage(result.message || 'Weekly report email sent successfully!');
    } else {
      setDeliveryStatus('failed');
      setDeliveryMessage(result.message || 'Delivery failed: Server email provider is not configured.');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        if (importJSON(text)) {
          alert('Academicos data imported successfully!');
        } else {
          alert('Failed to import JSON data. Invalid format.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#27272A] pb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-400" />
          <h2 className="text-xl font-bold text-white">System Settings & Delivery Options</h2>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure profile details, exam targets, weekly email schedules, and data backups.
        </p>
      </div>

      {/* Appearance & Visual Theme Settings Section */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[var(--primary)]" />
            <h3 className="font-bold text-[var(--text)] text-xs">
              Appearance Settings
            </h3>
          </div>
          <span className="text-[11px] text-[var(--text-secondary)] font-medium capitalize">
            Mode: {mode} • Palette: {palette} ({resolvedTheme})
          </span>
        </div>

        {/* 1. Display Mode Selection */}
        <div className="space-y-2.5">
          <label className="block text-[var(--text-secondary)] text-[11px] font-semibold">
            Display Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {modes.map((m) => {
              const isActive = mode === m.id;
              const IconComponent = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`relative p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10 shadow-xs'
                      : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--text-secondary)]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)]">
                        <IconComponent className={`w-4 h-4 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`} />
                        <span>{m.name}</span>
                      </div>
                      {isActive && (
                        <span className="w-4 h-4 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--text-secondary)] leading-snug">
                      {m.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Palette Selection */}
        <div className="space-y-2.5">
          <label className="block text-[var(--text-secondary)] text-[11px] font-semibold">
            Theme Palette
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {palettes.map((p) => {
              const isActive = palette === p.id;
              const IconComponent = p.icon;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPalette(p.id)}
                  className={`relative p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isActive
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10 shadow-xs'
                      : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--text-secondary)]'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)]">
                        <IconComponent className={`w-4 h-4 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`} />
                        <span>{p.name}</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border)]">
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--text-secondary)] leading-snug">
                      {p.description}
                    </p>
                    <div className="text-[9px] italic text-[var(--primary)] font-medium pt-1">
                      Feeling: {p.feeling}
                    </div>
                  </div>

                  {/* Dual Theme Swatch Bar */}
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)]">
                    <div className="flex-1 flex items-center gap-1.5 px-2 py-1 rounded bg-[#0f172a] text-white text-[9px] font-bold">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.previewPrimary }} />
                      <span>Dark</span>
                    </div>
                    <div className="flex-1 flex items-center gap-1.5 px-2 py-1 rounded bg-white text-slate-800 text-[9px] font-bold border border-slate-200">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.previewPrimary }} />
                      <span>Light</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Live Preview Card */}
        <div className="space-y-2.5 pt-3 border-t border-[var(--border)]">
          <div className="flex items-center justify-between">
            <label className="text-[var(--text-secondary)] text-xs font-semibold flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Live Interface Preview</span>
            </label>
            <span className="text-[10px] text-[var(--primary)] font-bold bg-[var(--primary)]/10 px-2 py-0.5 rounded-full border border-[var(--primary)]/20">
              Real-time Design Tokens
            </span>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-3">
            {/* Miniature Layout Container */}
            <div className="flex h-56 rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--background)] shadow-inner">
              
              {/* Miniature Sidebar */}
              <div className="w-20 bg-[var(--surface)] border-r border-[var(--border)] p-2 flex flex-col justify-between shrink-0">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded bg-[var(--primary)] flex items-center justify-center text-[9px] font-black text-[var(--primary-foreground)]">
                      A
                    </div>
                    <span className="text-[9px] font-bold text-[var(--text)] truncate">
                      Academicos
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="px-1.5 py-1 rounded bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-[8px] font-bold text-[var(--primary)] flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                      <span>Dashboard</span>
                    </div>
                    <div className="px-1.5 py-1 rounded text-[8px] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-secondary)]" />
                      <span>Planner</span>
                    </div>
                    <div className="px-1.5 py-1 rounded text-[8px] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-secondary)]" />
                      <span>CAT Mocks</span>
                    </div>
                  </div>
                </div>
                <div className="px-1.5 py-1 rounded bg-[var(--surface-secondary)] text-[8px] font-medium text-[var(--text-secondary)]">
                  ⚙ Settings
                </div>
              </div>

              {/* Main Preview Area */}
              <div className="flex-1 p-3 space-y-3 overflow-hidden bg-[var(--background)] flex flex-col justify-between">
                
                {/* Header Strip */}
                <div className="flex items-center justify-between text-[10px] border-b border-[var(--border)] pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[var(--text)]">Academic Workspace</span>
                    <span className="text-[8px] px-1.5 py-0.2 rounded bg-[var(--primary)]/15 text-[var(--primary)] font-semibold">
                      {palette} • {resolvedTheme}
                    </span>
                  </div>
                  <span className="text-[8px] text-[var(--text-secondary)] font-medium">
                    Today: 3 Tasks Pending
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Miniature Dashboard Card */}
                  <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-1">
                    <div className="text-[9px] text-[var(--text-secondary)] font-medium">
                      Weekly Study Hours
                    </div>
                    <div className="text-sm font-bold text-[var(--text)]">28.4 hrs</div>
                    <div className="text-[8px] text-[var(--primary)] font-semibold">
                      +15% Target Progress
                    </div>
                  </div>

                  {/* Miniature Calendar */}
                  <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-1">
                    <div className="text-[9px] text-[var(--text-secondary)] font-medium">
                      Calendar Schedule
                    </div>
                    <div className="grid grid-cols-7 gap-0.5 pt-0.5">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                        <div
                          key={idx}
                          className={`h-5 rounded text-[8px] flex flex-col items-center justify-center font-bold ${
                            idx === 2
                              ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                              : idx === 4
                              ? 'bg-[var(--calendar-event)] text-[var(--primary)] border border-[var(--primary)]/30'
                              : 'bg-[var(--surface-secondary)] text-[var(--text)]'
                          }`}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Miniature Task Card & Progress Bar */}
                <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded border border-[var(--primary)] bg-[var(--primary)]/20 flex items-center justify-center text-[8px] text-[var(--primary)] font-bold">
                        ✓
                      </div>
                      <span className="text-[10px] font-semibold text-[var(--text)] truncate">
                        CAT Quantitative Aptitude Mock #08
                      </span>
                    </div>
                    <span className="text-[8px] px-1.5 py-0.2 rounded bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30 font-bold">
                      High Priority
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[8px]">
                      <span className="text-[var(--text-secondary)]">Mock Progress</span>
                      <span className="font-bold text-[var(--primary)]">85% Completed</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[var(--surface-secondary)] overflow-hidden">
                      <div
                        className="h-full bg-[var(--primary)] rounded-full transition-all duration-300"
                        style={{ width: '85%' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Miniature Buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-[var(--border)]">
                  <button
                    type="button"
                    className="px-3 py-1 rounded-md text-[10px] font-bold bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] shadow-xs transition-all"
                  >
                    Primary Button
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1 rounded-md text-[10px] font-semibold bg-[var(--surface-secondary)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--text-secondary)] transition-all"
                  >
                    Secondary Button
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User & Exam Profile Form */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 space-y-4 shadow-sm">
        <h3 className="font-bold text-white text-xs flex items-center gap-2">
          <User className="w-4 h-4 text-cyan-400" />
          <span>Academic Profile & Exam Targets</span>
        </h3>

        <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 text-[11px] mb-1">User Name</label>
            <input
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-[#09090B] border border-[#27272A] rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">CAT Exam Date</label>
              <input
                type="date"
                required
                value={catExamDate}
                onChange={(e) => setCatExamDate(e.target.value)}
                className="w-full bg-[#09090B] border border-[#27272A] rounded-lg p-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">CAT Target Mock Count</label>
              <input
                type="number"
                required
                min="1"
                value={catMockTarget}
                onChange={(e) => setCatMockTarget(Number(e.target.value))}
                className="w-full bg-[#09090B] border border-[#27272A] rounded-lg p-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Target Sectional Count</label>
              <input
                type="number"
                required
                min="1"
                value={catSectionalTarget}
                onChange={(e) => setCatSectionalTarget(Number(e.target.value))}
                className="w-full bg-[#09090B] border border-[#27272A] rounded-lg p-2 text-white"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {isSaved ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile saved!</span>
              </span>
            ) : (
              <span />
            )}

            <button
              type="submit"
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* Weekly Report Email Delivery Configuration */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 space-y-4 shadow-sm text-xs">
        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
          <h3 className="font-bold text-white text-xs flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-400" />
            <span>Weekly Report Email Delivery</span>
          </h3>

          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-slate-400 text-xs">
              {emailWeeklyReport ? 'Enabled' : 'Disabled'}
            </span>
            <input
              type="checkbox"
              checked={emailWeeklyReport}
              onChange={(e) => setEmailWeeklyReport(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </label>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-slate-400 text-[11px] mb-1">
              Registered Recipient Email (Server-side delivery)
            </label>
            <input
              type="email"
              value={weeklyReportEmail}
              onChange={(e) => setWeeklyReportEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full bg-[#09090B] border border-[#27272A] focus:border-emerald-500 rounded-lg p-2 text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Delivery Day</label>
              <select
                value={reportDay}
                onChange={(e) => setReportDay(e.target.value)}
                className="w-full bg-[#09090B] border border-[#27272A] rounded-lg p-2 text-white"
              >
                <option value="Monday">Monday</option>
                <option value="Sunday">Sunday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Scheduled Time</label>
              <input
                type="time"
                value={reportTime}
                onChange={(e) => setReportTime(e.target.value)}
                className="w-full bg-[#09090B] border border-[#27272A] rounded-lg p-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Timezone</label>
              <select
                value={weeklyEmailTimezone}
                onChange={(e) => setWeeklyEmailTimezone(e.target.value)}
                className="w-full bg-[#09090B] border border-[#27272A] rounded-lg p-2 text-white"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>
          </div>

          {/* Delivery Test Action */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#27272A]">
            <button
              onClick={handleSendTestReport}
              disabled={deliveryStatus === 'pending'}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Test Report</span>
            </button>

            {/* Delivery Tracking Badge */}
            {deliveryStatus !== 'idle' && (
              <div
                className={`p-2 rounded-lg border text-[11px] flex items-center gap-2 ${
                  deliveryStatus === 'pending'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : deliveryStatus === 'sent'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {deliveryStatus === 'pending' && <Clock className="w-3.5 h-3.5 animate-spin" />}
                {deliveryStatus === 'sent' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                {deliveryStatus === 'failed' && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
                <div>
                  <span className="font-bold uppercase font-mono mr-1">[{deliveryStatus}]:</span>
                  <span>{deliveryMessage}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp Integration Notice */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 space-y-2 shadow-sm text-xs">
        <h3 className="font-bold text-white text-xs flex items-center gap-2">
          <Share2 className="w-4 h-4 text-teal-400" />
          <span>WhatsApp & Manual Sharing Policy</span>
        </h3>
        <p className="text-slate-400 leading-relaxed text-[11px]">
          Automated WhatsApp delivery is disabled to avoid unverified third-party messaging. Users can manually share Weekly Performance Reviews directly to WhatsApp using Web Share API from the <span className="text-cyan-400 font-semibold">Weekly Review</span> page.
        </p>
      </div>

      {/* Help & User Guide Card */}
      <div className="bg-[#18181B] border border-cyan-500/30 rounded-2xl p-5 space-y-3 shadow-sm text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-xs">Help & User Guide</h3>
          </div>
          <button
            onClick={() => setCurrentView('help_guide')}
            className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-md flex items-center gap-1.5"
          >
            <span>Open Guide</span>
          </button>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          Learn how to master Academicos: Daily workflow, Programs, Smart Import, Test Center, Analytics, and Notifications. You can also restart the interactive onboarding tour at any time.
        </p>
        <div className="pt-1">
          <button
            onClick={() => startOnboardingTour()}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-cyan-300 border border-zinc-700 font-semibold rounded-lg text-xs transition-all cursor-pointer"
          >
            Restart Interactive Tour
          </button>
        </div>
      </div>

      {/* Data Backup & Restore */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 space-y-4 shadow-sm text-xs">
        <h3 className="font-bold text-white text-xs flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Data Backup, Export & Restore</span>
        </h3>

        <p className="text-slate-400 text-[11px]">
          Academicos persists your academic data safely in Cloud Firestore under your account. Export a JSON backup to save a local copy anytime.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleExport}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup (JSON)</span>
          </button>

          <label className="bg-zinc-800 hover:bg-zinc-700 text-slate-200 border border-zinc-700 font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all">
            <Upload className="w-4 h-4" />
            <span>Import JSON Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Reset & Data Control */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 space-y-4 shadow-sm text-xs">
        <h3 className="font-bold text-white text-xs flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-amber-400" />
          <span>Reset & Workspace Controls</span>
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              if (confirm('DANGER: Clear all data and reset Academicos? This action cannot be undone unless you have a backup.')) {
                clearAllData();
                alert('All data cleared.');
              }
            }}
            className="bg-rose-950/60 hover:bg-rose-950 text-rose-300 border border-rose-500/40 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All App Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
