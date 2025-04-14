import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { DonationImpact } from "@/types/donation";
import SlideLayout from "./SlideLayout";
import { Heart, Brain, Lightbulb, MessageCircle, Users } from "lucide-react";
import CountUpAnimation from "./CountUpAnimation";

interface SELImpactSlideProps {
  impact: DonationImpact;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

export default function SELImpactSlide({ 
  impact,
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide
}: SELImpactSlideProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  
  useEffect(() => {
    const controls = animate(count, impact.selStudents, {
      duration: 2,
      ease: "easeOut",
    });
    
    return controls.stop;
  }, [count, impact.selStudents]);
  
  // SEL skills that Creative Action helps develop
  const selSkills = [
    {
      name: "Self-Awareness",
      description: "Identifying emotions and recognizing strengths",
      icon: <Heart className="h-5 w-5 text-white" />,
      color: "bg-[#EC407A]"
    },
    {
      name: "Social Awareness",
      description: "Understanding perspectives of others and empathy",
      icon: <Users className="h-5 w-5 text-white" />,
      color: "bg-[#EC407A]"
    },
    {
      name: "Self-Management",
      description: "Regulating emotions and setting personal goals",
      icon: <Brain className="h-5 w-5 text-white" />,
      color: "bg-[#EC407A]"
    },
    {
      name: "Relationship Skills",
      description: "Establishing healthy relationships and communication",
      icon: <MessageCircle className="h-5 w-5 text-white" />,
      color: "bg-[#EC407A]"
    },
    {
      name: "Responsible Decision-Making",
      description: "Making constructive choices about behavior",
      icon: <Lightbulb className="h-5 w-5 text-white" />,
      color: "bg-[#EC407A]"
    }
  ];
  
  return (
    <SlideLayout
      title="Social-Emotional Learning"
      variant="selImpact"
      quote="Through the arts, young people develop essential life skills that support their growth as empathetic, confident individuals."
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
          <Heart className="h-16 w-16 text-[#EC407A] mb-3" />
        </motion.div>
        
        <div className="text-center">
          <p className="text-lg font-semibold text-[#424242]">Your donation supports</p>
          <p className="text-4xl font-bold text-[#EC407A]">
            <motion.span>{rounded}</motion.span> Students
          </p>
          <p className="text-sm text-[#424242] mt-2">
            Developing crucial social-emotional learning skills through the arts
          </p>
        </div>
        
        <motion.div 
          className="bg-[#FCE4EC] p-4 sm:p-5 rounded-lg border border-[#EC407A]/20 w-full mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <p className="text-center text-[#424242]">
            Creative Action's SEL programs help students develop the skills needed to succeed in school, career, and life.
          </p>
        </motion.div>
        
        {/* SEL Skills List */}
        <div className="w-full space-y-3">
          {selSkills.map((skill, index) => (
            <motion.div 
              key={skill.name}
              className="flex items-start p-3 bg-white rounded-lg shadow-sm border border-gray-100"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + (index * 0.1), duration: 0.5 }}
            >
              <div className={`${skill.color} p-2 rounded-full mr-3 mt-0.5`}>
                {skill.icon}
              </div>
              <div>
                <h3 className="font-semibold text-[#424242]">{skill.name}</h3>
                <p className="text-sm text-[#666666]">{skill.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="bg-[#FCE4EC] py-3 px-4 rounded-lg text-center w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          <p className="text-[#EC407A] font-semibold">
            Students with strong SEL skills have 11% higher academic achievement
          </p>
        </motion.div>
      </div>
    </SlideLayout>
  );
}