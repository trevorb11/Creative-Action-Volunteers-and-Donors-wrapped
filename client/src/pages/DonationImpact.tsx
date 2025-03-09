import { Component } from "react";
import { RouteComponentProps } from "wouter";
import { SlideNames, DonationState } from "@/types/donation";
// Original components
import WelcomeScreen from "@/components/donation/WelcomeScreen";
import LoadingScreen from "@/components/donation/LoadingScreen";
import DonorSummarySlide from "@/components/donation/DonorSummarySlide";
import MealsSlide from "@/components/donation/MealsSlide";
import TimeGivingSlide from "@/components/donation/TimeGivingSlide";
import PeopleSlide from "@/components/donation/PeopleSlide";
import EnvironmentSlide from "@/components/donation/EnvironmentSlide";
import FoodRescueSlide from "@/components/donation/SimpleFoodRescueSlide";
import NeighborQuotesSlide from "@/components/donation/NeighborQuotesSlide";
import SummarySlide from "@/components/donation/SummarySlide";

// New donor-specific components
import DonorWelcomeSlide from "@/components/donation/DonorWelcomeSlide";
import DonorLoadingScreen from "@/components/donation/DonorLoadingScreen";
import DonorMealsSlide from "@/components/donation/DonorMealsSlide";
import DonorPeopleSlide from "@/components/donation/DonorPeopleSlide";
import DonorFinancialSlide from "@/components/donation/DonorFinancialSlide";
import DonorIntroSlide from "@/components/donation/DonorIntroSlide";

import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { DonationImpact as DonationImpactType } from "@/types/donation";
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
  
  // Get donor first name if available
  const firstName = params.get('firstName') || params.get('First Name') || params.get('first_name');
  
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
  
  // Check for fiscal year giving parameters
  const givingFY22 = params.get('givingFY22');
  const givingFY23 = params.get('givingFY23');
  const givingFY24 = params.get('givingFY24');
  const givingFY25 = params.get('givingFY25');
  
  // Debug log for the actual parameter values
  console.log("Wrapped donor data parameters:", {
    firstGiftDate,
    lastGiftDate,
    lastGiftAmount,
    lifetimeGiving,
    consecutiveYearsGiving,
    totalGifts,
    largestGiftAmount,
    largestGiftDate,
    givingFY22,
    givingFY23,
    givingFY24,
    givingFY25
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
    largestGiftDate: largestGiftDate && largestGiftDate !== '*|LARG_GIF_D|*' ? largestGiftDate : null,
    // Include fiscal year giving data
    givingFY22: givingFY22 && givingFY22 !== '*|GIVINGFY22|*' ? parseFloat(givingFY22 || '0') : 0,
    givingFY23: givingFY23 && givingFY23 !== '*|GIVINGFY23|*' ? parseFloat(givingFY23 || '0') : 0,
    givingFY24: givingFY24 && givingFY24 !== '*|GIVINGFY24|*' ? parseFloat(givingFY24 || '0') : 0,
    givingFY25: givingFY25 && givingFY25 !== '*|GIVINGFY25|*' ? parseFloat(givingFY25 || '0') : 0
  } : null;
  
  console.log("Wrapped data object:", wrappedData);
  
  return {
    email,
    firstName,
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
      const { email, firstName, hasWrappedData, wrappedData, allParams, originalParamString } = getParamsFromURL();
      
      // Store original parameters in sessionStorage for future navigation
      if (originalParamString) {
        sessionStorage.setItem('originalUrlParams', originalParamString);
        console.log("Stored original URL parameters in session storage:", originalParamString);
      }
      
      // Store firstName in sessionStorage if available
      if (firstName) {
        sessionStorage.setItem('donorFirstName', firstName);
        console.log("Stored donor first name in session storage:", firstName);
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
    } else {
      // Already on impact page, make sure we preserve the donorUI parameter
      const urlParams = new URLSearchParams(window.location.search);
      const useDonorUI = urlParams.get('donorUI') === 'true';
      
      if (useDonorUI) {
        // Make sure the URL still has the donorUI parameter
        if (!window.location.search.includes('donorUI=true')) {
          // Add the parameter
          const newUrl = `${window.location.pathname}?donorUI=true`;
          window.history.pushState({}, '', newUrl);
          console.log("Preserving donorUI parameter in URL:", newUrl);
        }
      }
    }

    // Simulate loading for better user experience
    setTimeout(() => {
      // Calculate impact locally for faster response
      const impact = calculateDonationImpact(amount);
      
      // Check if we're using donor UI
      const urlParams = new URLSearchParams(window.location.search);
      const useDonorSlides = urlParams.get('donorUI') === 'true';
      
      // Set the appropriate next step based on interface type
      let nextStep;
      if (useDonorSlides) {
        // For donor UI, always go to donor intro slide after loading
        nextStep = SlideNames.DONOR_INTRO;
      } else {
        // For standard UI, go to donor summary for email donors, otherwise meals
        nextStep = email ? SlideNames.DONOR_SUMMARY : SlideNames.MEALS;
      }
      
      this.setState({
        impact,
        isLoading: false,
        step: nextStep,
        amount: amount  // Ensure amount is stored in state
      });

      // Store email in sessionStorage for components that need it
      if (email) {
        sessionStorage.setItem('donorEmail', email);
      }

      // Log the donation via API
      this.logDonation(amount, email);

      // Also call the server for more accurate impact calculation
      this.calculateImpact(amount);
      
      console.log("Moving to next step:", nextStep, "with donorUI =", useDonorSlides);
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
      
      // Store the email in state for use elsewhere
      if (email) {
        this.setState(prevState => ({
          ...prevState,
          donorEmail: email
        }));
      }
      
      // Log the donation but don't wait for it
      apiRequest('POST', '/api/log-donation', donationData)
        .then(res => res.json())
        .then(data => {
          console.log('Donation logged successfully:', data);
        })
        .catch(error => {
          console.error('Failed to log donation, but continuing:', error);
          // Don't interrupt the UI flow on logging error
        });
      
    } catch (error) {
      // Don't let errors here affect the UI flow
      console.error('Failed to prepare donation logging:', error);
    }
  }
  
  /**
   * Calculate impact via the server API
   */
  async calculateImpact(amount: number) {
    try {
      const res = await apiRequest('POST', '/api/calculate-impact', { amount });
      const data = await res.json();
      
      // Update impact data but don't change the current step
      this.setState(prevState => ({ 
        impact: data.impact,
        isLoading: false,
        // Maintain the current step
        step: prevState.step
      }));
      
      console.log("Updated impact data from server, maintaining step:", this.state.step);
    } catch (error) {
      console.error("Failed to calculate impact:", error);
      // Show error toast but don't reset the flow
      toast({
        title: "Impact Calculation",
        description: "We had trouble calculating exact impact numbers. Using estimated values instead.",
        variant: "destructive"
      });
      
      // Keep current state but mark that there was an error
      this.setState(prevState => ({ 
        error: 'Failed to calculate impact. Using estimated values.',
        isLoading: false,
        // Maintain the current step
        step: prevState.step
      }));
    }
  }
  
  /**
   * Go to next slide
   */
  goToNextSlide() {
    // Check if we should use donor slides
    const urlParams = new URLSearchParams(window.location.search);
    const useDonorSlides = urlParams.get('donorUI') === 'true';
    
    console.log("Going to next slide from current step:", this.state.step, "using donor UI:", useDonorSlides);
    
    this.setState(prev => {
      // If we're at the last slide, don't advance
      if (prev.step >= SlideNames.SUMMARY) {
        return prev;
      }
      
      // If using donor slides, handle donor-specific navigation logic
      if (useDonorSlides) {
        // Define the donor UI slide progression
        switch (prev.step) {
          case SlideNames.WELCOME:
            // Don't override the loading screen logic
            break;
          case SlideNames.LOADING:
            // Don't override the loading logic
            break;
          case SlideNames.DONOR_INTRO:
            // From intro, go to meals
            return { ...prev, step: SlideNames.MEALS };
          case SlideNames.MEALS:
            // From meals, go to people
            return { ...prev, step: SlideNames.PEOPLE };
          case SlideNames.PEOPLE:
            // From people, go to financial
            return { ...prev, step: SlideNames.FINANCIAL };
          case SlideNames.FINANCIAL:
            // From financial, go to summary (skip other slides)
            return { ...prev, step: SlideNames.SUMMARY };
          default:
            // For any other case, just increment
            break;
        }
      }
      
      return { ...prev, step: prev.step + 1 };
    });
  }
  
  /**
   * Go to previous slide
   */
  goToPreviousSlide() {
    // Check if we should use donor slides
    const urlParams = new URLSearchParams(window.location.search);
    const useDonorSlides = urlParams.get('donorUI') === 'true';
    
    console.log("Going to previous slide from current step:", this.state.step, "using donor UI:", useDonorSlides);
    
    this.setState(prev => {
      // If we're at the first slide, don't go back
      if (prev.step <= SlideNames.DONOR_SUMMARY || prev.step === SlideNames.WELCOME) {
        return prev;
      }
      
      // If using donor slides, handle donor-specific navigation logic
      if (useDonorSlides) {
        // Define the donor UI slide progression in reverse
        switch (prev.step) {
          case SlideNames.SUMMARY:
            // From summary, go back to financial
            return { ...prev, step: SlideNames.FINANCIAL };
          case SlideNames.FINANCIAL:
            // From financial, go back to people
            return { ...prev, step: SlideNames.PEOPLE };
          case SlideNames.PEOPLE:
            // From people, go back to meals
            return { ...prev, step: SlideNames.MEALS };
          case SlideNames.MEALS:
            // From meals, go back to intro
            return { ...prev, step: SlideNames.DONOR_INTRO };
          default:
            // For any other case, just decrement
            break;
        }
      }
      
      // For meals slide in standard UI, go back to donor summary if we have a donor email
      if (!useDonorSlides && prev.step === SlideNames.MEALS && prev.donorEmail) {
        return { ...prev, step: SlideNames.DONOR_SUMMARY };
      }
      
      return { ...prev, step: prev.step - 1 };
    });
  }

/**
 * Reset to beginning
 */
resetDonation() {
  // Check if we're in donor UI mode
  const urlParams = new URLSearchParams(window.location.search);
  const useDonorSlides = urlParams.get('donorUI') === 'true';
  
  this.setState({
    amount: 0,
    step: SlideNames.WELCOME,
    impact: null,
    isLoading: false,
    error: null,
    donorEmail: null
  });
  
  if (useDonorSlides) {
    // Stay on impact page but keep donorUI parameter
    window.history.pushState({}, '', '/impact?donorUI=true');
  } else {
    // Return to the landing page
    window.history.pushState({}, '', '/');
  }
}

/**
 * Check if current slide is the first content slide
 */
isFirstSlide() {
  const urlParams = new URLSearchParams(window.location.search);
  const useDonorSlides = urlParams.get('donorUI') === 'true';
  
  if (useDonorSlides) {
    // For donor UI, the intro slide is the first content slide
    return this.state.step === SlideNames.DONOR_INTRO;
  } else {
    // For standard UI, donor summary or meals are first content slides
    return this.state.step <= SlideNames.DONOR_SUMMARY || this.state.step === SlideNames.MEALS;
  }
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
    
    // Determine if we should use donor-specific slides
    // For this initial implementation, we'll use a URL parameter to toggle
    const urlParams = new URLSearchParams(window.location.search);
    const useDonorSlides = urlParams.get('donorUI') === 'true';

    return (
      <div className="min-h-screen relative font-sans overflow-hidden">
        {/* Welcome screen */}
        {state.step === SlideNames.WELCOME && (
          useDonorSlides ? 
            <DonorWelcomeSlide onSubmit={this.handleFormSubmit} /> :
            <WelcomeScreen onSubmit={this.handleFormSubmit} />
        )}

        {/* Loading screen */}
        {state.step === SlideNames.LOADING && (
          useDonorSlides ?
            <DonorLoadingScreen /> :
            <LoadingScreen />
        )}

        {/* Donor summary slide */}
        {state.step === SlideNames.DONOR_SUMMARY && state.impact && (
          <DonorSummarySlide 
            amount={state.amount}
            impact={state.impact}
            onReset={this.resetDonation}
            onShare={this.handleShare}
            {...navigationProps}
          />
        )}
        
        {/* Donor intro slide */}
        {state.step === SlideNames.DONOR_INTRO && state.impact && (
          <DonorIntroSlide 
            amount={state.amount}
            firstName={sessionStorage.getItem('donorFirstName') || undefined}
            {...navigationProps}
          />
        )}

        {/* Meals slide */}
        {state.step === SlideNames.MEALS && state.impact && (
          useDonorSlides ?
            <DonorMealsSlide impact={state.impact} {...navigationProps} /> :
            <MealsSlide impact={state.impact} {...navigationProps} />
        )}

        {/* People slide */}
        {state.step === SlideNames.PEOPLE && state.impact && (
          useDonorSlides ?
            <DonorPeopleSlide impact={state.impact} {...navigationProps} /> :
            <PeopleSlide impact={state.impact} {...navigationProps} />
        )}

        {/* Time giving slide */}
        {state.step === SlideNames.TIME_GIVING && state.impact && (
          <TimeGivingSlide 
            impact={state.impact} 
            donorEmail={state.donorEmail}
            amount={state.amount}
            {...navigationProps} 
          />
        )}

        {/* Food rescue slide */}
        {state.step === SlideNames.FOOD_RESCUE && state.impact && (
          <FoodRescueSlide impact={state.impact} {...navigationProps} />
        )}

        {/* Environment slide */}
        {state.step === SlideNames.ENVIRONMENT && state.impact && (
          <EnvironmentSlide impact={state.impact} {...navigationProps} />
        )}
        
        {/* Financial benefit slide (donor-specific) */}
        {state.step === SlideNames.FINANCIAL && state.impact && (
          <DonorFinancialSlide 
            impact={state.impact} 
            amount={state.amount}
            {...navigationProps} 
          />
        )}

        {/* Volunteer / Quotes slide */}
        {state.step === SlideNames.VOLUNTEER && (
          <NeighborQuotesSlide {...navigationProps} />
        )}

        {/* Summary slide */}
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
