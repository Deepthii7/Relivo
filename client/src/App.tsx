/*
 * RELIVO — Routing (Eco-Tech Glasshouse)
 * Marketing: Home, About, Login, Register, Browse, Resource details, Analytics.
 * App (role-gated): Donor / Recipient / Admin dashboards, Upload, Requests,
 * Request flow, AI Recommendations, Notifications.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/features/dashboard/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./features/marketing/pages/Home";
import About from "./features/marketing/pages/About";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import BrowseResources from "./features/resources/pages/BrowseResources";
import ResourceDetails from "./features/resources/pages/ResourceDetails";
import Analytics from "./features/marketing/pages/Analytics";
import DonorDashboard from "./features/dashboard/pages/DonorDashboard";
import RecipientDashboard from "./features/dashboard/pages/RecipientDashboard";
import AdminDashboard from "./features/dashboard/pages/AdminDashboard";
import UploadResource from "./features/resources/pages/UploadResource";
import Requests from "./features/requests/pages/Requests";
import RequestResource from "./features/requests/pages/RequestResource";
import Recommendations from "./features/dashboard/pages/Recommendations";
import Notifications from "./features/dashboard/pages/Notifications";


function Router() {
  return (
    <Switch>
      {/* Marketing pages */}
      <Route path={"/"} component={Home} />
      <Route path={"/about"} component={About} />
      <Route path={"/login"} component={Login} />
      <Route path={"/register"} component={Register} />
      <Route path={"/browse"} component={BrowseResources} />
      <Route path={"/resource/:id"} component={ResourceDetails} />
      <Route path={"/analytics"} component={Analytics} />

      {/* Application pages */}
      <Route path={"/donor"} component={DonorDashboard} />
      <Route path={"/recipient"} component={RecipientDashboard} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/upload"} component={UploadResource} />
      <Route path={"/requests"} component={Requests} />
      <Route path={"/request/:id"} component={RequestResource} />
      <Route path={"/recommendations"} component={Recommendations} />
      <Route path={"/notifications"} component={Notifications} />

      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster position="top-right" />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
