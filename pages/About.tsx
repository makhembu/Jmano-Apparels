import React from 'react';
import { useShop } from '../context/ShopContext';
import { SEO } from '../components/SEO';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const About: React.FC = () => {
  const { settings, loading } = useShop();

  const seoTitle = settings.aboutSeoTitle || `Our Story | Jambo Apparels Mission & Vision`;
  const seoDesc = settings.aboutSeoDescription || "Learn about Jambo Apparels' commitment to honesty, excellence, and boldness. Discover how we thread scriptures into modern fashion.";

  if (loading && settings.slogan === "Loading...") {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 animate-fade-in">
      <SEO 
        title={seoTitle}
        description={seoDesc}
        type="website"
      />

      {/* Header */}
      <header className="bg-brand-dark py-20 md:py-32 text-center text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <span className="inline-block bg-brand-hope text-brand-dark font-bold text-xs uppercase tracking-widest px-6 py-2 rounded-full mb-6 shadow-lg">
            Our Divine Purpose
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight">
            The Jambo <span className="text-brand-humility">Legacy</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl font-light italic opacity-90 max-w-2xl mx-auto">
            "{settings.secondarySlogan}"
          </p>
        </div>
      </header>

      <main className="py-16 md:py-24 space-y-16 md:space-y-24">
        {/* Founder Section */}
        <section className="max-w-6xl mx-auto px-4 -mt-32 md:-mt-48 relative z-20">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-5">
            <div className="lg:col-span-2 relative">
              <img 
                src={settings.founderImage || "https://i.imgur.com/EuNbPGG.png"} 
                alt={settings.founderName || 'Linah Makembu, Founder of Jambo Apparels'} 
                className="w-full h-full object-cover object-top aspect-[4/5]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent lg:hidden"></div>
            </div>
            <div className="lg:col-span-3 p-8 md:p-16 flex flex-col justify-center">
              <span className="text-brand-green font-bold text-xs uppercase tracking-widest mb-2">Message from the Heart</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark leading-tight mb-4">{settings.founderName}</h2>
              <div className="w-20 h-1.5 bg-brand-hope rounded-full mb-8"></div>
              
              <div className="prose prose-slate max-w-none text-slate-600 font-light leading-relaxed mb-8 whitespace-pre-wrap">
                <p>{settings.founderBio}</p>
                <p>
                  Jambo Apparels was born not just from a desire to create clothing, but from a calling to create conversation. 
                  In a world often loud with distraction, we aim to offer a quiet, steadfast testimony through what we wear. 
                  Every design is prayerfully considered, ensuring that it aligns with the truth of Scripture while meeting the aesthetic needs of the modern believer.
                </p>
              </div>

              <div className="bg-brand-testament/10 p-6 rounded-2xl relative">
                <span className="absolute -left-3 -top-3 text-brand-testament text-7xl font-serif opacity-20">“</span>
                <blockquote className="text-brand-dark font-serif text-xl italic leading-relaxed">
                  {settings.founderQuote}
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-brand-dark text-white p-10 md:p-12 rounded-3xl shadow-xl flex flex-col justify-center text-center h-full relative overflow-hidden group">
              <div className="absolute inset-0 bg-brand-green/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h2 className="font-bold text-xs uppercase tracking-widest text-brand-hope mb-4 relative z-10">The Mission</h2>
              <p className="font-serif text-2xl md:text-3xl font-bold leading-snug relative z-10">
                {settings.mission}
              </p>
              <p className="mt-4 text-brand-light/80 font-light text-sm relative z-10">
                To equip the saints for the work of ministry through wearable art that speaks truth.
              </p>
            </div>
            <div className="bg-brand-testament text-white p-10 md:p-12 rounded-3xl shadow-xl flex flex-col justify-center text-center h-full relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h2 className="font-bold text-xs uppercase tracking-widest text-white/70 mb-4 relative z-10">The Vision</h2>
              <p className="font-serif text-2xl md:text-3xl font-bold leading-snug relative z-10">
                {settings.vision}
              </p>
               <p className="mt-4 text-white/80 font-light text-sm relative z-10">
                A world where the Gospel is visible in every street, workplace, and gathering.
              </p>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="text-center mb-12">
            <span className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-2">The Foundation</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark">Core Values (H.E.B.)</h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
                These three pillars uphold everything we do, from sourcing fabrics to serving our community.
            </p>
            <div className="w-20 h-1.5 bg-brand-hope rounded-full mt-6 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Honesty */}
            <div className="bg-brand-humility text-white p-8 rounded-3xl shadow-xl text-center flex flex-col items-center transform transition-transform hover:-translate-y-2 duration-300">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center font-serif font-bold text-3xl mb-6">H</div>
              <h3 className="font-bold text-xl uppercase tracking-wider mb-3">Honesty</h3>
              <p className="text-sm font-light leading-relaxed">
                Authentic faith, transparent practices, and integrity in every stitch we thread. We believe in being true to God, true to our customers, and true to ourselves.
              </p>
            </div>

            {/* Excellence */}
            <div className="bg-brand-hope text-brand-dark p-8 rounded-3xl shadow-xl text-center flex flex-col items-center transform transition-transform hover:-translate-y-2 duration-300">
              <div className="w-16 h-16 bg-black/10 rounded-2xl flex items-center justify-center font-serif font-bold text-3xl mb-6">E</div>
              <h3 className="font-bold text-xl uppercase tracking-wider mb-3">Excellence</h3>
              <p className="text-sm font-light leading-relaxed">
                Striving for the highest quality to reflect the character of God. We don't settle for mediocrity because our message deserves the best vessel.
              </p>
            </div>

            {/* Boldness */}
            <div className="bg-brand-patience text-white p-8 rounded-3xl shadow-xl text-center flex flex-col items-center transform transition-transform hover:-translate-y-2 duration-300">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center font-serif font-bold text-3xl mb-6">B</div>
              <h3 className="font-bold text-xl uppercase tracking-wider mb-3">Boldness</h3>
              <p className="text-sm font-light leading-relaxed">
                Courage to wear our scriptures and share the Gospel without compromise. In a world of blending in, we are called to stand out for Christ.
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};