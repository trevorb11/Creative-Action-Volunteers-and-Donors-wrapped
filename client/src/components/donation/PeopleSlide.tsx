import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { DonationImpact } from "@shared/schema";
import { User, UserCircle, Users, UserCheck } from "lucide-react";
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
  const [activeIcons, setActiveIcons] = useState<number>(0);
  
  // Calculate how many person icons to show
  const totalIcons = 30;
  const peoplePercentage = parseFloat(impact.peoplePercentage.replace('%', ''));
  const iconsToHighlight = Math.max(1, Math.round((peoplePercentage / 100) * totalIcons));

  // Define the different icon types to use
  const iconTypes = [User, UserCircle, UserCheck];
  
  useEffect(() => {
    // Animate the count number
    const controls = animate(count, impact.peopleServed, {
      duration: 2,
      ease: "easeOut"
    });
    
    // Animate icons appearing one by one
    const iconTimer = setTimeout(() => {
      setActiveIcons(iconsToHighlight);
    }, 500);
    
    return () => {
      controls.stop();
      clearTimeout(iconTimer);
    };
  }, [count, impact.peopleServed, iconsToHighlight]);
  
  // Generate people icons with variety
  const renderPeopleIcons = () => {
    const icons = [];
    
    // Background icons (faded)
    for (let i = 0; i < totalIcons; i++) {
      const IconComponent = iconTypes[i % iconTypes.length];
      icons.push(
        <motion.div
          key={`bg-${i}`}
          className="h-10 w-10 mx-auto"
          initial={{ opacity: 0.1 }}
          animate={{ opacity: 0.2, scale: 0.9 }}
        >
          <IconComponent className="h-full w-full text-white/30" />
        </motion.div>
      );
    }
    
    return (
      <div className="grid grid-cols-5 gap-4 mb-8">
        {icons}
      </div>
    );
  };
  
  // Generate active people icons (highlighted)
  const renderActiveIcons = () => {
    const icons = [];
    
    for (let i = 0; i < activeIcons; i++) {
      const IconComponent = iconTypes[i % iconTypes.length];
      const row = Math.floor(i / 5);
      const col = i % 5;
      
      icons.push(
        <motion.div
          key={`active-${i}`}
          className="absolute h-12 w-12"
          initial={{ 
            opacity: 0, 
            scale: 0.5,
            x: "50%",
            y: "50%"
          }}
          animate={{ 
            opacity: 1, 
            scale: 1.1,
            x: `${col * 20}%`,
            y: `${row * 60}px`
          }}
          transition={{ 
            duration: 0.5, 
            delay: i * 0.04,
            type: "spring",
            damping: 12
          }}
        >
          <IconComponent className="h-full w-full text-white drop-shadow-md" />
        </motion.div>
      );
    }
    
    return (
      <div className="relative h-[180px]">
        {icons}
      </div>
    );
  };
  
  return (
    <SlideLayout
      title="You Helped Serve"
      titleClassName="text-white"
      variant="people"
      onNext={onNext}
      onPrevious={onPrevious}
      isFirstSlide={isFirstSlide}
      isLastSlide={isLastSlide}
    >
      <div className="relative mb-6">
        <div className="text-6xl md:text-8xl font-heading font-extrabold text-center">
          <motion.span>{rounded}</motion.span>
        </div>
        <p className="text-2xl md:text-3xl font-heading text-center">People in Our Community</p>
      </div>
      
      {renderPeopleIcons()}
      {renderActiveIcons()}
      
      <p className="text-xl mb-8 text-center">
        That's approximately <span className="font-bold">{impact.peoplePercentage}</span> of the 60,000 individuals served in Boulder and Broomfield Counties this year.
      </p>

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
