import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { DonationImpact } from "@/types/donation";
import SlideLayout from "./SlideLayout";
import { Users } from "lucide-react";
import CountUpAnimation from "./CountUpAnimation";

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
      title="You Helped Serve"
      variant="people"
      quote="Every number represents a real person with a name, a story, and hope for tomorrow."
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
          <Users className="h-16 w-16 text-[#0c4428] mb-3" />
        </motion.div>
        
        <div className="text-center">
          <p className="text-lg font-semibold text-[#414042]">Your donation serves</p>
          <p className="text-4xl font-bold text-[#0c4428]">
            <motion.span>{rounded}</motion.span> People
          </p>
          <p className="text-sm text-[#414042] mt-2">
            That's <span className="font-medium">{impact.peoplePercentage}</span> of those served in Boulder & Broomfield Counties
          </p>
        </div>
        
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="flex flex-col items-center p-3 sm:p-4 rounded-lg bg-[#f3ffd7] border border-[#8dc53e]/20 shadow-sm hover:shadow-md transition-shadow"
            variants={itemVariants}
          >
            <p className="text-sm font-medium text-[#414042]">Meals Provided</p>
            <p className="text-lg sm:text-xl font-semibold text-[#414042]">
              <CountUpAnimation value={impact.mealsProvided} duration={2} />
            </p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col items-center p-3 sm:p-4 rounded-lg bg-[#e7f4f2] border border-[#227d7f]/20 shadow-sm hover:shadow-md transition-shadow"
            variants={itemVariants}
          >
            <p className="text-sm font-medium text-[#414042]">Days of Food</p>
            <p className="text-lg sm:text-xl font-semibold text-[#414042]">
              {impact.daysFed}
            </p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col items-center p-3 sm:p-4 rounded-lg bg-[#f0f9f4] border border-[#0c4428]/20 shadow-sm hover:shadow-md transition-shadow"
            variants={itemVariants}
          >
            <p className="text-sm font-medium text-[#414042]">Pounds of Food</p>
            <p className="text-lg sm:text-xl font-semibold text-[#414042]">
              <CountUpAnimation value={parseInt(impact.foodRescued.toFixed(0))} duration={2} />
            </p>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="bg-[#f0f9f4] p-4 sm:p-5 rounded-lg border border-[#0c4428]/10 w-full mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <p className="text-center text-[#0c4428]">
            Your donation directly impacts our ability to serve families in need in our community.
            <span className="block mt-1 font-medium">Together, we're building a hunger-free community.</span>
          </p>
        </motion.div>
      </div>
    </SlideLayout>
  );
}
