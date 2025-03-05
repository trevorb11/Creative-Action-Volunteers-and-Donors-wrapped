import { useEffect, useRef } from "react";
import { DonationImpact } from "@shared/schema";
import SlideLayout from "./SlideLayout";
import { motion } from "framer-motion";

interface NutritionSlideProps {
  impact: DonationImpact;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

export default function NutritionSlide({ 
  impact,
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide
}: NutritionSlideProps) {
  const produceBarRef = useRef<HTMLDivElement>(null);
  const dairyBarRef = useRef<HTMLDivElement>(null);
  const proteinBarRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (produceBarRef.current) {
      produceBarRef.current.animate(
        [{ width: '0%' }, { width: `${impact.producePercentage}%` }],
        {
          duration: 1000,
          fill: 'forwards',
          easing: 'ease-out',
        }
      );
    }
    
    if (dairyBarRef.current) {
      dairyBarRef.current.animate(
        [{ width: '0%' }, { width: `${impact.dairyPercentage}%` }],
        {
          duration: 1000,
          delay: 200,
          fill: 'forwards',
          easing: 'ease-out',
        }
      );
    }
    
    if (proteinBarRef.current) {
      proteinBarRef.current.animate(
        [{ width: '0%' }, { width: `${impact.proteinPercentage}%` }],
        {
          duration: 1000,
          delay: 400,
          fill: 'forwards',
          easing: 'ease-out',
        }
      );
    }
  }, [impact]);
  
  return (
    <SlideLayout
      title="Your Food Breakdown"
      variant="nutrition"
      quote="72% of distribution consisted of fresh produce, dairy, and high-protein foods, supporting healthy and balanced diets."
      onNext={onNext}
      onPrevious={onPrevious}
      isFirstSlide={isFirstSlide}
      isLastSlide={isLastSlide}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <motion.div 
          className="bg-white/20 p-6 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-4xl font-heading font-bold mb-2">{impact.producePercentage.toFixed(1)}%</div>
          <h3 className="text-xl font-heading mb-1">Fresh Produce</h3>
          <div className="w-full bg-white/20 h-3 rounded-full">
            <div ref={produceBarRef} className="bg-white h-3 rounded-full w-0"></div>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white/20 p-6 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-4xl font-heading font-bold mb-2">{impact.dairyPercentage.toFixed(1)}%</div>
          <h3 className="text-xl font-heading mb-1">Dairy</h3>
          <div className="w-full bg-white/20 h-3 rounded-full">
            <div ref={dairyBarRef} className="bg-white h-3 rounded-full w-0"></div>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white/20 p-6 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="text-4xl font-heading font-bold mb-2">{impact.proteinPercentage.toFixed(1)}%</div>
          <h3 className="text-xl font-heading mb-1">Protein</h3>
          <div className="w-full bg-white/20 h-3 rounded-full">
            <div ref={proteinBarRef} className="bg-white h-3 rounded-full w-0"></div>
          </div>
        </motion.div>
      </div>
      
      <p className="text-xl mb-6">
        Your donation helped provide <span className="font-bold">{impact.freshFoodPercentage.toFixed(0)}%</span> nutritious food to families in need.
      </p>
    </SlideLayout>
  );
}
