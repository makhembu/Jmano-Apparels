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
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-20 animate-fade-in">
        {/* Editorial Header */}
        <header className="text-center max-w-3xl mx-auto mb-12 md:mb-20">
          <span className="text-brand-green text-[10px] font-black uppercase tracking-[0.3em] bg-brand-light px-4 py-1.5 rounded-full mb-4 inline-block">
            Our Identity
          </span>
          <h1 className="text-4xl md:text-7xl font-serif font-bold text-brand-dark mb-6 tracking-tight">
            Our Story
          </h1>
          <p className="text-lg md:text-xl text-gray-500 font-light leading-relaxed italic">
            "{settings.secondarySlogan}"
          </p>
        </header>

        <div className="space-y-8 md:space-y-16">
          {/* Founder Section - Optimized Grid */}
          <section className="bg-white p-6 md:p-16 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center">
              <div className="md:col-span-4 flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-4 bg-brand-light/30 rounded-3xl -rotate-3 transition-transform group-hover:rotate-0"></div>
                  <img 
                    src={settings.founderImage || "https://i.imgur.com/EuNbPGG.png"} 
                    alt={`${settings.founderName || 'Founder'} of Jambo Apparels`} 
                    className="relative rounded-2xl shadow-2xl w-48 md:w-full h-auto object-cover aspect-[4/5] border-4 border-white"
                  />
                </div>
              </div>
              <div className="md:col-span-8 space-y-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-dark mb-1">A Word from Our Founder</h2>
                  <h3 className="text-xl md:text-2xl font-bold text-brand-green">{settings.founderName || "Linah Makembu"}</h3>
                </div>
                
                <div className="prose prose-slate max-w-none text-slate-600 font-light leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                  {settings.founderBio || `Linah Makembu is the Founding Director of Jambo Apparels...`}
                </div>

                <div className="pt-6 border-t border-slate-50">
                  <blockquote className="text-slate-800 font-serif text-lg md:text-xl italic leading-relaxed relative pl-8">
                    <span className="absolute left-0 top-0 text-brand-green/20 text-6xl leading-none font-serif">“</span>
                    {settings.founderQuote || "Guided by honesty, excellence, and boldness..."}
                  </blockquote>
                </div>
              </div>
            </div>
          </section>

          {/* Mission & Vision - Tighter on Mobile */}
          <section className="grid md:grid-cols-2 gap-6 md:gap-10">
            <div className="bg-brand-dark p-8 md:p-12 rounded-[2.5rem] text-white shadow-2xl shadow-brand-dark/20 flex flex-col justify-center">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-6 text-brand-hope opacity-80">Our Mission</h2>
              <p className="text-xl md:text-2xl font-serif font-medium leading-relaxed">
                {settings.mission}
              </p>
            </div>
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 flex flex-col justify-center">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-6 text-brand-green">Our Vision</h2>
              <p className="text-xl md:text-2xl font-serif font-medium text-brand-dark leading-relaxed">
                {settings.vision}
              </p>
            </div>
          </section>

          {/* Core Values Section - Compact Mobile Flow */}
          <section className="py-12 md:py-20 border-t border-slate-100">
            <div className="text-center max-w-2xl mx-auto mb-12">
               <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-4">Our Core Values</h2>
               <p className="text-sm md:text-base text-gray-500 font-light">The three pillars that guide our every thread and decision.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
               {[
                 { letter: 'H', title: 'Honesty', color: 'text-brand-humility', bg: 'bg-brand-humility/10', border: 'border-brand-humility/20', desc: 'Authentic faith, transparent practices, and integrity in every stitch.' },
                 { letter: 'E', title: 'Excellence', color: 'text-brand-hope', bg: 'bg-brand-hope/10', border: 'border-brand-hope/20', desc: 'Striving for the highest quality to reflect the character of God.' },
                 { letter: 'B', title: 'Boldness', color: 'text-brand-patience', bg: 'bg-brand-patience/10', border: 'border-brand-patience/20', desc: 'Courage to wear our scriptures and share the Gospel without compromise.' }
               ].map((val, idx) => (
                 <div key={idx} className={`${val.bg} p-8 rounded-[2rem] text-center border ${val.border} transition-transform hover:-translate-y-2 duration-300`}>
                    <div className={`text-6xl md:text-7xl font-black font-serif ${val.color} mb-4 leading-none`}>{val.letter}</div>
                    <h3 className="font-black text-xs uppercase tracking-widest text-slate-800 mb-3">{val.title}</h3>
                    <p className="text-xs md:text-sm text-slate-600 font-light leading-relaxed">{val.desc}</p>
                 </div>
               ))}
            </div>
          </section>
        </div>
        
        {/* Contact Form - Refined Layout */}
        <section className="mt-20 pt-20 border-t border-slate-200">
          <div className="max-w-xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-brand-dark">Get in Touch</h2>
            <p className="text-sm md:text-base text-gray-500 font-light">Have a question, testimony, or prayer request? We'd love to hear from you.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto bg-white p-6 md:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Name</label>
                  <input 
                    type="text" placeholder="Simon Peter" required 
                    value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full border border-slate-200 bg-slate-50 rounded-2xl p-4 text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <input 
                    type="email" placeholder="peter@apostle.com" required 
                    value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full border border-slate-200 bg-slate-50 rounded-2xl p-4 text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green outline-none transition-all"
                  />
                </div>
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
               <input 
                 type="text" placeholder="How can we help?" 
                 value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
                 className="w-full border border-slate-200 bg-slate-50 rounded-2xl p-4 text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green outline-none transition-all"
               />
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message</label>
               <textarea 
                 placeholder="Your testimony or inquiry..." rows={5} required
                 value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                 className="w-full border border-slate-200 bg-slate-50 rounded-3xl p-4 text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green outline-none transition-all"
               />
             </div>
             <div className="pt-4">
               <Button type="submit" fullWidth isLoading={sending} className="h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-brand-green/20 hover:scale-[1.01] active:scale-95 transition-all">
                 Send Message
               </Button>
             </div>
          </form>
        </section>
      </div>
    </div>
  );
};