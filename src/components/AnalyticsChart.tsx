
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
      // Ensure data has all required fields
      const validatedData = data.map(point => ({
        name: point.name || "Unknown",
        value: typeof point.value === 'number' ? point.value : 0,
        date: point.date || new Date().toISOString()
      }));
      setChartData(validatedData);
    } else {
      // If no data, generate placeholder data with appropriate ranges
      const placeholderData = [];
      // Use different base values for traffic and revenue
      const baseValue = type === "revenue" ? 200 : 1000;
      
      for (let i = 0; i < 10; i++) {
        // For placeholder data, use realistic naming patterns
        let name = `Point ${i+1}`;
        if (timeFrame === 'daily') name = `Day ${i+1}`;
        if (timeFrame === 'weekly') name = `Week ${i+1}`;
        if (timeFrame === 'monthly') name = `Month ${i+1}`;
        if (timeFrame === 'yearly') name = `Year ${2020 + i}`;
        
        placeholderData.push({
          name: name,
          // Add a slight upward trend for placeholder data
          value: Math.floor(baseValue * (1 + i * 0.1) * (0.8 + Math.random() * 0.4)),
          date: new Date().toISOString()
        });
      }
      setChartData(placeholderData);
    }
  }, [data, type, timeFrame]);
  
  const formatYAxisTick = (value: number): string => {
    if (type === "revenue") {
      // Format numbers as currency values
      return `$${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`;
    }
    
    // Format large numbers with appropriate suffixes
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
          return value.substring(0, 3); // First 3 chars of month, e.g., "Jan"
        case "yearly":
          return value.substring(2); // Last 2 digits of year, e.g., "23" for 2023
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
              name={type === "traffic" ? "Traffic" : "Revenue"} 
              stroke={getColor()}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>
      </div>
    </Card>
  );
}
