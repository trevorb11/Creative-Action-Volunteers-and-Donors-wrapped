import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Gift, HeartHandshake, LineChart } from "lucide-react";
import CountUpAnimation from "./CountUpAnimation";

interface DonorIntroSlideProps {
  firstName?: string;
  amount: number;
  onNext?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

export default function DonorIntroSlide({
  firstName = "Friend",
  amount,
  onNext,
  isFirstSlide,
  isLastSlide
}: DonorIntroSlideProps) {
  // Remove period/comma from firstName if it exists
  const cleanName = firstName?.replace(/[.,]$/, "");

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#F3E5F5] to-[#EDE7F6] p-4">
      <div className="w-full max-w-lg">
        <Card className="border-none shadow-lg">
          <CardHeader className="text-center bg-[#6A1B9A] text-white rounded-t-lg pb-6">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <CardTitle className="text-3xl font-bold">Welcome to Your Donor Impact</CardTitle>
            </motion.div>
          </CardHeader>
          
          <CardContent className="pt-8 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col items-center space-y-6"
            >
              <div className="w-20 h-20 rounded-full bg-[#F3E5F5] flex items-center justify-center">
                <Gift className="h-10 w-10 text-[#6A1B9A]" />
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-800">
                Hello, {cleanName}!
              </h2>

              <div className="text-center max-w-md">
                <p className="text-gray-700 mb-4">
                  Thank you for your generous donation of{" "}
                  <span className="font-bold text-[#6A1B9A]">
                    ${amount}
                  </span>
                  {" "}to Creative Action.
                </p>
                <p className="text-gray-700 mb-6">
                  Let's explore the incredible impact your donation is making for arts education in our community!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-6">
                <div className="bg-white p-4 rounded-lg shadow text-center">
                  <HeartHandshake className="h-8 w-8 text-[#6A1B9A] mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Students Reached</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                  <LineChart className="h-8 w-8 text-[#66CDAA] mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Program Impact</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                  <Gift className="h-8 w-8 text-[#EC407A] mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Teaching Hours</p>
                </div>
              </div>

              <Button 
                onClick={onNext} 
                className="w-full bg-[#6A1B9A] hover:bg-[#4A148C] text-white"
                size="lg"
              >
                Begin Your Impact Journey <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </div>
      
      {/* Footer */}
      <div className="mt-4 text-center">
        <p className="text-[#6A1B9A] text-xs">
          © Creative Action {new Date().getFullYear()} • Where creativity meets possibility
        </p>
      </div>
    </div>
  );
}