import { motion } from "framer-motion";
import { HeartHandshake, Palette, Music, Camera } from "lucide-react";
import { DonationImpact } from "@/types/donation";
import SlideLayout from "./SlideLayout";
import CountUpAnimation from "./CountUpAnimation";

interface DonorTeachingArtistsSlideProps {
  impact: DonationImpact;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

export default function DonorTeachingArtistsSlide({ 
  impact,
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide
}: DonorTeachingArtistsSlideProps) {
  
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
      title="Supporting Teaching Artists"
      variant="teachingArtists"
      quote="Your generosity supports talented teaching artists who share their expertise with the next generation."
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
          className="w-20 h-20 bg-[#F3E5F5] rounded-full flex items-center justify-center mb-4"
        >
          <HeartHandshake className="h-10 w-10 text-[#6A1B9A]" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center"
        >
          <h3 className="text-lg sm:text-xl text-[#414042] font-medium mb-2">
            Your donations have funded
          </h3>
          <div className="text-3xl sm:text-4xl font-bold text-[#6A1B9A]">
            <CountUpAnimation
              value={impact.teachingArtistHours} 
              isCurrency={false}
              className="text-[#6A1B9A]"
            /> teaching hours
          </div>
          <p className="text-[#414042] mt-2 text-sm sm:text-base">
            Providing fair wages and meaningful work for professional artists
          </p>
        </motion.div>
      </div>
      
      <motion.div 
        className="bg-[#F3E5F5] p-4 sm:p-5 rounded-lg border border-[#6A1B9A]/10 w-full mb-4 mt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <p className="text-center text-[#6A1B9A]">
          Creative Action employs <span className="font-bold">45 teaching artists</span> who represent diverse artistic disciplines
        </p>
      </motion.div>
        
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
            <div className="bg-[#F3E5F5] p-2 rounded-full mr-3">
              <Palette className="h-5 w-5 text-[#6A1B9A]" />
            </div>
            <div>
              <h4 className="font-medium text-[#414042]">Visual Arts</h4>
              <p className="text-sm text-gray-600">
                Professional painters, sculptors, and illustrators provide hands-on learning experiences
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
          variants={itemVariants}
        >
          <div className="flex items-start">
            <div className="bg-[#F3E5F5] p-2 rounded-full mr-3">
              <Music className="h-5 w-5 text-[#6A1B9A]" />
            </div>
            <div>
              <h4 className="font-medium text-[#414042]">Performing Arts</h4>
              <p className="text-sm text-gray-600">
                Musicians, actors, and dancers help students develop confidence and self-expression
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
          variants={itemVariants}
        >
          <div className="flex items-start">
            <div className="bg-[#F3E5F5] p-2 rounded-full mr-3">
              <Camera className="h-5 w-5 text-[#6A1B9A]" />
            </div>
            <div>
              <h4 className="font-medium text-[#414042]">Digital Media</h4>
              <p className="text-sm text-gray-600">
                Filmmakers, photographers, and designers teach modern creative technology skills
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </SlideLayout>
  );
}