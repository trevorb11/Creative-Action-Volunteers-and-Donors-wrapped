import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { DonationImpact } from "@shared/schema";
import { User } from "lucide-react";
import SlideLayout from "./SlideLayout";
import { SLIDE_CONFIG } from "@/lib/constants";

interface PeopleSlideProps {
  impact: DonationImpact;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

export default function PeopleSlide({ 
  impact,
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide 
}: PeopleSlideProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  
  useEffect(() => {
    const controls = animate(count, impact.peopleServed, {
      duration: 2,
      ease: "easeOut"
    });
    
    return controls.stop;
  }, [count, impact.peopleServed]);
  
  // Calculate how many person icons to show (max 20)
  const totalIcons = 20;
  const peoplePercentage = parseFloat(impact.peoplePercentage);
  const iconsToHighlight = Math.max(1, Math.min(totalIcons, Math.ceil((peoplePercentage / 100) * totalIcons * 10)));
  
  return (
    <SlideLayout
      title="You Helped Serve"
      variant="people"
      quote="Our direct distribution programs served nearly 18,000 individuals across Boulder and Broomfield Counties, representing a 72% increase from 2023."
      onNext={onNext}
      onPrevious={onPrevious}
      isFirstSlide={isFirstSlide}
      isLastSlide={isLastSlide}
    >
      <div className="relative mb-8">
        <div className="text-6xl md:text-8xl font-heading font-extrabold">
          <motion.span>{rounded}</motion.span>
        </div>
        <p className="text-2xl md:text-3xl font-heading">People in Our Community</p>
      </div>
      
      <div className="grid grid-cols-5 gap-2 mb-10">
        {Array.from({ length: totalIcons }).map((_, index) => (
          <motion.div
            key={index}
            className="h-12 w-12 mx-auto"
            initial={{ opacity: 0.2 }}
            animate={{ 
              opacity: index < iconsToHighlight ? 1 : 0.2 
            }}
            transition={{ 
              duration: 0.5,
              delay: index * 0.05
            }}
          >
            <User className="h-full w-full" />
          </motion.div>
        ))}
      </div>
      
      <p className="text-xl mb-8">
        That's approximately <span className="font-bold">{impact.peoplePercentage}%</span> of the 60,000 individuals served in Boulder and Broomfield Counties this year.
      </p>
    </SlideLayout>
  );
}
