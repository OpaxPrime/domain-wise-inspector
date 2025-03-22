
import { DomainPricing } from "@/types";

const GEMINI_API_KEY = "AIzaSyD-awudRyMU0DF-pu-86xfAOrpuB2BCFw0";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

/**
 * Fetches domain pricing and availability information using the Gemini API
 */
export async function getDomainPricing(domain: string): Promise<DomainPricing> {
  try {
    const prompt = `
      I need information about the domain "${domain}". 
      Please provide:
      1. Is the domain available for purchase? (true or false)
      2. If available, what is its approximate price in USD?
      3. Which registrar offers this domain?
      
      Format your response as a JSON object with these keys: 
      {
        "available": boolean,
        "price": number or null,
        "currency": "USD",
        "registrar": string or null
      }
      
      Only return valid JSON. Don't include any other explanation.
    `;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Gemini API error:", await response.text());
      return { available: false };
    }

    const data = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text;

    if (!text) {
      return { available: false };
    }

    // Extract the JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { available: false };
    }

    try {
      const pricing = JSON.parse(jsonMatch[0]);
      return {
        available: Boolean(pricing.available),
        price: pricing.price || undefined,
        currency: pricing.currency || "USD",
        registrar: pricing.registrar || undefined,
      };
    } catch (error) {
      console.error("Error parsing Gemini API response:", error);
      return { available: false };
    }
  } catch (error) {
    console.error("Error fetching domain pricing:", error);
    return { available: false };
  }
}
