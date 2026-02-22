
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface ScribbleCanvasProps {
  onCapture: (dataUrl: string) => void;
  isProcessing: boolean;
}

type Tool = 'brush' | 'eraser';

const ScribbleCanvas: React.FC<ScribbleCanvasProps> = ({ onCapture, isProcessing }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<number | null>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#4f46e5'); // Indigo-600
  const [lineWidth, setLineWidth] = useState(4);
  const [activeTool, setActiveTool] = useState<Tool>('brush');
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) tempCtx.drawImage(canvas, 0, 0);

        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(tempCanvas, 0, 0);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        }
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleProcess = useCallback(() => {
    if (isProcessing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onCapture(dataUrl);
      setCountdown(null);
    }
  }, [onCapture, isProcessing]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (isProcessing) return;
    
    // Clear auto-recognize timer if user starts drawing again
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
      setCountdown(null);
    }

    const { x, y } = getCoordinates(e);
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = activeTool === 'eraser' ? 'white' : color;
      ctx.lineWidth = lineWidth;
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isProcessing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Auto-recognize logic
    if (isAutoMode && !isProcessing) {
      setCountdown(100);
      timerRef.current = window.setTimeout(() => {
        handleProcess();
      }, 1500);
    }
  };

  // Manage the visual countdown progress bar
  useEffect(() => {
    let interval: number;
    if (countdown !== null && countdown > 0) {
      interval = window.setInterval(() => {
        setCountdown(prev => (prev !== null && prev > 0 ? prev - 2 : 0));
      }, 30);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setCountdown(null);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  };

  return (
    <div className="relative flex flex-col h-full w-full bg-white rounded-xl shadow-inner border-2 border-slate-200 overflow-hidden">
      {/* Auto-Recognize Progress Bar */}
      {isAutoMode && countdown !== null && (
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 z-10">
          <div 
            className="h-full bg-indigo-500 transition-all duration-300 ease-linear"
            style={{ width: `${countdown}%` }}
          />
        </div>
      )}

      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="flex-grow cursor-crosshair touch-none"
      />
      
      {/* Canvas Toolbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-slate-200">
        
        {/* Auto Toggle */}
        <div className="flex items-center gap-2 pr-4 border-r border-slate-200">
          <button 
            onClick={() => setIsAutoMode(!isAutoMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isAutoMode ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <span className={`w-2 h-2 rounded-full ${isAutoMode ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300'}`} />
            AUTO
          </button>
        </div>

        {/* Tool Switcher */}
        <div className="flex items-center gap-1 pr-4 border-r border-slate-200">
          <button 
            onClick={() => setActiveTool('brush')}
            className={`p-2 rounded-lg transition-all ${activeTool === 'brush' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
            title="Brush Tool"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 5 2"/><path d="m5 2 5 2"/></svg>
          </button>
          <button 
            onClick={() => setActiveTool('eraser')}
            className={`p-2 rounded-lg transition-all ${activeTool === 'eraser' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
            title="Eraser Tool"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 21 14-14c.8-.8.8-2 0-2.8l-4.2-4.2c-.8-.8-2-.8-2.8 0L2 14l6 6Z"/><path d="M11 15h7"/><path d="m12 13 3 3"/></svg>
          </button>
        </div>

        {/* Colors */}
        <div className={`flex items-center gap-2 pr-4 border-r border-slate-200 transition-opacity ${activeTool === 'eraser' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
          <button 
            onClick={() => setColor('#4f46e5')}
            className={`w-5 h-5 rounded-full bg-indigo-600 transition-transform ${color === '#4f46e5' ? 'scale-125 ring-2 ring-offset-2 ring-indigo-600' : 'hover:scale-110'}`}
          />
          <button 
            onClick={() => setColor('#ef4444')}
            className={`w-5 h-5 rounded-full bg-red-500 transition-transform ${color === '#ef4444' ? 'scale-125 ring-2 ring-offset-2 ring-red-500' : 'hover:scale-110'}`}
          />
          <button 
            onClick={() => setColor('#22c55e')}
            className={`w-5 h-5 rounded-full bg-green-500 transition-transform ${color === '#22c55e' ? 'scale-125 ring-2 ring-offset-2 ring-green-500' : 'hover:scale-110'}`}
          />
          <button 
            onClick={() => setColor('#0f172a')}
            className={`w-5 h-5 rounded-full bg-slate-900 transition-transform ${color === '#0f172a' ? 'scale-125 ring-2 ring-offset-2 ring-slate-900' : 'hover:scale-110'}`}
          />
        </div>

        <div className="flex items-center gap-3">
          <input 
            type="range" 
            min="1" 
            max="40" 
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            className="w-20 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
          <button 
            onClick={clearCanvas}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            title="Clear All"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
          <button 
            onClick={handleProcess}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold transition-all shadow-md active:scale-95 ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
          >
            {isProcessing ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Thinking
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Recognize
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScribbleCanvas;
