
import React from 'react';
import { RecognitionResult } from '../types';

interface HistoryItemProps {
  result: RecognitionResult;
  onDelete: (id: string) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ result, onDelete }) => {
  return (
    <div className="group relative bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex gap-4">
        <div className="w-20 h-20 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
          <img src={result.thumbnail} alt="Scribble thumbnail" className="w-full h-full object-cover" />
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start mb-1">
            <span className="text-xs font-medium text-slate-400">
              {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button 
              onClick={() => onDelete(result.id)}
              className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
          
          <div className="mb-2">
            <h4 className="text-sm font-semibold text-slate-900 mb-1">Recognized Text:</h4>
            <p className="text-sm text-slate-600 line-clamp-2 italic bg-slate-50 p-2 rounded border border-slate-100">
              {result.text || <span className="text-slate-400 italic">No text detected</span>}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 mb-1">Shapes:</h4>
            <div className="flex flex-wrap gap-1">
              {result.shapes.length > 0 ? result.shapes.map((s, idx) => (
                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-100 text-indigo-700 border border-indigo-200 capitalize">
                  {s.count > 1 ? `${s.count}x ` : ''}{s.type}
                </span>
              )) : (
                <span className="text-[10px] text-slate-400">No shapes detected</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryItem;
