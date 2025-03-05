import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { DonationImpact } from "@shared/schema";
import SlideLayout from "./SlideLayout";
import { Leaf, Droplet } from "lucide-react";

interface EnvironmentSlideProps {
  impact: DonationImpact;
}

export default function EnvironmentSlide({ impact }: EnvironmentSlideProps) {
  const co2Count = useMotionValue(0);
  const roundedCO2 = useTransform(co2Count, (latest) => Math.round(latest));
  
  const waterCount = useMotionValue(0);
  const roundedWater = useTransform(waterCount, (latest) => Math.round(latest));
  
  useEffect(() => {
    const co2Controls = animate(co2Count, impact.co2Saved, {
      duration: 2,
      ease: "easeOut"
    });
    
    const waterControls = animate(waterCount, impact.waterSaved, {
      duration: 2,
      ease: "easeOut"
    });
    
    return () => {
      co2Controls.stop();
      waterControls.stop();
    };
  }, [co2Count, waterCount, impact]);
  
  return (
    <SlideLayout
      title="Your Environmental Impact"
      variant="environment"
      quote="Our food rescue efforts prevent over 9,000 tons of CO2 emissions annually, equivalent to removing 2,200 cars from the road for a year."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <motion.div 
          className="bg-white/20 p-6 rounded-xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center mb-4">
            <Leaf className="h-12 w-12" />
          </div>
          <div className="text-4xl font-heading font-bold mb-2">
            <motion.span>{roundedCO2}</motion.span>
          </div>
          <p className="text-xl font-heading">Pounds of CO2 Emissions Prevented</p>
        </motion.div>
        
        <motion.div 
          className="bg-white/20 p-6 rounded-xl"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-center mb-4">
            <Droplet className="h-12 w-12" />
          </div>
          <div className="text-4xl font-heading font-bold mb-2">
            <motion.span>{roundedWater}</motion.span>
          </div>
          <p className="text-xl font-heading">Gallons of Water Saved</p>
        </motion.div>
      </div>
      
      <p className="text-xl mb-8">
        Your donation helped Community Food Share in its food rescue efforts, preventing food waste and conserving valuable resources.
      </p>
    </SlideLayout>
  );
}
