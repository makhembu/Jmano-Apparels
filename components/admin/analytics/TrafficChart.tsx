
import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { DailyAnalytics } from '../../../types';

interface TrafficChartProps {
  data: DailyAnalytics[];
}

export const TrafficChart: React.FC<TrafficChartProps> = ({ data }) => {
  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-6">Traffic & Sales Trend</h3>
        <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                    <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2E7D32" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F1C40F" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#F1C40F" stopOpacity={0}/>
                    </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                    dataKey="date" 
                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                    tick={{fontSize: 10, fill: '#94a3b8'}}
                    axisLine={false}
                    tickLine={false}
                    />
                    <YAxis yAxisId="left" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    labelStyle={{fontSize: '12px', fontWeight: 'bold', color: '#334155'}}
                    />
                    <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                    <Area yAxisId="left" type="monotone" dataKey="visitors" name="Visitors" stroke="#2E7D32" fillOpacity={1} fill="url(#colorVis)" strokeWidth={2} />
                    <Area yAxisId="right" type="monotone" dataKey="revenue" name="Revenue (£)" stroke="#F1C40F" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};
