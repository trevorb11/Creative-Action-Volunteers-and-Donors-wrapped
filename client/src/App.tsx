import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import DonationImpactPage from "@/pages/DonationImpact";
import WelcomeLanding from "@/pages/WelcomeLanding";
import Admin from "@/pages/Admin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={WelcomeLanding} />
      <Route path="/impact" component={DonationImpactPage} />
      <Route path="/admin" component={Admin} />
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
