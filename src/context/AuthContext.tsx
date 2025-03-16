
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthContextType, UserTier } from "@/types";
import { useToast } from "@/components/ui/use-toast";

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to get current date as ISO string
const getCurrentDate = () => new Date().toISOString().split('T')[0];

// Mock users database
const MOCK_USERS: Record<string, User> = {};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser) as User;
      
      // Check if we need to reset daily usage (new day)
      if (parsedUser.lastUsageDate !== getCurrentDate()) {
        parsedUser.dailyUsage = 0;
        parsedUser.lastUsageDate = getCurrentDate();
        localStorage.setItem("user", JSON.stringify(parsedUser));
      }
      
      setUser(parsedUser);
    }
    setIsLoading(false);
  }, []);

  const updateLocalStorage = (updatedUser: User) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    // Also update our mock DB
    if (MOCK_USERS[updatedUser.id]) {
      MOCK_USERS[updatedUser.id] = updatedUser;
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user by email (mock authentication)
      const foundUser = Object.values(MOCK_USERS).find(u => u.email === email);
      
      if (!foundUser) {
        throw new Error("Invalid email or password");
      }
      
      // Reset usage if it's a new day
      if (foundUser.lastUsageDate !== getCurrentDate()) {
        foundUser.dailyUsage = 0;
        foundUser.lastUsageDate = getCurrentDate();
      }
      
      setUser(foundUser);
      updateLocalStorage(foundUser);
      
      toast({
        title: "Welcome back!",
        description: `You're now signed in as ${foundUser.email}`,
      });
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a mock Google auth user
      const googleUser: User = {
        id: `google-${Date.now()}`,
        email: `user${Math.floor(Math.random() * 1000)}@gmail.com`,
        name: "Google User",
        tier: "free",
        dailyUsage: 0,
        lastUsageDate: getCurrentDate(),
        trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14-day trial
      };
      
      // Save to mock DB
      MOCK_USERS[googleUser.id] = googleUser;
      
      setUser(googleUser);
      updateLocalStorage(googleUser);
      
      toast({
        title: "Signed in with Google",
        description: `Welcome, ${googleUser.name}! You have a 14-day premium trial.`,
      });
    } catch (error) {
      toast({
        title: "Google sign in failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Check if email already exists
      if (Object.values(MOCK_USERS).some(u => u.email === email)) {
        throw new Error("Email already in use");
      }
      
      // Create new user with trial
      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        tier: "free",
        dailyUsage: 0,
        lastUsageDate: getCurrentDate(),
        trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14-day trial
      };
      
      // Save to mock DB
      MOCK_USERS[newUser.id] = newUser;
      
      setUser(newUser);
      updateLocalStorage(newUser);
      
      toast({
        title: "Account created",
        description: "Welcome! You have a 14-day premium trial.",
      });
    } catch (error) {
      toast({
        title: "Sign up failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const signOut = async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser(null);
      localStorage.removeItem("user");
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateUsage = async (): Promise<boolean> => {
    if (!user) return false;
    
    // Check if user is in trial period
    const isInTrial = user.trialEndDate && new Date(user.trialEndDate) > new Date();
    
    // If premium or in trial, update usage without restrictions
    if (user.tier === "premium" || isInTrial) {
      const updatedUser = {
        ...user,
        dailyUsage: user.dailyUsage + 1,
        lastUsageDate: getCurrentDate()
      };
      setUser(updatedUser);
      updateLocalStorage(updatedUser);
      return true;
    }
    
    // For free users, check limits
    if (user.dailyUsage >= 5) {
      toast({
        title: "Daily limit reached",
        description: "Free users can analyze up to 5 domains per day. Upgrade to premium for unlimited analyses.",
        variant: "destructive",
      });
      return false;
    }
    
    // Update usage for free users
    const updatedUser = {
      ...user,
      dailyUsage: user.dailyUsage + 1,
      lastUsageDate: getCurrentDate()
    };
    setUser(updatedUser);
    updateLocalStorage(updatedUser);
    return true;
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
        updateUsage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
