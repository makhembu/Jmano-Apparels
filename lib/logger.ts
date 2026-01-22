export const log = (operation: string, table: string, details?: any) => {
  console.log(`%c[DB] ${operation} on ${table}`, 'color: #2E7D32; font-weight: bold;', details || '');
};