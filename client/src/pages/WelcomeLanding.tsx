import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

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