import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { DonationImpact } from "@/types/donation";
import SlideLayout from "./SlideLayout";
import { Brush, ColorPalette, Users } from "lucide-react";
import CountUpAnimation from "./CountUpAnimation";

interface MuralsSlideProps {
  impact: DonationImpact;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

export default function MuralsSlide({ 
  impact,
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide
}: MuralsSlideProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  
  useEffect(() => {
    const controls = animate(count, impact.muralsSupported, {
      duration: 2,
      ease: "easeOut",
    });
    
    return controls.stop;
  }, [count, impact.muralsSupported]);
  
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
      title="Community Murals Impact"
      variant="murals"
      quote="Art has the power to transform not just spaces, but the communities that create and experience them together."
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
          <Brush className="h-16 w-16 text-[#FFCA28] mb-3" />
        </motion.div>
        
        <div className="text-center">
          <p className="text-lg font-semibold text-[#424242]">Your donation supports</p>
          <p className="text-4xl font-bold text-[#FFCA28]">
            <motion.span>{rounded}</motion.span> Community Murals
          </p>
          <p className="text-sm text-[#424242] mt-2">
            Creating beautiful, collaborative public art in our communities
          </p>
        </div>
        
        <motion.div 
          className="bg-[#FFF8E1] p-4 sm:p-5 rounded-lg border border-[#FFCA28]/20 w-full mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <p className="text-center text-[#424242]">
            Each mural project engages <span className="font-semibold">15-25 youth artists</span> and transforms public spaces in underserved neighborhoods.
          </p>
        </motion.div>
        
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="flex flex-col items-center p-3 sm:p-4 rounded-lg bg-[#FFF8E1] border border-[#FFCA28]/20 shadow-sm hover:shadow-md transition-shadow"
            variants={itemVariants}
          >
            <div className="bg-[#FFCA28] p-2 rounded-full mb-2">
              <Users className="h-5 w-5 text-white" />
            </div>
            <p className="text-sm font-medium text-[#424242]">People Engaged</p>
            <p className="text-lg sm:text-xl font-semibold text-[#424242]">
              <CountUpAnimation 
                value={impact.muralsSupported * 20} 
                duration={2} 
              />
            </p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col items-center p-3 sm:p-4 rounded-lg bg-[#FFF8E1] border border-[#FFCA28]/20 shadow-sm hover:shadow-md transition-shadow"
            variants={itemVariants}
          >
            <div className="bg-[#FFCA28] p-2 rounded-full mb-2">
              <ColorPalette className="h-5 w-5 text-white" />
            </div>
            <p className="text-sm font-medium text-[#424242]">Art Supplies</p>
            <p className="text-lg sm:text-xl font-semibold text-[#424242]">
              ${impact.muralsSupported * 250}
            </p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col items-center p-3 sm:p-4 rounded-lg bg-[#FFF8E1] border border-[#FFCA28]/20 shadow-sm hover:shadow-md transition-shadow"
            variants={itemVariants}
          >
            <div className="bg-[#FFCA28] p-2 rounded-full mb-2">
              <Brush className="h-5 w-5 text-white" />
            </div>
            <p className="text-sm font-medium text-[#424242]">Hours of Creation</p>
            <p className="text-lg sm:text-xl font-semibold text-[#424242]">
              <CountUpAnimation 
                value={impact.muralsSupported * 40} 
                duration={2} 
              />
            </p>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="w-full mt-4 bg-white rounded-lg shadow-sm border border-gray-100 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <h3 className="font-semibold text-[#424242] mb-2">Mural Project Impact:</h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <div className="min-w-4 h-4 rounded-full bg-[#FFCA28] mt-1 mr-2"></div>
              <p className="text-sm text-[#424242]">Beautifies public spaces and reduces graffiti</p>
            </li>
            <li className="flex items-start">
              <div className="min-w-4 h-4 rounded-full bg-[#FFCA28] mt-1 mr-2"></div>
              <p className="text-sm text-[#424242]">Builds youth leadership and collaboration skills</p>
            </li>
            <li className="flex items-start">
              <div className="min-w-4 h-4 rounded-full bg-[#FFCA28] mt-1 mr-2"></div>
              <p className="text-sm text-[#424242]">Creates a sense of community pride and ownership</p>
            </li>
          </ul>
        </motion.div>
      </div>
    </SlideLayout>
  );
}