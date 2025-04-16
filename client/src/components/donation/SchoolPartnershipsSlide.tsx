import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { DonationImpact } from "@/types/donation";
import SlideLayout from "./SlideLayout";
import { School, BookOpen, Calendar } from "lucide-react";
import CountUpAnimation from "./CountUpAnimation";
import { CREATIVE_ACTION_DATA } from "@/lib/constants";

interface SchoolPartnershipsSlideProps {
  impact: DonationImpact;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

export default function SchoolPartnershipsSlide({ 
  impact,
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide
}: SchoolPartnershipsSlideProps) {
  const schoolsServed = CREATIVE_ACTION_DATA.schoolsServed;
  const braveSchoolsLessons = impact.braveSchoolsLessons;
  
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
      title="School Partnerships"
      variant="schoolPartnerships"
      quote="Creative Action collaborates with schools to integrate arts education into classroom learning."
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
          <School className="h-16 w-16 text-[#6A1B9A] mb-3" />
        </motion.div>
        
        <div className="text-center">
          <p className="text-lg font-semibold text-[#424242]">Your donation supports</p>
          <p className="text-4xl font-bold text-[#6A1B9A]">
            <CountUpAnimation 
              value={braveSchoolsLessons}
              isCurrency={false}
              className="text-[#6A1B9A]"
            /> Brave Schools Lessons
          </p>
          <p className="text-sm text-[#424242] mt-2">
            Bringing creative arts learning into classrooms across Central Texas
          </p>
        </div>
        
        <motion.div 
          className="bg-[#F3E5F5] p-4 sm:p-5 rounded-lg border border-[#6A1B9A]/20 w-full mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <p className="text-center text-[#424242]">
            Creative Action partners with <span className="font-semibold">{schoolsServed} schools</span> across Central Texas to integrate arts education into the curriculum.
          </p>
        </motion.div>
        
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="flex flex-col items-center p-3 sm:p-4 rounded-lg bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            variants={itemVariants}
          >
            <div className="bg-[#F3E5F5] p-2 rounded-full mb-2">
              <BookOpen className="h-5 w-5 text-[#6A1B9A]" />
            </div>
            <p className="text-sm font-medium text-[#424242]">Brave Schools Program</p>
            <p className="text-xs text-center text-[#616161] mt-1">
              Arts-based anti-bullying curriculum that builds empathy and creates positive school culture
            </p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col items-center p-3 sm:p-4 rounded-lg bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            variants={itemVariants}
          >
            <div className="bg-[#F3E5F5] p-2 rounded-full mb-2">
              <Calendar className="h-5 w-5 text-[#6A1B9A]" />
            </div>
            <p className="text-sm font-medium text-[#424242]">In-School Residencies</p>
            <p className="text-xs text-center text-[#616161] mt-1">
              Teaching artists integrate creative learning into math, science, language arts, and social studies
            </p>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="w-full mt-4 bg-white rounded-lg shadow-sm border border-gray-100 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <h3 className="font-semibold text-[#424242] mb-2">School Program Outcomes:</h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <div className="min-w-4 h-4 rounded-full bg-[#6A1B9A] mt-1 mr-2"></div>
              <p className="text-sm text-[#424242]">Improved academic performance in core subjects</p>
            </li>
            <li className="flex items-start">
              <div className="min-w-4 h-4 rounded-full bg-[#6A1B9A] mt-1 mr-2"></div>
              <p className="text-sm text-[#424242]">Reduced bullying incidents and improved school climate</p>
            </li>
            <li className="flex items-start">
              <div className="min-w-4 h-4 rounded-full bg-[#6A1B9A] mt-1 mr-2"></div>
              <p className="text-sm text-[#424242]">Increased student engagement and attendance</p>
            </li>
          </ul>
        </motion.div>
      </div>
    </SlideLayout>
  );
}