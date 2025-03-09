import { motion } from "framer-motion";
import { DonationImpact } from "@/types/donation";
import SlideLayout from "./SlideLayout";
import { ShoppingBag, Leaf, Scale } from "lucide-react";
import CountUpAnimation from "./CountUpAnimation";

interface FoodRescueSlideProps {
  impact: DonationImpact;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

export default function SimpleFoodRescueSlide({ 
  impact, 
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide
}: FoodRescueSlideProps) {
  // Container and item variants for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.4
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  return (
    <SlideLayout
      title="Food Rescue Impact"
      variant="foodRescue"
      quote="When we rescue food, we're fighting hunger and protecting our environment."
      onNext={onNext}
      onPrevious={onPrevious}
      isFirstSlide={isFirstSlide}
      isLastSlide={isLastSlide}
    >
      <div className="flex flex-col items-center space-y-5">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20, 
            delay: 0.3 
          }}
        >
          <ShoppingBag className="h-16 w-16 text-[#dd6b20] mb-3" />
        </motion.div>
        
        <div className="text-center">
          <p className="text-lg font-semibold text-[#414042]">Your donation rescued</p>
          <p className="text-4xl font-bold text-[#dd6b20]">
            <CountUpAnimation value={impact.foodRescued} /> lbs
          </p>
          <p className="text-sm text-[#414042] mt-2">
            of fresh, nutritious food that would otherwise go to waste
          </p>
        </div>
        
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="flex flex-col items-center p-3 sm:p-4 rounded-lg bg-[#fff3d4] border border-[#dd6b20]/20 shadow-sm hover:shadow-md transition-shadow"
            variants={itemVariants}
          >
            <Scale className="h-8 w-8 text-[#dd6b20] mb-2" />
            <p className="text-sm font-medium text-[#414042]">Weight Comparison</p>
            <p className="text-sm sm:text-base text-center font-semibold text-[#414042] mt-1">
              Weighs as much as {impact.weightComparison}
            </p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col items-center p-3 sm:p-4 rounded-lg bg-[#f0f9f4] border border-[#0c4428]/20 shadow-sm hover:shadow-md transition-shadow"
            variants={itemVariants}
          >
            <Leaf className="h-8 w-8 text-[#0c4428] mb-2" />
            <p className="text-sm font-medium text-[#414042]">Environmental Impact</p>
            <p className="text-sm sm:text-base text-center font-semibold text-[#414042] mt-1">
              Prevented {impact.co2Saved.toLocaleString()} lbs of CO₂ emissions
            </p>
          </motion.div>
        </motion.div>
        
        {/* Food type breakdown */}
        <motion.div 
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <div className="bg-white/90 p-4 rounded-lg border border-[#dd6b20]/20 shadow-sm">
            <h3 className="text-center text-lg font-semibold text-[#dd6b20] mb-3">Food Rescued Includes</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="flex flex-col items-center">
                <div className="h-2 bg-[#8DC53E] rounded-full w-full mb-1"></div>
                <p className="text-xs sm:text-sm font-medium">{impact.producePercentage}% Produce</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-2 bg-[#227D7F] rounded-full w-full mb-1"></div>
                <p className="text-xs sm:text-sm font-medium">{impact.dairyPercentage}% Dairy</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-2 bg-[#DD6B20] rounded-full w-full mb-1"></div>
                <p className="text-xs sm:text-sm font-medium">{impact.proteinPercentage}% Protein</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-2 bg-[#414042] rounded-full w-full mb-1"></div>
                <p className="text-xs sm:text-sm font-medium">{100 - impact.producePercentage - impact.dairyPercentage - impact.proteinPercentage}% Other</p>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-[#fdf1d7] p-4 sm:p-5 rounded-lg border border-[#dd6b20]/10 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.5 }}
        >
          <p className="text-center text-[#414042]">
            <span className="text-[#dd6b20] font-medium">{impact.freshFoodPercentage}%</span> of rescued food is fresh, nutritious food 
            that would otherwise end up in landfills.
            <span className="block mt-1 text-sm">Every dollar you donate helps us rescue 1.83 pounds of food.</span>
          </p>
        </motion.div>
      </div>
    </SlideLayout>
  );
}