import { Component } from "react";
import { RouteComponentProps } from "wouter";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { VolunteerImpact as VolunteerImpactType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SLIDE_COLORS } from "@/lib/constants";
import { Loader2, ArrowLeft, ArrowRight, RotateCcw, Share2 } from "lucide-react";

// State interface for volunteer impact
interface VolunteerImpactState {
  hours: number;
  step: number;
  impact: VolunteerImpactType | null;
  isLoading: boolean;
  error: string | null;
  volunteerEmail: string | null;
}

// Slide names for the volunteer impact visualization
enum SlideNames {
  WELCOME = 0,
  LOADING = 1,
  SUMMARY = 2,
  MEALS = 3,
  COST_SAVINGS = 4,
  PEOPLE_SERVED = 5,
  THANK_YOU = 6
}

/**
 * Gets parameters from the URL
 * Returns all URL parameters for preservation during navigation
 */
function getParamsFromURL() {
  const params = new URLSearchParams(window.location.search);
  
  // Get volunteer email if available
  const email = params.get('email');
  
  // Get volunteer hours if available
  const hours = params.get('hours');
  
  // Create a dictionary of all parameters for easy access and preservation
  const allParams = Object.fromEntries(params.entries());
  console.log("URL parameters:", allParams);
  
  return { email, hours, allParams };
}

/**
 * VolunteerImpactPage Component
 * 
 * Shows the impact of volunteer hours on the community
 */
export default class VolunteerImpactPage extends Component<RouteComponentProps, VolunteerImpactState> {
  private hasCheckedParams = false;

  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      hours: 0,
      step: SlideNames.WELCOME,
      impact: null,
      isLoading: false,
      error: null,
      volunteerEmail: null
    };
    
    // Bind methods
    this.handleHoursSubmit = this.handleHoursSubmit.bind(this);
    this.calculateImpact = this.calculateImpact.bind(this);
    this.goToNextSlide = this.goToNextSlide.bind(this);
    this.goToPreviousSlide = this.goToPreviousSlide.bind(this);
    this.resetVolunteerImpact = this.resetVolunteerImpact.bind(this);
    this.handleShare = this.handleShare.bind(this);
  }

  /**
   * Check for parameters when component mounts
   */
  componentDidMount() {
    if (!this.hasCheckedParams) {
      this.hasCheckedParams = true;
      const { email, hours } = getParamsFromURL();
      
      if (hours) {
        // If hours is provided in URL, calculate impact
        const hoursValue = parseFloat(hours);
        if (!isNaN(hoursValue) && hoursValue > 0) {
          this.setState({ 
            hours: hoursValue,
            volunteerEmail: email || null 
          }, () => {
            this.calculateImpact(hoursValue);
          });
        }
      } else if (email) {
        // If only email is provided, fetch volunteer information
        this.fetchVolunteerInfo(email);
      }
    }
  }

  /**
   * Fetch volunteer information by email
   */
  async fetchVolunteerInfo(email: string): Promise<boolean> {
    try {
      this.setState({ isLoading: true, step: SlideNames.LOADING });
      
      const response = await apiRequest("GET", `/api/volunteer/${encodeURIComponent(email)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.impact) {
          // We have impact data, set it
          this.setState({
            impact: data.impact,
            hours: data.impact.hoursWorked,
            isLoading: false,
            step: SlideNames.SUMMARY,
            volunteerEmail: email
          });
          return true;
        } else if (data.volunteer) {
          // Volunteer exists but no impact data yet
          this.setState({
            isLoading: false,
            volunteerEmail: email
          });
          toast({
            title: "Welcome back!",
            description: "Enter your volunteer hours to see your impact.",
          });
          return true;
        }
      } else {
        // Reset loading state but keep the email
        this.setState({
          isLoading: false,
          volunteerEmail: email
        });
      }
    } catch (error) {
      console.error("Error fetching volunteer data:", error);
      this.setState({ isLoading: false });
      toast({
        title: "Error",
        description: "Failed to fetch volunteer information. Please try again.",
        variant: "destructive"
      });
    }
    return false;
  }

  /**
   * Handle hours form submission
   */
  handleHoursSubmit(hours: number, email?: string) {
    if (hours <= 0) {
      toast({
        title: "Invalid hours",
        description: "Please enter a positive number of hours.",
        variant: "destructive"
      });
      return;
    }

    this.setState({ 
      hours,
      isLoading: true,
      step: SlideNames.LOADING,
      volunteerEmail: email || this.state.volunteerEmail
    }, () => {
      // Log the volunteer shift if email is provided
      if (email) {
        this.logVolunteerShift(hours, email);
      } else {
        this.calculateImpact(hours);
      }
    });
  }

  /**
   * Log a volunteer shift to the server
   */
  async logVolunteerShift(hours: number, email: string) {
    try {
      const response = await apiRequest("POST", '/api/log-volunteer-shift', {
        hours,
        email,
        shift_date: new Date()
      });

      if (response.ok) {
        const data = await response.json();
        this.setState({
          impact: data.impact,
          isLoading: false,
          step: SlideNames.SUMMARY
        });
      } else {
        throw new Error("Failed to log volunteer shift");
      }
    } catch (error) {
      console.error("Error logging volunteer shift:", error);
      // Still calculate impact even if logging fails
      this.calculateImpact(hours);
    }
  }

  /**
   * Calculate impact via the server API
   */
  async calculateImpact(hours: number) {
    try {
      const response = await apiRequest("POST", '/api/calculate-volunteer-impact', { hours });

      if (response.ok) {
        const data = await response.json();
        this.setState({
          impact: data.impact,
          isLoading: false,
          step: SlideNames.SUMMARY
        });
      } else {
        throw new Error("Failed to calculate impact");
      }
    } catch (error) {
      console.error("Error calculating impact:", error);
      this.setState({
        isLoading: false,
        error: "Failed to calculate impact. Please try again."
      });
      toast({
        title: "Error",
        description: "Failed to calculate impact. Please try again.",
        variant: "destructive"
      });
    }
  }

  /**
   * Go to next slide
   */
  goToNextSlide() {
    if (this.state.step < SlideNames.THANK_YOU) {
      this.setState({ step: this.state.step + 1 });
    }
  }

  /**
   * Go to previous slide
   */
  goToPreviousSlide() {
    if (this.state.step > SlideNames.SUMMARY) {
      this.setState({ step: this.state.step - 1 });
    }
  }

  /**
   * Reset to beginning
   */
  resetVolunteerImpact() {
    this.setState({
      hours: 0,
      step: SlideNames.WELCOME,
      impact: null,
      isLoading: false,
      error: null
    });
  }

  /**
   * Check if current slide is the first content slide
   */
  isFirstSlide() {
    return this.state.step === SlideNames.SUMMARY;
  }

  /**
   * Check if current slide is the last slide
   */
  isLastSlide() {
    return this.state.step === SlideNames.THANK_YOU;
  }

  /**
   * Handle sharing functionality
   */
  handleShare() {
    const { hours, volunteerEmail } = this.state;
    let shareUrl = `${window.location.origin}${window.location.pathname}?hours=${hours}`;
    
    if (volunteerEmail) {
      shareUrl += `&email=${encodeURIComponent(volunteerEmail)}`;
    }
    
    // Use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'My Volunteer Impact',
        text: `I volunteered ${hours} hours with Community Food Share! See the impact of my service.`,
        url: shareUrl
      }).catch(err => {
        console.error('Error sharing:', err);
        this.fallbackShare(shareUrl);
      });
    } else {
      this.fallbackShare(shareUrl);
    }
  }
  
  /**
   * Fallback sharing method (copy to clipboard)
   */
  fallbackShare(shareUrl: string) {
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: "Link copied!",
        description: "The URL has been copied to your clipboard."
      });
    }).catch(err => {
      console.error('Failed to copy URL:', err);
      toast({
        title: "Couldn't copy link",
        description: "Please copy the URL from your browser's address bar.",
        variant: "destructive"
      });
    });
  }

  render() {
    const { hours, step, impact, isLoading, error } = this.state;

    // Welcome screen / Hours entry
    if (step === SlideNames.WELCOME) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-white">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Volunteer Impact Calculator</CardTitle>
              <CardDescription className="text-center">
                See how your volunteer hours make a difference at Community Food Share
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="hours" className="block text-sm font-medium mb-1">
                    Hours Volunteered
                  </label>
                  <input
                    id="hours"
                    type="number"
                    min="0.5"
                    step="0.5"
                    placeholder="Enter hours"
                    className="w-full p-2 border rounded-md"
                    onChange={(e) => this.setState({ hours: parseFloat(e.target.value) || 0 })}
                    value={hours || ''}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email (optional)
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Your email address"
                    className="w-full p-2 border rounded-md"
                    onChange={(e) => this.setState({ volunteerEmail: e.target.value || null })}
                    value={this.state.volunteerEmail || ''}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Provide your email to save your volunteer history
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => this.handleHoursSubmit(hours, this.state.volunteerEmail || undefined)}
                disabled={hours <= 0}
                className="w-full"
              >
                Calculate My Impact
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    // Loading screen
    if (step === SlideNames.LOADING || isLoading) {
      return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${SLIDE_COLORS.loading}`}>
          <div className="text-center text-white mb-8">
            <h2 className="text-2xl font-bold mb-4">Calculating Your Impact</h2>
            <p className="text-lg mb-6">Please wait while we calculate how your volunteer hours help our community</p>
            <Progress value={75} className="w-64 mx-auto" />
          </div>
          <Loader2 className="h-16 w-16 animate-spin text-white" />
        </div>
      );
    }

    // Error display
    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-white">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-red-600">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center">{error}</p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={this.resetVolunteerImpact}>
                <RotateCcw className="mr-2 h-4 w-4" /> Try Again
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    // Impact slides
    if (impact) {
      // Navigation buttons that appear on all slides
      const navigationButtons = (
        <div className="flex justify-between mt-8 w-full">
          <Button
            variant="outline"
            onClick={this.goToPreviousSlide}
            disabled={this.isFirstSlide()}
            className={this.isFirstSlide() ? 'invisible' : ''}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          
          <Button onClick={this.resetVolunteerImpact} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" /> Start Over
          </Button>
          
          <Button
            onClick={this.goToNextSlide}
            disabled={this.isLastSlide()}
            className={this.isLastSlide() ? 'invisible' : ''}
          >
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );

      // Slide content based on current step
      switch (step) {
        case SlideNames.SUMMARY:
          return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${SLIDE_COLORS.meals}`}>
              <div className="max-w-2xl text-center text-white">
                <h1 className="text-3xl font-bold mb-6">Your Volunteer Impact</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/20 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">Hours Volunteered</h3>
                    <p className="text-4xl font-bold">{impact.hoursWorked}</p>
                  </div>
                  <div className="bg-white/20 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">Meals Provided</h3>
                    <p className="text-4xl font-bold">{impact.mealsProvided.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/20 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">Value Created</h3>
                    <p className="text-4xl font-bold">${impact.costSavings.toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-xl mb-8">
                  With your {impact.hoursWorked} hours of service, you've helped feed {impact.peopleServedPerDay.toLocaleString()} people for an entire day!
                </p>
                {navigationButtons}
              </div>
            </div>
          );
          
        case SlideNames.MEALS:
          return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${SLIDE_COLORS.nutrition}`}>
              <div className="max-w-2xl text-center text-white">
                <h1 className="text-3xl font-bold mb-6">Meals Your Service Provided</h1>
                <div className="bg-white/20 p-8 rounded-lg mb-8">
                  <p className="text-6xl font-bold mb-4">{impact.mealsProvided.toLocaleString()}</p>
                  <p className="text-xl">
                    That's enough food to feed {Math.floor(impact.mealsProvided / 3)} people for a day,
                    or {Math.floor(impact.mealsProvided / 21)} people for an entire week!
                  </p>
                </div>
                <p className="text-xl mb-8">
                  Each hour of volunteer service at Community Food Share helps provide approximately 55 meals to those in need.
                </p>
                {navigationButtons}
              </div>
            </div>
          );
          
        case SlideNames.COST_SAVINGS:
          return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${SLIDE_COLORS.foodRescue}`}>
              <div className="max-w-2xl text-center text-white">
                <h1 className="text-3xl font-bold mb-6">Economic Impact</h1>
                <div className="bg-white/20 p-8 rounded-lg mb-8">
                  <p className="text-6xl font-bold mb-4">${impact.costSavings.toLocaleString()}</p>
                  <p className="text-xl">
                    The value of your volunteer time helps Community Food Share operate efficiently and serve more people.
                  </p>
                </div>
                <p className="text-xl mb-8">
                  Each volunteer hour is valued at $36.36, helping us keep our costs low while maximizing our community impact.
                </p>
                {navigationButtons}
              </div>
            </div>
          );
          
        case SlideNames.PEOPLE_SERVED:
          return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${SLIDE_COLORS.people}`}>
              <div className="max-w-2xl text-center text-white">
                <h1 className="text-3xl font-bold mb-6">People You've Helped</h1>
                <div className="bg-white/20 p-8 rounded-lg mb-8">
                  <p className="text-6xl font-bold mb-4">{impact.peopleServedPerDay.toLocaleString()}</p>
                  <p className="text-xl">
                    That's the number of people who can be fed for a full day thanks to your volunteer service.
                  </p>
                </div>
                <p className="text-xl mb-8">
                  Community Food Share serves thousands of individuals across Boulder and Broomfield Counties,
                  and your contribution makes a real difference in their lives.
                </p>
                {navigationButtons}
              </div>
            </div>
          );
          
        case SlideNames.THANK_YOU:
          return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${SLIDE_COLORS.summary}`}>
              <div className="max-w-2xl text-center text-white">
                <h1 className="text-3xl font-bold mb-6">Thank You!</h1>
                <div className="bg-white/20 p-8 rounded-lg mb-8">
                  <p className="text-xl mb-6">
                    Your {impact.hoursWorked} hours of service have made a significant impact:
                  </p>
                  <ul className="text-left list-disc pl-8 mb-6 text-xl">
                    <li>Provided {impact.mealsProvided.toLocaleString()} meals</li>
                    <li>Created ${impact.costSavings.toLocaleString()} in value</li>
                    <li>Fed {impact.peopleServedPerDay.toLocaleString()} people for a day</li>
                  </ul>
                  <p className="text-xl">
                    Thank you for helping us end hunger in our community!
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button onClick={this.handleShare} variant="outline" className="bg-white/10">
                    <Share2 className="mr-2 h-4 w-4" /> Share My Impact
                  </Button>
                  <Button onClick={this.resetVolunteerImpact} variant="outline" className="bg-white/10">
                    <RotateCcw className="mr-2 h-4 w-4" /> Start Over
                  </Button>
                </div>
              </div>
            </div>
          );
          
        default:
          return null;
      }
    }

    // Fallback if something goes wrong
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Something went wrong</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">We couldn't calculate your volunteer impact. Please try again.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={this.resetVolunteerImpact}>
              <RotateCcw className="mr-2 h-4 w-4" /> Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
}