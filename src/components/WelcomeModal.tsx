import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Lightbulb } from "lucide-react";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkipTour: () => void;
  onNext: () => void;
}

const WelcomeModal = ({ isOpen, onClose, onSkipTour, onNext }: WelcomeModalProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-zap"
            >
              <path d="M10.23 20.31L7.86 23 1 12 13.56 1 16.14 3.73 12.01 10.21 21.01 10.21 16.14 14.21 22.46 14.21 10.23 20.31Z" />
            </svg>
            Welcome to Smart Energy Meter
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground mt-4">
            Monitor your electricity usage in real-time and optimize your energy consumption with AI-powered insights.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-3 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Real-time energy monitoring
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            India-specific time-based pricing
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            AI-powered consumption insights
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Bill predictions and alerts
          </div>
        </div>
        <div className="bg-yellow-50 text-yellow-800 border border-yellow-200 p-3 rounded-md mt-4 text-xs">
          <Lightbulb className="h-4 w-4 inline-block mr-2"/>
          Demo Mode
          <p className="mt-1">This app simulated data for demonstration. In a real implementation you would connect to your smart meter or energy provider's API.</p>
        </div>
        <AlertDialogFooter className="flex-col sm:flex-row sm:justify-between sm:space-x-2 mt-6">
          <Button variant="link" onClick={onSkipTour} className="w-full sm:w-auto text-muted-foreground p-0 h-auto justify-start">
            Skip Tour
          </Button>
          <AlertDialogAction asChild>
            <Button onClick={onNext} className="w-full sm:w-auto">Next</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default WelcomeModal; 