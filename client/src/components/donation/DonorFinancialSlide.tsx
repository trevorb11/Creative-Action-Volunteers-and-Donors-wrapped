import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Sparkles } from "lucide-react";
import { DonationImpact } from "@/types/donation";
import SlideLayout from "./SlideLayout";
import CountUpAnimation from "./CountUpAnimation";

interface DonorFinancialSlideProps {
  impact: DonationImpact;
  amount: number;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

export default function DonorFinancialSlide({ impact, amount, onNext, onPrevious, isFirstSlide, isLastSlide }: DonorFinancialSlideProps) {
  const {
    studentsSupported,
    dayCampExperiences,
    afterSchoolMonthsFunded,
    residencyStudentsFunded,
    averageStudentCost,
  } = impact;

  const studentCountDecimals = studentsSupported >= 10 ? 0 : 1;

  const conversionMetrics = [
    {
      label: "Creative Camp Days",
      description: "$75 = one child attends a Creative Action day camp.",
      value: dayCampExperiences,
    },
    {
      label: "Months of After-School",
      description: "$345 = one month of after-school programming for a student.",
      value: afterSchoolMonthsFunded,
    },
    {
      label: "Year-Long Residencies",
      description: "$486 = a student's theatre + digital media residency at Campbell.",
      value: residencyStudentsFunded,
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
      title="Financial Impact"
      variant="donor"
      quote="Every dollar you invest unlocks creative opportunities for young people across Central Texas."
      onNext={onNext}
      onPrevious={onPrevious}
      isFirstSlide={isFirstSlide}
      isLastSlide={isLastSlide}
    >
      <div className="flex flex-col items-center mb-6 space-y-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="w-20 h-20 bg-[#E8F5E9] rounded-full flex items-center justify-center"
        >
          <DollarSign className="h-10 w-10 text-[#43A047]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center"
        >
          <h3 className="text-lg sm:text-xl text-[#414042] font-medium mb-2">
            Your ${amount.toLocaleString()} donation directly supports approximately
          </h3>
          <div className="text-3xl sm:text-4xl font-bold text-[#43A047]">
            <CountUpAnimation value={studentsSupported} decimals={studentCountDecimals} /> students
          </div>
          <p className="text-[#414042] mt-2 text-sm sm:text-base">
            Average cost per student experience ≈ ${averageStudentCost.toLocaleString()}.
          </p>
        </motion.div>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        {conversionMetrics.map((metric) => (
          <div key={metric.label} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-start mb-3">
              <div className="bg-[#E8F5E9] p-2 rounded-full mr-3">
                <TrendingUp className="h-5 w-5 text-[#43A047]" />
              </div>
              <div>
                <h4 className="font-medium text-[#414042]">{metric.label}</h4>
                <p className="text-sm text-gray-600">{metric.description}</p>
              </div>
            </div>
            <p className="text-3xl font-semibold text-[#43A047]">{formatImpactNumber(metric.value)}</p>
          </div>
        ))}
      </motion.div>

      <motion.div
        className="mt-6 bg-[#E8F5E9] p-4 rounded-lg border border-[#43A047]/20 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <p className="text-[#414042] text-sm sm:text-base">
          <Sparkles className="inline-block h-4 w-4 text-[#43A047] mr-1" aria-hidden />
          You make tangible creative experiences possible — from camp days to year-long residencies.
        </p>
      </motion.div>
    </SlideLayout>
  );
}