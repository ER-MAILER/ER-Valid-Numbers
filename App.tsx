import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  UploadCloud, 
  Trash2, 
  Download, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  PhoneCall,
  Activity,
  History,
  Terminal,
  ExternalLink,
  ChevronRight,
  Database,
  Cpu,
  Zap,
  Layers,
  FileText
} from 'lucide-react';
import { PhoneNumberRecord, ValidationStatus, ValidationSummary } from './types.ts';
import { processBatch } from './services/geminiService.ts';

const ER_TOOLS = [
  { name: 'ER Data Checker', url: 'https://er-data-checker.netlify.app/' },
  { name: 'ER Mailer Download', url: 'https://er-mailer.github.io/ER-Mailer---Download-Center/' },
  { name: 'ER Ghost Scraper', url: 'https://er-mailer.github.io/ER-Ghost-Scraper/' },
  { name: 'ER MS365', url: 'https://er-mailer.github.io/ER-MS365/' },
];

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<PhoneNumberRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentBatchInfo, setCurrentBatchInfo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [results]);

  const summary: ValidationSummary = {
    total: results.length,
    valid: results.filter(r => r.status === ValidationStatus.VALID).length,
    invalid: results.filter(r => r.status === ValidationStatus.INVALID).length,
  };

  const handleProcess = async () => {
    const rawNumbers = inputText
      .split(/[\n, \t]+/)
      .map(n => n.trim())
      .filter(n => n.length > 3);

    if (rawNumbers.length === 0) {
      alert('Command Buffer Empty: Please inject data into the console.');
      return;
    }

    setIsProcessing(true);
    setResults([]);
    setError(null);
    setProgress(0);

    const BATCH_SIZE = 50; 
    const totalBatches = Math.ceil(rawNumbers.length / BATCH_SIZE);

    try {
      for (let i = 0; i < totalBatches; i++) {
        const start = i * BATCH_SIZE;
        const end = Math.min(start + BATCH_SIZE, rawNumbers.length);
        const chunk = rawNumbers.slice(start, end);
        
        setCurrentBatchInfo(`AUDITING BLOCK: ${i + 1}/${totalBatches}`);
        
        const batchResults = await processBatch(chunk);
        setResults(prev => [...prev, ...batchResults]);
        
        const currentProgress = Math.round(((i + 1) / totalBatches) * 100);
        setProgress(currentProgress);
      }
    } catch (err) {
      console.error(err);
      setError('SIGNAL DISRUPTION: System could not reach the intelligence core. Check connectivity.');
    } finally {
      setIsProcessing(false);
      setCurrentBatchInfo('AUDIT SEQUENCE COMPLETE');
    }
  };

  const handleClear = () => {
    if (window.confirm('WARNING: Purge all session buffers and history?')) {
      setInputText('');
      setResults([]);
      setProgress(0);
      setError(null);
    }
  };

  const handleSaveValidCsv = () => {
    const validRecords = results.filter(r => r.status === ValidationStatus.VALID);
    if (validRecords.length === 0) {
      alert('Error: No verified records found for extraction.');
      return;
    }

    const headers = [
      'Record_ID', 
      'Formatted_E164', 
      'Original_Raw', 
      'Region_Detected', 
      'Validation_Status', 
      'Intelligence_Notes',
      'Audit_Timestamp'
    ];

    const timestamp = new Date().toISOString();
    
    const csvContent = [
      headers.join(','),
      ...validRecords.map(r => [
        `"${r.id}"`,
        `"${r.formatted}"`,
        `"${r.original.replace(/"/g, '""')}"`,
        `"${r.country}"`,
        `"${r.status}"`,
        `"${(r.notes || 'Pattern Verified').replace(/"/g, '""')}"`,
        `"${timestamp}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ER_Verified_Audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-400 font-sans selection:bg-blue-600/30">
      
      {/* Header HUD */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5 px-8 py-5">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 blur-xl opacity-20 group-hover:opacity-60 transition-opacity animate-pulse"></div>
              <div className="relative bg-slate-800 border border-white/10 p-3 rounded-2xl shadow-2xl">
                <ShieldCheck className="text-blue-500 w-8 h-8" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none flex items-center gap-3">
                ER <span className="text-blue-500">INTELLIGENCE</span>
                <span className="text-[10px] bg-blue-600/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full not-italic tracking-[0.2em] font-bold">V3.0 PRO</span>
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"></div>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Audit Grid: Online</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-3 px-6 py-3 bg-white/[0.02] rounded-2xl border border-white/5 shadow-inner">
               <Zap className="w-4 h-4 text-yellow-500" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Turbo Core</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-white/[0.02] rounded-2xl border border-white/5 shadow-inner">
               <Cpu className="w-4 h-4 text-blue-500" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Gemini Neural Link</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Command Center */}
      <main className="flex-grow max-w-screen-2xl mx-auto w-full p-6 lg:p-12 flex flex-col xl:flex-row gap-10">
        
        {/* Input Terminal */}
        <section className="xl:w-[480px] flex flex-col gap-8 shrink-0">
          <div className="bg-slate-900/50 backdrop-blur-2xl rounded-[40px] border border-white/10 p-10 shadow-2xl relative overflow-hidden transition-all hover:border-white/20 ring-1 ring-white/5">
            <div className="absolute -top-10 -right-10 opacity-[0.03]">
               <Terminal className="w-64 h-64 text-white" />
            </div>

            <div className="flex items-center justify-between mb-8 relative">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600/10 p-3 rounded-2xl border border-blue-600/20 shadow-inner">
                  <Database className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight uppercase leading-none">Command Hub</h2>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-2">Inject Signal Streams</p>
                </div>
              </div>
              <button 
                onClick={handleClear}
                className="text-slate-600 hover:text-red-500 transition-all p-2 bg-white/5 rounded-xl border border-white/5"
                title="Purge Buffers"
              >
                <Trash2 className="w-6 h-6" />
              </button>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste raw data strings (CSV, Lists, Mixed text)..."
              className="w-full h-[450px] bg-[#020617]/60 border border-white/10 rounded-[32px] p-8 text-sm mono text-slate-300 placeholder:text-slate-800 focus:border-blue-600/50 focus:ring-[12px] focus:ring-blue-600/5 transition-all outline-none leading-relaxed shadow-inner"
            />

            {isProcessing && (
              <div className="mt-8 p-6 bg-blue-600/5 rounded-[28px] border border-blue-500/10 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-4 text-[10px] font-black uppercase tracking-[0.3em]">
                  <span className="text-slate-500 flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    {currentBatchInfo}
                  </span>
                  <span className="text-blue-500">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-700 ease-out shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <button
              disabled={isProcessing || !inputText.trim()}
              onClick={handleProcess}
              className={`w-full mt-8 py-6 rounded-[24px] flex items-center justify-center gap-4 font-black text-[11px] uppercase tracking-[0.5em] transition-all relative overflow-hidden group border ${
                isProcessing || !inputText.trim()
                ? 'bg-white/5 text-slate-800 border-white/5'
                : 'bg-blue-600 text-white border-blue-400 hover:bg-blue-700 shadow-2xl hover:-translate-y-1 active:scale-95'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
              {isProcessing ? <Activity className="w-6 h-6 animate-pulse" /> : <Zap className="w-6 h-6" />}
              {isProcessing ? 'PROCESSING...' : 'ENGAGE AUDIT'}
            </button>
          </div>

          {/* Quick HUD Stats */}
          <div className="grid grid-cols-3 gap-5">
            {[
              { label: 'Total', value: summary.total, color: 'text-white' },
              { label: 'Valid', value: summary.valid, color: 'text-green-500' },
              { label: 'Null', value: summary.invalid, color: 'text-red-500' }
            ].map((stat) => (
              <div key={stat.label} className="bg-slate-900/50 p-6 rounded-[28px] border border-white/10 shadow-xl ring-1 ring-white/5 text-center">
                <span className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">{stat.label}</span>
                <span className={`text-2xl font-black ${stat.color} tracking-tighter`}>{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Registry Node */}
          <div className="bg-slate-900/50 rounded-[40px] p-8 border border-white/10 shadow-xl">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] mb-8 flex items-center gap-4">
              <Layers className="w-4 h-4" />
              Intelligence Grid
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {ER_TOOLS.map(tool => (
                <a 
                  key={tool.name} 
                  href={tool.url} 
                  target="_blank" 
                  className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-blue-500/30 hover:bg-blue-600/5 transition-all group shadow-sm"
                >
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 group-hover:text-slate-400 transition-colors">{tool.name}</span>
                  <ExternalLink className="w-4 h-4 text-slate-800 group-hover:text-blue-500 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Audit Stream Panel */}
        <section className="flex-grow flex flex-col bg-slate-900/50 rounded-[50px] border border-white/10 shadow-2xl overflow-hidden h-[950px] ring-1 ring-white/5 relative">
          <div className="p-10 border-b border-white/10 flex items-center justify-between bg-black/20 shrink-0 backdrop-blur-3xl z-10">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-blue-600/10 rounded-[22px] border border-blue-600/20 shadow-inner">
                <History className="w-7 h-7 text-blue-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-none italic">Audit Feed</h2>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.4em] mt-3">Live Signal Analysis Pipeline</p>
              </div>
            </div>
            
            {results.length > 0 && (
              <button 
                onClick={handleSaveValidCsv}
                className="bg-white text-slate-900 px-10 py-5 rounded-[22px] text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4 hover:bg-slate-200 transition-all shadow-2xl active:scale-95 hover:-translate-y-1"
              >
                <Download className="w-5 h-5" />
                Extract Verified Logs
              </button>
            )}
          </div>

          <div 
            ref={scrollRef}
            className="flex-grow overflow-auto bg-black/10 custom-scrollbar p-6"
          >
            {results.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-20 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent blur-[150px] pointer-events-none"></div>
                <div className="bg-white/[0.02] p-16 rounded-full mb-12 border border-white/10 shadow-inner">
                   <PhoneCall className="w-24 h-24 text-slate-800 opacity-20" />
                </div>
                <h3 className="text-3xl font-black uppercase tracking-[0.5em] text-slate-800">Standby Mode</h3>
                <p className="max-w-md mt-6 text-xs font-bold leading-relaxed text-slate-700 uppercase tracking-widest">Connect signal data via Command Hub to initiate audit sequence.</p>
              </div>
            ) : (
              <div className="min-w-full inline-block align-middle px-4">
                <table className="min-w-full text-left border-separate border-spacing-y-4">
                  <thead className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-3xl">
                    <tr>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Signal Origin</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Region Node</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] text-center">Security Status</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Intelligence Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((item) => (
                      <tr key={item.id} className="bg-white/[0.02] border border-white/5 rounded-[28px] group hover:bg-blue-600/5 transition-all animate-in slide-in-from-bottom-4 duration-500">
                        <td className="px-10 py-7 first:rounded-l-[28px] border-y border-l border-white/5">
                          <div className="text-[14px] font-black text-white tracking-wide mono">{item.formatted}</div>
                          <div className="text-[9px] text-slate-700 font-mono mt-2 uppercase opacity-60">AUDIT_LOG: {item.id.split('-')[1]}</div>
                        </td>
                        <td className="px-10 py-7 border-y border-white/5">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/[0.03] px-4 py-2 rounded-xl border border-white/10 group-hover:text-slate-300 transition-colors">
                            {item.country || 'N/A'}
                          </span>
                        </td>
                        <td className="px-10 py-7 border-y border-white/5 text-center">
                          {item.status === ValidationStatus.VALID ? (
                            <span className="inline-flex items-center gap-3 px-6 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] bg-green-500/10 text-green-500 border border-green-500/20 shadow-[0_0_25px_rgba(34,197,94,0.1)]">
                              <CheckCircle className="w-4 h-4" />
                              VERIFIED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-3 px-6 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] bg-red-600/10 text-red-500 border border-red-600/30">
                              <XCircle className="w-4 h-4" />
                              REJECTED
                            </span>
                          )}
                        </td>
                        <td className="px-10 py-7 last:rounded-r-[28px] border-y border-r border-white/5 max-w-[320px]">
                          <p className="text-[11px] font-bold text-slate-600 italic leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all group-hover:text-slate-400">
                            {item.notes || 'Signal integrity confirmed.'}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {error && (
            <div className="m-10 p-8 bg-red-600/10 border border-red-600/30 rounded-[30px] text-red-500 text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-6 animate-bounce shadow-3xl">
              <div className="bg-red-600 p-3 rounded-2xl shadow-xl">
                 <XCircle className="w-6 h-6 text-white" />
              </div>
              {error}
            </div>
          )}
        </section>
      </main>

      {/* Cyber Footer */}
      <footer className="py-24 px-12 border-t border-white/5 bg-[#020617] mt-20 relative overflow-hidden">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
          <div className="flex flex-col gap-6 max-w-xl">
            <div className="flex items-center gap-5">
              <ShieldCheck className="text-blue-500 w-8 h-8" />
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">ER <span className="text-blue-500">GROUP</span></h2>
            </div>
            <p className="text-xs font-bold text-slate-700 leading-relaxed uppercase tracking-[0.3em]">
              Proprietary AI telecommunications auditing architecture. Managed by ER Intelligence. 
              Efficiency. Reliability. Precision.
            </p>
          </div>
          
          <div className="text-right flex flex-col gap-6">
            <div className="flex items-center justify-end gap-5 group">
              <span className="text-[10px] font-bold text-slate-700 group-hover:text-slate-500 transition-colors uppercase tracking-[0.3em]">Mainframe: SECURED</span>
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_15px_#22c55e]"></div>
            </div>
            <div className="flex items-center justify-end gap-5 group">
              <span className="text-[10px] font-bold text-slate-700 group-hover:text-slate-500 transition-colors uppercase tracking-[0.3em]">Audit Node: ACTIVE</span>
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_15px_#22c55e]"></div>
            </div>
            <p className="text-[10px] font-black text-slate-900 mt-10 uppercase tracking-[1em] select-none">
              © 2024-2025 ER GROUP
            </p>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer { animation: shimmer 2s infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37,99,235,0.3); }
        .animate-in { animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(40px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />
    </div>
  );
};

export default App;