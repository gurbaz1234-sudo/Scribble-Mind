
import React, { useState, useCallback, useEffect } from 'react';
import ScribbleCanvas from './components/ScribbleCanvas';
import HistoryItem from './components/HistoryItem';
import { RecognitionResult } from './types';
import { analyzeScribble } from './services/geminiService';

const App: React.FC = () => {
  const [history, setHistory] = useState<RecognitionResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load history from local storage
  useEffect(() => {
    const saved = localStorage.getItem('scribble_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to local storage
  useEffect(() => {
    localStorage.setItem('scribble_history', JSON.stringify(history));
  }, [history]);

  const handleCapture = useCallback(async (dataUrl: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await analyzeScribble(dataUrl);
      
      const newEntry: RecognitionResult = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        text: result.text,
        shapes: result.shapes,
        thumbnail: dataUrl
      };

      setHistory(prev => [newEntry, ...prev]);
    } catch (err: any) {
      setError(err.message || "Failed to analyze scribble. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear all history?")) {
      setHistory([]);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 overflow-hidden">
      {/* Sidebar - History */}
      <aside className="w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-200 bg-white">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ScribbleMind</h1>
            <p className="text-xs text-slate-500 font-medium">Handwriting & Shape Intelligence</p>
          </div>
          {history.length > 0 && (
            <button 
              onClick={clearHistory}
              className="text-slate-400 hover:text-red-500 transition-colors p-2"
              title="Clear History"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          )}
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <div className="w-16 h-16 mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </div>
              <p className="text-sm font-medium">Your recognized scribbles will appear here.</p>
            </div>
          ) : (
            history.map(item => (
              <HistoryItem key={item.id} result={item} onDelete={deleteHistoryItem} />
            ))
          )}
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-400 text-center font-medium">
          Powered by Gemini 2.5 Flash Lite (Low Latency)
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-grow flex flex-col relative p-4 md:p-8 h-full">
        {error && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span className="text-sm font-medium">{error}</span>
              <button onClick={() => setError(null)} className="ml-2 hover:text-red-900">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
        )}

        <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Workspace</h2>
            <div className="flex items-center gap-2">
              <p className="text-slate-500 font-medium">Draw something below to digitize it</p>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-tighter">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="fill-amber-700"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                Fast Mode
              </span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-6 px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
             <div className="flex flex-col">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Conversions</span>
               <span className="text-xl font-bold text-indigo-600">{history.length}</span>
             </div>
             <div className="w-px h-8 bg-slate-100" />
             <div className="flex flex-col">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Model</span>
               <span className="text-sm font-semibold text-slate-700">Gemini 2.5 Flash Lite</span>
             </div>
          </div>
        </header>

        <div className="flex-grow min-h-0">
          <ScribbleCanvas onCapture={handleCapture} isProcessing={isProcessing} />
        </div>

        <footer className="mt-6 flex flex-col sm:flex-row items-center justify-between text-slate-400 gap-4">
          <p className="text-xs font-medium">Tip: Use a touch pen for higher precision.</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-200 animate-pulse" />
              Low Latency Active
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
