import { motion } from "framer-motion";
import { DollarSign, TrendingUp, FilePlus } from "lucide-react";
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

export default function DonorFinancialSlide({ 
  impact,
  amount,
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide
}: DonorFinancialSlideProps) {
  
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
  
  // Calculate financial metrics (leverage factor is how many times the donation is multiplied in value)
  const leverageFactor = 5;
  const communityValue = amount * leverageFactor;
  
  // Calculate tax savings (simplified placeholder for example purposes)
  const taxRate = 0.30; // Assuming 30% tax bracket
  const potentialTaxSavings = amount * taxRate;

  return (
    <SlideLayout
      title="Financial Impact"
      variant="donor"
      quote="Your donation goes further than you might think, creating ripple effects throughout our community."
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
          className="w-20 h-20 bg-[#f3fae7] rounded-full flex items-center justify-center mb-4"
        >
          <DollarSign className="h-10 w-10 text-[#8dc53e]" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center"
        >
          <h3 className="text-lg sm:text-xl text-[#414042] font-medium mb-2">
            Your ${amount} donation creates
          </h3>
          <div className="text-3xl sm:text-4xl font-bold text-[#8dc53e]">
            <CountUpAnimation
              value={communityValue} 
              isCurrency={true}
              className="text-[#8dc53e]"
            /> in community value
          </div>
          <p className="text-[#414042] mt-2 text-sm sm:text-base">
            That's a {leverageFactor}x return on your investment!
          </p>
        </motion.div>
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
            <div className="bg-[#f3fae7] p-2 rounded-full mr-3">
              <TrendingUp className="h-5 w-5 text-[#8dc53e]" />
            </div>
            <div>
              <h4 className="font-medium text-[#414042]">Economic Value</h4>
              <p className="text-sm text-gray-600">
                Every dollar you donate helps us secure and distribute up to {leverageFactor} pounds of food through our partnerships
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
          variants={itemVariants}
        >
          <div className="flex items-start">
            <div className="bg-[#f3fae7] p-2 rounded-full mr-3">
              <FilePlus className="h-5 w-5 text-[#8dc53e]" />
            </div>
            <div>
              <h4 className="font-medium text-[#414042]">Potential Tax Benefits</h4>
              <p className="text-sm text-gray-600">
                Your donation may qualify for a tax deduction, potentially saving you up to ${potentialTaxSavings.toFixed(2)} depending on your tax situation
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      <motion.div
        className="mt-6 bg-[#f3fae7] p-4 rounded-lg border border-[#8dc53e]/20 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <p className="text-[#414042] text-sm">
          <span className="font-medium">Note:</span> This is not tax advice. Please consult with a tax professional regarding deductibility of your donations.
        </p>
      </motion.div>
    </SlideLayout>
  );
}