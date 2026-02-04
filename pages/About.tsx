
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { api } from '../lib/db';
import { useToast } from '../context/ToastContext';
import { SEO } from '../components/SEO';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardContent } from '../components/ui/Card';

export const About: React.FC = () => {
  const { settings, user } = useApp();
  const { showToast } = useToast();
  
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setForm(prev => ({ ...prev, name: user.name, email: user.email }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.submitContact(form);
      showToast('Message sent! We will be in touch shortly.', 'success');
      setForm({ ...form, message: '' }); 
    } catch (e) {
      showToast('Failed to send message. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const seoTitle = settings.aboutSeoTitle || `Our Story | Jambo Apparels`;
  const seoDesc = settings.aboutSeoDescription || settings.mission;

  return (
    <div className="bg-slate-50 min-h-screen">
      <SEO 
        title={seoTitle}
        description={seoDesc}
        type="website"
      />

      <header className="relative bg-brand-dark pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden text-center border-b border-brand-green/20">
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <span className="text-brand-dark text-[10px] font-black uppercase tracking-[0.5em] mb-4 inline-block bg-brand-hope px-6 py-2 rounded-full shadow-lg">
            Our Divine Purpose
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 tracking-tighter leading-none">
            The Jambo <span className="text-brand-humility">Legacy</span>
          </h1>
          <p className="text-base md:text-xl text-brand-light font-light max-w-2xl mx-auto leading-relaxed italic border-l-4 md:border-l-0 border-brand-hope pl-6 md:pl-0">
            "{settings.secondarySlogan}"
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20 space-y-12 md:space-y-24 pb-24">
        
        <Card className="shadow-2xl shadow-brand-dark/5 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-5 relative group">
              <img 
                src={settings.founderImage || "https://i.imgur.com/EuNbPGG.png"} 
                alt={settings.founderName} 
                className="w-full h-full object-cover aspect-[4/5] lg:aspect-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-10">
                 <p className="text-white text-xs font-black uppercase tracking-widest">Est. 2019</p>
              </div>
            </div>
            
            <div className="lg:col-span-7 p-8 md:p-16 flex flex-col justify-center bg-white relative">
              <div className="mb-10 relative">
                <span className="text-brand-green font-black text-xs uppercase tracking-widest block mb-2">Message from the Heart</span>
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-dark leading-tight">{settings.founderName || "Linah Makembu"}</h2>
                <div className="w-20 h-1.5 bg-brand-hope mt-4 rounded-full"></div>
              </div>
              
              <div className="prose prose-slate max-w-none text-slate-600 font-light leading-relaxed text-base md:text-lg mb-10 whitespace-pre-wrap">
                {settings.founderBio || `Linah Makembu is the Founding Director of Jambo Apparels...`}
              </div>

              <div className="bg-brand-testament/10 border-l-4 border-brand-testament p-8 rounded-r-2xl rounded-bl-2xl">
                <blockquote className="text-brand-dark font-serif text-xl md:text-2xl italic leading-relaxed relative">
                  <span className="absolute -left-4 -top-4 text-brand-testament text-7xl leading-none font-serif opacity-30">“</span>
                  {settings.founderQuote || "Guided by honesty, excellence, and boldness..."}
                </blockquote>
              </div>
            </div>
          </div>
        </Card>

        {settings.enableContactForm && (
          <section className="bg-brand-dark text-white rounded-3xl overflow-hidden shadow-2xl shadow-brand-green/20">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-10 md:p-20 flex flex-col justify-center bg-brand-dark relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="text-3xl md:text-5xl font-serif font-bold mb-6 relative z-10">Let's Connect</h3>
                <p className="text-brand-light/80 text-lg mb-12 font-light leading-relaxed relative z-10">
                  Whether you have a question about our products, a testimony to share, or just want to say jambo, we're here to listen.
                </p>
              </div>

              <div className="p-10 md:p-20 bg-white text-slate-900">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input 
                    label="Your Name"
                    required
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="John Doe"
                  />
                  <Input 
                    label="Email Address"
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    placeholder="john@example.com"
                  />
                  <Textarea 
                    label="Message"
                    required
                    rows={4}
                    value={form.message}
                    onChange={e => setForm({...form, message: e.target.value})}
                    placeholder="How can we help you?"
                  />
                  <div className="pt-6">
                    <Button type="submit" isLoading={submitting} fullWidth size="lg">
                      Send Message
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
