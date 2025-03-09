import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { DonationImpact } from "@/types/donation";
import SlideLayout from "./SlideLayout";
import { SLIDE_CONFIG } from "@/lib/constants";
import { Utensils } from "lucide-react";

interface MealsSlideProps {
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
}: MealsSlideProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, impact.mealsProvided, {
      duration: 2,
      ease: "easeOut",
    });

    return controls.stop;
  }, [count, impact.mealsProvided]);

  return (
    <SlideLayout
      title="Your Donation Provides"
      variant="meals"
      quote="Community Food Share distributes enough food for nearly 30,000 meals each day."
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
          <Utensils className="h-16 w-16 text-[#227d7f] mb-3" />
        </motion.div>
        
        <div className="text-center">
          <p className="text-lg font-semibold text-[#414042]">Your donation provides</p>
          <p className="text-4xl font-bold text-white">
            <motion.span>{rounded}</motion.span> Meals
          </p>
          <p className="text-sm text-[#414042] mt-2">
            That's enough to feed {impact.peopleFed} people for {impact.daysFed}!
          </p>
        </div>
        
        <motion.div 
          className="bg-[#f0f9f4] p-4 sm:p-5 rounded-lg border border-[#0c4428]/10 w-full mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <p className="text-center text-white">
            Your donation helps us provide nutritious food to families in need.
            <span className="block mt-1 font-medium">Every dollar provides 1.52 meals for our community.</span>
          </p>
        </motion.div>
      </div>
    </SlideLayout>
  );
}
