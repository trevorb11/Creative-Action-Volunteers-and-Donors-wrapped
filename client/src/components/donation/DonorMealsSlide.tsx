import { motion } from "framer-motion";
import { Utensils, Apple, Beef } from "lucide-react";
import { DonationImpact } from "@/types/donation";
import SlideLayout from "./SlideLayout";
import CountUpAnimation from "./CountUpAnimation";

interface DonorMealsSlideProps {
  impact: DonationImpact;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

export default function DonorMealsSlide({ 
  impact,
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide
}: DonorMealsSlideProps) {
  
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
      title="Meals Provided"
      variant="meals"
      quote="Every meal represents hope and nourishment for our neighbors in need."
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
          className="w-20 h-20 bg-[#e6f2ed] rounded-full flex items-center justify-center mb-4"
        >
          <Utensils className="h-10 w-10 text-[#227d7f]" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center"
        >
          <h3 className="text-lg sm:text-xl text-[#414042] font-medium mb-2">
            Your donation provides
          </h3>
          <div className="text-3xl sm:text-4xl font-bold text-[#227d7f]">
            <CountUpAnimation
              value={impact.mealsProvided} 
              isCurrency={false}
              className="text-[#227d7f]"
            /> meals
          </div>
          <p className="text-[#414042] mt-2 text-sm sm:text-base">
            That's enough to feed {impact.peopleFed} for {impact.daysFed}!
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
            <div className="bg-[#e6f2ed] p-2 rounded-full mr-3">
              <Apple className="h-5 w-5 text-[#227d7f]" />
            </div>
            <div>
              <h4 className="font-medium text-[#414042]">Nutritional Variety</h4>
              <p className="text-sm text-gray-600">
                {impact.producePercentage}% produce, {impact.proteinPercentage}% protein, and {impact.dairyPercentage}% dairy products ensure balanced nutrition
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
          variants={itemVariants}
        >
          <div className="flex items-start">
            <div className="bg-[#e6f2ed] p-2 rounded-full mr-3">
              <Beef className="h-5 w-5 text-[#227d7f]" />
            </div>
            <div>
              <h4 className="font-medium text-[#414042]">Fresh Food Access</h4>
              <p className="text-sm text-gray-600">
                {impact.freshFoodPercentage}% of the food we distribute is fresh, providing essential nutrients
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </SlideLayout>
  );
}