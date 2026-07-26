import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Inbox, Sparkles, Plus, CheckCircle2, Trash2, ArrowRight, Loader2 } from 'lucide-react';

export const InboxView: React.FC = () => {
  const { inbox: inboxItems, addInboxItem, removeInboxItem: deleteInboxItem, addTask, programs, setCurrentView } = useApp();

  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const handleCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    addInboxItem(rawText.trim());
    setRawText('');
  };

  const parseAndConvertToTask = async (inboxId: string, text: string) => {
    setIsParsing(true);
    try {
      const response = await fetch('/api/parse-inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: text }),
      });

      const json = await response.json();

      if (json.success && json.data) {
        const d = json.data;
        const catProg = programs.find((p) => p.id === 'prog-cat-2026') || programs[0];

        addTask({
          title: d.title || text,
          programId: catProg.id,
          type: d.type || 'study',
          dueDate: d.dueDate || new Date().toISOString().split('T')[0],
          priority: d.priority || 'medium',
          status: 'pending',
        });

        deleteInboxItem(inboxId);
        alert('Converted to Task successfully!');
      } else {
        // Fallback simple task creation
        const catProg = programs.find((p) => p.id === 'prog-cat-2026') || programs[0];
        addTask({
          title: text,
          programId: catProg.id,
          type: 'study',
          dueDate: new Date().toISOString().split('T')[0],
          priority: 'medium',
          status: 'pending',
        });
        deleteInboxItem(inboxId);
      }
    } catch (e) {
      // Fallback simple task creation
      const catProg = programs.find((p) => p.id === 'prog-cat-2026') || programs[0];
      addTask({
        title: text,
        programId: catProg.id,
        type: 'study',
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'medium',
        status: 'pending',
      });
      deleteInboxItem(inboxId);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-zinc-100">Quick Capture Inbox</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Dump raw thoughts, reminders, or exam updates fast. Process into structured tasks with Gemini AI.
          </p>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleCapture} className="bg-zinc-900/80 border border-zinc-800/80 p-4 rounded-2xl space-y-3 shadow-xs">
        <label className="block text-xs font-bold text-zinc-300">Fast Thought Dump</label>
        <div className="flex gap-2">
          <input
            type="text"
            required
            placeholder="e.g. Solve 3 DILR sets on Friday or Submit MANIT CN Lab assignment by 14th Nov"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Capture</span>
          </button>
        </div>
      </form>

      {/* Inbox List */}
      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 space-y-3 shadow-xs">
        <h3 className="font-bold text-zinc-100 text-xs">Unprocessed Inbox Items ({inboxItems.length})</h3>

        <div className="space-y-2">
          {inboxItems.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between gap-3 text-xs"
            >
              <div>
                <p className="font-medium text-zinc-200">{item.text}</p>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Captured: {item.createdAt}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => parseAndConvertToTask(item.id, item.text)}
                  disabled={isParsing}
                  className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-zinc-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all shadow-md"
                >
                  {isParsing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>AI Convert Task</span>
                </button>

                <button
                  onClick={() => deleteInboxItem(item.id)}
                  className="text-zinc-600 hover:text-rose-400 p-1.5 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {inboxItems.length === 0 && (
            <div className="py-8 text-center text-zinc-500 text-xs">
              Inbox is clean! Dump quick thoughts above anytime.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
