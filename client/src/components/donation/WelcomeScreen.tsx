import { motion } from "framer-motion";
import DonationForm from "./DonationForm";
import { SLIDE_COLORS } from "@/lib/constants";

interface WelcomeScreenProps {
  onSubmit: (amount: number) => void;
}

export default function WelcomeScreen({ onSubmit }: WelcomeScreenProps) {
  return (
    <div className={`min-h-screen ${SLIDE_COLORS.welcome} text-neutral-800 font-sans`}>
      <div className="container mx-auto px-6 py-12 flex flex-col items-center justify-center max-w-4xl min-h-screen">
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
            <svg className="w-52 mx-auto mb-8" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="200" height="100" rx="8" fill="#2AB674" />
              <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontFamily="Arial" fontSize="18" fontWeight="bold">
                Community Food Share
              </text>
            </svg>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-5xl font-heading font-bold text-primary mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Your Impact Wrapped
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-neutral-800 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            See how your donation makes a difference at Community Food Share
          </motion.p>
          
          <motion.p 
            className="text-base text-neutral-800 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            Based on FY 2024 data
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="w-full max-w-md p-8 bg-neutral-100 rounded-xl shadow-lg"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <h2 className="text-2xl font-heading font-bold mb-6 text-center">Enter Your Donation Amount</h2>
          <DonationForm onSubmit={onSubmit} />
        </motion.div>
      </div>
    </div>
  );
}
