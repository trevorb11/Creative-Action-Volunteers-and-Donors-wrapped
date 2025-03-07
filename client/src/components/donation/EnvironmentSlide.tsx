import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { DonationImpact } from "@shared/schema";
import SlideLayout from "./SlideLayout";
import { Leaf, Droplet, Car } from "lucide-react";

interface EnvironmentSlideProps {
  impact: DonationImpact;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

export default function EnvironmentSlide({ 
  impact, 
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide
}: EnvironmentSlideProps) {
  const co2Count = useMotionValue(0);
  const roundedCO2 = useTransform(co2Count, (latest) => Math.round(latest));
  
  const waterCount = useMotionValue(0);
  const roundedWater = useTransform(waterCount, (latest) => Math.round(latest));
  
  useEffect(() => {
    const co2Controls = animate(co2Count, impact.co2Saved, {
      duration: 2,
      ease: "easeOut"
    });
    
    const waterControls = animate(waterCount, impact.waterSaved, {
      duration: 2,
      ease: "easeOut"
    });
    
    return () => {
      co2Controls.stop();
      waterControls.stop();
    };
  }, [co2Count, waterCount, impact]);
  
  return (
    <SlideLayout
      title="Your Environmental Impact"
      titleClassName="text-white" // Make title white
      variant="environment"
      quote="When we rescue food, we're not just fighting hunger — we're fighting climate change. Each pound of food rescued prevents about 3.2 pounds of CO2 emissions."
      onNext={onNext}
      onPrevious={onPrevious}
      isFirstSlide={isFirstSlide}
      isLastSlide={isLastSlide}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
        <motion.div 
          className="bg-white/20 p-4 sm:p-6 rounded-xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <Leaf className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />
          </div>
          <div className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-1 sm:mb-2">
            <motion.span>{roundedCO2}</motion.span>
          </div>
          <p className="text-base sm:text-lg md:text-xl font-heading">Pounds of CO2 Emissions Prevented</p>
          <p className="text-sm sm:text-md mt-1 sm:mt-2 opacity-80">
            That's like taking {impact.cars} off the road for a day
          </p>
        </motion.div>
        
        <motion.div 
          className="bg-white/20 p-4 sm:p-6 rounded-xl"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <Droplet className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />
          </div>
          <div className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-1 sm:mb-2">
            <motion.span>{roundedWater}</motion.span>
          </div>
          <p className="text-base sm:text-lg md:text-xl font-heading">Gallons of Water Saved</p>
          <p className="text-sm sm:text-md mt-1 sm:mt-2 opacity-80">
            Enough to fill {Math.round(impact.waterSaved / 33)} bathtubs
          </p>
        </motion.div>
      </div>
      
      {/* Car emissions visualization */}
      <motion.div
        className="flex justify-center items-center flex-wrap gap-2 my-4 sm:my-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        {Array.from({ length: Math.min(10, parseInt(impact.cars)) }).map((_, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + (idx * 0.1) }}
          >
            <Car className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
          </motion.div>
        ))}
      </motion.div>
      
      <p className="text-base sm:text-lg md:text-xl mt-3 sm:mt-4">
        Your support helps Community Food Share rescue food that would otherwise end up in landfills, preventing greenhouse gas emissions and conserving water resources.
      </p>
    </SlideLayout>
  );
}
