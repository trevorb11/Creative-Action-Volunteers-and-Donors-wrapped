import { motion } from "framer-motion";
import { DonationImpact } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Share2 } from "lucide-react";
import SlideLayout from "./SlideLayout";

interface SummarySlideProps {
  amount: number;
  impact: DonationImpact;
  onReset: () => void;
  onShare: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

export default function SummarySlide({ 
  amount, 
  impact, 
  onReset, 
  onShare,
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide
}: SummarySlideProps) {
  const impactItems = [
    { 
      text: `Provided ${impact.mealsProvided.toLocaleString()} nutritious meals` 
    },
    { 
      text: `Helped serve ${impact.peopleServed.toLocaleString()} people in need` 
    },
    { 
      text: `Rescued ${impact.foodRescued.toLocaleString()} lbs of food` 
    },
    { 
      text: `Prevented ${impact.co2Saved.toLocaleString()} lbs of CO2 emissions` 
    }
  ];
  
  return (
    <SlideLayout
      title="Your Impact Summary"
      variant="summary"
      quote="Thank you for making a difference in our community!"
      onNext={onNext}
      onPrevious={onPrevious}
      isFirstSlide={isFirstSlide}
      isLastSlide={isLastSlide}
    >
      <motion.div 
        className="bg-white/20 p-8 rounded-xl mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-2xl font-heading mb-6">With your ${amount.toLocaleString()} donation:</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {impactItems.map((item, index) => (
            <motion.div 
              key={index}
              className="flex items-start"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-lg">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            onClick={onReset}
            className="px-6 py-3 bg-white text-primary font-bold rounded-lg shadow hover:bg-neutral-100 transition duration-300"
          >
            <RefreshCcw className="h-5 w-5 mr-2" />
            Donate Again
          </Button>
          
          <Button
            onClick={onShare}
            className="px-6 py-3 bg-secondary text-white font-bold rounded-lg shadow hover:bg-secondary/90 transition duration-300 flex items-center"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Share Your Impact
          </Button>
        </div>
      </motion.div>
    </SlideLayout>
  );
}
