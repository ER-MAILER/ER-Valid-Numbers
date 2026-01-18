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
  Info,
  ExternalLink,
  ChevronRight,
  Database,
  Cpu,
  Globe,
  Zap
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
      alert('Input signal stream is empty.');
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
        
        setCurrentBatchInfo(`Scanning Unit ${i + 1}/${totalBatches}`);
        
        const batchResults = await processBatch(chunk);
        setResults(prev => [...prev, ...batchResults]);
        
        const currentProgress = Math.round(((i + 1) / totalBatches) * 100);
        setProgress(currentProgress);
      }
    } catch (err) {
      console.error(err);
      setError('Signal disruption detected. Check connectivity.');
    } finally {
      setIsProcessing(false);
      setCurrentBatchInfo('Global Audit Finalized');
    }
  };

  const handleClear = () => {
    if (window.confirm('Purge all data streams?')) {
      setInputText('');
      setResults([]);
      setProgress(0);
      setError(null);
    }
  };

  const handleSaveValidCsv = () => {
    const validRecords = results.filter(r => r.status === ValidationStatus.VALID);
    if (validRecords.length === 0) {
      alert('No verified signals found to extract.');
      return;
    }

    // Comprehensive data export including all details
    const headers = [
      'Audit_ID', 
      'Formatted_Phone_E164', 
      'Original_Input', 
      'Country_Region', 
      'Security_Status', 
      'AI_Detailed_Diagnosis',
      'Extraction_Timestamp'
    ];

    const timestamp = new Date().toLocaleString();
    
    const csvContent = [
      headers.join(','),
      ...validRecords.map(r => [
        `"${r.id}"`,
        `"${r.formatted}"`,
        `"${r.original.replace(/"/g, '""')}"`,
        `"${r.country}"`,
        `"${r.status}"`,
        `"${(r.notes || 'Signal pattern verified successfully').replace(/"/g, '""')}"`,
        `"${timestamp}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ER_Detailed_Audit_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-400 font-sans selection:bg-blue-600/40 antialiased">
      {/* HUD Background - Deep Blue Theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[160px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.2] brightness-50 contrast-125"></div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-3xl border-b border-white/5 px-8 py-6 shadow-2xl">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 blur-xl opacity-20 group-hover:opacity-60 transition-opacity animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-slate-700 to-slate-900 p-3 rounded-2xl shadow-2xl border border-white/10">
                <ShieldCheck className="text-blue-500 w-8 h-8" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none flex items-center gap-3">
                ER <span className="text-red-600">VALIDATOR</span>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full not-italic tracking-[0.1em] font-bold">V3.0 PRO</span>
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_12px_#22c55e]"></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Signal Integrity: Active</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-3 px-6 py-3 bg-white/[0.03] rounded-2xl border border-white/5 shadow-inner">
               <Zap className="w-4 h-4 text-yellow-500" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Flash Scan</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-white/[0.03] rounded-2xl border border-white/5 shadow-inner">
               <Cpu className="w-4 h-4 text-blue-500" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Gemini Core</span>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Body */}
      <main className="flex-grow max-w-screen-2xl mx-auto w-full p-4 lg:p-12 flex flex-col xl:flex-row gap-12">
        
        {/* Left Control Panel */}
        <section className="xl:w-[500px] flex flex-col gap-8 shrink-0">
          <div className="bg-[#1e293b]/50 backdrop-blur-xl rounded-[40px] border border-white/10 p-10 shadow-2xl relative overflow-hidden transition-all hover:border-white/20 ring-1 ring-white/5">
            <div className="absolute -top-10 -right-10 opacity-[0.03]">
               <Database className="w-64 h-64 text-white" />
            </div>

            <div className="flex items-center justify-between mb-8 relative">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600/10 p-3 rounded-2xl border border-blue-600/20 shadow-inner">
                  <Database className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight uppercase leading-none">Command Hub</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Data Signal Injection</p>
                </div>
              </div>
              <button 
                onClick={handleClear}
                className="text-slate-500 hover:text-red-500 transition-all p-2 bg-white/5 rounded-xl border border-white/5 hover:border-red-500/30"
                title="Purge Memory"
              >
                <Trash2 className="w-6 h-6" />
              </button>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste raw data streams (CSV, Newlines, Mixed Text)..."
              className="w-full h-[480px] bg-[#020617]/60 border border-white/10 rounded-[32px] p-8 text-sm font-mono text-slate-300 placeholder:text-slate-700 focus:border-blue-600/50 focus:ring-[12px] focus:ring-blue-600/5 transition-all outline-none leading-relaxed shadow-inner"
            />

            {isProcessing && (
              <div className="mt-8 p-6 bg-blue-600/5 rounded-[28px] border border-blue-500/10 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-4 text-[11px] font-black uppercase tracking-[0.3em]">
                  <span className="text-slate-400 flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    {currentBatchInfo}
                  </span>
                  <span className="text-blue-500">{progress}%</span>
                </div>
                <div className="h-2.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-400 transition-all duration-700 ease-out shadow-[0_0_25px_rgba(37,99,235,0.4)]"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <button
              disabled={isProcessing || !inputText.trim()}
              onClick={handleProcess}
              className={`w-full mt-10 py-6 rounded-[24px] flex items-center justify-center gap-4 font-black text-[11px] uppercase tracking-[0.5em] transition-all relative overflow-hidden group border ${
                isProcessing || !inputText.trim()
                ? 'bg-white/5 text-slate-700 border-white/5'
                : 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700 shadow-[0_20px_40px_rgba(37,99,235,0.2)] hover:-translate-y-1 active:scale-95'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
              {isProcessing ? <Activity className="w-6 h-6 animate-pulse" /> : <Zap className="w-6 h-6" />}
              {isProcessing ? 'SCANNING...' : 'EXECUTE VERIFICATION'}
            </button>
          </div>

          {/* HUD Summary Cards */}
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Units', value: summary.total, color: 'text-white' },
              { label: 'Cleared', value: summary.valid, color: 'text-green-500' },
              { label: 'Null', value: summary.invalid, color: 'text-red-500' }
            ].map((stat) => (
              <div key={stat.label} className="bg-[#1e293b]/50 backdrop-blur-md p-7 rounded-[32px] border border-white/10 shadow-2xl">
                <span className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">{stat.label}</span>
                <span className={`text-3xl font-black ${stat.color} tracking-tighter`}>{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Sub-Apps Node */}
          <div className="bg-[#1e293b]/50 backdrop-blur-md rounded-[40px] p-10 border border-white/10 shadow-2xl">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.6em] mb-10 flex items-center gap-4">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping"></div>
              ER Global Suite
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {ER_TOOLS.map(tool => (
                <a 
                  key={tool.name} 
                  href={tool.url} 
                  target="_blank" 
                  className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-500/40 hover:bg-blue-600/10 transition-all group shadow-sm"
                >
                  <span className="text-[12px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">{tool.name}</span>
                  <ExternalLink className="w-5 h-5 text-slate-700 group-hover:text-blue-500 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Audit Log Panel */}
        <section className="flex-grow flex flex-col bg-[#0f172a]/50 backdrop-blur-xl rounded-[50px] border border-white/10 shadow-2xl overflow-hidden h-[950px] ring-1 ring-white/10 relative">
          <div className="p-12 border-b border-white/10 flex items-center justify-between bg-[#0f172a]/80 backdrop-blur-3xl shrink-0 z-10">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-blue-600/10 rounded-[22px] border border-blue-600/30 shadow-inner">
                <History className="w-7 h-7 text-blue-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-none italic">Audit Feed</h2>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em] mt-3">Live Signal Intelligence Analysis</p>
              </div>
            </div>
            
            {results.length > 0 && (
              <button 
                onClick={handleSaveValidCsv}
                className="bg-blue-600 text-white px-10 py-5 rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4 hover:bg-blue-500 transition-all shadow-[0_25px_50px_rgba(37,99,235,0.2)] active:scale-95 hover:-translate-y-1"
              >
                <Download className="w-5 h-5" />
                Download Full Log
              </button>
            )}
          </div>

          <div 
            ref={scrollRef}
            className="flex-grow overflow-auto bg-[#020617]/30 custom-scrollbar p-4"
          >
            {results.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-20 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-transparent blur-[150px] pointer-events-none"></div>
                <div className="bg-white/[0.03] p-16 rounded-full mb-12 border border-white/10 shadow-inner">
                   <PhoneCall className="w-28 h-28 text-slate-800" />
                </div>
                <h3 className="text-4xl font-black uppercase tracking-[0.4em] text-slate-800">Awaiting Signal</h3>
                <p className="max-w-md mt-8 text-sm font-bold leading-relaxed text-slate-700 uppercase tracking-widest">Connect data stream via the Command Hub to initiate audit protocols.</p>
              </div>
            ) : (
              <div className="min-w-full inline-block align-middle px-6">
                <table className="min-w-full text-left border-separate border-spacing-y-4">
                  <thead className="sticky top-0 z-10 bg-[#0f172a]/95 backdrop-blur-2xl">
                    <tr>
                      <th className="px-10 py-6 text-[11px] font-black text-slate-600 uppercase tracking-[0.3em]">Signal Origin</th>
                      <th className="px-10 py-6 text-[11px] font-black text-slate-600 uppercase tracking-[0.3em]">Region Node</th>
                      <th className="px-10 py-6 text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] text-center">Status</th>
                      <th className="px-10 py-6 text-[11px] font-black text-slate-600 uppercase tracking-[0.3em]">Audit Diagnosis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((item) => (
                      <tr key={item.id} className="bg-white/[0.04] border border-white/5 rounded-[32px] group hover:bg-blue-600/5 hover:border-blue-500/20 transition-all animate-in slide-in-from-bottom-4 duration-500">
                        <td className="px-10 py-8 first:rounded-l-[32px] border-y border-l border-white/5">
                          <div className="text-[15px] font-black text-white tracking-wide">{item.formatted}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-2 uppercase opacity-60">ID: {item.id.split('-')[1]}</div>
                        </td>
                        <td className="px-10 py-8 border-y border-white/5">
                          <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest bg-white/[0.05] px-4 py-2 rounded-xl border border-white/10 group-hover:border-blue-600/30 group-hover:text-slate-200 transition-all">
                            {item.country || 'DETECTING...'}
                          </span>
                        </td>
                        <td className="px-10 py-8 border-y border-white/5 text-center">
                          {item.status === ValidationStatus.VALID ? (
                            <span className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] bg-green-500/10 text-green-500 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                              <CheckCircle className="w-4 h-4" />
                              VERIFIED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] bg-red-600/10 text-red-500 border border-red-600/30">
                              <XCircle className="w-4 h-4" />
                              REJECTED
                            </span>
                          )}
                        </td>
                        <td className="px-10 py-8 last:rounded-r-[32px] border-y border-r border-white/5 max-w-[350px]">
                          <p className="text-[12px] font-bold text-slate-600 italic leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all group-hover:text-slate-400">
                            {item.notes || 'Signal pattern matches global standards.'}
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
            <div className="m-12 p-8 bg-red-600/10 border border-red-600/30 rounded-[35px] text-red-500 text-xs font-black uppercase tracking-[0.4em] flex items-center gap-6 animate-bounce shadow-3xl">
              <div className="bg-red-600 p-3 rounded-2xl shadow-xl">
                 <XCircle className="w-6 h-6 text-white" />
              </div>
              {error}
            </div>
          )}
        </section>
      </main>

      {/* Cyberpunk Footer */}
      <footer className="py-32 px-12 border-t border-white/10 bg-[#020617] mt-20 relative overflow-hidden">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20 relative z-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-5 mb-10">
              <div className="bg-blue-600 p-3 rounded-2xl shadow-2xl">
                <ShieldCheck className="text-white w-8 h-8" />
              </div>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">ER <span className="text-red-600">GROUP</span></h2>
            </div>
            <p className="text-sm font-bold text-slate-600 leading-relaxed uppercase tracking-[0.2em] max-w-xl">
              Proprietary AI signal auditing node. Secured by ER Intelligence. 
              Global standard verification for telecommunications patterns. 
              Efficiency. Reliability. Privacy.
            </p>
          </div>
          
          <div>
            <h4 className="text-[12px] font-black text-white uppercase tracking-[0.6em] mb-12 text-slate-500">Resource Nodes</h4>
            <div className="grid grid-cols-1 gap-6">
              {ER_TOOLS.map(tool => (
                <a key={tool.name} href={tool.url} className="text-[11px] font-bold text-slate-700 hover:text-blue-500 transition-all uppercase tracking-widest flex items-center gap-3 group">
                   <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-3 group-hover:translate-x-0" />
                   {tool.name}
                </a>
              ))}
            </div>
          </div>

          <div className="text-right">
            <h4 className="text-[12px] font-black text-slate-500 uppercase tracking-[0.6em] mb-12">System Integrity</h4>
            <div className="space-y-8">
              <div className="flex items-center justify-end gap-5 group">
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-slate-400 transition-colors uppercase tracking-[0.2em]">Signal Node: SECURED</span>
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_15px_#22c55e]"></div>
              </div>
              <div className="flex items-center justify-end gap-5 group">
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-slate-400 transition-colors uppercase tracking-[0.2em]">Audit Speed: TURBO</span>
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_15px_#22c55e]"></div>
              </div>
              <p className="text-[11px] font-black text-slate-900 mt-20 uppercase tracking-[1em] select-none">
                © 2024-2025 ER GROUP
              </p>
            </div>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer { animation: shimmer 2s infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37,99,235,0.4); }
        .animate-in { animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(40px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />
    </div>
  );
};

export default App;