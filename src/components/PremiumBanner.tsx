
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Crown, Timer } from "lucide-react";

export function PremiumBanner() {
  const { user } = useAuth();
  
  // If user is already premium, don't show the banner
  if (!user || user.tier === "premium") return null;
  
  // Check if user is in trial period
  const isInTrial = user.trialEndDate && new Date(user.trialEndDate) > new Date();
  
  // Calculate days remaining in trial
  const daysRemaining = isInTrial ? 
    Math.ceil((new Date(user.trialEndDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
    0;
  
  return (
    <div className="bg-gradient-to-r from-amber-100/30 to-amber-300/30 dark:from-amber-900/20 dark:to-amber-800/30 border border-amber-200 dark:border-amber-900/50 p-4 rounded-lg shadow-soft mb-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
          {isInTrial ? (
            <Timer className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2" />
          ) : (
            <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2" />
          )}
          <div>
            {isInTrial ? (
              <h3 className="font-medium text-sm">Your Premium Trial Ends in {daysRemaining} Days</h3>
            ) : (
              <h3 className="font-medium text-sm">Upgrade to Premium</h3>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {isInTrial 
                ? "You currently have access to all premium features" 
                : "Get unlimited analyses, real-time data, and advanced metrics"}
            </p>
          </div>
        </div>
        <Button 
          variant="default" 
          size="sm" 
          className="bg-amber-500 hover:bg-amber-600 text-white"
        >
          {isInTrial ? "Keep Premium" : "Upgrade Now"}
        </Button>
      </div>
    </div>
  );
}
