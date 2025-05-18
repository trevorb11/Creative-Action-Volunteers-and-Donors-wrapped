import React from 'react';
import { cn } from '@/lib/utils';

interface CALogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function CALogo({ 
  className, 
  width = 200, 
  height = 70 
}: CALogoProps) {
  return (
    <div className={cn("flex justify-center items-center mt-4", className)}>
      {/* Creative Action SVG logo */}
      <div 
        style={{ width: width, height: height }}
        className="relative flex items-center justify-center"
      >
        <svg 
          width={width} 
          height={height} 
          viewBox="0 0 240 80" 
          className="text-[#6A1B9A]"
        >
          <rect width="240" height="80" fill="#F3E5F5" rx="8" ry="8" />
          <text 
            x="50%" 
            y="40%" 
            dominantBaseline="middle" 
            textAnchor="middle" 
            fontSize="20" 
            fontWeight="bold" 
            fill="#6A1B9A"
          >
            Creative
          </text>
          <text 
            x="50%" 
            y="65%" 
            dominantBaseline="middle" 
            textAnchor="middle" 
            fontSize="20" 
            fontWeight="bold" 
            fill="#66CDAA"
          >
            Action
          </text>
          <circle cx="210" cy="28" r="5" fill="#6A1B9A" />
          <circle cx="225" cy="28" r="5" fill="#EC407A" />
          <circle cx="217" cy="38" r="5" fill="#66CDAA" />
        </svg>
      </div>
    </div>
  );
}