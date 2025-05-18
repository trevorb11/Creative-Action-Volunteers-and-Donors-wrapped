import { useEffect, useState } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TestTube, Wrench } from "lucide-react";

export default function WelcomeLanding() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/:identifier");
  const [isLoading, setIsLoading] = useState(false);

  // Function to parse query parameters
  const getQueryParam = (name: string): string | null => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(name);
  };

  // Check for identifiers in URL parameters or route parameters
  useEffect(() => {
    // Get donor identifier from query params or route params
    const identifier = getQueryParam("donor") || 
                      getQueryParam("email") || 
                      getQueryParam("id") || 
                      params?.identifier;
    
    if (identifier) {
      setIsLoading(true);
      
      // Instead of using the hook, just redirect to the impact page with the email parameter
      // Let the DonationImpact page handle the donor lookup
      const redirectUrl = `/impact?email=${encodeURIComponent(identifier)}`;
      setLocation(redirectUrl);
    }
  }, [params, setLocation]);

  const handleDonationImpact = () => {
    // Navigate to the standard donation impact page
    setLocation("/impact");
  };

  const handleDonorInterface = () => {
    // Navigate to the donor-specific interface with the UI parameter
    setLocation("/impact?donorUI=true");
  };

  const handleVolunteerImpact = () => {
    // Navigate to the volunteer impact page
    setLocation("/volunteer-impact");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#F3E5F5] to-[#EDE7F6] p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-[#6A1B9A]">Creative Action</CardTitle>
          <CardDescription className="text-xl mt-2">
            See the Impact You Made
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-[#6A1B9A]" />
              <p className="mt-4 text-center text-gray-600">
                Looking for your donation information...
              </p>
            </div>
          ) : (
            <>
              <p className="text-center text-gray-600">
                Discover how your generosity is bringing arts education and creative expression to youth across Central Texas.
              </p>
              <div className="space-y-3">
                {/* Donation impact options */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="text-lg font-semibold mb-3 text-[#6A1B9A]">Donation Impact</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <Button 
                      onClick={handleDonationImpact} 
                      className="w-full bg-[#6A1B9A] hover:bg-[#4A148C] text-md py-3"
                    >
                      Standard Donation Impact
                    </Button>
                    <Button 
                      onClick={handleDonorInterface} 
                      className="w-full bg-[#8E24AA] hover:bg-[#6A1B9A] text-md py-3"
                    >
                      Donor-Personalized Impact
                    </Button>
                  </div>
                </div>
                
                {/* Volunteer impact option */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="text-lg font-semibold mb-3 text-[#66CDAA]">Teaching Artist Impact</h3>
                  <Button 
                    onClick={handleVolunteerImpact} 
                    className="w-full bg-[#66CDAA] hover:bg-[#4DB6AC] text-md py-3"
                  >
                    Teaching Artist Impact Calculator
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between text-sm text-gray-500 border-t pt-4">
          <Link href="/admin">
            <Button size="sm" variant="ghost" className="flex items-center gap-1 text-[#6A1B9A]">
              <Wrench className="h-4 w-4" />
              Admin
            </Button>
          </Link>
          
          <Link href="/test-url">
            <Button size="sm" variant="ghost" className="flex items-center gap-1 text-[#6A1B9A]">
              <TestTube className="h-4 w-4" />
              URL Tester
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}