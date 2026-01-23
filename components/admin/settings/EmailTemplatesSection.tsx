import React, { useState, useEffect } from 'react';
import { EmailTemplate } from '../../../types';
import { api } from '../../../lib/db';
import { Button } from '../../ui/Button';
import { useToast } from '../../../context/ToastContext';

export const EmailTemplatesSection: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  // View modes: 'edit' (code only), 'preview' (preview only), 'split' (side-by-side)
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
  
  const { showToast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await api.getEmailTemplates();
      setTemplates(data);
      if (data.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(data[0].id);
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to load email templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!selectedTemplateId) return;
    const { name, value } = e.target;
    setTemplates(prev => prev.map(t => 
      t.id === selectedTemplateId ? { ...t, [name]: value } : t
    ));
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;
    setSaving(true);
    try {
      await api.updateEmailTemplate(selectedTemplate.id, {
        subject: selectedTemplate.subject,
        bodyHtml: selectedTemplate.bodyHtml
      });
      showToast('Template updated successfully', 'success');
    } catch (e) {
      showToast('Failed to update template', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getTemplateLabel = (name: string) => {
    switch(name) {
      case 'welcome_email': return 'Welcome';
      case 'new_order_customer': return 'Order Conf.';
      case 'order_shipped': return 'Shipped';
      case 'order_cancelled': return 'Cancelled';
      default: return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const generatePreview = (html: string) => {
    let preview = html || '';
    const dummyData: Record<string, string> = {
      '{{name}}': 'Sarah Jenkins',
      '{{order_number}}': 'ORD-2026-8892',
      '{{total}}': '45.00',
      '{{tracking_number}}': 'GB-123456789',
      '{{order_link}}': '#',
    };

    Object.entries(dummyData).forEach(([key, value]) => {
      preview = preview.split(key).join(value);
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #ffffff; }
            h1, h2, h3 { color: #1B5E20; margin-top: 0; }
            p { margin-bottom: 1em; }
            a { color: #2E7D32; text-decoration: none; font-weight: bold; }
            .button { background: #2E7D32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; font-weight: bold; }
            .footer { margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          ${preview}
        </body>
      </html>
    `;
  };

  return (
    <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 overflow-hidden flex flex-col h-[700px] md:h-[800px]">
      {/* 1. Header with Template Tabs */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-4 gap-4">
           <div>
              <h3 className="text-lg font-bold text-slate-800 font-serif">Email Templates</h3>
              <p className="text-xs text-slate-500 mt-1">Manage automated customer notifications.</p>
           </div>
           <Button type="button" onClick={handleSave} isLoading={saving} className="shadow-lg shadow-brand-green/20 w-full sm:w-auto">
              Save Changes
           </Button>
        </div>
        
        {/* Horizontal Scrollable Tabs */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar px-6 border-b border-slate-200 bg-slate-50/50">
           {templates.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTemplateId(t.id)}
                className={`px-4 py-3 text-sm font-bold rounded-t-lg border-t border-x transition-all whitespace-nowrap relative top-[1px] ${
                   selectedTemplateId === t.id 
                   ? 'bg-white border-slate-200 text-brand-green z-10' 
                   : 'bg-transparent border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                 {getTemplateLabel(t.name)}
              </button>
           ))}
        </div>
      </div>

      {selectedTemplate ? (
        <div className="flex-1 flex flex-col min-h-0 bg-white">
           {/* 2. Toolbar */}
           <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center bg-white z-20">
              <div className="flex-1 w-full">
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Subject Line</label>
                 <input 
                   type="text" 
                   name="subject"
                   value={selectedTemplate.subject}
                   onChange={handleChange}
                   className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-brand-green/10 outline-none bg-white"
                 />
              </div>
              
              <div className="flex items-end gap-3 w-full md:w-auto justify-end">
                 <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button type="button" onClick={() => setViewMode('edit')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'edit' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Code</button>
                    <button type="button" onClick={() => setViewMode('split')} className={`hidden md:block px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'split' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Split</button>
                    <button type="button" onClick={() => setViewMode('preview')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'preview' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Preview</button>
                 </div>
              </div>
           </div>

           {/* 3. Editor Area */}
           <div className="flex-1 flex min-h-0 relative">
              {/* Code Editor */}
              <div className={`flex-1 flex flex-col min-h-0 ${(viewMode === 'preview') ? 'hidden' : 'block'}`}>
                 <div className="bg-slate-900 px-4 py-2 flex justify-between items-center border-b border-slate-700">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">HTML Source</span>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                       <code className="text-[9px] bg-slate-800 text-brand-light px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap">{`{{name}}`}</code>
                       <code className="text-[9px] bg-slate-800 text-brand-light px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap">{`{{order_number}}`}</code>
                       <code className="text-[9px] bg-slate-800 text-brand-light px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap">{`{{total}}`}</code>
                    </div>
                 </div>
                 <textarea
                    name="bodyHtml"
                    value={selectedTemplate.bodyHtml}
                    onChange={handleChange}
                    className="flex-1 w-full bg-slate-900 text-slate-300 font-mono text-xs p-4 resize-none focus:outline-none leading-relaxed custom-scrollbar"
                    spellCheck={false}
                 />
              </div>

              {/* Preview Pane */}
              <div className={`flex-1 bg-gray-50 flex flex-col border-l border-slate-200 ${(viewMode === 'edit') ? 'hidden' : 'block'}`}>
                 <div className="bg-white px-4 py-2 border-b border-slate-200 flex justify-between items-center h-[37px]">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Preview</span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">Rendered with dummy data</span>
                 </div>
                 <div className="flex-1 p-4 overflow-hidden relative">
                    <div className="w-full h-full bg-white shadow-sm rounded border border-slate-200 overflow-hidden">
                       <iframe 
                          srcDoc={generatePreview(selectedTemplate.bodyHtml)}
                          className="w-full h-full border-0 block"
                          title="Preview"
                       />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400 bg-slate-50">
           {loading ? <div className="animate-spin h-6 w-6 border-2 border-brand-green rounded-full border-t-transparent"></div> : 'No templates found.'}
        </div>
      )}
    </div>
  );
};