
import React from 'react';
import { ProductPerformance, PageStat } from '../../../types';

interface PerformanceTablesProps {
  products: ProductPerformance[];
  pageStats: PageStat[];
}

export const PerformanceTables: React.FC<PerformanceTablesProps> = ({ products, pageStats }) => {
  return (
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
  );
};
