import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { DonationImpact } from "@shared/schema";
import SlideLayout from "./SlideLayout";

interface FoodRescueSlideProps {
  impact: DonationImpact;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

// SVG icons for animals
const ElephantIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
    <path d="M19.5,9.5c-0.8-0.8-2-0.8-2.8,0L15,11.2V8c0-1.1-0.9-2-2-2h-2c-1.1,0-2,0.9-2,2v3.2L7.3,9.5c-0.8-0.8-2-0.8-2.8,0 s-0.8,2,0,2.8L7,14.8V19c0,1.1,0.9,2,2,2h6c1.1,0,2-0.9,2-2v-4.2l2.5-2.5C20.3,11.5,20.3,10.3,19.5,9.5z M9,8h6v2H9V8z M15,19H9 v-4h6V19z"/>
  </svg>
);

const BisonIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
    <path d="M12,2C8.1,2,5,5.1,5,9c0,2.4,1.2,4.5,3,5.7V17c0,0.6,0.4,1,1,1h6c0.6,0,1-0.4,1-1v-2.3c1.8-1.3,3-3.4,3-5.7 C19,5.1,15.9,2,12,2z M9,13.5C7.8,12.6,7,11.3,7,9.8C7,7.5,8.8,5.7,11,5.7s4,1.8,4,4.1c0,1.5-0.8,2.9-2,3.7V14h-4V13.5z M14,19H10v-1h4V19z M10,11h4v2h-4V11z"/>
  </svg>
);

const CarIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
    <path d="M18.92,6.01C18.72,5.42,18.16,5,17.5,5h-11C5.84,5,5.29,5.42,5.08,6.01L3,12v8c0,0.55,0.45,1,1,1h1c0.55,0,1-0.45,1-1v-1 h12v1c0,0.55,0.45,1,1,1h1c0.55,0,1-0.45,1-1v-8L18.92,6.01z M6.85,7h10.29l1.08,3.11H5.77L6.85,7z M19,17H5v-5h14V17z"/>
    <circle cx="7.5" cy="14.5" r="1.5"/>
    <circle cx="16.5" cy="14.5" r="1.5"/>
  </svg>
);

export default function FoodRescueSlide({ 
  impact,
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide
}: FoodRescueSlideProps) {
  const foodCount = useMotionValue(0);
  const roundedFood = useTransform(foodCount, (latest) => Math.round(latest));
  const [activeComparison, setActiveComparison] = useState<'elephant' | 'bison' | 'car'>('elephant');
  
  useEffect(() => {
    const controls = animate(foodCount, impact.foodRescued, {
      duration: 2,
      ease: "easeOut"
    });
    
    // Auto-rotate comparisons every 5 seconds
    const interval = setInterval(() => {
      setActiveComparison(current => {
        if (current === 'elephant') return 'bison';
        if (current === 'bison') return 'car';
        return 'elephant';
      });
    }, 5000);
    
    return () => {
      controls.stop();
      clearInterval(interval);
    };
  }, [foodCount, impact.foodRescued]);
  
  // Parse numeric values
  const elephantCount = parseFloat(impact.babyElephants.replace(/[^0-9.]/g, ''));
  const bisonCount = parseFloat(impact.bison.replace(/[^0-9.]/g, ''));
  const carCount = parseFloat(impact.cars.replace(/[^0-9.]/g, ''));
  
  return (
    <SlideLayout
      title="Food Rescue Impact"
      titleClassName="text-white" // Make title white
      variant="foodRescue"
      quote="When food goes to waste in landfills, it produces methane - a greenhouse gas 25 times more potent than carbon dioxide. Every pound of food we rescue makes a difference."
      onNext={onNext}
      onPrevious={onPrevious}
      isFirstSlide={isFirstSlide}
      isLastSlide={isLastSlide}
    >
      <div className="mb-8">
        <div className="text-6xl md:text-7xl font-heading font-extrabold mb-4">
          <motion.span>{roundedFood}</motion.span> lbs
        </div>
        <p className="text-xl">of food rescued from being wasted</p>
      </div>
      
      <div className="mb-8">
        <p className="text-2xl mb-4">That's equivalent to the weight of:</p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <motion.button 
            className={`bg-white/20 p-4 rounded-xl cursor-pointer hover:bg-white/30 ${activeComparison === 'elephant' ? 'ring-2 ring-white' : ''}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: activeComparison === 'elephant' ? 1.05 : 1,
              y: activeComparison === 'elephant' ? -5 : 0
            }}
            transition={{ duration: 0.3 }}
            onClick={() => setActiveComparison('elephant')}
          >
            <div className="h-14 w-14 mx-auto mb-2">
              <ElephantIcon />
            </div>
            <p className="text-2xl font-bold mb-1">{impact.babyElephants}</p>
            <p>Baby Elephants</p>
          </motion.button>
          
          <motion.button 
            className={`bg-white/20 p-4 rounded-xl cursor-pointer hover:bg-white/30 ${activeComparison === 'bison' ? 'ring-2 ring-white' : ''}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: activeComparison === 'bison' ? 1.05 : 1,
              y: activeComparison === 'bison' ? -5 : 0
            }}
            transition={{ duration: 0.3, delay: 0.1 }}
            onClick={() => setActiveComparison('bison')}
          >
            <div className="h-14 w-14 mx-auto mb-2">
              <BisonIcon />
            </div>
            <p className="text-2xl font-bold mb-1">{impact.bison}</p>
            <p>Bison</p>
          </motion.button>
          
          <motion.button 
            className={`bg-white/20 p-4 rounded-xl cursor-pointer hover:bg-white/30 ${activeComparison === 'car' ? 'ring-2 ring-white' : ''}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: activeComparison === 'car' ? 1.05 : 1,
              y: activeComparison === 'car' ? -5 : 0 
            }}
            transition={{ duration: 0.3, delay: 0.2 }}
            onClick={() => setActiveComparison('car')}
          >
            <div className="h-14 w-14 mx-auto mb-2">
              <CarIcon />
            </div>
            <p className="text-2xl font-bold mb-1">{impact.cars}</p>
            <p>Cars</p>
          </motion.button>
        </div>
      </div>

      {/* Animal comparison visualization */}
      <motion.div 
        className="flex flex-wrap justify-center gap-2 my-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        {activeComparison === 'elephant' && (
          <>
            {Array.from({ length: Math.min(8, Math.ceil(elephantCount)) }).map((_, idx) => (
              <motion.div 
                key={idx}
                className="h-10 w-10"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (idx * 0.1) }}
              >
                <ElephantIcon />
              </motion.div>
            ))}
          </>
        )}
        
        {activeComparison === 'bison' && (
          <>
            {Array.from({ length: Math.min(6, Math.ceil(bisonCount)) }).map((_, idx) => (
              <motion.div 
                key={idx}
                className="h-12 w-12"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (idx * 0.1) }}
              >
                <BisonIcon />
              </motion.div>
            ))}
          </>
        )}
        
        {activeComparison === 'car' && (
          <>
            {Array.from({ length: Math.min(5, Math.ceil(carCount)) }).map((_, idx) => (
              <motion.div 
                key={idx}
                className="h-10 w-10"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (idx * 0.1) }}
              >
                <CarIcon />
              </motion.div>
            ))}
          </>
        )}
      </motion.div>

      <p className="text-lg mt-4">
        By supporting Community Food Share, you're helping save food from landfills and ensuring it reaches those who need it most.
      </p>
    </SlideLayout>
  );
}
