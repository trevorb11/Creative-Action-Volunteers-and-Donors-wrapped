import { motion } from "framer-motion";
import { GraduationCap, School, Pencil } from "lucide-react";
import { DonationImpact } from "@/types/donation";
import SlideLayout from "./SlideLayout";
import CountUpAnimation from "./CountUpAnimation";

interface DonorStudentsSlideProps {
  impact: DonationImpact;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

export default function DonorStudentsSlide({ 
  impact,
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide
}: DonorStudentsSlideProps) {
  
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
      title="Students Reached"
      variant="students"
      quote="Every creative lesson opens new possibilities for youth across Central Texas."
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
          className="w-20 h-20 bg-[#E3F2FD] rounded-full flex items-center justify-center mb-4"
        >
          <GraduationCap className="h-10 w-10 text-[#42A5F5]" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center"
        >
          <h3 className="text-lg sm:text-xl text-[#414042] font-medium mb-2">
            Your donation reaches
          </h3>
          <div className="text-3xl sm:text-4xl font-bold text-[#6A1B9A]">
            <CountUpAnimation
              value={impact.studentsReached} 
              isCurrency={false}
              className="text-[#6A1B9A]"
            /> students
          </div>
          <p className="text-[#414042] mt-2 text-sm sm:text-base">
            That's equivalent to {impact.classroomComparison}!
          </p>
        </motion.div>
      </div>
      
      <motion.div 
        className="bg-[#EDE7F6] p-4 sm:p-5 rounded-lg border border-[#6A1B9A]/10 w-full mb-4 mt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <p className="text-center text-[#6A1B9A]">
          Every $10 invested provides <span className="font-bold">1 hour of creative instruction</span> for students who need it most.
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
            <div className="bg-[#E3F2FD] p-2 rounded-full mr-3">
              <Pencil className="h-5 w-5 text-[#42A5F5]" />
            </div>
            <div>
              <h4 className="font-medium text-[#414042]">Creative Expression</h4>
              <p className="text-sm text-gray-600">
                {impact.programDistribution.afterSchool}% of students experience after-school arts programming with hands-on creative activities
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
          variants={itemVariants}
        >
          <div className="flex items-start">
            <div className="bg-[#EDE7F6] p-2 rounded-full mr-3">
              <School className="h-5 w-5 text-[#6A1B9A]" />
            </div>
            <div>
              <h4 className="font-medium text-[#414042]">School Partnerships</h4>
              <p className="text-sm text-gray-600">
                Creative Action serves {impact.programDistribution.schoolPartnership}% of students directly through in-school partnerships with teaching artists
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </SlideLayout>
  );
}