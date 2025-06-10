import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Header from "./components/Header";
import Analytics from "./pages/Analytics";
import Billing from "./pages/Billing";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import WelcomeModal from "./components/WelcomeModal";
import { useState, useEffect } from 'react';

// Placeholder pages
const SettingsPageContent = () => <div className="container mx-auto p-6">Settings Page Content</div>;

const queryClient = new QueryClient();

const App = () => {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    // Check if the user has seen the welcome modal before
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcomeModal');
    if (!hasSeenWelcome) {
      setShowWelcomeModal(true);
    }
  }, []);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('hasSeenWelcomeModal', 'true');
  };

  const handleSkipTour = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('hasSeenWelcomeModal', 'true');
  };

  const handleNext = () => {
    // For now, just close the modal. In a real app, this could advance a tour.
    setShowWelcomeModal(false);
    localStorage.setItem('hasSeenWelcomeModal', 'true');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <WelcomeModal
          isOpen={showWelcomeModal}
          onClose={handleCloseWelcomeModal}
          onSkipTour={handleSkipTour}
          onNext={handleNext}
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
