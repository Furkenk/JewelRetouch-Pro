
import React, { useState, useRef, useEffect } from 'react';

interface ComparisonSliderProps {
  before: string;
  after: string;
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ before, after }) => {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  };

  const onMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const onTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden cursor-col-resize select-none border border-gray-100 luxury-shadow"
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
    >
      {/* Before Image */}
      <img src={before} alt="Before" className="absolute inset-0 w-full h-full object-contain" />
      
      {/* After Image Container - Removing forced bg-white to allow transparency inspection if background is transparent */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      >
        <img src={after} alt="After" className="absolute inset-0 w-full h-full object-contain" />
      </div>

      {/* Slider Handle */}
      <div className="slider-handle" style={{ left: `${position}%` }}>
        <div className="slider-circle">
          <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.59,16.59L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.59Z" />
            <path d="M15.41,16.59L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.59Z" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 z-10">
        <span className="bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Original</span>
      </div>
      <div className="absolute top-4 right-4 z-10">
        <span className="bg-white/90 text-black px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">Retouched</span>
      </div>
    </div>
  );
};

export default ComparisonSlider;
