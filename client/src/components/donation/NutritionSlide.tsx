import { useEffect, useState } from "react";
import { DonationImpact } from "@shared/schema";
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
  Rocket
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

  // Generate a personalized message based on years of giving
  const getGivingJourneyMessage = (): { title: string; message: string; funFact: string } => {
    const years = getYearsGiving();
    const milestone = getMilestoneIcon();
    
    if (years <= 0) {
      return {
        title: `${milestone.emoji} Welcome to the Creative Action Family!`,
        message: "You're just beginning your arts education journey with us. Your support will help ensure creative programs reach students who need them most.",
        funFact: "Did you know? First-time donors like you help us expand our reach to new schools and communities every year!"
      };
    } else if (years === 1) {
      return {
        title: `${milestone.emoji} One Year of Empowering Creativity`,
        message: "You've completed your first year with us! In just 12 months, you've already made a significant difference by helping provide arts education to students across Central Texas.",
        funFact: "Fun fact: In your first year of giving, you've joined thousands of other one-year donors who collectively help us reach over 20,000 students annually!"
      };
    } else if (years === 2) {
      return {
        title: `${milestone.emoji} Two Years of Growing Creative Impact`,
        message: "Two years in, and your commitment to arts education is growing stronger. Your continued support means more students have reliable access to creative expression opportunities.",
        funFact: "Did you know? Second-year donors like you have a 70% higher impact than first-time donors because you understand where creative programs are needed most!"
      };
    } else if (years === 3) {
      return {
        title: `${milestone.emoji} Three Years of Dedicated Support`,
        message: "Three years of consistent support makes you a champion of arts education! Your commitment is helping build a more creative community with sustainable arts programming.",
        funFact: "Fun fact: Three-year donors like you make up just 15% of our donor base but contribute nearly 40% of our annual donation revenue!"
      };
    } else if (years === 4) {
      return {
        title: `${milestone.emoji} Four Years of Transformative Giving`,
        message: "Your support over four years is like creative soil for our community—nurturing imagination and resilience through continued arts access. That's something to celebrate!",
        funFact: "Amazing! At four years of giving, you've likely helped provide enough creative instruction hours to support dozens of students for an entire school year!"
      };
    } else if (years >= 5 && years < 10) {
      return {
        title: `${milestone.emoji} ${years} Years as an Arts Education Champion`,
        message: `For ${years} years, you've been a cornerstone of our creative education efforts. Your long-term commitment means thousands of students experiencing the power of arts education.`,
        funFact: `Incredible! Donors who have given for ${years} years are among our most valued supporters, with a deep understanding of arts education challenges.`
      };
    } else {
      return {
        title: `${milestone.emoji} A Decade+ of Extraordinary Impact`,
        message: `After an incredible ${years} years of support, you're truly a pillar of our mission. Your extraordinary commitment has helped countless students discover their creative potential.`,
        funFact: `Remarkable! Less than 3% of our donors have supported us for ${years}+ years, placing you among our most loyal and dedicated arts education champions!`
      };
    }
  };

  const givingJourneyMessage = getGivingJourneyMessage();
  const milestone = getMilestoneIcon();
  const MilestoneIcon = milestone.icon;
  const years = getYearsGiving();

  // Calculate journey stats
  const getJourneyStats = () => {
    // These would ideally be calculated from real data, but for now using estimations
    const estimatedMealsProvided = years * 500; // Rough estimate
    const estimatedPeopleHelped = years * 120;
    const estimatedVisits = years * 4; // Assuming quarterly donations
    const estimatedVolunteerHours = years * 2; // Just a sample statistic
    
    return {
      mealsProvided: estimatedMealsProvided,
      peopleHelped: estimatedPeopleHelped,
      visits: estimatedVisits,
      volunteerHours: estimatedVolunteerHours
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
      <div className="max-w-4xl mx-auto px-4">
        {isLoading ? (
          <div className="text-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Looking back at your giving journey...</p>
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
                className="bg-green-50 border border-green-100 rounded-xl p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="flex items-start mb-3">
                  <div className={`p-2 rounded-full ${milestone.color} bg-opacity-20 mr-4`}>
                    <MilestoneIcon className={`h-8 w-8 ${milestone.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-800 mb-2">
                      {givingJourneyMessage.title}
                    </h3>
                    <p className="text-green-700">
                      {givingJourneyMessage.message}
                    </p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-green-100 mt-4">
                  <p className="text-gray-700 italic">
                    "{givingJourneyMessage.funFact}"
                  </p>
                </div>
              </motion.div>
            )}

            {/* Journey Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-100 to-blue-100 pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <History className="h-5 w-5 mr-2 text-indigo-500" />
                    Your Giving Timeline
                  </CardTitle>
                  <CardDescription>
                    {years > 0 
                      ? `You've been supporting Creative Action since ${donorSummary?.firstGiftDate ? new Date(donorSummary.firstGiftDate).getFullYear() : "the beginning"}`
                      : "Beginning your journey with Creative Action"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    {/* Timeline items */}
                    <div className="space-y-6 relative z-10">
                      {/* Current year marker */}
                      <div className="flex items-start">
                        <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-green-500 text-white mr-4">
                          <Star className="h-5 w-5" />
                        </div>
                        <div className="flex-grow pt-1">
                          <h4 className="font-medium text-gray-800">{new Date().getFullYear()}</h4>
                          <p className="text-sm text-gray-600">Your most recent donation helps us continue our mission!</p>
                        </div>
                      </div>
                      
                      {/* Show recent years in giving journey if they have a history */}
                      {years >= 1 && (
                        <div className="flex items-start">
                          <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-blue-400 text-white mr-4">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div className="flex-grow pt-1">
                            <h4 className="font-medium text-gray-800">{new Date().getFullYear() - 1}</h4>
                            <p className="text-sm text-gray-600">Your generous support helped provide meals to {journeyStats.peopleHelped} people!</p>
                          </div>
                        </div>
                      )}
                      
                      {/* If they have 3+ years, show middle point */}
                      {years >= 3 && (
                        <div className="flex items-start">
                          <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-indigo-400 text-white mr-4">
                            <Award className="h-5 w-5" />
                          </div>
                          <div className="flex-grow pt-1">
                            <h4 className="font-medium text-gray-800">{donorSummary?.firstGiftDate ? new Date(donorSummary.firstGiftDate).getFullYear() + Math.floor(years/2) : "Mid-journey"}</h4>
                            <p className="text-sm text-gray-600">You've become a consistent supporter of our creative arts programs!</p>
                          </div>
                        </div>
                      )}
                      
                      {/* First gift */}
                      {years >= 1 && (
                        <div className="flex items-start">
                          <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-purple-500 text-white mr-4">
                            <Heart className="h-5 w-5" />
                          </div>
                          <div className="flex-grow pt-1">
                            <h4 className="font-medium text-gray-800">
                              {donorSummary?.firstGiftDate ? new Date(donorSummary.firstGiftDate).getFullYear() : "First Gift"}
                            </h4>
                            <p className="text-sm text-gray-600">You made your first gift to Community Food Share!</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Impact Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <Clock className="h-8 w-8 text-blue-500 mb-2" />
                    <p className="text-2xl font-bold text-blue-700">
                      {years} {years === 1 ? "Year" : "Years"}
                    </p>
                    <p className="text-sm text-blue-600">Years of Support</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-green-50 to-teal-50">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <Award className="h-8 w-8 text-green-500 mb-2" />
                    <p className="text-2xl font-bold text-green-700">
                      {formatCurrency(donorSummary?.lifetimeGiving || 0)}
                    </p>
                    <p className="text-sm text-green-600">Lifetime Impact</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-amber-50 to-yellow-50">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <Timer className="h-8 w-8 text-amber-500 mb-2" />
                    <p className="text-2xl font-bold text-amber-700">
                      ~{journeyStats.mealsProvided.toLocaleString()}
                    </p>
                    <p className="text-sm text-amber-600">Estimated Meals</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-rose-50 to-pink-50">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <Hourglass className="h-8 w-8 text-rose-500 mb-2" />
                    <p className="text-2xl font-bold text-rose-700">
                      {journeyStats.peopleHelped.toLocaleString()}+
                    </p>
                    <p className="text-sm text-rose-600">People Helped</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="text-center mt-6"
            >
              <Button onClick={onNext} size="lg" className="px-8">
                Continue
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </SlideLayout>
  );
}
