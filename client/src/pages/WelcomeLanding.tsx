import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useDonationImpact } from "@/hooks/use-donation-impact";

export default function WelcomeLanding() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/:identifier");
  const { handleFormSubmit } = useDonationImpact();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Function to parse query parameters
  const getQueryParam = (name: string): string | null => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(name);
  };

  useEffect(() => {
    // Check for identifiers in URL parameters or route parameters
    const identifier = getQueryParam("donor") || getQueryParam("email") || params?.identifier;
    
    if (identifier) {
      setIsLoading(true);
      setErrorMessage(null);
      
      // Try to fetch donor information
      fetchDonorInfo(identifier);
    }
  }, [params]);

  const fetchDonorInfo = async (identifier: string) => {
    try {
      const response = await apiRequest("GET", `/api/donor/${encodeURIComponent(identifier)}`, null);
      const data = await response.json();
      
      if (data.donation) {
        // Found the donor - automatically submit with the donation amount
        const amount = parseFloat(data.donation.amount);
        toast({
          title: "Welcome back!",
          description: "We've found your donation information.",
        });
        
        // Submit to the donation impact calculator
        handleFormSubmit(amount);
      } else {
        setIsLoading(false);
        setErrorMessage("We couldn't find your donation information. Please enter your donation manually.");
      }
    } catch (error) {
      console.error("Error fetching donor info:", error);
      setIsLoading(false);
      // No need to show error - just go to manual input if we can't find donation
    }
  };

  const handleGetStarted = () => {
    // Navigate to the donation impact page
    setLocation("/impact");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-green-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-green-700">Community Food Share</CardTitle>
          <CardDescription className="text-xl mt-2">
            See the Impact You Made
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-green-600" />
              <p className="mt-4 text-center text-gray-600">
                Looking for your donation information...
              </p>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="rounded-md bg-amber-50 p-4 border border-amber-200 text-amber-700 mb-4">
                  {errorMessage}
                </div>
              )}
              <p className="text-center text-gray-600">
                Discover how your generosity is fighting hunger and changing lives in our community.
              </p>
              <Button 
                onClick={handleGetStarted} 
                className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
              >
                View Your Impact
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}