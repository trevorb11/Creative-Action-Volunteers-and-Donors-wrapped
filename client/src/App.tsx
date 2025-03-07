import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import DonationImpactPage from "@/pages/DonationImpact";
import VolunteerImpactPage from "@/pages/VolunteerImpact";
import WelcomeLanding from "@/pages/WelcomeLanding";
import Admin from "@/pages/Admin";
import TestUrl from "@/pages/TestUrl";

// Custom wrapper for the DonationImpact page to handle the routing props issue
const DonationImpactWrapper = (props: any) => <DonationImpactPage {...props} />;

// Custom wrapper for the VolunteerImpact page to handle the routing props issue
const VolunteerImpactWrapper = (props: any) => <VolunteerImpactPage {...props} />;

function Router() {
  return (
    <Switch>
      <Route path="/" component={WelcomeLanding} />
      <Route path="/impact" component={DonationImpactWrapper} />
      <Route path="/volunteer-impact" component={VolunteerImpactWrapper} />
      <Route path="/admin" component={Admin} />
      <Route path="/test-url" component={TestUrl} />
      <Route path="/:identifier" component={WelcomeLanding} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
