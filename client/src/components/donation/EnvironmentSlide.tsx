import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { DonationImpact } from "@/types/donation";
import SlideLayout from "./SlideLayout";
import { Leaf, Droplet, Car } from "lucide-react";
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
  // Container and item variants for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.6
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  return (
    <SlideLayout
      title="Your Environmental Impact"
      variant="environment"
      quote="When we rescue food, we're not just fighting hunger — we're fighting climate change."
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
          <Leaf className="h-16 w-16 text-[#8dc53e] mb-3" />
        </motion.div>
        
        <div className="text-center">
          <p className="text-lg font-semibold text-[#414042]">Your donation helps the environment</p>
          <p className="text-4xl font-bold text-[#0c4428]">
            Rescued Food Impact
          </p>
          <p className="text-sm text-[#414042] mt-2">
            By rescuing <span className="font-medium">{impact.foodRescued.toLocaleString()}</span> pounds of food, 
            you're helping the planet too
          </p>
        </div>
        
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="flex flex-col items-center p-3 sm:p-4 rounded-lg bg-[#f3ffd7] border border-[#8dc53e]/20 shadow-sm hover:shadow-md transition-shadow"
            variants={itemVariants}
          >
            <Leaf className="h-8 w-8 text-[#8dc53e] mb-2" />
            <p className="text-sm font-medium text-[#414042]">CO² Prevented</p>
            <p className="text-lg sm:text-xl font-semibold text-[#414042]">
              <CountUpAnimation value={impact.co2Saved} duration={2} /> lbs
            </p>
            <p className="text-xs text-[#414042] mt-1">
              Equal to {impact.cars} car{parseInt(impact.cars) !== 1 ? 's' : ''} off the road
            </p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col items-center p-3 sm:p-4 rounded-lg bg-[#e7f4f2] border border-[#227d7f]/20 shadow-sm hover:shadow-md transition-shadow"
            variants={itemVariants}
          >
            <Droplet className="h-8 w-8 text-[#227d7f] mb-2" />
            <p className="text-sm font-medium text-[#414042]">Water Saved</p>
            <p className="text-lg sm:text-xl font-semibold text-[#414042]">
              <CountUpAnimation value={impact.waterSaved} duration={2} /> gal
            </p>
            <p className="text-xs text-[#414042] mt-1">
              Enough to fill {Math.round(impact.waterSaved / 33)} bathtubs
            </p>
          </motion.div>
        </motion.div>
        
        {/* Weight Comparison */}
        <motion.div 
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <div className="bg-[#f0f9f4] p-4 rounded-lg border border-[#0c4428]/10">
            <p className="text-center text-[#0c4428] text-sm">
              <span className="font-medium block mb-1">Did you know?</span>
              The {impact.foodRescued.toLocaleString()} pounds of food you helped rescue weighs as much as {impact.weightComparison}!
            </p>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-[#f0f9f4] p-4 sm:p-5 rounded-lg border border-[#0c4428]/10 w-full mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <p className="text-center text-[#0c4428]">
            Your donation helps us rescue food that would otherwise end up in landfills.
            <span className="block mt-1 font-medium">Fighting hunger and climate change together.</span>
          </p>
        </motion.div>
      </div>
    </SlideLayout>
  );
}
