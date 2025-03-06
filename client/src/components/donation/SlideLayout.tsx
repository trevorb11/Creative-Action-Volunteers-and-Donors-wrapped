import { ReactNode } from "react";
import { motion } from "framer-motion";
import { SLIDE_COLORS } from "@/lib/constants";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface SlideLayoutProps {
  children: ReactNode;
  title: string;
  variant: keyof typeof SLIDE_COLORS;
  subtitle?: string;
  quote?: string;
  titleClassName?: string; // Added for custom title styling
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

export default function SlideLayout({
  children,
  title,
  variant,
  subtitle,
  quote,
  titleClassName = "",
  onNext,
  onPrevious,
  isFirstSlide = false,
  isLastSlide = false
}: SlideLayoutProps) {
  const bgColor = SLIDE_COLORS[variant];
  
  return (
    <div className={`min-h-screen w-full flex items-center justify-center ${bgColor} text-white relative`}>
      {/* Community Food Share logo */}
      <div className="absolute top-6 left-6">
        <div className="flex items-center">
          <h3 className="text-lg md:text-xl font-bold text-white">
            Community Food Share
          </h3>
        </div>
      </div>
      
      {/* Left navigation arrow */}
      {onPrevious && !isFirstSlide && (
        <button 
          onClick={onPrevious}
          className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 text-white transition-all duration-300 z-10"
          aria-label="Previous slide"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
      )}
      
      {/* Main content */}
      <div className="container mx-auto px-6 py-12 flex flex-col items-center justify-center">
        <div className="text-center max-w-3xl mx-auto">
          <motion.h2 
            className={`text-3xl md:text-5xl font-bold mb-6 ${titleClassName}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ fontFamily: 'Spectral, serif' }}
          >
            {title}
          </motion.h2>
          
          {subtitle && (
            <motion.h3 
              className="text-xl md:text-2xl mb-8 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ fontFamily: 'Open Sans, sans-serif' }}
            >
              {subtitle}
            </motion.h3>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8"
          >
            {children}
          </motion.div>
          
          {quote && (
            <motion.div
              className="mt-12 max-w-2xl mx-auto px-6 py-4 bg-white/10 rounded-lg border-l-4 border-cfs-yellow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <p className="text-lg italic" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                "{quote}"
              </p>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Right navigation arrow */}
      {onNext && !isLastSlide && (
        <button 
          onClick={onNext}
          className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 text-white transition-all duration-300 z-10"
          aria-label="Next slide"
        >
          <ArrowRight className="h-6 w-6" />
        </button>
      )}
      
      {/* Footer */}
      <div className="absolute bottom-4 w-full text-center text-white/70 text-sm">
        <p>Together, we're building a hunger-free community</p>
      </div>
    </div>
  );
}
