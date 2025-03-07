import { Component, ReactNode } from 'react';
import { RouteComponentProps } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Utensils, DollarSign, Users, Clock, Share2, ArrowLeft, ArrowRight } from 'lucide-react';
import AnimatedCounter from '@/components/volunteer/AnimatedCounter';
import AnimatedSlide from '@/components/volunteer/AnimatedSlide';
import AnimatedIcon from '@/components/volunteer/AnimatedIcon';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { SLIDE_COLORS } from '@/lib/constants';

// Types for volunteer impact
interface VolunteerImpactType {
  hoursWorked: number;
  mealsProvided: number;
  costSavings: number;
  peopleServedPerDay: number;
}

// State interface for the component
interface VolunteerImpactState {
  hours: number;
  step: number;
  impact: VolunteerImpactType | null;
  isLoading: boolean;
  error: string | null;
  volunteerEmail: string | null;
}

// Define slide names as an enum for better organization
enum SlideNames {
  WELCOME = 0,
  LOADING = 1,
  SUMMARY = 2,
  MEALS = 3,
  COST_SAVINGS = 4,
  PEOPLE_SERVED = 5,
  THANK_YOU = 6
}

// Form schema for volunteer hours
const formSchema = z.object({
  hours: z.number().positive("Hours must be a positive number").max(1000, "Hours must be 1000 or less"),
  email: z.string().email("Please enter a valid email").optional(),
});

type FormValues = z.infer<typeof formSchema>;

/**
 * Gets parameters from the URL
 * Returns all URL parameters for preservation during navigation
 */
function getParamsFromURL() {
  const params = new URLSearchParams(window.location.search);
  const hours = params.get('hours');
  const email = params.get('email');
  
  return {
    hours: hours ? parseFloat(hours) : undefined,
    email: email || undefined,
    allParams: window.location.search
  };
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

    // Bind methods to this
    this.handleHoursSubmit = this.handleHoursSubmit.bind(this);
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
      const { hours, email } = getParamsFromURL();
      
      if (hours && hours > 0) {
        // If email is provided, try to fetch volunteer info
        if (email) {
          this.fetchVolunteerInfo(email).then(found => {
            if (found) {
              this.setState({ volunteerEmail: email });
            }
            this.handleHoursSubmit(hours, email);
          });
        } else {
          // Just calculate impact with hours
          this.handleHoursSubmit(hours);
        }
      }
      
      this.hasCheckedParams = true;
    }
  }

  /**
   * Fetch volunteer information by email
   */
  async fetchVolunteerInfo(email: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/volunteer/${encodeURIComponent(email)}`);
      if (response.ok) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error fetching volunteer info:", error);
      return false;
    }
  }

  /**
   * Handle hours form submission
   */
  handleHoursSubmit(hours: number, email?: string) {
    this.setState({
      hours,
      step: SlideNames.LOADING,
      isLoading: true,
      volunteerEmail: email || this.state.volunteerEmail
    });

    if (email) {
      // Log volunteer shift if email is provided
      this.logVolunteerShift(hours, email)
        .then(() => this.calculateImpact(hours))
        .catch(error => {
          console.error("Error logging volunteer shift:", error);
          this.calculateImpact(hours);
        });
    } else {
      // Just calculate impact
      this.calculateImpact(hours);
    }
  }

  /**
   * Log a volunteer shift to the server
   */
  async logVolunteerShift(hours: number, email: string) {
    try {
      const response = await fetch('/api/log-volunteer-shift', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          hours
        })
      });

      if (!response.ok) {
        throw new Error('Failed to log volunteer shift');
      }

      return await response.json();
    } catch (error) {
      console.error('Error logging volunteer shift:', error);
      throw error;
    }
  }

  /**
   * Calculate impact via the server API
   */
  async calculateImpact(hours: number) {
    try {
      const response = await fetch(`/api/calculate-volunteer-impact?hours=${encodeURIComponent(hours)}`);

      if (!response.ok) {
        throw new Error('Failed to calculate impact');
      }

      const impact = await response.json();
      
      // Delay to ensure loading animation is shown
      setTimeout(() => {
        this.setState({
          impact,
          isLoading: false,
          step: SlideNames.SUMMARY
        });
      }, 1500); // Show loading for at least 1.5 seconds
      
    } catch (error) {
      console.error('Error calculating impact:', error);
      this.setState({
        isLoading: false,
        error: 'Failed to calculate impact. Please try again.',
        step: SlideNames.WELCOME
      });
    }
  }

  /**
   * Go to next slide
   */
  goToNextSlide() {
    if (this.state.step < SlideNames.THANK_YOU) {
      this.setState(prev => ({
        step: prev.step + 1
      }));
    }
  }

  /**
   * Go to previous slide
   */
  goToPreviousSlide() {
    if (this.state.step > SlideNames.SUMMARY) {
      this.setState(prev => ({
        step: prev.step - 1
      }));
    }
  }

  /**
   * Reset to beginning
   */
  resetVolunteerImpact() {
    this.setState({
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
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?hours=${this.state.hours}${this.state.volunteerEmail ? `&email=${encodeURIComponent(this.state.volunteerEmail)}` : ''}`;
    
    // Use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'My Volunteer Impact',
        text: `I volunteered ${this.state.hours} hours at Community Food Share! See the impact:`,
        url: shareUrl,
      }).catch((error) => {
        console.log('Error sharing', error);
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
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        // Show toast
        const toast = (useToast as any)();
        if (toast) {
          toast({
            title: "Link copied to clipboard",
            description: "Share this link to show others your volunteer impact!",
            duration: 3000,
          });
        }
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  }

  render() {
    const { step, impact, isLoading, error, hours } = this.state;

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {step === SlideNames.WELCOME && (
            <WelcomeSlide key="welcome" onSubmit={this.handleHoursSubmit} />
          )}

          {step === SlideNames.LOADING && (
            <LoadingSlide key="loading" />
          )}

          {step === SlideNames.SUMMARY && impact && (
            <SummarySlide 
              key="summary" 
              impact={impact} 
              onNext={this.goToNextSlide}
              isFirstSlide={this.isFirstSlide()}
              isLastSlide={this.isLastSlide()}
            />
          )}

          {step === SlideNames.MEALS && impact && (
            <MealsSlide 
              key="meals" 
              impact={impact}
              onNext={this.goToNextSlide}
              onPrevious={this.goToPreviousSlide}
              isFirstSlide={this.isFirstSlide()}
              isLastSlide={this.isLastSlide()}
            />
          )}

          {step === SlideNames.COST_SAVINGS && impact && (
            <CostSavingsSlide 
              key="cost" 
              impact={impact}
              onNext={this.goToNextSlide}
              onPrevious={this.goToPreviousSlide}
              isFirstSlide={this.isFirstSlide()}
              isLastSlide={this.isLastSlide()}
            />
          )}

          {step === SlideNames.PEOPLE_SERVED && impact && (
            <PeopleServedSlide 
              key="people" 
              impact={impact}
              onNext={this.goToNextSlide}
              onPrevious={this.goToPreviousSlide}
              isFirstSlide={this.isFirstSlide()}
              isLastSlide={this.isLastSlide()}
            />
          )}

          {step === SlideNames.THANK_YOU && impact && (
            <ThankYouSlide 
              key="thanks" 
              hours={hours}
              onReset={this.resetVolunteerImpact}
              onShare={this.handleShare}
              onPrevious={this.goToPreviousSlide}
              isFirstSlide={this.isFirstSlide()}
              isLastSlide={this.isLastSlide()}
            />
          )}

          {error && (
            <ErrorMessage error={error} />
          )}
        </AnimatePresence>
      </div>
    );
  }
}

// Subcomponents for slides

const WelcomeSlide = ({ onSubmit }: { onSubmit: (hours: number, email?: string) => void }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hours: 1,
      email: '',
    },
  });

  function handleSubmit(values: FormValues) {
    onSubmit(values.hours, values.email);
  }

  return (
    <AnimatedSlide className="w-full max-w-md">
      <Card className="w-full">
        <CardHeader className="text-center bg-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Volunteer Impact</CardTitle>
          <CardDescription className="text-blue-100">See how your time helps our community</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours Volunteered</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0.5" 
                        step="0.5" 
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (optional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full">Calculate My Impact</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AnimatedSlide>
  );
};

const LoadingSlide = () => (
  <AnimatedSlide className="w-full max-w-md text-center">
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Calculating Your Impact</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-10">
        <div className="relative w-20 h-20">
          <motion.div
            className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-blue-300 border-t-blue-600"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <p className="mt-6 text-gray-600">Please wait while we calculate the impact of your volunteer hours...</p>
      </CardContent>
    </Card>
  </AnimatedSlide>
);

interface SlideProps {
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
}

interface ImpactSlideProps extends SlideProps {
  impact: VolunteerImpactType;
}

const SlideNavigation = ({ onNext, onPrevious, isFirstSlide, isLastSlide }: SlideProps) => (
  <div className="flex justify-between w-full mt-4">
    {!isFirstSlide && onPrevious && (
      <Button variant="outline" onClick={onPrevious}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Previous
      </Button>
    )}
    {!isFirstSlide && isLastSlide && (
      <div />
    )}
    {!isLastSlide && onNext && (
      <Button className="ml-auto" onClick={onNext}>
        Next <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    )}
  </div>
);

const SummarySlide = ({ impact, onNext, isFirstSlide, isLastSlide }: ImpactSlideProps) => (
  <AnimatedSlide className="w-full max-w-md">
    <Card className="w-full">
      <CardHeader className="text-center bg-blue-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl font-bold">Your Volunteer Impact</CardTitle>
        <CardDescription className="text-blue-100">Thank you for your service!</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <Clock className="h-12 w-12 text-blue-600 mb-2" />
          <p className="text-lg font-semibold">You volunteered</p>
          <p className="text-3xl font-bold">{impact.hoursWorked} hours</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center p-2 rounded-lg bg-blue-50">
            <AnimatedIcon icon={Utensils} size={28} color="#2563eb" className="mb-2" />
            <p className="text-sm font-medium">Meals</p>
            <p className="text-xl font-semibold">
              <AnimatedCounter value={impact.mealsProvided} />
            </p>
          </div>
          
          <div className="flex flex-col items-center p-2 rounded-lg bg-green-50">
            <AnimatedIcon icon={DollarSign} size={28} color="#059669" className="mb-2" delay={0.2} />
            <p className="text-sm font-medium">Value</p>
            <p className="text-xl font-semibold">
              <AnimatedCounter 
                value={impact.costSavings} 
                formatter={val => formatCurrency(val)} 
                duration={2}
              />
            </p>
          </div>
          
          <div className="flex flex-col items-center p-2 rounded-lg bg-amber-50">
            <AnimatedIcon icon={Users} size={28} color="#d97706" className="mb-2" delay={0.4} />
            <p className="text-sm font-medium">People Fed</p>
            <p className="text-xl font-semibold">
              <AnimatedCounter value={impact.peopleServedPerDay} />
            </p>
          </div>
        </div>
        
        <p className="text-center text-gray-600 text-sm">
          Your time makes a real difference in our community!
        </p>
      </CardContent>
      <CardFooter>
        <SlideNavigation 
          onNext={onNext} 
          isFirstSlide={isFirstSlide} 
          isLastSlide={isLastSlide} 
        />
      </CardFooter>
    </Card>
  </AnimatedSlide>
);

const MealsSlide = ({ impact, onNext, onPrevious, isFirstSlide, isLastSlide }: ImpactSlideProps) => (
  <AnimatedSlide className="w-full max-w-md">
    <Card className="w-full">
      <CardHeader className="text-center bg-blue-600 text-white rounded-t-lg">
        <CardTitle className="text-xl font-bold">Meals Provided</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 flex flex-col items-center">
        <AnimatedIcon icon={Utensils} size={48} color="#2563eb" className="mb-6" />
        
        <div className="text-center mb-6">
          <p className="text-5xl font-bold mb-2">
            <AnimatedCounter value={impact.mealsProvided} duration={2} />
          </p>
          <p className="text-lg text-gray-600">meals provided</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg w-full">
          <p className="text-center">
            Each hour of volunteer time helps us provide approximately 55 nutritious meals to families in need.
          </p>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            That's enough to feed {Math.round(impact.mealsProvided / 3)} people for a day!
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <SlideNavigation 
          onNext={onNext} 
          onPrevious={onPrevious} 
          isFirstSlide={isFirstSlide} 
          isLastSlide={isLastSlide} 
        />
      </CardFooter>
    </Card>
  </AnimatedSlide>
);

const CostSavingsSlide = ({ impact, onNext, onPrevious, isFirstSlide, isLastSlide }: ImpactSlideProps) => (
  <AnimatedSlide className="w-full max-w-md">
    <Card className="w-full">
      <CardHeader className="text-center bg-green-600 text-white rounded-t-lg">
        <CardTitle className="text-xl font-bold">Cost Savings</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 flex flex-col items-center">
        <AnimatedIcon icon={DollarSign} size={48} color="#059669" className="mb-6" />
        
        <div className="text-center mb-6">
          <p className="text-5xl font-bold mb-2">
            <AnimatedCounter 
              value={impact.costSavings} 
              formatter={val => formatCurrency(val)} 
              duration={2.5}
            />
          </p>
          <p className="text-lg text-gray-600">value provided</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg w-full">
          <p className="text-center">
            Your volunteer time is valued at $36.36 per hour, allowing us to allocate more resources directly to food programs.
          </p>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            This value represents the operational cost savings that can be redirected to food acquisition and distribution.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <SlideNavigation 
          onNext={onNext} 
          onPrevious={onPrevious} 
          isFirstSlide={isFirstSlide} 
          isLastSlide={isLastSlide} 
        />
      </CardFooter>
    </Card>
  </AnimatedSlide>
);

const PeopleServedSlide = ({ impact, onNext, onPrevious, isFirstSlide, isLastSlide }: ImpactSlideProps) => (
  <AnimatedSlide className="w-full max-w-md">
    <Card className="w-full">
      <CardHeader className="text-center bg-amber-600 text-white rounded-t-lg">
        <CardTitle className="text-xl font-bold">People Served</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 flex flex-col items-center">
        <AnimatedIcon icon={Users} size={48} color="#d97706" className="mb-6" />
        
        <div className="text-center mb-6">
          <p className="text-5xl font-bold mb-2">
            <AnimatedCounter value={impact.peopleServedPerDay} duration={2} />
          </p>
          <p className="text-lg text-gray-600">people fed per day</p>
        </div>
        
        <div className="bg-amber-50 p-4 rounded-lg w-full">
          <p className="text-center">
            Your volunteer hours help us serve approximately {impact.peopleServedPerDay} people for an entire day.
          </p>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Each person receives 3 meals per day, which means your time provides {impact.mealsProvided} total meals.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <SlideNavigation 
          onNext={onNext} 
          onPrevious={onPrevious} 
          isFirstSlide={isFirstSlide} 
          isLastSlide={isLastSlide} 
        />
      </CardFooter>
    </Card>
  </AnimatedSlide>
);

interface ThankYouSlideProps extends SlideProps {
  hours: number;
  onReset: () => void;
  onShare: () => void;
}

const ThankYouSlide = ({ hours, onReset, onShare, onPrevious, isFirstSlide, isLastSlide }: ThankYouSlideProps) => (
  <AnimatedSlide className="w-full max-w-md">
    <Card className="w-full">
      <CardHeader className="text-center bg-purple-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl font-bold">Thank You!</CardTitle>
        <CardDescription className="text-purple-100">Your time makes a difference</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 flex flex-col items-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.3
          }}
          className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center"
        >
          <div className="text-purple-600 text-5xl">❤️</div>
        </motion.div>
        
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Every Hour Counts</h3>
          <p className="text-gray-600">
            Your {hours} {hours === 1 ? 'hour' : 'hours'} of service has a real, measurable impact on our community.
          </p>
        </div>
        
        <div className="w-full bg-purple-50 p-4 rounded-lg">
          <p className="text-center text-purple-800">
            Community Food Share relies on volunteers like you to fulfill our mission of providing healthy food to those in need.
          </p>
        </div>
        
        <div className="flex space-x-4 w-full">
          <Button variant="outline" className="flex-1" onClick={onReset}>
            Start Over
          </Button>
          <Button variant="secondary" className="flex-1" onClick={onShare}>
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <SlideNavigation 
          onPrevious={onPrevious} 
          isFirstSlide={isFirstSlide} 
          isLastSlide={isLastSlide} 
        />
      </CardFooter>
    </Card>
  </AnimatedSlide>
);

const ErrorMessage = ({ error }: { error: string }) => (
  <AnimatedSlide className="w-full max-w-md">
    <Card className="w-full border-red-300">
      <CardHeader className="text-center bg-red-600 text-white rounded-t-lg">
        <CardTitle>Error</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-center text-red-600">{error}</p>
      </CardContent>
      <CardFooter className="justify-center">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </CardFooter>
    </Card>
  </AnimatedSlide>
);