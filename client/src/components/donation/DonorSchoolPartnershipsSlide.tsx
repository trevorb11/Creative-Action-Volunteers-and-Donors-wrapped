import { motion } from "framer-motion";
import { School, BookOpen, Calendar } from "lucide-react";
import { DonationImpact } from "@/types/donation";
import SlideLayout from "./SlideLayout";
import CountUpAnimation from "./CountUpAnimation";
import { CREATIVE_ACTION_DATA } from "@/lib/constants";

interface DonorSchoolPartnershipsSlideProps {
  impact: DonationImpact;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

export default function DonorSchoolPartnershipsSlide({ 
  impact,
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide
}: DonorSchoolPartnershipsSlideProps) {
  
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
      title="School Partnerships"
      variant="schoolPartnerships"
      quote="Your support helps Creative Action bring arts education directly into schools."
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
          className="w-20 h-20 bg-[#F3E5F5] rounded-full flex items-center justify-center mb-4"
        >
          <School className="h-10 w-10 text-[#6A1B9A]" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center"
        >
          <h3 className="text-lg sm:text-xl text-[#414042] font-medium mb-2">
            Your donations have funded
          </h3>
          <div className="text-3xl sm:text-4xl font-bold text-[#6A1B9A]">
            <CountUpAnimation
              value={impact.braveSchoolsLessons} 
              isCurrency={false}
              className="text-[#6A1B9A]"
            /> Brave Schools lessons
          </div>
          <p className="text-[#414042] mt-2 text-sm sm:text-base">
            Bringing arts-based anti-bullying curriculum to Central Texas schools
          </p>
        </motion.div>
      </div>
      
      <motion.div 
        className="bg-[#F3E5F5] p-4 sm:p-5 rounded-lg border border-[#6A1B9A]/10 w-full mb-4 mt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <p className="text-center text-[#424242]">
          Creative Action partners with <span className="font-bold">{CREATIVE_ACTION_DATA.schoolsServed} schools</span> across Central Texas to integrate arts education into the curriculum
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
            <div className="bg-[#F3E5F5] p-2 rounded-full mr-3">
              <BookOpen className="h-5 w-5 text-[#6A1B9A]" />
            </div>
            <div>
              <h4 className="font-medium text-[#414042]">Brave Schools Program</h4>
              <p className="text-sm text-gray-600">
                Each $100 donation supports one classroom lesson that builds empathy and creates positive school culture
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
          variants={itemVariants}
        >
          <div className="flex items-start">
            <div className="bg-[#F3E5F5] p-2 rounded-full mr-3">
              <Calendar className="h-5 w-5 text-[#6A1B9A]" />
            </div>
            <div>
              <h4 className="font-medium text-[#414042]">In-School Impact</h4>
              <p className="text-sm text-gray-600">
                Students who participate in Creative Action programs show improved academic performance, attendance, and engagement
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
          variants={itemVariants}
        >
          <div className="flex items-start">
            <div className="bg-[#F3E5F5] p-2 rounded-full mr-3">
              <School className="h-5 w-5 text-[#6A1B9A]" />
            </div>
            <div>
              <h4 className="font-medium text-[#414042]">Curriculum Integration</h4>
              <p className="text-sm text-gray-600">
                Teaching artists collaborate with classroom teachers to integrate creative learning into core academic subjects
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </SlideLayout>
  );
}