import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { DonationState, SlideNames } from "@/types/donation";
import { DonationImpact } from "@shared/schema";
import { SLIDE_CONFIG } from "@/lib/constants";
import { calculateDonationImpact } from "@/lib/donation-calculator";

export function useDonationImpact() {
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
        isLoading: false,
        step: SlideNames.MEALS 
      }));

      // Auto-advance slides after loading is complete
      startAutoAdvance();
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
      
      // Start auto-advancing slides
      startAutoAdvance();
      
      // Also call the server for logging purposes
      calculateImpactMutation.mutate(amount);
    }, SLIDE_CONFIG.progressDuration);
  };

  // Auto-advance to next slide
  const goToNextSlide = () => {
    setState(prev => {
      // If we're at the last slide, don't advance
      if (prev.step >= SlideNames.SUMMARY) {
        return prev;
      }
      return { ...prev, step: prev.step + 1 };
    });
  };

  // Start timer to auto-advance slides
  const startAutoAdvance = () => {
    const timer = setInterval(() => {
      setState(prev => {
        // If we've reached the summary slide, stop auto-advancing
        if (prev.step >= SlideNames.SUMMARY - 1) {
          clearInterval(timer);
          return { ...prev, step: SlideNames.SUMMARY };
        }
        return { ...prev, step: prev.step + 1 };
      });
    }, SLIDE_CONFIG.autoAdvanceDuration);
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
  };

  return {
    state,
    handleFormSubmit,
    goToNextSlide,
    resetDonation
  };
}
