import { useEffect, useState } from "react";
import { DonationImpact } from "@/types/donation";
import SlideLayout from "./SlideLayout";
import { formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  Clock,
  Calendar,
  History,
  Timer,
  Award,
  Medal,
  Trophy,
  Star,
  Heart,
  Sparkles,
  Hourglass,
  Rocket,
  Gift
} from "lucide-react";
import CountUpAnimation from "./CountUpAnimation";

interface TimeGivingSlideProps {
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
  firstGiftDate?: string;
  consecutiveYearsGiving?: number;
}

export default function TimeGivingSlide({
  impact,
  donorEmail,
  amount,
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide,
}: TimeGivingSlideProps) {
  const [donorSummary, setDonorSummary] = useState<DonorSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [donorFirstName, setDonorFirstName] = useState<string | null>(null);
  const [fiscalYearGiving, setFiscalYearGiving] = useState<{
    fy22?: number;
    fy23?: number;
    fy24?: number;
    fy25?: number;
  }>({});
  
  // Get donor firstName and fiscal year giving data from session storage if available
  useEffect(() => {
    // Get firstName from session storage
    const storedFirstName = sessionStorage.getItem('donorFirstName');
    if (storedFirstName) {
      setDonorFirstName(storedFirstName);
      console.log("Retrieved donor first name from session storage:", storedFirstName);
    }
    
    // Get fiscal year giving data from URL parameters or session storage
    const urlParams = new URLSearchParams(window.location.search);
    const donorParams = sessionStorage.getItem('donorParams');
    const parsedParams = donorParams ? JSON.parse(donorParams) : {};
    
    // Look for fiscal year parameters in URL or session storage
    const getFYValue = (year: string): number | undefined => {
      const urlValue = urlParams.get(`giving${year.toUpperCase()}`);
      if (urlValue && urlValue !== `*|GIVING${year.toUpperCase()}|*`) {
        return parseFloat(urlValue);
      }
      
      const sessionValue = parsedParams[`giving${year.toUpperCase()}`];
      if (sessionValue && sessionValue !== `*|GIVING${year.toUpperCase()}|*`) {
        return parseFloat(sessionValue);
      }
      
      return undefined;
    };
    
    // Get values for each fiscal year
    const fy22 = getFYValue('fy22');
    const fy23 = getFYValue('fy23');
    const fy24 = getFYValue('fy24');
    const fy25 = getFYValue('fy25');
    
    // Set fiscal year giving data if any values are present
    if (fy22 || fy23 || fy24 || fy25) {
      const fyData = { fy22, fy23, fy24, fy25 };
      setFiscalYearGiving(fyData);
      console.log("Retrieved fiscal year giving data:", fyData);
    }
  }, []);

  useEffect(() => {
    async function fetchDonorSummary() {
      // First check if we have wrapped donor data in sessionStorage
      const wrappedDataStr = sessionStorage.getItem("wrappedDonorData");
      const donorParams = sessionStorage.getItem("donorParams");
      const storedEmail = sessionStorage.getItem("donorEmail");

      console.log("YourGivingJourney - Checking storage:", {
        hasWrappedData: !!wrappedDataStr,
        hasParams: !!donorParams,
        hasStoredEmail: !!storedEmail,
        propEmail: donorEmail,
      });

      if (wrappedDataStr) {
        try {
          const wrappedData = JSON.parse(wrappedDataStr);
          console.log("Using wrapped donor data from sessionStorage:", wrappedData);

          // Format the date for display
          let formattedDate = "N/A";
          if (wrappedData.lastGiftDate) {
            try {
              formattedDate = new Date(wrappedData.lastGiftDate).toLocaleDateString();
            } catch (e) {
              console.warn("Date formatting error:", e);
              formattedDate = wrappedData.lastGiftDate; // Use as string if parsing fails
            }
          }

          // Extract consecutive years giving from params
          let consecutiveYearsGiving = 0;
          if (donorParams) {
            try {
              const params = JSON.parse(donorParams);
              if (params.consecutiveYearsGiving) {
                consecutiveYearsGiving = parseInt(params.consecutiveYearsGiving, 10);
              }
            } catch (err) {
              console.error("Error parsing donor parameters:", err);
            }
          }

          setDonorSummary({
            totalLastYear: 0, // Not needed for this slide
            lastGift: {
              amount: wrappedData.lastGiftAmount || 0,
              date: formattedDate,
            },
            lifetimeGiving: wrappedData.lifetimeGiving || 0,
            name: undefined, // We don't have the name from URL parameters
            firstGiftDate: wrappedData.firstGiftDate || "",
            consecutiveYearsGiving,
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
      const emailToUse = donorEmail || storedEmail || "";

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

        const res = await apiRequest("GET", `/api/donor/${encodeURIComponent(donorId)}`);
        const data = await res.json();

        if (data.donor && data.donations) {
          // Sort donations by date (oldest first for first gift date)
          const sortedDonations = [...data.donations].sort(
            (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

          // Get the most recent donation
          const lastDonations = [...data.donations].sort(
            (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          
          const lastGift = lastDonations.length > 0
            ? {
                amount: parseFloat(lastDonations[0].amount),
                date: new Date(lastDonations[0].date).toLocaleDateString(),
              }
            : { amount: 0, date: "N/A" };

          // Sum all donations (lifetime giving)
          const lifetimeGiving = data.donations.reduce(
            (sum: number, donation: any) => sum + parseFloat(donation.amount),
            0
          );

          // Get first gift date
          let firstGiftDate = "";
          if (sortedDonations.length > 0) {
            const oldestDonation = sortedDonations[0];
            firstGiftDate = oldestDonation ? oldestDonation.date : "";
          }

          // Calculate consecutive years giving (this would require more logic in a real app)
          // For now, let's assume we have this information from the server
          const consecutiveYearsGiving = data.donor.consecutiveYearsGiving || 1;

          setDonorSummary({
            totalLastYear: 0, // Not used in this component
            lastGift,
            lifetimeGiving,
            name: data.donor.name || undefined,
            firstGiftDate,
            consecutiveYearsGiving,
          });
        }
      } catch (error) {
        console.error("Error fetching donor summary:", error);
        setError("Failed to load your donor information. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDonorSummary();
  }, [donorEmail]); // Only re-run if donorEmail prop changes

  // Get the number of years they've been giving
  const getYearsGiving = (): number => {
    if (donorSummary?.consecutiveYearsGiving) {
      return donorSummary.consecutiveYearsGiving;
    }
    
    if (donorSummary?.firstGiftDate) {
      const giftDate = new Date(donorSummary.firstGiftDate);
      const now = new Date();
      let years = now.getFullYear() - giftDate.getFullYear();

      // Check if we've reached the anniversary date this year
      const currentMonth = now.getMonth();
      const currentDay = now.getDate();
      const giftMonth = giftDate.getMonth();
      const giftDay = giftDate.getDate();

      // If we haven't reached their anniversary yet this year, subtract 1
      if (currentMonth < giftMonth || (currentMonth === giftMonth && currentDay < giftDay)) {
        years -= 1;
      }

      return years;
    }
    
    return 0;
  };

  // Generate milestone emoji & icon based on years giving
  const getMilestoneIcon = () => {
    const years = getYearsGiving();
    
    if (years <= 0) return { icon: Rocket, color: "text-blue-500", emoji: "🚀" };
    if (years === 1) return { icon: Star, color: "text-yellow-500", emoji: "⭐" };
    if (years === 2) return { icon: Award, color: "text-emerald-500", emoji: "🌱" };
    if (years === 3) return { icon: Medal, color: "text-amber-500", emoji: "🎖️" };
    if (years === 4) return { icon: Heart, color: "text-rose-500", emoji: "❤️" };
    if (years >= 5 && years < 10) return { icon: Trophy, color: "text-indigo-500", emoji: "🏆" };
    return { icon: Sparkles, color: "text-purple-500", emoji: "✨" };
  };

  // Generate a personalized message based on years of giving and first name if available
  const getGivingJourneyMessage = (): { title: string; message: string; funFact: string } => {
    const years = getYearsGiving();
    const milestone = getMilestoneIcon();
    const namePrefix = donorFirstName ? `${donorFirstName}, ` : "";
    
    if (years <= 0) {
      return {
        title: `${milestone.emoji} ${namePrefix}Welcome to the Creative Action Family!`,
        message: "You're just beginning your creative journey with us. Your support will help ensure arts education reaches students who need it most.",
        funFact: "Did you know? First-time donors like you help us expand our creative programs to more students every year!"
      };
    } else if (years === 1) {
      return {
        title: `${milestone.emoji} ${namePrefix}One Year of Inspiring Creativity`,
        message: "You've completed your first year with us! In just 12 months, you've already made a significant difference by helping provide arts education to students who need it most.",
        funFact: "Fun fact: In your first year of giving, you've joined thousands of other one-year donors who collectively help us reach over 15,000 students annually!"
      };
    } else if (years === 2) {
      return {
        title: `${milestone.emoji} ${namePrefix}Two Years of Growing Impact`,
        message: "Two years in, and your commitment to arts education is growing stronger. Your continued support means more students have reliable access to creative learning opportunities.",
        funFact: "Did you know? Second-year donors like you have a 70% higher impact than first-time donors because you understand where help is needed most!"
      };
    } else if (years === 3) {
      return {
        title: `${milestone.emoji} ${namePrefix}Three Years of Dedicated Support`,
        message: "Three years of consistent support makes you a veteran arts advocate! Your commitment is helping build a more creative community with sustainable arts education.",
        funFact: "Fun fact: Three-year donors like you make up just 15% of our donor base but contribute nearly 40% of our annual donation revenue!"
      };
    } else if (years === 4) {
      return {
        title: `${milestone.emoji} ${namePrefix}Four Years of Transformative Giving`,
        message: "Your support over four years is like fertile soil for our community—nurturing creativity and resilience through continued arts programs. That's something to celebrate!",
        funFact: "Amazing! At four years of giving, you've likely helped provide arts education to over 500 students through our programs!"
      };
    } else if (years >= 5 && years < 10) {
      return {
        title: `${milestone.emoji} ${namePrefix}${years} Years as a Creative Arts Champion`,
        message: `For ${years} years, you've been a cornerstone of our arts education efforts. Your long-term commitment means creative opportunities for thousands of students in our community.`,
        funFact: `Incredible! Donors who have given for ${years} years are among our most valued supporters, with a deep understanding of arts education challenges and opportunities.`
      };
    } else {
      return {
        title: `${milestone.emoji} ${namePrefix}A Decade+ of Extraordinary Impact`,
        message: `After an incredible ${years} years of support, you're truly a pillar of our mission. Your extraordinary commitment has helped countless students discover the power of creative expression.`,
        funFact: `Remarkable! Less than 3% of our donors have supported us for ${years}+ years, placing you among our most loyal and dedicated arts education champions!`
      };
    }
  };

  const givingJourneyMessage = getGivingJourneyMessage();
  const milestone = getMilestoneIcon();
  const MilestoneIcon = milestone.icon;
  const years = getYearsGiving();

  // Calculate journey stats based on actual fiscal year giving data if available
  const getJourneyStats = () => {
    // Calculate total from fiscal year giving data
    let totalFromFiscalYears = 0;
    let yearCount = 0;
    
    if (fiscalYearGiving.fy22 !== undefined && fiscalYearGiving.fy22 > 0) {
      totalFromFiscalYears += fiscalYearGiving.fy22;
      yearCount++;
    }
    
    if (fiscalYearGiving.fy23 !== undefined && fiscalYearGiving.fy23 > 0) {
      totalFromFiscalYears += fiscalYearGiving.fy23;
      yearCount++;
    }
    
    if (fiscalYearGiving.fy24 !== undefined && fiscalYearGiving.fy24 > 0) {
      totalFromFiscalYears += fiscalYearGiving.fy24;
      yearCount++;
    }
    
    if (fiscalYearGiving.fy25 !== undefined && fiscalYearGiving.fy25 > 0) {
      totalFromFiscalYears += fiscalYearGiving.fy25;
      yearCount++;
    }
    
    // Use actual data if available, otherwise fallback to estimates
    const actualYears = yearCount > 0 ? yearCount : years;
    const lifetimeAmount = totalFromFiscalYears > 0 ? totalFromFiscalYears : (donorSummary?.lifetimeGiving || 0);
    
    // Calculate estimates based on actual data when available
    const studentsPerDollar = 0.5; // Each dollar helps reach approximately 0.5 students
    const estimatedStudentsReached = Math.round(lifetimeAmount * studentsPerDollar);
    const estimatedTeachingArtistsSupported = Math.round(estimatedStudentsReached / 30); // Assume each teaching artist reaches 30 students
    const estimatedPrograms = Math.max(Math.round(lifetimeAmount / 1000), 1); // Estimate number of programs supported
    const estimatedCreativeHours = Math.max(actualYears * 10, 10); // Estimate creative hours enabled
    
    return {
      studentsReached: estimatedStudentsReached,
      teachingArtistsSupported: estimatedTeachingArtistsSupported,
      programs: estimatedPrograms,
      creativeHours: estimatedCreativeHours,
      totalGiving: lifetimeAmount,
      years: actualYears
    };
  };
  
  const journeyStats = getJourneyStats();

  return (
    <SlideLayout
      title="Your Time-Giving Journey"
      titleClassName="text-white" // Make title white
      subtitle="A look at your impact over time"
      variant="nutrition" // Keeping the same variant for styling consistency
      onNext={onNext}
      onPrevious={onPrevious}
      isFirstSlide={isFirstSlide}
      isLastSlide={isLastSlide}
    >
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        {isLoading ? (
          <div className="text-center p-4 sm:p-6 md:p-8">
            <div className="animate-spin h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3 sm:mb-4"></div>
            <p className="text-sm sm:text-base">Looking back at your giving journey...</p>
          </div>
        ) : error ? (
          <div className="text-red-600 p-6 text-center">{error}</div>
        ) : (
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Years of giving personalized message */}
            {donorSummary && (
              <motion.div
                className="bg-green-50 border border-green-100 rounded-xl p-4 sm:p-5 md:p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start mb-3">
                  <div className={`p-2 rounded-full ${milestone.color} bg-opacity-20 mb-3 sm:mb-0 sm:mr-4`}>
                    <MilestoneIcon className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 ${milestone.color}`} />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-2">
                      {givingJourneyMessage.title}
                    </h3>
                    <p className="text-sm sm:text-base text-green-700">
                      {givingJourneyMessage.message}
                    </p>
                  </div>
                </div>
                <div className="bg-white p-3 sm:p-4 rounded-lg border border-green-100 mt-3 sm:mt-4">
                  <p className="text-sm md:text-base text-gray-700 italic">
                    "{givingJourneyMessage.funFact}"
                  </p>
                </div>
              </motion.div>
            )}

            {/* Impact Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                {/* Years of Support */}
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-3 sm:p-4 flex flex-col items-center text-center">
                    <div className="bg-blue-100 p-1.5 sm:p-2 rounded-full mb-1 sm:mb-2">
                      <Clock className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-blue-600" />
                    </div>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-700">
                      <CountUpAnimation 
                        value={journeyStats.years > 0 ? journeyStats.years : years}
                        className="font-bold"
                        delay={0.2}
                      />
                      <span> {(journeyStats.years || years) === 1 ? "Year" : "Years"}</span>
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-blue-600">Years of Support</p>
                  </CardContent>
                </Card>
                
                {/* Lifetime Impact */}
                <Card className="bg-gradient-to-br from-green-50 to-teal-50 shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-3 sm:p-4 flex flex-col items-center text-center">
                    <div className="bg-green-100 p-1.5 sm:p-2 rounded-full mb-1 sm:mb-2">
                      <Award className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-green-600" />
                    </div>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-700 flex items-center justify-center">
                      $<CountUpAnimation 
                        value={journeyStats.totalGiving || donorSummary?.lifetimeGiving || 0}
                        className="font-bold"
                        delay={0.3}
                      />
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-green-600">Lifetime Impact</p>
                  </CardContent>
                </Card>
                
                {/* Most Recent Gift */}
                <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-3 sm:p-4 flex flex-col items-center text-center">
                    <div className="bg-amber-100 p-1.5 sm:p-2 rounded-full mb-1 sm:mb-2">
                      <Gift className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-amber-600" />
                    </div>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-amber-700 flex items-center justify-center">
                      $<CountUpAnimation 
                        value={donorSummary?.lastGift?.amount || amount}
                        className="font-bold"
                        delay={0.4}
                      />
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-amber-600">Most Recent Gift</p>
                  </CardContent>
                </Card>
                
                {/* Creative Arts Hero */}
                <Card className="bg-gradient-to-br from-rose-50 to-pink-50 shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-3 sm:p-4 flex flex-col items-center text-center relative">
                    <div className="bg-rose-100 p-1.5 sm:p-2 rounded-full mb-1 sm:mb-2">
                      <Trophy className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-rose-600" />
                    </div>
                    <motion.div
                      className="absolute -top-1 -right-1"
                      animate={{ rotate: [0, 10, 0, -10, 0] }}
                      transition={{ duration: 5, repeat: Infinity }}
                    >
                      <div className="text-sm sm:text-base md:text-lg">✨</div>
                    </motion.div>
                    <p className="text-base sm:text-lg md:text-xl font-bold text-rose-700">
                      {years >= 5 ? "Champion" : years >= 3 ? "Advocate" : years >= 1 ? "Supporter" : "Newcomer"}
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-rose-600">Creative Arts Hero</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
            
            {/* Journey Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-100 to-blue-100 pb-2 sm:pb-3 px-3 sm:px-6">
                  <CardTitle className="text-base sm:text-lg font-semibold flex items-center">
                    <History className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-indigo-500" />
                    Your Giving Timeline
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {years > 0 
                      ? `You've been supporting Creative Action since ${donorSummary?.firstGiftDate ? new Date(donorSummary.firstGiftDate).getFullYear() : "the beginning"}`
                      : "Beginning your journey with Creative Action"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6">
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    {/* Timeline items */}
                    <div className="space-y-4 sm:space-y-6 relative z-10">
                      {/* Current year marker */}
                      <div className="flex items-start">
                        <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-500 text-white mr-2 sm:mr-4">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                        </div>
                        <div className="flex-grow pt-0.5 sm:pt-1">
                          <h4 className="text-sm sm:text-base font-medium text-gray-800">{new Date().getFullYear()}</h4>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {donorFirstName 
                              ? `${donorFirstName}'s most recent donation helps us continue our mission!` 
                              : "Your most recent donation helps us continue our mission!"}
                          </p>
                        </div>
                      </div>
                      
                      {/* Show fiscal year 2025 giving data if available */}
                      {fiscalYearGiving.fy25 !== undefined && fiscalYearGiving.fy25 > 0 && (
                        <div className="flex items-start">
                          <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-400 text-white mr-2 sm:mr-4">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          </div>
                          <div className="flex-grow pt-0.5 sm:pt-1">
                            <h4 className="text-sm sm:text-base font-medium text-gray-800">FY 2025</h4>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {donorFirstName 
                                ? `${donorFirstName} gave ${formatCurrency(fiscalYearGiving.fy25)} to support our arts education programs!` 
                                : `You gave ${formatCurrency(fiscalYearGiving.fy25)} to support our arts education programs!`}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Show fiscal year 2024 giving data if available */}
                      {fiscalYearGiving.fy24 !== undefined && fiscalYearGiving.fy24 > 0 && (
                        <div className="flex items-start">
                          <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-teal-400 text-white mr-2 sm:mr-4">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          </div>
                          <div className="flex-grow pt-0.5 sm:pt-1">
                            <h4 className="text-sm sm:text-base font-medium text-gray-800">FY 2024</h4>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {donorFirstName 
                                ? `${donorFirstName} contributed ${formatCurrency(fiscalYearGiving.fy24)}, helping to reach approximately ${Math.round(fiscalYearGiving.fy24 * 0.5)} students!` 
                                : `You contributed ${formatCurrency(fiscalYearGiving.fy24)}, helping to reach approximately ${Math.round(fiscalYearGiving.fy24 * 0.5)} students!`}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Show fiscal year 2023 giving data if available */}
                      {fiscalYearGiving.fy23 !== undefined && fiscalYearGiving.fy23 > 0 && (
                        <div className="flex items-start">
                          <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-indigo-400 text-white mr-2 sm:mr-4">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          </div>
                          <div className="flex-grow pt-0.5 sm:pt-1">
                            <h4 className="text-sm sm:text-base font-medium text-gray-800">FY 2023</h4>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {donorFirstName 
                                ? `${donorFirstName}'s ${formatCurrency(fiscalYearGiving.fy23)} gift helped provide arts education to students across our community.` 
                                : `Your ${formatCurrency(fiscalYearGiving.fy23)} gift helped provide arts education to students across our community.`}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Show fiscal year 2022 giving data if available */}
                      {fiscalYearGiving.fy22 !== undefined && fiscalYearGiving.fy22 > 0 && (
                        <div className="flex items-start">
                          <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-purple-400 text-white mr-2 sm:mr-4">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          </div>
                          <div className="flex-grow pt-0.5 sm:pt-1">
                            <h4 className="text-sm sm:text-base font-medium text-gray-800">FY 2022</h4>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {donorFirstName 
                                ? `${donorFirstName} donated ${formatCurrency(fiscalYearGiving.fy22)}, helping support our teaching artists and creative programs.` 
                                : `You donated ${formatCurrency(fiscalYearGiving.fy22)}, helping support our teaching artists and creative programs.`}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* First gift */}
                      {years >= 1 && (
                        <div className="flex items-start">
                          <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-purple-500 text-white mr-2 sm:mr-4">
                            <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                          </div>
                          <div className="flex-grow pt-0.5 sm:pt-1">
                            <h4 className="text-sm sm:text-base font-medium text-gray-800">
                              {donorSummary?.firstGiftDate ? new Date(donorSummary.firstGiftDate).getFullYear() : "First Gift"}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {donorFirstName 
                                ? `${donorFirstName} made their first gift to Creative Action!` 
                                : "You made your first gift to Creative Action!"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="text-center mt-4 sm:mt-6"
            >
              <Button 
                onClick={onNext} 
                size="default" 
                className="px-6 py-1.5 sm:px-8 sm:py-2 text-sm sm:text-base"
              >
                Continue
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </SlideLayout>
  );
}
