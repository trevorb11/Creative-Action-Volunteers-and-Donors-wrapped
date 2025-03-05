import { ReactNode } from "react";
import { motion } from "framer-motion";
import { SLIDE_COLORS } from "@/lib/constants";

interface SlideLayoutProps {
  children: ReactNode;
  title: string;
  variant: keyof typeof SLIDE_COLORS;
  subtitle?: string;
  quote?: string;
}

export default function SlideLayout({
  children,
  title,
  variant,
  subtitle,
  quote
}: SlideLayoutProps) {
  const bgColor = SLIDE_COLORS[variant];
  
  return (
    <div className={`min-h-screen w-full flex items-center justify-center ${bgColor} text-white`}>
      <div className="container mx-auto px-6 py-12 flex flex-col items-center justify-center">
        <div className="text-center max-w-3xl mx-auto">
          <motion.h2 
            className="text-3xl md:text-5xl font-heading font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {title}
          </motion.h2>
          
          {subtitle && (
            <motion.h3 
              className="text-2xl md:text-3xl font-heading mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
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
            <motion.p 
              className="text-lg italic mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              "{quote}"
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}
