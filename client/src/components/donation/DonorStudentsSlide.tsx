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

export default function DonorStudentsSlide({ impact, onNext, onPrevious, isFirstSlide, isLastSlide }: DonorStudentsSlideProps) {
  const {
    studentsSupported,
    studentsFullyFunded,
    partialStudentPercentage,
    dayCampExperiences,
    afterSchoolMonthsFunded,
    residencyStudentsFunded,
    averageStudentCost,
  } = impact;

  const studentCountDecimals = studentsSupported >= 10 ? 0 : 1;
  const formattedStudentsFullyFunded = studentsFullyFunded.toLocaleString();
  const partialJourneyPercent = Math.max(1, Math.round(studentsSupported * 100));
  const fundingSummary = studentsFullyFunded > 0
    ? partialStudentPercentage > 0
      ? `Fully funds ${formattedStudentsFullyFunded} student${studentsFullyFunded === 1 ? "" : "s"} and ${partialStudentPercentage}% of another student's journey.`
      : `Fully funds ${formattedStudentsFullyFunded} student${studentsFullyFunded === 1 ? "" : "s"}.`
    : `Covers ${partialJourneyPercent}% of a student's creative journey.`;

  const conversionMetrics = [
    {
      icon: Pencil,
      label: "Day Camp Experiences",
      value: dayCampExperiences,
      description: "$75 = one child attends a Creative Action day camp.",
    },
    {
      icon: School,
      label: "Months of After-School Programming",
      value: afterSchoolMonthsFunded,
      description: "$345 = one month of after-school programming for a student.",
    },
    {
      icon: GraduationCap,
      label: "Year-Long Residencies Funded",
      value: residencyStudentsFunded,
      description: "$486 = one student's full year of theatre + digital media residency at Campbell.",
    },
  ];

  const formatImpactNumber = (value: number) => {
    if (!Number.isFinite(value)) {
      return "0";
    }

    if (value >= 10) {
      return Math.round(value).toLocaleString();
    }

    return value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    });
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
      <div className="flex flex-col items-center space-y-6">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="w-20 h-20 bg-[#E3F2FD] rounded-full flex items-center justify-center mb-2"
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
            <CountUpAnimation value={studentsSupported} decimals={studentCountDecimals} className="text-[#6A1B9A]" /> students
          </div>
          <p className="text-[#414042] mt-2 text-sm sm:text-base">{impact.classroomComparison}</p>
        </motion.div>

        <motion.div
          className="bg-[#EDE7F6] p-4 sm:p-5 rounded-lg border border-[#6A1B9A]/10 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <p className="text-center text-[#6A1B9A] text-sm sm:text-base">
            Average cost per student experience: <span className="font-semibold">${averageStudentCost.toLocaleString()}</span>.
            <span className="block mt-1 text-[#424242]">{fundingSummary}</span>
          </p>
        </motion.div>

        <motion.div
          className="w-full grid grid-cols-1 md:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          {conversionMetrics.map((metric) => (
            <div key={metric.label} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-start mb-3">
                <div className="bg-[#E3F2FD] p-2 rounded-full mr-3">
                  <metric.icon className="h-5 w-5 text-[#42A5F5]" />
                </div>
                <div>
                  <h4 className="font-medium text-[#414042]">{metric.label}</h4>
                  <p className="text-sm text-gray-600">{metric.description}</p>
                </div>
              </div>
              <p className="text-3xl font-semibold text-[#6A1B9A]">{formatImpactNumber(metric.value)}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </SlideLayout>
  );
}