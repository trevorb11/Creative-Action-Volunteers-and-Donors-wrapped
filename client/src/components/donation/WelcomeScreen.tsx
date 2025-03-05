import { motion } from "framer-motion";
import DonationForm from "./DonationForm";
import { SLIDE_COLORS } from "@/lib/constants";

interface WelcomeScreenProps {
  onSubmit: (amount: number, email?: string) => void;
}

export default function WelcomeScreen({ onSubmit }: WelcomeScreenProps) {
  return (
    <div className={`min-h-screen ${SLIDE_COLORS.welcome} text-cfs-darkGray font-sans relative overflow-hidden`}>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cfs-brightGreen opacity-10 rounded-bl-full"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-cfs-teal opacity-10 rounded-tr-full"></div>
      
      <div className="container mx-auto px-6 py-12 flex flex-col items-center justify-center max-w-4xl min-h-screen relative z-10">
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <svg className="w-64 mx-auto mb-8" viewBox="0 0 300 100" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            className="text-4xl md:text-5xl font-bold text-cfs-darkGreen mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{ fontFamily: 'Spectral, serif' }}
          >
            Your Impact Wrapped
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-cfs-teal mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            style={{ fontFamily: 'Open Sans, sans-serif' }}
          >
            See how your donation makes a difference at Community Food Share
          </motion.p>
          
          <motion.p 
            className="text-base text-cfs-darkGray mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            Based on FY 2024 data
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-gray-100"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-cfs-darkGreen" style={{ fontFamily: 'Spectral, serif' }}>
            Enter Your Donation Amount
          </h2>
          <DonationForm onSubmit={onSubmit} />
        </motion.div>
        
        {/* CFS tagline */}
        <motion.p
          className="text-sm text-cfs-darkGray mt-8"
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
