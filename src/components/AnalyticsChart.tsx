
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
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
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  
  useEffect(() => {
    // Format the data for the chart
    if (data && data.length > 0) {
      setChartData(data);
    } else {
      // If no data, generate placeholder data
      const placeholderData = [];
      for (let i = 0; i < 10; i++) {
        placeholderData.push({
          name: `Point ${i+1}`,
          value: Math.floor(Math.random() * 1000),
          date: new Date().toISOString()
        });
      }
      setChartData(placeholderData);
    }
  }, [data]);
  
  const formatYAxisTick = (value: number): string => {
    if (type === "revenue") {
      return `$${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`;
    }
    
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
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
  
  // Custom tooltip formatter to show appropriate values
  const tooltipFormatter = (value: number) => {
    if (type === "revenue") {
      return [`$${value.toLocaleString()}`, "Revenue"];
    }
    return [value.toLocaleString(), "Traffic"];
  };
  
  return (
    <Card className="p-4">      
      <div className="h-[300px]">
        <ChartContainer 
          config={chartConfig}
          className="w-full h-full"
        >
          <LineChart 
            data={chartData} 
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
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
            <Tooltip 
              formatter={tooltipFormatter}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              name={type} 
              stroke={getColor()} 
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>
      </div>
    </Card>
  );
}
