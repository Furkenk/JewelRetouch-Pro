
import React, { useState, useRef } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ComparisonSlider from './components/ComparisonSlider';
import SupportModal from './components/SupportModal';
import SettingsModal from './components/SettingsModal';
import JSZip from 'jszip';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from './translations';
import { AppState, RetouchOptions, MetalType, RetouchResult, ImageState, AppMode, FashionOptions, ProductType, AspectRatio, StoneType, Language } from './types';
import { processJewelryRetouch, processFashionProduction, enhancePrompt, analyzeImageForPrompt, processPromptToImage } from './services/geminiService';

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'main' | 'language'>('main');
  const [showSupport, setShowSupport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [options, setOptions] = useState<RetouchOptions>({
    metalTypes: ['white'],
    texture: 'medium',
    brilliance: 'enhanced',
    shadow: 'subtle',
    lighting: 'catalog',
    bgMode: 'white',
    bgHex: '#FFFFFF',
    reflection: false,
    isBulkMode: false,
    productScale: 1.0,
    aspectRatio: 'Auto',
    stoneTypes: ['original'],
    isPackagingShot: false
  });

  const [fashionOptions, setFashionOptions] = useState<FashionOptions>({
    productTypes: ['ring'],
    modelStyle: 'editorial',
    environment: 'studio',
    referenceEnvType: 'prompt',
    referenceEnvPrompt: '',
    referenceEnvImage: { file: null, preview: null, base64: null },
    skinTone: 'natural',
    hairColor: 'dark-brown',
    outfitType: 'luxury',
    hasAdditionalAccessory: false,
    faceType: 'random',
    productScale: 1.0,
    aspectRatio: 'Auto',
    isLifestyleCollage: false,
    styleRange: {
      enabled: false,
      bgColor: '#FFFFFF'
    }
  });

  const [state, setState] = useState<AppState>({
    activeMode: 'retoucher',
    rawImages: [],
    referenceImage: { file: null, preview: null, base64: null },
    fashionReferences: [],
    modelReference: { file: null, preview: null, base64: null },
    outfitReference: { file: null, preview: null, base64: null },
    accessoryReference: { file: null, preview: null, base64: null },
    faceReferences: [],
    promptToImage: {
      inputType: 'prompt',
      userPrompt: '',
      enhancedPrompt: '',
      referenceImage: { file: null, preview: null, base64: null },
      productImage: { file: null, preview: null, base64: null },
      productScale: 1.0,
      aspectRatio: 'Auto'
    },
    videoOptions: {
      rotationSpeed: 'Normal',
      backgroundColor: '#f3f4f6'
    },
    upscaleImage: { file: null, preview: null, base64: null },
    consistentModel: { file: null, preview: null, base64: null },
    isConsistentModelEnabled: false,
    isDarkMode: false,
    retouchedResults: [],
    isProcessing: false,
    processingProgress: 0,
    error: null,
    brandKit: {
      backgroundColor: '#FFFFFF',
      lightingPreference: 'catalog',
      isLocked: false
    },
    isWatermarkEnabled: false,
    watermark: {
      type: 'text',
      text: 'JEWELRETOUCH PRO',
      image: { file: null, preview: null, base64: null }
    },
    exportCounter: 0,
    language: 'tr'
  });

  const t = translations[state.language] || translations.en;

  const handleConsistentModelUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const preview = URL.createObjectURL(file);
      setState(prev => ({
        ...prev,
        consistentModel: { file, preview, base64, name: file.name }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleUpscaleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const preview = URL.createObjectURL(file);
      setState(prev => ({
        ...prev,
        upscaleImage: { file, preview, base64, name: file.name }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleWatermarkLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const preview = URL.createObjectURL(file);
      setState(prev => ({
        ...prev,
        watermark: { ...prev.watermark, image: { file, preview, base64, name: file.name } }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleBulkUpload = (files: FileList) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const preview = URL.createObjectURL(file);
        const newImg: ImageState = { file, preview, base64, name: file.name };
        setState(prev => ({
          ...prev,
          rawImages: options.isBulkMode ? [...prev.rawImages, newImg] : [newImg]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRefUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const preview = URL.createObjectURL(file);
      setState(prev => ({
        ...prev,
        referenceImage: { file, preview, base64 }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleModelRefUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const preview = URL.createObjectURL(file);
      setState(prev => ({
        ...prev,
        modelReference: { file, preview, base64 }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleOutfitRefUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const preview = URL.createObjectURL(file);
      setState(prev => ({
        ...prev,
        outfitReference: { file, preview, base64 }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAccessoryRefUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const preview = URL.createObjectURL(file);
      setState(prev => ({
        ...prev,
        accessoryReference: { file, preview, base64 }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleFaceRefUpload = (file: File) => {
    if (state.faceReferences.length >= 10) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const preview = URL.createObjectURL(file);
      setState(prev => ({
        ...prev,
        faceReferences: [...prev.faceReferences, { file, preview, base64 }]
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeFaceRef = (index: number) => {
    setState(prev => ({
      ...prev,
      faceReferences: prev.faceReferences.filter((_, i) => i !== index)
    }));
  };

  const handlePromptToImageRefUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const preview = URL.createObjectURL(file);
      setState(prev => ({
        ...prev,
        promptToImage: {
          ...prev.promptToImage,
          referenceImage: { file, preview, base64 }
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handlePromptToImageProductUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const preview = URL.createObjectURL(file);
      setState(prev => ({
        ...prev,
        promptToImage: {
          ...prev.promptToImage,
          productImage: { file, preview, base64 }
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleEnhancePrompt = async () => {
    if (state.promptToImage.inputType === 'prompt') {
      if (!state.promptToImage.userPrompt) return;
      setState(prev => ({ ...prev, isProcessing: true }));
      try {
        const enhanced = await enhancePrompt(state.promptToImage.userPrompt);
        setState(prev => ({
          ...prev,
          promptToImage: { ...prev.promptToImage, enhancedPrompt: enhanced },
          isProcessing: false
        }));
      } catch (e: any) {
        setState(prev => ({ ...prev, isProcessing: false, error: `Failed to enhance prompt: ${e.message || 'Unknown error'}` }));
      }
    } else {
      if (!state.promptToImage.referenceImage.base64) return;
      setState(prev => ({ ...prev, isProcessing: true }));
      try {
        const analyzed = await analyzeImageForPrompt(state.promptToImage.referenceImage.base64);
        setState(prev => ({
          ...prev,
          promptToImage: { ...prev.promptToImage, enhancedPrompt: analyzed },
          isProcessing: false
        }));
      } catch (e: any) {
        setState(prev => ({ ...prev, isProcessing: false, error: `Failed to analyze image: ${e.message || 'Unknown error'}` }));
      }
    }
  };

  const toggleMetal = (metal: MetalType) => {
    setOptions(prev => {
      const exists = prev.metalTypes.includes(metal);
      if (exists) {
        if (prev.metalTypes.length === 1) return prev;
        return { ...prev, metalTypes: prev.metalTypes.filter(m => m !== metal) };
      }
      return { ...prev, metalTypes: [...prev.metalTypes, metal] };
    });
  };

  const toggleStoneType = (stone: StoneType) => {
    setOptions(prev => {
      const exists = prev.stoneTypes.includes(stone);
      if (exists) {
        if (prev.stoneTypes.length === 1) return prev;
        return { ...prev, stoneTypes: prev.stoneTypes.filter(s => s !== stone) };
      }
      return { ...prev, stoneTypes: [...prev.stoneTypes, stone] };
    });
  };

  const handleFashionUpload = (files: FileList) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const preview = URL.createObjectURL(file);
        const newImg: ImageState = { file, preview, base64, name: file.name };
        setState(prev => ({
          ...prev,
          fashionReferences: [...prev.fashionReferences, newImg]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const toggleProductType = (type: ProductType) => {
    setFashionOptions(prev => {
      const exists = prev.productTypes.includes(type);
      if (exists) {
        if (prev.productTypes.length === 1) return prev;
        return { ...prev, productTypes: prev.productTypes.filter(t => t !== type) };
      }
      return { ...prev, productTypes: [...prev.productTypes, type] };
    });
  };

  const handleRetouch = async () => {
    if (state.activeMode === 'retoucher') {
      if (state.rawImages.length === 0 || options.metalTypes.length === 0) return;
    } else if (state.activeMode === 'fashion') {
      if (state.fashionReferences.length === 0 || fashionOptions.productTypes.length === 0) return;
    } else if (state.activeMode === 'upscale') {
      if (!state.upscaleImage.base64) return;
    } else if (state.activeMode === 'video') {
      if (state.rawImages.length < 2) {
        setState(prev => ({ ...prev, error: "Please upload at least 2 photos for 360° video generation." }));
        return;
      }
    } else {
      if (!state.promptToImage.productImage.base64 || (!state.promptToImage.userPrompt && !state.promptToImage.enhancedPrompt)) return;
    }
    
    setState(prev => ({ 
      ...prev, 
      isProcessing: true, 
      error: null, 
      processingProgress: 0
    }));

    const results: RetouchResult[] = [];
    let currentCounter = state.exportCounter;
    
    try {
      if (state.activeMode === 'retoucher') {
        const totalSteps = state.rawImages.length * options.metalTypes.length;
        let completedSteps = 0;
        for (const img of state.rawImages) {
          currentCounter++;
          for (const metal of options.metalTypes) {
            const metalSuffix = metal === 'white' ? '-white' : metal === 'yellow' ? '-yellow' : '-rose';
            const fileName = `JewelRetouch-Pro-${currentCounter}${metalSuffix}`;
            
            const resultUrl = await processJewelryRetouch(
              img.base64!, 
              options, 
              metal, 
              state.referenceImage.base64 || undefined,
              state.isConsistentModelEnabled ? (state.consistentModel.base64 || undefined) : undefined
            );
            
            results.push({ 
              id: Math.random().toString(36).substr(2, 9),
              metal, 
              url: resultUrl, 
              sourceName: fileName,
              sourcePreview: img.preview!,
              approvalStatus: 'pending',
              hasWatermark: state.isWatermarkEnabled
            });
            
            completedSteps++;
            setState(prev => {
              const otherResults = prev.retouchedResults.filter(r => !results.some(nr => nr.url === r.url));
              return {
                ...prev,
                retouchedResults: [...results, ...otherResults],
                processingProgress: Math.round((completedSteps / totalSteps) * 100),
                exportCounter: currentCounter
              };
            });
          }
        }
      } else if (state.activeMode === 'fashion') {
        currentCounter++;
        const resultUrl = await processFashionProduction(
          state.fashionReferences.map(r => r.base64!),
          fashionOptions,
          state.modelReference.base64 || undefined,
          state.outfitReference.base64 || undefined,
          state.accessoryReference.base64 || undefined,
          state.faceReferences.map(r => r.base64!),
          state.isConsistentModelEnabled ? (state.consistentModel.base64 || undefined) : undefined
        );
        
        const newResult: RetouchResult = {
          id: Math.random().toString(36).substr(2, 9),
          metal: 'white',
          url: resultUrl,
          sourceName: `JewelRetouch-Pro-Fashion-${currentCounter}`,
          sourcePreview: state.fashionReferences[0].preview!,
          approvalStatus: 'pending',
          hasWatermark: state.isWatermarkEnabled
        };
        
        setState(prev => ({
          ...prev,
          retouchedResults: [newResult, ...prev.retouchedResults],
          processingProgress: 100,
          exportCounter: currentCounter
        }));
      } else if (state.activeMode === 'upscale') {
        currentCounter++;
        const { processUpscale } = await import('./services/geminiService');
        const resultUrl = await processUpscale(state.upscaleImage.base64!);
        
        const newResult: RetouchResult = {
          id: Math.random().toString(36).substr(2, 9),
          metal: 'white',
          url: resultUrl,
          sourceName: `JewelRetouch-Pro-Upscale-${currentCounter}`,
          sourcePreview: state.upscaleImage.preview!,
          approvalStatus: 'pending',
          hasWatermark: state.isWatermarkEnabled
        };

        setState(prev => ({
          ...prev,
          retouchedResults: [newResult, ...prev.retouchedResults],
          processingProgress: 100,
          exportCounter: currentCounter
        }));
      } else if (state.activeMode === 'video') {
        currentCounter++;
        // Video mode mock: in a real scenario we'd call a specific video service
        // For now, we'll suggest it's processing high-quality frame sequences
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const newResult: RetouchResult = {
          id: Math.random().toString(36).substr(2, 9),
          metal: 'white',
          url: state.rawImages[0].preview!, // Using first image as fallback preview
          sourceName: `JewelRetouch-Pro-Video-${currentCounter}`,
          sourcePreview: state.rawImages[0].preview!,
          approvalStatus: 'pending',
          hasWatermark: state.isWatermarkEnabled
        };

        setState(prev => ({
          ...prev,
          retouchedResults: [newResult, ...prev.retouchedResults],
          processingProgress: 100,
          exportCounter: currentCounter
        }));
      } else {
        currentCounter++;
        const finalPrompt = state.promptToImage.enhancedPrompt || state.promptToImage.userPrompt;
        const resultUrl = await processPromptToImage(
          state.promptToImage.productImage.base64!,
          finalPrompt,
          state.promptToImage.productScale,
          state.promptToImage.referenceImage.base64 || undefined,
          state.isConsistentModelEnabled ? (state.consistentModel.base64 || undefined) : undefined
        );

        const newResult: RetouchResult = {
          id: Math.random().toString(36).substr(2, 9),
          metal: 'white',
          url: resultUrl,
          sourceName: `JewelRetouch-Pro-AI-${currentCounter}`,
          sourcePreview: state.promptToImage.productImage.preview!,
          approvalStatus: 'pending',
          hasWatermark: state.isWatermarkEnabled
        };

        setState(prev => ({
          ...prev,
          retouchedResults: [newResult, ...prev.retouchedResults],
          processingProgress: 100,
          exportCounter: currentCounter
        }));
      }
      setState(prev => ({ ...prev, isProcessing: false }));
    } catch (e: any) {
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: `Engine Interruption: ${e.message}.` 
      }));
    }
  };

  const downloadOne = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}.jpg`;
    link.click();
  };

  const downloadAllAsZip = async () => {
    if (state.retouchedResults.length === 0) return;
    
    setState(prev => ({ ...prev, isProcessing: true }));
    const zip = new JSZip();
    
    // Add processed images to ZIP
    for (const res of state.retouchedResults) {
      try {
        const response = await fetch(res.url);
        const blob = await response.blob();
        zip.file(`${res.sourceName}.jpg`, blob);
      } catch (e) {
        console.error(`Failed to add ${res.sourceName} to ZIP`, e);
      }
    }
    
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `JewelRetouch-Pro-Batch-${new Date().getTime()}.zip`;
    link.click();
    setState(prev => ({ ...prev, isProcessing: false }));
  };

  const toggleDarkMode = () => {
    setState(prev => {
      const isDark = !prev.isDarkMode;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { ...prev, isDarkMode: isDark };
    });
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${state.isDarkMode ? 'dark bg-slate-950 text-white' : 'bg-[#fcfcfc] text-gray-900'}`}>
      <Header 
        activeMode={state.activeMode} 
        onModeChange={(mode) => setState(s => ({ ...s, activeMode: mode, retouchedResults: [] }))} 
        isDarkMode={state.isDarkMode}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-12 space-y-12">
        {state.retouchedResults.length > 0 ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <h2 className={`text-3xl font-extrabold tracking-tight ${state.isDarkMode ? 'text-white' : 'text-gray-900'}`}>Gallery Output</h2>
                <div className="flex items-center gap-4">
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${state.isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{state.retouchedResults.length} Assets Rendered</p>
                  {state.retouchedResults.length > 1 && (
                    <button 
                      onClick={downloadAllAsZip}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${state.isDarkMode ? 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Download Batch (ZIP)
                    </button>
                  ) }
                </div>
              </div>
              <button 
                onClick={() => setState(p => ({ 
                  ...p, 
                  retouchedResults: [], 
                  rawImages: [], 
                  fashionReferences: [], 
                  modelReference: { file: null, preview: null, base64: null },
                  outfitReference: { file: null, preview: null, base64: null },
                  accessoryReference: { file: null, preview: null, base64: null },
                  faceReferences: [],
                  promptToImage: {
                    inputType: 'prompt',
                    userPrompt: '',
                    enhancedPrompt: '',
                    referenceImage: { file: null, preview: null, base64: null },
                    productImage: { file: null, preview: null, base64: null },
                    productScale: 1.0,
                    aspectRatio: 'Auto'
                  },
                  upscaleImage: { file: null, preview: null, base64: null },
                  referenceImage: { file: null, preview: null, base64: null },
                  isProcessing: false 
                }))}
                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl ${
                  state.isDarkMode ? 'bg-white text-slate-950 hover:bg-slate-100' : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                Reset Studio
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-10">
                {state.retouchedResults.map((res, idx) => (
                  <div key={res.id || idx} className="space-y-4 group animate-in zoom-in duration-500">
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`text-[10px] font-black uppercase tracking-widest ${state.isDarkMode ? 'text-white' : 'text-gray-900'}`}>{res.sourceName || 'Product'}</h4>
                          {res.approvalStatus !== 'pending' && (
                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${res.approvalStatus === 'approved' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                              {res.approvalStatus}
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] font-bold uppercase tracking-tighter ${state.isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{res.metal} Gold Finish</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => {
                            const whatsappUrl = `https://wa.me/?text=Check out this jewelry retouch: ${res.url}`;
                            window.open(whatsappUrl, '_blank');
                          }}
                          className={`text-green-500 hover:text-green-600 transition-colors tooltip-trigger`}
                          title="Share on WhatsApp"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        </button>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(res.url);
                            alert('Customer preview link copied to clipboard!');
                          }}
                          className={`text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-1 ${state.isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          Preview Link
                        </button>
                        <button onClick={() => downloadOne(res.url, res.sourceName)} className={`text-[10px] font-black uppercase tracking-widest hover:underline ${state.isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Download</button>
                      </div>
                    </div>
                    <div className={`aspect-square luxury-shadow rounded-[2.5rem] overflow-hidden border relative group shadow-2xl transition-colors duration-500 ${
                      state.isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-gray-100 bg-white'
                    }`}>
                      {state.activeMode === 'retoucher' ? (
                        <ComparisonSlider before={res.sourcePreview} after={res.url} />
                      ) : (
                        <img 
                          src={res.url} 
                          alt="Fashion Campaign" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover cursor-pointer transition-transform duration-700 group-hover:scale-105"
                          onClick={() => setSelectedImage(res.url)}
                        />
                      )}
                      
                      {/* Watermark Overlay */}
                      {res.hasWatermark && (
                        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center rotate-[-30deg] opacity-20">
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className="flex gap-12 whitespace-nowrap">
                              {[1,2,3,4].map(j => (
                                <span key={j} className="text-4xl font-black uppercase tracking-[0.5em] text-gray-500 drop-shadow-lg">
                                  JEWELRETOUCH PRO
                                </span>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Client Approval Overlay (Top Right) */}
                      <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setState(s => ({
                              ...s,
                              retouchedResults: s.retouchedResults.map(r => r.id === res.id ? { ...r, approvalStatus: 'approved', hasWatermark: false } : r)
                            }));
                          }}
                          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-xl shadow-lg transition-transform active:scale-95"
                          title="Approve"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setState(s => ({
                              ...s,
                              retouchedResults: s.retouchedResults.map(r => r.id === res.id ? { ...r, approvalStatus: 'rejected' } : r)
                            }));
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl shadow-lg transition-transform active:scale-95"
                          title="Reject"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {state.isProcessing && (
                  <div className={`aspect-square border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center space-y-4 ${
                    state.isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-gray-100 bg-gray-50'
                  }`}>
                    <div className={`w-12 h-12 border-4 rounded-full animate-spin ${
                      state.isDarkMode ? 'border-slate-800 border-t-white' : 'border-gray-200 border-t-black'
                    }`}></div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${state.isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Rendering Next...</p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-1 space-y-6">
                {state.activeMode !== 'upscale' && (
                  <div className={`p-6 rounded-[2rem] border shadow-xl space-y-6 sticky top-32 transition-colors duration-500 ${
                    state.isDarkMode ? 'bg-slate-900/80 border-slate-700 shadow-2xl' : 'glass-card border-gray-100 shadow-xl'
                  }`}>
                    <h3 className={`text-sm font-black uppercase tracking-widest ${state.isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quick Adjustments</h3>
                    
                    <div className="space-y-4">
                      <div className={`p-4 rounded-2xl flex flex-col gap-4 border ${state.isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                        <span className={`text-[10px] font-black uppercase tracking-widest text-center ${state.isDarkMode ? 'text-white' : 'text-gray-900'}`}>Product Scale</span>
                        <div className="flex items-center justify-center gap-4">
                          <button 
                            onClick={() => {
                              if (state.activeMode === 'retoucher') setOptions(o => ({ ...o, productScale: Math.max(0.1, o.productScale - 0.1) }));
                              else if (state.activeMode === 'fashion') setFashionOptions(o => ({ ...o, productScale: Math.max(0.1, o.productScale - 0.1) }));
                              else setState(s => ({ ...s, promptToImage: { ...s.promptToImage, productScale: Math.max(0.1, s.promptToImage.productScale - 0.1) } }));
                            }}
                            className={`w-10 h-10 flex items-center justify-center border rounded-xl transition-colors shadow-sm ${
                              state.isDarkMode ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                          </button>
                          <span className={`text-lg font-black w-16 text-center ${state.isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {state.activeMode === 'retoucher' ? options.productScale.toFixed(1) : state.activeMode === 'fashion' ? fashionOptions.productScale.toFixed(1) : state.promptToImage.productScale.toFixed(1)}x
                          </span>
                          <button 
                            onClick={() => {
                              if (state.activeMode === 'retoucher') setOptions(o => ({ ...o, productScale: Math.min(2.0, o.productScale + 0.1) }));
                              else if (state.activeMode === 'fashion') setFashionOptions(o => ({ ...o, productScale: Math.min(2.0, o.productScale + 0.1) }));
                              else setState(s => ({ ...s, promptToImage: { ...s.promptToImage, productScale: Math.min(2.0, s.promptToImage.productScale + 0.1) } }));
                            }}
                            className={`w-10 h-10 flex items-center justify-center border rounded-xl transition-colors shadow-sm ${
                              state.isDarkMode ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                          </button>
                        </div>
                      </div>

                      <button 
                        onClick={handleRetouch}
                        disabled={state.isProcessing}
                        className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl disabled:opacity-50 active:scale-95 ${
                          state.isDarkMode ? 'bg-white text-slate-950 hover:bg-slate-100' : 'bg-black text-white hover:bg-gray-800'
                        }`}
                      >
                        {state.isProcessing ? 'Processing...' : 'Try Generate'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-8 order-2 lg:order-1">
              <div className={`p-8 rounded-[2.5rem] border shadow-xl space-y-8 transition-colors duration-500 ${state.isDarkMode ? 'bg-slate-900/80 border-slate-800 shadow-2xl' : 'glass-card border-gray-100'}`}>
                {state.activeMode === 'retoucher' && (
                  <div className={`pb-6 border-b ${state.isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-[10px] font-black uppercase tracking-widest ${state.isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.sidebar.brandKit}</h3>
                      <button 
                        onClick={() => setState(s => ({ ...s, brandKit: { ...s.brandKit, isLocked: !s.brandKit.isLocked } }))}
                        className={`text-[8px] font-black uppercase px-2 py-1 rounded transition-all ${state.brandKit.isLocked ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}
                      >
                        {state.brandKit.isLocked ? t.sidebar.locked : t.sidebar.lockConfig}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className={`text-[8px] font-black uppercase tracking-widest mb-2 block ${state.isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{t.sidebar.bgPreference}</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            name="bgPreferenceColor"
                            id="bgPreferenceColor"
                            value={state.brandKit.backgroundColor}
                            onChange={(e) => setState(s => ({ ...s, brandKit: { ...s.brandKit, backgroundColor: e.target.value } }))}
                            className={`w-full h-8 rounded-lg cursor-pointer ${state.isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {state.activeMode === 'retoucher' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className={`text-xl font-black tracking-tighter ${state.isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.sidebar.configuration}</h2>
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-black uppercase tracking-widest ${state.isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{t.sidebar.bulkMode}</span>
                        <button 
                          onClick={() => setOptions(o => ({ ...o, isBulkMode: !o.isBulkMode }))}
                          className={`w-10 h-5 rounded-full transition-all relative ${options.isBulkMode ? (state.isDarkMode ? 'bg-white' : 'bg-black') : (state.isDarkMode ? 'bg-slate-700' : 'bg-gray-200')}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${options.isBulkMode ? (state.isDarkMode ? 'left-6 bg-slate-900' : 'left-6 bg-white') : (state.isDarkMode ? 'left-1 bg-slate-400' : 'left-1 bg-white')}`} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className={`text-[10px] font-black uppercase tracking-widest mb-3 block ${state.isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{t.sidebar.targetFinishes}</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['white', 'yellow', 'rose'] as MetalType[]).map((type) => (
                            <button
                              key={type}
                              onClick={() => toggleMetal(type)}
                              className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border ${
                                options.metalTypes.includes(type) 
                                  ? (state.isDarkMode ? 'bg-white text-slate-950 border-white' : 'bg-black text-white border-black') 
                                  : (state.isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-white text-gray-300 border-gray-100')
                              }`}
                            >
                              {t.sidebar.metals[type]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className={`text-[10px] font-black uppercase tracking-widest mb-3 block ${state.isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{t.sidebar.studioEnv}</label>
                        <select 
                          value={options.lighting}
                          onChange={(e) => setOptions({ ...options, lighting: e.target.value as any })}
                          className={`w-full border-none rounded-xl py-3 px-4 text-xs font-bold appearance-none ${state.isDarkMode ? 'bg-slate-800 text-white' : 'bg-gray-50 text-gray-900'}`}
                        >
                          <option value="catalog">{t.sidebar.lighting.catalog}</option>
                          <option value="edge">{t.sidebar.lighting.edge}</option>
                          <option value="balanced">{t.sidebar.lighting.balanced}</option>
                        </select>
                      </div>

                      {/* New Features */}
                      <div>
                        <label className={`text-[10px] font-black uppercase tracking-widest mb-3 block ${state.isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{t.sidebar.catalogExport}</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                          {['Auto', '1:1', '21:9', '16:9', '3:2', '4:3', '5:4', '4:5', '3:4', '2:3', '9:16'].map(ratio => {
                            const isSelected = options.aspectRatio === ratio;
                            
                            // Visual frame logic
                            let w = "16px";
                            let h = "16px";
                            if (ratio !== 'Auto') {
                              const [rw, rh] = ratio.split(':').map(Number);
                              const maxDim = 16;
                              if (rw > rh) {
                                w = `${maxDim}px`;
                                h = `${(rh / rw) * maxDim}px`;
                              } else {
                                h = `${maxDim}px`;
                                w = `${(rw / rh) * maxDim}px`;
                              }
                            }

                            return (
                              <button
                                key={ratio}
                                onClick={() => setOptions({ ...options, aspectRatio: ratio as AspectRatio })}
                                className={`flex-shrink-0 flex items-center gap-2 py-2 px-3 rounded-xl transition-all border ${
                                  isSelected
                                    ? (state.isDarkMode ? 'bg-white text-slate-950 border-white' : 'bg-black text-white border-black')
                                    : (state.isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-white text-gray-500 border-gray-200')
                                }`}
                              >
                                {ratio !== 'Auto' && (
                                  <div className="flex items-center justify-center w-4 h-4">
                                    <div 
                                      className={`border-[1.5px] rounded-[2px] ${isSelected ? (state.isDarkMode ? 'border-slate-950' : 'border-white') : (state.isDarkMode ? 'border-slate-400' : 'border-gray-400')}`} 
                                      style={{ width: w, height: h }} 
                                    />
                                  </div>
                                )}
                                <span className="text-[10px] font-black">{ratio}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className={`text-[10px] font-black uppercase tracking-widest mb-3 block ${state.isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{t.sidebar.jewelChanger}</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['original', 'diamond', 'emerald', 'ruby', 'sapphire', 'amethyst'] as StoneType[]).map(stone => (
                            <button
                              key={stone}
                              onClick={() => toggleStoneType(stone)}
                              className={`py-2 rounded-xl text-[8px] font-black uppercase transition-all border ${
                                options.stoneTypes.includes(stone)
                                  ? (state.isDarkMode ? 'bg-white text-slate-950 border-white' : 'bg-black text-white border-black')
                                  : (state.isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-white text-gray-300 border-gray-100')
                              }`}
                            >
                              {t.sidebar.stones[stone]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className={`p-4 rounded-2xl flex items-center justify-between border ${state.isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="flex flex-col">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${state.isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.sidebar.packagingShot}</span>
                          <span className={`text-[8px] font-bold uppercase ${state.isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{t.sidebar.packagingDesc}</span>
                        </div>
                        <button 
                          onClick={() => setOptions({ ...options, isPackagingShot: !options.isPackagingShot })}
                          className={`w-10 h-5 rounded-full transition-all relative ${options.isPackagingShot ? (state.isDarkMode ? 'bg-white' : 'bg-black') : (state.isDarkMode ? 'bg-slate-700' : 'bg-gray-200')}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${options.isPackagingShot ? (state.isDarkMode ? 'left-6 bg-slate-900' : 'left-6 bg-white') : (state.isDarkMode ? 'left-1 bg-slate-400' : 'left-1 bg-white')}`} />
                        </button>
                      </div>

                      <div className={`p-4 rounded-2xl space-y-4 border ${state.isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${state.isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.sidebar.watermarkProt}</span>
                            <span className={`text-[8px] font-bold uppercase ${state.isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{t.sidebar.watermarkDesc}</span>
                          </div>
                          <button 
                            onClick={() => setState(s => ({ ...s, isWatermarkEnabled: !s.isWatermarkEnabled }))}
                            className={`w-10 h-5 rounded-full transition-all relative ${state.isWatermarkEnabled ? (state.isDarkMode ? 'bg-white' : 'bg-black') : (state.isDarkMode ? 'bg-slate-700' : 'bg-gray-200')}`}
                          >
                            <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${state.isWatermarkEnabled ? (state.isDarkMode ? 'left-6 bg-slate-900' : 'left-6 bg-white') : (state.isDarkMode ? 'left-1 bg-slate-400' : 'left-1 bg-white')}`} />
                          </button>
                        </div>

                        {state.isWatermarkEnabled && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="pt-4 border-t border-gray-100 dark:border-slate-700 space-y-4"
                          >
                            <div className="space-y-2">
                              <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">{t.sidebar.watermarkType}</label>
                              <div className="flex gap-2">
                                {(['text', 'image'] as const).map(type => (
                                  <button
                                    key={type}
                                    onClick={() => setState(s => ({ ...s, watermark: { ...s.watermark, type } }))}
                                    className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all border ${
                                      state.watermark.type === type 
                                        ? (state.isDarkMode ? 'bg-white text-slate-900 border-white' : 'bg-black text-white border-black')
                                        : (state.isDarkMode ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-white text-gray-400 border-gray-100')
                                    }`}
                                  >
                                    {type === 'text' ? t.sidebar.watermarkText : t.sidebar.watermarkLogo}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {state.watermark.type === 'text' ? (
                              <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">{t.sidebar.watermarkLabel}</label>
                                <input 
                                  type="text"
                                  value={state.watermark.text}
                                  onChange={(e) => setState(s => ({ ...s, watermark: { ...s.watermark, text: e.target.value } }))}
                                  className={`w-full py-2 px-3 rounded-xl text-[10px] font-bold border-none outline-none focus:ring-0 ${state.isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-gray-900 shadow-inner'}`}
                                />
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">{t.sidebar.watermarkLogo}</label>
                                <div className={`relative border-2 border-dashed rounded-xl py-3 px-4 text-center cursor-pointer overflow-hidden ${state.isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'}`}>
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => e.target.files && handleWatermarkLogoUpload(e.target.files[0])}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                  />
                                  {state.watermark.image?.preview ? (
                                    <div className="flex items-center justify-center gap-2">
                                      <img src={state.watermark.image.preview} className="w-6 h-6 object-contain rounded" />
                                      <span className="text-[8px] font-black uppercase text-gray-400 truncate">{state.watermark.image.name}</span>
                                    </div>
                                  ) : (
                                    <span className="text-[8px] font-black uppercase text-gray-400">Upload Logo Image</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>


                    </div>
                  </>
                ) : state.activeMode === 'fashion' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-black text-gray-900 tracking-tighter">{t.fashion.setup}</h2>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">{t.fashion.category}</label>
                        <div className="grid grid-cols-1 gap-2">
                          {(['ring', 'necklace', 'earrings'] as ProductType[]).map((type) => (
                            <button
                              key={type}
                              onClick={() => toggleProductType(type)}
                              className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border flex items-center justify-between ${
                                fashionOptions.productTypes.includes(type) ? 'bg-black text-white border-black' : 'bg-white text-gray-300 border-gray-100'
                              }`}
                            >
                              <span>{t.fashion.productTypes[type]}</span>
                              {fashionOptions.productTypes.includes(type) && <span className="w-2 h-2 bg-white rounded-full"></span>}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">{t.fashion.aesthetic}</label>
                        <select 
                          value={fashionOptions.modelStyle}
                          onChange={(e) => setFashionOptions({ ...fashionOptions, modelStyle: e.target.value as any })}
                          className={`w-full border-none rounded-xl py-3 px-4 text-xs font-bold appearance-none ${state.isDarkMode ? 'bg-slate-800 text-white' : 'bg-gray-50 text-gray-900'}`}
                        >
                          <option value="editorial">{t.fashion.aesthetics.editorial}</option>
                          <option value="lifestyle">{t.fashion.aesthetics.lifestyle}</option>
                          <option value="minimal">{t.fashion.aesthetics.minimal}</option>
                          <option value="style-reference">{t.fashion.aesthetics["style-reference"]}</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">{t.fashion.environment}</label>
                        <select 
                          value={fashionOptions.environment}
                          onChange={(e) => setFashionOptions({ ...fashionOptions, environment: e.target.value as any })}
                          className={`w-full border-none rounded-xl py-3 px-4 text-xs font-bold appearance-none mb-4 ${state.isDarkMode ? 'bg-slate-800 text-white' : 'bg-gray-50 text-gray-900'}`}
                        >
                          <option value="studio">{t.fashion.environments.studio}</option>
                          <option value="outdoor">{t.fashion.environments.outdoor}</option>
                          <option value="luxury-interior">{t.fashion.environments["luxury-interior"]}</option>
                          <option value="reference">{t.fashion.environments.reference}</option>
                        </select>

                        {fashionOptions.environment === 'reference' && (
                           <div className={`p-4 rounded-xl border space-y-4 animate-in fade-in ${state.isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                              <div className="flex bg-gray-200 dark:bg-slate-900 rounded-lg p-1">
                                <button
                                  onClick={() => setFashionOptions({ ...fashionOptions, referenceEnvType: 'prompt' })}
                                  className={`flex-1 text-[10px] font-black uppercase py-2 rounded-md transition-all ${fashionOptions.referenceEnvType === 'prompt' ? (state.isDarkMode ? 'bg-slate-700 text-white' : 'bg-white text-gray-900 shadow-sm') : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                  {t.prompt.types.prompt}
                                </button>
                                <button
                                  onClick={() => setFashionOptions({ ...fashionOptions, referenceEnvType: 'image' })}
                                  className={`flex-1 text-[10px] font-black uppercase py-2 rounded-md transition-all ${fashionOptions.referenceEnvType === 'image' ? (state.isDarkMode ? 'bg-slate-700 text-white' : 'bg-white text-gray-900 shadow-sm') : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                  {t.prompt.types.image}
                                </button>
                              </div>
                              
                              {fashionOptions.referenceEnvType === 'prompt' ? (
                                <textarea
                                  value={fashionOptions.referenceEnvPrompt}
                                  onChange={(e) => setFashionOptions({ ...fashionOptions, referenceEnvPrompt: e.target.value })}
                                  placeholder={t.prompt.placeholder}
                                  className={`w-full border-none rounded-xl p-4 text-xs resize-none h-24 ${state.isDarkMode ? 'bg-slate-900 text-white placeholder-slate-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                                />
                              ) : (
                                <div className="space-y-2">
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    id="fashionEnvImageUpload"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => setFashionOptions({ ...fashionOptions, referenceEnvImage: { file, preview: URL.createObjectURL(file), base64: reader.result as string } });
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                  {fashionOptions.referenceEnvImage.preview ? (
                                    <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-200">
                                      <img src={fashionOptions.referenceEnvImage.preview} className="w-full h-full object-cover" />
                                      <button onClick={() => setFashionOptions({ ...fashionOptions, referenceEnvImage: { file: null, preview: null, base64: null } })} className="absolute top-2 right-2 bg-red-500 text-white text-[8px] px-2 py-1 rounded">Clear</button>
                                    </div>
                                  ) : (
                                    <label htmlFor="fashionEnvImageUpload" className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer ${state.isDarkMode ? 'border-slate-600 hover:border-slate-400' : 'border-gray-200 hover:border-gray-300'}`}>
                                      <span className="text-[10px] font-black uppercase text-gray-400">Upload Image</span>
                                    </label>
                                  )}
                                </div>
                              )}
                           </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">{t.fashion.outfit}</label>
                          <select 
                            value={fashionOptions.outfitType}
                            onChange={(e) => setFashionOptions({ ...fashionOptions, outfitType: e.target.value as any })}
                            className={`w-full border-none rounded-xl py-3 px-4 text-xs font-bold appearance-none ${state.isDarkMode ? 'bg-slate-800 text-white' : 'bg-gray-50 text-gray-900'}`}
                          >
                            <option value="reference">{t.fashion.outfits.reference}</option>
                            <option value="luxury">{t.fashion.outfits.luxury}</option>
                            <option value="daily">{t.fashion.outfits.daily}</option>
                          </select>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between border border-gray-100">
                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{t.fashion.accessory}</span>
                        <button 
                          onClick={() => setFashionOptions({ ...fashionOptions, hasAdditionalAccessory: !fashionOptions.hasAdditionalAccessory })}
                          className={`w-10 h-5 rounded-full transition-all relative ${fashionOptions.hasAdditionalAccessory ? 'bg-black' : 'bg-gray-200'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${fashionOptions.hasAdditionalAccessory ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>

                      {/* Fashion New Features */}
                      <div>
                        <label className={`text-[10px] font-black uppercase tracking-widest mb-3 block ${state.isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{t.fashion.aspectRatio}</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                          {['Auto', '1:1', '21:9', '16:9', '3:2', '4:3', '5:4', '4:5', '3:4', '2:3', '9:16'].map(ratio => {
                            const isSelected = fashionOptions.aspectRatio === ratio;
                            
                            let w = "16px";
                            let h = "16px";
                            if (ratio !== 'Auto') {
                              const [rw, rh] = ratio.split(':').map(Number);
                              const maxDim = 16;
                              if (rw > rh) {
                                w = `${maxDim}px`;
                                h = `${(rh / rw) * maxDim}px`;
                              } else {
                                h = `${maxDim}px`;
                                w = `${(rw / rh) * maxDim}px`;
                              }
                            }

                            return (
                              <button
                                key={ratio}
                                onClick={() => setFashionOptions({ ...fashionOptions, aspectRatio: ratio as AspectRatio })}
                                className={`flex-shrink-0 flex items-center gap-2 py-2 px-3 rounded-xl transition-all border ${
                                  isSelected
                                    ? (state.isDarkMode ? 'bg-white text-slate-950 border-white' : 'bg-black text-white border-black')
                                    : (state.isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-white text-gray-500 border-gray-200')
                                }`}
                              >
                                {ratio !== 'Auto' && (
                                  <div className="flex items-center justify-center w-4 h-4">
                                    <div 
                                      className={`border-[1.5px] rounded-[2px] ${isSelected ? (state.isDarkMode ? 'border-slate-950' : 'border-white') : (state.isDarkMode ? 'border-slate-400' : 'border-gray-400')}`} 
                                      style={{ width: w, height: h }} 
                                    />
                                  </div>
                                )}
                                <span className="text-[10px] font-black">{ratio}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className={`p-4 rounded-2xl flex items-center justify-between border ${state.isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="flex flex-col">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${state.isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.fashion.lifestyleCollage}</span>
                          <span className={`text-[8px] font-bold uppercase ${state.isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{t.fashion.collageDesc}</span>
                        </div>
                        <button 
                          onClick={() => setFashionOptions({ ...fashionOptions, isLifestyleCollage: !fashionOptions.isLifestyleCollage })}
                          className={`w-10 h-5 rounded-full transition-all relative ${fashionOptions.isLifestyleCollage ? (state.isDarkMode ? 'bg-white' : 'bg-black') : (state.isDarkMode ? 'bg-slate-700' : 'bg-gray-200')}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${fashionOptions.isLifestyleCollage ? (state.isDarkMode ? 'left-6 bg-slate-900' : 'left-6 bg-white') : (state.isDarkMode ? 'left-1 bg-slate-400' : 'left-1 bg-white')}`} />
                        </button>
                      </div>

                      <div className={`p-4 rounded-2xl space-y-4 border ${state.isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${state.isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.fashion.styleRange}</span>
                            <span className={`text-[8px] font-bold uppercase ${state.isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{t.fashion.styleDesc}</span>
                          </div>
                          <button 
                            onClick={() => setFashionOptions({ ...fashionOptions, styleRange: { ...fashionOptions.styleRange, enabled: !fashionOptions.styleRange.enabled } })}
                            className={`w-10 h-5 rounded-full transition-all relative ${fashionOptions.styleRange.enabled ? (state.isDarkMode ? 'bg-white' : 'bg-black') : (state.isDarkMode ? 'bg-slate-700' : 'bg-gray-200')}`}
                          >
                            <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${fashionOptions.styleRange.enabled ? (state.isDarkMode ? 'left-6 bg-slate-900' : 'left-6 bg-white') : (state.isDarkMode ? 'left-1 bg-slate-400' : 'left-1 bg-white')}`} />
                          </button>
                        </div>
                        {fashionOptions.styleRange.enabled && (
                          <div className="flex items-center gap-2 animate-in fade-in duration-300">
                             <label className="text-[8px] font-black uppercase text-gray-400">{t.fashion.bgColor}</label>
                             <input 
                               type="color" 
                               value={fashionOptions.styleRange.bgColor}
                               onChange={(e) => setFashionOptions({ ...fashionOptions, styleRange: { ...fashionOptions.styleRange, bgColor: e.target.value } })}
                               className="w-full h-8 rounded-lg cursor-pointer"
                             />
                          </div>
                        )}
                      </div>


                    </div>
                  </>
                ) : state.activeMode === 'prompt-to-image' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className={`text-xl font-black tracking-tighter ${state.isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.prompt.setup}</h2>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className={`text-[10px] font-black uppercase tracking-widest mb-3 block ${state.isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{t.prompt.inputType}</label>
                        <div className="flex gap-2">
                          {(['prompt', 'image'] as const).map(m => (
                            <button 
                              key={m} 
                              onClick={() => setState(s => ({ ...s, promptToImage: { ...s.promptToImage, inputType: m } }))} 
                              className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${
                                state.promptToImage.inputType === m 
                                  ? (state.isDarkMode ? 'bg-white text-slate-900 border-white' : 'bg-black text-white border-black') 
                                  : (state.isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-white text-gray-300 border-gray-100')
                              }`}
                            >
                              {t.prompt.types[m]}
                            </button>
                          ))}
                        </div>
                      </div>

                      {state.promptToImage.inputType === 'prompt' ? (
                        <div>
                          <label className={`text-[10px] font-black uppercase tracking-widest mb-3 block ${state.isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{t.prompt.vision}</label>
                          <textarea 
                            value={state.promptToImage.userPrompt}
                            onChange={(e) => setState(s => ({ 
                              ...s, 
                              promptToImage: { 
                                ...s.promptToImage, 
                                userPrompt: e.target.value,
                                enhancedPrompt: '' // Clear optimization if user edits manually
                              } 
                            }))}
                            placeholder={t.prompt.placeholder}
                            className={`w-full border-none rounded-xl py-3 px-4 text-xs font-bold min-h-[100px] resize-none focus:ring-2 transition-all ${
                              state.isDarkMode ? 'bg-slate-800 text-white focus:ring-white' : 'bg-gray-50 text-gray-900 focus:ring-black'
                            }`}
                          />
                        </div>
                      ) : (
                        <ImageUploader 
                          label={t.prompt.styleRef} 
                          description={t.prompt.refDesc}
                          imageState={state.promptToImage.referenceImage}
                          onUpload={handlePromptToImageRefUpload}
                          onClear={() => setState(s => ({ ...s, promptToImage: { ...s.promptToImage, referenceImage: { file: null, preview: null, base64: null } } }))}
                        />
                      )}

                      <button 
                        onClick={handleEnhancePrompt}
                        disabled={state.isProcessing || (state.promptToImage.inputType === 'prompt' ? !state.promptToImage.userPrompt : !state.promptToImage.referenceImage.base64)}
                        className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                          state.promptToImage.enhancedPrompt 
                            ? (state.isDarkMode ? 'bg-green-900/30 text-green-400 border border-green-800/50' : 'bg-green-50 text-green-600 border border-green-100')
                            : (state.isDarkMode ? 'bg-slate-800 hover:bg-slate-750 text-white' : 'bg-gray-100 hover:bg-gray-200 text-black')
                        }`}
                      >
                        {state.promptToImage.enhancedPrompt ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            {t.prompt.optimized}
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            {state.promptToImage.inputType === 'prompt' ? t.prompt.optimizer : t.prompt.analyze}
                          </>
                        )}
                      </button>

                      <div>
                        <label className={`text-[10px] font-black uppercase tracking-widest mb-3 block ${state.isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{t.sidebar.catalogExport || 'Aspect Ratio'}</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                          {['Auto', '1:1', '21:9', '16:9', '3:2', '4:3', '5:4', '4:5', '3:4', '2:3', '9:16'].map(ratio => {
                            const isSelected = state.promptToImage.aspectRatio === ratio;
                            
                            let w = "16px";
                            let h = "16px";
                            if (ratio !== 'Auto') {
                              const [rw, rh] = ratio.split(':').map(Number);
                              const maxDim = 16;
                              if (rw > rh) {
                                w = `${maxDim}px`;
                                h = `${(rh / rw) * maxDim}px`;
                              } else {
                                h = `${maxDim}px`;
                                w = `${(rw / rh) * maxDim}px`;
                              }
                            }

                            return (
                              <button
                                key={ratio}
                                onClick={() => setState(s => ({ ...s, promptToImage: { ...s.promptToImage, aspectRatio: ratio as AspectRatio } }))}
                                className={`flex-shrink-0 flex items-center gap-2 py-2 px-3 rounded-xl transition-all border ${
                                  isSelected
                                    ? (state.isDarkMode ? 'bg-white text-slate-950 border-white' : 'bg-black text-white border-black')
                                    : (state.isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-white text-gray-500 border-gray-200')
                                }`}
                              >
                                {ratio !== 'Auto' && (
                                  <div className="flex items-center justify-center w-4 h-4">
                                    <div 
                                      className={`border-[1.5px] rounded-[2px] ${isSelected ? (state.isDarkMode ? 'border-slate-950' : 'border-white') : (state.isDarkMode ? 'border-slate-400' : 'border-gray-400')}`} 
                                      style={{ width: w, height: h }} 
                                    />
                                  </div>
                                )}
                                <span className="text-[10px] font-black">{ratio}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  </>
                ) : state.activeMode === 'upscale' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className={`text-xl font-black tracking-tighter ${state.isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.upscale.setup}</h2>
                    </div>
                    <div className="space-y-6">
                      <p className={`text-[10px] font-bold uppercase tracking-widest leading-relaxed ${state.isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                        {t.upscale.description}
                      </p>
                    </div>
                  </>
                ) : state.activeMode === 'video' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className={`text-xl font-black tracking-tighter ${state.isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.video.setup}</h2>
                    </div>
                    <div className="space-y-6">
                      <p className={`text-[10px] font-bold uppercase tracking-widest leading-relaxed ${state.isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                        {t.video.description}
                      </p>
                      <div>
                        <label className={`text-[10px] font-black uppercase tracking-widest mb-3 block ${state.isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{t.video.speed}</label>
                        <select 
                          value={state.videoOptions.rotationSpeed}
                          onChange={(e) => setState(s => ({ ...s, videoOptions: { ...s.videoOptions, rotationSpeed: e.target.value } }))}
                          className={`w-full border-none rounded-xl py-3 px-4 text-xs font-bold appearance-none ${state.isDarkMode ? 'bg-slate-800 text-white' : 'bg-gray-50 text-gray-900'}`}
                        >
                          <option value="slow">{t.video.speeds.slow}</option>
                          <option value="normal">{t.video.speeds.normal}</option>
                          <option value="fast">{t.video.speeds.fast}</option>
                        </select>
                      </div>
                      <div>
                        <label className={`text-[10px] font-black uppercase tracking-widest mb-3 block ${state.isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{t.video.bgColor}</label>
                        <input 
                          type="color" 
                          value={state.videoOptions.backgroundColor}
                          onChange={(e) => setState(s => ({ ...s, videoOptions: { ...s.videoOptions, backgroundColor: e.target.value } }))}
                          className={`w-full h-10 rounded-xl cursor-pointer ${state.isDarkMode ? 'bg-slate-800 border-none px-2 py-1' : 'bg-gray-50 border-gray-100 p-1 border'}`}
                        />
                      </div>
                    </div>
                  </>
                ) : null}

                {(state.activeMode === 'fashion' || state.activeMode === 'prompt-to-image') && (
                  <div className={`pt-4 border-t space-y-4 ${state.isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
                    <div className={`flex items-center justify-between p-4 rounded-2xl border ${state.isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${state.isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.consistency.label}</p>
                        <p className={`text-[8px] font-bold uppercase mt-1 ${state.isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{t.consistency.desc}</p>
                      </div>
                      <button 
                        onClick={() => setState(s => ({ ...s, isConsistentModelEnabled: !s.isConsistentModelEnabled }))}
                        className={`w-10 h-5 rounded-full transition-all relative ${state.isConsistentModelEnabled ? (state.isDarkMode ? 'bg-white' : 'bg-black') : (state.isDarkMode ? 'bg-slate-700' : 'bg-gray-200')}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${state.isConsistentModelEnabled ? (state.isDarkMode ? 'left-6 bg-slate-900' : 'left-6 bg-white') : (state.isDarkMode ? 'left-1 bg-slate-400' : 'left-1 bg-white')}`} />
                      </button>
                    </div>

                    {state.isConsistentModelEnabled && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <ImageUploader 
                          label="Model Reference" 
                          description="Select face/hair to maintain"
                          imageState={state.consistentModel}
                          onUpload={handleConsistentModelUpload}
                          onClear={() => setState(s => ({ ...s, consistentModel: { file: null, preview: null, base64: null } }))}
                        />
                      </div>
                    )}
                  </div>
                )}

                <button
                  disabled={state.isProcessing || (state.activeMode === 'retoucher' ? state.rawImages.length === 0 : state.activeMode === 'fashion' ? state.fashionReferences.length === 0 : state.activeMode === 'upscale' ? !state.upscaleImage.base64 : !state.promptToImage.productImage.base64)}
                  onClick={handleRetouch}
                  className={`w-full py-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all relative overflow-hidden shadow-2xl active:scale-95
                    ${state.isProcessing || (state.activeMode === 'retoucher' ? state.rawImages.length === 0 : state.activeMode === 'fashion' ? state.fashionReferences.length === 0 : state.activeMode === 'upscale' ? !state.upscaleImage.base64 : !state.promptToImage.productImage.base64) 
                      ? (state.isDarkMode ? 'bg-slate-800 text-slate-600' : 'bg-gray-100 text-gray-300') 
                      : (state.isDarkMode ? 'bg-white text-slate-950 hover:bg-slate-100' : 'bg-black text-white hover:bg-gray-800')}
                  `}
                >
                  {state.isProcessing ? (
                    <div className="flex items-center justify-center space-x-2">
                       <span className="animate-pulse">{t.sidebar.processing}</span>
                       <span className="bg-white/20 px-2 py-0.5 rounded text-[8px]">{state.processingProgress}%</span>
                    </div>
                  ) : state.activeMode === 'retoucher' ? t.sidebar.executeBatch : state.activeMode === 'fashion' ? t.sidebar.generateFashion : state.activeMode === 'upscale' ? t.sidebar.enhanceClarity : t.sidebar.generateAI}
                </button>
                {state.error && <p className="text-center text-[10px] text-red-500 font-bold uppercase tracking-tighter">{state.error}</p>}
              </div>
            </div>

            <div className="lg:col-span-8 space-y-8 order-1 lg:order-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {state.activeMode === 'retoucher' ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between items-end mb-2">
                          <h3 className={`text-sm font-black uppercase tracking-widest ${state.isDarkMode ? 'text-white' : 'text-gray-900'}`}>Product Input {options.isBulkMode && '(Bulk)'}</h3>
                          {state.rawImages.length > 0 && <button onClick={() => setState(p => ({ ...p, rawImages: [] }))} className="text-[10px] text-red-500 font-bold uppercase transition-colors hover:text-red-400">Clear All</button>}
                      </div>
                      <div className={`relative border-2 border-dashed rounded-[2.5rem] group transition-all overflow-hidden min-h-[300px] flex flex-col p-4 ${
                        state.isDarkMode 
                          ? 'bg-slate-900 border-slate-800 hover:border-white' 
                          : 'bg-white border-gray-200 hover:border-black'
                      }`}>
                          <input 
                            type="file" 
                            multiple={options.isBulkMode} 
                            className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                            onChange={(e) => e.target.files && handleBulkUpload(e.target.files)}
                          />
                          {state.rawImages.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {state.rawImages.map((img, idx) => (
                                <div key={idx} className={`aspect-square rounded-2xl overflow-hidden border relative ${state.isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                                  <img src={img.preview!} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/5 flex items-end p-2">
                                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-black truncate ${state.isDarkMode ? 'bg-slate-900/90 text-slate-400' : 'bg-white/90 text-gray-500'}`}>{img.name}</span>
                                  </div>
                                </div>
                              ))}
                              <div className="aspect-square border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center text-gray-300">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center"><svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{options.isBulkMode ? 'Drop Multiple Photos' : 'Click to Upload Master'}</p>
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-end mb-2">
                          <h3 className={`text-sm font-black uppercase tracking-widest ${state.isDarkMode ? 'text-white' : 'text-gray-900'}`}>Style Ref</h3>
                          {state.referenceImage.base64 && <button onClick={() => setState(prev => ({ ...prev, referenceImage: { file: null, preview: null, base64: null } }))} className="text-[10px] text-red-500 font-bold uppercase transition-colors hover:text-red-400">Clear</button>}
                      </div>
                      <div className={`relative border-2 border-dashed rounded-[2.5rem] group transition-all overflow-hidden min-h-[300px] flex flex-col p-4 ${
                        state.isDarkMode 
                          ? 'bg-slate-900 border-slate-800 hover:border-white' 
                          : 'bg-white border-gray-200 hover:border-black'
                      }`}>
                          <input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                            onChange={(e) => e.target.files?.[0] && handleRefUpload(e.target.files[0])}
                          />
                          {state.referenceImage.base64 ? (
                            <div className={`flex-1 rounded-2xl overflow-hidden border relative ${state.isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                              <img src={state.referenceImage.preview!} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/5 flex items-end p-4">
                                  <span className={`text-[10px] px-2 py-1 rounded font-black truncate ${state.isDarkMode ? 'bg-slate-900/90 text-slate-400' : 'bg-white/90 text-gray-500'}`}>{state.referenceImage.name || 'Reference Image'}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center"><svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg></div>
                              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Click to Upload Reference</p>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Reference lighting</p>
                            </div>
                          )}
                      </div>
                    </div>
                  </>
                ) : state.activeMode === 'fashion' ? (
                  <div className="md:col-span-2 space-y-8">
                    <div className="space-y-2">
                        <div className="flex justify-between items-end mb-2">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Jewelry Reference Assets</h3>
                            {state.fashionReferences.length > 0 && <button onClick={() => setState(p => ({ ...p, fashionReferences: [] }))} className="text-[10px] text-red-500 font-bold uppercase">Clear All</button>}
                        </div>
                        <div className="relative border-2 border-dashed border-gray-200 rounded-[2.5rem] bg-white group hover:border-black transition-all overflow-hidden min-h-[200px] flex flex-col p-6">
                            <input 
                              type="file" 
                              multiple 
                              className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                              onChange={(e) => e.target.files && handleFashionUpload(e.target.files)}
                            />
                            {state.fashionReferences.length > 0 ? (
                              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                {state.fashionReferences.map((img, idx) => (
                                  <div key={idx} className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 relative shadow-sm">
                                    <img src={img.preview!} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/5 flex items-end p-2">
                                        <span className="text-[8px] bg-white/90 px-1.5 py-0.5 rounded font-black text-gray-500 truncate">{img.name}</span>
                                    </div>
                                  </div>
                                ))}
                                <div className="aspect-square border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-300 bg-gray-50/50">
                                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                  <span className="text-[8px] font-black uppercase">Add More</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                                <div className="w-16 h-16 bg-gray-50 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Upload Jewelry Assets</p>
                                </div>
                              </div>
                            )}
                        </div>
                    </div>

                    {fashionOptions.modelStyle === 'style-reference' && (
                      <div className="animate-in slide-in-from-top-4 duration-500">
                        <ImageUploader 
                          label="Model Pose Reference" 
                          description="Exact pose & style"
                          imageState={state.modelReference}
                          onUpload={handleModelRefUpload}
                          onClear={() => setState(prev => ({ ...prev, modelReference: { file: null, preview: null, base64: null } }))}
                        />
                      </div>
                    )}

                    {fashionOptions.outfitType === 'reference' && (
                      <div className="animate-in slide-in-from-top-4 duration-500">
                        <ImageUploader 
                          label="Outfit Reference" 
                          description="Exact clothing style"
                          imageState={state.outfitReference}
                          onUpload={handleOutfitRefUpload}
                          onClear={() => setState(prev => ({ ...prev, outfitReference: { file: null, preview: null, base64: null } }))}
                        />
                      </div>
                    )}

                    {fashionOptions.hasAdditionalAccessory && (
                      <div className="animate-in slide-in-from-top-4 duration-500">
                        <ImageUploader 
                          label="Accessory Reference" 
                          description="Include this item"
                          imageState={state.accessoryReference}
                          onUpload={handleAccessoryRefUpload}
                          onClear={() => setState(prev => ({ ...prev, accessoryReference: { file: null, preview: null, base64: null } }))}
                        />
                      </div>
                    )}

                    {fashionOptions.faceType === 'reference' && (
                      <div className="animate-in slide-in-from-top-4 duration-500">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h3 className="text-sm font-black text-gray-900">Model Face Reference</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Add 1-10 photos of the face</p>
                          </div>
                          <button 
                            onClick={() => setState(prev => ({ ...prev, faceReferences: [] }))}
                            className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-600"
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {state.faceReferences.map((ref, idx) => (
                            <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 group">
                              <img src={ref.preview!} alt={`Face ${idx + 1}`} className="w-full h-full object-cover" />
                              <button 
                                onClick={() => removeFaceRef(idx)}
                                className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          ))}
                          {state.faceReferences.length < 10 && (
                            <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors">
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                  const files = Array.from(e.target.files || []);
                                  files.slice(0, 10 - state.faceReferences.length).forEach(handleFaceRefUpload);
                                }}
                              />
                              <svg className="w-6 h-6 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Add Face</span>
                            </label>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : state.activeMode === 'upscale' ? (
                  <div className="md:col-span-2 space-y-8">
                    <div className="space-y-2">
                      <div className="flex justify-between items-end mb-2">
                        <h3 className={`text-sm font-black uppercase tracking-widest ${state.isDarkMode ? 'text-white' : 'text-gray-900'}`}>Image to Upscale</h3>
                        {state.upscaleImage.base64 && <button onClick={() => setState(p => ({ ...p, upscaleImage: { file: null, preview: null, base64: null } }))} className="text-[10px] text-red-500 font-bold uppercase hover:text-red-400">Clear</button>}
                      </div>
                      <div className={`relative border-2 border-dashed rounded-[2.5rem] group transition-all overflow-hidden min-h-[300px] flex flex-col p-4 ${
                        state.isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-white' : 'bg-white border-gray-200 hover:border-black'
                      }`}>
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                          onChange={(e) => e.target.files && handleUpscaleUpload(e.target.files[0])}
                        />
                        {state.upscaleImage.base64 ? (
                          <div className="flex-1 flex items-center justify-center">
                            <img src={state.upscaleImage.preview!} className="max-w-full max-h-[250px] object-contain rounded-2xl shadow-lg border border-gray-100 dark:border-slate-800" />
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${state.isDarkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                              <svg className={`w-8 h-8 ${state.isDarkMode ? 'text-slate-700' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <p className={`text-[11px] font-black uppercase tracking-widest ${state.isDarkMode ? 'text-slate-600' : 'text-gray-400'}`}>Upload Image for Clarity Enhancement</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="md:col-span-2 space-y-8">
                    <div className="space-y-2">
                      <div className="flex justify-between items-end mb-2">
                        <h3 className={`text-sm font-black uppercase tracking-widest ${state.isDarkMode ? 'text-white' : 'text-gray-900'}`}>Product Input</h3>
                        {state.promptToImage.productImage.base64 && <button onClick={() => setState(p => ({ ...p, promptToImage: { ...p.promptToImage, productImage: { file: null, preview: null, base64: null } } }))} className="text-[10px] text-red-500 font-bold uppercase hover:text-red-400">Clear</button>}
                      </div>
                      <div className={`relative border-2 border-dashed rounded-[2.5rem] group transition-all overflow-hidden min-h-[300px] flex flex-col p-4 ${
                        state.isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-white' : 'bg-white border-gray-200 hover:border-black'
                      }`}>
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                          onChange={(e) => e.target.files && handlePromptToImageProductUpload(e.target.files[0])}
                        />
                        {state.promptToImage.productImage.base64 ? (
                          <div className="flex-1 flex items-center justify-center">
                            <img src={state.promptToImage.productImage.preview!} className="max-w-full max-h-[250px] object-contain rounded-2xl shadow-lg border border-gray-100 dark:border-slate-800" />
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${state.isDarkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                              <svg className={`w-8 h-8 ${state.isDarkMode ? 'text-slate-700' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <p className={`text-[11px] font-black uppercase tracking-widest ${state.isDarkMode ? 'text-slate-600' : 'text-gray-400'}`}>Upload Product Image</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={`lg:col-span-12 p-12 border rounded-[3rem] text-center transition-colors duration-500 shadow-sm ${
                state.isDarkMode 
                  ? 'border-slate-800 bg-slate-900/20' 
                  : 'border-gray-50 bg-white/30'
              }`}>
                 <p className={`text-[10px] font-black uppercase tracking-[0.6em] ${
                   state.isDarkMode ? 'text-slate-700' : 'text-gray-200'
                 }`}>Perspective Locking Engine v5.2 Active</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className={`py-12 border-t text-center relative overflow-visible ${state.isDarkMode ? 'border-slate-800' : 'border-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-6 relative">
          <p className={`text-[10px] font-black uppercase tracking-widest relative inline-block ${state.isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
            &copy; 2026 JewelRetouch PRO. All Rights Reserved.
          </p>
        </div>
      </footer>

      {/* Profile & Language Menu (Bottom Left) */}
      <div className="fixed bottom-8 left-8 z-50">
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-[1.5rem] shadow-2xl transition-all active:scale-95 border ${state.isDarkMode ? 'bg-slate-800 border-slate-700 shadow-black/40' : 'bg-white border-gray-100 shadow-gray-200'}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black uppercase ${state.isDarkMode ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
              FD
            </div>
            <div className="text-left hidden md:block">
              <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-0.5 ${state.isDarkMode ? 'text-white' : 'text-gray-900'}`}>Furkan Daldal</p>
              <p className={`text-[8px] font-bold uppercase tracking-widest leading-none ${state.isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{t.profile.proPlan}</p>
            </div>
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={`absolute bottom-full left-0 mb-4 w-64 rounded-[2rem] border shadow-2xl overflow-hidden z-[60] ${state.isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}
              >
                {activeMenu === 'main' ? (
                  <div className="p-2 space-y-1">
                    {/* User Info Header */}
                    <div className="p-4 border-b border-gray-50 dark:border-slate-700 mb-2">
                       <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${state.isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{t.profile.credits}</p>
                       <p className={`text-xl font-black leading-none ${state.isDarkMode ? 'text-white' : 'text-gray-900'}`}>150 <span className="text-[10px] text-gray-400">{t.profile.pts}</span></p>
                       <button className={`w-full mt-3 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-colors ${state.isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-black text-white hover:bg-gray-800'}`}>
                         {t.profile.topUp}
                       </button>
                    </div>

                    <button onClick={() => setShowSettings(true)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${state.isDarkMode ? 'hover:bg-slate-700 text-white' : 'hover:bg-gray-50 text-gray-700'}`}>
                      <span className="text-[10px] font-black uppercase tracking-widest">{t.profile.settings}</span>
                      <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                    <button 
                      onClick={() => setActiveMenu('language')}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${state.isDarkMode ? 'hover:bg-slate-700 text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">{t.profile.language}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-[8px] font-bold uppercase opacity-50">
                          {state.language === 'tr' ? 'Turkish' : state.language === 'en' ? 'English' : state.language === 'fr' ? 'Français' : state.language === 'it' ? 'Italiano' : state.language === 'es' ? 'Español' : state.language === 'de' ? 'Deutsch' : state.language}
                        </span>
                        <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </button>
                    <button onClick={() => setShowSupport(true)} className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors ${state.isDarkMode ? 'hover:bg-slate-700 text-white' : 'hover:bg-gray-50 text-gray-700'}`}>
                      <span className="text-[10px] font-black uppercase tracking-widest">{t.profile.getHelp}</span>
                    </button>
                    <div className={`mx-4 h-px ${state.isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`} />
                    <button className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10`}>
                      <span className="text-[10px] font-black uppercase tracking-widest">{t.profile.logOut}</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    <button 
                      onClick={() => setActiveMenu('main')}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors mb-2 ${state.isDarkMode ? 'hover:bg-slate-700 text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      <span className="text-[10px] font-black uppercase tracking-widest">{t.profile.language}</span>
                    </button>
                    <button 
                      onClick={() => { setState(s => ({ ...s, language: 'tr' })); setActiveMenu('main'); }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${state.language === 'tr' ? (state.isDarkMode ? 'bg-slate-700' : 'bg-gray-100') : ''} ${state.isDarkMode ? 'hover:bg-slate-700 text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">Türkçe</span>
                      {state.language === 'tr' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    </button>
                    <button 
                      onClick={() => { setState(s => ({ ...s, language: 'en' })); setActiveMenu('main'); setShowProfileMenu(false); }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${state.language === 'en' ? (state.isDarkMode ? 'bg-slate-700' : 'bg-gray-100') : ''} ${state.isDarkMode ? 'hover:bg-slate-700 text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">English</span>
                      {state.language === 'en' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    </button>
                    <button 
                      onClick={() => { setState(s => ({ ...s, language: 'fr' })); setActiveMenu('main'); setShowProfileMenu(false); }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${state.language === 'fr' ? (state.isDarkMode ? 'bg-slate-700' : 'bg-gray-100') : ''} ${state.isDarkMode ? 'hover:bg-slate-700 text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">Français</span>
                      {state.language === 'fr' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    </button>
                    <button 
                      onClick={() => { setState(s => ({ ...s, language: 'it' })); setActiveMenu('main'); setShowProfileMenu(false); }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${state.language === 'it' ? (state.isDarkMode ? 'bg-slate-700' : 'bg-gray-100') : ''} ${state.isDarkMode ? 'hover:bg-slate-700 text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">Italiano</span>
                      {state.language === 'it' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    </button>
                    <button 
                      onClick={() => { setState(s => ({ ...s, language: 'de' })); setActiveMenu('main'); setShowProfileMenu(false); }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${state.language === 'de' ? (state.isDarkMode ? 'bg-slate-700' : 'bg-gray-100') : ''} ${state.isDarkMode ? 'hover:bg-slate-700 text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">Deutsch</span>
                      {state.language === 'de' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    </button>
                    <button 
                      onClick={() => { setState(s => ({ ...s, language: 'es' })); setActiveMenu('main'); setShowProfileMenu(false); }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${state.language === 'es' ? (state.isDarkMode ? 'bg-slate-700' : 'bg-gray-100') : ''} ${state.isDarkMode ? 'hover:bg-slate-700 text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">Español</span>
                      {state.language === 'es' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Floating Theme Toggle */}
      <div className="fixed bottom-8 right-8 z-50 flex items-center bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700">
        <button 
          onClick={() => state.isDarkMode && toggleDarkMode()}
          className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all ${!state.isDarkMode ? 'bg-black text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Light</span>
        </button>
        <button 
          onClick={() => !state.isDarkMode && toggleDarkMode()}
          className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all ${state.isDarkMode ? 'bg-white text-slate-900 shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Dark</span>
        </button>
      </div>

      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <img 
            src={selectedImage} 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <SupportModal 
        isOpen={showSupport} 
        onClose={() => setShowSupport(false)} 
        language={state.language} 
        isDarkMode={state.isDarkMode} 
      />

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        language={state.language} 
        isDarkMode={state.isDarkMode} 
      />

    </div>
  );
};

export default App;
