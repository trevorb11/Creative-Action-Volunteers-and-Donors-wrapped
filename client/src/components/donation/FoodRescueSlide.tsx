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

// SVG icons for animals and objects
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

// Cat and dog comparison icons
const HouseCatIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
    <path d="M12,3L4,9v12h16V9L12,3z M12,7.75c1.24,0,2.25,1.01,2.25,2.25S13.24,12.25,12,12.25S9.75,11.24,9.75,10S10.76,7.75,12,7.75z M17,17H7v-0.75c0-2.5,5-3.75,5-3.75s5,1.25,5,3.75V17z"/>
  </svg>
);

const GoldenRetrieverIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
    <path d="M18,4c-1.1,0-2,0.9-2,2c0,0.55,0.23,1.05,0.59,1.41C16.23,7.05,16,7.55,16,8c0,0.55,0.23,1.05,0.59,1.41 C16.23,9.05,16,9.55,16,10c0,1.1,0.9,2,2,2h1v3H8c-3.3,0-6,2.7-6,6v1h4v-1c0-1.1,0.9-2,2-2h10c1.1,0,2-0.9,2-2V7 C20,5.9,19.1,5,18,5h-1V4H18z"/>
    <circle cx="13" cy="9" r="1"/>
  </svg>
);

// Large animal comparison icons
const GrizzlyBearIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
    <path d="M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M15,9c0.55,0,1,0.45,1,1 s-0.45,1-1,1s-1-0.45-1-1S14.45,9,15,9z M9,9c0.55,0,1,0.45,1,1s-0.45,1-1,1s-1-0.45-1-1S8.45,9,9,9z M12,17c-2.21,0-4-1.79-4-4 h8C16,15.21,14.21,17,12,17z"/>
  </svg>
);

const HippoIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
    <path d="M21,3H3C1.9,3,1,3.9,1,5v8h2V5h18v16c0,0.55-0.45,1-1,1h-9v-2h3c0.55,0,1-0.45,1-1v-4H7v4c0,0.55,0.45,1,1,1h3v2H3 c-1.1,0-2-0.9-2-2V5c0-1.1,0.9-2,2-2h18c1.1,0,2,0.9,2,2v14c0,1.1-0.9,2-2,2h-9v-2h10V5C23,3.9,22.1,3,21,3z M7,12V8h10v4H7z"/>
    <circle cx="9" cy="10" r="1"/>
    <circle cx="15" cy="10" r="1"/>
  </svg>
);

// Transportation icons
const SchoolBusIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
    <path d="M17,4H7C4.24,4,2,6.24,2,9v8h1c0,1.66,1.34,3,3,3s3-1.34,3-3h6c0,1.66,1.34,3,3,3s3-1.34,3-3h1V9 C22,6.24,19.76,4,17,4z M6,18.5c-0.83,0-1.5-0.67-1.5-1.5s0.67-1.5,1.5-1.5s1.5,0.67,1.5,1.5S6.83,18.5,6,18.5z M18,18.5 c-0.83,0-1.5-0.67-1.5-1.5s0.67-1.5,1.5-1.5s1.5,0.67,1.5,1.5S18.83,18.5,18,18.5z M20,13H4V9c0-1.66,1.34-3,3-3h10 c1.66,0,3,1.34,3,3V13z"/>
    <rect x="6" y="11" width="12" height="2"/>
  </svg>
);

const SmallJetIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
    <path d="M21,16v-2l-8-5V3.5C13,2.67,12.33,2,11.5,2S10,2.67,10,3.5V9l-8,5v2l8-2.5V19l-2,1.5V22l3.5-1l3.5,1v-1.5L13,19v-5.5 L21,16z"/>
  </svg>
);

// Small donation comparison icons (keeping original ones too)
const GroceryBagIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
    <path d="M18,6h-2c0-2.21-1.79-4-4-4S8,3.79,8,6H6C4.9,6,4,6.9,4,8v12c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V8C20,6.9,19.1,6,18,6z M12,4c1.1,0,2,0.9,2,2h-4C10,4.9,10.9,4,12,4z M18,20H6V8h2v2c0,0.55,0.45,1,1,1s1-0.45,1-1V8h4v2c0,0.55,0.45,1,1,1s1-0.45,1-1V8 h2V20z"/>
  </svg>
);

const WatermelonIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
    <path d="M12,2C6.48,2,2,6.48,2,12c0,5.52,4.48,10,10,10s10-4.48,10-10C22,6.48,17.52,2,12,2z M12,18c-3.31,0-6-2.69-6-6 s2.69-6,6-6s6,2.69,6,6S15.31,18,12,18z"/>
    <circle cx="14" cy="10" r="1"/>
    <circle cx="10" cy="10" r="1"/>
  </svg>
);

const TurkeyIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
    <path d="M16.76,5.88c-0.57-0.38-1.24-0.62-1.93-0.79c0.39-0.36,0.75-0.77,1.04-1.24c0.18-0.29,0.27-0.6,0.27-0.92 c0-0.22-0.04-0.44-0.12-0.65c-0.41-1.09-1.59-1.81-3.26-2C12.3,0.14,11.97,0,11.62,0c-0.71,0-1.35,0.33-1.71,0.89 c-0.32,0.5-0.51,1.15-0.51,1.8v0.56C5.79,4.07,2,7.86,2,12.34c0,4.48,3.79,8.27,8.4,8.27c1.74,0,3.36-0.47,4.74-1.28l1.33,1.33 C16.74,20.92,17,21,17.27,21c0.3,0,0.57-0.11,0.77-0.33c0.4-0.4,0.37-1.05-0.05-1.42l-1.32-1.32c0.67-0.89,1.19-1.91,1.5-3.03 C19.31,11.39,18.6,7.29,16.76,5.88z M5.13,12.51c-0.8,0-1.45-0.65-1.45-1.45s0.65-1.45,1.45-1.45s1.45,0.65,1.45,1.45 S5.93,12.51,5.13,12.51z"/>
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
  const [activeComparison, setActiveComparison] = useState<'elephant' | 'bison' | 'car' | 'dog' | 'groceryBag' | 'watermelon' | 'turkey' | 'houseCat' | 'goldenRetriever' | 'grizzlyBear' | 'hippo' | 'schoolBus' | 'smallJet'>('elephant');
  
  useEffect(() => {
    const controls = animate(foodCount, impact.foodRescued, {
      duration: 2,
      ease: "easeOut"
    });
    
    // Determine which comparisons to use based on food weight
    const foodWeight = impact.foodRescued;
    const isSmallDonation = foodWeight < 500; // Check if this is a small donation
    
    // Set initial comparison based on donation size
    if (isSmallDonation) {
      setActiveComparison('dog'); // Start with dog for small donations
    }
    
    // Auto-rotate comparisons every 5 seconds
    const interval = setInterval(() => {
      setActiveComparison(current => {
        if (isSmallDonation) {
          // Small donation comparisons
          if (current === 'dog') return 'groceryBag';
          if (current === 'groceryBag') return 'watermelon';
          if (current === 'watermelon') return 'turkey';
          return 'dog';
        } else {
          // Regular large donation comparisons
          if (current === 'elephant') return 'bison';
          if (current === 'bison') return 'car';
          return 'elephant';
        }
      });
    }, 5000);
    
    return () => {
      controls.stop();
      clearInterval(interval);
    };
  }, [foodCount, impact.foodRescued]);
  
  // Parse numeric values for large comparisons
  const elephantCount = parseFloat(impact.babyElephants.replace(/[^0-9.]/g, ''));
  const bisonCount = parseFloat(impact.bison.replace(/[^0-9.]/g, ''));
  const carCount = parseFloat(impact.cars.replace(/[^0-9.]/g, ''));
  
  // Generate smaller comparison values for donations under 500 lbs
  const foodWeight = impact.foodRescued;
  const isSmallDonation = foodWeight < 500;
  
  // Calculate small donation equivalents
  const dogCount = foodWeight / 70; // Average large dog weight
  const groceryBagCount = foodWeight / 15; // Average full grocery bag
  const watermelonCount = foodWeight / 20; // Average watermelon
  const turkeyCount = foodWeight / 25; // Average turkey
  
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
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold mb-2 sm:mb-4">
          <motion.span>{roundedFood}</motion.span> lbs
        </div>
        <p className="text-base sm:text-lg md:text-xl">of food rescued from being wasted</p>
      </div>
      
      <div className="mb-4 sm:mb-6 md:mb-8">
        <p className="text-lg sm:text-xl md:text-2xl mb-2 sm:mb-4">That's equivalent to the weight of:</p>
        
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
          {/* Large donation comparisons */}
          {!isSmallDonation && (
            <>
              <motion.button 
                className={`bg-white/20 p-2 sm:p-3 md:p-4 rounded-xl cursor-pointer hover:bg-white/30 ${activeComparison === 'elephant' ? 'ring-2 ring-white' : ''}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: activeComparison === 'elephant' ? 1.05 : 1,
                  y: activeComparison === 'elephant' ? -5 : 0
                }}
                transition={{ duration: 0.3 }}
                onClick={() => setActiveComparison('elephant')}
              >
                <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 mx-auto mb-1 sm:mb-2">
                  <ElephantIcon />
                </div>
                <p className="text-base sm:text-xl md:text-2xl font-bold mb-0.5 sm:mb-1">{impact.babyElephants}</p>
                <p className="text-xs sm:text-sm md:text-base">Baby Elephants</p>
              </motion.button>
              
              <motion.button 
                className={`bg-white/20 p-2 sm:p-3 md:p-4 rounded-xl cursor-pointer hover:bg-white/30 ${activeComparison === 'bison' ? 'ring-2 ring-white' : ''}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: activeComparison === 'bison' ? 1.05 : 1,
                  y: activeComparison === 'bison' ? -5 : 0
                }}
                transition={{ duration: 0.3, delay: 0.1 }}
                onClick={() => setActiveComparison('bison')}
              >
                <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 mx-auto mb-1 sm:mb-2">
                  <BisonIcon />
                </div>
                <p className="text-base sm:text-xl md:text-2xl font-bold mb-0.5 sm:mb-1">{impact.bison}</p>
                <p className="text-xs sm:text-sm md:text-base">Bison</p>
              </motion.button>
              
              <motion.button 
                className={`bg-white/20 p-2 sm:p-3 md:p-4 rounded-xl cursor-pointer hover:bg-white/30 ${activeComparison === 'car' ? 'ring-2 ring-white' : ''}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: activeComparison === 'car' ? 1.05 : 1,
                  y: activeComparison === 'car' ? -5 : 0 
                }}
                transition={{ duration: 0.3, delay: 0.2 }}
                onClick={() => setActiveComparison('car')}
              >
                <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 mx-auto mb-1 sm:mb-2">
                  <CarIcon />
                </div>
                <p className="text-base sm:text-xl md:text-2xl font-bold mb-0.5 sm:mb-1">{impact.cars}</p>
                <p className="text-xs sm:text-sm md:text-base">Cars</p>
              </motion.button>
            </>
          )}
          
          {/* Small donation comparisons */}
          {isSmallDonation && (
            <>
              <motion.button 
                className={`bg-white/20 p-2 sm:p-3 md:p-4 rounded-xl cursor-pointer hover:bg-white/30 ${activeComparison === 'dog' ? 'ring-2 ring-white' : ''}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: activeComparison === 'dog' ? 1.05 : 1,
                  y: activeComparison === 'dog' ? -5 : 0
                }}
                transition={{ duration: 0.3 }}
                onClick={() => setActiveComparison('dog')}
              >
                <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 mx-auto mb-1 sm:mb-2">
                  <DogIcon />
                </div>
                <p className="text-base sm:text-xl md:text-2xl font-bold mb-0.5 sm:mb-1">{dogCount.toFixed(1)}</p>
                <p className="text-xs sm:text-sm md:text-base">Large Dogs</p>
              </motion.button>
              
              <motion.button 
                className={`bg-white/20 p-2 sm:p-3 md:p-4 rounded-xl cursor-pointer hover:bg-white/30 ${activeComparison === 'groceryBag' ? 'ring-2 ring-white' : ''}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: activeComparison === 'groceryBag' ? 1.05 : 1,
                  y: activeComparison === 'groceryBag' ? -5 : 0
                }}
                transition={{ duration: 0.3, delay: 0.1 }}
                onClick={() => setActiveComparison('groceryBag')}
              >
                <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 mx-auto mb-1 sm:mb-2">
                  <GroceryBagIcon />
                </div>
                <p className="text-base sm:text-xl md:text-2xl font-bold mb-0.5 sm:mb-1">{groceryBagCount.toFixed(1)}</p>
                <p className="text-xs sm:text-sm md:text-base">Grocery Bags</p>
              </motion.button>
              
              <motion.button 
                className={`bg-white/20 p-2 sm:p-3 md:p-4 rounded-xl cursor-pointer hover:bg-white/30 ${activeComparison === 'watermelon' ? 'ring-2 ring-white' : ''}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: activeComparison === 'watermelon' ? 1.05 : 1,
                  y: activeComparison === 'watermelon' ? -5 : 0
                }}
                transition={{ duration: 0.3, delay: 0.2 }}
                onClick={() => setActiveComparison('watermelon')}
              >
                <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 mx-auto mb-1 sm:mb-2">
                  <WatermelonIcon />
                </div>
                <p className="text-base sm:text-xl md:text-2xl font-bold mb-0.5 sm:mb-1">{watermelonCount.toFixed(1)}</p>
                <p className="text-xs sm:text-sm md:text-base">Watermelons</p>
              </motion.button>
              
              <motion.button 
                className={`bg-white/20 p-2 sm:p-3 md:p-4 rounded-xl cursor-pointer hover:bg-white/30 ${activeComparison === 'turkey' ? 'ring-2 ring-white' : ''}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: activeComparison === 'turkey' ? 1.05 : 1,
                  y: activeComparison === 'turkey' ? -5 : 0
                }}
                transition={{ duration: 0.3, delay: 0.3 }}
                onClick={() => setActiveComparison('turkey')}
              >
                <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 mx-auto mb-1 sm:mb-2">
                  <TurkeyIcon />
                </div>
                <p className="text-base sm:text-xl md:text-2xl font-bold mb-0.5 sm:mb-1">{turkeyCount.toFixed(1)}</p>
                <p className="text-xs sm:text-sm md:text-base">Turkeys</p>
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Comparison visualization */}
      <motion.div 
        className="flex flex-wrap justify-center gap-2 my-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        {/* Large donation comparisons */}
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
        
        {/* Small donation comparisons */}
        {activeComparison === 'dog' && (
          <>
            {Array.from({ length: Math.min(8, Math.ceil(dogCount)) }).map((_, idx) => (
              <motion.div 
                key={idx}
                className="h-10 w-10"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (idx * 0.1) }}
              >
                <DogIcon />
              </motion.div>
            ))}
          </>
        )}
        
        {activeComparison === 'groceryBag' && (
          <>
            {Array.from({ length: Math.min(10, Math.ceil(groceryBagCount)) }).map((_, idx) => (
              <motion.div 
                key={idx}
                className="h-9 w-9"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (idx * 0.1) }}
              >
                <GroceryBagIcon />
              </motion.div>
            ))}
          </>
        )}
        
        {activeComparison === 'watermelon' && (
          <>
            {Array.from({ length: Math.min(12, Math.ceil(watermelonCount)) }).map((_, idx) => (
              <motion.div 
                key={idx}
                className="h-8 w-8"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (idx * 0.1) }}
              >
                <WatermelonIcon />
              </motion.div>
            ))}
          </>
        )}
        
        {activeComparison === 'turkey' && (
          <>
            {Array.from({ length: Math.min(12, Math.ceil(turkeyCount)) }).map((_, idx) => (
              <motion.div 
                key={idx}
                className="h-9 w-9"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (idx * 0.1) }}
              >
                <TurkeyIcon />
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
