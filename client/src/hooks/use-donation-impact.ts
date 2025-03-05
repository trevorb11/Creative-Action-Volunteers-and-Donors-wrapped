import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
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

  // Handle form submission
  const handleFormSubmit = (amount: number) => {
    setState(prev => ({ 
      ...prev, 
      amount,
      step: SlideNames.LOADING,
      isLoading: true,
      error: null
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
      
      // Also call the server for logging purposes
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
    goToNextSlide,
    goToPreviousSlide,
    resetDonation,
    isFirstSlide,
    isLastSlide
  };
}
