import React from 'react';
import { VOWELS } from '../constants';

interface TileProps {
  char: string;
  isOverlay?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Tile: React.FC<TileProps> = ({ char, isOverlay, className = '', style }) => {
  const isVowel = VOWELS.has(char);
  
  // Base classes for the tile look
  // Mobile: flat (rounded-[2px], no shadow/border)
  // Desktop (md): rich (rounded-lg, shadow-md, border-b-4) + Active Press Effect
  const baseClasses = "flex items-center justify-center font-bold select-none uppercase transition-all " +
                      "rounded-[2px] md:rounded-lg " +
                      "shadow-none md:shadow-md " + 
                      "border-none md:border-b-4 " +
                      // 3D Press effect on desktop:
                      "md:active:border-b-0 md:active:translate-y-1";
  
  // Color logic
  // Added darker border colors for the desktop 3D effect
  const colorClasses = isVowel
    ? "bg-blue-700 text-white md:border-blue-900"
    : "bg-blue-600 text-white md:border-blue-800";

  // Size is controlled by parent via context or specific classes
  const sizeClasses = "w-full h-full text-[1.2em] sm:text-[1.5em]";

  // Overlay specific styles
  // Changed scale-110 to scale-100 so the dragged object size corresponds exactly to the grabbed object
  // When dragging, we remove the "active" border collapse so it looks like the full tile is picked up
  const overlayClasses = isOverlay 
    ? "scale-100 shadow-2xl z-50 cursor-grabbing opacity-90 md:border-b-4 md:translate-y-0" 
    : "cursor-grab active:cursor-grabbing";

  return (
    <div 
      className={`${baseClasses} ${colorClasses} ${sizeClasses} ${overlayClasses} ${className}`}
      style={style}
    >
      {char}
    </div>
  );
};