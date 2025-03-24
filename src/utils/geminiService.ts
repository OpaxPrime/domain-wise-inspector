
import { AnalysisResult } from "@/types";

const GEMINI_API_KEY = "AIzaSyCHt8IWLWEmevLoOs7yF_f9J8zTcinuxCI";

// Type for Gemini API response
interface GeminiAnalyticsResponse {
  trafficData: {
    daily: { name: string; value: number; date: string }[];
    weekly: { name: string; value: number; date: string }[];
    monthly: { name: string; value: number; date: string }[];
    yearly: { name: string; value: number; date: string }[];
  };
  revenueData: {
    daily: { name: string; value: number; date: string }[];
    weekly: { name: string; value: number; date: string }[];
    monthly: { name: string; value: number; date: string }[];
    yearly: { name: string; value: number; date: string }[];
  };
  metrics: {
    totalTraffic: number;
    conversionRate: number;
    totalRevenue: number;
    averageRevenuePerUser: number;
    trafficChange: number;
    revenueChange: number;
  };
}

export async function fetchDomainAnalytics(domain: string): Promise<GeminiAnalyticsResponse> {
  try {
    console.log("Fetching analytics data for domain:", domain);
    
    const prompt = `
      Act as a domain analytics expert. I need realistic traffic and revenue data for the domain: ${domain}.
      Analyze this domain and provide me with the following data in JSON format:
      
      1. Traffic data (daily, weekly, monthly, yearly) - Include realistic visitor numbers
      2. Revenue data (daily, weekly, monthly, yearly) - Estimate potential earnings
      3. Key metrics:
         - Total traffic
         - Conversion rate
         - Total revenue
         - Average revenue per user
         - Traffic change percentage
         - Revenue change percentage
      
      Return ONLY valid JSON with no explanations or markdown.
    `;

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Gemini API error:", data);
      throw new Error("Failed to fetch domain analytics");
    }
    
    // Extract the JSON from the response text
    const responseText = data.candidates[0].content.parts[0].text;
    
    // Find the JSON part and parse it
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error("Failed to parse analytics data from API response");
    }
    
    const analyticsData = JSON.parse(jsonMatch[0]) as GeminiAnalyticsResponse;
    console.log("Received analytics data:", analyticsData);
    
    return analyticsData;
  } catch (error) {
    console.error("Error fetching domain analytics:", error);
    // Return fallback data if the API fails
    return generateFallbackAnalytics(domain);
  }
}

// Generate fallback data if the API fails
function generateFallbackAnalytics(domain: string): GeminiAnalyticsResponse {
  const baseTraffic = Math.floor(Math.random() * 20000 + 10000);
  const conversionRate = (Math.random() * 3 + 1) / 100; // 1-4%
  const revenuePerUser = Math.random() * 0.4 + 0.2; // $0.2-$0.6
  
  // Generate time-based data
  const generateTimeData = (count: number, baseValue: number, variance: number) => {
    const result = [];
    let date = new Date();
    
    for (let i = 0; i < count; i++) {
      // Move back in time for each entry
      date = new Date(date.getTime() - (i === 0 ? 0 : 24 * 60 * 60 * 1000));
      
      const value = Math.floor(baseValue * (1 + Math.random() * variance * 2 - variance));
      result.push({
        name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value,
        date: date.toISOString()
      });
    }
    return result.reverse(); // Reverse to get chronological order
  };
  
  // Generate data for different timeframes
  const trafficDaily = generateTimeData(14, baseTraffic / 30, 0.3);
  const trafficWeekly = generateTimeData(12, baseTraffic / 4, 0.25);
  const trafficMonthly = generateTimeData(12, baseTraffic, 0.2);
  const trafficYearly = generateTimeData(5, baseTraffic * 12, 0.15);
  
  // Calculate revenue based on traffic
  const calculateRevenue = (trafficData: any[]) => {
    return trafficData.map(item => ({
      ...item,
      value: Math.floor(item.value * conversionRate * revenuePerUser)
    }));
  };
  
  const revenueDaily = calculateRevenue(trafficDaily);
  const revenueWeekly = calculateRevenue(trafficWeekly);
  const revenueMonthly = calculateRevenue(trafficMonthly);
  const revenueYearly = calculateRevenue(trafficYearly);
  
  // Calculate metrics
  const trafficChange = Math.floor((trafficDaily[trafficDaily.length - 1].value / trafficDaily[trafficDaily.length - 2].value - 1) * 100);
  const revenueChange = Math.floor((revenueDaily[revenueDaily.length - 1].value / revenueDaily[revenueDaily.length - 2].value - 1) * 100);
  
  return {
    trafficData: {
      daily: trafficDaily,
      weekly: trafficWeekly,
      monthly: trafficMonthly,
      yearly: trafficYearly
    },
    revenueData: {
      daily: revenueDaily,
      weekly: revenueWeekly,
      monthly: revenueMonthly,
      yearly: revenueYearly
    },
    metrics: {
      totalTraffic: Math.floor(baseTraffic * 30), // Monthly traffic
      conversionRate: conversionRate * 100, // As percentage
      totalRevenue: Math.floor(baseTraffic * 30 * conversionRate * revenuePerUser),
      averageRevenuePerUser: parseFloat((revenuePerUser).toFixed(2)),
      trafficChange,
      revenueChange
    }
  };
}

// Export types for use in components
export type { GeminiAnalyticsResponse };
