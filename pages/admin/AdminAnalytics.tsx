
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { api } from '../../lib/db';
import { AnalyticsOverview, DailyAnalytics, ProductPerformance, TrafficSource, GeoStat, PageStat, LiveVisitor } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useShop } from '../../context/ShopContext';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { Button } from '../../components/ui/Button';

// Color Palette for Charts
const COLORS = ['#2E7D32', '#F1C40F', '#B96AD9', '#E67E22', '#3498DB', '#E74C3C', '#95A5A6'];

const LiveMonitor: React.FC = () => {
    const [visitors, setVisitors] = useState<LiveVisitor[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLive = async () => {
        try {
            const data = await api.getLiveVisitors(5); // Active in last 5 mins
            setVisitors(data);
        } catch (e) {
            console.error("Live fetch error", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLive();
        const interval = setInterval(fetchLive, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="h-24 bg-white rounded-xl animate-pulse"></div>;

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

export const AdminAnalytics: React.FC = () => {
  const { settings } = useShop();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data States
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [dailyData, setDailyData] = useState<DailyAnalytics[]>([]);
  const [products, setProducts] = useState<ProductPerformance[]>([]);
  const [sources, setSources] = useState<TrafficSource[]>([]);
  const [geoStats, setGeoStats] = useState<GeoStat[]>([]);
  const [pageStats, setPageStats] = useState<PageStat[]>([]);
  
  const [timeRange, setTimeRange] = useState(30);
  
  // AI Analyst State
  const [aiReport, setAiReport] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);

  // Caching mechanism to prevent refetch on remount if data is fresh (< 5 mins)
  const cache = useRef<Record<number, { data: any, timestamp: number }>>({});

  const fetchData = useCallback(async (force = false) => {
    // Check Cache
    const now = Date.now();
    if (!force && cache.current[timeRange] && (now - cache.current[timeRange].timestamp < 300000)) {
        const cached = cache.current[timeRange].data;
        setOverview(cached.overview);
        setDailyData(cached.dailyData);
        setProducts(cached.products);
        setSources(cached.sources);
        setGeoStats(cached.geoStats);
        setPageStats(cached.pageStats);
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeRange);

      const [ov, daily, prod, src, geo, pages] = await Promise.all([
        api.getAnalyticsOverview(startDate, endDate),
        api.getDailyAnalytics(timeRange),
        api.getProductAnalytics(timeRange), // Pass timeRange now!
        api.getTrafficSources(timeRange),
        api.getGeoStats(timeRange),
        api.getPagePerformance(timeRange)
      ]);

      const payload = { overview: ov, dailyData: daily, products: prod, sources: src, geoStats: geo, pageStats: pages };
      
      // Update State
      setOverview(ov);
      setDailyData(daily);
      setProducts(prod);
      setSources(src);
      setGeoStats(geo);
      setPageStats(pages);

      // Update Cache
      cache.current[timeRange] = { data: payload, timestamp: now };

    } catch (e: any) {
      console.error("Analytics fetch failed", e);
      setError("Failed to load analytics data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const generateAiInsights = async () => {
    if (!settings.geminiApiKey) {
        setAiReport("⚠️ AI features require a Gemini API Key. Please configure it in App Settings.");
        return;
    }

    setAnalyzing(true);
    try {
        const ai = new GoogleGenAI({ apiKey: settings.geminiApiKey });
        const model = 'gemini-2.5-flash';

        // Simplify Daily Trend for AI token limits
        const simplifiedTrend = dailyData.map(d => ({ d: d.date.slice(5), v: d.visitors, r: d.revenue }));

        // Prepare data summary for AI
        const contextData = {
            period: `Last ${timeRange} days`,
            overview,
            topProducts: products.slice(0, 3),
            trafficSources: sources.slice(0, 3),
            topCountries: geoStats.slice(0, 3),
            exitPages: pageStats.sort((a,b) => b.views - a.views).slice(0, 3),
            dailyTrend: simplifiedTrend
        };

        const prompt = `
        You are a strict Data Analyst for "Jambo Apparels".
        Analyze the following JSON metrics.
        
        DATA:
        ${JSON.stringify(contextData)}

        BENCHMARKS:
        - Healthy E-commerce Conversion Rate: 1.5% - 3.0%
        - Good Average Time on Page: > 45 seconds
        
        RULES:
        1. DO NOT Hallucinate data. If a metric is 0 or missing, state "Insufficient data".
        2. Identify days with 0 traffic and suggest technical checks.
        3. Analyze the conversion rate against the benchmark.
        4. Analyze the exit pages. Where are users dropping off?
        5. Provide 3 specific, actionable steps to improve based ONLY on this data.
        
        Format as a clean markdown report.
        `;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        setAiReport(response.text || "Could not generate insights.");
    } catch (e: any) {
        console.error("AI Error:", e);
        setAiReport(`Error generating report: ${e.message}`);
    } finally {
        setAnalyzing(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  
  if (error) {
      return (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-slate-200 text-center">
              <div className="bg-red-50 p-4 rounded-full mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Analytics Unavailable</h3>
              <p className="text-slate-500 mb-6 max-w-md">{error}</p>
              <Button onClick={() => fetchData(true)} variant="primary">Retry Connection</Button>
          </div>
      );
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-brand-dark">Analytics & Insights</h1>
          <p className="text-sm text-slate-500">Performance data for the last {timeRange} days.</p>
        </div>
        <div className="flex gap-2">
           <div className="bg-white border border-gray-200 rounded-lg p-1 flex gap-1">
             {[7, 30, 90].map(days => (
               <button
                  key={days}
                  onClick={() => setTimeRange(days)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${timeRange === days ? 'bg-brand-green text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
               >
                 {days} Days
               </button>
             ))}
           </div>
           <button onClick={() => fetchData(true)} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-slate-500" title="Refresh">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
           </button>
        </div>
      </div>

      <LiveMonitor />

      {/* KPI Cards */}
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

      {/* Charts Row 1: Trends & AI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Traffic & Sales Trend</h3>
            <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData}>
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

         {/* AI Analyst Panel */}
         <div className="bg-gradient-to-br from-white to-brand-light/30 p-6 rounded-xl border border-brand-green/20 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-brand-dark flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  AI Data Analyst
               </h3>
               {analyzing && <span className="text-xs text-brand-green font-bold animate-pulse">Analyzing...</span>}
            </div>
            
            <div className="flex-1 bg-white/50 rounded-xl border border-white/50 p-4 mb-4 overflow-y-auto max-h-[300px] text-sm text-slate-700 leading-relaxed shadow-inner scrollbar-thin">
               {aiReport ? (
                  <ReactMarkdown className="prose prose-sm prose-green max-w-none">
                     {aiReport}
                  </ReactMarkdown>
               ) : (
                  <div className="text-center text-gray-400 py-10 flex flex-col items-center justify-center h-full">
                     <p className="text-sm font-medium">Ready to analyze your store performance.</p>
                     <p className="text-xs mt-2 opacity-70">I will check conversion health, geo-trends, and drop-off points.</p>
                  </div>
               )}
            </div>
            
            <div className="mt-auto">
               <Button 
                  onClick={generateAiInsights} 
                  isLoading={analyzing} 
                  variant="primary" 
                  fullWidth
                  className="shadow-lg shadow-brand-green/20"
               >
                  {aiReport ? 'Regenerate Analysis' : 'Run Analysis'}
               </Button>
               {aiReport && <p className="text-[10px] text-center text-slate-400 mt-2">AI-generated insights. Verify before acting.</p>}
            </div>
         </div>
      </div>

      {/* Row 2: Geography & Traffic Sources */}
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

      {/* Row 3: Product & Page Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
               <h3 className="font-bold text-gray-900">Top Products</h3>
            </div>
            <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                     <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Views</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Sales</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Conv.</th>
                     </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                     {products.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No data available.</td></tr>
                     ) : products.map((p, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                           <td className="px-6 py-4 text-sm font-medium text-gray-900 truncate max-w-[200px]">{p.title}</td>
                           <td className="px-6 py-4 text-sm text-gray-500 text-right">{p.views}</td>
                           <td className="px-6 py-4 text-sm text-brand-dark font-bold text-right">{p.sales}</td>
                           <td className="px-6 py-4 text-sm text-gray-500 text-right">
                              {p.views > 0 ? ((p.sales / p.views) * 100).toFixed(1) : 0}%
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
               <h3 className="font-bold text-gray-900">Page Engagement (Top 10)</h3>
            </div>
            <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                     <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Page Path</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Views</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Avg Time</th>
                     </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                     {pageStats.length === 0 ? (
                        <tr><td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No data available.</td></tr>
                     ) : pageStats.slice(0, 10).map((p, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                           <td className="px-6 py-4 text-sm font-mono text-gray-600 truncate max-w-[200px]">{p.path}</td>
                           <td className="px-6 py-4 text-sm text-gray-900 text-right font-bold">{p.views}</td>
                           <td className="px-6 py-4 text-sm text-gray-500 text-right">
                              {p.avg_time ? `${Math.round(p.avg_time)}s` : '-'}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
};
