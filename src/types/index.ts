
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
