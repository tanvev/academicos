import React, { useState } from 'react';
import { Database, ArrowRight, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MigrationModal: React.FC = () => {
  const { showMigrationPrompt, setShowMigrationPrompt, performMigration } = useApp();
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationError, setMigrationError] = useState<string | null>(null);
  const [migrationSuccess, setMigrationSuccess] = useState(false);

  if (!showMigrationPrompt) return null;

  const handleImport = async () => {
    setIsMigrating(true);
    setMigrationError(null);
    try {
      const success = await performMigration();
      if (success) {
        setMigrationSuccess(true);
        setTimeout(() => {
          setShowMigrationPrompt(false);
        }, 1500);
      } else {
        setMigrationError('Failed to complete migration. Please check your network and try again.');
      }
    } catch (e: any) {
      setMigrationError(e.message || 'An error occurred during data migration.');
    } finally {
      setIsMigrating(false);
    }
  };

  const handleSkip = () => {
    setShowMigrationPrompt(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#18181B] border border-teal-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
        <button
          onClick={handleSkip}
          disabled={isMigrating}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Existing Local Data Found</h3>
            <p className="text-xs text-slate-400">Academicos data discovered on this device</p>
          </div>
        </div>

        <div className="text-xs text-slate-300 leading-relaxed bg-[#09090B] p-3 rounded-xl border border-[#27272A]">
          Existing Academicos data was found on this device. Would you like to safely import your programs, tasks, syllabus topics, and test records to your Firebase account?
        </div>

        {migrationError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{migrationError}</span>
          </div>
        )}

        {migrationSuccess && (
          <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl flex items-center gap-2 text-teal-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Data successfully migrated to your account!</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleSkip}
            disabled={isMigrating}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Not Now
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={isMigrating || migrationSuccess}
            className="px-5 py-2 rounded-xl text-xs font-bold text-black bg-teal-500 hover:bg-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.3)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isMigrating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Migrating...</span>
              </>
            ) : (
              <>
                <span>Import My Data</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
