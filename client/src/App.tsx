/*
 * RELIVO — Routing (Eco-Tech Glasshouse)
 * Marketing: Home, About, Login, Register, Browse, Resource details, Analytics.
 * App (role-gated): Donor / Recipient / Admin dashboards, Upload, Requests,
 * Request flow, AI Recommendations, Notifications.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BrowseResources from "./pages/BrowseResources";
import ResourceDetails from "./pages/ResourceDetails";
import Analytics from "./pages/Analytics";
import DonorDashboard from "./pages/DonorDashboard";
import RecipientDashboard from "./pages/RecipientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UploadResource from "./pages/UploadResource";
import Requests from "./pages/Requests";
import RequestResource from "./pages/RequestResource";
import Recommendations from "./pages/Recommendations";
import Notifications from "./pages/Notifications";


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
