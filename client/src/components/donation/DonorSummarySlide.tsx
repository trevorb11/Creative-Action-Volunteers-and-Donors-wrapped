import { useEffect, useState, useRef } from "react";
import { DonationImpact } from "@shared/schema";
import SlideLayout from "./SlideLayout";
import { formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { TrendingUp, Heart, Calendar, Award, Gift } from "lucide-react";

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
      if (!donorEmail) return;

      setIsLoading(true);
      setError(null);

      try {
        const res = await apiRequest('GET', `/api/donor/${encodeURIComponent(donorEmail)}`);
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
  }, [donorEmail]);

  const personalizedTitle = donorSummary?.name 
    ? `Welcome Back, ${donorSummary.name.split(' ')[0]}!`
    : "Welcome Back!";

  const donationThisTime = amount > 0 
    ? `Your Donation Today: ${formatCurrency(amount)}`
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
            className="flex flex-col items-center justify-center min-h-[300px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="relative"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-20 h-20 border-4 border-primary/20 rounded-full"></div>
              <div className="w-20 h-20 border-t-4 border-l-4 border-primary rounded-full absolute top-0 left-0"></div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <p className="mt-6 text-gray-100 font-medium text-lg">Gathering your donation data...</p>
              <p className="text-gray-200/70 text-sm">This will just take a moment</p>
            </motion.div>
          </motion.div>
        ) : error ? (
          <motion.div 
            className="text-center p-8 bg-red-50/90 backdrop-blur-sm rounded-xl shadow-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-red-100 rounded-full p-3 inline-block mb-4"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor" 
                className="w-8 h-8 text-red-600"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </motion.div>
            <h3 className="text-xl font-semibold text-red-800 mb-2">Oops, We Hit a Snag</h3>
            <p className="text-red-700 mb-6">{error}</p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                className="mt-4 bg-primary text-white hover:bg-primary/90" 
                onClick={onNext}
              >
                Continue to Impact Visualization
              </Button>
            </motion.div>
          </motion.div>
        ) : donorSummary ? (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="text-center mb-8"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7 }}
                className="inline-block bg-green-100 p-3 rounded-full mb-3"
              >
                <Heart className="h-8 w-8 text-green-600" />
              </motion.div>
              <h3 className="text-2xl font-bold text-primary">Your Giving Journey</h3>
              {donationThisTime && (
                <motion.p 
                  className="text-xl mt-2 font-semibold text-green-700 bg-green-50 inline-block px-4 py-1 rounded-full shadow-sm"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <Gift className="inline-block mr-2 h-5 w-5" />
                  {donationThisTime}
                </motion.p>
              )}
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <Card className="overflow-hidden shadow-lg border-t-4 border-primary hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                    <CardTitle className="text-center text-lg flex items-center justify-center">
                      <Calendar className="mr-2 h-5 w-5 text-primary" />
                      Fiscal Year Giving
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 text-center relative">
                    <motion.p 
                      className="text-3xl font-bold text-primary"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      {formatCurrency(donorSummary.totalLastYear)}
                    </motion.p>
                    <p className="text-sm text-gray-500 mt-2">Total donations this fiscal year</p>
                    <div className="absolute -bottom-1 -right-1 w-16 h-16 opacity-10">
                      <Calendar className="w-full h-full text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Card className="overflow-hidden shadow-lg border-t-4 border-primary hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                    <CardTitle className="text-center text-lg flex items-center justify-center">
                      <Gift className="mr-2 h-5 w-5 text-primary" />
                      Most Recent Gift
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 text-center relative">
                    <motion.p 
                      className="text-3xl font-bold text-primary"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    >
                      {formatCurrency(donorSummary.lastGift.amount)}
                    </motion.p>
                    <p className="text-sm text-gray-500 mt-2">on {donorSummary.lastGift.date}</p>
                    <div className="absolute -bottom-1 -right-1 w-16 h-16 opacity-10">
                      <Gift className="w-full h-full text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Card className="overflow-hidden shadow-lg border-t-4 border-primary hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                    <CardTitle className="text-center text-lg flex items-center justify-center">
                      <Award className="mr-2 h-5 w-5 text-primary" />
                      Lifetime Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 text-center relative">
                    <motion.p 
                      className="text-3xl font-bold text-primary"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                    >
                      {formatCurrency(donorSummary.lifetimeGiving)}
                    </motion.p>
                    <p className="text-sm text-gray-500 mt-2">Total impact on our community</p>
                    <div className="absolute -bottom-1 -right-1 w-16 h-16 opacity-10">
                      <Award className="w-full h-full text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Separator className="my-8" />

              <div className="text-center bg-white/30 backdrop-blur-sm rounded-xl p-6 shadow-sm">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="inline-block bg-primary/10 p-3 rounded-full mb-3"
                >
                  <TrendingUp className="h-7 w-7 text-primary" />
                </motion.div>
                <h3 className="text-xl font-bold mb-4">Let's See Your Impact!</h3>
                <p className="text-gray-700 mb-6">
                  Your support has created a lasting difference in our community. Ready to see the impact of your current donation?
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={onNext} 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-white shadow-lg transition-all duration-300"
                  >
                    Explore Your Impact
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            className="text-center p-8 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-blue-100 rounded-full p-3 inline-block mb-4"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor" 
                className="w-8 h-8 text-blue-600"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </motion.div>
            <h3 className="text-xl font-semibold text-white mb-2">Welcome, New Friend!</h3>
            <p className="text-white/90 mb-6">
              We don't have any previous donation records for this email.
              Let's explore the impact your donation will make!
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                className="mt-4 bg-primary text-white hover:bg-primary/90 shadow-lg" 
                onClick={onNext}
                size="lg"
              >
                See Your Impact
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </SlideLayout>
  );
}