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
  
  // Calculate how many person icons to show (max 30)
  const totalIcons = 30;
  const peoplePercentage = parseFloat(impact.peoplePercentage.replace('%', ''));
  
  // Calculate actual number of icons to highlight based on the percentage of people served
  const iconsToHighlight = Math.max(1, Math.round((peoplePercentage / 100) * totalIcons));
  
  return (
    <SlideLayout
      title="You Helped Serve"
      titleClassName="text-white" // Make title white
      variant="people"
      quote="Community Food Share distributes food to over 40 partners, including food pantries, soup kitchens, and other local agencies."
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
      
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2 mb-10">
        {Array.from({ length: totalIcons }).map((_, index) => (
          <motion.div
            key={index}
            className="h-10 w-10 mx-auto"
            initial={{ opacity: 0.2 }}
            animate={{ 
              opacity: index < iconsToHighlight ? 1 : 0.2,
              scale: index < iconsToHighlight ? 1.1 : 0.9
            }}
            transition={{ 
              duration: 0.5,
              delay: Math.min(2, index * 0.02)
            }}
          >
            <User 
              className={`h-full w-full ${index < iconsToHighlight ? 'text-white' : 'text-white/30'}`}
            />
          </motion.div>
        ))}
      </div>
      
      <p className="text-xl mb-8">
        That's approximately <span className="font-bold">{impact.peoplePercentage}</span> of the 60,000 individuals served in Boulder and Broomfield Counties this year.
      </p>

      {/* Dynamic content with more impact */}
      <motion.div
        className="bg-white/10 p-5 rounded-xl mt-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <p className="text-lg italic">
          "Your donation helped provide food for {impact.daysFed} to {impact.peopleFed}. Each person represents a neighbor with a name, a story, and a brighter future because of you."
        </p>
      </motion.div>
    </SlideLayout>
  );
}
