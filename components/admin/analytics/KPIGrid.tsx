
import React from 'react';
import { AnalyticsOverview } from '../../../types';

interface KPIGridProps {
  overview: AnalyticsOverview | null;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ overview }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
         <p className="text-3xl font-serif font-bold text-brand-dark">£{overview?.revenue?.toLocaleString(undefined, {minimumFractionDigits: 2}) ?? '0.00'}</p>
         <p className="text-xs text-green-600 mt-1 font-bold">in selected period</p>
      </div>
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Unique Visitors</p>
         <p className="text-3xl font-serif font-bold text-slate-900">{overview?.visitors?.toLocaleString() ?? 0}</p>
         <p className="text-xs text-slate-400 mt-1">Sessions</p>
      </div>
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Page Views</p>
         <p className="text-3xl font-serif font-bold text-slate-900">{overview?.pageviews?.toLocaleString() ?? 0}</p>
         <p className="text-xs text-slate-400 mt-1">
            Avg {((overview?.pageviews ?? 0) / (overview?.visitors || 1)).toFixed(1)} per user
         </p>
      </div>
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Conversion Rate</p>
         <p className="text-3xl font-serif font-bold text-brand-hope">{overview?.conversion_rate?.toFixed(2) ?? '0.00'}%</p>
         <p className="text-xs text-slate-400 mt-1">{overview?.orders ?? 0} orders</p>
      </div>
    </div>
  );
};
