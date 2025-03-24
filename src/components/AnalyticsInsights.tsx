
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, TrendingDown, Lock, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type InsightsProps = {
  type: "traffic" | "revenue";
  timeFrame: "daily" | "weekly" | "monthly" | "yearly";
  data: Array<{ name: string; value: number; date: string }>;
};

export function AnalyticsInsights({ type, timeFrame, data }: InsightsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState<string[]>([]);
  const { user } = useAuth();
  
  const isPremium = user?.tier === "premium";

  useEffect(() => {
    // Simulate loading AI insights
    setIsLoading(true);
    
    // Generate insights based on the data
    const timer = setTimeout(() => {
      const newInsights = generateInsights(type, timeFrame, data);
      setInsights(newInsights);
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [type, timeFrame, data]);
  
  const generateInsights = (
    type: "traffic" | "revenue", 
    timeFrame: string, 
    data: Array<{ name: string; value: number; date: string }>
  ) => {
    // Calculate trends
    const hasEnoughData = data.length > 3;
    const lastValues = data.slice(-3).map(d => d.value);
    const isIncreasing = hasEnoughData && lastValues[2] > lastValues[1] && lastValues[1] > lastValues[0];
    const isDecreasing = hasEnoughData && lastValues[2] < lastValues[1] && lastValues[1] < lastValues[0];
    const isVolatile = hasEnoughData && !isIncreasing && !isDecreasing;
    
    // Generate growth rate
    let growthRate = 0;
    if (hasEnoughData) {
      growthRate = ((lastValues[2] - lastValues[0]) / lastValues[0]) * 100;
    }
    
    const growthPercent = Math.abs(growthRate).toFixed(1);
    
    // Get time period in readable format
    const timeFrameReadable = {
      daily: "day",
      weekly: "week",
      monthly: "month",
      yearly: "year",
    }[timeFrame];
    
    // Type-specific language
    const metricName = type === "traffic" ? "traffic" : "revenue";
    const action = type === "traffic" ? "visits" : "earnings";
    
    // Generate insights based on the trends
    const insightsList = [];
    
    if (isIncreasing) {
      insightsList.push(
        `Your ${metricName} is showing a positive trend with a ${growthPercent}% increase over the last ${timeFrameReadable}.`,
        `The consistent upward trend suggests your SEO strategy is effective. Consider expanding your keywords to leverage this momentum.`
      );
    } else if (isDecreasing) {
      insightsList.push(
        `Your ${metricName} has decreased by ${growthPercent}% over the last ${timeFrameReadable}.`,
        `Consider revisiting your marketing strategy to reverse this trend. Focus on content quality and keyword optimization.`
      );
    } else if (isVolatile) {
      insightsList.push(
        `Your ${metricName} shows volatility, indicating seasonal factors may be at play.`,
        `Try scheduling content publication to align with peak traffic periods to maximize exposure.`
      );
    }
    
    // Add day-of-week insight for daily data
    if (timeFrame === "daily" && type === "traffic") {
      insightsList.push(
        `Traffic peaks are observed on weekdays, with midweek showing highest engagement. Consider timing important content releases accordingly.`
      );
    }
    
    // Add conversion insight for revenue
    if (type === "revenue" && isPremium) {
      insightsList.push(
        `Your conversion rate could improve by approximately 15% by optimizing checkout pages and reducing abandonment.`
      );
    }
    
    return insightsList;
  };
  
  const renderInsightItem = (text: string, index: number) => (
    <div key={index} className="flex gap-2 mb-3 last:mb-0">
      <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-muted-foreground">
        {text}
      </p>
    </div>
  );

  return (
    <div className="space-y-4">
      {isLoading ? (
        <>
          <div className="flex gap-2 mb-3">
            <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="w-full">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="w-full">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </>
      ) : (
        <>
          {insights.slice(0, isPremium ? insights.length : 1).map((insight, index) => (
            renderInsightItem(insight, index)
          ))}
          
          {!isPremium && insights.length > 1 && (
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  <Lock className="h-3 w-3 mr-1" /> Premium Insights
                </Badge>
                <Button variant="ghost" size="sm" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1 text-amber-500" /> Upgrade
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      
      {data.length > 0 && !isLoading && (
        <div className="pt-3 mt-3 border-t border-border">
          <div className="flex items-center gap-2">
            {calculateTrend(data) > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm font-medium">
              {Math.abs(calculateTrend(data)).toFixed(1)}% {calculateTrend(data) > 0 ? "increase" : "decrease"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Compared to previous {timeFrame} period
          </p>
        </div>
      )}
    </div>
  );
}

function calculateTrend(data: Array<{ value: number }>) {
  if (data.length < 2) return 0;
  
  const current = data[data.length - 1].value;
  const previous = data[data.length - 2].value;
  
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}
