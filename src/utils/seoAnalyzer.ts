import { AnalysisResult, DomainComparison, SEOMetrics } from "@/types";
import { getDomainPricing } from "./domainPricingService";

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

export const analyzeDomain = async (domain: string): Promise<AnalysisResult> => {
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
  const { strengths, strengthDetails } = identifyStrengths(metrics, name, extension);
  const { weaknesses, weaknessDetails } = identifyWeaknesses(metrics, name, extension);
  const recommendationDetails = generateEnhancedRecommendationDetails(recommendations, metrics, name, extension);

  // Fetch domain pricing
  try {
    const pricing = await getDomainPricing(cleanDomain);
    
    return {
      domain: cleanDomain,
      metrics,
      recommendations,
      strengths,
      weaknesses,
      strengthDetails,
      weaknessDetails,
      recommendationDetails,
      pricing
    };
  } catch (error) {
    console.error("Error fetching domain pricing:", error);
    
    return {
      domain: cleanDomain,
      metrics,
      recommendations,
      strengths,
      weaknesses,
      strengthDetails,
      weaknessDetails,
      recommendationDetails
    };
  }
};

export const compareDomains = async (domains: string[]): Promise<DomainComparison> => {
  // Analyze each domain
  const results = await Promise.all(domains.map(domain => analyzeDomain(domain)));
  
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
  
  // Calculate overall score (weighted average) and round to integer
  const rawScore = (
    lengthScore * 0.15 +
    (hasKeywords ? 7 : 3) * 0.2 +
    memorability * 0.2 +
    brandability * 0.15 +
    keywordPlacement * 0.15 +
    extensionScore * 0.15
  );

  // Round to nearest integer (0-10)
  const overallScore = Math.round(rawScore);

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

function generateEnhancedRecommendationDetails(
  recommendations: string[], 
  metrics: SEOMetrics, 
  name: string, 
  extension: string
): Record<string, string> {
  const details: Record<string, string> = {};
  
  recommendations.forEach(recommendation => {
    if (recommendation.includes("longer domain")) {
      details[recommendation] = 
        "From a Functional Purpose perspective, your domain name is the foundation of your online identity and should effectively communicate your brand's essence while supporting SEO goals. The current length is suboptimal for keyword inclusion, limiting your ability to rank for relevant terms. At the Abstract Function level, a more strategically sized domain (6-14 characters) provides the ideal balance between memorability and search engine relevance, allowing for proper keyword integration while remaining easy to recall. In practical implementation (Physical Form), consider adding relevant industry terms or descriptive modifiers to your current domain that align with your target audience's search patterns.";
    } else if (recommendation.includes("Shorter domain")) {
      details[recommendation] = 
        "At the Functional Purpose level, your domain name serves as the primary access point to your digital presence and should minimize user friction. The current length exceeds the optimal character count, creating potential barriers to memorability and direct navigation. The underlying Abstract Function principle is that shorter domains reduce cognitive load for users, leading to improved brand recall and word-of-mouth sharing. From a Generalized Function standpoint, lengthy domains increase the likelihood of typographical errors when users manually enter your URL, potentially resulting in lost traffic. Consider removing unnecessary words or using abbreviations to create a more concise and memorable domain identity.";
    } else if (recommendation.includes("keywords in your domain")) {
      details[recommendation] = 
        "From a Functional Purpose perspective, your domain should serve as both a brand identifier and a relevance signal to search engines. Currently, it lacks specific industry keywords that would help establish topical authority. The Abstract Function principle at work is that strategic keyword inclusion can provide contextual clues to both users and search algorithms about your website's focus area. At the Physical Function level, incorporating 1-2 relevant keywords from your industry would create stronger semantic connections between user search queries and your domain. Consider adding terms like '" + SEO_FRIENDLY_KEYWORDS.slice(0, 3).join("', '") + "' if they align with your business focus.";
    } else if (recommendation.includes("memorable domain")) {
      details[recommendation] = 
        "At the core Functional Purpose level, your domain should facilitate easy recall and return visits, functioning as a permanent mental anchor for your brand. The current domain structure scores below optimal on memorability metrics, which may impede organic brand building. From an Abstract Function perspective, memorable domains prioritize phonetic simplicity, avoid special characters, and utilize linguistic patterns that resonate with human memory systems. Examining the Physical Form of your domain, consider removing hyphens, numbers, or unusual spellings that create cognitive friction. A more memorable alternative might use alliteration, rhyming elements, or common word patterns that create stronger mental associations.";
    } else if (recommendation.includes("unique name")) {
      details[recommendation] = 
        "Your domain's primary Functional Purpose includes establishing a distinctive brand identity that stands apart from competitors and creates lasting impressions. The current name lacks sufficient uniqueness to achieve strong brand differentiation in your market space. At the Abstract Function level, brand distinctiveness is a foundational principle that enables more efficient marketing, stronger trademark protection, and reduced confusion in the marketplace. From a Physical Form perspective, consider creating a synthetic word, using unexpected word combinations, or incorporating creative prefixes/suffixes that maintain pronunciation clarity while establishing uniqueness. This approach will significantly strengthen your brand's memorability and legal defensibility.";
    } else if (recommendation.includes("keywords at the beginning")) {
      details[recommendation] = 
        "From a Functional Purpose standpoint, your domain should optimize for both human usability and search algorithm interpretation. While your domain contains relevant keywords, their placement is suboptimal for maximum SEO impact. The Abstract Function principle at work is that search engines typically give more weight to terms appearing earlier in a domain name when determining relevance. At the Physical Function level, restructuring your domain to place primary keywords at the beginning would improve keyword prominence scores and potentially boost rankings for those terms. Consider reorganizing your domain structure to prioritize your most strategically valuable keyword at the beginning, followed by any secondary terms or brand identifiers.";
    } else if (recommendation.includes(".com domains")) {
      details[recommendation] = 
        "At the Functional Purpose level, your domain extension should maximize user trust and accessibility across all contexts. While alternative TLDs can work, the ." + extension + " extension currently used lacks the universal recognition of .com. The Abstract Function principle is that familiar patterns reduce cognitive friction and build inherent trust, with .com being the most recognized pattern globally. From a Physical Form perspective, users encountering unfamiliar TLDs may experience hesitation or question legitimacy. Consider securing the .com version of your domain name, even if it requires slight modification to your preferred name, as the trust benefits typically outweigh the costs of a less exact domain match.";
    } else if (recommendation.includes("strong domain name")) {
      details[recommendation] = 
        "Your domain excels at its core Functional Purpose of establishing a strong online foundation, scoring well across key evaluation metrics. From an Abstract Function perspective, your domain successfully balances the competing priorities of memorability, brandability, and search relevance – the trifecta of domain name excellence. At the Generalized Function level, this strong domain will support multiple business objectives including direct navigation, brand recall, and search discovery. To maximize this solid foundation, focus now on reinforcing your domain strength with complementary strategies: develop high-quality content that deeply covers your topic area, build relevant backlinks from authoritative sites in your industry, and ensure technical SEO fundamentals are properly implemented across your site architecture.";
    } else {
      // Default detailed description for any other recommendations
      details[recommendation] = 
        "This recommendation addresses a critical aspect of your domain strategy that impacts both user experience and search performance. At the Functional Purpose level, domains must balance technical optimization with human-centered design to create sustainable online success. The Abstract Function principles suggest that strategic improvements in this area will yield compounding benefits across multiple performance metrics over time. From a practical implementation standpoint, addressing this specific recommendation should be prioritized as it represents a foundational element that subsequent optimization efforts will build upon.";
    }
  });
  
  return details;
}

function identifyStrengths(metrics: SEOMetrics, name: string, extension: string): { strengths: string[], strengthDetails: Record<string, string> } {
  const strengths: string[] = [];
  const strengthDetails: Record<string, string> = {};
  
  if (metrics.length >= 7) {
    strengths.push("Good domain length");
    strengthDetails["Good domain length"] = "Your domain has an optimal length for SEO and usability. Domains between 6-14 characters are ideal as they are easier to remember and type while still allowing room for keywords.";
  }
  
  if (metrics.hasKeywords) {
    strengths.push("Contains relevant keywords");
    strengthDetails["Contains relevant keywords"] = `Your domain includes industry-relevant keywords that can improve search visibility. Search engines may give slight preference to domains that contain keywords related to your business or industry, especially if those keywords match common search queries.`;
  }
  
  if (metrics.memorability >= 8) {
    strengths.push("Highly memorable");
    strengthDetails["Highly memorable"] = "Your domain name scores high on memorability factors such as length, pronounceability, and minimal use of hyphens or numbers. Memorable domains lead to more direct traffic as users can easily recall your URL.";
  }
  
  if (metrics.brandability >= 8) {
    strengths.push("Strong branding potential");
    strengthDetails["Strong branding potential"] = "Your domain has excellent branding characteristics including uniqueness and distinctiveness. A strong brand domain helps establish a unique identity and can become a valuable business asset over time.";
  }
  
  if (metrics.keywordPlacement >= 8) {
    strengths.push("Optimal keyword placement");
    strengthDetails["Optimal keyword placement"] = "Your domain has keywords positioned optimally for search engine algorithms. Keywords at the beginning of a domain name can have a slightly stronger SEO impact than those positioned later.";
  }
  
  if (metrics.domainExtension >= 9) {
    strengths.push("Premium TLD");
    strengthDetails["Premium TLD"] = `Your domain uses a premium Top-Level Domain (TLD) extension which typically enjoys higher user trust and better SEO performance. The ${extension} TLD is widely recognized and respected across the internet.`;
  } else if (metrics.domainExtension >= 7) {
    strengths.push("Solid domain extension");
    strengthDetails["Solid domain extension"] = `The ${extension} TLD provides good SEO potential and user recognition. While not as universally recognized as .com, this extension still performs well in search rankings and user trust.`;
  }
  
  if (extension === 'com') {
    strengths.push("Uses .com extension");
    strengthDetails["Uses .com extension"] = ".com domains typically enjoy higher user trust and click-through rates as they are the most familiar to users. This TLD is generally preferred by search engines and users alike, potentially leading to improved SEO performance.";
  }
  
  return { strengths, strengthDetails };
}

function identifyWeaknesses(metrics: SEOMetrics, name: string, extension: string): { weaknesses: string[], weaknessDetails: Record<string, string> } {
  const weaknesses: string[] = [];
  const weaknessDetails: Record<string, string> = {};
  
  if (metrics.length < 5) {
    weaknesses.push("Very short domain name");
    weaknessDetails["Very short domain name"] = "While short domains are easy to type, extremely short domain names may limit keyword inclusion opportunities. This could make it harder for your site to rank for relevant industry terms through the domain name alone.";
  } else if (metrics.length > 12) {
    weaknesses.push("Lengthy domain name");
    weaknessDetails["Lengthy domain name"] = "Longer domain names can be harder for users to remember and type correctly, potentially leading to reduced direct traffic. They can also be more prone to typos which might direct users to competitor sites.";
  }
  
  if (!metrics.hasKeywords) {
    weaknesses.push("Lacks relevant keywords");
    weaknessDetails["Lacks relevant keywords"] = "Your domain doesn't contain industry-specific keywords that could help with search rankings. While modern SEO doesn't heavily weight keywords in domains, their presence can still provide a small advantage, especially for newer websites.";
  }
  
  if (metrics.memorability < 6) {
    weaknesses.push("Low memorability");
    weaknessDetails["Low memorability"] = "Your domain may be difficult for users to remember due to factors such as unusual spelling, length, or the use of numbers and hyphens. This could reduce return visits and word-of-mouth marketing effectiveness.";
  }
  
  if (metrics.brandability < 6) {
    weaknesses.push("Limited branding potential");
    weaknessDetails["Limited branding potential"] = "Your domain may have limited distinctive branding potential, which could impact recognition and differentiation from competitors. Strong brands typically have unique, distinctive names that stand out in their industry.";
  }
  
  if (metrics.keywordPlacement < 5 && metrics.hasKeywords) {
    weaknesses.push("Suboptimal keyword placement");
    weaknessDetails["Suboptimal keyword placement"] = "The keywords in your domain are positioned less optimally for search engine algorithms. Keywords that appear at the beginning of a domain name may have slightly more SEO impact than those positioned later.";
  }
  
  if (metrics.domainExtension < 7) {
    weaknesses.push("Less effective TLD");
    weaknessDetails["Less effective TLD"] = `The ${extension} TLD may have less SEO impact than premium alternatives like .com. Some users may be less familiar with this extension, potentially affecting click-through rates and perceived trustworthiness.`;
  }
  
  if (name.includes('-')) {
    weaknesses.push("Contains hyphens");
    weaknessDetails["Contains hyphens"] = "Hyphens in domain names can reduce memorability and are sometimes associated with lower-quality websites. Users may forget to include the hyphens when typing your URL, potentially leading them to competitor sites.";
  }
  
  if (/\d/.test(name)) {
    weaknesses.push("Contains numbers");
    weaknessDetails["Contains numbers"] = "Numbers in domain names can make them harder to remember and communicate verbally. Users may be unsure whether to spell out the number or use the numeral, and might confuse your domain with similar variations.";
  }
  
  return { weaknesses, weaknessDetails };
}
