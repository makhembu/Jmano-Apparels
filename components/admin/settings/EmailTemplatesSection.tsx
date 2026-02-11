
import React, { useState, useEffect } from 'react';
import { EmailTemplate } from '../../../types';
import { api } from '../../../lib/db';
import { Button } from '../../ui/Button';
import { useToast } from '../../../context/ToastContext';
import { useShop } from '../../../context/ShopContext';

export const EmailTemplatesSection: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'whatsapp'>('edit');
  
  // Modal States
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmailInput, setTestEmailInput] = useState('');

  const { showToast } = useToast();
  const { settings } = useShop();

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
        bodyHtml: selectedTemplate.bodyHtml,
        whatsappBodyText: selectedTemplate.whatsappBodyText
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
      case 'admin_new_order': return 'Admin: Sale';
      case 'contact_notification_admin': return 'Admin: Contact';
      case 'contact_autoreply': return 'User: Contact Reply';
      case 'newsletter_welcome': return 'Newsletter Welcome';
      case 'order_processing': return 'Processing';
      case 'order_refunded': return 'Refunded';
      case 'return_requested': return 'Return Req';
      case 'return_approved': return 'Return OK';
      case 'return_rejected': return 'Return No';
      case 'admin_return_alert': return 'Admin: Return';
      case 'guest_order_account_created': return 'Guest Acct';
      default: return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const generatePreview = (text: string) => {
    let preview = text || '';
    const dummyData: Record<string, string> = {
      // Branding Globals
      '{{logo_url}}': settings.logoImage || 'https://i.imgur.com/pkaScEv.png',
      '{{shop_url}}': 'https://jamboapparels.com',
      '{{contact_email}}': settings.contactEmail || 'support@jamboapparels.com',
      '{{shop_link}}': 'https://jamboapparels.com/shop',
      
      // Dynamic Data
      '{{name}}': 'Sarah Jenkins',
      '{{order_number}}': 'ORD-2026-8892',
      '{{total}}': '45.00',
      '{{tracking_number}}': 'GB-123456789',
      '{{order_link}}': '#',
      '{{customer_name}}': 'Sarah Jenkins',
      '{{sender_name}}': 'John Doe',
      '{{sender_email}}': 'john@example.com',
      '{{subject}}': 'Question about bulk ordering',
      '{{message}}': 'Hi, I would like to order 50 hoodies for our youth group. Do you offer bulk discounts?',
      '{{admin_link}}': '#',
      '{{email}}': 'sarah@example.com',
      '{{generated_password}}': 'TempPass123!',
      '{{login_link}}': 'https://jamboapparels.com/login',
      '{{return_reason}}': 'Size too small',
      '{{rejection_reason}}': 'Item was washed',
      '{{status}}': 'Processing',
      '{{product_id}}': '123'
    };

    Object.entries(dummyData).forEach(([key, value]) => {
      preview = preview.split(key).join(value);
    });

    return preview; 
  };

  const openTestModal = () => {
    if (!selectedTemplate) return;
    setTestEmailInput(settings.contactEmail || '');
    setShowTestModal(true);
  };

  const executeSendTest = async (e?: React.SyntheticEvent) => {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    if (!selectedTemplate || !testEmailInput) return;

    setIsSendingTest(true);
    try {
      const populatedHtml = generatePreview(selectedTemplate.bodyHtml);
      const subject = generatePreview(selectedTemplate.subject);

      const result = await api.sendTestEmail(testEmailInput, subject, populatedHtml);
      
      if (result.success) {
        showToast(result.message || `Test email sent to ${testEmailInput}`, 'success');
        setShowTestModal(false);
      } else {
        showToast(result.message || 'Failed to send test email', 'error');
      }
    } catch (e) {
      showToast('Error sending test email', 'error');
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 overflow-hidden flex flex-col h-[800px] md:h-[900px] relative">
      {/* 1. Header with Template Tabs */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-4 gap-4">
           <div>
              <h3 className="text-lg font-bold text-slate-800 font-serif">Message Templates</h3>
              <p className="text-xs text-slate-500 mt-1">Manage Email and WhatsApp notifications.</p>
           </div>
           <div className="flex gap-3 w-full sm:w-auto">
               <Button type="button" variant="outline" onClick={openTestModal} className="bg-white border-slate-300 text-slate-700 hover:border-brand-green hover:text-brand-green">
                  Send Test (Email)
               </Button>
               <Button type="button" onClick={handleSave} isLoading={saving} className="shadow-lg shadow-brand-green/20">
                  Save Changes
               </Button>
           </div>
        </div>
        
        {/* Horizontal Scrollable Tabs */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar px-6 border-b border-slate-200 bg-slate-50/50">
           {templates.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTemplateId(t.id)}
                className={`px-4 py-3 text-xs font-bold rounded-t-lg border-t border-x transition-all whitespace-nowrap relative top-[1px] ${
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
                 {viewMode !== 'whatsapp' && (
                    <>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Email Subject Line</label>
                    <input 
                    type="text" 
                    name="subject"
                    value={selectedTemplate.subject}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-brand-green/10 outline-none bg-white"
                    />
                    </>
                 )}
                 {viewMode === 'whatsapp' && (
                     <div className="flex items-center gap-2 text-green-600">
                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.894-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                         <span className="font-bold text-sm">Editing WhatsApp Template</span>
                     </div>
                 )}
              </div>
              
              <div className="flex items-end gap-3 w-full md:w-auto justify-end">
                 <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button type="button" onClick={() => setViewMode('edit')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'edit' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Email HTML</button>
                    <button type="button" onClick={() => setViewMode('whatsapp')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'whatsapp' ? 'bg-green-100 text-green-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>WhatsApp</button>
                    <button type="button" onClick={() => setViewMode('preview')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'preview' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Preview</button>
                 </div>
              </div>
           </div>

           {/* 3. Editor Area */}
           <div className="flex-1 flex min-h-0 relative">
              {/* WhatsApp Editor */}
              {viewMode === 'whatsapp' && (
                 <div className="flex-1 p-6 bg-slate-50 overflow-y-auto">
                     <div className="max-w-xl mx-auto">
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-green-100">
                             <div className="flex items-center gap-2 mb-4">
                                <span className="text-green-600">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.894-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                                </span>
                                <h4 className="font-bold text-gray-800">WhatsApp Message</h4>
                             </div>
                             <textarea
                                name="whatsappBodyText"
                                value={selectedTemplate.whatsappBodyText || ''}
                                onChange={handleChange}
                                rows={8}
                                className="w-full border border-slate-300 rounded p-3 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-sans"
                                placeholder="Enter message text here. Use {{variable}} for dynamic content."
                             />
                             <div className="bg-blue-50 p-3 rounded-lg mt-4 border border-blue-100">
                                <p className="text-xs text-blue-800 font-medium">
                                   <strong>Note:</strong> Standard WhatsApp messages are text-only. Links will be automatically clickable. 
                                </p>
                             </div>
                        </div>

                        {/* Live Preview for WhatsApp */}
                        <div className="mt-8">
                             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">Mobile Preview</h4>
                             <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 max-w-sm mx-auto overflow-hidden">
                                <div className="bg-[#008069] h-12 flex items-center px-4">
                                   <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                                   <div className="ml-3">
                                      <div className="h-2 w-24 bg-white/40 rounded"></div>
                                   </div>
                                </div>
                                <div className="bg-[#E5DDD5] p-4 min-h-[200px] flex flex-col">
                                   <div className="bg-white p-2.5 rounded-lg rounded-tl-none shadow-sm self-start max-w-[85%] text-sm text-slate-900 relative">
                                      <div className="whitespace-pre-wrap">
                                         {generatePreview(selectedTemplate.whatsappBodyText || 'No WhatsApp template content.')}
                                      </div>
                                      <span className="text-[10px] text-gray-400 block text-right mt-1">10:30 AM</span>
                                   </div>
                                </div>
                             </div>
                        </div>
                     </div>
                 </div>
              )}

              {/* Code Editor for Email */}
              <div className={`flex-1 flex flex-col min-h-0 ${(viewMode === 'preview' || viewMode === 'whatsapp') ? 'hidden' : 'block'}`}>
                 <div className="bg-slate-900 px-4 py-2 border-b border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] font-mono text-slate-400 uppercase">Branding Globals (Auto-Injected)</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                       <code className="text-[9px] bg-indigo-900/50 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800 whitespace-nowrap cursor-help" title="Your uploaded Logo URL">{'{{logo_url}}'}</code>
                       <code className="text-[9px] bg-indigo-900/50 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800 whitespace-nowrap cursor-help" title="https://jamboapparels.com">{'{{shop_url}}'}</code>
                       <code className="text-[9px] bg-indigo-900/50 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800 whitespace-nowrap cursor-help" title="Your Support Email">{'{{contact_email}}'}</code>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2 mb-2">
                       <span className="text-[10px] font-mono text-slate-400 uppercase">Context Variables</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                       {/* Common Variables */}
                       <code className="text-[9px] bg-slate-800 text-brand-light px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap" title="Customer Name">{'{{name}}'}</code>
                       
                       {/* Context Specific Variables Hint */}
                       {selectedTemplate.name.includes('order') && (
                          <>
                             <code className="text-[9px] bg-slate-800 text-brand-light px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap" title="Order #">{'{{order_number}}'}</code>
                             <code className="text-[9px] bg-slate-800 text-brand-light px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap" title="Total Price">{'{{total}}'}</code>
                             <code className="text-[9px] bg-slate-800 text-brand-light px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap" title="View Order Link">{'{{order_link}}'}</code>
                          </>
                       )}
                       {selectedTemplate.name.includes('shipped') && (
                          <code className="text-[9px] bg-slate-800 text-brand-light px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap" title="Tracking Number">{'{{tracking_number}}'}</code>
                       )}
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

              {/* Preview Pane for Email */}
              <div className={`flex-1 bg-gray-50 flex flex-col border-l border-slate-200 ${(viewMode === 'edit' || viewMode === 'whatsapp') ? 'hidden' : 'block'}`}>
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
                          sandbox="allow-same-origin" // SECURITY: Restrict scripts in preview
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

      {/* Test Email Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-brand-dark">Send Test Email</h3>
              <p className="text-sm text-slate-500 mt-1">
                Sending preview of <strong>{getTemplateLabel(selectedTemplate?.name || '')}</strong>
              </p>
            </div>
            {/* Replaced form with div to avoid nested forms */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Recipient</label>
                <input
                  type="email"
                  required
                  value={testEmailInput}
                  onChange={(e) => setTestEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        executeSendTest();
                    }
                  }}
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-green/20 outline-none"
                  placeholder="you@example.com"
                />
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500 leading-relaxed border border-gray-100">
                The email will be populated with placeholder data (e.g. Order #ORD-2026...) to show you the layout.
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowTestModal(false)} disabled={isSendingTest}>
                  Cancel
                </Button>
                <Button type="button" onClick={executeSendTest} isLoading={isSendingTest}>
                  Send Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
