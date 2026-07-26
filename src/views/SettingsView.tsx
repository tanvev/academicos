import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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

  const [userName, setUserName] = useState(settings.userName);
  const [catExamDate, setCatExamDate] = useState(settings.catExamDate);
  const [catMockTarget, setCatMockTarget] = useState(settings.catMockTarget);
  const [catSectionalTarget, setCatSectionalTarget] = useState(settings.catSectionalTarget);

  // Email settings state
  const [emailWeeklyReport, setEmailWeeklyReport] = useState<boolean>(
    settings.emailWeeklyReport ?? true
  );
  const [weeklyReportEmail, setWeeklyReportEmail] = useState<string>(
    settings.weeklyReportEmail || currentUser?.email || 'tanvisundarkar@gmail.com'
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
              placeholder="tanvisundarkar@gmail.com"
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
          Academicos persists all your data locally in your browser storage (`localStorage`). Export a JSON backup to transfer data safely.
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

      {/* Reset & Demo Data Control */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 space-y-4 shadow-sm text-xs">
        <h3 className="font-bold text-white text-xs flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-amber-400" />
          <span>Reset & Starter Data Controls</span>
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              if (confirm('Load pre-populated starter demo data? This will append default CAT, MANIT, and IITM records.')) {
                loadStarterData();
                alert('Starter demo data loaded successfully!');
              }
            }}
            className="bg-zinc-800 hover:bg-zinc-700 text-cyan-400 border border-zinc-700 font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Load Starter Demo Data</span>
          </button>

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
