import { useEffect, useState, useRef } from "react";
import { DonationImpact } from "@shared/schema";
import SlideLayout from "./SlideLayout";
import { formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { TrendingUp, Heart, Calendar, Award, Gift, Sparkles, BarChart3, Users, ShoppingBasket } from "lucide-react";
import CountUpAnimation from "./CountUpAnimation";

interface DonorSummarySlideProps {
  impact: DonationImpact;
  donorEmail: string | null;
  amount: number;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

interface DonorSummary {
  totalLastYear: number;
  lastGift: { amount: number; date: string };
  lifetimeGiving: number;
  name?: string;
}

export default function DonorSummarySlide({
  impact,
  donorEmail,
  amount,
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide,
}: DonorSummarySlideProps) {
  const [donorSummary, setDonorSummary] = useState<DonorSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDonorSummary() {
      // First check if we have wrapped donor data in sessionStorage
      const wrappedDataStr = sessionStorage.getItem('wrappedDonorData');
      const donorParams = sessionStorage.getItem('donorParams');
      const storedEmail = sessionStorage.getItem('donorEmail');
      const storedFirstName = sessionStorage.getItem('donorFirstName');
      
      console.log("DonorSummarySlide - Checking storage:", { 
        hasWrappedData: !!wrappedDataStr, 
        hasParams: !!donorParams,
        hasStoredEmail: !!storedEmail,
        hasFirstName: !!storedFirstName,
        propEmail: donorEmail 
      });
      
      if (wrappedDataStr) {
        try {
          const wrappedData = JSON.parse(wrappedDataStr);
          console.log("Using wrapped donor data from sessionStorage:", wrappedData);
          
          // Format the date for display
          let formattedDate = 'N/A';
          if (wrappedData.lastGiftDate) {
            try {
              formattedDate = new Date(wrappedData.lastGiftDate).toLocaleDateString();
            } catch (e) {
              console.warn("Date formatting error:", e);
              formattedDate = wrappedData.lastGiftDate; // Use as string if parsing fails
            }
          }
          
          // Try to extract the current fiscal year donation amounts if available
          let totalLastYear = 0;
          
          // Check if we have specific fiscal year data in URL parameters
          // Parameters could be named like fy23, fy24, etc.
          const params = sessionStorage.getItem('donorParams');
          if (params) {
            try {
              const donorParams = JSON.parse(params);
              // Get current fiscal year (uses calendar year July-June)
              const now = new Date();
              const currentYear = now.getFullYear();
              const fiscalYearStart = new Date(currentYear, 6, 1); // July 1st
              
              // If we're before July 1st, use previous fiscal year
              const fiscalYear = now < fiscalYearStart ? 
                currentYear.toString().substring(2) : 
                (currentYear + 1).toString().substring(2);
              
              // Check for parameter like "fy24" using the current fiscal year
              const fyParamName = `fy${fiscalYear}`;
              if (donorParams[fyParamName] && !isNaN(parseFloat(donorParams[fyParamName]))) {
                totalLastYear = parseFloat(donorParams[fyParamName]);
                console.log(`Found fiscal year donation amount for ${fyParamName}:`, totalLastYear);
              }
            } catch (err) {
              console.error("Error parsing donor parameters:", err);
            }
          }
          
          // Create a donor summary from wrapped data
          setDonorSummary({
            totalLastYear,
            lastGift: {
              amount: wrappedData.lastGiftAmount || 0,
              date: formattedDate
            },
            lifetimeGiving: wrappedData.lifetimeGiving || 0,
            name: undefined // We don't have the name from URL parameters
          });
          
          setIsLoading(false);
          return; // Exit early since we've set the donor summary
        } catch (err) {
          console.error("Error parsing wrapped donor data:", err);
          // Fall through to fetch from server if parsing fails
        }
      }
      
      // If no wrapped data or parsing failed, fetch from server if we have an email
      // First check if we have a prop email, if not, check sessionStorage
      const emailToUse = donorEmail || storedEmail || '';
      
      if (!emailToUse) {
        console.log("No donor email found (neither in props nor in sessionStorage)");
        setIsLoading(false);
        return;
      }
      
      console.log("Attempting to fetch donor info for email:", emailToUse);

      setIsLoading(true);
      setError(null);

      try {
        // Make sure we have a valid string for the API request
        const donorId = emailToUse.trim();
        if (!donorId) {
          console.log("Empty donor email, skipping API request");
          setIsLoading(false);
          return;
        }
        
        const res = await apiRequest('GET', `/api/donor/${encodeURIComponent(donorId)}`);
        const data = await res.json();

        if (data.donor && data.donations) {
          // Calculate the current year (fiscal year) total
          const now = new Date();
          const currentYear = now.getFullYear();
          const fiscalYearStart = new Date(currentYear, 6, 1); // July 1st
          
          // Adjust fiscal year if we're before July 1st
          const fiscalYear = now < fiscalYearStart ? currentYear - 1 : currentYear;
          
          // Filter donations for the current fiscal year
          const fiscalYearDonations = data.donations.filter((donation: any) => {
            const donationDate = new Date(donation.date);
            const donationFiscalYear = donationDate < new Date(donationDate.getFullYear(), 6, 1) 
              ? donationDate.getFullYear() - 1 
              : donationDate.getFullYear();
            return donationFiscalYear === fiscalYear;
          });

          // Sum the donations for the current fiscal year
          const totalLastYear = fiscalYearDonations.reduce(
            (sum: number, donation: any) => sum + parseFloat(donation.amount), 
            0
          );

          // Sort donations by date (newest first)
          const sortedDonations = [...data.donations].sort(
            (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          // Get the most recent donation
          const lastGift = sortedDonations.length > 0 
            ? {
                amount: parseFloat(sortedDonations[0].amount),
                date: new Date(sortedDonations[0].date).toLocaleDateString()
              }
            : { amount: 0, date: 'N/A' };

          // Sum all donations (lifetime giving)
          const lifetimeGiving = data.donations.reduce(
            (sum: number, donation: any) => sum + parseFloat(donation.amount), 
            0
          );

          setDonorSummary({
            totalLastYear,
            lastGift,
            lifetimeGiving,
            name: data.donor.name || undefined
          });
        }
      } catch (error) {
        console.error('Error fetching donor summary:', error);
        setError('Failed to load your donor information. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDonorSummary();
  }, [donorEmail]); // Only re-run if donorEmail prop changes

  // Use stored firstName from URL parameters if available, otherwise use name from donorSummary
  const storedFirstName = sessionStorage.getItem('donorFirstName');
  const personalizedTitle = storedFirstName 
    ? `Welcome Back, ${storedFirstName}!`
    : donorSummary?.name 
      ? `Welcome Back, ${donorSummary.name.split(' ')[0]}!`
      : "Welcome Back!";

  const donationThisTime = amount > 0 
    ? `Your Most Recent Donation`
    : "";

  return (
    <SlideLayout
      title={personalizedTitle}
      subtitle="Thank you for your continued support"
      variant="donorSummary"
      onNext={onNext}
      onPrevious={onPrevious}
      isFirstSlide={isFirstSlide}
      isLastSlide={isLastSlide}
    >
      <div className="max-w-3xl mx-auto p-4">
        {isLoading ? (
          <motion.div
            className="flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Background soft gradient elements */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute w-96 h-96 bg-green-200/10 rounded-full blur-3xl -top-20 -left-20"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.2, 0.1]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
              <motion.div
                className="absolute w-96 h-96 bg-primary/10 rounded-full blur-3xl -bottom-20 -right-20"
                animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.1, 0.2, 0.1]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 2
                }}
              />
            </div>
            
            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={`loader-particle-${i}`}
                  className="absolute w-1.5 h-1.5 rounded-full bg-primary/30"
                  initial={{ 
                    x: `${Math.random() * 100}%`, 
                    y: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.3 + 0.1,
                    scale: Math.random() * 0.4 + 0.3
                  }}
                  animate={{ 
                    y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                    opacity: [0.1, 0.3, 0.1],
                    scale: [0.3, 0.6, 0.3]
                  }}
                  transition={{ 
                    duration: Math.random() * 5 + 5, 
                    repeat: Infinity, 
                    repeatType: "reverse" 
                  }}
                />
              ))}
            </div>
            
            {/* Fancy loading spinner */}
            <div className="relative mb-8 z-10">
              <motion.div
                className="absolute -inset-4 bg-gradient-to-r from-green-300 to-primary/70 opacity-30 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.3, 0.2]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
              
              <div className="relative">
                {/* Outer rotating ring */}
                <motion.div
                  className="w-28 h-28 rounded-full border-4 border-primary/20 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  {/* Gradient orbs rotating around the circle */}
                  <motion.div
                    className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-400/20"
                    style={{ top: '0', left: '50%', marginLeft: '-8px', marginTop: '-8px' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />
                  
                  <motion.div
                    className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-primary to-blue-500 shadow-lg shadow-primary/20"
                    style={{ bottom: '4px', right: '4px' }}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  />
                  
                  <motion.div
                    className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 shadow-lg shadow-yellow-400/20"
                    style={{ bottom: '4px', left: '4px' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                  
                  {/* Inner spinning loader */}
                  <motion.div
                    className="relative w-20 h-20"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="w-20 h-20 rounded-full border-4 border-primary/10 flex items-center justify-center">
                      <div className="w-20 h-20 border-t-4 border-r-4 border-primary rounded-full absolute top-0 left-0"></div>
                      
                      {/* Center pulsing circle */}
                      <motion.div
                        className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-primary flex items-center justify-center"
                        animate={{
                          scale: [0.8, 1, 0.8],
                          opacity: [0.7, 0.9, 0.7]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      >
                        <Sparkles className="h-5 w-5 text-white" />
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
            
            {/* Loading text with typing effect */}
            <motion.div
              className="text-center relative z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <motion.h3
                className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-primary mb-2"
                animate={{
                  backgroundPosition: ["0% center", "100% center", "0% center"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                style={{ backgroundSize: "200% auto" }}
              >
                Gathering Your Data
              </motion.h3>
              
              <motion.div
                className="flex justify-center items-center space-x-1 mb-1"
              >
                <p className="text-white font-medium">Loading</p>
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={`dot-${i}`}
                    className="h-1.5 w-1.5 rounded-full bg-primary inline-block"
                    animate={{
                      opacity: [0.4, 1, 0.4],
                      scale: [0.8, 1.2, 0.8],
                      y: [0, -3, 0]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "loop",
                      delay: i * 0.2
                    }}
                  />
                ))}
              </motion.div>
              
              <p className="text-gray-200/80 text-sm max-w-xs mx-auto">
                We're personalizing your impact visualization based on your donation history
              </p>
            </motion.div>
          </motion.div>
        ) : error ? (
          <motion.div
            className="max-w-2xl mx-auto my-6 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Animated background particles */}
            <div className="absolute -inset-10 overflow-hidden pointer-events-none z-0">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`error-particle-${i}`}
                  className="absolute w-1 h-1 rounded-full bg-red-300/20"
                  initial={{ 
                    x: `${Math.random() * 100}%`, 
                    y: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.3 + 0.1,
                    scale: Math.random() * 0.4 + 0.3
                  }}
                  animate={{ 
                    y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                    opacity: [0.1, 0.3, 0.1],
                    scale: [0.3, 0.5, 0.3]
                  }}
                  transition={{ 
                    duration: Math.random() * 4 + 5, 
                    repeat: Infinity, 
                    repeatType: "reverse" 
                  }}
                />
              ))}
            </div>
            
            {/* Glowing border effect */}
            <div className="relative">
              <motion.div 
                className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-red-300 to-red-500 opacity-20 blur-md"
                animate={{ 
                  opacity: [0.15, 0.3, 0.15],
                  scale: [0.99, 1.01, 0.99]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
              />
              
              <div className="relative bg-gradient-to-b from-red-50/95 to-white/95 backdrop-blur-md rounded-xl p-8 shadow-xl overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none">
                  <div className="absolute w-60 h-60 -top-20 -left-20 bg-red-500 rounded-full blur-3xl"></div>
                  <div className="absolute w-60 h-60 -bottom-20 -right-20 bg-red-400 rounded-full blur-3xl"></div>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="text-center max-w-lg">
                    {/* Icon with animations */}
                    <motion.div
                      className="relative mx-auto mb-6 inline-block"
                      initial={{ scale: 0, opacity: 0, rotateZ: -20 }}
                      animate={{ scale: 1, opacity: 1, rotateZ: 0 }}
                      transition={{ 
                        delay: 0.2, 
                        duration: 0.5,
                        type: "spring",
                        stiffness: 200
                      }}
                    >
                      {/* Glow effect */}
                      <motion.div
                        className="absolute inset-0 bg-red-400 rounded-full blur-xl opacity-30"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.2, 0.3, 0.2]
                        }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      />
                      <div className="relative z-10 bg-gradient-to-br from-red-100 to-red-200 p-4 rounded-full shadow-lg w-20 h-20 flex items-center justify-center">
                        <motion.div
                          animate={{ 
                            scale: [1, 1.05, 1],
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            repeatType: "reverse" 
                          }}
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth={2} 
                            stroke="currentColor" 
                            className="w-10 h-10 text-red-600"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                          </svg>
                        </motion.div>
                      </div>
                    </motion.div>
                    
                    {/* Text content with animations */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                    >
                      <motion.h3 
                        className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-800"
                        animate={{ 
                          backgroundPosition: ["0% center", "100% center", "0% center"]
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                        style={{ backgroundSize: "200% auto" }}
                      >
                        Oops, We Hit a Snag
                      </motion.h3>
                      
                      <motion.div 
                        className="p-4 mb-6 bg-red-100/80 rounded-lg max-w-md mx-auto"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                      >
                        <p className="text-red-700">
                          {error}
                        </p>
                      </motion.div>
                      
                      <motion.p 
                        className="text-slate-600 mb-8 max-w-md mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                      >
                        Don't worry! You can still explore the impact of your donation. Let's continue to the visualization.
                      </motion.p>
                      
                      {/* Button with animated effects */}
                      <motion.div
                        className="relative inline-block"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9, duration: 0.5 }}
                      >
                        <motion.div
                          className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-green-500 opacity-70 blur-sm"
                          animate={{ 
                            scale: [0.98, 1.01, 0.98],
                            opacity: [0.5, 0.7, 0.5]
                          }}
                          transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                        />
                        <motion.div
                          whileHover={{ 
                            scale: 1.05,
                            transition: { duration: 0.2 }
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button 
                            onClick={onNext}
                            size="lg" 
                            className="relative bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-500 text-white font-bold px-8 py-3 rounded-full shadow-lg transition-colors"
                          >
                            Continue to Visualization
                          </Button>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : donorSummary ? (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Floating sparkles background effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ 
                    x: `${Math.random() * 100}%`, 
                    y: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.5 + 0.3,
                    scale: Math.random() * 0.5 + 0.5
                  }}
                  animate={{ 
                    y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                    opacity: [Math.random() * 0.3 + 0.2, Math.random() * 0.5 + 0.3],
                    scale: [Math.random() * 0.3 + 0.3, Math.random() * 0.5 + 0.5]
                  }}
                  transition={{ 
                    duration: Math.random() * 10 + 10, 
                    repeat: Infinity, 
                    repeatType: "reverse" 
                  }}
                >
                  <Sparkles className="h-3 w-3 text-yellow-300/30" />
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              className="text-center mb-8 relative"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7 }}
                className="relative inline-block mb-3"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-xl opacity-20"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.3, 0.2]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
                <div className="relative z-10 bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-full">
                  <Heart className="h-8 w-8 text-green-600" />
                </div>
              </motion.div>
              
              <motion.h3 
                className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-500"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Your Giving Journey
              </motion.h3>
              
              {donationThisTime && (
                <motion.div
                  className="relative mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-500/20 rounded-full blur-md"
                    animate={{ 
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                  <motion.p 
                    className="relative z-10 text-xl font-semibold text-green-700 bg-gradient-to-r from-green-50 to-emerald-50 inline-block px-5 py-2 rounded-full shadow-md"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <motion.span
                      className="inline-flex items-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Gift className="inline-block mr-2 h-5 w-5 text-green-600" />
                      Your Most Recent Donation: $<CountUpAnimation 
                        value={amount}
                        className="ml-1 font-semibold"
                        delay={0.3}
                      />
                    </motion.span>
                  </motion.p>
                </motion.div>
              )}
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2 my-8">
              {/* Card 1: Estimated Meals */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.2 }
                }}
              >
                <div className="relative">
                  {/* Glowing effect behind card */}
                  <motion.div 
                    className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-green-300 to-emerald-500 opacity-30 blur-sm"
                    animate={{ 
                      opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      repeatType: "reverse" 
                    }}
                  />
                  
                  <Card className="overflow-hidden shadow-xl border-0 relative bg-white/95 backdrop-blur-sm rounded-xl">
                    {/* Decorative sparkles */}
                    <div className="absolute top-2 right-2 text-yellow-300/30">
                      <motion.div
                        animate={{ 
                          rotate: [0, 15, 0, -15, 0],
                          scale: [1, 1.1, 1, 1.1, 1],
                        }}
                        transition={{ 
                          duration: 6, 
                          repeat: Infinity,
                          repeatType: "reverse" 
                        }}
                      >
                        <Sparkles className="h-4 w-4" />
                      </motion.div>
                    </div>
                    
                    <CardHeader className="bg-gradient-to-r from-green-100/80 to-emerald-100/80 pb-4 pt-6">
                      <div className="mx-auto -mt-8 mb-1 bg-gradient-to-br from-green-200 to-green-300 p-3 rounded-full shadow-md w-14 h-14 flex items-center justify-center">
                        <motion.div
                          animate={{ 
                            rotate: [0, 10, 0, -10, 0],
                          }}
                          transition={{ 
                            duration: 5, 
                            repeat: Infinity,
                            repeatType: "reverse" 
                          }}
                        >
                          <Heart className="h-7 w-7 text-green-800" />
                        </motion.div>
                      </div>
                      <CardTitle className="text-center text-lg font-bold text-green-800">
                        Estimated Meals
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="p-8 text-center relative bg-gradient-to-b from-white to-green-50/50 min-h-[200px] flex flex-col justify-center">
                      <motion.div
                        className="mb-1"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ 
                          delay: 0.5, 
                          duration: 0.5,
                          type: "spring",
                          stiffness: 200
                        }}
                      >
                        <div className="flex items-center justify-center">
                          <CountUpAnimation 
                            value={impact.mealsProvided}
                            className="text-4xl font-bold text-primary"
                          />
                          <span className="ml-1 text-sm text-primary font-medium self-start mt-2">meals</span>
                        </div>
                      </motion.div>
                      
                      <motion.p 
                        className="text-sm text-gray-600 font-medium mt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                      >
                        From your most recent gift
                      </motion.p>
                      
                      {/* Corner decoration */}
                      <div className="absolute -bottom-3 -right-3 w-20 h-20 opacity-5">
                        <BarChart3 className="w-full h-full" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>

              {/* Card 2: Most Recent Gift */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.2 }
                }}
              >
                <div className="relative">
                  {/* Glowing effect behind card */}
                  <motion.div 
                    className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-teal-300 to-emerald-500 opacity-30 blur-sm"
                    animate={{ 
                      opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      repeatType: "reverse", 
                      delay: 0.5
                    }}
                  />
                  
                  <Card className="overflow-hidden shadow-xl border-0 relative bg-white/95 backdrop-blur-sm rounded-xl">
                    {/* Decorative sparkles */}
                    <div className="absolute top-2 right-2 text-yellow-300/30">
                      <motion.div
                        animate={{ 
                          rotate: [0, 15, 0, -15, 0],
                          scale: [1, 1.1, 1, 1.1, 1],
                        }}
                        transition={{ 
                          duration: 5, 
                          repeat: Infinity,
                          repeatType: "reverse",
                          delay: 0.2
                        }}
                      >
                        <Sparkles className="h-4 w-4" />
                      </motion.div>
                    </div>
                    
                    <CardHeader className="bg-gradient-to-r from-teal-100/80 to-emerald-100/80 pb-4 pt-6">
                      <div className="mx-auto -mt-8 mb-1 bg-gradient-to-br from-teal-200 to-teal-300 p-3 rounded-full shadow-md w-14 h-14 flex items-center justify-center">
                        <motion.div
                          animate={{ 
                            rotate: [0, 10, 0, -10, 0],
                            scale: [1, 1.1, 1, 1.1, 1],
                          }}
                          transition={{ 
                            duration: 4, 
                            repeat: Infinity,
                            repeatType: "reverse" 
                          }}
                        >
                          <Users className="h-7 w-7 text-teal-800" />
                        </motion.div>
                      </div>
                      <CardTitle className="text-center text-lg font-bold text-teal-800">
                        People Helped
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="p-8 text-center relative bg-gradient-to-b from-white to-teal-50/50 min-h-[200px] flex flex-col justify-center">
                      <motion.div
                        className="mb-1"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ 
                          delay: 0.6, 
                          duration: 0.5,
                          type: "spring",
                          stiffness: 200
                        }}
                      >
                        <div className="flex items-center justify-center">
                          <CountUpAnimation 
                            value={impact.peopleServed}
                            className="text-4xl font-bold text-teal-600"
                            delay={0.2}
                          />
                          <span className="ml-1 text-sm text-teal-600 font-medium self-start mt-2">people</span>
                        </div>
                      </motion.div>
                      
                      <motion.p 
                        className="text-sm text-gray-600 font-medium mt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                      >
                        Will receive food from your gift
                      </motion.p>
                      
                      {/* Corner decoration */}
                      <div className="absolute -bottom-3 -right-3 w-20 h-20 opacity-5">
                        <Gift className="w-full h-full" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>

              {/* Card 3: Lifetime Impact */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.2 }
                }}
              >
                <div className="relative">
                  {/* Glowing effect behind card */}
                  <motion.div 
                    className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-indigo-300 to-primary opacity-30 blur-sm"
                    animate={{ 
                      opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ 
                      duration: 3.5, 
                      repeat: Infinity,
                      repeatType: "reverse", 
                      delay: 1
                    }}
                  />
                  
                  <Card className="overflow-hidden shadow-xl border-0 relative bg-white/95 backdrop-blur-sm rounded-xl">
                    {/* Decorative sparkles */}
                    <div className="absolute top-2 right-2 text-yellow-300/30">
                      <motion.div
                        animate={{ 
                          rotate: [0, 15, 0, -15, 0],
                          scale: [1, 1.1, 1, 1.1, 1],
                        }}
                        transition={{ 
                          duration: 5.5, 
                          repeat: Infinity,
                          repeatType: "reverse",
                          delay: 0.4
                        }}
                      >
                        <Sparkles className="h-4 w-4" />
                      </motion.div>
                    </div>
                    
                    <CardHeader className="bg-gradient-to-r from-indigo-100/80 to-primary/20 pb-4 pt-6">
                      <div className="mx-auto -mt-8 mb-1 bg-gradient-to-br from-indigo-200 to-indigo-300 p-3 rounded-full shadow-md w-14 h-14 flex items-center justify-center">
                        <motion.div
                          animate={{ 
                            rotate: [0, 10, 0, -10, 0],
                            scale: [1, 1.1, 1, 1.1, 1],
                          }}
                          transition={{ 
                            duration: 4.5, 
                            repeat: Infinity,
                            repeatType: "reverse" 
                          }}
                        >
                          <ShoppingBasket className="h-7 w-7 text-indigo-800" />
                        </motion.div>
                      </div>
                      <CardTitle className="text-center text-lg font-bold text-indigo-800">
                        Food Rescue
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="p-8 text-center relative bg-gradient-to-b from-white to-indigo-50/50 min-h-[200px] flex flex-col justify-center">
                      <motion.div
                        className="mb-1 relative"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ 
                          delay: 0.7, 
                          duration: 0.5,
                          type: "spring",
                          stiffness: 200
                        }}
                      >
                        {/* Subtle pulse effect around the number */}
                        <motion.div
                          className="absolute inset-0 rounded-full blur-md opacity-20 bg-indigo-400"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.1, 0.2, 0.1]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                        />
                        <div className="flex items-center justify-center relative z-10">
                          <CountUpAnimation 
                            value={impact.foodRescued}
                            className="text-4xl font-bold text-indigo-600"
                            delay={0.4}
                          />
                          <span className="ml-1 text-sm text-indigo-600 font-medium self-start mt-2">lbs</span>
                        </div>
                      </motion.div>
                      
                      <motion.p 
                        className="text-sm text-gray-600 font-medium mt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                      >
                        Pounds of food rescued
                      </motion.p>
                      
                      {/* Corner decoration */}
                      <div className="absolute -bottom-3 -right-3 w-20 h-20 opacity-5">
                        <ShoppingBasket className="w-full h-full" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-12 mb-4"
            >
              <div className="relative">
                {/* Animated ornamental separator */}
                <div className="flex items-center justify-center my-6">
                  <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                  <motion.div 
                    className="mx-2"
                    animate={{
                      rotate: 360
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-emerald-400 to-primary"></div>
                  </motion.div>
                  <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                </div>
                
                {/* Background decorative elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                  {/* Floating particles */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={`particle-${i}`}
                      className="absolute w-2 h-2 rounded-full bg-primary/10"
                      initial={{ 
                        x: `${Math.random() * 100}%`, 
                        y: `${Math.random() * 100}%`,
                        opacity: 0.3,
                        scale: Math.random() * 0.5 + 0.5
                      }}
                      animate={{ 
                        y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                        opacity: [0.2, 0.5, 0.2],
                        scale: [Math.random() * 0.3 + 0.3, Math.random() * 0.6 + 0.5]
                      }}
                      transition={{ 
                        duration: Math.random() * 5 + 10, 
                        repeat: Infinity, 
                        repeatType: "reverse" 
                      }}
                    />
                  ))}
                </div>
                
                {/* Main content box with gradient border */}
                <div className="relative z-10">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-green-300 via-primary to-indigo-400 opacity-20 blur-lg"></div>
                  <div className="relative bg-gradient-to-b from-white/95 to-white/90 backdrop-blur-md rounded-xl p-8 shadow-xl overflow-hidden">
                    {/* Decorative diagonal lines */}
                    <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none">
                      {[...Array(10)].map((_, i) => (
                        <div 
                          key={`line-${i}`}
                          className="absolute h-px w-full bg-primary"
                          style={{ 
                            top: `${i * 10}%`, 
                            transform: 'rotate(45deg)',
                            transformOrigin: 'left',
                            left: '0',
                          }}
                        />
                      ))}
                    </div>
                    
                    {/* Icon header */}
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1, duration: 0.5 }}
                      className="relative inline-block mb-4"
                    >
                      {/* Glow behind icon */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-green-400 to-primary rounded-full blur-md opacity-40"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      />
                      <div className="relative z-10 bg-gradient-to-br from-emerald-50 to-emerald-200 p-4 rounded-full shadow-lg">
                        <motion.div
                          animate={{ rotate: [-5, 5, -5] }}
                          transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                        >
                          <TrendingUp className="h-8 w-8 text-primary" />
                        </motion.div>
                      </div>
                    </motion.div>
                    
                    {/* Text content */}
                    <motion.h3 
                      className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-700 to-primary"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.1, duration: 0.5 }}
                    >
                      Ready to See Your Impact!
                    </motion.h3>
                    
                    <motion.p 
                      className="text-gray-700 mb-8 max-w-xl mx-auto text-lg font-medium"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2, duration: 0.5 }}
                    >
                      Your generosity is making a real difference in our community. Let's explore how your current donation of <span className="font-bold text-primary inline-block text-xl">
                        $<CountUpAnimation 
                          value={amount}
                          className="font-bold text-primary"
                          delay={1.2}
                        />
                      </span> will transform lives and nourish our neighbors.
                    </motion.p>
                    
                    {/* Button with special effects */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.3, duration: 0.5 }}
                      className="relative"
                    >
                      <motion.div
                        className="absolute -inset-1 rounded-full bg-gradient-to-r from-green-400 to-primary opacity-70 blur-md"
                        animate={{ 
                          scale: [0.98, 1.01, 0.98],
                          opacity: [0.5, 0.7, 0.5]
                        }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      />
                      <motion.div
                        className="relative"
                        whileHover={{ 
                          scale: 1.05,
                          transition: { 
                            duration: 0.2,
                            type: "spring",
                            stiffness: 300
                          }
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          onClick={onNext} 
                          size="lg" 
                          className="bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-500 text-white shadow-lg font-bold py-3 px-6 rounded-full transition-all duration-300"
                        >
                          <Sparkles className="mr-2 h-5 w-5" />
                          Explore Your Impact
                        </Button>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            className="relative max-w-2xl mx-auto my-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Background decorative elements */}
            <div className="absolute -inset-20 overflow-hidden pointer-events-none z-0">
              {/* Floating sparkles */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ 
                    x: `${Math.random() * 100}%`, 
                    y: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.3 + 0.1,
                    scale: Math.random() * 0.4 + 0.3
                  }}
                  animate={{ 
                    y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                    opacity: [Math.random() * 0.2, Math.random() * 0.4, Math.random() * 0.2],
                    scale: [Math.random() * 0.3 + 0.2, Math.random() * 0.5 + 0.3]
                  }}
                  transition={{ 
                    duration: Math.random() * 8 + 6, 
                    repeat: Infinity, 
                    repeatType: "reverse" 
                  }}
                >
                  <Sparkles className="h-3 w-3 text-blue-300/40" />
                </motion.div>
              ))}
            </div>
            
            {/* Card with glowing border */}
            <div className="relative">
              <motion.div 
                className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-blue-300 via-primary to-indigo-500 opacity-30 blur-lg"
                animate={{ 
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
              />
              <div className="relative bg-gradient-to-b from-blue-800/95 to-indigo-900/95 backdrop-blur-sm rounded-xl p-10 shadow-2xl overflow-hidden text-center">
                {/* Decorative patterns */}
                <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
                  <div className="absolute w-96 h-96 -top-48 -left-48 bg-blue-400 rounded-full blur-3xl"></div>
                  <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-indigo-400 rounded-full blur-3xl"></div>
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={`circle-${i}`}
                      className="absolute w-20 h-20 rounded-full border border-white/10"
                      style={{ 
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        opacity: Math.random() * 0.5,
                      }}
                    />
                  ))}
                </div>
                
                {/* Welcome icon with animation */}
                <motion.div
                  className="relative mb-6 inline-block"
                  initial={{ scale: 0, opacity: 0, rotateY: 180 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                  transition={{ 
                    delay: 0.2, 
                    duration: 0.6,
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  {/* Icon glow effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur-md opacity-50"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.4, 0.6, 0.4]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                  <div className="relative z-10 bg-gradient-to-br from-blue-400 to-indigo-500 p-5 rounded-full shadow-lg">
                    <motion.div
                      animate={{ 
                        rotate: [0, 5, 0, -5, 0],
                      }}
                      transition={{ 
                        duration: 6, 
                        repeat: Infinity,
                        repeatType: "reverse" 
                      }}
                    >
                      <Users className="h-10 w-10 text-white" />
                    </motion.div>
                  </div>
                </motion.div>
                
                {/* Welcome text with animations */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <h2 className="text-3xl font-bold mb-4 text-white">
                      Welcome to Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-200">Community</span>!
                    </h2>
                  </motion.div>
                  
                  <motion.p 
                    className="text-blue-100/90 mb-8 max-w-lg mx-auto text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    We're thrilled to welcome you as a new donor! Your generosity of <span className="font-bold text-white inline-block">
                      $<CountUpAnimation 
                        value={amount}
                        className="font-bold text-white"
                        delay={0.8}
                      />
                    </span> will make a meaningful impact in our community.
                  </motion.p>
                  
                  {/* Button with shining animation */}
                  <motion.div
                    className="relative mt-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    <motion.div
                      className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-blue-400 via-primary/80 to-indigo-500 opacity-70 blur-md"
                      animate={{ 
                        scale: [0.98, 1.01, 0.98],
                        opacity: [0.5, 0.7, 0.5]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    />
                    
                    {/* Shining effect across button */}
                    <div className="relative overflow-hidden rounded-full">
                      <motion.div
                        className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-30 -translate-x-full"
                        animate={{
                          translateX: ["calc(-100%)", "calc(300%)"]
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          repeatDelay: 3
                        }}
                      />
                      <motion.div
                        whileHover={{ 
                          scale: 1.05,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          onClick={onNext}
                          size="lg" 
                          className="relative z-10 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold px-8 py-3 rounded-full shadow-xl border border-white/10"
                        >
                          <Sparkles className="mr-2 h-5 w-5" />
                          Discover Your Impact
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </SlideLayout>
  );
}