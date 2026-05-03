import React, { useState } from 'react';
import { translations } from '../translations';
import { Language } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  isDarkMode: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, language, isDarkMode }) => {
  if (!isOpen) return null;
  const t = translations[language] || translations.en;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className={`w-full max-w-md p-8 rounded-[2rem] shadow-2xl relative animate-in zoom-in-95 duration-300 ${
          isDarkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-100'
        }`}
      >
        <button 
          onClick={onClose}
          className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${
            isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-black'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h2 className={`text-2xl font-black mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.profile.settings}</h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t.profile.personalInfo}</label>
            <input type="text" placeholder="Ad Soyad / Name" defaultValue="Furkan Daldal" className={`w-full py-3 px-4 rounded-xl text-sm ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-gray-50 text-gray-900 border-gray-200'} border focus:outline-none`} />
          </div>

          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t.profile.registrationInfo}</label>
            <input type="email" placeholder="E-posta / Email" defaultValue="furkandaldal1@gmail.com" className={`w-full py-3 px-4 rounded-xl text-sm ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-gray-50 text-gray-900 border-gray-200'} border focus:outline-none`} />
          </div>

          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t.profile.profession}</label>
            <select className={`w-full py-3 px-4 rounded-xl text-sm ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-gray-50 text-gray-900 border-gray-200'} border focus:outline-none`}>
              <option>Jeweler / Kuyumcu</option>
              <option>Designer / Tasarımcı</option>
              <option>Photographer / Fotoğrafçı</option>
              <option>Other / Diğer</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t.profile.changePassword}</label>
            <input type="password" placeholder="••••••••" className={`w-full py-3 px-4 rounded-xl text-sm ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-gray-50 text-gray-900 border-gray-200'} border focus:outline-none`} />
          </div>

          <button onClick={onClose} className={`w-full py-4 mt-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-transform active:scale-95 ${isDarkMode ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
            Kaydet / Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
