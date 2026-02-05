
import React, { useEffect, useState, useRef } from 'react';
import { subscribeLogs, getLogHistory, LogEntry, clearLogs } from '../../../lib/logger';
import { api } from '../../../lib/db';
import { useToast } from '../../../context/ToastContext';

export const SystemLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const lastSyncedIndexRef = useRef(-1);

  useEffect(() => {
    setLogs(getLogHistory());
    const unsubscribe = subscribeLogs((newLog) => {
      setLogs(prev => [...prev, newLog]);
    });
    return () => { unsubscribe(); };
  }, []);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll, isExpanded]);

  // Periodic Auto-Sync logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (autoSync) {
        interval = setInterval(() => {
            if (!isSyncing && logs.length > lastSyncedIndexRef.current + 1) {
                handleSync();
            }
        }, 10000); // Check every 10s
    }
    return () => clearInterval(interval);
  }, [autoSync, logs, isSyncing]);

  const handleClear = () => {
    clearLogs();
    setLogs([]);
    lastSyncedIndexRef.current = -1;
  };

  const handleSync = async () => {
    const unsyncedLogs = logs.slice(lastSyncedIndexRef.current + 1);
    if (unsyncedLogs.length === 0) return;

    setIsSyncing(true);
    try {
        await api.persistSystemLogs(unsyncedLogs);
        lastSyncedIndexRef.current = logs.length - 1;
        if (!autoSync) showToast(`Synced ${unsyncedLogs.length} logs to DB`, 'success');
    } catch (e) {
        if (!autoSync) showToast('Failed to sync logs', 'error');
        console.error("Log sync failed", e);
    } finally {
        setIsSyncing(false);
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jambo_system_logs_${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  return (
    <div className={`bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden transition-all duration-300 flex flex-col ${isExpanded ? 'h-[600px]' : 'h-24'}`}>
      {/* Toolbar */}
      <div className="bg-slate-800 px-4 py-2 flex flex-col md:flex-row justify-between items-center border-b border-slate-700 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
          </div>
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider ml-2">System Diagnostics</span>
          {isSyncing && <span className="text-[10px] text-blue-400 animate-pulse font-mono ml-2">SYNCING...</span>}
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <label className="flex items-center gap-2 mr-2 cursor-pointer bg-slate-700 px-2 rounded hover:bg-slate-600 transition-colors">
             <input type="checkbox" checked={autoSync} onChange={e => setAutoSync(e.target.checked)} className="rounded bg-slate-600 border-none text-brand-green focus:ring-0 w-3 h-3" />
             <span className="text-[10px] uppercase font-bold text-slate-300">Auto-Archive</span>
          </label>
          <button 
            onClick={handleSync} 
            disabled={isSyncing}
            className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white transition-colors"
          >
            Sync DB
          </button>
          <button 
            onClick={handleExport} 
            className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white transition-colors"
          >
            Export
          </button>
          <button 
            onClick={() => setAutoScroll(!autoScroll)} 
            className={`text-[10px] uppercase font-bold px-2 py-1 rounded transition-colors ${autoScroll ? 'bg-brand-green text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
          >
            {autoScroll ? 'Scroll: On' : 'Scroll: Off'}
          </button>
          <button 
            onClick={handleClear} 
            className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white transition-colors"
          >
            Clear
          </button>
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white transition-colors"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {/* Log Stream */}
      {isExpanded && (
        <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1 custom-scrollbar bg-slate-900"
        >
            {logs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-600 italic">
                Waiting for system activity...
            </div>
            ) : (
            logs.map((log) => (
                <div key={log.id} className="flex gap-3 hover:bg-slate-800/50 p-1 rounded transition-colors group">
                <span className="text-slate-500 flex-shrink-0 select-none">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className="text-blue-400 font-bold uppercase w-20 flex-shrink-0 truncate" title={log.context}>
                    {log.context}
                </span>
                <span className={`font-bold flex-shrink-0 ${getLevelColor(log.level)}`}>
                    {log.operation}
                </span>
                <span className="text-slate-300 break-all">
                    {log.details ? (
                    <span className="opacity-80 group-hover:opacity-100 transition-opacity">
                        {JSON.stringify(log.details)}
                    </span>
                    ) : (
                    <span className="text-slate-600">-</span>
                    )}
                </span>
                </div>
            ))
            )}
        </div>
      )}
    </div>
  );
};
