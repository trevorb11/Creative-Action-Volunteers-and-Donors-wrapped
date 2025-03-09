import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DonationImpact } from "@/types/donation";
import SlideLayout from "./SlideLayout";
import { Leaf, Scale, Dog, Cat, Baby, Fish, Truck, Apple } from "lucide-react";
import CountUpAnimation from "./CountUpAnimation";

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
  // State for the current comparison icon
  const [comparisonIcon, setComparisonIcon] = useState<React.ReactNode>(null);
  
  // Get the appropriate icon based on the amount of food rescued
  useEffect(() => {
    const lbs = impact.foodRescued;
    
    if (lbs < 5) {
      setComparisonIcon(<Apple className="h-16 w-16 text-[#8dc53e]" />);
    } else if (lbs < 20) {
      setComparisonIcon(<Cat className="h-16 w-16 text-[#8dc53e]" />);
    } else if (lbs < 50) {
      setComparisonIcon(<Baby className="h-16 w-16 text-[#8dc53e]" />);
    } else if (lbs < 400) {
      setComparisonIcon(<Dog className="h-16 w-16 text-[#8dc53e]" />);
    } else if (lbs < 3000) {
      setComparisonIcon(<Truck className="h-16 w-16 text-[#8dc53e]" />);
    } else {
      setComparisonIcon(<Fish className="h-16 w-16 text-[#8dc53e]" />);
    }
  }, [impact.foodRescued]);
  
  return (
    <SlideLayout
      title="Food Rescue Comparison"
      variant="environment"
      quote="When we rescue food, we're not just fighting hunger — we're saving the environment too."
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
          className="mb-3"
        >
          {comparisonIcon}
        </motion.div>
        
        <div className="text-center">
          <p className="text-lg font-semibold text-[#414042]">Your donation rescued</p>
          <p className="text-4xl font-bold text-[#0c4428]">
            {impact.foodRescued.toLocaleString()} pounds
          </p>
          <p className="text-sm text-[#414042] mt-2">
            of fresh, nutritious food that would otherwise go to waste
          </p>
        </div>
        
        {/* Weight Comparison Card */}
        <motion.div 
          className="bg-[#f3ffd7] p-5 sm:p-6 rounded-lg border border-[#8dc53e]/20 shadow-sm hover:shadow-md transition-shadow w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="flex flex-col items-center text-center">
            <Scale className="h-10 w-10 text-[#8dc53e] mb-3" />
            <h3 className="text-lg font-bold text-[#414042] mb-2">Weight Comparison</h3>
            <p className="text-2xl font-bold text-[#0c4428] mb-1">
              {impact.weightComparison || "That's equivalent to several large animals!"}
            </p>
            <p className="text-sm text-[#414042] mt-2 italic">
              {impact.weightComparisonText || "Your donation makes a big impact."}
            </p>
          </div>
        </motion.div>
        
        {/* Food Type Distribution */}
        <motion.div 
          className="bg-[#f0f9f4] p-4 sm:p-5 rounded-lg border border-[#0c4428]/10 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <h3 className="text-center text-[#0c4428] font-bold mb-3">
            Food Rescued Includes
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#8dc53e]/20 p-3 rounded-lg text-center">
              <p className="text-sm font-medium text-[#414042]">Produce</p>
              <p className="text-lg font-bold text-[#0c4428]">{impact.producePercentage}%</p>
            </div>
            <div className="bg-[#227d7f]/20 p-3 rounded-lg text-center">
              <p className="text-sm font-medium text-[#414042]">Dairy</p>
              <p className="text-lg font-bold text-[#0c4428]">{impact.dairyPercentage}%</p>
            </div>
            <div className="bg-[#e97826]/20 p-3 rounded-lg text-center">
              <p className="text-sm font-medium text-[#414042]">Protein</p>
              <p className="text-lg font-bold text-[#0c4428]">{impact.proteinPercentage}%</p>
            </div>
            <div className="bg-[#414042]/20 p-3 rounded-lg text-center">
              <p className="text-sm font-medium text-[#414042]">Other</p>
              <p className="text-lg font-bold text-[#0c4428]">{100 - impact.freshFoodPercentage}%</p>
            </div>
          </div>
        </motion.div>
      </div>
    </SlideLayout>
  );
}
