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
  Apple,
  Beef,
  Carrot,
  Egg,
  Heart,
  Calendar,
  Award,
  Clock,
  Sparkles,
  Droplets,
  Leaf,
} from "lucide-react";
import CountUpAnimation from "./CountUpAnimation";

interface NutritionSlideProps {
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

export default function NutritionSlide({
  impact,
  donorEmail,
  amount,
  onNext,
  onPrevious,
  isFirstSlide,
  isLastSlide,
}: NutritionSlideProps) {
  const [donorSummary, setDonorSummary] = useState<DonorSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDonorSummary() {
      // First check if we have wrapped donor data in sessionStorage
      const wrappedDataStr = sessionStorage.getItem("wrappedDonorData");
      const donorParams = sessionStorage.getItem("donorParams");
      const storedEmail = sessionStorage.getItem("donorEmail");

      console.log("NutritionSlide - Checking storage:", {
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

  // Generate a personalized message based on years of giving
  const getNutritionMessage = (): { title: string; message: string } => {
    const years = getYearsGiving();
    
    if (years <= 0) {
      return {
        title: "You're Planting the Seeds of Change",
        message: "As a new donor, you're beginning a journey to nourish our community. Your support helps ensure nutritious food reaches those who need it most."
      };
    } else if (years === 1) {
      return {
        title: "One Year of Fighting Hunger",
        message: "You've started your hunger-fighting journey with us! In your first year, you've already made a difference by helping provide nutritious meals to people in need."
      };
    } else if (years === 2) {
      return {
        title: "Building Momentum",
        message: "Two years in, and your commitment to fighting hunger is growing stronger. Your continued support helps us provide more fresh produce, protein, and dairy to our neighbors."
      };
    } else if (years === 3) {
      return {
        title: "Veteran Hunger Fighter",
        message: "Three years of consistent support makes you a veteran hunger fighter! Your commitment is helping build a healthier community with every nutritious meal shared."
      };
    } else if (years === 4) {
      return {
        title: "Four Years Strong",
        message: "Your support over four years is like fertile soil for our community—nurturing growth and health through good nutrition. That's something to celebrate!"
      };
    } else if (years >= 5 && years < 10) {
      return {
        title: "Sustainable Impact Champion",
        message: `For ${years} years, you've been a driving force in our nutrition mission. Your long-term commitment means thousands of balanced meals for families in our community.`
      };
    } else {
      return {
        title: "A Cornerstone of Our Mission",
        message: `After an incredible ${years} years of support, you're a true cornerstone of our mission. Your generosity has provided countless nutritious meals and helped build a healthier community for over a decade.`
      };
    }
  };

  const nutritionMessage = getNutritionMessage();

  return (
    <SlideLayout
      title="Balanced Nutrition"
      subtitle="Your donation supports a diverse, healthy diet"
      variant="nutrition"
      onNext={onNext}
      onPrevious={onPrevious}
      isFirstSlide={isFirstSlide}
      isLastSlide={isLastSlide}
    >
      <div className="max-w-4xl mx-auto px-4">
        {isLoading ? (
          <div className="text-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading nutrition information...</p>
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
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  {nutritionMessage.title}
                </h3>
                <p className="text-green-700">
                  {nutritionMessage.message}
                </p>
              </motion.div>
            )}

            {/* Nutrition percentages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold flex items-center">
                      <Leaf className="h-5 w-5 mr-2 text-green-500" />
                      Fresh Food Distribution
                    </CardTitle>
                    <CardDescription>
                      Your donation helps provide fresh, healthy food
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Fresh Produce</span>
                          <span className="text-sm font-medium">{impact.producePercentage}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-green-500 h-2.5 rounded-full" style={{ width: impact.producePercentage }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Protein</span>
                          <span className="text-sm font-medium">{impact.proteinPercentage}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-red-400 h-2.5 rounded-full" style={{ width: impact.proteinPercentage }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Dairy</span>
                          <span className="text-sm font-medium">{impact.dairyPercentage}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-400 h-2.5 rounded-full" style={{ width: impact.dairyPercentage }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Total Fresh Foods</span>
                          <span className="text-sm font-medium">{impact.freshFoodPercentage}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: impact.freshFoodPercentage }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-red-500" />
                      Nutritional Impact
                    </CardTitle>
                    <CardDescription>
                      Balanced nutrition provides essential health benefits
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="flex flex-col items-center text-center p-2 bg-green-50 rounded-lg">
                        <Carrot className="h-8 w-8 text-orange-500 mb-2" />
                        <p className="font-semibold">Vitamins & Fiber</p>
                        <p className="text-sm text-gray-600">from fresh produce</p>
                      </div>
                      <div className="flex flex-col items-center text-center p-2 bg-red-50 rounded-lg">
                        <Beef className="h-8 w-8 text-red-600 mb-2" />
                        <p className="font-semibold">Essential Protein</p>
                        <p className="text-sm text-gray-600">for muscle health</p>
                      </div>
                      <div className="flex flex-col items-center text-center p-2 bg-blue-50 rounded-lg">
                        <Egg className="h-8 w-8 text-yellow-500 mb-2" />
                        <p className="font-semibold">Calcium</p>
                        <p className="text-sm text-gray-600">for bone strength</p>
                      </div>
                      <div className="flex flex-col items-center text-center p-2 bg-purple-50 rounded-lg">
                        <Apple className="h-8 w-8 text-green-600 mb-2" />
                        <p className="font-semibold">Complete Diet</p>
                        <p className="text-sm text-gray-600">overall wellbeing</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

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
