import { useEffect, useRef, useState } from "react";
import { SLIDE_COLORS, SLIDE_CONFIG } from "@/lib/constants";
import { motion } from "framer-motion";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Set up animation loop
    const animate = (time: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = time;
      }
      
      const elapsed = time - startTimeRef.current;
      const progressPercentage = Math.min(100, (elapsed / SLIDE_CONFIG.progressDuration) * 100);
      
      setProgress(progressPercentage);
      
      if (progressPercentage < 100) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);
  
  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <div className={`min-h-screen ${SLIDE_COLORS.loading} flex items-center justify-center`}>
      <div className="container mx-auto px-6 flex flex-col items-center justify-center">
        <div className="text-center text-white">
          <motion.h2 
            className="text-3xl md:text-4xl font-heading font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Calculating Your Impact
          </motion.h2>
          
          <motion.p 
            className="text-xl mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Analyzing how your generosity helps our community...
          </motion.p>
          
          <div className="relative w-64 h-64 mx-auto">
            <svg className="transform -rotate-90" width="200" height="200" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="12" />
              <motion.circle 
                cx="100" 
                cy="100" 
                r="80" 
                fill="none" 
                stroke="white" 
                strokeWidth="12" 
                strokeDasharray={circumference} 
                strokeDashoffset={offset}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold">
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
