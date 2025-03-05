import { motion } from "framer-motion";
import SlideLayout from "./SlideLayout";

interface VolunteerSlideProps {
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

export default function VolunteerSlide({
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide
}: VolunteerSlideProps) {
  const counters = [
    { value: "2,357", label: "Volunteers annually" },
    { value: "25%", label: "Of all hours worked" }
  ];
  
  return (
    <SlideLayout
      title="Volunteer Power"
      variant="volunteer"
      quote="Volunteers contribute 25% of all hours worked at Community Food Share, saving the organization $969,250 in labor costs."
      onNext={onNext}
      onPrevious={onPrevious}
      isFirstSlide={isFirstSlide}
      isLastSlide={isLastSlide}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {counters.map((counter, index) => (
          <motion.div 
            key={index}
            className="bg-white/20 p-6 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <motion.div 
              className="text-5xl font-heading font-bold mb-2"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.2 }}
            >
              {counter.value}
            </motion.div>
            <p className="text-xl">{counter.label}</p>
          </motion.div>
        ))}
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <p className="text-xl mb-4">
          Your financial support works hand-in-hand with our volunteers who contribute time equivalent to <span className="font-bold">13 full-time employees</span>.
        </p>
        
        <p className="text-xl mb-8">
          This volunteer power saves Community Food Share <span className="font-bold">$969,250</span> in labor costs annually.
        </p>
      </motion.div>
    </SlideLayout>
  );
}
