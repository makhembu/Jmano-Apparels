
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { TrafficSource, GeoStat, AnalyticsOverview } from '../../../types';

interface TrafficDistributionProps {
  sources: TrafficSource[];
  geoStats: GeoStat[];
  overview: AnalyticsOverview | null;
}

const COLORS = ['#2E7D32', '#F1C40F', '#B96AD9', '#E67E22', '#3498DB', '#E74C3C', '#95A5A6'];

export const TrafficDistribution: React.FC<TrafficDistributionProps> = ({ sources, geoStats, overview }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
            <h3 className="font-bold text-gray-900">Visitor Geography</h3>
        </div>
        <div className="p-6 flex-1">
            {geoStats.length > 0 ? (
                <div className="space-y-4">
                    {geoStats.slice(0, 5).map((g, i) => (
                    <div key={g.country} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="w-6 text-center text-xs font-bold text-slate-400">{i + 1}</span>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-700">{g.country}</span>
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-brand-green" style={{ width: `${(g.visitors / (overview?.visitors || 1)) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block text-sm font-bold text-slate-900">{g.visitors}</span>
                            {g.revenue > 0 && <span className="block text-xs text-brand-hope font-bold">£{g.revenue}</span>}
                        </div>
                    </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-10">No geographic data collected yet.</p>
            )}
        </div>
        </div>

        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
            <h3 className="font-bold text-gray-900">Traffic Sources</h3>
        </div>
        <div className="p-6 flex-1 flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2 h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={sources}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="visitors"
                    >
                        {sources.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-4">
                {sources.length === 0 ? <p className="text-center text-gray-500 text-sm">No traffic data yet.</p> : sources.map((s, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                        <span className="capitalize text-gray-700">{s.source}</span>
                    </div>
                    <div className="text-right">
                        <span className="font-bold text-gray-900 block">{s.visitors}</span>
                        <span className="text-xs text-gray-400 block">{((s.visitors / (overview?.visitors || 1)) * 100).toFixed(0)}%</span>
                    </div>
                    </div>
                ))}
            </div>
        </div>
        </div>
    </div>
  );
};
