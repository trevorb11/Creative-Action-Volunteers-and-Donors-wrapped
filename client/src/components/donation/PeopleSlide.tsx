import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { DonationImpact } from "@/types/donation";
import SlideLayout from "./SlideLayout";
import { Palette, Users, Brush, Lightbulb } from "lucide-react";
import CountUpAnimation from "./CountUpAnimation";

interface TeachingArtistsSlideProps {
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
}: TeachingArtistsSlideProps) {
  const [animationComplete, setAnimationComplete] = useState(false);
  const artistsRef = useRef<HTMLDivElement>(null);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  
  useEffect(() => {
    const controls = animate(count, impact.teachingArtistHours, {
      duration: 2,
      ease: "easeOut"
    });
    
    return () => controls.stop();
  }, [count, impact.teachingArtistHours]);

  // Animation for the artist icons
  useEffect(() => {
    // Animate the artist visualization
    if (artistsRef.current) {
      const animation = artistsRef.current.animate(
        [{ width: '0%' }, { width: '90%' }],
        {
          duration: 2000,
          fill: 'forwards',
          easing: 'ease-out',
        }
      );

      animation.onfinish = () => setAnimationComplete(true);

      return () => {
        animation.cancel();
      };
    }
  }, []);
  
  // Calculate how many artist icons to show
  const numberOfIcons = Math.min(40, impact.teachingArtistHours);
  
  // Container and item variants for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.6
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  return (
    <SlideLayout
      title="Supporting Teaching Artists"
      variant="teachingArtists"
      quote="Teaching artists bring creativity, inspiration, and transformative experiences to students across our communities."
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
          <Palette className="h-16 w-16 text-[#EC407A] mb-3" />
        </motion.div>
        
        <div className="text-center">
          <p className="text-lg font-semibold text-[#424242]">Your donation supports</p>
          <p className="text-4xl font-bold text-[#6A1B9A]">
            <motion.span>{rounded}</motion.span> Teaching Hours
          </p>
        </div>
        
        {/* Artist visualization */}
        <div className="w-full h-16 bg-[#F3E5F5] rounded-lg mb-4 relative overflow-hidden">
          <div 
            ref={artistsRef} 
            className="h-16 rounded-lg flex items-center justify-start overflow-hidden"
            style={{ width: '0%' }}
          >
            <div className="flex flex-wrap p-2">
              {Array.from({ length: numberOfIcons }).map((_, i) => (
                <motion.div
                  key={i}
                  className="h-4 w-4 mx-1 my-1 text-[#6A1B9A]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.01 * i + 1 }}
                >
                  {i % 3 === 0 ? <Brush size={16} /> : i % 3 === 1 ? <Palette size={16} /> : <Lightbulb size={16} />}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        <motion.div
          className="text-center mb-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.5 }}
        >
          <p className="text-[#424242] text-sm">
            Each icon represents an hour of professional teaching artist instruction.
          </p>
        </motion.div>
        
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="flex flex-col items-center p-3 sm:p-4 rounded-lg bg-[#E8F5E9] border border-[#66BB6A]/20 shadow-sm hover:shadow-md transition-shadow"
            variants={itemVariants}
          >
            <p className="text-sm font-medium text-[#424242]">Students Reached</p>
            <p className="text-lg sm:text-xl font-semibold text-[#424242]">
              <CountUpAnimation value={impact.studentsReached} duration={2} />
            </p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col items-center p-3 sm:p-4 rounded-lg bg-[#E3F2FD] border border-[#42A5F5]/20 shadow-sm hover:shadow-md transition-shadow"
            variants={itemVariants}
          >
            <p className="text-sm font-medium text-[#424242]">Creative Experiences</p>
            <p className="text-lg sm:text-xl font-semibold text-[#424242]">
              {impact.instructionHours} Hours
            </p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col items-center p-3 sm:p-4 rounded-lg bg-[#FFF3E0] border border-[#FF8A65]/20 shadow-sm hover:shadow-md transition-shadow"
            variants={itemVariants}
          >
            <p className="text-sm font-medium text-[#424242]">Artist Support</p>
            <p className="text-lg sm:text-xl font-semibold text-[#424242]">
              <CountUpAnimation value={Math.round(impact.teachingArtistHours / 10)} duration={2} /> Days
            </p>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="bg-[#F3E5F5] p-4 sm:p-5 rounded-lg border border-[#6A1B9A]/10 w-full mt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <p className="text-center text-[#6A1B9A]">
            Your donation directly supports professional artists who inspire the next generation.
            <span className="block mt-1 font-medium">Together, we're nurturing creative confidence in our youth.</span>
          </p>
        </motion.div>
      </div>
    </SlideLayout>
  );
}
