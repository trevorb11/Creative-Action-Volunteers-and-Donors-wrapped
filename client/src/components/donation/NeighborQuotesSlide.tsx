import { useState, useEffect } from "react";
import SlideLayout from "./SlideLayout";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, Heart, Users, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NeighborQuotesSlideProps {
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

// These quotes would ideally come from the document you provided
const NEIGHBOR_QUOTES = [
  {
    text: "I never thought I'd be in a position where I had to choose between paying rent and buying food for my children. Community Food Share has given us hope and nutrition when we needed it most.",
    attribution: "Sarah, Mother of three",
    imageColor: "bg-green-100"
  },
  {
    text: "As a senior on a fixed income, I struggled to afford fresh vegetables. The produce I receive not only helps me eat healthier but reminds me that I'm not forgotten by my community.",
    attribution: "Robert, 78-year-old retiree",
    imageColor: "bg-orange-100"
  },
  {
    text: "When I lost my job, your food bank was there for me and my family. Now that I'm back on my feet, I volunteer whenever I can. You don't just feed people – you create a cycle of giving.",
    attribution: "Michael, Former client & current volunteer",
    imageColor: "bg-blue-100"
  },
  {
    text: "The fresh fruits and vegetables we receive are treasures to my children. They get so excited on food bank days, not just because of the food, but because they see the kindness of strangers.",
    attribution: "Elena, Single parent",
    imageColor: "bg-violet-100"
  },
  {
    text: "After the medical bills piled up, we didn't know how we would manage. Your food assistance program has given us the breathing room we needed to heal without worrying about going hungry.",
    attribution: "David & Maria, Family facing medical hardship",
    imageColor: "bg-rose-100"
  }
];

export default function NeighborQuotesSlide({
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide,
}: NeighborQuotesSlideProps) {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  // Auto-rotate quotes every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentQuoteIndex((prevIndex) => 
        prevIndex === NEIGHBOR_QUOTES.length - 1 ? 0 : prevIndex + 1
      );
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const goToNextQuote = () => {
    setDirection(1);
    setCurrentQuoteIndex((prevIndex) => 
      prevIndex === NEIGHBOR_QUOTES.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPreviousQuote = () => {
    setDirection(-1);
    setCurrentQuoteIndex((prevIndex) => 
      prevIndex === 0 ? NEIGHBOR_QUOTES.length - 1 : prevIndex - 1
    );
  };

  return (
    <SlideLayout
      title="Voices of Our Neighbors"
      subtitle="Real stories of how your generosity transforms lives"
      variant="volunteer"
      onNext={onNext}
      onPrevious={onPrevious}
      isFirstSlide={isFirstSlide}
      isLastSlide={isLastSlide}
    >
      <div className="my-4 sm:my-6 md:my-8 max-w-5xl mx-auto">
        <div className="relative h-[300px] sm:h-[350px] md:h-[420px] mb-4 sm:mb-6 md:mb-8">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 opacity-5 -mt-16 -mr-16">
            <Quote size={120} />
          </div>
          <div className="absolute bottom-0 left-0 opacity-5 -mb-16 -ml-16 transform rotate-180">
            <Quote size={120} />
          </div>
          
          {/* Main quote card */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQuoteIndex}
              custom={direction}
              initial={{ opacity: 0, x: direction * 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -100 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute w-full h-full"
            >
              <Card className="h-full bg-white/90 backdrop-blur shadow-xl border-0 overflow-hidden">
                <CardContent className="p-4 sm:p-6 md:p-8 h-full flex flex-col justify-center items-center text-center relative">
                  {/* Quote icon */}
                  <div className="absolute top-8 left-8 text-primary/20">
                    <Quote size={40} />
                  </div>
                  
                  {/* Person icon */}
                  <div className={`w-24 h-24 ${NEIGHBOR_QUOTES[currentQuoteIndex].imageColor} rounded-full flex items-center justify-center mb-6 relative`}>
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{ 
                        boxShadow: [
                          "0 0 0 0px rgba(142, 214, 84, 0.3)",
                          "0 0 0 10px rgba(142, 214, 84, 0)",
                        ],
                      }}
                      transition={{ 
                        repeat: Infinity,
                        duration: 2,
                      }}
                    />
                    <Users className="w-12 h-12 text-gray-700" />
                  </div>
                  
                  {/* Quote text with heartbeat animation */}
                  <div className="max-w-3xl mx-auto mb-8 relative">
                    <motion.div 
                      className="absolute -left-8 top-1/2 transform -translate-y-1/2 text-red-400/30"
                      animate={{ 
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ 
                        repeat: Infinity,
                        duration: 2,
                      }}
                    >
                      <Heart className="h-6 w-6" />
                    </motion.div>
                    <motion.div 
                      className="absolute -right-8 top-1/2 transform -translate-y-1/2 text-red-400/30"
                      animate={{ 
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ 
                        repeat: Infinity,
                        duration: 2,
                        delay: 0.5,
                      }}
                    >
                      <Heart className="h-6 w-6" />
                    </motion.div>
                    <motion.p 
                      className="text-xl md:text-2xl text-gray-700 italic font-medium"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      "{NEIGHBOR_QUOTES[currentQuoteIndex].text}"
                    </motion.p>
                  </div>
                  
                  {/* Attribution */}
                  <motion.p 
                    className="text-primary font-semibold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    — {NEIGHBOR_QUOTES[currentQuoteIndex].attribution}
                  </motion.p>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
          
          {/* Navigation buttons */}
          <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10">
            <Button 
              variant="outline" 
              size="icon"
              onClick={goToPreviousQuote}
              className="rounded-full bg-white/70 backdrop-blur hover:bg-white transition-colors border-0 shadow-md"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10">
            <Button 
              variant="outline" 
              size="icon"
              onClick={goToNextQuote}
              className="rounded-full bg-white/70 backdrop-blur hover:bg-white transition-colors border-0 shadow-md"
            >
              <ArrowRight className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>
        
        {/* Dots indicators */}
        <div className="flex justify-center gap-2">
          {NEIGHBOR_QUOTES.map((_, index) => (
            <motion.button
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentQuoteIndex ? "bg-primary" : "bg-gray-300"
              }`}
              onClick={() => {
                setDirection(index > currentQuoteIndex ? 1 : -1);
                setCurrentQuoteIndex(index);
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
        
        {/* Context message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-600 max-w-3xl mx-auto">
            Your donation creates stories of hope and resilience in our community. 
            Behind every meal provided is a neighbor whose life you've touched directly.
          </p>
        </motion.div>
      </div>
    </SlideLayout>
  );
}