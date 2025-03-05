import { useEffect } from "react";
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

export default function FoodRescueSlide({ 
  impact,
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide
}: FoodRescueSlideProps) {
  const foodCount = useMotionValue(0);
  const roundedFood = useTransform(foodCount, (latest) => Math.round(latest));
  
  useEffect(() => {
    const controls = animate(foodCount, impact.foodRescued, {
      duration: 2,
      ease: "easeOut"
    });
    
    return controls.stop;
  }, [foodCount, impact.foodRescued]);
  
  return (
    <SlideLayout
      title="Food Rescue Impact"
      variant="foodRescue"
      quote="Community Food Share rescues 11 tons of food each day that would otherwise go to waste, that's the equivalent weight of 112 baby elephants, 11 bison, or 5 and a half cars!"
      onNext={onNext}
      onPrevious={onPrevious}
      isFirstSlide={isFirstSlide}
      isLastSlide={isLastSlide}
    >
      <div className="mb-10">
        <div className="text-6xl md:text-7xl font-heading font-extrabold mb-4">
          <motion.span>{roundedFood}</motion.span> lbs
        </div>
        <p className="text-xl">of food rescued from being wasted</p>
      </div>
      
      <div className="mb-10">
        <p className="text-2xl mb-6">That's equivalent to the weight of:</p>
        
        <div className="flex flex-wrap justify-center gap-6">
          <motion.div 
            className="bg-white/20 p-4 rounded-xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-3xl font-bold mb-2">{impact.babyElephants}</p>
            <p>Baby Elephants</p>
          </motion.div>
          
          <motion.div 
            className="bg-white/20 p-4 rounded-xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-3xl font-bold mb-2">{impact.bison}</p>
            <p>Bison</p>
          </motion.div>
          
          <motion.div 
            className="bg-white/20 p-4 rounded-xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className="text-3xl font-bold mb-2">{impact.cars}</p>
            <p>Cars</p>
          </motion.div>
        </div>
      </div>

      {/* LLM-enhanced dynamic content */}
      <motion.div
        className="bg-white/10 p-5 rounded-xl mt-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <p className="text-lg italic">
          "This rescued food weighs as much as {impact.babyElephants} - imagine the impact you're making!"
        </p>
      </motion.div>
    </SlideLayout>
  );
}
