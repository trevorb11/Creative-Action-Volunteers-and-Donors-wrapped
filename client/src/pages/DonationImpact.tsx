import { useEffect } from "react";
import { useDonationImpact } from "@/hooks/use-donation-impact";
import { SlideNames } from "@/types/donation";
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
import { useToast } from "@/hooks/use-toast";

export default function DonationImpact() {
  const { 
    state, 
    handleFormSubmit, 
    resetDonation, 
    goToNextSlide, 
    goToPreviousSlide,
    isFirstSlide,
    isLastSlide,
    fetchDonorInfo
  } = useDonationImpact();
  
  const { toast } = useToast();
  
  // Check for email parameter in URL when component mounts
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const email = queryParams.get('email');
    
    if (email) {
      console.log("Found email in URL:", email);
      fetchDonorInfo(email).then(success => {
        if (!success) {
          toast({
            title: "Donor Not Found",
            description: "We couldn't find donation information for the provided email. Please enter a donation amount to see its impact.",
          });
        } else {
          toast({
            title: "Welcome Back!",
            description: "We've loaded your previous donation information. Explore the impact of your generosity!",
          });
        }
      });
    }
  }, [fetchDonorInfo, toast]);
  
  useEffect(() => {
    if (state.error) {
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      });
    }
  }, [state.error, toast]);

  // Handle sharing functionality
  const handleShare = () => {
    // Create a URL with the donor's email parameter if available
    let shareUrl = window.location.href;
    
    // If we're on the impact page without parameters but have donor email, add it
    if (state.donorEmail && !window.location.href.includes('?')) {
      const baseUrl = window.location.origin + window.location.pathname;
      shareUrl = `${baseUrl}?email=${encodeURIComponent(state.donorEmail)}`;
    }
    
    if (navigator.share) {
      navigator.share({
        title: "My Donation Impact at Community Food Share",
        text: `I just donated $${state.amount} to Community Food Share, providing ${state.impact?.mealsProvided} meals and helping ${state.impact?.peopleServed} people in our community!`,
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
  };

  // Common navigation props for all slides
  const navigationProps = {
    onNext: goToNextSlide,
    onPrevious: goToPreviousSlide,
    isFirstSlide: isFirstSlide(),
    isLastSlide: isLastSlide()
  };

  return (
    <div className="min-h-screen relative font-sans overflow-hidden">
      {state.step === SlideNames.WELCOME && (
        <WelcomeScreen onSubmit={handleFormSubmit} />
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
          onReset={resetDonation}
          onShare={handleShare}
          {...navigationProps}
        />
      )}
    </div>
  );
}
