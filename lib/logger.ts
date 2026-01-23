export const log = (operation: string, table: string, details?: any) => {
  // In Vite, import.meta.env.PROD is true for production builds.
  // This will prevent logging in the production environment.
  // FIX: Cast import.meta to any to resolve TypeScript error about missing 'env' property.
  if ((import.meta as any).env?.PROD) {
    return;
  }
  console.log(`%c[DB] ${operation} on ${table}`, 'color: #2E7D32; font-weight: bold;', details || '');
};