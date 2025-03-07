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
  return (
    <div className={cn("flex justify-center items-center mt-4", className)}>
      <img 
        src="/images/cfs-logo.png" 
        alt="Community Food Share Logo" 
        width={width} 
        height={height}
        className="object-contain"
      />
    </div>
  );
}