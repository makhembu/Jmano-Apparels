import React, { useState, useEffect } from 'react';
import { PayPalAdminService } from '../../../lib/services/paypal-admin';
import { Button } from '../../ui/Button';
import { useToast } from '../../../context/ToastContext';
import { LoadingSpinner } from '../../ui/LoadingSpinner';

interface PayPalWebhookManagerProps {
    currentWebhookId?: string;
    onUpdate: (newId: string | null) => void; // Trigger parent refresh with new ID
}

export const PayPalWebhookManager: React.FC<PayPalWebhookManagerProps> = ({ currentWebhookId, onUpdate }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [webhookData, setWebhookData] = useState<any>(null);
    const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

    // On mount, verify the current ID against PayPal
    useEffect(() => {
        if (!currentWebhookId) return;
        verifyWebhook(currentWebhookId);
    }, [currentWebhookId]);

    const verifyWebhook = async (id: string) => {
        setLoading(true);
        try {
            const list = await PayPalAdminService.listWebhooks();
            const found = list.find((w: any) => w.id === id);
            if (found) {
                setWebhookData(found);
            } else {
                // DB has ID but PayPal doesn't (deleted externally)
                setWebhookData(null);
                // Sync parent state to null since it's invalid
                onUpdate(null);
            }
        } catch (e) {
            console.error(e);
            // Don't show toast on load failure to avoid spam, just log
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        setLoading(true);
        try {
            // Auto-detect production URL
            const origin = window.location.origin;
            if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
                if (!window.confirm("You are on localhost. PayPal cannot send webhooks to localhost without a tunnel (like Ngrok). Create anyway?")) {
                    setLoading(false);
                    return;
                }
            }

            const newWebhook = await PayPalAdminService.createWebhook(origin);
            setWebhookData(newWebhook);
            onUpdate(newWebhook.id);
            showToast('Webhook registered successfully!', 'success');
        } catch (e: any) {
            showToast(e.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure? This will stop automatic order updates.")) return;
        setLoading(true);
        try {
            if (webhookData?.id) {
                await PayPalAdminService.deleteWebhook(webhookData.id);
            }
            setWebhookData(null);
            onUpdate(null);
            showToast('Webhook removed', 'success');
        } catch (e: any) {
            showToast(e.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleTest = async () => {
        if (!webhookData?.id) return;
        setStatus('testing');
        try {
            await PayPalAdminService.simulateEvent(webhookData.id);
            setStatus('success');
            showToast('Test event fired! Check server logs.', 'success');
            setTimeout(() => setStatus('idle'), 3000);
        } catch (e: any) {
            setStatus('error');
            showToast(e.message, 'error');
        }
    };

    if (loading && !webhookData && currentWebhookId) return <div className="p-4"><LoadingSpinner /></div>;

    return (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 mt-4">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        Real-Time Events
                        {webhookData ? (
                            <span className="bg-green-100 text-green-700 text-[9px] px-2 py-0.5 rounded-full border border-green-200">Active</span>
                        ) : (
                            <span className="bg-gray-200 text-gray-500 text-[9px] px-2 py-0.5 rounded-full">Inactive</span>
                        )}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-md">
                        {webhookData 
                            ? "PayPal is configured to notify your store when payments are captured, denied, or refunded."
                            : "Enable webhooks to automatically update order statuses when customers pay."}
                    </p>
                </div>
                {webhookData && (
                    <div className="text-right">
                        <p className="text-[10px] font-mono text-slate-400">ID: {webhookData.id}</p>
                    </div>
                )}
            </div>

            {!webhookData ? (
                <div className="flex flex-col gap-3">
                    <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-xs text-blue-800">
                        <strong>Ready to Connect:</strong> We will register <code>{window.location.origin}/api/paypal-webhook</code> with your PayPal account.
                    </div>
                    <Button onClick={handleCreate} isLoading={loading} variant="secondary" className="w-full sm:w-auto shadow-sm">
                        Activate Webhooks
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex flex-col gap-2 p-3 bg-white border border-slate-200 rounded-lg">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-700">Target URL</span>
                            <span className="font-mono text-slate-500 bg-slate-100 px-1 rounded">{webhookData.url}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {webhookData.event_types?.map((evt: any) => (
                                <span key={evt.name} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                                    {evt.name}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2 border-t border-slate-200/50">
                        <Button 
                            onClick={handleTest} 
                            disabled={status === 'testing'} 
                            variant="outline" 
                            className={`flex-1 text-xs ${status === 'success' ? 'border-green-500 text-green-600 bg-green-50' : ''}`}
                        >
                            {status === 'testing' ? 'Firing...' : status === 'success' ? '✓ Signal Received' : 'Test Connection'}
                        </Button>
                        <Button 
                            onClick={handleDelete} 
                            disabled={loading} 
                            className="bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shadow-none text-xs px-4"
                        >
                            Disconnect
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};