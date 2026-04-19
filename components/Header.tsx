
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  activeMode: 'retoucher' | 'fashion' | 'prompt-to-image' | 'upscale';
  onModeChange: (mode: 'retoucher' | 'fashion' | 'prompt-to-image' | 'upscale') => void;
}

const Header: React.FC<HeaderProps> = ({ activeMode, onModeChange }) => {
  const [isAnimatingLogo, setIsAnimatingLogo] = useState(false);

  const handleModeChange = (mode: 'retoucher' | 'fashion' | 'prompt-to-image' | 'upscale') => {
    if (mode === activeMode) return;
    onModeChange(mode);
    setIsAnimatingLogo(true);
  };

  useEffect(() => {
    if (isAnimatingLogo) {
      const timer = setTimeout(() => {
        setIsAnimatingLogo(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isAnimatingLogo]);

  const logoContent = (
    <div className="flex items-center space-x-6 group cursor-default">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 to-gray-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <div className="relative w-14 h-14 bg-black rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
          </svg>
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-black tracking-tighter text-gray-900 leading-none transition-colors group-hover:text-black">JewelRetouch <span className="text-gray-300 font-light group-hover:text-gray-400 transition-colors">PRO</span></h1>
      </div>
    </div>
  );

  return (
    <>
      <header className="py-8 px-10 bg-white/95 backdrop-blur-xl border-b border-gray-100 flex flex-col md:flex-row items-center justify-between sticky top-0 z-40 gap-6">
        <div className="flex-shrink-0 flex items-center justify-center md:justify-start">
          {!isAnimatingLogo && (
            <motion.div layoutId="main-logo" transition={{ type: "spring", bounce: 0.1, duration: 0.45 }}>
              {logoContent}
            </motion.div>
          )}
        </div>
        
        <div className="flex items-center bg-gray-50 p-1.5 rounded-[1.5rem] border border-gray-100 flex-wrap justify-center gap-1">
          <button 
            onClick={() => handleModeChange('retoucher')}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMode === 'retoucher' ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
          >
            High-End Retoucher
          </button>
          <button 
            onClick={() => handleModeChange('fashion')}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMode === 'fashion' ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Luxury Fashion Post-Production
          </button>
          <button 
            onClick={() => handleModeChange('prompt-to-image')}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMode === 'prompt-to-image' ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Prompt to Image
          </button>
          <button 
            onClick={() => handleModeChange('upscale')}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMode === 'upscale' ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Image Upscale / Clarity
          </button>
        </div>

        <div className="hidden lg:flex items-center justify-end flex-shrink-0">
          <div className="bg-black text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center shadow-xl">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></span>
            Engine Active
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isAnimatingLogo && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-white/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div layoutId="main-logo" transition={{ type: "spring", bounce: 0.1, duration: 0.45 }} className="scale-150">
              {logoContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
