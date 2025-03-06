import { Component } from "react";
import { RouteComponentProps } from "wouter";
import { SlideNames, DonationState } from "@/types/donation";
import WelcomeScreen from "@/components/donation/WelcomeScreen";
import LoadingScreen from "@/components/donation/LoadingScreen";
import DonorSummarySlide from "@/components/donation/DonorSummarySlide";
import MealsSlide from "@/components/donation/MealsSlide";
import NutritionSlide from "@/components/donation/NutritionSlide";
import PeopleSlide from "@/components/donation/PeopleSlide";
import EnvironmentSlide from "@/components/donation/EnvironmentSlide";
import FoodRescueSlide from "@/components/donation/FoodRescueSlide";
import VolunteerSlide from "@/components/donation/VolunteerSlide";
import PartnerSlide from "@/components/donation/PartnerSlide";
import SummarySlide from "@/components/donation/SummarySlide";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { DonationImpact as DonationImpactType } from "@shared/schema";
import { calculateDonationImpact } from "@/lib/donation-calculator";
import { SLIDE_CONFIG } from "@/lib/constants";

/**
 * Gets parameters from the URL
 * Handles both email parameter and donor wrapped data parameters
 * Returns all URL parameters for preservation during navigation
 */
function getParamsFromURL() {
  const params = new URLSearchParams(window.location.search);
  
  // Get donor email if available
  const email = params.get('email');
  
  // Create a dictionary of all parameters for easy access and preservation
  const allParams = Object.fromEntries(params.entries());
  console.log("URL parameters:", allParams);
  
  // Check for wrapped donor data parameters
  const firstGiftDate = params.get('firstGiftDate');
  const lastGiftDate = params.get('lastGiftDate');
  const lastGiftAmount = params.get('lastGiftAmount');
  const lifetimeGiving = params.get('lifetimeGiving');
  const consecutiveYearsGiving = params.get('consecutiveYearsGiving');
  const totalGifts = params.get('totalGifts');
  const largestGiftAmount = params.get('largestGiftAmount');
  const largestGiftDate = params.get('largestGiftDate');
  
  // Debug log for the actual parameter values
  console.log("Wrapped donor data parameters:", {
    firstGiftDate,
    lastGiftDate,
    lastGiftAmount,
    lifetimeGiving,
    consecutiveYearsGiving,
    totalGifts,
    largestGiftAmount,
    largestGiftDate
  });
  
  // Check if we have wrapped donor data from URL
  // Consider any non-null and non-placeholder value as valid data
  // We need at least a few key parameters to consider it valid wrapped data
  const hasLastGiftAmount = lastGiftAmount && lastGiftAmount !== '*|LAST_GIF_A|*';
  const hasLifetimeGiving = lifetimeGiving && lifetimeGiving !== '*|LTGIVING|*';
  
  // For wrapped data to be valid, we need at least:
  // 1. Either a last gift amount or lifetime giving
  // 2. At least one date field (first gift or last gift date)
  const hasWrappedData = 
    (hasLastGiftAmount || hasLifetimeGiving) && (
      (firstGiftDate && firstGiftDate !== '*|FIRS_GIF_D|*') ||
      (lastGiftDate && lastGiftDate !== '*|LAS_GIF_DA|*')
    );
  
  console.log("Has wrapped data:", hasWrappedData);
  
  const wrappedData = hasWrappedData ? {
    firstGiftDate: firstGiftDate && firstGiftDate !== '*|FIRS_GIF_D|*' ? firstGiftDate : null,
    lastGiftDate: lastGiftDate && lastGiftDate !== '*|LAS_GIF_DA|*' ? lastGiftDate : null,
    lastGiftAmount: lastGiftAmount && lastGiftAmount !== '*|LAST_GIF_A|*' ? parseFloat(lastGiftAmount || '0') : 0,
    lifetimeGiving: lifetimeGiving && lifetimeGiving !== '*|LTGIVING|*' ? parseFloat(lifetimeGiving || '0') : 0,
    consecutiveYearsGiving: consecutiveYearsGiving && consecutiveYearsGiving !== '*|CONSYEARSG|*' ? parseInt(consecutiveYearsGiving || '0', 10) : 0,
    totalGifts: totalGifts && totalGifts !== '*|TOTALGIFTS|*' ? parseInt(totalGifts || '0', 10) : 0,
    largestGiftAmount: largestGiftAmount && largestGiftAmount !== '*|LARG_GIF_A|*' ? parseFloat(largestGiftAmount || '0') : 0,
    largestGiftDate: largestGiftDate && largestGiftDate !== '*|LARG_GIF_D|*' ? largestGiftDate : null
  } : null;
  
  console.log("Wrapped data object:", wrappedData);
  
  return {
    email,
    hasWrappedData,
    wrappedData,
    allParams,
    originalParamString: params.toString() // Keep the original param string for URL preservation
  };
}

/**
 * DonationImpactPage Component
 * 
 * Reimplemented as a class component to avoid React hooks dependency issues
 * that were causing infinite render loops
 */
export default class DonationImpactPage extends Component<RouteComponentProps, DonationState> {
  // Track if we've already attempted to load donor info
  private hasCheckedEmail = false;
  
  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      amount: 0,
      step: SlideNames.WELCOME,
      impact: null,
      isLoading: false,
      error: null,
      donorEmail: null
    };
    
    // Bind methods
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.resetDonation = this.resetDonation.bind(this);
    this.goToNextSlide = this.goToNextSlide.bind(this);
    this.goToPreviousSlide = this.goToPreviousSlide.bind(this);
    this.isFirstSlide = this.isFirstSlide.bind(this);
    this.isLastSlide = this.isLastSlide.bind(this);
    this.fetchDonorInfo = this.fetchDonorInfo.bind(this);
    this.handleShare = this.handleShare.bind(this);
  }
  
  /**
   * Check for parameters when component mounts
   */
  componentDidMount() {
    // Always check URL parameters when the component mounts (could be from direct navigation or redirect)
    this.hasCheckedEmail = true;
    
    // Add a small delay to ensure URL is fully loaded
    setTimeout(() => {
      console.log("Checking URL parameters from current location:", window.location.href);
      const { email, hasWrappedData, wrappedData, allParams, originalParamString } = getParamsFromURL();
      
      // Store original parameters in sessionStorage for future navigation
      if (originalParamString) {
        sessionStorage.setItem('originalUrlParams', originalParamString);
        console.log("Stored original URL parameters in session storage:", originalParamString);
      }
      
      // If we have wrapped data in the URL parameters, use that directly
      if (hasWrappedData && wrappedData) {
        console.log("Found wrapped donor data in URL, using directly:", wrappedData);
        
        // Calculate impact based on last gift amount or lifetime giving
        // If lastGiftAmount is available, use that as the donation amount
        // If not, try to calculate an average gift from lifetime giving and total gifts
        // If that's not possible either, fall back to a default value of 100
        let amount = 100; // Default fallback value
        
        if (wrappedData.lastGiftAmount > 0) {
          amount = wrappedData.lastGiftAmount;
          console.log("Using lastGiftAmount for impact calculation:", amount);
        } else if (wrappedData.lifetimeGiving > 0 && wrappedData.totalGifts > 0) {
          amount = wrappedData.lifetimeGiving / wrappedData.totalGifts;
          console.log("Calculated average gift amount from lifetime giving:", amount);
        } else if (wrappedData.lifetimeGiving > 0) {
          // If we have lifetime giving but no total gifts, use a reasonable portion of it
          amount = wrappedData.lifetimeGiving * 0.1; // Use 10% of lifetime giving as a reasonable gift
          amount = Math.min(amount, 1000); // Cap at $1000 to avoid extreme values
          amount = Math.max(amount, 50);   // Ensure at least $50
          console.log("Estimated gift amount from lifetime giving:", amount);
        }
        
        // Round to 2 decimal places for currency
        amount = Math.round(amount * 100) / 100;
        
        // Calculate impact
        this.setState({ 
          isLoading: true,
          step: SlideNames.LOADING,
          donorEmail: email || null
        });
        
        // Simulate loading for better user experience
        setTimeout(() => {
          const impact = calculateDonationImpact(amount);
          
          this.setState({
            amount,
            impact,
            isLoading: false,
            step: SlideNames.DONOR_SUMMARY,
          });
          
          // Store the wrapped data in sessionStorage for the DonorSummarySlide component
          sessionStorage.setItem('wrappedDonorData', JSON.stringify(wrappedData));
          
          // Also store all URL parameters for retrieval by other components
          sessionStorage.setItem('donorParams', JSON.stringify(allParams));
          
          toast({
            title: "Welcome Back!",
            description: "We've loaded your personalized donor information. Explore the impact of your generosity!",
          });
          
          // Also call the server for more accurate impact calculation
          this.calculateImpact(amount);
        }, SLIDE_CONFIG.progressDuration);
        
        return;
      }
      
      // If no wrapped data but we have an email, try to fetch from the server
      if (email) {
        console.log("Found email in URL, attempting to fetch donor info from server:", email);
        sessionStorage.setItem('donorEmail', email); // Store email for other components
        
        this.fetchDonorInfo(email)
          .then(success => {
            if (success) {
              toast({
                title: "Welcome Back!",
                description: "We've loaded your previous donation information. Explore the impact of your generosity!",
              });
            } else {
              toast({
                title: "Donor Not Found",
                description: "We couldn't find donation information for the provided email. Please enter a donation amount to see its impact.",
              });
            }
          });
      }
      
      // Check for errors
      if (this.state.error) {
        toast({
          title: "Error",
          description: this.state.error,
          variant: "destructive",
        });
      }
    }, 100); // Small delay to ensure URL is fully updated
  }
  
  /**
   * Fetch donor information by identifier (email)
   */
  async fetchDonorInfo(identifier: string): Promise<boolean> {
    try {
      this.setState({ isLoading: true, error: null });
      
      try {
        const res = await apiRequest('GET', `/api/donor/${encodeURIComponent(identifier)}`, null);
        
        // Check if the response was successful (status code 200-299)
        if (!res.ok) {
          if (res.status === 404) {
            console.log(`Donor ${identifier} not found. This is normal for new donors.`);
            this.setState({ isLoading: false });
            return false;
          }
          
          throw new Error(`Server responded with status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data.donation && data.impact) {
          // We have both donation and impact data from the server
          const amount = parseFloat(data.donation.amount.toString());
          
          this.setState({
            amount,
            impact: data.impact,
            isLoading: false,
            step: SlideNames.DONOR_SUMMARY, // Show donor summary first for returning donors
            donorEmail: data.donation.email || null
          });
          
          return true;
        }
        
        this.setState({ isLoading: false });
        return false;
      } catch (fetchError) {
        // Network errors or other request failures
        console.warn('API request failed, but this might be expected for new donors:', fetchError);
        this.setState({ isLoading: false });
        return false;
      }
    } catch (outerError) {
      console.error('Fatal error in fetchDonorInfo:', outerError);
      this.setState({ 
        isLoading: false,
        error: 'An unexpected error occurred. Please try again later.'
      });
      return false;
    }
  }
  
  /**
   * Handle donation form submission
   */
  handleFormSubmit(amount: number, email?: string) {
    console.log("Form submitted with amount:", amount, "email:", email);
    
    this.setState({ 
      amount,
      step: SlideNames.LOADING,
      isLoading: true,
      error: null,
      donorEmail: email || this.state.donorEmail
    });
    
    // Navigate to impact page if we're not already there
    if (window.location.pathname !== '/impact') {
      // Get current URL parameters and ensure they are preserved
      const { originalParamString } = getParamsFromURL();
      
      // Build the URL with parameters
      const destinationUrl = `/impact${originalParamString ? '?' + originalParamString : ''}`;
      console.log("Navigating to:", destinationUrl);
      
      // Use pushState to navigate without losing parameters
      window.history.pushState({}, '', destinationUrl);
    }

    // Simulate loading for better user experience
    setTimeout(() => {
      // Calculate impact locally for faster response
      const impact = calculateDonationImpact(amount);
      const nextStep = email ? SlideNames.DONOR_SUMMARY : SlideNames.MEALS;
      this.setState({
        impact,
        isLoading: false,
        step: nextStep
      });
      
      // Store email in sessionStorage for components that need it
      if (email) {
        sessionStorage.setItem('donorEmail', email);
      }
      
      // Log the donation via API
      this.logDonation(amount, email);
      
      // Also call the server for more accurate impact calculation
      this.calculateImpact(amount);
    }, SLIDE_CONFIG.progressDuration);
  }
  
  /**
   * Log a donation to the server
   */
  async logDonation(amount: number, email?: string) {
    try {
      // Create a timestamp for the donation
      const timestamp = new Date().toISOString();
      
      // Prepare donation data
      const donationData = {
        amount: amount.toString(),
        timestamp,
        email: email || ''
      };
      
      const res = await apiRequest('POST', '/api/log-donation', donationData);
      const data = await res.json();
      console.log('Donation logged:', data);
    } catch (error) {
      console.error('Failed to log donation:', error);
    }
  }
  
  /**
   * Calculate impact via the server API
   */
  async calculateImpact(amount: number) {
    try {
      const res = await apiRequest('POST', '/api/calculate-impact', { amount });
      const data = await res.json();
      
      this.setState({ 
        impact: data.impact,
        isLoading: false
      });
    } catch (error) {
      this.setState({ 
        error: 'Failed to calculate impact. Please try again.',
        isLoading: false,
        step: SlideNames.WELCOME
      });
    }
  }
  
  /**
   * Go to next slide
   */
  goToNextSlide() {
    this.setState(prev => {
      // If we're at the last slide, don't advance
      if (prev.step >= SlideNames.SUMMARY) {
        return prev;
      }
      return { ...prev, step: prev.step + 1 };
    });
  }
  
  /**
   * Go to previous slide
   */
  goToPreviousSlide() {
    this.setState(prev => {
      // If we're at the donor summary, don't go back
      if (prev.step <= SlideNames.DONOR_SUMMARY) {
        return prev;
      }
      // For meals slide, go back to donor summary if we have a donor email
      if (prev.step === SlideNames.MEALS && prev.donorEmail) {
        return { ...prev, step: SlideNames.DONOR_SUMMARY };
      }
      return { ...prev, step: prev.step - 1 };
    });
  }
  
  /**
   * Reset to beginning
   */
  resetDonation() {
    this.setState({
      amount: 0,
      step: SlideNames.WELCOME,
      impact: null,
      isLoading: false,
      error: null,
      donorEmail: null
    });
    
    // Return to the landing page
    window.history.pushState({}, '', '/');
  }
  
  /**
   * Check if current slide is the first content slide
   */
  isFirstSlide() {
    return this.state.step <= SlideNames.DONOR_SUMMARY || this.state.step === SlideNames.MEALS;
  }
  
  /**
   * Check if current slide is the last slide
   */
  isLastSlide() {
    return this.state.step >= SlideNames.SUMMARY;
  }
  
  /**
   * Handle sharing functionality
   */
  handleShare() {
    // First check if we have stored URL parameters
    const storedParams = sessionStorage.getItem('originalUrlParams');
    const baseUrl = window.location.origin + '/impact';
    let shareUrl = window.location.href;
    
    // If we're on the impact page without parameters but have stored parameters
    if (storedParams && storedParams.length > 0) {
      // Use the stored original parameters
      shareUrl = `${baseUrl}?${storedParams}`;
      console.log("Using original parameters for share URL:", shareUrl);
    } 
    // If no stored parameters but we have donor email
    else if (this.state.donorEmail && !window.location.href.includes('?')) {
      // Just use the email parameter as fallback
      shareUrl = `${baseUrl}?email=${encodeURIComponent(this.state.donorEmail)}`;
      console.log("Using email only for share URL:", shareUrl);
    }
    
    // Prepare the sharing message
    const shareTitle = "My Donation Impact at Community Food Share";
    const shareText = `I just donated $${this.state.amount} to Community Food Share, providing ${this.state.impact?.mealsProvided} meals and helping ${this.state.impact?.peopleServed} people in our community!`;
    
    console.log("Sharing URL:", shareUrl);
    
    // Use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl,
      }).catch(() => {
        // Save to clipboard as fallback
        navigator.clipboard.writeText(shareUrl).then(() => {
          toast({
            title: "Share your impact",
            description: "Share URL copied to clipboard. Share it with your friends!",
          });
        });
      });
    } else {
      // For browsers without Web Share API, copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast({
          title: "Share your impact",
          description: "Share URL copied to clipboard. Share it with your friends!",
        });
      });
    }
  }
  
  render() {
    const { state } = this;
    
    // Common navigation props for all slides
    const navigationProps = {
      onNext: this.goToNextSlide,
      onPrevious: this.goToPreviousSlide,
      isFirstSlide: this.isFirstSlide(),
      isLastSlide: this.isLastSlide()
    };
    
    return (
      <div className="min-h-screen relative font-sans overflow-hidden">
        {state.step === SlideNames.WELCOME && (
          <WelcomeScreen onSubmit={this.handleFormSubmit} />
        )}
        
        {state.step === SlideNames.LOADING && (
          <LoadingScreen />
        )}
        
        {state.step === SlideNames.DONOR_SUMMARY && state.impact && (
          <DonorSummarySlide 
            impact={state.impact} 
            donorEmail={state.donorEmail}
            amount={state.amount}
            {...navigationProps} 
          />
        )}
        
        {state.step === SlideNames.MEALS && state.impact && (
          <MealsSlide impact={state.impact} {...navigationProps} />
        )}
        
        {state.step === SlideNames.NUTRITION && state.impact && (
          <NutritionSlide impact={state.impact} {...navigationProps} />
        )}
        
        {state.step === SlideNames.PEOPLE && state.impact && (
          <PeopleSlide impact={state.impact} {...navigationProps} />
        )}
        
        {state.step === SlideNames.ENVIRONMENT && state.impact && (
          <EnvironmentSlide impact={state.impact} {...navigationProps} />
        )}
        
        {state.step === SlideNames.FOOD_RESCUE && state.impact && (
          <FoodRescueSlide impact={state.impact} {...navigationProps} />
        )}
        
        {state.step === SlideNames.VOLUNTEER && (
          <VolunteerSlide {...navigationProps} />
        )}
        
        {state.step === SlideNames.PARTNER && (
          <PartnerSlide {...navigationProps} />
        )}
        
        {state.step === SlideNames.SUMMARY && state.impact && (
          <SummarySlide 
            amount={state.amount} 
            impact={state.impact} 
            onReset={this.resetDonation}
            onShare={this.handleShare}
            {...navigationProps}
          />
        )}
      </div>
    );
  }
}
