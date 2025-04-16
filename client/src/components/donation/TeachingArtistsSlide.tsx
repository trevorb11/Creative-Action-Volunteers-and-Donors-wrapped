import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { DonationImpact } from "@/types/donation";
import SlideLayout from "./SlideLayout";
import { HeartHandshake, Palette, Camera, Music } from "lucide-react";
import CountUpAnimation from "./CountUpAnimation";

interface TeachingArtistsSlideProps {
  impact: DonationImpact;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

export default function TeachingArtistsSlide({ 
  impact,
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide
}: TeachingArtistsSlideProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, impact.teachingArtistHours, {
      duration: 2,
      ease: "easeOut",
    });

    return controls.stop;
  }, [count, impact.teachingArtistHours]);

  // Teaching artist disciplines
  const artistDisciplines = [
    {
      name: "Visual Arts",
      description: "Drawing, painting, sculpture, and mixed media",
      icon: <Palette className="h-5 w-5 text-white" />,
      color: "bg-[#6A1B9A]"
    },
    {
      name: "Digital Media",
      description: "Photography, film, animation, and digital design",
      icon: <Camera className="h-5 w-5 text-white" />,
      color: "bg-[#6A1B9A]"
    },
    {
      name: "Performing Arts",
      description: "Theater, dance, music, and storytelling",
      icon: <Music className="h-5 w-5 text-white" />,
      color: "bg-[#6A1B9A]"
    }
  ];
  
  return (
    <SlideLayout
      title="Teaching Artists"
      variant="teachingArtists"
      quote="Our teaching artists bring their professional expertise and passion to inspire the next generation of creative minds."
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
          <HeartHandshake className="h-16 w-16 text-[#6A1B9A] mb-3" />
        </motion.div>
        
        <div className="text-center">
          <p className="text-lg font-semibold text-[#424242]">Your donation supports</p>
          <p className="text-4xl font-bold text-[#6A1B9A]">
            <motion.span>{rounded}</motion.span> Teaching Hours
          </p>
          <p className="text-sm text-[#424242] mt-2">
            Professional artists sharing their skills with students
          </p>
        </div>
        
        <motion.div 
          className="bg-[#F3E5F5] p-4 sm:p-5 rounded-lg border border-[#6A1B9A]/20 w-full mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <p className="text-center text-[#424242]">
            Teaching artists earn <span className="font-semibold">$50 per instruction hour</span>, providing fair compensation for their expertise and passion.
          </p>
        </motion.div>
        
        {/* Teaching Artist Disciplines */}
        <div className="w-full space-y-3">
          {artistDisciplines.map((discipline, index) => (
            <motion.div 
              key={discipline.name}
              className="flex items-start p-3 bg-white rounded-lg shadow-sm border border-gray-100"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + (index * 0.1), duration: 0.5 }}
            >
              <div className={`${discipline.color} p-2 rounded-full mr-3 mt-0.5`}>
                {discipline.icon}
              </div>
              <div>
                <h3 className="font-semibold text-[#424242]">{discipline.name}</h3>
                <p className="text-sm text-[#666666]">{discipline.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <h3 className="font-semibold text-[#424242] mb-2">Artist Impact:</h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <div className="min-w-4 h-4 rounded-full bg-[#6A1B9A] mt-1 mr-2"></div>
              <p className="text-sm text-[#424242]">Provides living wages for artists in the community</p>
            </li>
            <li className="flex items-start">
              <div className="min-w-4 h-4 rounded-full bg-[#6A1B9A] mt-1 mr-2"></div>
              <p className="text-sm text-[#424242]">Brings diverse creative experiences to students</p>
            </li>
            <li className="flex items-start">
              <div className="min-w-4 h-4 rounded-full bg-[#6A1B9A] mt-1 mr-2"></div>
              <p className="text-sm text-[#424242]">Supports the local creative economy and ecosystem</p>
            </li>
          </ul>
        </motion.div>
      </div>
    </SlideLayout>
  );
}