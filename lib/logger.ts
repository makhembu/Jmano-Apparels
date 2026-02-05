
export interface LogEntry {
  id: string;
  timestamp: number;
  operation: string;
  context: string; // table or scope
  details?: any;
  level: 'info' | 'warn' | 'error';
}

const listeners: Set<(entry: LogEntry) => void> = new Set();
const logs: LogEntry[] = [];
const MAX_LOGS = 100;

// Helper to redact PII
const redactSensitiveData = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  
  try {
    const clone = JSON.parse(JSON.stringify(data));
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'credit_card', 'apikey', 'auth'];
    
    const traverse = (obj: any) => {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          traverse(obj[key]);
        } else if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
          obj[key] = '***REDACTED***';
        }
      }
    };
    traverse(clone);
    return clone;
  } catch {
    return '[Unparseable Data]';
  }
};

export const subscribeLogs = (callback: (entry: LogEntry) => void) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

export const getLogHistory = () => [...logs];

export const clearLogs = () => {
  logs.length = 0;
  // Notify listeners of clear event (optional, or just next log will show up)
};

export const log = (operation: string, context: string, details?: any, level: 'info'|'warn'|'error' = 'info') => {
  const safeDetails = redactSensitiveData(details);

  const entry: LogEntry = {
    id: Math.random().toString(36).slice(2, 11),
    timestamp: Date.now(),
    operation,
    context,
    details: safeDetails,
    level
  };

  // Add to internal history (LIFO for UI usually, but we store chronological)
  logs.push(entry);
  if (logs.length > MAX_LOGS) logs.shift();

  // Notify UI listeners
  listeners.forEach(listener => listener(entry));

  // Console output (Dev only or Error)
  const isProd = (import.meta as any).env?.PROD === true || 
                 window.location.hostname === 'jamboapparels.com';

  if (!isProd || level === 'error') {
    const style = level === 'error' ? 'color: #ef4444; font-weight: bold;' : 
                  level === 'warn' ? 'color: #f59e0b;' : 'color: #2E7D32; font-weight: bold;';
    
    console.log(`%c[${context}] ${operation}`, style, safeDetails || '');
  }
};
