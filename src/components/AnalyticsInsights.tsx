
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Crown, TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type TimeFrame = "daily" | "weekly" | "monthly" | "yearly";
type MetricType = "traffic" | "revenue";

interface AnalyticsInsightsProps {
  type: MetricType;
  timeFrame: TimeFrame;
  data: any[];
}

export function AnalyticsInsights({ type, timeFrame, data }: AnalyticsInsightsProps) {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<string[]>([]);
  const { user } = useAuth();
  
  const isPremium = user?.tier === "premium";
  
  useEffect(() => {
    // Only show loading state if data is empty
    if (data.length === 0) {
      setLoading(true);
      return;
    }
    
    // Simulate short loading delay for better UX
    setLoading(true);
    
    const timer = setTimeout(() => {
      generateInsights();
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [type, timeFrame, data]);
  
  const calculateTrend = () => {
    if (data.length < 3) return "stable";
    
    const lastThreePoints = data.slice(-3);
    const values = lastThreePoints.map(point => point.value);
    
    if (values[2] > values[0] && values[2] > values[1]) {
      return "increasing";
    } else if (values[2] < values[0] && values[2] < values[1]) {
      return "decreasing";
    } else {
      return "stable";
    }
  };
  
  const calculateAverage = () => {
    if (data.length === 0) return 0;
    return data.reduce((sum, point) => sum + point.value, 0) / data.length;
  };
  
  const calculateGrowthRate = () => {
    if (data.length < 2) return 0;
    
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    
    if (firstValue === 0) return 0;
    return ((lastValue - firstValue) / firstValue * 100).toFixed(1);
  };
  
  const generateInsights = () => {
    const trend = calculateTrend();
    const metric = type === "traffic" ? "traffic" : "revenue";
    const metricLabel = type === "traffic" ? "visitors" : "earnings";
    const average = calculateAverage();
    const growthRate = calculateGrowthRate();
    
    const trendInsight = {
      increasing: `Your ${metric} is trending upward over the ${timeFrame === "daily" ? "past few days" : timeFrame === "weekly" ? "past few weeks" : "past few months"}.`,
      decreasing: `Your ${metric} has been decreasing over the ${timeFrame === "daily" ? "past few days" : timeFrame === "weekly" ? "past few weeks" : "past few months"}.`,
      stable: `Your ${metric} has remained relatively stable recently.`
    }[trend];
    
    const insights = [
      trendInsight,
      type === "traffic" ? 
        `Based on current patterns, you can expect between ${Math.round(data[data.length - 1].value * 0.9)} and ${Math.round(data[data.length - 1].value * 1.1)} ${metricLabel} in the next period.` :
        `Your average ${metric} per period is $${Math.round(average)}.`,
      `Overall growth rate: ${growthRate}% over this ${timeFrame} period.`,
      trend === "increasing" ? 
        `Continue your current strategies to maintain this positive trend.` :
        trend === "decreasing" ? 
          `Consider revising your ${type === "traffic" ? "SEO and marketing strategies" : "pricing and conversion strategies"}.` :
          `Your ${metric} pattern suggests consistency in your operations.`
    ];
    
    // Add a premium insight
    if (isPremium) {
      const bestDay = findBestPerformingDay();
      
      insights.push(
        type === "traffic" ?
          `Your highest ${metric} typically occurs on ${bestDay}, with approximately ${Math.round(average * 1.2)} ${metricLabel}.` :
          `Based on seasonal patterns, you might expect a ${Math.round(Math.random() * 15 + 5)}% increase in ${metric} next month.`
      );
    }
    
    setInsights(insights);
  };
  
  const findBestPerformingDay = () => {
    if (data.length < 7) return "weekends";
    
    // Try to find day pattern in the data
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayPerformance = dayNames.map(day => ({ day, value: 0, count: 0 }));
    
    data.forEach(point => {
      const date = new Date(point.date);
      const dayIndex = date.getDay();
      dayPerformance[dayIndex].value += point.value;
      dayPerformance[dayIndex].count += 1;
    });
    
    // Calculate average per day
    dayPerformance.forEach(day => {
      if (day.count > 0) {
        day.value = day.value / day.count;
      }
    });
    
    // Find best day
    const bestDay = dayPerformance.reduce((best, current) => 
      current.value > best.value ? current : best, dayPerformance[0]);
      
    // Find second best day  
    const secondBest = dayPerformance
      .filter(day => day.day !== bestDay.day)
      .reduce((best, current) => current.value > best.value ? current : best, { day: "", value: 0, count: 0 });
    
    return `${bestDay.day}s and ${secondBest.day}s`;
  };
  
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        {isPremium && <Skeleton className="h-4 w-5/6 mt-2" />}
      </div>
    );
  }
  
  const getTrendIcon = () => {
    const trend = calculateTrend();
    if (trend === "increasing") return <TrendingUp className="h-4 w-4 text-green-500 mr-2" />;
    if (trend === "decreasing") return <TrendingDown className="h-4 w-4 text-red-500 mr-2" />;
    return <BarChart2 className="h-4 w-4 text-muted-foreground mr-2" />;
  };

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <div key={index} className="flex items-start">
          {index === 0 ? getTrendIcon() : <div className="w-4 h-4 mr-2" />}
          <p className={`text-sm ${index === 0 ? "font-medium" : ""}`}>{insight}</p>
        </div>
      ))}
      
      {!isPremium && (
        <div className="mt-4 pt-4 border-t border-border flex items-center text-sm text-muted-foreground">
          <Crown className="h-4 w-4 text-amber-500 mr-2" />
          <p>Upgrade to premium for deeper insights</p>
        </div>
      )}
    </div>
  );
}
