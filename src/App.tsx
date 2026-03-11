import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ChurnCalculator from "./pages/ChurnCalculator";
import PulseSurvey from "./pages/PulseSurvey";
import PulseDashboard from "./pages/PulseDashboard";
import VibeCheck from "./pages/VibeCheck";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import DossierPage from "./pages/DossierPage";
import DossierIndex from "./pages/admin/DossierIndex";
import DossierView from "./pages/admin/DossierView";
import SharedReport from "./pages/report/SharedReport";
import ThankYou from "./pages/ThankYou";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ChurnCalculator />} />
          <Route path="/pulse" element={<Navigate to="/pulse/survey" replace />} />
          <Route path="/pulse/survey" element={<PulseSurvey />} />
          <Route path="/pulse/dashboard" element={<PulseDashboard />} />
          <Route path="/pulse/admin" element={<AdminDashboard />} />
          <Route path="/pulse/dossier/:code" element={<DossierPage />} />
          <Route path="/vibe/:code" element={<VibeCheck />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dossier" element={<DossierIndex />} />
          <Route path="/admin/dossier/:leadId" element={<DossierView />} />
          <Route path="/report/:token" element={<SharedReport />} />
          <Route path="/thank-you/:leadId" element={<ThankYou />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          {/* Redirect old auth routes */}
          <Route path="/pulse/login" element={<Navigate to="/admin" replace />} />
          <Route path="/pulse/signup" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
