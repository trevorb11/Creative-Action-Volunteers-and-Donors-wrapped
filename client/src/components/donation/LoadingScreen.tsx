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
    <div className={`min-h-screen ${SLIDE_COLORS.loading} flex items-center justify-center relative overflow-hidden`}>
      {/* Decorative background patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-cfs-brightGreen"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-cfs-teal"></div>
      </div>
      
      {/* Community Food Share logo */}
      <div className="absolute top-6 left-6">
        <div className="flex items-center">
          <h3 className="text-lg md:text-xl font-bold text-white">
            Community Food Share
          </h3>
        </div>
      </div>
      
      <div className="container mx-auto px-6 flex flex-col items-center justify-center relative z-10">
        <div className="text-center text-white">
          <motion.h2 
            className="text-3xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ fontFamily: 'Spectral, serif' }}
          >
            Calculating Your Impact
          </motion.h2>
          
          <motion.p 
            className="text-xl mb-12 font-light max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ fontFamily: 'Open Sans, sans-serif' }}
          >
            Analyzing how your generosity helps our neighbors in Boulder and Broomfield Counties...
          </motion.p>
          
          <div className="relative w-64 h-64 mx-auto">
            <svg className="transform -rotate-90" width="200" height="200" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="12" />
              <motion.circle 
                cx="100" 
                cy="100" 
                r="80" 
                fill="none" 
                stroke="#8dc53e" 
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
          
          <motion.div 
            className="mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <p className="text-white/80 text-sm italic">
              "Every dollar you give turns into fresh meals for neighbors in need."
            </p>
          </motion.div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-4 w-full text-center text-white/70 text-sm">
        <p>Together, we're building a hunger-free community</p>
      </div>
    </div>
  );
}
