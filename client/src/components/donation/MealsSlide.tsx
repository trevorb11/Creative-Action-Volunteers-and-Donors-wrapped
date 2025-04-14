import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { DonationImpact } from "@/types/donation";
import SlideLayout from "./SlideLayout";
import { SLIDE_CONFIG } from "@/lib/constants";
import { Pencil, GraduationCap, School } from "lucide-react";

interface StudentsSlideProps {
  impact: DonationImpact;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

export default function MealsSlide({ 
  impact,
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide
}: StudentsSlideProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, impact.studentsReached, {
      duration: 2,
      ease: "easeOut",
    });

    return controls.stop;
  }, [count, impact.studentsReached]);

  return (
    <SlideLayout
      title="Creative Education Impact"
      variant="students"
      quote="Creative Action provides arts education to over 15,000 students annually across Central Texas."
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
          <GraduationCap className="h-16 w-16 text-[#42A5F5] mb-3" />
        </motion.div>
        
        <div className="text-center">
          <p className="text-lg font-semibold text-[#424242]">Your donation reaches</p>
          <p className="text-4xl font-bold text-[#6A1B9A]">
            <motion.span>{rounded}</motion.span> Students
          </p>
          <p className="text-sm text-[#424242] mt-2">
            That's equivalent to {impact.classroomComparison}!
          </p>
        </div>
        
        <motion.div 
          className="bg-[#EDE7F6] p-4 sm:p-5 rounded-lg border border-[#6A1B9A]/10 w-full mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <p className="text-center text-[#6A1B9A]">
            Your donation provides {impact.instructionHours} hours of creative instruction.
            <span className="block mt-1 font-medium">Each hour reaches approximately 5 students with arts education.</span>
          </p>
        </motion.div>
        
        <motion.div
          className="w-full mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-start">
              <div className="bg-[#E3F2FD] p-2 rounded-full mr-3">
                <Pencil className="h-5 w-5 text-[#42A5F5]" />
              </div>
              <div>
                <h4 className="font-medium text-[#424242]">Creative Expression</h4>
                <p className="text-sm text-gray-600">
                  Students express themselves through various art forms and creative media
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-start">
              <div className="bg-[#E8EAF6] p-2 rounded-full mr-3">
                <School className="h-5 w-5 text-[#6A1B9A]" />
              </div>
              <div>
                <h4 className="font-medium text-[#424242]">Critical Thinking</h4>
                <p className="text-sm text-gray-600">
                  Arts education develops problem-solving skills and cognitive abilities
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </SlideLayout>
  );
}
