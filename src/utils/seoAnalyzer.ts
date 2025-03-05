
import { AnalysisResult, DomainComparison, SEOMetrics } from "@/types";

// Common keywords that might be beneficial for SEO
const SEO_FRIENDLY_KEYWORDS = [
  'seo', 'search', 'rank', 'analytics', 'digital', 'web', 'app', 'tech',
  'online', 'cyber', 'data', 'cloud', 'smart', 'ai', 'mobile', 'social',
  'blog', 'content', 'marketing', 'business', 'market', 'shop', 'store',
  'learn', 'edu', 'pro', 'expert', 'help', 'solutions', 'service'
];

const TLD_SCORES: Record<string, number> = {
  'com': 10,
  'org': 8,
  'net': 7,
  'io': 8,
  'co': 7,
  'app': 9,
  'ai': 9,
  'dev': 8,
  'tech': 8,
  'digital': 7,
  'agency': 7,
  'store': 7,
  'shop': 7
};

export const analyzeDomain = (domain: string): AnalysisResult => {
  // Clean the domain (remove protocol, www, etc.)
  const cleanDomain = cleanDomainName(domain);
  if (!cleanDomain) {
    throw new Error("Invalid domain name");
  }

  const [name, extension] = splitDomain(cleanDomain);
  
  // Calculate metrics
  const metrics = calculateSEOMetrics(name, extension);
  
  // Generate recommendations and insights
  const recommendations = generateRecommendations(metrics, name, extension);
  const strengths = identifyStrengths(metrics, name, extension);
  const weaknesses = identifyWeaknesses(metrics, name, extension);

  return {
    domain: cleanDomain,
    metrics,
    recommendations,
    strengths,
    weaknesses
  };
};

export const compareDomains = (domains: string[]): DomainComparison => {
  // Analyze each domain
  const results = domains.map(domain => analyzeDomain(domain));
  
  // Find the domain with the highest overall score
  let bestChoice = '';
  let highestScore = 0;
  
  results.forEach(result => {
    if (result.metrics.overallScore > highestScore) {
      highestScore = result.metrics.overallScore;
      bestChoice = result.domain;
    }
  });

  return {
    domains: results,
    bestChoice
  };
};

// Helper functions
function cleanDomainName(url: string): string {
  try {
    // Remove protocol and www if present
    let domain = url.trim().toLowerCase();
    domain = domain.replace(/^(https?:\/\/)?(www\.)?/, '');
    
    // Remove everything after first slash
    const slashIndex = domain.indexOf('/');
    if (slashIndex !== -1) {
      domain = domain.substring(0, slashIndex);
    }
    
    // Make sure there's at least one dot
    if (!domain.includes('.')) {
      return '';
    }
    
    return domain;
  } catch (error) {
    console.error("Error cleaning domain:", error);
    return '';
  }
}

function splitDomain(domain: string): [string, string] {
  const lastDotIndex = domain.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return [domain, ''];
  }
  
  const name = domain.substring(0, lastDotIndex);
  const extension = domain.substring(lastDotIndex + 1);
  
  return [name, extension];
}

function calculateSEOMetrics(name: string, extension: string): SEOMetrics {
  // Length score (domain names between 6-14 characters are ideal)
  const lengthScore = calculateLengthScore(name.length);
  
  // Check if domain contains SEO-friendly keywords
  const hasKeywords = SEO_FRIENDLY_KEYWORDS.some(keyword => 
    name.includes(keyword) || name.split('-').includes(keyword) || name.split('.').includes(keyword)
  );
  
  // Memorability score (shorter, simpler domains are more memorable)
  const memorability = calculateMemorabilityScore(name);
  
  // Brandability score
  const brandability = calculateBrandabilityScore(name);
  
  // Keyword placement (keywords at the beginning are better)
  const keywordPlacement = calculateKeywordPlacementScore(name);
  
  // Domain extension score
  const extensionScore = TLD_SCORES[extension] || 5;
  
  // Calculate overall score (weighted average)
  const overallScore = (
    lengthScore * 0.15 +
    (hasKeywords ? 7 : 3) * 0.2 +
    memorability * 0.2 +
    brandability * 0.15 +
    keywordPlacement * 0.15 +
    extensionScore * 0.15
  );

  return {
    length: lengthScore,
    hasKeywords,
    memorability,
    brandability,
    keywordPlacement,
    domainExtension: extensionScore,
    overallScore
  };
}

function calculateLengthScore(length: number): number {
  // Ideal domain length is between 6-14 characters
  if (length >= 6 && length <= 14) {
    return 10;
  } else if (length < 6) {
    return Math.max(5, length);
  } else {
    // Score decreases for longer domains
    return Math.max(1, 14 - (length - 14) * 0.5);
  }
}

function calculateMemorabilityScore(name: string): number {
  // Factors affecting memorability:
  // 1. Length (shorter is better)
  // 2. Number of hyphens (fewer is better)
  // 3. Number of digits (fewer is better)
  // 4. Pronounceability (approximated by vowel-consonant ratio)
  
  const hyphens = (name.match(/-/g) || []).length;
  const digits = (name.match(/\d/g) || []).length;
  const vowels = (name.match(/[aeiou]/gi) || []).length;
  const consonants = name.length - vowels - hyphens - digits;
  
  // Ideal vowel-consonant ratio is around 0.4-0.6
  const vcRatio = vowels / (consonants || 1);
  const vcRatioScore = vcRatio >= 0.4 && vcRatio <= 0.6 ? 10 : 
                       (vcRatio > 0.6 ? 8 - Math.min(3, vcRatio - 0.6) * 2 : 
                                        8 - Math.min(3, 0.4 - vcRatio) * 2);
  
  // Penalize for hyphens and digits
  const hyphenPenalty = Math.min(5, hyphens * 1.5);
  const digitPenalty = Math.min(5, digits);
  
  return Math.max(1, 10 - hyphenPenalty * 0.5 - digitPenalty * 0.3 + vcRatioScore * 0.2);
}

function calculateBrandabilityScore(name: string): number {
  // Factors affecting brandability:
  // 1. Uniqueness (approximated by common words)
  // 2. Length (not too short, not too long)
  // 3. Pronounceability
  // 4. No numbers or special characters
  
  const hasSpecialChars = /[^a-z0-9-]/.test(name);
  const hasNumbers = /\d/.test(name);
  const words = name.split('-');
  
  // Simple check for common dictionary words
  const commonWordCount = words.filter(word => 
    SEO_FRIENDLY_KEYWORDS.includes(word)
  ).length;
  
  const uniquenessScore = 10 - Math.min(5, commonWordCount * 2);
  const lengthScore = name.length > 3 && name.length < 12 ? 10 : 
                     (name.length <= 3 ? 7 : 10 - Math.min(5, (name.length - 12) * 0.5));
  
  // Penalize for numbers and special chars
  const cleanlinessScore = 10 - (hasNumbers ? 3 : 0) - (hasSpecialChars ? 5 : 0);
  
  return Math.max(1, (uniquenessScore * 0.4 + lengthScore * 0.3 + cleanlinessScore * 0.3));
}

function calculateKeywordPlacementScore(name: string): number {
  const words = name.split(/[-_.]/);
  
  for (let i = 0; i < words.length; i++) {
    if (SEO_FRIENDLY_KEYWORDS.includes(words[i])) {
      // Keywords at the beginning are better
      return 10 - i * 2;
    }
  }
  
  return 3; // No known keywords found
}

function generateRecommendations(metrics: SEOMetrics, name: string, extension: string): string[] {
  const recommendations: string[] = [];
  
  if (metrics.length < 7) {
    recommendations.push("Consider a slightly longer domain name for better SEO impact.");
  }
  
  if (metrics.length > 9) {
    recommendations.push("Shorter domain names are typically more memorable and easier to type.");
  }
  
  if (!metrics.hasKeywords) {
    recommendations.push("Including relevant keywords in your domain can improve SEO performance.");
  }
  
  if (metrics.memorability < 7) {
    recommendations.push("A more memorable domain name will help users find your site again.");
  }
  
  if (metrics.brandability < 7) {
    recommendations.push("Consider a more unique name that will stand out as a distinct brand.");
  }
  
  if (metrics.keywordPlacement < 5 && metrics.hasKeywords) {
    recommendations.push("For better SEO impact, place keywords at the beginning of the domain name.");
  }
  
  if (metrics.domainExtension < 8 && extension !== 'com') {
    recommendations.push(".com domains generally perform better for SEO and user trust.");
  }
  
  // If score is already good, add positive reinforcement
  if (metrics.overallScore >= 8.5) {
    recommendations.push("This is a strong domain name. Focus on building quality content and backlinks.");
  }
  
  return recommendations;
}

function identifyStrengths(metrics: SEOMetrics, name: string, extension: string): string[] {
  const strengths: string[] = [];
  
  if (metrics.length >= 7) {
    strengths.push("Good domain length for SEO and usability.");
  }
  
  if (metrics.hasKeywords) {
    strengths.push("Contains relevant keywords that may help with search rankings.");
  }
  
  if (metrics.memorability >= 8) {
    strengths.push("Highly memorable domain name, which aids in direct traffic.");
  }
  
  if (metrics.brandability >= 8) {
    strengths.push("Strong branding potential with a distinctive name.");
  }
  
  if (metrics.keywordPlacement >= 8) {
    strengths.push("Optimal keyword placement for search engine algorithms.");
  }
  
  if (metrics.domainExtension >= 9) {
    strengths.push("Premium TLD with excellent SEO value and user trust.");
  } else if (metrics.domainExtension >= 7) {
    strengths.push("Good domain extension with solid SEO potential.");
  }
  
  if (extension === 'com') {
    strengths.push(".com domains typically enjoy higher user trust and click-through rates.");
  }
  
  return strengths;
}

function identifyWeaknesses(metrics: SEOMetrics, name: string, extension: string): string[] {
  const weaknesses: string[] = [];
  
  if (metrics.length < 5) {
    weaknesses.push("Very short domain names may limit keyword inclusion opportunities.");
  } else if (metrics.length > 12) {
    weaknesses.push("Longer domain names can be harder to remember and type correctly.");
  }
  
  if (!metrics.hasKeywords) {
    weaknesses.push("Lacks relevant keywords that could help with search rankings.");
  }
  
  if (metrics.memorability < 6) {
    weaknesses.push("May be difficult for users to remember, potentially reducing return visits.");
  }
  
  if (metrics.brandability < 6) {
    weaknesses.push("Limited distinctive branding potential, which may impact recognition.");
  }
  
  if (metrics.keywordPlacement < 5 && metrics.hasKeywords) {
    weaknesses.push("Keywords positioned less optimally for search engine algorithms.");
  }
  
  if (metrics.domainExtension < 7) {
    weaknesses.push("TLD may have less SEO impact than premium alternatives like .com.");
  }
  
  if (name.includes('-')) {
    weaknesses.push("Hyphens in domain names can reduce memorability and are sometimes associated with spam.");
  }
  
  if (/\d/.test(name)) {
    weaknesses.push("Numbers in domain names can make them harder to remember and communicate verbally.");
  }
  
  return weaknesses;
}
