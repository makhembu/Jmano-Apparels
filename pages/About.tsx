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
      const title = settings.aboutSeoTitle || `Our Story | Jambo Apparels`;
      const desc = settings.aboutSeoDescription || settings.mission || '';
      
      document.title = title;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) metaDescription.setAttribute('content', desc);
      
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', title);
    }
  }, [settings]);

  useEffect(() => {
    if (user) {
        setForm(f => ({...f, name: user.name, email: user.email}));
    }
  }, [user]);

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
    <div className="bg-slate-50 min-h-screen">
      {/* Editorial Header Section */}
      <section className="relative bg-brand-light overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
        {/* Decorative Gradients */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-brand-hope/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <span className="text-brand-green text-[11px] font-black uppercase tracking-[0.4em] mb-6 inline-block bg-white px-6 py-2 rounded-full shadow-sm border border-brand-green/10">
            Our Divine Purpose
          </span>
          <h1 className="text-5xl md:text-8xl font-serif font-bold text-brand-dark mb-8 tracking-tighter leading-none">
            The Jambo <span className="text-brand-green">Legacy</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 font-light max-w-3xl mx-auto leading-relaxed italic border-l-4 border-brand-hope pl-6 md:pl-0 md:border-l-0">
            "{settings.secondarySlogan}"
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20 space-y-12 md:space-y-24 pb-24">
        
        {/* Founder Section - Reduced roundedness to 2xl */}
        <section className="bg-white rounded-2xl shadow-2xl shadow-brand-dark/10 border border-slate-100 overflow-hidden">
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
               {/* Accent decoration */}
               <div className="absolute top-10 right-10 text-brand-hope opacity-10">
                  <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
               </div>

              <div className="mb-10 relative">
                <span className="text-brand-green font-black text-xs uppercase tracking-widest block mb-2">Message from the Heart</span>
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-dark leading-tight">{settings.founderName || "Linah Makembu"}</h2>
                <div className="w-20 h-1.5 bg-brand-hope mt-4 rounded-full"></div>
              </div>
              
              <div className="prose prose-slate max-w-none text-slate-600 font-light leading-relaxed text-base md:text-lg mb-10 whitespace-pre-wrap">
                {settings.founderBio || `Linah Makembu is the Founding Director of Jambo Apparels...`}
              </div>

              <div className="bg-brand-hope/10 border-l-4 border-brand-hope p-8 rounded-r-2xl rounded-bl-2xl">
                <blockquote className="text-brand-dark font-serif text-xl md:text-2xl italic leading-relaxed relative">
                  <span className="absolute -left-4 -top-4 text-brand-hope/30 text-7xl leading-none font-serif">“</span>
                  {settings.founderQuote || "Guided by honesty, excellence, and boldness..."}
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision - Reduced roundedness to 2xl */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <div className="group relative bg-brand-dark p-10 md:p-16 rounded-2xl text-white shadow-2xl shadow-brand-dark/30 flex flex-col justify-center transition-transform hover:-translate-y-2">
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
               <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </div>
            <h2 className="text-xs font-black uppercase tracking-[0.4em] mb-8 text-brand-hope">The Mission</h2>
            <p className="text-2xl md:text-3xl font-serif font-medium leading-relaxed relative z-10">
              {settings.mission}
            </p>
          </div>

          <div className="group relative bg-brand-testament p-10 md:p-16 rounded-2xl text-white shadow-2xl shadow-brand-testament/30 flex flex-col justify-center transition-transform hover:-translate-y-2">
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
               <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </div>
            <h2 className="text-xs font-black uppercase tracking-[0.4em] mb-8 text-brand-light">The Vision</h2>
            <p className="text-2xl md:text-3xl font-serif font-medium leading-relaxed relative z-10">
              {settings.vision}
            </p>
          </div>
        </section>

        {/* Core Values Section - Reduced roundedness to 2xl/xl */}
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
                       <span className="text-4xl font-serif font-black text-white">H</span>
                    </div>
                    <h3 className="font-black text-sm uppercase tracking-widest text-white mb-4">Honesty</h3>
                    <p className="text-white/90 text-sm md:text-base font-light leading-relaxed">
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
                    <p className="text-brand-dark/80 text-sm md:text-base font-light leading-relaxed">
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
                    <p className="text-white/90 text-sm md:text-base font-light leading-relaxed">
                      Courage to wear our scriptures and share the Gospel without compromise in the modern world.
                    </p>
                </div>
             </div>
          </div>
        </section>
        
        {/* Contact Form - Reduced roundedness to 2xl */}
        <section className="bg-brand-dark rounded-2xl overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-10 md:p-20 text-white flex flex-col justify-center">
               <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6">Get in Touch</h2>
               <p className="text-brand-light/70 text-lg md:text-xl font-light leading-relaxed mb-10">
                 Have a testimony to share or a question about our collection? We are here to serve our community.
               </p>
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                        <svg className="w-6 h-6 text-brand-hope" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                     </div>
                     <span className="font-medium text-brand-light">{settings.contactEmail || 'hello@jamboapparels.com'}</span>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                        <svg className="w-6 h-6 text-brand-hope" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                     </div>
                     <span className="font-medium text-brand-light">London, United Kingdom</span>
                  </div>
               </div>
            </div>

            <div className="bg-white p-8 md:p-16 lg:m-10 lg:rounded-2xl shadow-inner">
               <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Name</label>
                        <input 
                           type="text" placeholder="Simon Peter" required 
                           value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                           className="w-full border border-slate-200 bg-slate-50 rounded-xl p-4 text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green outline-none transition-all"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                        <input 
                           type="email" placeholder="peter@apostle.com" required 
                           value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                           className="w-full border border-slate-200 bg-slate-50 rounded-xl p-4 text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green outline-none transition-all"
                        />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                     <input 
                        type="text" placeholder="How can we help?" 
                        value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
                        className="w-full border border-slate-200 bg-slate-50 rounded-xl p-4 text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green outline-none transition-all"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message</label>
                     <textarea 
                        placeholder="Your testimony or inquiry..." rows={5} required
                        value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                        className="w-full border border-slate-200 bg-slate-50 rounded-2xl p-5 text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green outline-none transition-all"
                     />
                  </div>
                  <div className="pt-4">
                     <Button type="submit" fullWidth isLoading={sending} className="h-16 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-brand-green/20 hover:scale-[1.01] active:scale-95 transition-all">
                        Send Message
                     </Button>
                  </div>
               </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};