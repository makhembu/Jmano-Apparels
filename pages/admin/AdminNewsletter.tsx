import React, { useEffect, useState } from 'react';
import { api } from '../../lib/db';
import { NewsletterSubscriber } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

export const AdminNewsletter: React.FC = () => {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = () => {
    setLoading(true);
    api.getNewsletterSubscribers()
      .then(setSubscribers)
      .catch(() => showToast('Failed to load subscribers', 'error'))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this subscriber?")) return;
    try {
      await api.deleteNewsletterSubscriber(id);
      showToast('Subscriber removed', 'success');
      fetchSubscribers();
    } catch (e) {
      showToast('Failed to remove subscriber', 'error');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Email', 'Name', 'Source', 'Subscribed At', 'Status'],
      ...subscribers.map(s => [
        s.email, 
        s.name || '', 
        s.source || 'Unknown', 
        new Date(s.subscribedAt).toISOString(), 
        s.isSubscribed ? 'Active' : 'Unsubscribed'
      ])
    ]
    .map(e => e.join(","))
    .join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `subscribers_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-serif">Newsletter Subscribers</h1>
        <Button onClick={handleExport} variant="outline" data-copilot-id="btn-export-subscribers">Export CSV</Button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subscribers.length === 0 ? (
               <tr>
                 <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No subscribers yet.</td>
               </tr>
            ) : subscribers.map(sub => (
              <tr key={sub.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.source || 'Website'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(sub.subscribedAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sub.isSubscribed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                     {sub.isSubscribed ? 'Subscribed' : 'Unsubscribed'}
                   </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                   <button onClick={() => handleDelete(sub.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};