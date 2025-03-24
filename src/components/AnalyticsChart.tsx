
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type DataPoint = {
  name: string;
  value: number;
  date: string;
};

type ChartProps = {
  data: DataPoint[];
  timeFrame: "daily" | "weekly" | "monthly" | "yearly";
  type: "traffic" | "revenue";
};

export function AnalyticsChart({ data, timeFrame, type }: ChartProps) {
  const chartConfig = {
    area: {
      traffic: {
        theme: {
          light: "#0ea5e980",
          dark: "#0ea5e980",
        },
      },
      revenue: {
        theme: {
          light: "#8b5cf680",
          dark: "#8b5cf680",
        },
      },
    },
    line: {
      traffic: {
        theme: {
          light: "#0ea5e9",
          dark: "#0ea5e9",
        },
      },
      revenue: {
        theme: {
          light: "#8b5cf6",
          dark: "#8b5cf6",
        },
      },
    },
  };

  const formatYAxisTick = (value: number) => {
    if (type === "revenue") {
      return `$${value.toLocaleString()}`;
    }
    
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value;
  };
  
  const formatTooltipValue = (value: number) => {
    if (type === "revenue") {
      return `$${value.toLocaleString()}`;
    }
    return value.toLocaleString();
  };

  return (
    <ChartContainer
      config={chartConfig}
      className="h-[300px] w-full [&_.recharts-cartesian-grid-horizontal_line]:stroke-border [&_.recharts-cartesian-grid-vertical_line]:stroke-border"
    >
      <AreaChart
        data={data}
        margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={type === "traffic" ? "#0ea5e9" : "#8b5cf6"} stopOpacity={0.8} />
            <stop offset="95%" stopColor={type === "traffic" ? "#0ea5e9" : "#8b5cf6"} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="name" 
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          padding={{ left: 10, right: 10 }}
          stroke="#888888"
        />
        <YAxis 
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          stroke="#888888"
          tickFormatter={formatYAxisTick}
        />
        <ChartTooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const dataPoint = payload[0].payload as DataPoint;
              return (
                <div className="rounded-lg border bg-background p-2 shadow-md">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Date</span>
                      <span className="text-sm text-muted-foreground">
                        {dataPoint.date}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{type === "traffic" ? "Visitors" : "Revenue"}</span>
                      <span className="text-sm text-muted-foreground">
                        {type === "revenue" ? `$${dataPoint.value.toLocaleString()}` : dataPoint.value.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={type === "traffic" ? "#0ea5e9" : "#8b5cf6"}
          strokeWidth={2}
          fill={`url(#gradient-${type})`}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
      </AreaChart>
    </ChartContainer>
  );
}
