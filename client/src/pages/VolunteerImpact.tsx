import { Component, ReactNode, useState, useRef, useEffect } from 'react';
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
import { Brush, DollarSign, Users, Clock, Share2, ArrowLeft, ArrowRight, Heart, Music, Palette } from 'lucide-react';
import AnimatedCounter from '@/components/volunteer/AnimatedCounter';
import AnimatedSlide from '@/components/volunteer/AnimatedSlide';
import AnimatedIcon from '@/components/volunteer/AnimatedIcon';
import CALogo from '@/components/volunteer/CALogo';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { SLIDE_COLORS } from '@/lib/constants';
import { almanacData } from '@shared/schema';

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
  INTRO = 2,
  SUMMARY = 3,
  MEALS = 4,
  COST_SAVINGS = 5,
  PEOPLE_SERVED = 6,
  THANK_YOU = 7
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
  const hours = params.get('hours') || params.get('volunteer_hours');
  const email = params.get('email');
  const firstName = params.get('first_name');
  const shiftName = params.get('shift_name');
  const shiftDate = params.get('shift_date');
  
  return {
    hours: hours ? parseFloat(hours) : undefined,
    email: email || undefined,
    firstName: firstName || undefined,
    shiftName: shiftName || undefined,
    shiftDate: shiftDate || undefined,
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
      const { hours, email, firstName } = getParamsFromURL();
      
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
      
      // Pre-fill the form with values from URL if we're on the welcome screen
      if (this.state.step === SlideNames.WELCOME) {
        // We need to find the form and update it with values from the URL
        setTimeout(() => {
          const hoursInput = document.querySelector('input[name="hours"]') as HTMLInputElement;
          const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
          
          if (hoursInput && hours) {
            hoursInput.value = hours.toString();
          }
          
          if (emailInput && email) {
            emailInput.value = email;
          }
        }, 100);
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
          step: SlideNames.INTRO // Go to the intro slide first
        });
      }, 1800); // Show loading for at least 1.8 seconds
      
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
    // Scroll to top for mobile devices
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    if (this.state.step < SlideNames.THANK_YOU) {
      // If we're on the intro slide, skip the summary slide and go directly to meals
      if (this.state.step === SlideNames.INTRO) {
        this.setState({ step: SlideNames.MEALS });
      } else {
        this.setState(prev => ({
          step: prev.step + 1
        }));
      }
    }
  }

  /**
   * Go to previous slide
   */
  goToPreviousSlide() {
    // Scroll to top for mobile devices
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    if (this.state.step > SlideNames.WELCOME) {
      // If we're on the MEALS slide, go back to the intro slide
      if (this.state.step === SlideNames.MEALS) {
        this.setState({ step: SlideNames.INTRO });
      } else {
        // Handle normal navigation
        this.setState(prev => ({
          step: prev.step - 1
        }));
      }
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
    return this.state.step === SlideNames.MEALS;
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
    // Get parameters from URL in case we have first_name there
    const { firstName } = getParamsFromURL();
    // Create URL with hours and email
    const shareUrl = `${baseUrl}?hours=${this.state.hours}${this.state.volunteerEmail ? `&email=${encodeURIComponent(this.state.volunteerEmail)}` : ''}${firstName ? `&first_name=${encodeURIComponent(firstName)}` : ''}`;
    
    // Build share text with name if available
    const shareText = firstName 
      ? `${firstName} volunteered ${this.state.hours} hours at Community Food Share! See the impact:`
      : `I volunteered ${this.state.hours} hours at Community Food Share! See the impact:`;
    
    // Use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'My Volunteer Impact',
        text: shareText,
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
    // Get URL parameters for the intro slide
    const { firstName, shiftName, shiftDate } = getParamsFromURL();

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f0f9f4] to-white p-2 sm:p-4 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {step === SlideNames.WELCOME && (
            <WelcomeSlide key="welcome" onSubmit={this.handleHoursSubmit} />
          )}

          {step === SlideNames.LOADING && (
            <LoadingSlide key="loading" />
          )}
          
          {step === SlideNames.INTRO && impact && (
            <IntroSlide 
              key="intro"
              firstName={firstName}
              shiftName={shiftName}
              shiftDate={shiftDate}
              hours={hours}
              onNext={this.goToNextSlide}
              onPrevious={this.goToPreviousSlide}
              isFirstSlide={false}
              isLastSlide={false}
            />
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
        
        {/* Community Food Share Logo */}
        <div className="mt-4 text-center">
          <p className="text-[#0c4428] text-xs">
            © Community Food Share {new Date().getFullYear()}
          </p>
        </div>
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
      <Card className="w-full overflow-hidden">
        <CardHeader className="text-center bg-[#0c4428] text-white rounded-t-lg">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <CardTitle className="text-2xl font-bold">Volunteer Impact</CardTitle>
            <CardDescription className="text-white opacity-90">See how your time helps our community</CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent className="pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className="w-24 h-24 rounded-full bg-[#e6f2ed] flex items-center justify-center">
              <Clock className="h-12 w-12 text-[#227d7f]" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <FormField
                    control={form.control}
                    name="hours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#414042]">Hours Volunteered</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0.5" 
                            step="0.5" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            className="border-[#227d7f]/30 focus:border-[#227d7f] focus:ring-1 focus:ring-[#227d7f]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                
                <motion.div
                  initial={{ x: 10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#414042]">Email (optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="your.email@example.com" 
                            {...field} 
                            className="border-[#227d7f]/30 focus:border-[#227d7f] focus:ring-1 focus:ring-[#227d7f]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                  className="pt-2"
                >
                  <Button 
                    type="submit" 
                    className="w-full bg-[#8dc53e] hover:bg-[#7db32a] text-white border-none"
                    size="lg"
                  >
                    Calculate My Impact
                  </Button>
                </motion.div>
              </form>
            </Form>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-[#414042]">
              Together, we're igniting creativity in the next generation. Every teaching artist hour matters!
            </p>
          </motion.div>
          
          {/* Add CFS Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="mt-6"
          >
            <CALogo height={50} />
          </motion.div>
        </CardContent>
      </Card>
    </AnimatedSlide>
  );
};

const LoadingSlide = () => (
  <AnimatedSlide className="w-full max-w-md text-center">
    <Card className="w-full overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[#0c4428] to-[#227d7f] text-white">
        <CardTitle className="text-2xl font-bold">Calculating Your Impact</CardTitle>
        <CardDescription className="text-white opacity-90">
          Measuring the power of your volunteer time
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="relative w-24 h-24 mb-8">
          <motion.div
            className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-[#e6f2ed] border-t-[#0c4428]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute top-4 left-4 w-16 h-16 rounded-full border-4 border-[#e6f8f8] border-t-[#227d7f]"
            initial={{ rotate: 45 }}
            animate={{ rotate: 405 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute top-8 left-8 w-8 h-8 rounded-full border-4 border-[#f3ffd7] border-t-[#8dc53e]"
            initial={{ rotate: 90 }}
            animate={{ rotate: 450 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <h3 className="text-xl font-semibold mb-3 text-[#0c4428]">Analyzing Your Contribution</h3>
          <p className="text-[#414042] mb-6">
            Please wait while we calculate the impact of your volunteer hours...
          </p>
          
          <div className="space-y-3">
            <motion.div 
              className="h-2 bg-[#e6f2ed] rounded-full overflow-hidden"
              initial={{ width: '100%', opacity: 0.7 }}
              animate={{ opacity: 1 }}
            >
              <motion.div 
                className="h-full bg-[#0c4428] rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <motion.div 
              className="h-2 bg-[#e6f8f8] rounded-full overflow-hidden"
              initial={{ width: '100%', opacity: 0.7 }}
              animate={{ opacity: 1 }}
            >
              <motion.div 
                className="h-full bg-[#227d7f] rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.4, repeat: Infinity, delay: 0.2 }}
              />
            </motion.div>
            <motion.div 
              className="h-2 bg-[#f3ffd7] rounded-full overflow-hidden"
              initial={{ width: '100%', opacity: 0.7 }}
              animate={{ opacity: 1 }}
            >
              <motion.div 
                className="h-full bg-[#8dc53e] rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.8, repeat: Infinity, delay: 0.4 }}
              />
            </motion.div>
          </div>
          
          {/* Add CFS Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="mt-6"
          >
            <CFSLogo height={40} />
          </motion.div>
        </motion.div>
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
      <Button variant="outline" onClick={onPrevious} className="border-[#227d7f] text-[#227d7f] hover:bg-[#227d7f] hover:text-white">
        <ArrowLeft className="mr-2 h-4 w-4" /> Previous
      </Button>
    )}
    {!isFirstSlide && isLastSlide && (
      <div />
    )}
    {!isLastSlide && onNext && (
      <Button variant="outline" onClick={onNext} className="ml-auto border-[#227d7f] text-[#227d7f] hover:bg-[#227d7f] hover:text-white">
        Next <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    )}
  </div>
);

const SummarySlide = ({ impact, onNext, isFirstSlide, isLastSlide }: ImpactSlideProps) => {
  // Create staggered animation effect
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <AnimatedSlide className="w-full max-w-md">
      <Card className="w-full overflow-hidden">
        <CardHeader className="text-center bg-[#0c4428] text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Your Volunteer Impact</CardTitle>
          <CardDescription className="text-white opacity-90">Thank you for your service!</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 sm:pt-8 space-y-5 sm:space-y-6">
          <motion.div
            className="flex flex-col items-center space-y-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20, 
                delay: 0.3 
              }}
            >
              <Clock className="h-16 w-16 text-[#227d7f] mb-3" />
            </motion.div>
            <p className="text-lg font-semibold text-[#414042]">You volunteered</p>
            <p className="text-4xl font-bold text-[#0c4428]">{impact.hoursWorked} {impact.hoursWorked === 1 ? 'hour' : 'hours'}</p>
          </motion.div>
          
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.7 }}
          >
            <motion.div 
              className="flex flex-col items-center p-3 sm:p-4 rounded-lg bg-[#e6f2ed] border border-[#0c4428]/20 shadow-sm hover:shadow-md transition-shadow"
              variants={itemVariants}
            >
              <AnimatedIcon icon={Palette} size={32} color="#6A1B9A" className="mb-2" />
              <p className="text-sm font-medium text-[#0c4428]">Meals</p>
              <p className="text-lg sm:text-xl font-semibold text-[#0c4428]">
                <AnimatedCounter value={impact.mealsProvided} duration={2} />
              </p>
            </motion.div>
            
            <motion.div 
              className="flex flex-col items-center p-3 sm:p-4 rounded-lg bg-[#e6f8f8] border border-[#227d7f]/20 shadow-sm hover:shadow-md transition-shadow"
              variants={itemVariants}
            >
              <AnimatedIcon icon={DollarSign} size={32} color="#227d7f" className="mb-2" />
              <p className="text-sm font-medium text-[#227d7f]">Value</p>
              <p className="text-lg sm:text-xl font-semibold text-[#227d7f]">
                <AnimatedCounter 
                  value={impact.costSavings} 
                  formatter={val => formatCurrency(val)} 
                  duration={2}
                />
              </p>
            </motion.div>
            
            <motion.div 
              className="flex flex-col items-center p-3 sm:p-4 rounded-lg bg-[#f3ffd7] border border-[#8dc53e]/20 shadow-sm hover:shadow-md transition-shadow"
              variants={itemVariants}
            >
              <AnimatedIcon icon={Users} size={32} color="#8dc53e" className="mb-2" />
              <p className="text-sm font-medium text-[#414042]">People Fed</p>
              <p className="text-lg sm:text-xl font-semibold text-[#414042]">
                <AnimatedCounter value={impact.peopleServedPerDay} duration={2} />
              </p>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="bg-[#f0f9f4] p-4 sm:p-5 rounded-lg border border-[#0c4428]/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <p className="text-center text-[#0c4428]">
              Your volunteer time directly impacts our ability to serve the community. 
              <span className="block mt-1 font-medium">Together, we're inspiring creativity in the next generation of change makers.</span>
            </p>
          </motion.div>
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
};

const MealsSlide = ({ impact, onNext, onPrevious, isFirstSlide, isLastSlide }: ImpactSlideProps) => {
  const [animationComplete, setAnimationComplete] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate the progress bar
    if (barRef.current) {
      const animation = barRef.current.animate(
        [{ width: '0%' }, { width: '80%' }],
        {
          duration: 1500,
          fill: 'forwards',
          easing: 'ease-out',
        }
      );

      animation.onfinish = () => setAnimationComplete(true);

      return () => {
        animation.cancel();
      };
    }
  }, []);

  return (
    <AnimatedSlide className="w-full max-w-md">
      <Card className="w-full overflow-hidden">
        <CardHeader className="text-center bg-[#0c4428] text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-white">Your Service Provided</CardTitle>
          <CardDescription className="text-white opacity-90">
            Making meals possible
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 sm:pt-6 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatedIcon icon={Palette} size={46} color="#6A1B9A" className="mb-4" />
          </motion.div>
          
          <div className="text-center mb-6 sm:mb-8">
            <motion.div 
              className="text-5xl sm:text-6xl font-bold mb-2 text-[#0c4428]"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <AnimatedCounter value={impact.mealsProvided} duration={2.5} />
            </motion.div>
            <motion.p 
              className="text-xl text-[#414042]"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              Nutritious Meals
            </motion.p>
          </div>
          
          <div className="w-full bg-[#e6f2ed] h-3 rounded-full mb-6">
            <div ref={barRef} className="bg-[#0c4428] h-3 rounded-full w-0"></div>
          </div>
          
          <motion.div 
            className="bg-[#f0f9f4] p-4 sm:p-5 rounded-lg w-full mb-5 sm:mb-6 border border-[#0c4428]/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p className="text-center text-[#0c4428]">
              Each hour of volunteer time helps us provide <span className="font-bold">55 nutritious meals</span> to families in need.
            </p>
          </motion.div>
          
          <motion.div 
            className="mt-2 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: animationComplete ? 1 : 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-[#414042]">
              That's enough to feed <span className="font-bold text-[#0c4428]">{Math.round(impact.mealsProvided / 3)} people</span> for an entire day!
            </p>
          </motion.div>
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
};

const CostSavingsSlide = ({ impact, onNext, onPrevious, isFirstSlide, isLastSlide }: ImpactSlideProps) => {
  const [animationComplete, setAnimationComplete] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate the progress bar
    if (barRef.current) {
      const animation = barRef.current.animate(
        [{ width: '0%' }, { width: '75%' }],
        {
          duration: 1800,
          fill: 'forwards',
          easing: 'ease-out',
        }
      );

      animation.onfinish = () => setAnimationComplete(true);

      return () => {
        animation.cancel();
      };
    }
  }, []);

  return (
    <AnimatedSlide className="w-full max-w-md">
      <Card className="w-full overflow-hidden">
        <CardHeader className="text-center bg-[#227d7f] text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Economic Impact</CardTitle>
          <CardDescription className="text-white opacity-90">
            The value of your time
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatedIcon icon={DollarSign} size={56} color="#227d7f" className="mb-4" />
          </motion.div>
          
          <div className="text-center mb-8">
            <motion.div 
              className="text-6xl font-bold mb-2 text-[#227d7f]"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <AnimatedCounter 
                value={impact.costSavings} 
                formatter={val => formatCurrency(val)} 
                duration={2.5}
              />
            </motion.div>
            <motion.p 
              className="text-xl text-[#414042]"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              Economic Value
            </motion.p>
          </div>
          
          {/* Visual representation of value with growing bar */}
          <div className="w-full bg-[#e6f8f8] h-3 rounded-full mb-6">
            <div ref={barRef} className="bg-[#227d7f] h-3 rounded-full w-0"></div>
          </div>
          
          <motion.div 
            className="bg-[#e6f8f8] p-5 rounded-lg w-full mb-6 border border-[#227d7f]/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p className="text-center text-[#227d7f]">
              Your volunteer time is valued at <span className="font-bold">${almanacData.valuePerVolunteerHour.toFixed(2)} per hour</span>, allowing us to allocate more resources to food programs.
            </p>
          </motion.div>
          
          <motion.div 
            className="mt-2 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: animationComplete ? 1 : 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-[#414042]">
              This value represents the operational cost savings that directly impacts our ability to serve more people in the community.
            </p>
          </motion.div>
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
};

const PeopleServedSlide = ({ impact, onNext, onPrevious, isFirstSlide, isLastSlide }: ImpactSlideProps) => {
  const [animationComplete, setAnimationComplete] = useState(false);
  const peopleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate the people counter with growing dots
    if (peopleRef.current) {
      const animation = peopleRef.current.animate(
        [{ width: '0%' }, { width: '85%' }],
        {
          duration: 2000,
          fill: 'forwards',
          easing: 'ease-out',
        }
      );

      animation.onfinish = () => setAnimationComplete(true);

      return () => {
        animation.cancel();
      };
    }
  }, []);

  return (
    <AnimatedSlide className="w-full max-w-md">
      <Card className="w-full overflow-hidden">
        <CardHeader className="text-center bg-[#8dc53e] text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Community Impact</CardTitle>
          <CardDescription className="text-white opacity-90">
            Neighbors fed daily
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatedIcon icon={Users} size={56} color="#8dc53e" className="mb-4" />
          </motion.div>
          
          <div className="text-center mb-8">
            <motion.div 
              className="text-6xl font-bold mb-2 text-[#8dc53e]"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <AnimatedCounter value={impact.peopleServedPerDay} duration={2} />
            </motion.div>
            <motion.p 
              className="text-xl text-[#414042]"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              People Fed Daily
            </motion.p>
          </div>
          
          {/* People visualization */}
          <div className="w-full h-10 bg-[#f3ffd7] rounded-lg mb-6 relative overflow-hidden">
            <div 
              ref={peopleRef} 
              className="h-10 rounded-lg flex items-center justify-start overflow-hidden"
              style={{ width: '0%' }}
            >
              <div className="flex flex-wrap">
                {Array.from({ length: Math.min(100, impact.peopleServedPerDay) }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-2 w-2 rounded-full mx-1 my-1 bg-[#8dc53e]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.01 * i + 1 }}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <motion.div 
            className="bg-[#f3ffd7] p-5 rounded-lg w-full mb-6 border border-[#8dc53e]/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p className="text-center text-[#414042]">
              Your volunteer hours help us serve <span className="font-bold text-[#0c4428]">{impact.peopleServedPerDay} people</span> for an entire day with nutritious meals.
            </p>
          </motion.div>
          
          <motion.div 
            className="mt-2 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: animationComplete ? 1 : 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-[#414042]">
              Each person receives <span className="font-bold">3 meals per day</span>, which means your time helps provide a total of <span className="font-bold text-[#8dc53e]">{impact.mealsProvided} meals</span> to those in need.
            </p>
          </motion.div>
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
};

// Define intro slide props interface
interface IntroSlideProps extends SlideProps {
  firstName?: string;
  shiftName?: string;
  shiftDate?: string;
  hours: number;
}

// Create the IntroSlide component
const IntroSlide = ({ 
  firstName, 
  shiftName, 
  shiftDate, 
  hours, 
  onNext, 
  onPrevious, 
  isFirstSlide, 
  isLastSlide 
}: IntroSlideProps) => {
  const formattedDate = shiftDate ? new Date(shiftDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }) : '';

  const shiftReference = shiftName ? 
    `during your ${shiftName} shift` : 
    shiftDate ? 
      `on ${formattedDate}` : 
      '';

  return (
    <AnimatedSlide className="w-full max-w-md">
      <Card className="w-full overflow-hidden">
        <CardHeader className="text-center bg-[#0c4428] text-white rounded-t-lg">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <CardTitle className="text-2xl font-bold text-white">Welcome to Your Impact</CardTitle>
            <CardDescription className="text-white opacity-90">
              See the difference you're making
            </CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent className="pt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className="w-24 h-24 rounded-full bg-[#e6f2ed] flex items-center justify-center">
              <Heart className="h-12 w-12 text-[#227d7f]" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-4 text-center"
          >
            <h3 className="text-3xl font-bold text-[#0c4428] mb-2">
              {firstName ? `Hi ${firstName}!` : "Thank You!"}
            </h3>
            
            <p className="text-[#414042] leading-relaxed text-lg">
              {firstName 
                ? `Thank you for dedicating your time to inspire creativity in students across our community.`
                : `Your teaching artist contribution is making a significant impact in our mission to bring arts education to all students.`
              }
            </p>
            
            <p className="text-[#414042] leading-relaxed font-medium text-lg">
              {`You volunteered ${hours} ${hours === 1 ? 'hour' : 'hours'} ${shiftReference}.`}
            </p>
          
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="pt-4"
            >
              <p className="text-[#227d7f] font-bold text-xl mt-2">
                Let's explore the impact of your generosity!
              </p>
            </motion.div>
          </motion.div>
          
          <SlideNavigation 
            onNext={onNext} 
            onPrevious={onPrevious}
            isFirstSlide={isFirstSlide}
            isLastSlide={isLastSlide}
          />
          
          {/* Add CFS Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="mt-6 flex justify-center"
          >
            <CFSLogo height={40} />
          </motion.div>
        </CardContent>
      </Card>
    </AnimatedSlide>
  );
};

interface ThankYouSlideProps extends SlideProps {
  hours: number;
  onReset: () => void;
  onShare: () => void;
}

const ThankYouSlide = ({ hours, onReset, onShare, onPrevious, isFirstSlide, isLastSlide }: ThankYouSlideProps) => {
  // Get first name from URL if available
  const { firstName } = getParamsFromURL();
  // Create staggered animation effect for stats
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <AnimatedSlide className="w-full max-w-md">
      <Card className="w-full overflow-hidden">
        <CardHeader className="text-center bg-[#0c4428] text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-white">
            {firstName ? `Thank You, ${firstName}!` : 'Thank You!'}
          </CardTitle>
          <CardDescription className="text-white opacity-90">Your time makes a difference</CardDescription>
        </CardHeader>
        <CardContent className="pt-8 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.3
            }}
            className="w-28 h-28 rounded-full bg-[#e6f2ed] flex items-center justify-center mb-6"
          >
            <div className="text-[#0c4428] text-5xl">❤️</div>
          </motion.div>
          
          <motion.div 
            className="text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <h3 className="text-xl font-semibold mb-2 text-[#0c4428]">Every Hour Counts</h3>
            <p className="text-[#414042]">
              {firstName 
                ? `${firstName}, your ${hours} ${hours === 1 ? 'hour' : 'hours'} of service has a real, measurable impact on our community.` 
                : `Your ${hours} ${hours === 1 ? 'hour' : 'hours'} of service has a real, measurable impact on our community.`
              }
            </p>
          </motion.div>
          
          {/* Impact summary with staggered animation */}
          <motion.div
            className="w-full grid grid-cols-3 gap-3 mb-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="bg-[#e6f2ed] p-3 rounded-lg text-center border border-[#0c4428]/10"
              variants={itemVariants}
            >
              <div className="text-[#0c4428] font-bold text-lg mb-1">{hours * 55}</div>
              <div className="text-xs text-[#0c4428]">Meals</div>
            </motion.div>
            <motion.div 
              className="bg-[#e6f8f8] p-3 rounded-lg text-center border border-[#227d7f]/10"
              variants={itemVariants}
            >
              <div className="text-[#227d7f] font-bold text-lg mb-1">${(hours * 36.36).toFixed(0)}</div>
              <div className="text-xs text-[#227d7f]">Value</div>
            </motion.div>
            <motion.div 
              className="bg-[#f3ffd7] p-3 rounded-lg text-center border border-[#8dc53e]/10"
              variants={itemVariants}
            >
              <div className="text-[#8dc53e] font-bold text-lg mb-1">{Math.floor(hours * 55 / 3)}</div>
              <div className="text-xs text-[#414042]">People Fed</div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="w-full bg-[#f0f9f4] p-5 rounded-lg mb-6 border border-[#0c4428]/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <p className="text-center text-[#0c4428]">
              Community Food Share relies on volunteers like you to fulfill our mission of providing healthy food to those in need.
            </p>
          </motion.div>
          
          {/* Add CFS Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            className="w-full flex justify-end mt-4 mb-2"
          >
            <CFSLogo height={40} />
          </motion.div>
          
          <motion.div 
            className="flex space-x-4 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <Button variant="outline" className="flex-1" onClick={onReset}>
              Start Over
            </Button>
            <Button variant="secondary" className="flex-1" onClick={onShare}>
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          </motion.div>
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
};

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