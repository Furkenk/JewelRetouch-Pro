
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  activeMode: 'retoucher' | 'fashion' | 'prompt-to-image' | 'upscale' | 'video';
  onModeChange: (mode: 'retoucher' | 'fashion' | 'prompt-to-image' | 'upscale' | 'video') => void;
  isDarkMode: boolean;
}

const Header: React.FC<HeaderProps> = ({ activeMode, onModeChange, isDarkMode }) => {
  const [showProfile, setShowProfile] = useState(false);
  const credits = 150; // Mock credits

  const handleModeChange = (mode: 'retoucher' | 'fashion' | 'prompt-to-image' | 'upscale' | 'video') => {
    if (mode === activeMode) return;
    onModeChange(mode);
  };

  const logoContent = (
    <div className="flex items-center space-x-6 group cursor-default">
      <div className="relative">
        <div className={`absolute -inset-1 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 ${isDarkMode ? 'bg-gradient-to-r from-blue-400 to-indigo-600' : 'bg-gradient-to-r from-gray-200 to-gray-400'}`}></div>
        <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 ${isDarkMode ? 'bg-indigo-600' : 'bg-black'}`}>
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
          </svg>
        </div>
      </div>
      <div>
        <h1 className={`text-2xl font-black tracking-tighter leading-none transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          JewelRetouch <span className={`${isDarkMode ? 'text-indigo-300' : 'text-gray-300'} font-light group-hover:text-gray-400 transition-colors`}>PRO</span>
        </h1>
      </div>
    </div>
  );

  return (
    <>
      <header className={`py-8 px-10 border-b flex flex-col md:flex-row items-center justify-between sticky top-0 z-40 gap-6 transition-all duration-500 ${isDarkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-gray-100 backdrop-blur-xl'}`}>
        <div className="flex-shrink-0 flex items-center justify-center md:justify-start">
          <motion.div transition={{ type: "spring", bounce: 0.1, duration: 0.45 }}>
            {logoContent}
          </motion.div>
        </div>
        
        <div className={`flex items-center p-1.5 rounded-[1.5rem] border flex-wrap justify-center gap-1 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
          <button 
            onClick={() => handleModeChange('retoucher')}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMode === 'retoucher' ? (isDarkMode ? 'bg-white text-slate-900 shadow-xl' : 'bg-black text-white shadow-xl') : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600')}`}
          >
            High-End Retoucher
          </button>
          <button 
            onClick={() => handleModeChange('fashion')}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMode === 'fashion' ? (isDarkMode ? 'bg-white text-slate-900 shadow-xl' : 'bg-black text-white shadow-xl') : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600')}`}
          >
            Luxury Fashion
          </button>
          <button 
            onClick={() => handleModeChange('prompt-to-image')}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMode === 'prompt-to-image' ? (isDarkMode ? 'bg-white text-slate-900 shadow-xl' : 'bg-black text-white shadow-xl') : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600')}`}
          >
            Prompt to Image
          </button>
          <button 
            onClick={() => handleModeChange('upscale')}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMode === 'upscale' ? (isDarkMode ? 'bg-white text-slate-900 shadow-xl' : 'bg-black text-white shadow-xl') : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600')}`}
          >
            Image Upscale / Clarity
          </button>
          <button 
            onClick={() => handleModeChange('video')}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMode === 'video' ? (isDarkMode ? 'bg-white text-slate-900 shadow-xl' : 'bg-black text-white shadow-xl') : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600')}`}
          >
            Video / 360°
          </button>
        </div>
      </header>
    </>
  );
};

export default Header;
