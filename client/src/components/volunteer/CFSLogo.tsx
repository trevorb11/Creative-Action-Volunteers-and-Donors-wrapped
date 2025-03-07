import React from 'react';
import { cn } from '@/lib/utils';

interface CFSLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function CFSLogo({ 
  className, 
  width = 200, 
  height = 70 
}: CFSLogoProps) {
  // Import CFS logo color info from theme colors
  return (
    <div className={cn("flex justify-center items-center mt-4", className)}>
      {/* Fallback SVG logo since the image isn't loading */}
      <div 
        style={{ width: width, height: height }}
        className="relative flex items-center justify-center"
      >
        <svg 
          width={width} 
          height={height} 
          viewBox="0 0 240 80" 
          className="text-[#0c4428]"
        >
          <rect width="240" height="80" fill="#f0f9f4" rx="8" ry="8" />
          <text 
            x="50%" 
            y="40%" 
            dominantBaseline="middle" 
            textAnchor="middle" 
            fontSize="20" 
            fontWeight="bold" 
            fill="#0c4428"
          >
            Community
          </text>
          <text 
            x="50%" 
            y="65%" 
            dominantBaseline="middle" 
            textAnchor="middle" 
            fontSize="20" 
            fontWeight="bold" 
            fill="#8dc53e"
          >
            Food Share
          </text>
        </svg>
      </div>
    </div>
  );
}