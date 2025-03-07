import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import DonationForm from "./DonationForm";
import { SLIDE_COLORS } from "@/lib/constants";

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
    <div className={`min-h-screen ${SLIDE_COLORS.welcome} text-cfs-darkGray font-sans relative overflow-hidden`}>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-40 sm:w-64 h-40 sm:h-64 bg-cfs-brightGreen opacity-10 rounded-bl-full"></div>
      <div className="absolute bottom-0 left-0 w-32 sm:w-48 h-32 sm:h-48 bg-cfs-teal opacity-10 rounded-tr-full"></div>
      
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-center max-w-4xl min-h-screen relative z-10">
        <motion.div 
          className="text-center mb-6 sm:mb-10 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-full"
          >
            <svg className="w-48 sm:w-56 md:w-64 mx-auto mb-6 sm:mb-8" viewBox="0 0 300 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="300" height="100" rx="8" fill="#0c4428" />
              <text x="50%" y="45%" dominantBaseline="middle" textAnchor="middle" fill="#8dc53e" fontFamily="Spectral, serif" fontSize="24" fontWeight="bold">
                Community Food Share
              </text>
              <text x="50%" y="70%" dominantBaseline="middle" textAnchor="middle" fill="white" fontFamily="Open Sans, sans-serif" fontSize="14">
                Boulder & Broomfield Counties
              </text>
            </svg>
          </motion.div>
          
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-cfs-darkGreen mb-4 sm:mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{ fontFamily: 'Spectral, serif' }}
          >
            {isPersonalized ? "Your Personal Impact Wrapped" : "Your Impact Wrapped"}
          </motion.h1>
          
          <motion.p 
            className="text-lg sm:text-xl md:text-2xl text-cfs-teal mb-4 sm:mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            style={{ fontFamily: 'Open Sans, sans-serif' }}
          >
            {isPersonalized 
              ? "We're loading your donation history to show your personal impact" 
              : "See how your donation makes a difference at Community Food Share"
            }
          </motion.p>
          
          <motion.p 
            className="text-sm sm:text-base text-cfs-darkGray mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            Based on FY 2024 data
          </motion.p>
        </motion.div>
        
        {!isPersonalized && (
          <motion.div 
            className="w-full max-w-md p-4 sm:p-6 md:p-8 bg-white rounded-lg shadow-lg border border-gray-100"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-cfs-darkGreen" style={{ fontFamily: 'Spectral, serif' }}>
              Enter Your Donation Amount
            </h2>
            <DonationForm onSubmit={onSubmit} />
          </motion.div>
        )}
        
        {isPersonalized && (
          <motion.div 
            className="w-full max-w-md p-4 sm:p-6 md:p-8 bg-white rounded-lg shadow-lg border border-gray-100 text-center"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-cfs-darkGreen" style={{ fontFamily: 'Spectral, serif' }}>
              Loading Your Donation History...
            </h2>
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-t-2 border-b-2 border-cfs-brightGreen rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-sm sm:text-base text-cfs-teal">Please wait while we prepare your personalized impact visualization</p>
          </motion.div>
        )}
        
        {/* CFS tagline */}
        <motion.p
          className="text-xs sm:text-sm text-cfs-darkGray mt-6 sm:mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          Together, we're building a hunger-free community
        </motion.p>
      </div>
    </div>
  );
}
