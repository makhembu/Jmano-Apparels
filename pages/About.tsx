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
    <div className="bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 animate-fade-in">
        <header className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-serif font-bold text-brand-dark mb-4 tracking-tight sm:text-6xl">Our Story</h1>
          <p className="text-xl text-gray-500 font-light leading-relaxed">"{settings.secondarySlogan}"</p>
        </header>

        <div className="mt-20 bg-white p-8 sm:p-16 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          {/* Founder Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
            <div className="md:col-span-1">
              <img 
                src="https://i.imgur.com/EuNbPGG.png" 
                alt="Linah Makembu, Founder of Jambo Apparels" 
                className="rounded-2xl shadow-lg w-full h-auto object-cover aspect-[4/5]"
              />
            </div>
            <div className="md:col-span-2">
              <h2 className="text-3xl font-serif font-bold text-brand-dark mb-2">A Word from Our Founder</h2>
              <h3 className="text-2xl font-semibold text-brand-hope mb-6">Linah Makembu</h3>
              <div className="space-y-4 text-gray-600 font-light leading-relaxed">
                <p>
                  Linah Makembu is the Founding Director of Jambo Apparels, a faith-driven apparel brand created to glorify God through creativity, service, and purpose. Her journey began in 2019 through grassroots service in a local church, where she developed a heart for ministry, humility, and bold obedience. These values remain at the core of Jambo Apparels today.
                </p>
                <blockquote className="border-l-4 border-brand-green pl-6 py-2 text-gray-800 font-medium italic">
                  "Guided by honesty, excellence, and boldness, I lead Jambo Apparels with a commitment to honouring God in the work entrusted to us."
                </blockquote>
                <p>
                  With a strong passion for advocacy and community, Linah envisions Jambo Apparels as more than clothing. It is a platform for spreading the gospel to the ends of the earth, using uniquely threaded wear to communicate truth, faith, and identity in Christ.
                </p>
              </div>
            </div>
          </section>

          {/* Mission & Vision */}
          <section className="mt-20 pt-16 border-t border-slate-100 grid md:grid-cols-2 gap-10">
            <div className="bg-brand-light p-10 rounded-2xl">
              <h2 className="text-2xl font-serif font-bold mb-4 text-brand-dark">Our Mission</h2>
              <p className="text-lg text-brand-dark/80 leading-relaxed font-medium">{settings.mission}</p>
            </div>
            <div className="bg-brand-hope/10 p-10 rounded-2xl">
              <h2 className="text-2xl font-serif font-bold mb-4 text-yellow-900">Our Vision</h2>
              <p className="text-lg text-yellow-900/80 leading-relaxed font-medium">{settings.vision}</p>
            </div>
          </section>

          {/* Core Values Section */}
          <section className="mt-20 pt-16 border-t border-slate-100">
            <div className="text-center max-w-2xl mx-auto">
               <h2 className="text-4xl font-serif font-bold text-brand-dark mb-4">Our Core Values</h2>
               <p className="text-gray-500">The three pillars that guide our every thread and decision, represented as <span className="font-bold">{settings.coreValues}</span>.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12">
               <div className="bg-brand-humility/20 p-8 rounded-2xl text-center border border-brand-humility/30">
                  <div className="text-6xl font-black font-serif text-brand-humility mb-4">H</div>
                  <h3 className="font-bold text-xl text-brand-dark">Honesty</h3>
                  <p className="text-sm text-green-900/70 mt-2">Authentic faith, transparent practices, and integrity in every stitch.</p>
               </div>
               <div className="bg-brand-hope/20 p-8 rounded-2xl text-center border border-brand-hope/30">
                  <div className="text-6xl font-black font-serif text-brand-hope mb-4">E</div>
                  <h3 className="font-bold text-xl text-yellow-900">Excellence</h3>
                  <p className="text-sm text-yellow-900/70 mt-2">Striving for the highest quality to reflect the character of God.</p>
               </div>
               <div className="bg-brand-patience/10 p-8 rounded-2xl text-center border border-brand-patience/20">
                  <div className="text-6xl font-black font-serif text-brand-patience mb-4">B</div>
                  <h3 className="font-bold text-xl text-red-900">Boldness</h3>
                  <p className="text-sm text-red-900/70 mt-2">Courage to wear our scriptures and share the Gospel without compromise.</p>
               </div>
            </div>
          </section>
        </div>
        
        {/* Contact Form */}
        <section className="mt-24 pt-24 border-t border-slate-200">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-brand-dark font-serif">Get in Touch</h2>
            <p className="text-gray-500 mb-10">Have a question, testimony, or prayer request? We'd love to hear from you.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input 
                  type="text" placeholder="Name" required 
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl p-4 text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all"
                />
                <input 
                  type="email" placeholder="Email" required 
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl p-4 text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all"
                />
             </div>
             <input 
               type="text" placeholder="Subject" 
               value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
               className="w-full border border-slate-200 bg-slate-50 rounded-xl p-4 text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all"
             />
             <textarea 
               placeholder="How can we help you?" rows={4} required
               value={form.message} onChange={e => setForm({...form, message: e.target.value})}
               className="w-full border border-slate-200 bg-slate-50 rounded-xl p-4 text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all"
             />
             <Button type="submit" fullWidth isLoading={sending} className="h-14 rounded-2xl font-bold uppercase tracking-wider text-xs shadow-xl shadow-brand-green/20">Send Message</Button>
          </form>
        </section>
      </div>
    </div>
  );
};
