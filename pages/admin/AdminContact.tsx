import React, { useEffect, useState } from 'react';
import { api } from '../../lib/db';
import { ContactSubmission } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

export const AdminContact: React.FC = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = () => {
    setLoading(true);
    api.getContactSubmissions()
      .then(setSubmissions)
      .catch(() => showToast('Failed to load messages', 'error'))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Delete this message?")) return;
    try {
      await api.deleteContactSubmission(id);
      showToast('Message deleted', 'success');
      // If deleted active message, clear selection
      if (selectedId === id) setSelectedId(null);
      // Optimistic update
      setSubmissions(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      showToast('Failed to delete message', 'error');
    }
  };

  const handleRowClick = async (id: string, currentReadStatus: boolean) => {
      setSelectedId(selectedId === id ? null : id);
      if (!currentReadStatus) {
          try {
              await api.markContactAsRead(id);
              setSubmissions(prev => prev.map(s => s.id === id ? { ...s, isRead: true } : s));
          } catch(e) {
              console.error("Failed to mark read");
          }
      }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold font-serif mb-6">Contact Submissions</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
            {submissions.length === 0 ? (
                <li className="px-6 py-4 text-center text-sm text-gray-500">No messages found.</li>
            ) : submissions.map(sub => (
                <li key={sub.id} className={`transition-colors duration-150 ${!sub.isRead ? 'bg-blue-50' : 'bg-white'}`}>
                    <div 
                        onClick={() => handleRowClick(sub.id, sub.isRead)}
                        className="px-4 sm:px-6 py-4 cursor-pointer hover:bg-gray-50 block"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                             <div className="flex items-center gap-3 overflow-hidden">
                                <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${sub.isRead ? 'bg-transparent' : 'bg-blue-600'}`}></span>
                                <h3 className="text-sm font-bold text-gray-900 truncate">
                                    {sub.name} <span className="font-normal text-gray-500 hidden sm:inline">&lt;{sub.email}&gt;</span>
                                </h3>
                             </div>
                             <div className="text-sm text-gray-500 flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                                <span className="text-xs">{new Date(sub.createdAt).toLocaleString()}</span>
                                <button 
                                    onClick={(e) => handleDelete(e, sub.id)} 
                                    className="text-red-500 hover:text-red-700 text-xs px-2 py-1 border border-red-200 rounded hover:bg-red-50"
                                >
                                    Delete
                                </button>
                             </div>
                        </div>
                        <p className="text-sm text-gray-500 sm:hidden mb-1">{sub.email}</p>
                        <p className="text-sm font-medium text-gray-900 truncate mb-1">{sub.subject || '(No Subject)'}</p>
                        
                        {/* Expanded Content */}
                        {selectedId === sub.id && (
                            <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-700 animate-fade-in">
                                <p className="whitespace-pre-wrap">{sub.message}</p>
                                <div className="mt-4 pt-2">
                                    <a href={`mailto:${sub.email}?subject=Re: ${sub.subject || 'Your inquiry'}`} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-brand-green hover:bg-brand-dark">
                                        Reply via Email
                                    </a>
                                </div>
                            </div>
                        )}
                        
                        {/* Preview when collapsed */}
                        {selectedId !== sub.id && (
                            <p className="text-sm text-gray-500 truncate">{sub.message}</p>
                        )}
                    </div>
                </li>
            ))}
        </ul>
      </div>
    </div>
  );
};