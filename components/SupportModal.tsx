import React, { useState, useRef, useEffect } from 'react';
import { translations } from '../translations';
import { Language } from '../types';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  isDarkMode: boolean;
}

const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose, language, isDarkMode }) => {
  const [mode, setMode] = useState<'hub' | 'live' | 'email' | 'success'>('hub');
  const t = translations[language] || translations.en;
  
  const [chat, setChat] = useState<{sender: 'ai' | 'user', text: string}[]>([
    { sender: 'ai', text: language === 'tr' ? 'Merhaba! Size nasıl yardımcı olabilirim?' : 'Hello! How can I help you today?' }
  ]);
  const [inp, setInp] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) setMode('hub');
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, isTyping]);

  if (!isOpen) return null;

  const handleSendLive = () => {
    if(!inp.trim()) return;
    const msg = inp.trim();
    setChat(prev => [...prev, { sender: 'user', text: msg }]);
    setInp('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setChat(prev => [...prev, { 
        sender: 'ai', 
        text: language === 'tr' 
          ? 'Anlıyorum. Sorunuz sistem yeteneklerimizin dışında veya sitemizle ilgili değilse, detaylı destek için E-posta ile iletişime geçebilirsiniz.' 
          : 'I understand. If your question is outside our system capabilities or not related to the site, please contact us via Email for detailed support.' 
      }]);
    }, 1500);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setMode('success');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className={`w-full max-w-lg rounded-[2rem] shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col ${
          isDarkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-100'
        }`}
        style={{ minHeight: '600px', maxHeight: '80vh' }}
      >
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
          <div className="flex items-center gap-4">
            {mode !== 'hub' && mode !== 'success' && (
              <button onClick={() => setMode('hub')} className={`p-1.5 rounded-full ${isDarkMode ? 'hover:bg-slate-800 text-white' : 'hover:bg-gray-100 text-black'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}
            <h2 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.support.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-black'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {mode === 'hub' && (
            <div className="p-8 space-y-4">
              <button onClick={() => setMode('live')} className={`w-full p-6 text-left rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-indigo-500' : 'bg-gray-50 border-gray-200 hover:border-black'}`}>
                <div className="flex items-center gap-4 mb-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-black text-white'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  </div>
                  <h3 className={`text-lg font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.support.liveSupport}</h3>
                </div>
                <p className={`text-xs font-bold leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t.support.aiAgent}</p>
              </button>

              <button onClick={() => setMode('email')} className={`w-full p-6 text-left rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-indigo-500' : 'bg-gray-50 border-gray-200 hover:border-black'}`}>
                <div className="flex items-center gap-4 mb-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-black text-white'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <h3 className={`text-lg font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.support.emailSupport}</h3>
                </div>
                <p className={`text-xs font-bold leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t.support.emailDesc}</p>
              </button>
            </div>
          )}

          {mode === 'live' && (
            <div className="h-full flex flex-col pt-2 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                {chat.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 text-sm font-bold ${
                      msg.sender === 'user' 
                        ? (isDarkMode ? 'bg-indigo-600 text-white' : 'bg-black text-white') 
                        : (isDarkMode ? 'bg-slate-800 border border-slate-700 text-slate-200' : 'bg-white border text-gray-800')
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className={`rounded-2xl p-4 text-sm font-bold ${isDarkMode ? 'bg-slate-800 border border-slate-700 text-slate-400' : 'bg-white border text-gray-500'}`}>
                      {t.support.aiTyping}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className={`p-4 border-t ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={inp}
                    onChange={e => setInp(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendLive()}
                    placeholder={t.support.userMessage}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm border focus:outline-none ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-gray-50 text-gray-900 border-gray-200'}`}
                  />
                  <button onClick={handleSendLive} className={`p-3 rounded-xl transition-all ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {mode === 'email' && (
            <form onSubmit={handleSendEmail} className="p-8 space-y-4">
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t.support.name}</label>
                <input required type="text" className={`w-full py-3 px-4 rounded-xl text-sm border focus:outline-none ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-gray-50 text-gray-900 border-gray-200'}`} />
              </div>
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t.support.email}</label>
                <input required type="email" className={`w-full py-3 px-4 rounded-xl text-sm border focus:outline-none ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-gray-50 text-gray-900 border-gray-200'}`} />
              </div>
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t.support.phone}</label>
                <input required type="tel" className={`w-full py-3 px-4 rounded-xl text-sm border focus:outline-none ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-gray-50 text-gray-900 border-gray-200'}`} />
              </div>
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t.support.message}</label>
                <textarea required rows={4} className={`w-full py-3 px-4 rounded-xl text-sm border focus:outline-none resize-none ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-gray-50 text-gray-900 border-gray-200'}`} />
              </div>
              <button type="submit" className={`w-full mt-4 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-transform active:scale-95 ${isDarkMode ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
                {t.support.send}
              </button>
            </form>
          )}

          {mode === 'success' && (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-500'}`}>
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.support.success}</h3>
              <button onClick={onClose} className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-transform active:scale-95 ${isDarkMode ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportModal;
