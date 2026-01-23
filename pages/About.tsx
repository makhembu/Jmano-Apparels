import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { api } from '../lib/db';
import { useToast } from '../context/ToastContext';

export const About: React.FC = () => {
  const { settings, user } = useApp();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  // Dynamic SEO
  useEffect(() => {
    if (settings) {
      const title = settings.aboutSeoTitle || `Our Mission & Vision | Jambo Apparels`;
      const desc = settings.aboutSeoDescription || settings.vision || '';
      
      document.title = title;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) metaDescription.setAttribute('content', desc);
      
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', title);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.submitContact(form);
      showToast('Message sent! We will get back to you shortly.', 'success');
      setForm({ ...form, message: '', subject: '' });
    } catch (e) {
      showToast('Failed to send message.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-serif font-bold text-brand-dark mb-4">Our Mission & Vision</h1>
        <p className="text-xl text-gray-600 italic">"{settings.secondarySlogan}"</p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg mb-10 border-t-4 border-brand-green">
        <h2 className="text-2xl font-bold mb-4 text-brand-dark">Mission</h2>
        <p className="text-lg text-gray-700 leading-relaxed">{settings.mission}</p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg mb-10 border-t-4 border-brand-hope">
        <h2 className="text-2xl font-bold mb-4 text-brand-dark">Vision</h2>
        <p className="text-lg text-gray-700 leading-relaxed">{settings.vision}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-16">
         <div className="bg-brand-light p-6 rounded-lg">
           <div className="text-4xl font-bold text-brand-green mb-2">H</div>
           <h3 className="font-bold text-lg">Honesty</h3>
         </div>
         <div className="bg-brand-light p-6 rounded-lg">
           <div className="text-4xl font-bold text-brand-green mb-2">E</div>
           <h3 className="font-bold text-lg">Excellence</h3>
         </div>
         <div className="bg-brand-light p-6 rounded-lg">
           <div className="text-4xl font-bold text-brand-green mb-2">B</div>
           <h3 className="font-bold text-lg">Boldness</h3>
         </div>
      </div>

      {/* Contact Form */}
      <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-brand-dark text-center">Get in Touch</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" placeholder="Name" required 
                value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full border rounded p-3 bg-white text-gray-900"
              />
              <input 
                type="email" placeholder="Email" required 
                value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full border rounded p-3 bg-white text-gray-900"
              />
           </div>
           <input 
             type="text" placeholder="Subject" 
             value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
             className="w-full border rounded p-3 bg-white text-gray-900"
           />
           <textarea 
             placeholder="How can we help you?" rows={4} required
             value={form.message} onChange={e => setForm({...form, message: e.target.value})}
             className="w-full border rounded p-3 bg-white text-gray-900"
           />
           <Button type="submit" fullWidth isLoading={sending}>Send Message</Button>
        </form>
      </div>
    </div>
  );
};