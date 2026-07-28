import React, { useState } from 'react';
import { useApp } from './../context/AppContext';
import { ContextualHelp } from '../components/ContextualHelp';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  Calendar,
  Award,
  BookOpen,
  Clock,
  History,
  Info,
  Check,
  RefreshCw,
} from 'lucide-react';
import { ImportHistoryRecord, CATMock, CATSectional } from '../types';

export const SmartImportView: React.FC = () => {
  const {
    programs,
    catMocks,
    catSectionals,
    addCATMock,
    addCATSectional,
    updateScheduledMockWithResult,
    matchScheduledMock,
    bulkAddTopics,
    addTask,
    addImportHistoryRecord,
    updateImportHistoryRecord,
    importHistory,
    setCurrentView,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'import' | 'history'>('import');
  const [mode, setMode] = useState<'upload' | 'text'>('upload');
  const [documentTypeHint, setDocumentTypeHint] = useState<
    'auto' | 'Test Result' | 'Syllabus' | 'Timetable' | 'Academic Calendar' | 'Exam Schedule' | 'Other'
  >('auto');

  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [rawText, setRawText] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Extraction State
  const [extractedResult, setExtractedResult] = useState<{
    detectedType: 'Test Result' | 'Syllabus' | 'Timetable' | 'Academic Calendar' | 'Exam Schedule' | 'Other';
    confidence: number;
    warnings: string[];
    parsedData: any;
    importHistoryId?: string;
  } | null>(null);

  // Existing Match State
  const [matchedTest, setMatchedTest] = useState<{
    type: 'mock' | 'sectional';
    item: any;
    hasExistingResult: boolean;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);

      const previews: string[] = [];
      selectedFiles.forEach((f) => {
        if (f.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              previews.push(event.target.result as string);
              if (previews.length === selectedFiles.length) {
                setFilePreviews([...previews]);
              }
            }
          };
          reader.readAsDataURL(f);
        }
      });
      if (!selectedFiles.some((f) => f.type.startsWith('image/'))) {
        setFilePreviews([]);
      }
    }
  };

  const processSmartImport = async () => {
    if (mode === 'upload' && files.length === 0) return;
    if (mode === 'text' && !rawText.trim()) return;

    setIsLoading(true);
    setErrorMsg('');
    setExtractedResult(null);
    setMatchedTest(null);

    try {
      let base64Data: string | undefined = undefined;
      let mimeType: string | undefined = undefined;
      const primaryFile = files[0];

      if (mode === 'upload' && primaryFile) {
        base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const res = reader.result as string;
            resolve(res.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(primaryFile);
        });
        mimeType = primaryFile.type || 'image/jpeg';
      }

      const response = await fetch('/api/smart-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType: documentTypeHint === 'auto' ? undefined : documentTypeHint,
          rawText: mode === 'text' ? rawText : undefined,
          fileBase64: base64Data,
          mimeType,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to extract document with Gemini AI');
      }

      const data = json.data;
      const detectedType = data.detectedType || 'Other';
      const parsedData = data.parsedData || {};

      // Record Provenance in import history
      const fileName = mode === 'upload' ? files.map((f) => f.name).join(', ') : 'Pasted Text Dump';
      const histId = addImportHistoryRecord({
        fileName,
        detectedType,
        status: 'pending',
      });

      setExtractedResult({
        detectedType,
        confidence: data.confidence || 0.95,
        warnings: data.warnings || [],
        parsedData,
        importHistoryId: histId,
      });

      // Existing Test Matching Check for Test Results
      if (detectedType === 'Test Result' || parsedData.testName || parsedData.mockName) {
        const testName = parsedData.testName || parsedData.mockName || '';
        const provider = parsedData.provider || '';
        const date = parsedData.date || '';

        const match = matchScheduledMock(testName, provider, date);
        if (match) {
          const existingScore = match.type === 'mock' 
            ? (match.item as any).overallScore 
            : (match.item as any).score;
          setMatchedTest({
            type: match.type,
            item: match.item,
            hasExistingResult: existingScore !== null && existingScore !== undefined,
          });
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred during Smart Import processing.');
    } finally {
      setIsLoading(false);
    }
  };

  // Confirmation Handlers
  const handleConfirmUpdateExisting = () => {
    if (!extractedResult || !matchedTest) return;
    const pd = extractedResult.parsedData;

    const resultUpdate: Partial<CATMock> & Partial<CATSectional> = {
      overallScore: pd.overallScore ?? pd.score ?? null,
      overallPercentile: pd.overallPercentile ?? pd.percentile ?? null,
      score: pd.overallScore ?? pd.score ?? null,
      percentile: pd.overallPercentile ?? pd.percentile ?? null,
      totalAttempted: pd.totalAttempted ?? null,
      correct: pd.correct ?? null,
      incorrect: pd.incorrect ?? null,
      unattempted: pd.unattempted ?? null,
      accuracy: pd.accuracy ?? null,
      varc: pd.varc ? { ...pd.varc } : (matchedTest.item as any).varc,
      dilr: pd.dilr ? { ...pd.dilr } : (matchedTest.item as any).dilr,
      qa: pd.qa ? { ...pd.qa } : (matchedTest.item as any).qa,
      status: 'completed' as any,
      analysisStatus: 'not_analysed' as any,
    };

    updateScheduledMockWithResult(matchedTest.item.id, matchedTest.type, resultUpdate);

    if (extractedResult.importHistoryId) {
      updateImportHistoryRecord(extractedResult.importHistoryId, {
        status: 'confirmed',
        linkedEntityType: matchedTest.type === 'mock' ? 'CATMock' : 'CATSectional',
        linkedEntityId: matchedTest.item.id,
        confirmedTime: new Date().toISOString(),
      });
    }

    alert(`Successfully updated existing test "${matchedTest.item.name}" with imported result!`);
    resetForm();
    setCurrentView(matchedTest.type === 'mock' ? 'cat_mocks' : 'cat_sectionals');
  };

  const handleConfirmCreateNew = () => {
    if (!extractedResult) return;
    const pd = extractedResult.parsedData;
    const dt = extractedResult.detectedType;

    let createdId = '';
    let createdType: 'CATMock' | 'CATSectional' | 'Syllabus' | 'Task' = 'CATMock';

    if (dt === 'Test Result') {
      if (pd.isCatMock || pd.varc || pd.dilr || pd.qa || !pd.sectionalType) {
        // Full Mock
        const newMockId = `mock-imp-${Date.now()}`;
        addCATMock({
          id: newMockId,
          name: pd.testName || pd.mockName || 'Imported Test Result',
          provider: pd.provider || 'IMS',
          date: pd.date || new Date().toISOString().split('T')[0],
          durationMinutes: pd.durationMinutes || 120,
          status: 'completed',
          overallScore: pd.overallScore ?? pd.score ?? null,
          overallPercentile: pd.overallPercentile ?? pd.percentile ?? null,
          totalAttempted: pd.totalAttempted ?? null,
          correct: pd.correct ?? null,
          incorrect: pd.incorrect ?? null,
          unattempted: pd.unattempted ?? null,
          accuracy: pd.accuracy ?? null,
          varc: pd.varc || { score: null, percentile: null, attempted: null, correct: null, incorrect: null, unattempted: null, accuracy: null, timeSpentMinutes: null },
          dilr: pd.dilr || { score: null, percentile: null, attempted: null, correct: null, incorrect: null, unattempted: null, accuracy: null, timeSpentMinutes: null },
          qa: pd.qa || { score: null, percentile: null, attempted: null, correct: null, incorrect: null, unattempted: null, accuracy: null, timeSpentMinutes: null },
          analysisStatus: 'not_analysed',
        } as any);
        createdId = newMockId;
        createdType = 'CATMock';
        alert('Imported as new Full Test Result!');
        setCurrentView('cat_mocks');
      } else {
        // Sectional Test
        const newSecId = `sec-imp-${Date.now()}`;
        addCATSectional({
          id: newSecId,
          name: pd.testName || pd.mockName || 'Imported Sectional',
          provider: pd.provider || 'General',
          date: pd.date || new Date().toISOString().split('T')[0],
          section: (pd.sectionalType as any) || 'QA',
          status: 'completed',
          score: pd.overallScore ?? pd.score ?? null,
          percentile: pd.overallPercentile ?? pd.percentile ?? null,
          attempted: pd.totalAttempted ?? null,
          correct: pd.correct ?? null,
          incorrect: pd.incorrect ?? null,
          unattempted: pd.unattempted ?? null,
          accuracy: pd.accuracy ?? null,
          durationMinutes: pd.durationMinutes || 40,
          analysisStatus: 'not_analysed',
        } as any);
        createdId = newSecId;
        createdType = 'CATSectional';
        alert('Imported as new Sectional Test Result!');
        setCurrentView('cat_sectionals');
      }
    } else if (dt === 'Syllabus' && Array.isArray(pd.topics)) {
      const targetProgId = (programs.find((p) => p.id === 'prog-cat-2026') || programs[0])?.id || 'prog-cat-2026';
      const newTopics = pd.topics.map((tName: string, idx: number) => ({
        programId: targetProgId,
        subjectId: 'subj-cat-qa',
        name: tName,
        status: 'not_started' as any,
        priority: 'medium' as any,
        confidence: 3 as any,
        totalStudyTimeMinutes: 0,
        order: idx + 1,
      }));
      bulkAddTopics(newTopics);
      createdType = 'Syllabus';
      alert(`Imported ${newTopics.length} syllabus topics!`);
      setCurrentView('cat_syllabus');
    } else if ((dt === 'Timetable' || dt === 'Academic Calendar' || dt === 'Exam Schedule') && Array.isArray(pd.events)) {
      const targetProgId = (programs.find((p) => p.id === 'prog-cat-2026') || programs[0])?.id || 'prog-cat-2026';
      pd.events.forEach((evt: any) => {
        addTask({
          title: evt.title || 'Scheduled Event',
          programId: targetProgId,
          type: evt.type === 'exam' ? 'exam' : 'deadline',
          dueDate: evt.date || new Date().toISOString().split('T')[0],
          dueTime: evt.startTime || undefined,
          priority: 'high',
          status: 'pending',
          notes: evt.description || undefined,
        });
      });
      createdType = 'Task';
      alert(`Imported ${pd.events.length} schedule events as tasks!`);
      setCurrentView('tasks');
    } else {
      alert('Imported data saved successfully!');
    }

    if (extractedResult.importHistoryId) {
      updateImportHistoryRecord(extractedResult.importHistoryId, {
        status: 'confirmed',
        linkedEntityType: createdType,
        linkedEntityId: createdId || undefined,
        confirmedTime: new Date().toISOString(),
      });
    }

    resetForm();
  };

  const handleCancelImport = () => {
    if (extractedResult?.importHistoryId) {
      updateImportHistoryRecord(extractedResult.importHistoryId, {
        status: 'cancelled',
      });
    }
    resetForm();
  };

  const resetForm = () => {
    setExtractedResult(null);
    setMatchedTest(null);
    setFiles([]);
    setFilePreviews([]);
    setRawText('');
    setErrorMsg('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-zinc-100">Global Smart Import</h2>
            <ContextualHelp topic="smart_import" />
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            AI Document Understanding (Gemini 3.6 Flash) for Test Results, Scorecards, Syllabi, Timetables & Schedules.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('import')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'import'
                ? 'bg-cyan-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Import</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-cyan-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Import Provenance Log ({importHistory.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SMART IMPORT WORKFLOW */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          {/* Step 1 & 2 Config */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl space-y-3">
              <label className="block text-xs font-bold text-zinc-300">
                1. Expected Document Type (Optional Hint)
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'auto', label: 'Auto-Detect Type' },
                  { id: 'Test Result', label: 'Test Result / Scorecard' },
                  { id: 'Syllabus', label: 'Syllabus' },
                  { id: 'Timetable', label: 'Timetable / Schedule' },
                  { id: 'Academic Calendar', label: 'Academic Calendar' },
                  { id: 'Exam Schedule', label: 'Exam Schedule' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setDocumentTypeHint(t.id as any)}
                    className={`p-2 rounded-xl font-medium border text-left transition-all ${
                      documentTypeHint === t.id
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 font-bold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl space-y-3">
              <label className="block text-xs font-bold text-zinc-300">2. Input Method</label>
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => setMode('upload')}
                  className={`flex-1 py-2.5 px-3 rounded-xl border font-semibold flex items-center justify-center gap-2 transition-all ${
                    mode === 'upload'
                      ? 'bg-zinc-800 border-cyan-500 text-cyan-400'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Upload Image / PDF</span>
                </button>

                <button
                  onClick={() => setMode('text')}
                  className={`flex-1 py-2.5 px-3 rounded-xl border font-semibold flex items-center justify-center gap-2 transition-all ${
                    mode === 'text'
                      ? 'bg-zinc-800 border-cyan-500 text-cyan-400'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Paste Text / Raw Dump</span>
                </button>
              </div>
            </div>
          </div>

          {/* Input Upload Dropzone */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-5 space-y-4 shadow-xs">
            {mode === 'upload' ? (
              <div className="border-2 border-dashed border-zinc-800 hover:border-cyan-500/50 rounded-2xl p-6 text-center space-y-3 transition-colors bg-zinc-950/40">
                {filePreviews.length > 0 ? (
                  <div className="flex items-center justify-center gap-3 flex-wrap max-h-48 overflow-y-auto p-2">
                    {filePreviews.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`Preview ${i}`}
                        className="max-h-36 rounded-xl border border-zinc-800 object-cover"
                      />
                    ))}
                  </div>
                ) : files.length > 0 ? (
                  <div className="space-y-1">
                    <FileText className="w-8 h-8 text-cyan-400 mx-auto" />
                    <p className="text-xs text-zinc-200 font-bold">
                      {files.map((f) => f.name).join(', ')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <UploadCloud className="w-10 h-10 text-cyan-400 mx-auto" />
                    <p className="text-xs font-bold text-zinc-200">
                      Upload PDF scorecard, image screenshot, or schedule
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      Supports PNG, JPG, JPEG, PDF, WEBP (Multiple files supported)
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-cyan-400 hover:file:bg-zinc-700 cursor-pointer max-w-sm mx-auto"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Paste Raw Scorecard Dump, Syllabus, or Schedule
                </label>
                <textarea
                  rows={6}
                  placeholder="Paste scorecard dump or syllabus list here..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={processSmartImport}
                disabled={isLoading || (mode === 'upload' && files.length === 0) || (mode === 'text' && !rawText.trim())}
                className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-zinc-950 font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing & Extracting with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Start AI Smart Import</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* STEP 3 & 4: REVIEW & MATCHING STAGE */}
          {extractedResult && (
            <div className="space-y-4 bg-zinc-900 border border-cyan-500/40 rounded-2xl p-5 shadow-2xl">
              {/* Header Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-bold text-zinc-100 text-sm">Extracted Data Review & Match Check</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                    Detected Type: {extractedResult.detectedType}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-zinc-950 text-zinc-400 border border-zinc-800">
                    Confidence: {(extractedResult.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Warnings Banner */}
              {extractedResult.warnings.length > 0 && (
                <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-300 space-y-1">
                  <span className="font-bold block flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Warnings / Missing Data Hints:
                  </span>
                  <ul className="list-disc list-inside text-[11px] text-amber-200/80 space-y-0.5">
                    {extractedResult.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* EXISTING TEST MATCH / DUPLICATE CHECK CARD */}
              {matchedTest && (
                <div
                  className={`p-4 rounded-xl border space-y-2 text-xs ${
                    matchedTest.hasExistingResult
                      ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                      : 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>
                      {matchedTest.hasExistingResult
                        ? 'Result Already Exists for Scheduled Test!'
                        : 'Possible Scheduled Test Found'}
                    </span>
                  </div>

                  <p className="text-xs">
                    Matched: <strong>{matchedTest.item.name}</strong> ({matchedTest.item.provider}) on{' '}
                    {matchedTest.item.date}
                    {matchedTest.hasExistingResult && (
                      <span className="block text-[11px] mt-0.5 text-rose-300">
                        Current recorded score:{' '}
                        {matchedTest.type === 'mock'
                          ? (matchedTest.item as any).overallScore
                          : (matchedTest.item as any).score}{' '}
                        Marks
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Extracted Fields Breakdown Card */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3 text-xs">
                <span className="font-bold text-zinc-400 text-[11px] uppercase tracking-wider block">
                  Extracted Structured Fields (Unknowns preserved as null):
                </span>

                {extractedResult.detectedType === 'Test Result' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                        <span className="text-[10px] text-zinc-500 block">Test Name</span>
                        <span className="font-bold text-zinc-100">
                          {extractedResult.parsedData.testName || extractedResult.parsedData.mockName || 'null'}
                        </span>
                      </div>
                      <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                        <span className="text-[10px] text-zinc-500 block">Provider</span>
                        <span className="font-bold text-zinc-100">
                          {extractedResult.parsedData.provider || 'null'}
                        </span>
                      </div>
                      <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                        <span className="text-[10px] text-zinc-500 block">Date</span>
                        <span className="font-bold text-zinc-100">
                          {extractedResult.parsedData.date || 'null'}
                        </span>
                      </div>
                      <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                        <span className="text-[10px] text-zinc-500 block">Overall Score</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {extractedResult.parsedData.overallScore ?? extractedResult.parsedData.score ?? 'null'} pts
                        </span>
                      </div>
                    </div>

                    {/* Sectional details if available */}
                    {(extractedResult.parsedData.varc ||
                      extractedResult.parsedData.dilr ||
                      extractedResult.parsedData.qa) && (
                      <div className="grid grid-cols-3 gap-2">
                        {['varc', 'dilr', 'qa'].map((secKey) => {
                          const secData = extractedResult.parsedData[secKey];
                          return (
                            <div key={secKey} className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                              <span className="font-bold text-cyan-400 uppercase text-[10px] block">
                                {secKey.toUpperCase()}
                              </span>
                              <p className="font-mono text-xs font-bold text-zinc-100 mt-0.5">
                                Score: {secData?.score ?? 'null'} pts
                              </p>
                              <p className="text-[10px] text-zinc-400">
                                Percentile: {secData?.percentile ?? 'null'}%
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {extractedResult.detectedType !== 'Test Result' && (
                  <pre className="text-cyan-300 leading-relaxed font-mono whitespace-pre-wrap text-[11px]">
                    {JSON.stringify(extractedResult.parsedData, null, 2)}
                  </pre>
                )}
              </div>

              {/* ACTION BUTTONS BASED ON MATCHING & DUPLICATE STATUS */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  onClick={handleCancelImport}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel / Discard
                </button>

                {matchedTest ? (
                  <>
                    <button
                      onClick={handleConfirmCreateNew}
                      className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold cursor-pointer"
                    >
                      Create as New Test
                    </button>
                    <button
                      onClick={handleConfirmUpdateExisting}
                      className={`px-5 py-2 rounded-xl text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer ${
                        matchedTest.hasExistingResult
                          ? 'bg-amber-500 hover:bg-amber-400'
                          : 'bg-emerald-500 hover:bg-emerald-400'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {matchedTest.hasExistingResult ? 'Update Existing Result' : 'Update Existing Test'}
                      </span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleConfirmCreateNew}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Save to Academicos</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: IMPORT PROVENANCE HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {importHistory.map((rec) => (
            <div
              key={rec.id}
              className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-100 text-sm">{rec.fileName}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    {rec.detectedType}
                  </span>
                  <span
                    className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${
                      rec.status === 'confirmed'
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                        : rec.status === 'cancelled'
                        ? 'bg-rose-950/40 text-rose-300 border-rose-500/40'
                        : 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {rec.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-zinc-400 text-[11px]">
                  Created: {new Date(rec.createdTime).toLocaleString()}
                  {rec.confirmedTime && ` • Confirmed: ${new Date(rec.confirmedTime).toLocaleString()}`}
                  {rec.linkedEntityType && ` • Linked: ${rec.linkedEntityType}`}
                </p>
              </div>

              <div className="font-mono text-[10px] text-zinc-500 shrink-0">
                ID: {rec.id}
              </div>
            </div>
          ))}

          {importHistory.length === 0 && (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-12 text-center space-y-2">
              <History className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-semibold text-zinc-300">No Import Provenance Records Yet</p>
              <p className="text-xs text-zinc-500">
                Uploaded scorecards and documents will log provenance details here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
