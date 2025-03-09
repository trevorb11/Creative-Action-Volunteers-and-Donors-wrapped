import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import DonationForm from "./DonationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface WelcomeScreenProps {
  onSubmit: (amount: number, email?: string) => void;
}

export default function WelcomeScreen({ onSubmit }: WelcomeScreenProps) {
  const [isPersonalized, setIsPersonalized] = useState(false);
  
  // Check if there's an email parameter in the URL
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const email = queryParams.get('email');
    
    if (email) {
      setIsPersonalized(true);
    }
  }, []);
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-green-100 p-4">
      <div className="w-full max-w-md">
        <Card className="w-full shadow-lg overflow-hidden">
          <CardHeader className="text-center bg-[#0c4428] text-white">
            <CardTitle className="text-3xl font-bold">Community Food Share</CardTitle>
            <CardDescription className="text-white text-lg opacity-90">
              {isPersonalized ? "Your Personal Impact Wrapped" : "Your Impact Wrapped"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <p className="text-lg text-[#414042] mb-4">
                {isPersonalized 
                  ? "We're loading your donation history to show your personal impact" 
                  : "See how your donation makes a difference at Community Food Share"
                }
              </p>
              
              <p className="text-sm text-gray-500 mb-5">
                Based on FY 2024 data
              </p>
            </motion.div>
            
            {!isPersonalized && (
              <motion.div 
                className="p-4 sm:p-5 rounded-lg border border-gray-200 bg-white/50"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h2 className="text-xl font-bold mb-4 text-center text-[#0c4428]">
                  Enter Your Donation Amount
                </h2>
                <DonationForm onSubmit={onSubmit} />
              </motion.div>
            )}
            
            {isPersonalized && (
              <motion.div 
                className="p-4 sm:p-5 rounded-lg border border-gray-200 bg-white/50 text-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h2 className="text-xl font-bold mb-4 text-center text-[#0c4428]">
                  Loading Your Donation History...
                </h2>
                <Loader2 className="h-12 w-12 animate-spin text-[#8dc53e] mx-auto my-4" />
                <p className="mt-4 text-sm text-[#227d7f]">Please wait while we prepare your personalized impact visualization</p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Footer */}
      <motion.div 
        className="mt-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <p className="text-[#0c4428] text-xs">
          © Community Food Share {new Date().getFullYear()} • Together, we're building a hunger-free community
        </p>
      </motion.div>
    </div>
  );
}
