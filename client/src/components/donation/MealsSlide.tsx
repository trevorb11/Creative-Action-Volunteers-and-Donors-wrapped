import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { DonationImpact } from "@shared/schema";
import SlideLayout from "./SlideLayout";
import { SLIDE_CONFIG } from "@/lib/constants";

interface MealsSlideProps {
  impact: DonationImpact;
}

export default function MealsSlide({ impact }: MealsSlideProps) {
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
      variant="meals"
      quote="Community Food Share distributes enough food for nearly 30,000 meals each day."
    >
      <div className="text-6xl md:text-8xl font-heading font-extrabold mb-4">
        <motion.span>{rounded}</motion.span>
      </div>
      
      <h3 className="text-2xl md:text-4xl font-heading mb-8">Nutritious Meals</h3>
      
      <p className="text-xl mb-8">
        That's enough to feed {impact.peopleFed} for {impact.daysFed}!
      </p>
      
      <div className="w-full bg-white/20 h-4 rounded-full mb-10">
        <div ref={barRef} className="bg-white h-4 rounded-full w-0"></div>
      </div>
    </SlideLayout>
  );
}
