import { ReactNode } from "react";
import { motion } from "framer-motion";
import { SLIDE_COLORS } from "@/lib/constants";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SlideLayoutProps {
  children: ReactNode;
  title: string;
  variant: keyof typeof SLIDE_COLORS;
  subtitle?: string;
  quote?: string;
  titleClassName?: string; 
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

// Updated color palette to use Creative Action brand colors
const BRAND_COLORS = {
  PRIMARY: "#6A1B9A", // Purple
  SECONDARY: "#42A5F5", // Blue
  ACCENT: "#EC407A", // Pink
  GREEN: "#66BB6A", // Green
  YELLOW: "#FFCA28", // Yellow
  ORANGE: "#FF8A65" // Orange
};

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
  
  // Determine header background color based on slide variant
  const headerBgColor = 
    variant === 'students' ? 'bg-[#42A5F5]' : // Blue for student impact
    variant === 'teachingArtists' ? 'bg-[#6A1B9A]' : // Purple for teaching artists
    variant === 'programs' ? 'bg-[#66BB6A]' : // Green for programs
    variant === 'murals' ? 'bg-[#FFCA28]' : // Yellow for murals
    variant === 'selImpact' ? 'bg-[#EC407A]' : // Pink for SEL impact
    variant === 'schoolPartnerships' ? 'bg-[#6A1B9A]' : // Purple for schools
    variant === 'donor' || variant === 'donorSummary' ? 'bg-[#42A5F5]' : // Blue for donor summaries
    variant === 'timeGiving' ? 'bg-[#FF8A65]' : // Orange for time giving
    variant === 'financial' ? 'bg-[#42A5F5]' : // Blue for financial
    variant === 'summary' ? 'bg-[#66BB6A]' : // Green for summary
    'bg-[#6A1B9A]'; // Default to purple
  
  // Determine border color for quote box based on variant
  const quoteBorderColor = 
    variant === 'students' ? 'border-[#42A5F5]' :
    variant === 'teachingArtists' ? 'border-[#6A1B9A]' :
    variant === 'programs' ? 'border-[#66BB6A]' :
    variant === 'murals' ? 'border-[#FFCA28]' :
    variant === 'selImpact' ? 'border-[#EC407A]' :
    'border-[#6A1B9A]';
  
  // Determine quote background color
  const quoteBgColor = 
    variant === 'students' ? 'bg-[#E3F2FD]' :
    variant === 'teachingArtists' ? 'bg-[#F3E5F5]' :
    variant === 'programs' ? 'bg-[#E8F5E9]' :
    variant === 'murals' ? 'bg-[#FFF8E1]' :
    variant === 'selImpact' ? 'bg-[#FCE4EC]' :
    'bg-[#F3E5F5]';
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
        <Card className="w-full overflow-hidden">
          <CardHeader className={`text-center ${headerBgColor} text-white rounded-t-lg py-4 md:py-6`}>
            <CardTitle className="text-2xl md:text-3xl font-bold text-white">{title}</CardTitle>
            {subtitle && (
              <CardDescription className="text-white opacity-90">{subtitle}</CardDescription>
            )}
          </CardHeader>
          
          <CardContent className="pt-6 sm:pt-8 md:pt-10 space-y-5 sm:space-y-6 md:space-y-8 px-4 sm:px-6 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="w-full"
            >
              {children}
            </motion.div>
            
            {quote && (
              <motion.div
                className={`${quoteBgColor} p-4 md:p-6 rounded-lg border-l-4 ${quoteBorderColor}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <p className="text-[#424242] text-sm md:text-base italic font-medium">
                  "{quote}"
                </p>
              </motion.div>
            )}
          </CardContent>
          
          <CardFooter className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8">
            <div className="flex justify-between w-full mt-4">
              {!isFirstSlide && onPrevious && (
                <Button variant="outline" onClick={onPrevious} className="border-[#6A1B9A] text-[#6A1B9A] hover:bg-[#6A1B9A] hover:text-white md:px-6 md:py-2 md:text-base">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
              )}
              {!isFirstSlide && isLastSlide && (
                <div />
              )}
              {!isLastSlide && onNext && (
                <Button variant="outline" onClick={onNext} className="ml-auto border-[#6A1B9A] text-[#6A1B9A] hover:bg-[#6A1B9A] hover:text-white md:px-6 md:py-2 md:text-base">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Footer */}
      <div className="mt-4 md:mt-6 text-center">
        <p className="text-[#6A1B9A] text-xs md:text-sm">
          © Creative Action {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
