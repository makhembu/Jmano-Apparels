
import React, { useEffect, useState } from 'react';
import { api } from '../../lib/db';
import { AnalyticsOverview, DailyAnalytics, ProductPerformance, TrafficSource } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useShop } from '../../context/ShopContext';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { Button } from '../../components/ui/Button';

// Color Palette for Charts
const COLORS = ['#2E7D32', '#F1C40F', '#B96AD9', '#E67E22', '#3498DB', '#E74C3C'];

export const AdminAnalytics: React.FC = () => {
  const { settings } = useShop();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [dailyData, setDailyData] = useState<DailyAnalytics[]>([]);
  const [products, setProducts] = useState<ProductPerformance[]>([]);
  const [sources, setSources] = useState<TrafficSource[]>([]);
  
  const [timeRange, setTimeRange] = useState(30);
  
  // AI Analyst State
  const [aiReport, setAiReport] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeRange);

      const [ov, daily, prod, src] = await Promise.all([
        api.getAnalyticsOverview(startDate, endDate),
        api.getDailyAnalytics(timeRange),
        api.getProductAnalytics(),
        api.getTrafficSources(timeRange)
      ]);

      setOverview(ov);
      setDailyData(daily);
      setProducts(prod);
      setSources(src);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const generateAiInsights = async () => {
    if (!settings.geminiApiKey) {
        setAiReport("⚠️ AI features require a Gemini API Key. Please configure it in App Settings.");
        return;
    }

    setAnalyzing(true);
    try {
        const ai = new GoogleGenAI({ apiKey: settings.geminiApiKey });
        const model = 'gemini-2.5-flash';

        // Prepare data summary for AI
        const contextData = {
            period: `Last ${timeRange} days`,
            overview,
            topProducts: products.slice(0, 3),
            trafficSources: sources.slice(0, 3),
            dailyTrend: dailyData.map(d => ({ d: d.date, v: d.visitors, s: d.revenue })) // Minimized to save tokens
        };

        const prompt = `
        You are an expert E-commerce Analyst for "Jambo Apparels", a faith-based clothing brand.
        Analyze the following data JSON and provide a strategic report.
        
        DATA:
        ${JSON.stringify(contextData)}

        REQUEST:
        1. Identify any days with 0 traffic or drops and suggest why (e.g. weekends, lack of posting).
        2. Analyze the conversion rate (Visitor to Order). Is it healthy?
        3. Look at the traffic sources. Where are high-value customers coming from?
        4. Give 3 specific, actionable marketing suggestions to improve revenue based on this data.
        
        Format as a clean markdown report. Be encouraging but direct.
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

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-brand-dark">Analytics & Insights</h1>
          <p className="text-sm text-slate-500">Real-time performance tracking and AI analysis.</p>
        </div>
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
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
           <p className="text-3xl font-serif font-bold text-brand-dark">£{overview?.revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
           <p className="text-xs text-green-600 mt-1 font-bold">in last {timeRange} days</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Visitors</p>
           <p className="text-3xl font-serif font-bold text-slate-900">{overview?.visitors.toLocaleString()}</p>
           <p className="text-xs text-slate-400 mt-1">Unique sessions</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Page Views</p>
           <p className="text-3xl font-serif font-bold text-slate-900">{overview?.pageviews.toLocaleString()}</p>
           <p className="text-xs text-slate-400 mt-1">Avg {(overview && overview.visitors > 0 ? (overview.pageviews / overview.visitors).toFixed(1) : 0)} per user</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Conversion Rate</p>
           <p className="text-3xl font-serif font-bold text-brand-hope">{overview?.conversion_rate.toFixed(2)}%</p>
           <p className="text-xs text-slate-400 mt-1">{overview?.orders} orders</p>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Line Chart */}
         <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Traffic & Sales Trend</h3>
            <div className="h-[350px]">
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
         <div className="bg-gradient-to-br from-white to-brand-light/30 p-6 rounded-xl border border-brand-green/20 flex flex-col">
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-brand-dark flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  AI Insight Analyst
               </h3>
               {analyzing && <span className="text-xs text-brand-green font-bold animate-pulse">Thinking...</span>}
            </div>
            
            <div className="flex-1 bg-white/50 rounded-xl border border-white/50 p-4 mb-4 overflow-y-auto max-h-[300px] text-sm text-slate-700 leading-relaxed shadow-inner">
               {aiReport ? (
                  <ReactMarkdown className="prose prose-sm prose-green max-w-none">
                     {aiReport}
                  </ReactMarkdown>
               ) : (
                  <div className="text-center text-gray-400 py-10 flex flex-col items-center">
                     <p>Ready to analyze your store performance.</p>
                     <p className="text-xs mt-2">I will check for traffic drops, conversion issues, and opportunity gaps.</p>
                  </div>
               )}
            </div>
            
            <Button 
               onClick={generateAiInsights} 
               isLoading={analyzing} 
               variant="primary" 
               fullWidth
               className="shadow-lg shadow-brand-green/20"
            >
               {aiReport ? 'Regenerate Analysis' : 'Analyze Performance'}
            </Button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Top Products Table */}
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

         {/* Traffic Sources */}
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
    </div>
  );
};
