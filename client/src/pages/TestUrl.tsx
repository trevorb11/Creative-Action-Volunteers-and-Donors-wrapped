import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";

/**
 * TestUrl component
 * 
 * This is a testing utility to help us understand URL parameter handling
 * It creates test URLs and lets you navigate to the donation impact page with wrapped parameters
 */
export default function TestUrl() {
  const [donorInfo, setDonorInfo] = useState({
    email: "test.donor@example.com",
    firstGiftDate: "2020-05-10",
    lastGiftDate: "2024-02-15",
    lastGiftAmount: "250",
    lifetimeGiving: "5750",
    totalGifts: "18",
    consecutiveYearsGiving: "4",
    largestGiftAmount: "1000",
    largestGiftDate: "2022-12-20",
    fy22: "750",
    fy23: "1200",
    fy24: "2300",
    fy25: "1500"
  });

  const [generatedUrl, setGeneratedUrl] = useState<string>("");

  // When any of the donor info changes, generate a new URL
  useEffect(() => {
    generateUrl();
  }, [donorInfo]);

  // Generate a URL with the current donor info
  const generateUrl = () => {
    const params = new URLSearchParams();
    
    // Add all non-empty parameters
    Object.entries(donorInfo).forEach(([key, value]) => {
      if (value.trim()) {
        params.append(key, value);
      }
    });
    
    // Create the base URL
    const baseUrl = window.location.origin + "/impact";
    
    // Set the generated URL
    setGeneratedUrl(`${baseUrl}?${params.toString()}`);
  };

  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDonorInfo(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary">URL Parameter Testing Tool</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Donor Information</CardTitle>
            <CardDescription>
              Enter donor information to generate a test URL for the donation impact page
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  value={donorInfo.email} 
                  onChange={handleInputChange} 
                  placeholder="donor@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="firstGiftDate">First Gift Date</Label>
                <Input 
                  id="firstGiftDate" 
                  name="firstGiftDate" 
                  value={donorInfo.firstGiftDate} 
                  onChange={handleInputChange} 
                  placeholder="YYYY-MM-DD"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastGiftDate">Last Gift Date</Label>
                <Input 
                  id="lastGiftDate" 
                  name="lastGiftDate" 
                  value={donorInfo.lastGiftDate} 
                  onChange={handleInputChange} 
                  placeholder="YYYY-MM-DD"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastGiftAmount">Last Gift Amount</Label>
                <Input 
                  id="lastGiftAmount" 
                  name="lastGiftAmount" 
                  value={donorInfo.lastGiftAmount} 
                  onChange={handleInputChange} 
                  placeholder="250"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lifetimeGiving">Lifetime Giving</Label>
                <Input 
                  id="lifetimeGiving" 
                  name="lifetimeGiving" 
                  value={donorInfo.lifetimeGiving} 
                  onChange={handleInputChange} 
                  placeholder="1000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="totalGifts">Total Gifts</Label>
                <Input 
                  id="totalGifts" 
                  name="totalGifts" 
                  value={donorInfo.totalGifts} 
                  onChange={handleInputChange} 
                  placeholder="5"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="consecutiveYearsGiving">Consecutive Years Giving</Label>
                <Input 
                  id="consecutiveYearsGiving" 
                  name="consecutiveYearsGiving" 
                  value={donorInfo.consecutiveYearsGiving} 
                  onChange={handleInputChange} 
                  placeholder="2"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="largestGiftAmount">Largest Gift Amount</Label>
                <Input 
                  id="largestGiftAmount" 
                  name="largestGiftAmount" 
                  value={donorInfo.largestGiftAmount} 
                  onChange={handleInputChange} 
                  placeholder="500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="largestGiftDate">Largest Gift Date</Label>
                <Input 
                  id="largestGiftDate" 
                  name="largestGiftDate" 
                  value={donorInfo.largestGiftDate} 
                  onChange={handleInputChange} 
                  placeholder="YYYY-MM-DD"
                />
              </div>

              {/* Fiscal Year donation amounts */}
              <div className="col-span-1 md:col-span-2 pt-4 border-t mt-4">
                <h3 className="text-lg font-medium mb-3">Fiscal Year Donations</h3>
                <p className="text-sm text-gray-500 mb-4">
                  These fields allow you to specify donation amounts for specific fiscal years.
                  The system uses these values to show fiscal year totals in the donor summary.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fy22">FY 2022 Amount</Label>
                    <Input 
                      id="fy22" 
                      name="fy22" 
                      value={donorInfo.fy22} 
                      onChange={handleInputChange} 
                      placeholder="750"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fy23">FY 2023 Amount</Label>
                    <Input 
                      id="fy23" 
                      name="fy23" 
                      value={donorInfo.fy23} 
                      onChange={handleInputChange} 
                      placeholder="1200"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fy24">FY 2024 Amount</Label>
                    <Input 
                      id="fy24" 
                      name="fy24" 
                      value={donorInfo.fy24} 
                      onChange={handleInputChange} 
                      placeholder="2300"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fy25">FY 2025 Amount</Label>
                    <Input 
                      id="fy25" 
                      name="fy25" 
                      value={donorInfo.fy25} 
                      onChange={handleInputChange} 
                      placeholder="1500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="w-full p-3 bg-gray-50 rounded-md border border-gray-200 overflow-x-auto">
              <p className="font-mono text-sm text-gray-800 break-all">
                {generatedUrl}
              </p>
            </div>
            
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={generateUrl}>
                Regenerate URL
              </Button>
              
              <div className="space-x-2">
                <Button variant="outline" onClick={() => {
                  navigator.clipboard.writeText(generatedUrl);
                }}>
                  Copy URL
                </Button>
                
                <Button asChild>
                  <a href={generatedUrl} target="_blank" rel="noopener noreferrer">
                    Open in New Tab
                  </a>
                </Button>
                
                <Button asChild variant="default">
                  <Link href={`/impact?${new URLSearchParams(donorInfo).toString()}`}>
                    Navigate to Impact Page
                  </Link>
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
        
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle>Placeholder Value Examples</CardTitle>
            <CardDescription>
              These are examples of placeholder values that might appear in an email campaign
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-md shadow-sm">
                <p className="font-mono text-sm">firstGiftDate=*|FIRS_GIF_D|*</p>
              </div>
              
              <div className="p-3 bg-white rounded-md shadow-sm">
                <p className="font-mono text-sm">lastGiftDate=*|LAS_GIF_DA|*</p>
              </div>
              
              <div className="p-3 bg-white rounded-md shadow-sm">
                <p className="font-mono text-sm">lastGiftAmount=*|LAST_GIF_A|*</p>
              </div>
              
              <div className="p-3 bg-white rounded-md shadow-sm">
                <p className="font-mono text-sm">lifetimeGiving=*|LTGIVING|*</p>
              </div>
              
              <div className="p-3 bg-white rounded-md shadow-sm">
                <p className="font-mono text-sm">consecutiveYearsGiving=*|CONSYEARSG|*</p>
              </div>
              
              <div className="p-3 bg-white rounded-md shadow-sm">
                <p className="font-mono text-sm">totalGifts=*|TOTALGIFTS|*</p>
              </div>
              
              <div className="p-3 bg-white rounded-md shadow-sm">
                <p className="font-mono text-sm">largestGiftAmount=*|LARG_GIF_A|*</p>
              </div>
              
              <div className="p-3 bg-white rounded-md shadow-sm">
                <p className="font-mono text-sm">largestGiftDate=*|LARG_GIF_D|*</p>
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={() => {
                setDonorInfo({
                  email: "test.donor@example.com",
                  firstGiftDate: "*|FIRS_GIF_D|*",
                  lastGiftDate: "*|LAS_GIF_DA|*",
                  lastGiftAmount: "*|LAST_GIF_A|*",
                  lifetimeGiving: "*|LTGIVING|*",
                  totalGifts: "*|TOTALGIFTS|*",
                  consecutiveYearsGiving: "*|CONSYEARSG|*",
                  largestGiftAmount: "*|LARG_GIF_A|*",
                  largestGiftDate: "*|LARG_GIF_D|*",
                  fy22: "",
                  fy23: "",
                  fy24: "",
                  fy25: ""
                });
              }}
              variant="outline"
            >
              Load Placeholder Values
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}