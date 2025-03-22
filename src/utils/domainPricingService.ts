
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
