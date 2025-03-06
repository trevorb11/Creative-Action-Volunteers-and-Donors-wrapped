import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { DonationState, SlideNames } from "@/types/donation";
import { DonationImpact } from "@shared/schema";
import { SLIDE_CONFIG } from "@/lib/constants";
import { calculateDonationImpact } from "@/lib/donation-calculator";

export function useDonationImpact() {
  const [, setLocation] = useLocation();
  const [state, setState] = useState<DonationState>({
    amount: 0,
    step: SlideNames.WELCOME,
    impact: null,
    isLoading: false,
    error: null,
    donorEmail: null
  });

  // Mutation to calculate impact
  const calculateImpactMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiRequest('POST', '/api/calculate-impact', { amount });
      return res.json();
    },
    onSuccess: (data) => {
      setState(prev => ({ 
        ...prev, 
        impact: data.impact,
        isLoading: false
      }));
    },
    onError: (error) => {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to calculate impact. Please try again.',
        isLoading: false,
        step: SlideNames.WELCOME
      }));
    }
  });

  // Mutation to log a donation
  const logDonationMutation = useMutation({
    mutationFn: async ({ amount, email }: { amount: number, email?: string }) => {
      // Create a timestamp for the donation
      const timestamp = new Date().toISOString();
      
      // Prepare donation data
      const donationData = {
        amount: amount.toString(),
        timestamp,
        email: email || ''
      };
      
      const res = await apiRequest('POST', '/api/log-donation', donationData);
      return res.json();
    },
    onSuccess: (data) => {
      // Successfully logged the donation
      console.log('Donation logged:', data);
    },
    onError: (error) => {
      console.error('Failed to log donation:', error);
    }
  });

  // Function to fetch donor information by identifier
  const fetchDonorInfo = async (identifier: string) => {
    try {
      // Set loading state
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Make the API request with the encoded email
      const res = await apiRequest('GET', `/api/donor/${encodeURIComponent(identifier)}`, null);
      const data = await res.json();
      
      // Process the response data
      if (data.donation && data.impact) {
        // We have both donation and impact data from the server
        const amount = parseFloat(data.donation.amount.toString());
        
        // Update state with donation information
        setState(prev => ({
          ...prev,
          amount,
          impact: data.impact,
          isLoading: false,
          step: SlideNames.MEALS, // Move directly to the first content slide
          donorEmail: data.donation.email || null
        }));
        
        return true; // Success
      }
      
      // Reset loading state if no valid data
      setState(prev => ({ ...prev, isLoading: false }));
      return false; // No valid data found
    } catch (error) {
      console.error('Error fetching donor info:', error);
      // Reset state and set error message
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Failed to retrieve donor information.'
      }));
      return false; // Error occurred
    }
  };

  // Handle form submission for a new donation
  const handleFormSubmit = (amount: number, email?: string) => {
    setState(prev => ({ 
      ...prev, 
      amount,
      step: SlideNames.LOADING,
      isLoading: true,
      error: null,
      donorEmail: email || prev.donorEmail
    }));
    
    // Navigate to impact page if we're not already there
    if (window.location.pathname !== '/impact') {
      setLocation('/impact');
    }

    // Simulate loading for better user experience
    setTimeout(() => {
      // Calculate impact locally for faster response
      const impact = calculateDonationImpact(amount);
      setState(prev => ({
        ...prev,
        impact,
        isLoading: false,
        step: SlideNames.MEALS
      }));
      
      // Log the donation with email if provided
      if (email) {
        logDonationMutation.mutate({ amount, email });
      } else {
        // Still log the donation without email
        logDonationMutation.mutate({ amount });
      }
      
      // Also call the server for more accurate impact calculation
      calculateImpactMutation.mutate(amount);
    }, SLIDE_CONFIG.progressDuration);
  };

  // Go to next slide
  const goToNextSlide = () => {
    setState(prev => {
      // If we're at the last slide, don't advance
      if (prev.step >= SlideNames.SUMMARY) {
        return prev;
      }
      return { ...prev, step: prev.step + 1 };
    });
  };

  // Go to previous slide
  const goToPreviousSlide = () => {
    setState(prev => {
      // If we're at the first content slide or earlier, don't go back
      if (prev.step <= SlideNames.MEALS) {
        return prev;
      }
      return { ...prev, step: prev.step - 1 };
    });
  };

  // Reset to beginning
  const resetDonation = () => {
    setState({
      amount: 0,
      step: SlideNames.WELCOME,
      impact: null,
      isLoading: false,
      error: null,
      donorEmail: null
    });
    
    // Return to the landing page
    setLocation('/');
  };

  // Check if current slide is the first content slide
  const isFirstSlide = () => {
    return state.step <= SlideNames.MEALS;
  };

  // Check if current slide is the last slide
  const isLastSlide = () => {
    return state.step >= SlideNames.SUMMARY;
  };

  return {
    state,
    handleFormSubmit,
    fetchDonorInfo,
    goToNextSlide,
    goToPreviousSlide,
    resetDonation,
    isFirstSlide,
    isLastSlide
  };
}
