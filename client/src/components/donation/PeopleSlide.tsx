import { useEffect, useRef, useState } from "react";
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
  const [animationComplete, setAnimationComplete] = useState(false);
  const peopleRef = useRef<HTMLDivElement>(null);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  
  useEffect(() => {
    const controls = animate(count, impact.peopleServed, {
      duration: 2,
      ease: "easeOut"
    });
    
    return () => controls.stop();
  }, [count, impact.peopleServed]);

  // Animation for the people visualization dots
  useEffect(() => {
    // Animate the people counter with growing dots
    if (peopleRef.current) {
      const animation = peopleRef.current.animate(
        [{ width: '0%' }, { width: '90%' }],
        {
          duration: 2000,
          fill: 'forwards',
          easing: 'ease-out',
        }
      );

      animation.onfinish = () => setAnimationComplete(true);

      return () => {
        animation.cancel();
      };
    }
  }, []);
  
  // Calculate how many dots to show - don't show too many
  const numberOfDots = Math.min(100, impact.peopleServed);
  
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
        </div>
        
        {/* People visualization */}
        <div className="w-full h-16 bg-[#f0f9f4] rounded-lg mb-4 relative overflow-hidden">
          <div 
            ref={peopleRef} 
            className="h-16 rounded-lg flex items-center justify-start overflow-hidden"
            style={{ width: '0%' }}
          >
            <div className="flex flex-wrap p-2">
              {Array.from({ length: numberOfDots }).map((_, i) => (
                <motion.div
                  key={i}
                  className="h-2.5 w-2.5 rounded-full mx-1 my-1 bg-[#0c4428]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.01 * i + 1 }}
                />
              ))}
            </div>
          </div>
        </div>
        
        <motion.div
          className="text-center mb-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.5 }}
        >
          <p className="text-[#414042] text-sm">
            Each dot represents people in Boulder & Broomfield Counties you've helped.
          </p>
        </motion.div>
        
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
          className="bg-[#f0f9f4] p-4 sm:p-5 rounded-lg border border-[#0c4428]/10 w-full mt-2"
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
