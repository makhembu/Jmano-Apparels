
export const log = (operation: string, table: string, details?: any) => {
  // Check if we are in production mode using Vite's env variable
  // using optional chaining to safely access env
  // FIX: Cast import.meta to any to resolve TS error 'Property env does not exist on type ImportMeta'
  const isProd = (import.meta as any).env?.PROD;

  // TEMPORARY: Enable logs even in production for debugging
  // if (isProd) {
  //   return;
  // }
  
  console.log(`%c[DB] ${operation} on ${table}`, 'color: #2E7D32; font-weight: bold;', details || '');
};
