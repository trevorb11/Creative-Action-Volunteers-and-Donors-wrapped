import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { DonationImpact } from "@/types/donation";
import SlideLayout from "./SlideLayout";
import { Heart, Brain, Sparkles } from "lucide-react";
import CountUpAnimation from "./CountUpAnimation";

interface SELImpactSlideProps {
  impact: DonationImpact;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

export default function SELImpactSlide({ 
  impact,
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide
}: SELImpactSlideProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  
  useEffect(() => {
    const controls = animate(count, impact.selStudents, {
      duration: 2,
      ease: "easeOut",
    });
    
    return controls.stop;
  }, [count, impact.selStudents]);
  
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
      title="Social-Emotional Learning"
      variant="selImpact"
      quote="Arts education builds essential life skills that help students succeed in school and beyond."
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
          <Heart className="h-16 w-16 text-[#EC407A] mb-3" />
        </motion.div>
        
        <div className="text-center">
          <p className="text-lg font-semibold text-[#424242]">Your donation supports</p>
          <p className="text-4xl font-bold text-[#EC407A]">
            <motion.span>{rounded}</motion.span> Students
          </p>
          <p className="text-sm text-[#424242] mt-2">
            Receiving social-emotional learning through arts education
          </p>
        </div>
        
        <motion.div 
          className="bg-[#FCE4EC] p-4 sm:p-5 rounded-lg border border-[#EC407A]/20 w-full mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <p className="text-center text-[#424242]">
            Creative Action uses the power of the arts to help students develop <span className="font-semibold">essential life skills</span> that support their social and emotional wellbeing.
          </p>
        </motion.div>
        
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="flex flex-col items-center p-3 sm:p-4 rounded-lg bg-[#FCE4EC] border border-[#EC407A]/20 shadow-sm hover:shadow-md transition-shadow"
            variants={itemVariants}
          >
            <div className="bg-[#EC407A] p-2 rounded-full mb-2">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <p className="text-sm font-medium text-[#424242]">Empathy</p>
            <p className="text-xs text-center text-[#616161] mt-1">
              Understanding others' feelings and perspectives
            </p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col items-center p-3 sm:p-4 rounded-lg bg-[#FCE4EC] border border-[#EC407A]/20 shadow-sm hover:shadow-md transition-shadow"
            variants={itemVariants}
          >
            <div className="bg-[#EC407A] p-2 rounded-full mb-2">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <p className="text-sm font-medium text-[#424242]">Self-Awareness</p>
            <p className="text-xs text-center text-[#616161] mt-1">
              Recognizing emotions and personal strengths
            </p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col items-center p-3 sm:p-4 rounded-lg bg-[#FCE4EC] border border-[#EC407A]/20 shadow-sm hover:shadow-md transition-shadow"
            variants={itemVariants}
          >
            <div className="bg-[#EC407A] p-2 rounded-full mb-2">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <p className="text-sm font-medium text-[#424242]">Collaboration</p>
            <p className="text-xs text-center text-[#616161] mt-1">
              Working together toward shared goals
            </p>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="w-full mt-4 bg-white rounded-lg shadow-sm border border-gray-100 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <h3 className="font-semibold text-[#424242] mb-2">SEL Program Outcomes:</h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <div className="min-w-4 h-4 rounded-full bg-[#EC407A] mt-1 mr-2"></div>
              <p className="text-sm text-[#424242]">Students show improved behavior and emotional regulation</p>
            </li>
            <li className="flex items-start">
              <div className="min-w-4 h-4 rounded-full bg-[#EC407A] mt-1 mr-2"></div>
              <p className="text-sm text-[#424242]">Teachers report increased classroom engagement and focus</p>
            </li>
            <li className="flex items-start">
              <div className="min-w-4 h-4 rounded-full bg-[#EC407A] mt-1 mr-2"></div>
              <p className="text-sm text-[#424242]">Students develop critical thinking and creative problem-solving skills</p>
            </li>
          </ul>
        </motion.div>
      </div>
    </SlideLayout>
  );
}