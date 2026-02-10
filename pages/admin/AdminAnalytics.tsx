import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '../../lib/db';
import { AnalyticsOverview, DailyAnalytics, ProductPerformance, TrafficSource, GeoStat, PageStat } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useShop } from '../../context/ShopContext';
import { Button } from '../../components/ui/Button';
import { isAbortError } from '../../lib/utils';
import { CacheManager } from '../../lib/cache';

// Components
import { LiveMonitor } from '../../components/admin/analytics/LiveMonitor';
import { KPIGrid } from '../../components/admin/analytics/KPIGrid';
import { TrafficChart } from '../../components/admin/analytics/TrafficChart';
import { TrafficDistribution } from '../../components/admin/analytics/TrafficDistribution';
import { PerformanceTables } from '../../components/admin/analytics/PerformanceTables';
import { AIAnalyst } from '../../components/admin/analytics/AIAnalyst';

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

  const fetchData = useCallback(async (force = false) => {
    // 1. Check Cache
    const cacheKey = `analytics_${timeRange}`;
    const cachedData = CacheManager.memory.get<any>(cacheKey);

    if (!force && cachedData) {
        setOverview(cachedData.overview);
        setDailyData(cachedData.dailyData);
        setProducts(cachedData.products);
        setSources(cachedData.sources);
        setGeoStats(cachedData.geoStats);
        setPageStats(cachedData.pageStats);
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
        api.getProductAnalytics(timeRange), 
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

      // 2. Set Cache (300 seconds / 5 minutes TTL)
      CacheManager.memory.set(cacheKey, payload, 300);

    } catch (e: any) {
      if (isAbortError(e)) return;
      console.error("Analytics fetch failed", e);
      setError("Failed to load analytics data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Context for AI
  const aiContext = useMemo(() => ({
    period: `Last ${timeRange} days`,
    overview,
    topProducts: products.slice(0, 3),
    trafficSources: sources.slice(0, 3),
    topCountries: geoStats.slice(0, 3),
    exitPages: pageStats.sort((a,b) => b.views - a.views).slice(0, 3),
    dailyTrend: dailyData.map(d => ({ d: d.date.slice(5), v: d.visitors, r: d.revenue }))
  }), [timeRange, overview, products, sources, geoStats, pageStats, dailyData]);

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

      <div data-copilot-id="live-traffic-card">
         <LiveMonitor />
      </div>

      <KPIGrid overview={overview} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <TrafficChart data={dailyData} />
         <AIAnalyst apiKey={settings.geminiApiKey} contextData={aiContext} />
      </div>

      <TrafficDistribution sources={sources} geoStats={geoStats} overview={overview} />

      <PerformanceTables products={products} pageStats={pageStats} />
    </div>
  );
};