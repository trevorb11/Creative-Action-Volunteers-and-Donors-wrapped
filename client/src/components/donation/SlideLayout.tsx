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
  const headerBgColor = variant === 'meals' ? 'bg-[#227d7f]' : 
                        variant === 'donor' || variant === 'donorSummary' ? 'bg-[#8dc53e]' : 
                        variant === 'people' || variant === 'summary' ? 'bg-[#0c4428]' : 
                        variant === 'environment' ? 'bg-[#227d7f]' : 
                        variant === 'foodRescue' ? 'bg-[#8dc53e]' : 'bg-[#0c4428]';
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-green-100 p-4 md:p-6 lg:p-8">
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
                className="bg-green-50 p-4 md:p-6 rounded-lg border-l-4 border-green-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <p className="text-[#414042] text-sm md:text-base italic font-medium">
                  "{quote}"
                </p>
              </motion.div>
            )}
          </CardContent>
          
          <CardFooter className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8">
            <div className="flex justify-between w-full mt-4">
              {!isFirstSlide && onPrevious && (
                <Button variant="outline" onClick={onPrevious} className="border-[#227d7f] text-[#227d7f] hover:bg-[#227d7f] hover:text-white md:px-6 md:py-2 md:text-base">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
              )}
              {!isFirstSlide && isLastSlide && (
                <div />
              )}
              {!isLastSlide && onNext && (
                <Button variant="outline" onClick={onNext} className="ml-auto border-[#227d7f] text-[#227d7f] hover:bg-[#227d7f] hover:text-white md:px-6 md:py-2 md:text-base">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Footer */}
      <div className="mt-4 md:mt-6 text-center">
        <p className="text-[#0c4428] text-xs md:text-sm">
          © Community Food Share {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
