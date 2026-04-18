
import React, { useState, useRef } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ComparisonSlider from './components/ComparisonSlider';
import { AppState, RetouchOptions, MetalType, RetouchResult, ImageState, AppMode, FashionOptions, ProductType } from './types';
import { processJewelryRetouch, processFashionProduction, enhancePrompt, analyzeImageForPrompt, processPromptToImage } from './services/geminiService';

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [isHoveringFurkan, setIsHoveringFurkan] = useState(false);

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
    productScale: 1.0
  });

  const [fashionOptions, setFashionOptions] = useState<FashionOptions>({
    productTypes: ['ring'],
    modelStyle: 'editorial',
    environment: 'studio',
    skinTone: 'natural',
    hairColor: 'dark-brown',
    fingerType: 'normal',
    outfitType: 'luxury',
    hasAdditionalAccessory: false,
    faceType: 'random',
    productScale: 1.0
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
      productScale: 1.0
    },
    upscaleImage: { file: null, preview: null, base64: null },
    consistentModel: { file: null, preview: null, base64: null },
    retouchedResults: [],
    isProcessing: false,
    processingProgress: 0,
    error: null
  });

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
    
    try {
      if (state.activeMode === 'retoucher') {
        const totalSteps = state.rawImages.length * options.metalTypes.length;
        let completedSteps = 0;
        for (const img of state.rawImages) {
          for (const metal of options.metalTypes) {
            const resultUrl = await processJewelryRetouch(
              img.base64!, 
              options, 
              metal, 
              state.referenceImage.base64 || undefined,
              state.consistentModel.base64 || undefined
            );
            
            results.push({ 
              metal, 
              url: resultUrl, 
              sourceName: img.name,
              sourcePreview: img.preview!
            });
            
            completedSteps++;
            setState(prev => {
              // Filter out any existing results that might be duplicates (same URL)
              const otherResults = prev.retouchedResults.filter(r => !results.some(nr => nr.url === r.url));
              return {
                ...prev,
                retouchedResults: [...results, ...otherResults],
                processingProgress: Math.round((completedSteps / totalSteps) * 100)
              };
            });
          }
        }
      } else if (state.activeMode === 'fashion') {
        // Fashion Mode
        const resultUrl = await processFashionProduction(
          state.fashionReferences.map(r => r.base64!),
          fashionOptions,
          state.modelReference.base64 || undefined,
          state.outfitReference.base64 || undefined,
          state.accessoryReference.base64 || undefined,
          state.faceReferences.map(r => r.base64!),
          state.consistentModel.base64 || undefined
        );
        
        const newResult: RetouchResult = {
          metal: 'white', // Placeholder for fashion mode
          url: resultUrl,
          sourceName: 'Fashion Campaign',
          sourcePreview: state.fashionReferences[0].preview!
        };
        
        setState(prev => ({
          ...prev,
          retouchedResults: [newResult, ...prev.retouchedResults],
          processingProgress: 100
        }));
      } else if (state.activeMode === 'upscale') {
        const { processUpscale } = await import('./services/geminiService');
        const resultUrl = await processUpscale(state.upscaleImage.base64!);
        
        const newResult: RetouchResult = {
          metal: 'white',
          url: resultUrl,
          sourceName: 'Upscaled Image',
          sourcePreview: state.upscaleImage.preview!
        };

        setState(prev => ({
          ...prev,
          retouchedResults: [newResult, ...prev.retouchedResults],
          processingProgress: 100
        }));
      } else {
        // Prompt to Image Mode
        const finalPrompt = state.promptToImage.enhancedPrompt || state.promptToImage.userPrompt;
        const resultUrl = await processPromptToImage(
          state.promptToImage.productImage.base64!,
          finalPrompt,
          state.promptToImage.productScale,
          state.promptToImage.referenceImage.base64 || undefined,
          state.consistentModel.base64 || undefined
        );

        const newResult: RetouchResult = {
          metal: 'white',
          url: resultUrl,
          sourceName: 'AI Generated Campaign',
          sourcePreview: state.promptToImage.productImage.preview!
        };

        setState(prev => ({
          ...prev,
          retouchedResults: [newResult, ...prev.retouchedResults],
          processingProgress: 100
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
    link.download = `studio-render-${name}.jpg`;
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        activeMode={state.activeMode} 
        onModeChange={(mode) => setState(s => ({ ...s, activeMode: mode, retouchedResults: [] }))} 
      />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-12 space-y-12">
        {state.retouchedResults.length > 0 ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Gallery Output</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{state.retouchedResults.length} Assets Rendered</p>
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
                    productScale: 1.0
                  },
                  upscaleImage: { file: null, preview: null, base64: null },
                  referenceImage: { file: null, preview: null, base64: null },
                  isProcessing: false 
                }))}
                className="px-8 py-3 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl"
              >
                Reset Studio
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-10">
                {state.retouchedResults.map((res, idx) => (
                  <div key={idx} className="space-y-4 group animate-in zoom-in duration-500">
                    <div className="flex justify-between items-end">
                      <div>
                        <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{res.sourceName || 'Product'}</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{res.metal} Gold Finish</p>
                      </div>
                      <button onClick={() => downloadOne(res.url, `${res.sourceName}-${res.metal}`)} className="text-[10px] font-black uppercase text-blue-600 tracking-widest hover:underline">Download JPG</button>
                    </div>
                    <div className="aspect-square luxury-shadow rounded-[2.5rem] overflow-hidden border border-gray-100 bg-white relative group">
                      {state.activeMode === 'retoucher' ? (
                        <ComparisonSlider before={res.sourcePreview} after={res.url} />
                      ) : (
                        <img 
                          src={res.url} 
                          alt="Fashion Campaign" 
                          className="w-full h-full object-cover cursor-pointer transition-transform duration-700 group-hover:scale-105"
                          onClick={() => setSelectedImage(res.url)}
                        />
                      )}
                    </div>
                  </div>
                ))}
                
                {state.isProcessing && (
                  <div className="aspect-square border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50 flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Rendering Next...</p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-1 space-y-6">
                {state.activeMode !== 'upscale' && (
                  <div className="glass-card p-6 rounded-[2rem] border border-gray-100 shadow-xl space-y-6 sticky top-32">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Quick Adjustments</h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-2xl flex flex-col gap-4 border border-gray-100">
                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest text-center">Product Scale</span>
                        <div className="flex items-center justify-center gap-4">
                          <button 
                            onClick={() => {
                              if (state.activeMode === 'retoucher') setOptions(o => ({ ...o, productScale: Math.max(0.1, o.productScale - 0.1) }));
                              else if (state.activeMode === 'fashion') setFashionOptions(o => ({ ...o, productScale: Math.max(0.1, o.productScale - 0.1) }));
                              else setState(s => ({ ...s, promptToImage: { ...s.promptToImage, productScale: Math.max(0.1, s.promptToImage.productScale - 0.1) } }));
                            }}
                            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                          </button>
                          <span className="text-lg font-black w-16 text-center">
                            {state.activeMode === 'retoucher' ? options.productScale.toFixed(1) : state.activeMode === 'fashion' ? fashionOptions.productScale.toFixed(1) : state.promptToImage.productScale.toFixed(1)}x
                          </span>
                          <button 
                            onClick={() => {
                              if (state.activeMode === 'retoucher') setOptions(o => ({ ...o, productScale: Math.min(2.0, o.productScale + 0.1) }));
                              else if (state.activeMode === 'fashion') setFashionOptions(o => ({ ...o, productScale: Math.min(2.0, o.productScale + 0.1) }));
                              else setState(s => ({ ...s, promptToImage: { ...s.promptToImage, productScale: Math.min(2.0, s.promptToImage.productScale + 0.1) } }));
                            }}
                            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                          </button>
                        </div>
                      </div>

                      <button 
                        onClick={handleRetouch}
                        disabled={state.isProcessing}
                        className="w-full py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl disabled:bg-gray-300 active:scale-95"
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
              <div className="glass-card p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-8">
                {state.activeMode === 'retoucher' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-black text-gray-900 tracking-tighter">Configuration</h2>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Bulk Mode</span>
                        <button 
                          onClick={() => setOptions(o => ({ ...o, isBulkMode: !o.isBulkMode }))}
                          className={`w-10 h-5 rounded-full transition-all relative ${options.isBulkMode ? 'bg-black' : 'bg-gray-200'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${options.isBulkMode ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Target Finishes</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['white', 'yellow', 'rose'] as MetalType[]).map((type) => (
                            <button
                              key={type}
                              onClick={() => toggleMetal(type)}
                              className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border ${
                                options.metalTypes.includes(type) ? 'bg-black text-white border-black' : 'bg-white text-gray-300 border-gray-100'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Studio Environment</label>
                        <select 
                          value={options.lighting}
                          onChange={(e) => setOptions({ ...options, lighting: e.target.value as any })}
                          className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-xs font-bold appearance-none"
                        >
                          <option value="catalog">Standard Studio</option>
                          <option value="edge">Dramatic Edge</option>
                          <option value="balanced">Soft Balanced</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Background</label>
                        <div className="flex gap-2">
                          {(['white', 'black', 'custom'] as const).map(m => (
                            <button key={m} onClick={() => setOptions({...options, bgMode: m})} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${options.bgMode === m ? 'bg-black text-white border-black' : 'bg-white text-gray-300 border-gray-100'}`}>{m}</button>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between border border-gray-100">
                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Ground Gloss</span>
                        <button 
                          onClick={() => setOptions({ ...options, reflection: !options.reflection })}
                          className={`w-10 h-5 rounded-full transition-all relative ${options.reflection ? 'bg-black' : 'bg-gray-200'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${options.reflection ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>


                    </div>
                  </>
                ) : state.activeMode === 'fashion' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-black text-gray-900 tracking-tighter">Fashion Setup</h2>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Product Category</label>
                        <div className="grid grid-cols-1 gap-2">
                          {(['ring', 'necklace', 'earrings'] as ProductType[]).map((type) => (
                            <button
                              key={type}
                              onClick={() => toggleProductType(type)}
                              className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border flex items-center justify-between ${
                                fashionOptions.productTypes.includes(type) ? 'bg-black text-white border-black' : 'bg-white text-gray-300 border-gray-100'
                              }`}
                            >
                              <span>{type}</span>
                              {fashionOptions.productTypes.includes(type) && <span className="w-2 h-2 bg-white rounded-full"></span>}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Model Aesthetic</label>
                        <select 
                          value={fashionOptions.modelStyle}
                          onChange={(e) => setFashionOptions({ ...fashionOptions, modelStyle: e.target.value as any })}
                          className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-xs font-bold appearance-none"
                        >
                          <option value="editorial">Editorial High-Fashion</option>
                          <option value="lifestyle">Luxury Lifestyle</option>
                          <option value="minimal">Minimalist Portrait</option>
                          <option value="style-reference">Style Reference (Custom Pose)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Environment</label>
                        <select 
                          value={fashionOptions.environment}
                          onChange={(e) => setFashionOptions({ ...fashionOptions, environment: e.target.value as any })}
                          className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-xs font-bold appearance-none"
                        >
                          <option value="studio">Professional Studio</option>
                          <option value="outdoor">Parisian Street</option>
                          <option value="luxury-interior">Modern Mansion</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Skin Tone</label>
                          <select 
                            value={fashionOptions.skinTone}
                            onChange={(e) => setFashionOptions({ ...fashionOptions, skinTone: e.target.value as any })}
                            className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-xs font-bold appearance-none"
                          >
                            <option value="porcelain">Porcelain</option>
                            <option value="ivory">Ivory</option>
                            <option value="warm-ivory">Warm Ivory</option>
                            <option value="sand">Sand</option>
                            <option value="beige">Beige</option>
                            <option value="warm-beige">Warm Beige</option>
                            <option value="natural">Natural</option>
                            <option value="honey">Honey</option>
                            <option value="golden">Golden</option>
                            <option value="almond">Almond</option>
                            <option value="chestnut">Chestnut</option>
                            <option value="espresso">Espresso</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Hair Color</label>
                          <select 
                            value={fashionOptions.hairColor}
                            onChange={(e) => setFashionOptions({ ...fashionOptions, hairColor: e.target.value as any })}
                            className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-xs font-bold appearance-none"
                          >
                            <option value="black">Black</option>
                            <option value="brown-black">Brown Black</option>
                            <option value="darkest-brown">Darkest Brown</option>
                            <option value="dark-brown">Dark Brown</option>
                            <option value="medium-brown">Medium Brown</option>
                            <option value="light-brown">Light Brown</option>
                            <option value="dark-blonde">Dark Blonde</option>
                            <option value="medium-blonde">Medium Blonde</option>
                            <option value="light-blonde">Light Blonde</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Model Face</label>
                          <select 
                            value={fashionOptions.faceType}
                            onChange={(e) => setFashionOptions({ ...fashionOptions, faceType: e.target.value as any })}
                            className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-xs font-bold appearance-none"
                          >
                            <option value="random">Random</option>
                            <option value="reference">Reference</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Finger Type</label>
                          <select 
                            value={fashionOptions.fingerType}
                            onChange={(e) => setFashionOptions({ ...fashionOptions, fingerType: e.target.value as any })}
                            className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-xs font-bold appearance-none"
                          >
                            <option value="slender">Slender</option>
                            <option value="normal">Normal</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Outfit</label>
                          <select 
                            value={fashionOptions.outfitType}
                            onChange={(e) => setFashionOptions({ ...fashionOptions, outfitType: e.target.value as any })}
                            className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-xs font-bold appearance-none"
                          >
                            <option value="reference">Reference Outfit</option>
                            <option value="luxury">Luxury Outfit</option>
                            <option value="daily">Daily Outfit</option>
                          </select>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between border border-gray-100">
                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Additional Accessory</span>
                        <button 
                          onClick={() => setFashionOptions({ ...fashionOptions, hasAdditionalAccessory: !fashionOptions.hasAdditionalAccessory })}
                          className={`w-10 h-5 rounded-full transition-all relative ${fashionOptions.hasAdditionalAccessory ? 'bg-black' : 'bg-gray-200'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${fashionOptions.hasAdditionalAccessory ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>


                    </div>
                  </>
                ) : state.activeMode === 'prompt-to-image' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-black text-gray-900 tracking-tighter">AI Generation Setup</h2>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Input Type</label>
                        <div className="flex gap-2">
                          {(['prompt', 'image'] as const).map(m => (
                            <button 
                              key={m} 
                              onClick={() => setState(s => ({ ...s, promptToImage: { ...s.promptToImage, inputType: m } }))} 
                              className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${state.promptToImage.inputType === m ? 'bg-black text-white border-black' : 'bg-white text-gray-300 border-gray-100'}`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>

                      {state.promptToImage.inputType === 'prompt' ? (
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Your Vision</label>
                          <textarea 
                            value={state.promptToImage.userPrompt}
                            onChange={(e) => setState(s => ({ ...s, promptToImage: { ...s.promptToImage, userPrompt: e.target.value } }))}
                            placeholder="Describe the scene..."
                            className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-xs font-bold min-h-[100px] resize-none focus:ring-2 focus:ring-black transition-all"
                          />
                        </div>
                      ) : (
                        <ImageUploader 
                          label="Style Reference" 
                          description="Analyze this image"
                          imageState={state.promptToImage.referenceImage}
                          onUpload={handlePromptToImageRefUpload}
                          onClear={() => setState(s => ({ ...s, promptToImage: { ...s.promptToImage, referenceImage: { file: null, preview: null, base64: null } } }))}
                        />
                      )}

                      <button 
                        onClick={handleEnhancePrompt}
                        disabled={state.isProcessing || (state.promptToImage.inputType === 'prompt' ? !state.promptToImage.userPrompt : !state.promptToImage.referenceImage.base64)}
                        className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        {state.promptToImage.inputType === 'prompt' ? 'Prompt Enhancer' : 'Analyze Image'}
                      </button>

                      {state.promptToImage.enhancedPrompt && (
                        <div className="p-4 bg-black/5 rounded-xl border border-black/10 animate-in fade-in slide-in-from-top-2">
                          <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-2 block">AI Enhanced Prompt</label>
                          <p className="text-[10px] text-gray-700 font-medium leading-relaxed italic">"{state.promptToImage.enhancedPrompt}"</p>
                        </div>
                      )}


                    </div>
                  </>
                ) : state.activeMode === 'upscale' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-black text-gray-900 tracking-tighter">Image Upscale Setup</h2>
                    </div>
                    <div className="space-y-6">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                        Upload an image on the right to enhance its clarity and upscale it to 8K resolution without altering its content.
                      </p>
                    </div>
                  </>
                ) : null}

                {state.activeMode !== 'upscale' && (
                  <div className="pt-4 border-t border-gray-100">
                    <ImageUploader 
                      label="Manken Sabitleme" 
                      description="Yüz/Saç Referansı"
                      imageState={state.consistentModel}
                      onUpload={handleConsistentModelUpload}
                      onClear={() => setState(s => ({ ...s, consistentModel: { file: null, preview: null, base64: null } }))}
                    />
                  </div>
                )}

                <button
                  disabled={state.isProcessing || (state.activeMode === 'retoucher' ? state.rawImages.length === 0 : state.activeMode === 'fashion' ? state.fashionReferences.length === 0 : state.activeMode === 'upscale' ? !state.upscaleImage.base64 : !state.promptToImage.productImage.base64)}
                  onClick={handleRetouch}
                  className={`w-full py-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all relative overflow-hidden shadow-2xl active:scale-95
                    ${state.isProcessing || (state.activeMode === 'retoucher' ? state.rawImages.length === 0 : state.activeMode === 'fashion' ? state.fashionReferences.length === 0 : state.activeMode === 'upscale' ? !state.upscaleImage.base64 : !state.promptToImage.productImage.base64) ? 'bg-gray-100 text-gray-300' : 'bg-black text-white hover:bg-gray-800'}
                  `}
                >
                  {state.isProcessing ? (
                    <div className="flex items-center justify-center space-x-2">
                       <span className="animate-pulse">Processing...</span>
                       <span className="bg-white/20 px-2 py-0.5 rounded text-[8px]">{state.processingProgress}%</span>
                    </div>
                  ) : state.activeMode === 'retoucher' ? `Execute Studio Batch (${state.rawImages.length * options.metalTypes.length})` : state.activeMode === 'fashion' ? 'Generate Fashion Campaign' : state.activeMode === 'upscale' ? 'Enhance Clarity' : 'Generate AI Campaign'}
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
                          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Product Input {options.isBulkMode && '(Bulk)'}</h3>
                          {state.rawImages.length > 0 && <button onClick={() => setState(p => ({ ...p, rawImages: [] }))} className="text-[10px] text-red-500 font-bold uppercase">Clear All</button>}
                      </div>
                      <div className="relative border-2 border-dashed border-gray-200 rounded-[2.5rem] bg-white group hover:border-black transition-all overflow-hidden min-h-[300px] flex flex-col p-4">
                          <input 
                            type="file" 
                            multiple={options.isBulkMode} 
                            className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                            onChange={(e) => e.target.files && handleBulkUpload(e.target.files)}
                          />
                          {state.rawImages.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {state.rawImages.map((img, idx) => (
                                <div key={idx} className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 relative">
                                  <img src={img.preview!} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/5 flex items-end p-2">
                                      <span className="text-[8px] bg-white/90 px-1.5 py-0.5 rounded font-black text-gray-500 truncate">{img.name}</span>
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

                    <ImageUploader 
                      label="Style Ref" 
                      description="Reference lighting"
                      imageState={state.referenceImage}
                      onUpload={handleRefUpload}
                      onClear={() => setState(prev => ({ ...prev, referenceImage: { file: null, preview: null, base64: null } }))}
                    />
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
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Image to Upscale</h3>
                        {state.upscaleImage.base64 && <button onClick={() => setState(p => ({ ...p, upscaleImage: { file: null, preview: null, base64: null } }))} className="text-[10px] text-red-500 font-bold uppercase">Clear</button>}
                      </div>
                      <div className="relative border-2 border-dashed border-gray-200 rounded-[2.5rem] bg-white group hover:border-black transition-all overflow-hidden min-h-[300px] flex flex-col p-4">
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                          onChange={(e) => e.target.files && handleUpscaleUpload(e.target.files[0])}
                        />
                        {state.upscaleImage.base64 ? (
                          <div className="flex-1 flex items-center justify-center">
                            <img src={state.upscaleImage.preview!} className="max-w-full max-h-[250px] object-contain rounded-2xl shadow-lg" />
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center"><svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Upload Image for Clarity Enhancement</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="md:col-span-2 space-y-8">
                    <div className="space-y-2">
                      <div className="flex justify-between items-end mb-2">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Product Input</h3>
                        {state.promptToImage.productImage.base64 && <button onClick={() => setState(p => ({ ...p, promptToImage: { ...p.promptToImage, productImage: { file: null, preview: null, base64: null } } }))} className="text-[10px] text-red-500 font-bold uppercase">Clear</button>}
                      </div>
                      <div className="relative border-2 border-dashed border-gray-200 rounded-[2.5rem] bg-white group hover:border-black transition-all overflow-hidden min-h-[300px] flex flex-col p-4">
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                          onChange={(e) => e.target.files && handlePromptToImageProductUpload(e.target.files[0])}
                        />
                        {state.promptToImage.productImage.base64 ? (
                          <div className="flex-1 flex items-center justify-center">
                            <img src={state.promptToImage.productImage.preview!} className="max-w-full max-h-[250px] object-contain rounded-2xl shadow-lg" />
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center"><svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Upload Product Image</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-12 border border-gray-50 rounded-[3rem] bg-white/30 text-center">
                 <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.6em]">Perspective Locking Engine v5.2 Active</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-12 border-t border-gray-50 text-center relative overflow-visible">
        <div className="max-w-7xl mx-auto px-6 relative">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest relative inline-block">
            &copy; 2026 JewelRetouch PRO. All Rights Reserved.
          </p>
          <div 
            className="mt-4 relative inline-block cursor-pointer"
            onMouseEnter={() => setIsHoveringFurkan(true)}
            onMouseLeave={() => setIsHoveringFurkan(false)}
          >
            <p className="text-[12px] font-black text-gray-800 uppercase tracking-widest hover:text-black transition-colors">
              Furkan Daldal
            </p>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              {isHoveringFurkan && Array.from({ length: 40 }).map((_, i) => {
                const angle = (Math.random() * 360) * (Math.PI / 180);
                const distance = 40 + Math.random() * 80;
                const tx = Math.cos(angle) * distance;
                const ty = Math.sin(angle) * distance;
                const tr = (Math.random() - 0.5) * 180;
                const delay = Math.random() * 2;
                const colors = ['#FF8C00', '#FFA500', '#808080', '#A9A9A9', '#000000', '#111111'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                return (
                  <div 
                    key={i}
                    className="particle"
                    style={{
                      '--tw-tx': `${tx}px`,
                      '--tw-ty': `${ty}px`,
                      '--tw-tr': `${tr}deg`,
                      animationDelay: `${delay}s`,
                      color: color
                    } as React.CSSProperties}
                  >
                    Adamın dibi
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </footer>

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
    </div>
  );
};

export default App;
