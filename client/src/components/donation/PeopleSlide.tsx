import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { DonationImpact } from "@shared/schema";
import SlideLayout from "./SlideLayout";
import { SLIDE_CONFIG } from "@/lib/constants";

interface PeopleSlideProps {
  impact: DonationImpact;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

export default function PeopleSlide({ 
  impact,
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide 
}: PeopleSlideProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  
  useEffect(() => {
    const controls = animate(count, impact.peopleServed, {
      duration: 2,
      ease: "easeOut"
    });
    
    return () => controls.stop();
  }, [count, impact.peopleServed]);
  
  // Extract percentage value
  const peoplePercentage = parseFloat(impact.peoplePercentage.replace('%', ''));
  
  // Calculate width for progress bar
  const progressWidth = `${Math.min(100, Math.max(peoplePercentage, 3))}%`;
  
  return (
    <SlideLayout
      title="You Helped Serve"
      titleClassName="text-white"
      variant="people"
      onNext={onNext}
      onPrevious={onPrevious}
      isFirstSlide={isFirstSlide}
      isLastSlide={isLastSlide}
    >
      {/* Main count */}
      <div className="mb-6 sm:mb-8 md:mb-10">
        <div className="text-4xl sm:text-6xl md:text-7xl lg:text-9xl font-bold text-center tracking-tight">
          <motion.span>{rounded}</motion.span>
        </div>
        <p className="text-xl sm:text-2xl md:text-3xl font-medium text-center mt-1 sm:mt-2">
          People in Our Community
        </p>
      </div>
      
      {/* Visual representation - progress bar style */}
      <div className="mb-6 sm:mb-8 md:mb-12">
        <div className="flex justify-between text-xs sm:text-sm mb-1 sm:mb-2">
          <span>0 people</span>
          <span>60,000 people</span>
        </div>
        
        <div className="h-4 sm:h-5 md:h-6 bg-white/10 rounded-full overflow-hidden relative">
          {/* Background track */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: 10 }).map((_, i) => (
              <div 
                key={i} 
                className="h-full flex-1 border-r border-white/20 last:border-0"
              />
            ))}
          </div>
          
          {/* Progress indicator */}
          <motion.div 
            className="h-full bg-white rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: progressWidth }}
            transition={{ 
              duration: 1.5, 
              ease: "easeOut",
              delay: 0.8
            }}
          >
            <div className="h-full w-full bg-gradient-to-r from-emerald-400 to-teal-500"></div>
          </motion.div>
          
          {/* Animated dot at end of progress */}
          <motion.div
            className="absolute top-0 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 rounded-full bg-white shadow-md flex items-center justify-center transform -translate-x-1/2"
            initial={{ left: "0%" }}
            animate={{ left: progressWidth }}
            transition={{ 
              duration: 1.5, 
              ease: "easeOut",
              delay: 0.8
            }}
          >
            <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 rounded-full bg-emerald-500"></div>
          </motion.div>
        </div>
        
        <div className="mt-1 text-right">
          <span className="text-xs sm:text-sm opacity-80">Boulder & Broomfield Counties</span>
        </div>
      </div>

      {/* Percentage callout */}
      <motion.div 
        className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 md:mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.7 }}
      >
        <div className="text-center">
          <p className="text-base sm:text-lg md:text-xl">
            Your donation helped feed <span className="font-bold">{impact.peoplePercentage}</span> of those served
          </p>
          
          <div className="mt-2 sm:mt-3 grid grid-cols-3 gap-2 sm:gap-4">
            <div className="text-center">
              <p className="text-lg sm:text-2xl md:text-3xl font-bold">{impact.mealsProvided}</p>
              <p className="text-xs sm:text-sm">Meals Provided</p>
            </div>
            
            <div className="text-center border-x border-white/10">
              <p className="text-lg sm:text-2xl md:text-3xl font-bold">{impact.daysFed}</p>
              <p className="text-xs sm:text-sm">Days of Food</p>
            </div>
            
            <div className="text-center">
              <p className="text-lg sm:text-2xl md:text-3xl font-bold">{impact.foodRescued.toFixed(0)}</p>
              <p className="text-xs sm:text-sm">lbs of Food</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Impact quote */}
      <motion.div
        className="bg-white/10 p-3 sm:p-4 md:p-5 rounded-xl text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 1.5 }}
      >
        <p className="text-sm sm:text-base md:text-lg italic">
          "Every number represents a real person with a name, a story, and hope for tomorrow. Your support made a direct impact on their lives."
        </p>
      </motion.div>
    </SlideLayout>
  );
}
