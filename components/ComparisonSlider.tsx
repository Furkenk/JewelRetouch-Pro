
import React, { useState, useRef, useEffect } from 'react';

interface ComparisonSliderProps {
  before: string;
  after: string;
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ before, after }) => {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleMove(e.clientX);
  };
  
  const onMouseUp = () => setIsDragging(false);
  
  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };
  
  const onMouseLeave = () => setIsDragging(false);

  const onTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleMove(e.touches[0].clientX);
  };
  
  const onTouchEnd = () => setIsDragging(false);
  
  const onTouchMove = (e: React.TouchEvent) => {
    if (isDragging) handleMove(e.touches[0].clientX);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full aspect-square bg-gray-100 dark:bg-slate-900 rounded-2xl overflow-hidden select-none border border-gray-100 dark:border-slate-800 luxury-shadow ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
    >
      {/* Before Image */}
      <img src={before} alt="Before" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
      
      {/* After Image Container */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      >
        <img src={after} alt="After" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
      </div>

      {/* Slider Handle */}
      <div className="slider-handle pointer-events-none" style={{ left: `${position}%` }}>
        <div className="slider-circle pointer-events-auto shadow-xl">
          <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.59,16.59L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.59Z" />
            <path d="M15.41,16.59L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.59Z" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <span className="bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">Original</span>
      </div>
      <div className="absolute top-4 right-4 z-10 pointer-events-none mt-10">
        <span className="bg-white/90 text-black px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">Retouched</span>
      </div>
    </div>
  );
};

export default ComparisonSlider;
