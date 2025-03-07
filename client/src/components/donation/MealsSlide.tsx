import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { DonationImpact } from "@shared/schema";
import SlideLayout from "./SlideLayout";
import { SLIDE_CONFIG } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controls = animate(count, impact.mealsProvided, {
      duration: 2,
      ease: "easeOut",
    });

    return controls.stop;
  }, [count, impact.mealsProvided]);

  useEffect(() => {
    if (barRef.current) {
      const animation = barRef.current.animate(
        [{ width: '0%' }, { width: '80%' }],
        {
          duration: SLIDE_CONFIG.counterDuration,
          fill: 'forwards',
          easing: 'ease-out',
        }
      );

      return () => {
        animation.cancel();
      };
    }
  }, []);

  return (
    <SlideLayout
      title="Your Donation Provides"
      titleClassName="text-white" // Add white color to title
      variant="meals"
      quote="Community Food Share distributes enough food for nearly 30,000 meals each day."
      onNext={onNext}
      onPrevious={onPrevious}
      isFirstSlide={isFirstSlide}
      isLastSlide={isLastSlide}
    >
      <div className="text-4xl sm:text-6xl md:text-8xl font-heading font-extrabold mb-2 sm:mb-4">
        <motion.span>{rounded}</motion.span>
      </div>

      <h3 className="text-xl sm:text-2xl md:text-4xl font-heading mb-4 sm:mb-8">Nutritious Meals</h3>

      <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-8">
        That's enough to feed {impact.peopleFed} for {impact.daysFed}!
      </p>

      <div className="w-full bg-white/20 h-3 sm:h-4 rounded-full mb-6 sm:mb-10">
        <div ref={barRef} className="bg-white h-3 sm:h-4 rounded-full w-0"></div>
      </div>

      <div className="flex justify-between w-full">
        {onPrevious && (
          <Button 
            onClick={onPrevious} 
            className="p-1 sm:p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            size="icon"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        )}
        {onNext && (
          <Button 
            onClick={onNext} 
            className="p-1 sm:p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors ml-auto"
            size="icon"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        )}
      </div>
    </SlideLayout>
  );
}
