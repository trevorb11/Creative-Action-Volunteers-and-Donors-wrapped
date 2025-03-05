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
    isLastSlide
  } = useDonationImpact();
  
  const { toast } = useToast();
  
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
    if (navigator.share) {
      navigator.share({
        title: "My Donation Impact at Community Food Share",
        text: `I just donated $${state.amount} to Community Food Share, providing ${state.impact?.mealsProvided} meals and helping ${state.impact?.peopleServed} people in our community!`,
        url: window.location.href,
      }).catch(() => {
        toast({
          title: "Share your impact",
          description: "Copy this page URL to share your impact with others!",
        });
      });
    } else {
      toast({
        title: "Share your impact",
        description: "Copy this page URL to share your impact with others!",
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
