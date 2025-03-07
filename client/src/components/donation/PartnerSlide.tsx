import { motion } from "framer-motion";
import SlideLayout from "./SlideLayout";

interface PartnerSlideProps {
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

export default function PartnerSlide({
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide
}: PartnerSlideProps) {
  const metrics = [
    { title: "7.5 Million", subtitle: "Meals provided", footnote: "Value: $17.6 million" },
    { title: "301,000", subtitle: "Food pantry visits", footnote: "Plus 670,000 meals & snacks" }
  ];
  
  return (
    <SlideLayout
      title="Community Network"
      variant="partner"
      quote="In FY24, our Partner Agencies were responsible for distributing 68% of the total food provided by Community Food Share."
      onNext={onNext}
      onPrevious={onPrevious}
      isFirstSlide={isFirstSlide}
      isLastSlide={isLastSlide}
    >
      <div className="mb-4 sm:mb-6 md:mb-8 px-4 sm:px-6 md:px-0">
        <motion.div 
          className="text-4xl sm:text-5xl md:text-6xl font-heading font-extrabold mb-2 sm:mb-3 md:mb-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          42
        </motion.div>
        <p className="text-lg sm:text-xl md:text-2xl">Partner Agencies</p>
      </div>
      
      <div className="mb-10">
        <motion.p 
          className="text-xl mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Your donation helps support our entire network of partner agencies who distribute:
        </motion.p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {metrics.map((metric, index) => (
            <motion.div 
              key={index}
              className="bg-white/20 p-6 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.2 }}
            >
              <div className="text-4xl font-heading font-bold mb-2">{metric.title}</div>
              <p className="text-xl">{metric.subtitle}</p>
              <p className="text-base">{metric.footnote}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </SlideLayout>
  );
}
