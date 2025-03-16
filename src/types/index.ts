
export interface SEOMetrics {
  length: number;
  hasKeywords: boolean;
  memorability: number;
  brandability: number;
  keywordPlacement: number;
  domainExtension: number;
  overallScore: number;
}

export interface AnalysisResult {
  domain: string;
  metrics: SEOMetrics;
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
  strengthDetails: Record<string, string>;
  weaknessDetails: Record<string, string>;
}

export interface DomainComparison {
  domains: AnalysisResult[];
  bestChoice?: string;
}

export type UserTier = 'free' | 'premium';

export interface User {
  id: string;
  email: string;
  name?: string;
  tier: UserTier;
  dailyUsage: number;
  lastUsageDate: string; // ISO string format
  trialEndDate?: string; // ISO string for premium trial end
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUsage: () => Promise<boolean>; // Returns whether the user can perform the analysis
}
