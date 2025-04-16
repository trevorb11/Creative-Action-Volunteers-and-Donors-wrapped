import { motion } from "framer-motion";
import { Heart, Brain, Sparkles } from "lucide-react";
import { DonationImpact } from "@/types/donation";
import SlideLayout from "./SlideLayout";
import CountUpAnimation from "./CountUpAnimation";

interface DonorSELImpactSlideProps {
  impact: DonationImpact;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

export default function DonorSELImpactSlide({ 
  impact,
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide
}: DonorSELImpactSlideProps) {
  
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

  return (
    <SlideLayout
      title="Social-Emotional Learning"
      variant="selImpact"
      quote="Your generosity helps students develop essential life skills through creative expression."
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
          className="w-20 h-20 bg-[#FCE4EC] rounded-full flex items-center justify-center mb-4"
        >
          <Heart className="h-10 w-10 text-[#EC407A]" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center"
        >
          <h3 className="text-lg sm:text-xl text-[#414042] font-medium mb-2">
            Your donations have supported
          </h3>
          <div className="text-3xl sm:text-4xl font-bold text-[#EC407A]">
            <CountUpAnimation
              value={impact.selStudents} 
              isCurrency={false}
              className="text-[#EC407A]"
            /> students
          </div>
          <p className="text-[#414042] mt-2 text-sm sm:text-base">
            In developing essential social-emotional skills through the arts
          </p>
        </motion.div>
      </div>
      
      <motion.div 
        className="bg-[#FCE4EC] p-4 sm:p-5 rounded-lg border border-[#EC407A]/10 w-full mb-4 mt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <p className="text-center text-[#424242]">
          Social-emotional learning through arts education helps students develop <span className="font-bold">emotional regulation</span>, <span className="font-bold">self-awareness</span>, and <span className="font-bold">relationship skills</span>
        </p>
      </motion.div>
        
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
            <div className="bg-[#FCE4EC] p-2 rounded-full mr-3">
              <Heart className="h-5 w-5 text-[#EC407A]" />
            </div>
            <div>
              <h4 className="font-medium text-[#414042]">Emotional Literacy</h4>
              <p className="text-sm text-gray-600">
                Students learn to identify, express, and manage their emotions through creative expression
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
          variants={itemVariants}
        >
          <div className="flex items-start">
            <div className="bg-[#FCE4EC] p-2 rounded-full mr-3">
              <Brain className="h-5 w-5 text-[#EC407A]" />
            </div>
            <div>
              <h4 className="font-medium text-[#414042]">Critical Thinking</h4>
              <p className="text-sm text-gray-600">
                Arts-based activities develop creative problem-solving and decision-making skills
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
          variants={itemVariants}
        >
          <div className="flex items-start">
            <div className="bg-[#FCE4EC] p-2 rounded-full mr-3">
              <Sparkles className="h-5 w-5 text-[#EC407A]" />
            </div>
            <div>
              <h4 className="font-medium text-[#414042]">Social Connection</h4>
              <p className="text-sm text-gray-600">
                Collaborative creative projects build empathy, communication, and teamwork
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </SlideLayout>
  );
}