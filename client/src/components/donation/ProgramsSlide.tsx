import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DonationImpact } from "@/types/donation";
import SlideLayout from "./SlideLayout";
import { Palette, Brush, Music, Theater, School, Heart } from "lucide-react";

interface ProgramsSlideProps {
  impact: DonationImpact;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

export default function ProgramsSlide({ 
  impact,
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide
}: ProgramsSlideProps) {
  const [animateChart, setAnimateChart] = useState(false);
  
  useEffect(() => {
    // Start animation after a delay
    const timer = setTimeout(() => {
      setAnimateChart(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const programAreas = impact.programDistribution;
  
  const programs = [
    {
      name: "After School",
      percentage: programAreas.afterSchool,
      icon: <Palette className="h-5 w-5 text-[#42A5F5]" />,
      color: "bg-[#42A5F5]",
      description: "Creative enrichment programs after school hours"
    },
    {
      name: "Community Murals",
      percentage: programAreas.communityMural,
      icon: <Brush className="h-5 w-5 text-[#FFCA28]" />,
      color: "bg-[#FFCA28]",
      description: "Collaborative public art projects"
    },
    {
      name: "Teaching Artists",
      percentage: programAreas.teachingArtist,
      icon: <Music className="h-5 w-5 text-[#EC407A]" />,
      color: "bg-[#EC407A]",
      description: "Professional artists who teach our programs"
    },
    {
      name: "SEL Enrichment",
      percentage: programAreas.selEnrichment,
      icon: <Heart className="h-5 w-5 text-[#FF8A65]" />,
      color: "bg-[#FF8A65]",
      description: "Social-emotional learning through creative expression"
    },
    {
      name: "Youth Theater",
      percentage: programAreas.youthTheater,
      icon: <Theater className="h-5 w-5 text-[#6A1B9A]" />,
      color: "bg-[#6A1B9A]",
      description: "Collaborative theater productions by young people"
    },
    {
      name: "School Partnerships",
      percentage: programAreas.schoolPartnership,
      icon: <School className="h-5 w-5 text-[#66BB6A]" />,
      color: "bg-[#66BB6A]",
      description: "In-school arts integration programs"
    }
  ];
  
  return (
    <SlideLayout
      title="Creative Action Programs"
      variant="programs"
      quote="Your donation supports multiple programs that bring creative arts to youth across all backgrounds and abilities."
      onNext={onNext}
      onPrevious={onPrevious}
      isFirstSlide={isFirstSlide}
      isLastSlide={isLastSlide}
    >
      <div className="flex flex-col items-center space-y-6">
        <div className="text-center mb-2">
          <p className="text-lg font-semibold text-[#424242]">Your donation impact across</p>
          <p className="text-3xl font-bold text-[#66BB6A]">Our Program Areas</p>
        </div>
        
        {/* Programs breakdown */}
        <div className="w-full space-y-4">
          {programs.map((program, index) => (
            <div key={program.name} className="relative">
              <div className="flex items-center mb-1">
                <div className={`p-2 rounded-full ${program.color} bg-opacity-20 mr-2`}>
                  {program.icon}
                </div>
                <div>
                  <p className="font-medium text-[#424242]">{program.name}</p>
                  <p className="text-xs text-[#666666]">{program.description}</p>
                </div>
                <p className="ml-auto font-bold text-[#424242]">{program.percentage}%</p>
              </div>
              
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full ${program.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: animateChart ? `${program.percentage}%` : 0 }}
                  transition={{ 
                    duration: 1,
                    delay: 0.2 + (index * 0.1),
                    ease: "easeOut"
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        
        <motion.div
          className="bg-[#E8F5E9] p-4 rounded-lg border border-[#66BB6A]/20 w-full mt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.5 }}
        >
          <p className="text-center text-[#424242]">
            <span className="font-semibold">Your ${impact.foodRescued.toFixed(2)} donation</span> provides support across all of our programs, helping us deliver high-quality arts education to youth in our community.
          </p>
        </motion.div>
      </div>
    </SlideLayout>
  );
}