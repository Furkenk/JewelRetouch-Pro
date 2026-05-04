import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from '../translations';
import { Language } from '../types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  isDarkMode: boolean;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, language, isDarkMode }) => {
  const [isYearly, setIsYearly] = useState(true);
  const t = translations[language] || translations.en;

  if (!isOpen) return null;

  const plans = [
    {
      name: "STARTER",
      monthlyPrice: "799",
      yearlyPrice: "639",
      savings: "1.920 TL",
      totalYearly: "7.668 TL",
      features: [
        `50 ${t.pricing.features.imagesMo}`,
        `Gemini 2.5 Flash ${t.pricing.features.engine}`,
        "High-End Retoucher",
        "Luxury Fashion",
        t.pricing.features.bgOptions,
        t.pricing.features.groundGloss,
        `30 ${t.pricing.features.history}`,
        t.pricing.features.emailSupport
      ],
      color: "from-blue-500 to-indigo-600"
    },
    {
      name: "PRO",
      monthlyPrice: "1.999",
      yearlyPrice: "1.599",
      savings: "4.800 TL",
      totalYearly: "19.188 TL",
      features: [
        `150 ${t.pricing.features.imagesMo}`,
        `Gemini 3.1 Flash ${t.pricing.features.engine}`,
        t.pricing.features.starterAll,
        "Prompt to Image",
        "Image Upscale/Clarity",
        t.pricing.features.bulkMode,
        t.pricing.features.modelFix,
        t.pricing.features.slider,
        `90 ${t.pricing.features.history}`,
        t.pricing.features.priority
      ],
      color: "from-indigo-600 to-violet-700",
      popular: true
    },
    {
      name: "AGENCY",
      monthlyPrice: "4.999",
      yearlyPrice: "3.999",
      savings: "12.000 TL",
      totalYearly: "47.988 TL",
      features: [
        `400 ${t.pricing.features.imagesMo}`,
        `Gemini 3 Pro ${t.pricing.features.engine}`,
        t.pricing.features.proAll,
        t.pricing.features.unlimitedBulk,
        t.pricing.features.brandKit,
        t.pricing.features.metalTrio,
        `1 ${language === 'tr' ? 'yıl' : 'year'} ${t.pricing.features.history}`,
        t.pricing.features.accountManager,
        t.pricing.features.api
      ],
      color: "from-violet-700 to-fuchsia-800"
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={`w-full max-w-6xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col ${
          isDarkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-100'
        }`}
        style={{ maxHeight: '90vh' }}
      >
        {/* Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
        
        <button 
          onClick={onClose}
          className={`absolute top-8 right-8 p-3 rounded-full transition-colors z-10 ${
            isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-black'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2/1.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="p-8 md:p-12 overflow-y-auto">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.pricing.title}
            </h2>
            <p className={`text-sm font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              {t.pricing.subtitle}
            </p>

            {/* Toggle */}
            <div className="mt-8 flex items-center justify-center space-x-4">
              <span className={`text-xs font-black uppercase tracking-widest ${!isYearly ? (isDarkMode ? 'text-white' : 'text-gray-900') : 'text-gray-400'}`}>
                {t.pricing.monthly}
              </span>
              <button 
                onClick={() => setIsYearly(!isYearly)}
                className={`w-14 h-7 rounded-full p-1 transition-colors relative ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-indigo-500 transition-transform ${isYearly ? 'translate-x-7' : 'translate-x-0'}`} />
              </button>
              <span className={`text-xs font-black uppercase tracking-widest ${isYearly ? (isDarkMode ? 'text-white' : 'text-gray-900') : 'text-gray-400'}`}>
                {t.pricing.yearly}
              </span>
              {isYearly && (
                <span className="bg-green-500/10 text-green-500 text-[10px] font-black px-2 py-1 rounded-lg uppercase">
                  {t.pricing.off20}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div 
                key={plan.name}
                className={`relative p-8 rounded-[2rem] border transition-all hover:translate-y-[-8px] ${
                  plan.popular ? (isDarkMode ? 'border-indigo-500 bg-indigo-500/5' : 'border-indigo-600 bg-indigo-50/50') 
                  : (isDarkMode ? 'border-slate-800 bg-slate-800/50' : 'border-gray-100 bg-gray-50/50')
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                    {t.pricing.mostPopular}
                  </div>
                )}

                <h3 className={`text-xs font-black uppercase tracking-[0.2em] mb-6 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  {plan.name}
                </h3>

                <div className="mb-8">
                  <div className="flex items-baseline space-x-1">
                    <span className={`text-5xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      TL {t.pricing.perMo}
                    </span>
                  </div>
                  {isYearly && (
                    <div className="mt-2 space-y-1">
                       <p className="text-[10px] font-black text-green-500 uppercase">
                        {t.pricing.saving} {plan.savings}
                      </p>
                      <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                        {plan.totalYearly} {t.pricing.billedYearly}
                      </p>
                    </div>
                  )}
                </div>

                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <svg className={`w-4 h-4 mt-0.5 shrink-0 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={`text-[11px] font-bold leading-tight ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button 
                  className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl ${
                    plan.popular ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/20' 
                    : (isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-black text-white hover:bg-gray-800')
                  }`}
                >
                  {t.pricing.choosePlan}
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
              {t.pricing.secure} • {t.pricing.cancel} • {t.pricing.support247}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PricingModal;
