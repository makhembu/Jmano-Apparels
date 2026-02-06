
import React, { useState, useEffect } from 'react';
import { AppSettings, PriorityPage } from '../../../types';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';

interface SitelinksManagerProps {
  settings: AppSettings;
  onUpdate: (pages: PriorityPage[]) => void;
}

export const SitelinksManager: React.FC<SitelinksManagerProps> = ({ settings, onUpdate }) => {
  const [pages, setPages] = useState<PriorityPage[]>([]);

  useEffect(() => {
    // Initialize with settings or a default structure
    const defaultPages = [
      { pageUrl: "/shop", pageTitle: "Shop Collection", pageDescription: "Browse our apparel.", priority: 9, enabled: true },
      { pageUrl: "/blog", pageTitle: "Journal", pageDescription: "Read our stories.", priority: 8, enabled: true },
      { pageUrl: "/about", pageTitle: "About Us", pageDescription: "Learn our mission.", priority: 7, enabled: true },
    ];
    setPages(settings.priorityPages || defaultPages);
  }, [settings.priorityPages]);

  const handleUpdate = (index: number, field: keyof PriorityPage, value: any) => {
    const newPages = [...pages];
    (newPages[index] as any)[field] = value;
    setPages(newPages);
    onUpdate(newPages);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">
      <div className="border-b pb-4">
        <h3 className="text-lg font-medium text-brand-green">Google Sitelinks</h3>
        <p className="text-xs text-gray-500 mt-1">
          Define priority pages to encourage Google to show them as sitelinks in search results.
          Google makes the final decision, but a clear hierarchy helps.
        </p>
      </div>
      
      <div className="space-y-6">
        {pages.map((page, index) => (
          <div key={index} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-2">
                <Input
                  label="URL"
                  value={page.pageUrl}
                  onChange={(e) => handleUpdate(index, 'pageUrl', e.target.value)}
                  placeholder="/shop"
                />
                <Input
                  label="Title (max 60)"
                  value={page.pageTitle}
                  onChange={(e) => handleUpdate(index, 'pageTitle', e.target.value)}
                  maxLength={60}
                />
                <Textarea
                  label="Description (max 160)"
                  value={page.pageDescription}
                  onChange={(e) => handleUpdate(index, 'pageDescription', e.target.value)}
                  maxLength={160}
                  rows={2}
                />
              </div>
              <div className="flex flex-col items-center gap-2 pl-4">
                 <label className="text-[10px] font-bold uppercase text-slate-400">Enabled</label>
                 <input
                    type="checkbox"
                    checked={page.enabled}
                    onChange={(e) => handleUpdate(index, 'enabled', e.target.checked)}
                    className="w-5 h-5 rounded text-brand-green focus:ring-brand-green border-slate-300"
                  />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
