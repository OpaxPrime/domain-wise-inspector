
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsChart } from "./AnalyticsChart";
import { AnalyticsInsights } from "./AnalyticsInsights";
import { Badge } from "@/components/ui/badge";
import { InfoIcon, TrendingUp, TrendingDown, DollarSign, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { GeminiAnalyticsResponse } from "@/utils/geminiService";

type TimeFrame = "daily" | "weekly" | "monthly" | "yearly";
type MetricType = "traffic" | "revenue";

interface RevenueTrafficDashboardProps {
  domain?: string;
  analyticsData?: GeminiAnalyticsResponse;
  isLoading?: boolean;
}

export function RevenueTrafficDashboard({ 
  domain, 
  analyticsData, 
  isLoading = false 
}: RevenueTrafficDashboardProps) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("monthly");
  const [activeTab, setActiveTab] = useState<MetricType>("traffic");
  const { user } = useAuth();
  const { toast } = useToast();
  
  const isPremium = user?.tier === "premium";
  
  const handleTimeFrameChange = (value: string) => {
    if (!isPremium && value !== "monthly") {
      toast({
        title: "Premium Feature",
        description: "Custom time frames are available for premium users only",
        variant: "destructive",
      });
      return;
    }
    setTimeFrame(value as TimeFrame);
  };
  
  const handleUpgrade = () => {
    toast({
      title: "Upgrade to Premium",
      description: "Unlock advanced analytics features with our premium plan",
    });
    // Add premium upgrade link here
  };

  // Use data from the API if available, otherwise use default values
  const trafficData = analyticsData?.trafficData[timeFrame] || [];
  const revenueData = analyticsData?.revenueData[timeFrame] || [];
  
  const {
    totalTraffic = 0,
    conversionRate = 0,
    totalRevenue = 0,
    averageRevenuePerUser = 0,
    trafficChange = 0,
    revenueChange = 0
  } = analyticsData?.metrics || {};

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Traffic</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalTraffic.toLocaleString()}</div>
                <div className="flex items-center text-xs mt-1">
                  {Number(trafficChange) > 0 ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  )}
                  <span className={Number(trafficChange) > 0 ? "text-green-500" : "text-red-500"}>
                    {trafficChange}%
                  </span>
                  <span className="text-muted-foreground ml-1">from previous period</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <InfoIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
                <div className="flex items-center text-xs mt-1">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">0.2%</span>
                  <span className="text-muted-foreground ml-1">from previous period</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                <div className="flex items-center text-xs mt-1">
                  {Number(revenueChange) > 0 ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  )}
                  <span className={Number(revenueChange) > 0 ? "text-green-500" : "text-red-500"}>
                    {revenueChange}%
                  </span>
                  <span className="text-muted-foreground ml-1">from previous period</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Revenue Per User</CardTitle>
            <InfoIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">${averageRevenuePerUser.toFixed(2)}</div>
                <div className="flex items-center text-xs mt-1">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">7.2%</span>
                  <span className="text-muted-foreground ml-1">from previous period</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Analytics{domain ? ` for ${domain}` : ''}</CardTitle>
              <CardDescription>
                {domain ? `${domain}'s` : 'Your domain\'s'} {activeTab} metrics over time
                {!isPremium && timeFrame !== "monthly" && (
                  <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">
                    Premium Preview
                  </Badge>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeFrame} onValueChange={handleTimeFrameChange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center bg-muted/40 rounded-md">
                <div className="text-center">
                  <Skeleton className="h-4 w-40 mx-auto mb-2" />
                  <Skeleton className="h-3 w-32 mx-auto" />
                </div>
              </div>
            ) : (
              <Tabs defaultValue="traffic" value={activeTab} onValueChange={(value) => setActiveTab(value as MetricType)}>
                <TabsList className="mb-4">
                  <TabsTrigger value="traffic">Traffic</TabsTrigger>
                  <TabsTrigger value="revenue">Revenue</TabsTrigger>
                </TabsList>
                <TabsContent value="traffic" className="space-y-4">
                  <AnalyticsChart 
                    data={trafficData} 
                    timeFrame={timeFrame} 
                    type="traffic" 
                  />
                </TabsContent>
                <TabsContent value="revenue" className="space-y-4">
                  <AnalyticsChart 
                    data={revenueData} 
                    timeFrame={timeFrame}
                    type="revenue" 
                  />
                </TabsContent>
              </Tabs>
            )}
            
            {!isPremium && timeFrame !== "monthly" && (
              <div className="mt-4 p-3 bg-muted/40 rounded-md text-sm">
                <p className="flex items-center text-muted-foreground">
                  <InfoIcon className="h-4 w-4 mr-2" />
                  This is a preview of premium features. 
                  <Button 
                    variant="link" 
                    onClick={handleUpgrade}
                    className="p-0 h-auto text-primary font-medium ml-1"
                  >
                    Upgrade now
                  </Button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Smart analysis of your data</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : (
              <AnalyticsInsights 
                type={activeTab} 
                timeFrame={timeFrame}
                data={activeTab === "traffic" ? trafficData : revenueData}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
