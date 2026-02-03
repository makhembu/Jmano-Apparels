
import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/db';
import { LiveVisitor } from '../../../types';
import { isAbortError } from '../../../lib/utils';

export const LiveMonitor: React.FC = () => {
    const [visitors, setVisitors] = useState<LiveVisitor[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLive = async () => {
        try {
            // Live data is not cached to ensure real-time accuracy
            const data = await api.getLiveVisitors(5); // Active in last 5 mins
            setVisitors(data);
        } catch (e) {
            if (!isAbortError(e)) console.error("Live fetch error", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLive();
        const interval = setInterval(fetchLive, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="h-24 bg-white rounded-xl animate-pulse border border-slate-100"></div>;

    return (
        <div id="live-traffic-card" className="bg-gradient-to-r from-brand-dark to-[#0D3B10] text-white rounded-xl p-6 shadow-xl border border-white/10 relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-hope opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-hope"></span>
                    </span>
                    <h3 className="font-bold text-lg uppercase tracking-widest text-brand-hope">Live Pulse</h3>
                </div>
                <div className="text-right">
                    <span className="text-4xl font-serif font-bold">{visitors.length}</span>
                    <p className="text-[10px] text-white/60 uppercase tracking-widest">Active Now</p>
                </div>
            </div>

            <div className="space-y-3 relative z-10">
                {visitors.length === 0 ? (
                    <p className="text-white/50 text-sm italic">Waiting for traffic...</p>
                ) : (
                    visitors.slice(0, 3).map((v, i) => (
                        <div key={`${v.session_id}-${i}`} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5 backdrop-blur-sm">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                                    {v.geo_country === 'Unknown' ? '?' : v.geo_country.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold truncate">{v.user_email || 'Guest Visitor'}</p>
                                    <p className="text-[10px] text-white/50 truncate flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-green"></span>
                                        {v.path}
                                    </p>
                                </div>
                            </div>
                            <span className="text-[10px] font-mono text-white/40">{v.geo_city}</span>
                        </div>
                    ))
                )}
                {visitors.length > 3 && (
                    <p className="text-center text-[10px] text-white/40 pt-1">...and {visitors.length - 3} more</p>
                )}
            </div>
        </div>
    );
};
