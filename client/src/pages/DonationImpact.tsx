import { Component } from "react";
import { SlideNames, DonationState } from "@/types/donation";
import WelcomeScreen from "@/components/donation/WelcomeScreen";
import LoadingScreen from "@/components/donation/LoadingScreen";
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
 * Gets the email parameter from the URL
 */
function getEmailFromURL() {
  return new URLSearchParams(window.location.search).get('email');
}

/**
 * DonationImpactPage Component
 * 
 * Reimplemented as a class component to avoid React hooks dependency issues
 * that were causing infinite render loops
 */
export default class DonationImpactPage extends Component<{}, DonationState> {
  // Track if we've already attempted to load donor info
  private hasCheckedEmail = false;
  
  constructor(props: {}) {
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
   * Check for email parameter when component mounts
   */
  componentDidMount() {
    // One-time email parameter check
    if (!this.hasCheckedEmail) {
      this.hasCheckedEmail = true;
      
      const email = getEmailFromURL();
      if (email) {
        console.log("Found email in URL, attempting to fetch donor info once:", email);
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
    }
    
    // Check for errors
    if (this.state.error) {
      toast({
        title: "Error",
        description: this.state.error,
        variant: "destructive",
      });
    }
  }
  
  /**
   * Fetch donor information by identifier (email)
   */
  async fetchDonorInfo(identifier: string): Promise<boolean> {
    try {
      this.setState({ isLoading: true, error: null });
      
      const res = await apiRequest('GET', `/api/donor/${encodeURIComponent(identifier)}`, null);
      const data = await res.json();
      
      if (data.donation && data.impact) {
        // We have both donation and impact data from the server
        const amount = parseFloat(data.donation.amount.toString());
        
        this.setState({
          amount,
          impact: data.impact,
          isLoading: false,
          step: SlideNames.MEALS,
          donorEmail: data.donation.email || null
        });
        
        return true;
      }
      
      this.setState({ isLoading: false });
      return false;
    } catch (error) {
      console.error('Error fetching donor info:', error);
      this.setState({ 
        isLoading: false,
        error: 'Failed to retrieve donor information.'
      });
      return false;
    }
  }
  
  /**
   * Handle donation form submission
   */
  handleFormSubmit(amount: number, email?: string) {
    this.setState({ 
      amount,
      step: SlideNames.LOADING,
      isLoading: true,
      error: null,
      donorEmail: email || this.state.donorEmail
    });
    
    // Navigate to impact page if we're not already there
    if (window.location.pathname !== '/impact') {
      window.history.pushState({}, '', '/impact');
    }

    // Simulate loading for better user experience
    setTimeout(() => {
      // Calculate impact locally for faster response
      const impact = calculateDonationImpact(amount);
      this.setState({
        impact,
        isLoading: false,
        step: SlideNames.MEALS
      });
      
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
      // If we're at the first content slide or earlier, don't go back
      if (prev.step <= SlideNames.MEALS) {
        return prev;
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
    return this.state.step <= SlideNames.MEALS;
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
    // Create a URL with the donor's email parameter if available
    let shareUrl = window.location.href;
    
    // If we're on the impact page without parameters but have donor email, add it
    if (this.state.donorEmail && !window.location.href.includes('?')) {
      const baseUrl = window.location.origin + window.location.pathname;
      shareUrl = `${baseUrl}?email=${encodeURIComponent(this.state.donorEmail)}`;
    }
    
    if (navigator.share) {
      navigator.share({
        title: "My Donation Impact at Community Food Share",
        text: `I just donated $${this.state.amount} to Community Food Share, providing ${this.state.impact?.mealsProvided} meals and helping ${this.state.impact?.peopleServed} people in our community!`,
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
      // For browsers without share API, copy to clipboard
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
