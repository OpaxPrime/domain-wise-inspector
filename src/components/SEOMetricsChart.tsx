
import { useEffect, useRef } from "react";
import { SEOMetrics } from "@/types";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface SEOMetricsChartProps {
  metrics: SEOMetrics;
  isPremium?: boolean;
}

export const SEOMetricsChart = ({ metrics, isPremium = false }: SEOMetricsChartProps) => {
  // Cap metrics at 10 to avoid exceeding the scale
  const cappedMetrics = {
    length: Math.min(metrics.length, 10),
    memorability: Math.min(metrics.memorability, 10),
    brandability: Math.min(metrics.brandability, 10),
    keywordPlacement: Math.min(metrics.keywordPlacement, 10),
    domainExtension: Math.min(metrics.domainExtension, 10),
    overallScore: Math.min(metrics.overallScore, 10),
  };

  // Transform metrics for the radar chart
  const chartData = [
    { name: "Length", value: cappedMetrics.length },
    { name: "Memorability", value: cappedMetrics.memorability },
    { name: "Brandability", value: cappedMetrics.brandability },
    { name: "Keyword Placement", value: cappedMetrics.keywordPlacement },
    { name: "Domain Extension", value: cappedMetrics.domainExtension },
  ];

  return (
    <div className="space-y-4">
      {/* Progress bars for each metric */}
      <div className="grid grid-cols-1 gap-2">
        {chartData.map((item) => (
          <div key={item.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{item.name}</span>
              <span className="font-medium">{item.value}/10</span>
            </div>
            <Progress value={item.value * 10} className="h-2" />
          </div>
        ))}
      </div>

      {/* Radar chart visualization */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="w-full h-44 md:h-52"
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid stroke="rgba(0, 0, 0, 0.1)" />
            <PolarAngleAxis
              dataKey="name"
              tick={{ fill: "var(--foreground)", fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 10]}
              tick={{ fill: "var(--foreground)" }}
              axisLine={false}
              tickFormatter={() => ""}
            />
            <Radar
              name="SEO Metrics"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
              animationBegin={500}
              animationDuration={1500}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};
