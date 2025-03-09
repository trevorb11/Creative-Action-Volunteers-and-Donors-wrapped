import { motion } from "framer-motion";
import { Users, UserCheck, HandHeart } from "lucide-react";
import { DonationImpact } from "@/types/donation";
import SlideLayout from "./SlideLayout";
import CountUpAnimation from "./CountUpAnimation";
import { useState, useRef, useEffect } from "react";

interface DonorPeopleSlideProps {
  impact: DonationImpact;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

export default function DonorPeopleSlide({ 
  impact,
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide
}: DonorPeopleSlideProps) {
  const [animationComplete, setAnimationComplete] = useState(false);
  const peopleRef = useRef<HTMLDivElement>(null);
  
  // Container and item variants for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Animate the people dots
  useEffect(() => {
    // Animate the people counter with growing dots
    if (peopleRef.current) {
      const animation = peopleRef.current.animate(
        [{ width: '0%' }, { width: '85%' }],
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

  return (
    <SlideLayout
      title="People You've Helped"
      variant="people"
      quote="Behind every number is a neighbor whose life you've touched with your generosity."
      onNext={onNext}
      onPrevious={onPrevious}
      isFirstSlide={isFirstSlide}
      isLastSlide={isLastSlide}
    >
      <div className="flex flex-col items-center mb-6">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="w-20 h-20 bg-[#e0f0ea] rounded-full flex items-center justify-center mb-4"
        >
          <Users className="h-10 w-10 text-white" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center"
        >
          <h3 className="text-lg sm:text-xl text-[#414042] font-medium mb-2">
            Your donation serves
          </h3>
          <div className="text-3xl sm:text-4xl font-bold text-white">
            <CountUpAnimation
              value={impact.peopleServed} 
              isCurrency={false}
              className="text-white"
            /> people
          </div>
          <p className="text-[#414042] mt-2 text-sm sm:text-base">
            That's {impact.peoplePercentage} of our neighbors in need
          </p>
        </motion.div>
        
        {/* People visualization with dots */}
        <div className="w-full h-10 bg-[#e0f0ea]/30 rounded-lg mt-4 mb-6 relative overflow-hidden">
          <div 
            ref={peopleRef} 
            className="h-10 rounded-lg flex items-center justify-start overflow-hidden"
            style={{ width: '0%' }}
          >
            <div className="flex flex-wrap">
              {Array.from({ length: Math.min(100, impact.peopleServed) }).map((_, i) => (
                <motion.div
                  key={i}
                  className="h-2 w-2 rounded-full mx-1 my-1 bg-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.01 * i + 1 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <motion.div
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
          variants={itemVariants}
        >
          <div className="flex items-start">
            <div className="bg-[#e0f0ea] p-2 rounded-full mr-3">
              <UserCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-[#414042]">Community Impact</h4>
              <p className="text-sm text-gray-600">
                You're helping feed vulnerable populations including children, seniors, and working families
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
          variants={itemVariants}
        >
          <div className="flex items-start">
            <div className="bg-[#e0f0ea] p-2 rounded-full mr-3">
              <HandHeart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-[#414042]">Dignity & Respect</h4>
              <p className="text-sm text-gray-600">
                Your support helps provide dignified access to nutritious food for people facing food insecurity
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </SlideLayout>
  );
}