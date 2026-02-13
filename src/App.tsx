import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PulseSurvey from "./pages/PulseSurvey";
import PulseDashboard from "./pages/PulseDashboard";
import Login from "./pages/Login";
import DossierPage from "./pages/DossierPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/pulse?org=kilkea-castle" replace />} />
          <Route path="/pulse" element={<PulseSurvey />} />
          <Route path="/pulse/login" element={<Login />} />
          <Route path="/pulse/dashboard" element={<PulseDashboard />} />
          <Route path="/pulse/dossier/:code" element={<DossierPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
