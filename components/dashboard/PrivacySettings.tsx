
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/db';
import { Button } from '../ui/Button';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export const PrivacySettings: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleExportData = async () => {
    if (!user) return;
    setDownloading(true);
    try {
      // Fetch all data
      const [profile, orders, addresses] = await Promise.all([
        api.getUserProfile(user.id),
        api.getOrders(user.id),
        api.getUserAddresses(user.id)
      ]);

      const exportData = {
        user: profile,
        orders,
        addresses,
        exportedAt: new Date().toISOString(),
        note: "Exported from Jambo Apparels in accordance with GDPR Right to Access."
      };

      // Trigger download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `jambo-data-export-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Data export started', 'success');
    } catch (e) {
      showToast('Failed to export data', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you ABSOLUTELY sure? This will permanently delete your account details. Your order history will be anonymized for tax purposes. This cannot be undone.")) return;
    if (!user) return;

    setDeleting(true);
    try {
      // Call secure DB function
      const { error } = await api.deleteUserAccount(user.id);
      if (error) throw new Error(error.message);

      showToast('Account deleted successfully.', 'success');
      await logout();
      navigate('/');
    } catch (e: any) {
      showToast(e.message || 'Failed to delete account', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Your Data Rights</h3>
        <p className="text-sm text-gray-500 mb-6">
          In accordance with GDPR, you have the right to access your personal data and the right to be forgotten.
        </p>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-6">
            <div>
              <h4 className="font-bold text-sm text-gray-800">Export Personal Data</h4>
              <p className="text-xs text-gray-500 mt-1">Download a copy of your profile, orders, and addresses (JSON).</p>
            </div>
            <Button variant="outline" onClick={handleExportData} isLoading={downloading} className="whitespace-nowrap">
              Download Data
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="font-bold text-sm text-red-600">Delete Account</h4>
              <p className="text-xs text-gray-500 mt-1">
                Permanently remove your account and personal details. Past orders will be anonymized.
              </p>
            </div>
            <Button variant="danger" onClick={handleDeleteAccount} isLoading={deleting} className="whitespace-nowrap">
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
