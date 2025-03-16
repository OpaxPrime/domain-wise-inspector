
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { AuthDialogs } from "./AuthDialogs";
import { 
  DropdownMenu, 
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Crown, BarChart } from "lucide-react";

export function UserMenu() {
  const { user, signOut, isLoading } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState<"signIn" | "signUp" | null>(null);
  
  // Check if user is in trial period
  const isInTrial = user?.trialEndDate && new Date(user.trialEndDate) > new Date();
  
  if (!user) {
    return (
      <>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setAuthDialogOpen("signIn")}
            disabled={isLoading}
          >
            Sign In
          </Button>
          <Button 
            onClick={() => setAuthDialogOpen("signUp")}
            disabled={isLoading}
          >
            Sign Up
          </Button>
        </div>
        <AuthDialogs open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      </>
    );
  }
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">{user.name || user.email.split('@')[0]}</span>
            {(user.tier === "premium" || isInTrial) && (
              <Crown className="h-3 w-3 text-amber-500" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name || user.email.split('@')[0]}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <BarChart className="mr-2 h-4 w-4" />
            <span>Daily Usage: {user.dailyUsage}/
              {user.tier === "premium" || isInTrial ? "∞" : "5"}
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Crown className="mr-2 h-4 w-4" />
            <span>
              {user.tier === "premium" 
                ? "Premium Account" 
                : isInTrial 
                  ? "Trial Active" 
                  : "Free Account"}
            </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AuthDialogs open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </>
  );
}
