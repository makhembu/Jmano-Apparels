import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { api } from '../lib/db';
import { useToast } from '../context/ToastContext';

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

  // Dynamic SEO
  useEffect(() => {
    if (settings) {
      const title = settings.aboutSeoTitle || `Our Story | Jambo Apparels`;
      const desc = settings.aboutSeoDescription || settings.mission || '';
      
      document.title = title;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) metaDescription.setAttribute('content', desc);
      
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', title);
    }
  }, [settings]);

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
      setForm({ ...form, message: '' }); // Reset message but keep name/email
    } catch (e) {
      showToast('Failed to send message. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Unified Branded Header - Matches Blog/Shop */}
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
        
        {/* Founder Section */}
        <section className="bg-white rounded-2xl shadow-2xl shadow-brand-dark/5 border border-slate-100 overflow-hidden">
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
        </section>

        {/* Mission & Vision */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <div className="group relative bg-brand-dark p-10 md:p-16 rounded-2xl text-white shadow-2xl shadow-brand-dark/30 flex flex-col justify-center transition-transform hover:-translate-y-2">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] mb-8 text-brand-hope">The Mission</h2>
            <p className="text-2xl md:text-3xl font-serif font-medium leading-relaxed relative z-10">
              {settings.mission}
            </p>
          </div>

          <div className="group relative bg-brand-testament p-10 md:p-16 rounded-2xl text-brand-dark shadow-2xl shadow-brand-testament/30 flex flex-col justify-center transition-transform hover:-translate-y-2">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] mb-8 text-white">The Vision</h2>
            <p className="text-2xl md:text-3xl font-serif font-medium leading-relaxed relative z-10">
              {settings.vision}
            </p>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="py-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
             <span className="text-brand-green text-[10px] font-black uppercase tracking-[0.3em] mb-4 inline-block">The Foundation</span>
             <h2 className="text-4xl md:text-6xl font-serif font-bold text-brand-dark mb-6 tracking-tight">Core Values</h2>
             <div className="h-1 w-24 bg-brand-hope mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
             {/* Honesty Card */}
             <div className="bg-white p-1 rounded-2xl shadow-xl hover:shadow-2xl transition-all group overflow-hidden border border-slate-100">
                <div className="bg-brand-humility p-10 rounded-xl text-center h-full flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm group-hover:scale-110 transition-transform">
                       <span className="text-4xl font-serif font-black text-brand-dark">H</span>
                    </div>
                    <h3 className="font-black text-sm uppercase tracking-widest text-brand-dark mb-4">Honesty</h3>
                    <p className="text-brand-dark/90 text-sm md:text-base font-medium leading-relaxed">
                      Authentic faith, transparent practices, and integrity in every stitch we thread for our community.
                    </p>
                </div>
             </div>

             {/* Excellence Card */}
             <div className="bg-white p-1 rounded-2xl shadow-xl hover:shadow-2xl transition-all group overflow-hidden border border-slate-100">
                <div className="bg-brand-hope p-10 rounded-xl text-center h-full flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/30 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm group-hover:scale-110 transition-transform">
                       <span className="text-4xl font-serif font-black text-brand-dark">E</span>
                    </div>
                    <h3 className="font-black text-sm uppercase tracking-widest text-brand-dark mb-4">Excellence</h3>
                    <p className="text-brand-dark/80 text-sm md:text-base font-medium leading-relaxed">
                      Striving for the highest quality to reflect the character of God in everything we create.
                    </p>
                </div>
             </div>

             {/* Boldness Card */}
             <div className="bg-white p-1 rounded-2xl shadow-xl hover:shadow-2xl transition-all group overflow-hidden border border-slate-100">
                <div className="bg-brand-patience p-10 rounded-xl text-center h-full flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm group-hover:scale-110 transition-transform">
                       <span className="text-4xl font-serif font-black text-white">B</span>
                    </div>
                    <h3 className="font-black text-sm uppercase tracking-widest text-white mb-4">Boldness</h3>
                    <p className="text-white/90 text-sm md:text-base font-medium leading-relaxed">
                      Courage to wear our scriptures and share the Gospel without compromise in the modern world.
                    </p>
                </div>
             </div>
          </div>
        </section>
        
        {/* Contact Form Section (Restored & Togglable) */}
        {settings.enableContactForm && (
          <section className="bg-brand-dark text-white rounded-3xl overflow-hidden shadow-2xl shadow-brand-green/20">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-10 md:p-20 flex flex-col justify-center bg-brand-dark relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                
                <h3 className="text-3xl md:text-5xl font-serif font-bold mb-6 relative z-10">Let's Connect</h3>
                <p className="text-brand-light/80 text-lg mb-12 font-light leading-relaxed relative z-10">
                  Whether you have a question about our products, a testimony to share, or just want to say jambo, we're here to listen.
                </p>
                
                <div className="space-y-6 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-brand-hope">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-brand-light/50 mb-1">Email Us</p>
                      <p className="text-lg font-medium">{settings.contactEmail || "hello@jamboapparels.com"}</p>
                    </div>
                  </div>
                  
                  {settings.contactPhone && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-brand-hope">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-brand-light/50 mb-1">Call Us</p>
                        <p className="text-lg font-medium">{settings.contactPhone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-10 md:p-20 bg-white text-slate-900">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Your Name</label>
                    <input 
                      type="text" 
                      required 
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full border-b-2 border-slate-200 py-3 text-lg font-medium text-slate-900 focus:border-brand-green outline-none bg-transparent transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                      className="w-full border-b-2 border-slate-200 py-3 text-lg font-medium text-slate-900 focus:border-brand-green outline-none bg-transparent transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message</label>
                    <textarea 
                      required 
                      rows={4}
                      value={form.message}
                      onChange={e => setForm({...form, message: e.target.value})}
                      className="w-full border-b-2 border-slate-200 py-3 text-lg font-medium text-slate-900 focus:border-brand-green outline-none bg-transparent transition-colors resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>
                  <div className="pt-6">
                    <Button type="submit" isLoading={submitting} fullWidth className="h-16 rounded-xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-brand-green/20">
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