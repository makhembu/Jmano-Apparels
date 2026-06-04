
import React from 'react';
import { useShop } from '../context/ShopContext';
import { SEO } from '../components/SEO';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ContactForm } from '../components/ContactForm';

export const About: React.FC = () => {
  const { settings, loading } = useShop();

  const seoTitle = settings.aboutSeoTitle || `Our Story | Jambo Apparels Mission & Vision`;
  const seoDesc = settings.aboutSeoDescription || "Learn about Jambo Apparels' commitment to honesty, excellence, and boldness. Discover how we thread scriptures into modern fashion.";

  if (loading && settings.slogan === "Loading...") {
    return <LoadingSpinner fullScreen />;
  }

  // Fallback defaults for visual display if settings are empty
  const heroTag = settings.aboutHeroTag || "Our Divine Purpose";
  const heroTitle = settings.aboutHeroTitle || "The Jambo Legacy";
  const missionTitle = settings.aboutMissionTitle || "The Mission";
  const missionBody = settings.aboutMissionBody || '';
  const visionTitle = settings.aboutVisionTitle || "The Vision";
  const visionBody = settings.aboutVisionBody || '';
  
  const valuesTag = settings.aboutValuesTag || "The Foundation";
  const valuesTitle = settings.aboutValuesTitle || "Core Values (H.E.B.)";
  const valuesIntro = settings.aboutValuesIntro || '';

  const val1Title = settings.aboutValue1Title || "Honesty";
  const val1Body = settings.aboutValue1Body || '';
  
  const val2Title = settings.aboutValue2Title || "Excellence";
  const val2Body = settings.aboutValue2Body || '';
  
  const val3Title = settings.aboutValue3Title || "Boldness";
  const val3Body = settings.aboutValue3Body || '';

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 animate-fade-in">
      <SEO 
        title={seoTitle}
        description={seoDesc}
        type="website"
      />

      {/* Header */}
      <header className="hidden md:block relative bg-brand-dark pt-16 pb-20 overflow-hidden text-center text-white border-b border-brand-green/20">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <span className="inline-block bg-brand-hope text-brand-dark font-bold text-xs uppercase tracking-widest px-6 py-2 rounded-full mb-6 shadow-lg">
            {heroTag}
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight">
            {heroTitle}
          </h1>
          <p className="mt-4 text-lg md:text-xl font-light italic opacity-90 max-w-2xl mx-auto">
            Divinely Threaded Scriptures
          </p>
        </div>
      </header>

<main className="py-16 md:py-24 space-y-16 md:space-y-24">
        {/* Founder Section */}
        <section className="max-w-6xl mx-auto px-4 -mt-32 md:-mt-40 relative z-20">
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
              
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark leading-tight mb-4">{settings.founderName}</h2>
              <div className="w-20 h-1.5 bg-brand-hope rounded-full mb-8"></div>
              
              <div className="prose prose-slate max-w-none text-slate-600 font-light leading-relaxed mb-8 whitespace-pre-wrap">
                <p>{settings.founderBio}</p>
              </div>

              <div className="bg-brand-testament/10 p-6 rounded-2xl relative">
                <span className="absolute -left-3 -top-3 text-brand-testament text-7xl font-serif opacity-20">"</span>
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
              <h2 className="font-bold text-xs uppercase tracking-widest text-brand-hope mb-4 relative z-10">{missionTitle}</h2>
              <p className="font-serif text-2xl md:text-3xl font-bold leading-snug relative z-10">
                {settings.mission}
              </p>
              {missionBody && <p className="mt-4 text-brand-light/80 font-light text-sm relative z-10">{missionBody}</p>}
            </div>
            <div className="bg-brand-testament text-white p-10 md:p-12 rounded-3xl shadow-xl flex flex-col justify-center text-center h-full relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h2 className="font-bold text-xs uppercase tracking-widest text-white/70 mb-4 relative z-10">{visionTitle}</h2>
              <p className="font-serif text-2xl md:text-3xl font-bold leading-snug relative z-10">
                {settings.vision}
              </p>
              {visionBody && <p className="mt-4 text-white/80 font-light text-sm relative z-10">{visionBody}</p>}
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="text-center mb-12">
            <span className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-2">{valuesTag}</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark">{valuesTitle}</h2>
            {valuesIntro && <p className="text-gray-500 mt-4 max-w-2xl mx-auto">{valuesIntro}</p>}
            <div className="w-20 h-1.5 bg-brand-hope rounded-full mt-6 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Honesty */}
            <div className="bg-brand-humility text-white p-8 rounded-3xl shadow-xl text-center flex flex-col items-center transform transition-transform hover:-translate-y-2 duration-300">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center font-serif font-bold text-3xl mb-6">H</div>
              <h3 className="font-bold text-xl uppercase tracking-wider mb-3">{val1Title}</h3>
              {val1Body && <p className="text-sm font-light leading-relaxed">{val1Body}</p>}
            </div>

            {/* Excellence */}
            <div className="bg-brand-hope text-brand-dark p-8 rounded-3xl shadow-xl text-center flex flex-col items-center transform transition-transform hover:-translate-y-2 duration-300">
              <div className="w-16 h-16 bg-black/10 rounded-2xl flex items-center justify-center font-serif font-bold text-3xl mb-6">E</div>
              <h3 className="font-bold text-xl uppercase tracking-wider mb-3">{val2Title}</h3>
              {val2Body && <p className="text-sm font-light leading-relaxed">{val2Body}</p>}
            </div>

            {/* Boldness */}
            <div className="bg-brand-patience text-white p-8 rounded-3xl shadow-xl text-center flex flex-col items-center transform transition-transform hover:-translate-y-2 duration-300">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center font-serif font-bold text-3xl mb-6">B</div>
              <h3 className="font-bold text-xl uppercase tracking-wider mb-3">{val3Title}</h3>
              {val3Body && <p className="text-sm font-light leading-relaxed">{val3Body}</p>}
            </div>
          </div>
        </section>

        {settings.enableContactForm && (
          <section className="max-w-4xl mx-auto px-4 pb-24">
             <ContactForm />
          </section>
        )}

      </main>
    </div>
  );
};
