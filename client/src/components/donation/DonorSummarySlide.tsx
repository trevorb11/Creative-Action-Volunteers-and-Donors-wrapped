import { useEffect, useState } from "react";
import { DonationImpact } from "@shared/schema";
import SlideLayout from "./SlideLayout";
import { formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-16 h-16 border-t-4 border-primary rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading your donor history...</p>
          </div>
        ) : error ? (
          <div className="text-center p-6 bg-red-50 rounded-lg">
            <p className="text-red-700">{error}</p>
            <Button 
              className="mt-4" 
              variant="outline" 
              onClick={onNext}
            >
              Continue to Impact Visualization
            </Button>
          </div>
        ) : donorSummary ? (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-primary">Your Giving History</h3>
              {donationThisTime && (
                <p className="text-xl mt-2 font-semibold text-green-700">{donationThisTime}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="overflow-hidden shadow-lg border-t-4 border-primary">
                <CardHeader className="bg-gray-50">
                  <CardTitle className="text-center text-lg">Fiscal Year Giving</CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-primary">{formatCurrency(donorSummary.totalLastYear)}</p>
                  <p className="text-sm text-gray-500 mt-2">Total donations this fiscal year</p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden shadow-lg border-t-4 border-primary">
                <CardHeader className="bg-gray-50">
                  <CardTitle className="text-center text-lg">Last Gift</CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-primary">{formatCurrency(donorSummary.lastGift.amount)}</p>
                  <p className="text-sm text-gray-500 mt-2">on {donorSummary.lastGift.date}</p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden shadow-lg border-t-4 border-primary">
                <CardHeader className="bg-gray-50">
                  <CardTitle className="text-center text-lg">Lifetime Giving</CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-primary">{formatCurrency(donorSummary.lifetimeGiving)}</p>
                  <p className="text-sm text-gray-500 mt-2">Total impact on our community</p>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-8" />

            <div className="text-center">
              <h3 className="text-xl font-bold mb-4">Your Impact So Far</h3>
              <p className="text-gray-700 mb-6">
                Your support has been vital to our mission. Let's explore the specific impact of your current donation.
              </p>
              <Button 
                onClick={onNext} 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Continue to See Your Impact
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center p-6">
            <p>No donor history found. Let's explore the impact of your donation.</p>
            <Button 
              className="mt-4" 
              onClick={onNext}
            >
              Continue to Impact Visualization
            </Button>
          </div>
        )}
      </div>
    </SlideLayout>
  );
}