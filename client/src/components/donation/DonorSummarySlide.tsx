import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import SlideLayout from "./SlideLayout";
import { DonationImpact } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

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
  isLastSlide
}: DonorSummarySlideProps) {
  const [donorSummary, setDonorSummary] = useState<DonorSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch detailed donor information when the component mounts
    const fetchDonorDetails = async () => {
      if (!donorEmail) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/donor/${encodeURIComponent(donorEmail)}`);
        
        if (!response.ok) {
          console.error('Failed to fetch donor details');
          setIsLoading(false);
          return;
        }
        
        const data = await response.json();
        
        if (data.donor && data.donations) {
          // Calculate donation statistics
          const donations = data.donations || [];
          const now = new Date();
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(now.getFullYear() - 1);
          
          // Calculate total donations in the last year
          const donationsLastYear = donations.filter(
            (d: any) => new Date(d.date) >= oneYearAgo
          );
          
          const totalLastYear = donationsLastYear.reduce(
            (sum: number, d: any) => sum + parseFloat(d.amount), 
            0
          );
          
          // Get last gift
          const sortedDonations = [...donations].sort(
            (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          
          const lastGift = sortedDonations.length > 0 
            ? { 
                amount: parseFloat(sortedDonations[0].amount), 
                date: new Date(sortedDonations[0].date).toLocaleDateString() 
              }
            : { amount: 0, date: 'N/A' };
          
          // Calculate lifetime giving
          const lifetimeGiving = donations.reduce(
            (sum: number, d: any) => sum + parseFloat(d.amount), 
            0
          );
          
          setDonorSummary({
            totalLastYear,
            lastGift,
            lifetimeGiving,
            name: data.donor.name
          });
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching donor details:', error);
        setIsLoading(false);
      }
    };

    fetchDonorDetails();
  }, [donorEmail]);

  return (
    <SlideLayout
      title="Your Donation Summary"
      subtitle={donorSummary?.name ? `Thanks for your support, ${donorSummary.name}!` : "Your Generosity At A Glance"}
      variant="summary"
      onNext={onNext}
      onPrevious={onPrevious}
      isFirstSlide={isFirstSlide}
      isLastSlide={isLastSlide}
    >
      <div className="space-y-6 text-center">
        <p className="text-xl text-gray-700">
          Your support has made a meaningful difference in our community.
        </p>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 bg-green-50 border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Last 12 Months</h3>
              <p className="text-3xl font-bold text-green-700">
                {donorSummary ? formatCurrency(donorSummary.totalLastYear) : formatCurrency(0)}
              </p>
              <p className="text-sm text-gray-600 mt-2">Total donations in the past year</p>
            </Card>
            
            <Card className="p-6 bg-green-50 border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Last Gift</h3>
              <p className="text-3xl font-bold text-green-700">
                {donorSummary ? formatCurrency(donorSummary.lastGift.amount) : formatCurrency(0)}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {donorSummary?.lastGift.date || "N/A"}
              </p>
            </Card>
            
            <Card className="p-6 bg-green-50 border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Lifetime Impact</h3>
              <p className="text-3xl font-bold text-green-700">
                {donorSummary ? formatCurrency(donorSummary.lifetimeGiving) : formatCurrency(0)}
              </p>
              <p className="text-sm text-gray-600 mt-2">Total lifetime giving</p>
            </Card>
          </div>
        )}
        
        <div className="mt-8">
          <p className="text-lg font-medium">
            Your recent gift of {formatCurrency(amount)} is included in these totals.
          </p>
          <p className="text-md text-gray-600 mt-2">
            Let's take a look at the impact your donations are making!
          </p>
        </div>
      </div>
    </SlideLayout>
  );
}