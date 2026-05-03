
import React from 'react';
import { ImageState } from '../types';

interface ImageUploaderProps {
  label: string;
  description: string;
  imageState: ImageState;
  onUpload: (file: File) => void;
  onClear: () => void;
  required?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  label, 
  description, 
  imageState, 
  onUpload, 
  onClear,
  required = false
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="group">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400">{description}</p>
        </div>
        {imageState.preview && (
          <button 
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="text-xs text-red-500 hover:text-red-400 dark:hover:text-red-300 transition-colors font-medium z-10 relative"
          >
            Clear
          </button>
        )}
      </div>

      <div className={`relative h-64 border-2 border-dashed rounded-2xl transition-all duration-300 overflow-hidden flex items-center justify-center
        ${imageState.preview ? 'border-gray-200 dark:border-slate-800 glass-card' : 'border-gray-200 dark:border-slate-800 group-hover:border-black dark:group-hover:border-white bg-white dark:bg-slate-900'}
      `}>
        <input type="file" id={`upload-${label}`} className="hidden" accept="image/*" onChange={handleFileChange} />
        
        {imageState.preview ? (
          <label htmlFor={`upload-${label}`} className="relative w-full h-full cursor-pointer flex items-center justify-center overflow-hidden">
            <img 
              src={imageState.preview} 
              alt="Preview" 
              className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-bold uppercase tracking-widest bg-black/20 px-4 py-2 rounded-full border border-white/30 backdrop-blur-sm">
                Change Image
              </span>
            </div>
          </label>
        ) : (
          <label htmlFor={`upload-${label}`} className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-6">
            <svg className="w-10 h-10 text-gray-300 dark:text-slate-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-400 dark:text-slate-500 group-hover:text-black dark:group-hover:text-white transition-colors font-medium">Click to upload image</span>
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
