
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { Mail, Github } from "lucide-react";

type AuthDialogType = "signIn" | "signUp" | null;

interface AuthDialogsProps {
  open: AuthDialogType;
  onOpenChange: (open: AuthDialogType) => void;
}

export function AuthDialogs({ open, onOpenChange }: AuthDialogsProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleClose = () => {
    onOpenChange(null);
    setEmail("");
    setPassword("");
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (open === "signIn") {
        await signIn(email, password);
      } else if (open === "signUp") {
        await signUp(email, password);
      }
      handleClose();
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      handleClose();
    } catch (error) {
      console.error("Google sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open === "signIn"} onOpenChange={(isOpen) => onOpenChange(isOpen ? "signIn" : null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sign In</DialogTitle>
            <DialogDescription>
              Sign in to your account to access your SEO analysis tools.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <DialogFooter className="flex flex-col space-y-2 sm:space-y-0">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full flex items-center justify-center" 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Sign in with Google</span>
              </Button>
              <div className="mt-2 text-center text-sm">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="text-primary underline-offset-4 hover:underline font-medium"
                  onClick={() => onOpenChange("signUp")}
                >
                  Sign up
                </button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={open === "signUp"} onOpenChange={(isOpen) => onOpenChange(isOpen ? "signUp" : null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create an Account</DialogTitle>
            <DialogDescription>
              Sign up to get started with SEO domain analysis. New users get a 14-day premium trial.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <DialogFooter className="flex flex-col space-y-2 sm:space-y-0">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full flex items-center justify-center" 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Sign up with Google</span>
              </Button>
              <div className="mt-2 text-center text-sm">
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-primary underline-offset-4 hover:underline font-medium"
                  onClick={() => onOpenChange("signIn")}
                >
                  Sign in
                </button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
