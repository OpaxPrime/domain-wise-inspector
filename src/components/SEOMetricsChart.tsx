
import { useEffect, useRef } from "react";
import { SEOMetrics } from "@/types";
import { motion } from "framer-motion";
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
  // Transform metrics for the radar chart
  const chartData = [
    { name: "Length", value: metrics.length },
    { name: "Memorability", value: metrics.memorability },
    { name: "Brandability", value: metrics.brandability },
    { name: "Keyword Placement", value: metrics.keywordPlacement },
    { name: "Domain Extension", value: metrics.domainExtension },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="w-full h-52 md:h-64"
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
  );
};
