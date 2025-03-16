
import { AnalysisResult } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { ChevronRight, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { SEOMetricsChart } from "./SEOMetricsChart";
import { useState } from "react";

interface AnalysisResultViewProps {
  result: AnalysisResult;
}

export const AnalysisResultView = ({ result }: AnalysisResultViewProps) => {
  const { domain, metrics, recommendations, strengths, weaknesses, strengthDetails, weaknessDetails } = result;
  
  // Track expanded items
  const [expandedStrengths, setExpandedStrengths] = useState<Record<string, boolean>>({});
  const [expandedWeaknesses, setExpandedWeaknesses] = useState<Record<string, boolean>>({});
  
  // Get integer score
  const score = metrics.overallScore;
  
  // Determine score color
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-500";
    if (score >= 6) return "text-yellow-500";
    return "text-red-500";
  };
  
  // Animate each metric
  const progressVariants = {
    hidden: { width: 0 },
    visible: (i: number) => ({ 
      width: `${(metrics as any)[i] * 10}%`,
      transition: { 
        duration: 1,
        delay: 0.3 + i * 0.1,
        ease: [0.32, 0.72, 0, 1]
      }
    })
  };

  // Toggle expanded state of strength/weakness
  const toggleStrength = (strength: string) => {
    setExpandedStrengths(prev => ({
      ...prev,
      [strength]: !prev[strength]
    }));
  };

  const toggleWeakness = (weakness: string) => {
    setExpandedWeaknesses(prev => ({
      ...prev,
      [weakness]: !prev[weakness]
    }));
  };

  return (
    <Card className="glass-card overflow-hidden shadow-soft">
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <Badge variant="outline" className="mb-2">Domain Analysis</Badge>
            <h3 className="text-2xl font-bold">{domain}</h3>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">SEO Score:</span>
            <motion.span 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`text-3xl font-bold ${getScoreColor(score)}`}
            >
              {score}/10
            </motion.span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-semibold mb-4">Metrics Breakdown</h4>
            
            <div className="space-y-4">
              {Object.entries(metrics)
                .filter(([key]) => key !== 'overallScore' && key !== 'hasKeywords')
                .map(([key, value], index) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="font-medium">{value}/10</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-primary rounded-full"
                        custom={key}
                        initial="hidden"
                        animate="visible"
                        variants={progressVariants}
                      />
                    </div>
                  </div>
                ))}
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Contains SEO Keywords</span>
                  <span>{metrics.hasKeywords ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex">
                  {metrics.hasKeywords ? (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" /> Present
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-500 border-red-200">
                      <XCircle className="w-3 h-3 mr-1" /> Not Found
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <SEOMetricsChart metrics={metrics} />
            </div>
          </div>
          
          <div className="space-y-6">
            {recommendations.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-3">Recommendations</h4>
                <ul className="space-y-2">
                  {recommendations.map((rec, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i, duration: 0.4 }}
                      className="flex items-start"
                    >
                      <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm ml-1">{rec}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-lg font-semibold mb-3 text-green-600 dark:text-green-400">Strengths</h4>
                <ul className="space-y-3">
                  {strengths.map((strength, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i, duration: 0.4 }}
                      className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-md overflow-hidden"
                    >
                      <button 
                        onClick={() => toggleStrength(strength)}
                        className="flex items-center justify-between w-full px-3 py-2 text-left text-sm"
                      >
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mr-1.5" />
                          <span className="font-medium">{strength}</span>
                        </div>
                        {expandedStrengths[strength] ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                      {expandedStrengths[strength] && strengthDetails[strength] && (
                        <div className="px-3 py-2 bg-white/50 dark:bg-black/5 border-t border-green-100 dark:border-green-900/30 text-sm">
                          {strengthDetails[strength]}
                        </div>
                      )}
                    </motion.li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-400">Weaknesses</h4>
                <ul className="space-y-3">
                  {weaknesses.map((weakness, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i, duration: 0.4 }}
                      className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-md overflow-hidden"
                    >
                      <button 
                        onClick={() => toggleWeakness(weakness)}
                        className="flex items-center justify-between w-full px-3 py-2 text-left text-sm"
                      >
                        <div className="flex items-center">
                          <XCircle className="h-4 w-4 text-red-500 shrink-0 mr-1.5" />
                          <span className="font-medium">{weakness}</span>
                        </div>
                        {expandedWeaknesses[weakness] ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                      {expandedWeaknesses[weakness] && weaknessDetails[weakness] && (
                        <div className="px-3 py-2 bg-white/50 dark:bg-black/5 border-t border-red-100 dark:border-red-900/30 text-sm">
                          {weaknessDetails[weakness]}
                        </div>
                      )}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
