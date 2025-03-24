
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useMediaQuery } from "@/hooks/use-mobile";

type ChartDataPoint = {
  name: string;
  value: number;
  date: string;
};

type TimeFrame = "daily" | "weekly" | "monthly" | "yearly";
type MetricType = "traffic" | "revenue";

interface AnalyticsChartProps {
  data: ChartDataPoint[];
  timeFrame: TimeFrame;
  type: MetricType;
}

export function AnalyticsChart({ data, timeFrame, type }: AnalyticsChartProps) {
  const [chartType, setChartType] = useState<"area" | "line">("area");
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  const formatYAxisTick = (value: number): string => {
    if (type === "revenue") {
      return `$${value.toLocaleString()}`;
    }
    
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    
    return value.toString();
  };
  
  const getColor = () => {
    return type === "traffic" ? "hsl(var(--primary))" : "hsl(var(--secondary)/0.8)";
  };
  
  const formatXAxisTick = (value: string) => {
    if (isMobile) {
      // Shorter labels on mobile
      switch (timeFrame) {
        case "daily":
          return value.split(" ")[0]; // Only day of week, e.g., "Mon"
        case "monthly":
          return value.substring(0, 1); // First letter of month, e.g., "J" for January
        default:
          return value;
      }
    }
    return value;
  };
  
  const chartConfig = {
    "traffic": {
      label: "Traffic",
      theme: {
        light: "hsl(var(--primary))",
        dark: "hsl(var(--primary))"
      }
    },
    "revenue": {
      label: "Revenue",
      theme: {
        light: "hsl(var(--secondary)/0.8)",
        dark: "hsl(var(--secondary)/0.8)"
      }
    }
  };
  
  return (
    <Card className="p-4">
      <div className="mb-4 flex justify-end">
        <Tabs defaultValue="area" value={chartType} onValueChange={(v) => setChartType(v as "area" | "line")}>
          <TabsList className="grid w-[180px] grid-cols-2">
            <TabsTrigger value="area">Area</TabsTrigger>
            <TabsTrigger value="line">Line</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="h-[300px]">
        <ChartContainer 
          config={chartConfig}
          className="w-full h-full"
        >
          {chartType === "area" ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                tickFormatter={formatXAxisTick} 
                tick={{ fontSize: 12 }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                tickFormatter={formatYAxisTick} 
                tick={{ fontSize: 12 }}
                width={isMobile ? 40 : 60}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                name={type} 
                stroke={getColor()} 
                fill={getColor()} 
                fillOpacity={0.2}
              />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                tickFormatter={formatXAxisTick} 
                tick={{ fontSize: 12 }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                tickFormatter={formatYAxisTick} 
                tick={{ fontSize: 12 }}
                width={isMobile ? 40 : 60}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                name={type} 
                stroke={getColor()} 
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          )}
        </ChartContainer>
      </div>
    </Card>
  );
}
