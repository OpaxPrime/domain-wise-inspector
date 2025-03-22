import { DomainPricing } from "@/types";

/**
 * Fetches domain pricing and availability information using the Perplexity API
 */
export async function getDomainPricing(domain: string): Promise<DomainPricing> {
  try {
    // Temporary hardcoded data while waiting for API key
    // This would normally be replaced with actual API calls
    const mockData = getMockPricingData(domain);
    
    // Note: In a production environment, you would use:
    // const data = await fetchFromPerplexityAPI(domain);
    
    return {
      available: mockData.available,
      price: mockData.price,  // Return price regardless of availability
      currency: mockData.currency || "USD",
      registrar: mockData.registrar
    };
  } catch (error) {
    console.error("Error fetching domain pricing:", error);
    // Even on error, return a default price estimate
    return { 
      available: false,
      price: getDefaultPriceEstimate(domain),
      currency: "USD",
      registrar: "Unknown"
    };
  }
}

/**
 * Uses AI to generate domain name suggestions based on user input
 */
export async function getDomainSuggestions(
  targetAudience: string,
  domainExtension: string,
  brandType: string
): Promise<string[]> {
  try {
    // This would be replaced with an actual API call in production
    // const suggestions = await fetchFromAIService(targetAudience, domainExtension, brandType);
    
    // For demo purposes, we'll generate some mock suggestions
    const suggestions = generateMockDomainSuggestions(targetAudience, domainExtension, brandType);
    
    return suggestions;
  } catch (error) {
    console.error("Error generating domain suggestions:", error);
    throw new Error("Failed to generate domain suggestions");
  }
}

/**
 * This would be replaced with actual Perplexity API implementation
 * Example implementation for when user provides API key
 */
async function fetchFromPerplexityAPI(domain: string, apiKey: string): Promise<any> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'system',
          content: 'You are a domain pricing expert. Be precise and concise.'
        },
        {
          role: 'user',
          content: `I need information about the domain "${domain}". 
          Please provide:
          1. Is the domain available for purchase? (true or false)
          2. What is its approximate price in USD?
          3. Which registrar offers this domain?
          
          Format your response as a JSON object with these keys: 
          {
            "available": boolean,
            "price": number,
            "currency": "USD",
            "registrar": string
          }
          
          Only return valid JSON. Don't include any other explanation.`
        }
      ],
      temperature: 0.2,
      max_tokens: 200
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${await response.text()}`);
  }

  const data = await response.json();
  const text = data.choices[0]?.message?.content;

  if (!text) {
    throw new Error("No content in API response");
  }

  // Extract the JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in response");
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * This function would be replaced with actual AI API call
 * For domain name generation based on user input
 */
async function fetchDomainSuggestionsFromAI(
  targetAudience: string,
  domainExtension: string,
  brandType: string,
  apiKey: string
): Promise<string[]> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'system',
          content: 'You are a creative domain name generator. Your suggestions should be catchy, memorable, and relevant to the business. Suggest only available domains.'
        },
        {
          role: 'user',
          content: `Generate 10 creative domain name suggestions based on the following:
          
          Target Audience: ${targetAudience}
          Domain Extension: .${domainExtension}
          Brand Type: ${brandType}
          
          The domain names should be:
          - Catchy and memorable
          - Relevant to the brand
          - Relatively short (max 15 characters before the extension)
          - Without hyphens or numbers (unless they make sense for the brand)
          
          Format your response as a JSON array of strings with just the domain names, including the extension.
          Example: ["example.com", "mybusiness.com"]
          
          Only return valid JSON. Don't include any other explanation.`
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${await response.text()}`);
  }

  const data = await response.json();
  const text = data.choices[0]?.message?.content;

  if (!text) {
    throw new Error("No content in API response");
  }

  // Extract the JSON from the response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("No JSON found in response");
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Get a default price estimate based on domain characteristics
 */
function getDefaultPriceEstimate(domain: string): number {
  const tld = domain.split('.').pop() || "";
  
  // Premium TLDs are more expensive
  const premiumTlds = ['ai', 'io', 'app', 'dev', 'tech', 'co'];
  const domainLength = domain.split('.')[0].length;
  
  // Shorter domains tend to be more expensive
  if (domainLength <= 3) {
    return premiumTlds.includes(tld) ? 15000 : 8000;
  } else if (domainLength <= 5) {
    return premiumTlds.includes(tld) ? 5000 : 2000;
  } else {
    return premiumTlds.includes(tld) ? 1500 : 500;
  }
}

/**
 * Provides mock data for demonstration purposes
 */
function getMockPricingData(domain: string): DomainPricing {
  const tld = domain.split('.').pop() || "com";
  const name = domain.split('.')[0];
  const isCommon = ["google", "amazon", "facebook", "twitter", "instagram"].includes(name);
  
  // Common/popular domains will be unavailable
  if (isCommon) {
    return {
      available: false,
      price: getDefaultPriceEstimate(domain),
      currency: "USD",
      registrar: "Unknown (Currently Registered)"
    };
  }
  
  // Short domains are usually taken but have high value
  if (name.length <= 4) {
    const isAvailable = Math.random() > 0.8; // 20% chance of being available
    return {
      available: isAvailable,
      price: isAvailable ? 2000 + Math.floor(Math.random() * 8000) : 5000 + Math.floor(Math.random() * 20000),
      currency: "USD",
      registrar: isAvailable ? "GoDaddy" : "Unknown (Currently Registered)"
    };
  }
  
  // Longer domains more likely to be available and cheaper
  const isAvailable = Math.random() > 0.4; // 60% chance of being available
  return {
    available: isAvailable,
    price: isAvailable ? 10 + Math.floor(Math.random() * 100) : 200 + Math.floor(Math.random() * 5000),
    currency: "USD",
    registrar: isAvailable ? 
      ["GoDaddy", "Namecheap", "Domain.com", "Google Domains"][Math.floor(Math.random() * 4)] : 
      "Unknown (Currently Registered)"
  };
}

/**
 * Generates mock domain suggestions based on the brand type
 * This is for demo purposes only and would be replaced with AI API calls
 */
function generateMockDomainSuggestions(
  targetAudience: string,
  domainExtension: string,
  brandType: string
): string[] {
  // Extract keywords from inputs
  const targetKeywords = extractKeywords(targetAudience);
  const brandKeywords = extractKeywords(brandType);
  
  // Common prefixes and suffixes for domain names
  const prefixes = ['get', 'try', 'my', 'the', 'pro', 'smart', 'best', 'top', 'prime', 'peak'];
  const suffixes = ['hub', 'spot', 'zone', 'space', 'app', 'now', 'hq', 'central', 'base', 'pro'];
  
  // Business type specific keywords
  const businessTypeKeywords: Record<string, string[]> = {
    ecommerce: ['shop', 'store', 'mart', 'buy', 'cart', 'deal', 'market'],
    tech: ['tech', 'dev', 'code', 'app', 'digital', 'cyber', 'web', 'net'],
    finance: ['fin', 'cash', 'money', 'wealth', 'capital', 'invest', 'fund'],
    health: ['health', 'wellness', 'fit', 'care', 'life', 'vital', 'med'],
    creative: ['create', 'design', 'art', 'studio', 'craft', 'vision', 'idea'],
    food: ['taste', 'dish', 'food', 'eat', 'meal', 'cook', 'chef', 'dining'],
    education: ['learn', 'edu', 'teach', 'skill', 'academy', 'class', 'course'],
    personal: ['my', 'me', 'self', 'personal', 'life', 'journey', 'story'],
  };
  
  // Determine which business type keywords to use
  let relevantBusinessKeywords: string[] = [];
  
  for (const [type, keywords] of Object.entries(businessTypeKeywords)) {
    if (brandType.toLowerCase().includes(type)) {
      relevantBusinessKeywords = [...relevantBusinessKeywords, ...keywords];
    }
  }
  
  // If no specific business type is detected, use a mix
  if (relevantBusinessKeywords.length === 0) {
    relevantBusinessKeywords = Object.values(businessTypeKeywords).flat().slice(0, 10);
  }
  
  const suggestions: string[] = [];
  
  // Generate suggestions using various patterns
  
  // 1. Prefix + keyword combinations
  for (const prefix of shuffleArray(prefixes).slice(0, 2)) {
    for (const keyword of shuffleArray([...targetKeywords, ...brandKeywords]).slice(0, 2)) {
      if (keyword.length > 3) {
        suggestions.push(`${prefix}${capitalize(keyword)}.${domainExtension}`);
      }
    }
  }
  
  // 2. Keyword + suffix combinations
  for (const suffix of shuffleArray(suffixes).slice(0, 2)) {
    for (const keyword of shuffleArray([...targetKeywords, ...brandKeywords]).slice(0, 2)) {
      if (keyword.length > 3) {
        suggestions.push(`${keyword}${capitalize(suffix)}.${domainExtension}`);
      }
    }
  }
  
  // 3. Business keywords + audience keywords
  for (const businessWord of shuffleArray(relevantBusinessKeywords).slice(0, 3)) {
    for (const audienceWord of shuffleArray(targetKeywords).slice(0, 2)) {
      if (audienceWord.length > 3) {
        suggestions.push(`${businessWord}${capitalize(audienceWord)}.${domainExtension}`);
      }
    }
  }
  
  // 4. Single strong keywords
  for (const keyword of shuffleArray([...targetKeywords, ...brandKeywords, ...relevantBusinessKeywords]).slice(0, 3)) {
    if (keyword.length > 5 && keyword.length < 10) {
      suggestions.push(`${keyword}.${domainExtension}`);
    }
  }
  
  // 5. Creative combinations
  if (brandKeywords.length > 0 && targetKeywords.length > 0) {
    const brandWord = brandKeywords[Math.floor(Math.random() * brandKeywords.length)];
    const targetWord = targetKeywords[Math.floor(Math.random() * targetKeywords.length)];
    
    suggestions.push(`${brandWord}for${capitalize(targetWord)}.${domainExtension}`);
    suggestions.push(`${targetWord}${capitalize(brandWord)}.${domainExtension}`);
  }
  
  // Filter duplicates and ensure we have unique suggestions
  const uniqueSuggestions = Array.from(new Set(suggestions));
  
  // Make sure we have at least 5 suggestions
  while (uniqueSuggestions.length < 5) {
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    uniqueSuggestions.push(`${randomPrefix}${capitalize(randomSuffix)}.${domainExtension}`);
  }
  
  // Limit to 10 suggestions
  return uniqueSuggestions.slice(0, 10);
}

/**
 * Helper function to extract relevant keywords from text
 */
function extractKeywords(text: string): string[] {
  // Remove common words and punctuation
  const cleanText = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Split into words
  const words = cleanText.split(' ');
  
  // Filter out common words and short words
  const commonWords = ['and', 'the', 'or', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'like'];
  
  return words
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .slice(0, 10); // Limit to 10 keywords
}

/**
 * Helper function to capitalize first letter
 */
function capitalize(str: string): string {
  if (!str || str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Helper function to shuffle an array
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

