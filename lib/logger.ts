
export const log = (operation: string, table: string, details?: any) => {
  // STRICT: Disable logs in production
  // We check multiple flags to be safe
  const isProd = 
    (import.meta as any).env?.PROD === true || 
    (import.meta as any).env?.MODE === 'production' ||
    window.location.hostname === 'jamboapparels.com' ||
    window.location.hostname === 'www.jamboapparels.com';

  if (isProd) {
    return;
  }
  
  // Safe logging for Dev: Deep clone and redact potential PII before printing
  let safeDetails = details;
  
  if (details && typeof details === 'object') {
    try {
      safeDetails = JSON.parse(JSON.stringify(details));
      const redactKeys = ['password', 'token', 'key', 'secret', 'address', 'email', 'phone', 'credit_card'];
      
      const redact = (obj: any) => {
        for (const key in obj) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            redact(obj[key]);
          } else if (redactKeys.some(k => key.toLowerCase().includes(k))) {
            obj[key] = '***REDACTED***';
          }
        }
      };
      
      redact(safeDetails);
    } catch (e) {
      safeDetails = '[Unparseable Data]';
    }
  }

  console.log(`%c[DB] ${operation} on ${table}`, 'color: #2E7D32; font-weight: bold;', safeDetails || '');
};
