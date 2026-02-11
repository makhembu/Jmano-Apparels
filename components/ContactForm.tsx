
import React, { useState } from 'react';
import { api } from '../lib/db';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { useToast } from '../context/ToastContext';

export const ContactForm: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.submitContact(formData);
      showToast('Message sent successfully! We will get back to you soon.', 'success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (e) {
      showToast('Failed to send message. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-brand-green/5 border border-slate-100 p-8 md:p-12 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-light/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="text-center mb-10">
          <span className="text-brand-green font-bold text-xs uppercase tracking-widest mb-2 block">Reach Out</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-4">Get in Touch</h2>
          <p className="text-slate-500 font-medium max-w-xl mx-auto">
            Have a question about an order, a testimony to share, or just want to say hello? We'd love to hear from you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Your Name" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
              placeholder="e.g. Simon Peter"
              className="bg-slate-50 border-transparent focus:bg-white transition-colors"
            />
            <Input 
              label="Email Address" 
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required
              placeholder="you@example.com"
              className="bg-slate-50 border-transparent focus:bg-white transition-colors"
            />
          </div>
          <Input 
            label="Subject" 
            value={formData.subject}
            onChange={e => setFormData({...formData, subject: e.target.value})}
            placeholder="How can we help?"
            className="bg-slate-50 border-transparent focus:bg-white transition-colors"
          />
          <Textarea 
            label="Message" 
            value={formData.message}
            onChange={e => setFormData({...formData, message: e.target.value})}
            required
            rows={5}
            placeholder="Write your message here..."
            className="bg-slate-50 border-transparent focus:bg-white transition-colors"
          />
          <div className="text-center pt-4">
            <Button 
                type="submit" 
                isLoading={loading} 
                className="w-full md:w-auto px-12 py-4 text-sm shadow-xl shadow-brand-green/20"
                size="lg"
            >
                Send Message
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
