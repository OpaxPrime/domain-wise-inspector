
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Lock, Crown } from "lucide-react";
import { SEOMetricsChart } from "./SEOMetricsChart";
import { AnalysisResult } from "@/types";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const STRIPE_CHECKOUT_URL = "https://buy.stripe.com/cN2fZj8HF6LnbCM144";

interface AnalysisResultViewProps {
  result: AnalysisResult;
  isPremium?: boolean;
}

export const AnalysisResultView = ({ result, isPremium = false }: AnalysisResultViewProps) => {
  const [isStrengthsOpen, setIsStrengthsOpen] = useState(false);
  const [isWeaknessesOpen, setIsWeaknessesOpen] = useState(false);
  const [expandedStrength, setExpandedStrength] = useState<string | null>(null);
  const [expandedWeakness, setExpandedWeakness] = useState<string | null>(null);

  const toggleStrengthExpansion = (strength: string) => {
    setExpandedStrength(expandedStrength === strength ? null : strength);
  };

  const toggleWeaknessExpansion = (weakness: string) => {
    setExpandedWeakness(expandedWeakness === weakness ? null : weakness);
  };

  // Show only 3 strengths and 2 weaknesses for free users
  const visibleStrengths = isPremium ? result.strengths : result.strengths.slice(0, 3);
  const visibleWeaknesses = isPremium ? result.weaknesses : result.weaknesses.slice(0, 2);
  const hiddenStrengthsCount = result.strengths.length - visibleStrengths.length;
  const hiddenWeaknessesCount = result.weaknesses.length - visibleWeaknesses.length;

  // Score color logic based on score value
  const getScoreColor = (score: number) => {
    if (score > 7) return "bg-blue-500 text-white";
    if (score >= 5) return "bg-yellow-400 text-gray-800";
    return "bg-red-500 text-white";
  };

  const scoreColor = getScoreColor(result.metrics.overallScore);
  
  const handleGetPremium = () => {
    window.open(STRIPE_CHECKOUT_URL, '_blank');
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">{result.domain}</CardTitle>
          <div className="flex gap-2 items-center">
            <Badge variant="outline" className={`font-normal ${scoreColor}`}>
              Score: {result.metrics.overallScore}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
              <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground">
                {isPremium
                  ? result.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))
                  : result.recommendations.slice(0, 3).map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                
                {!isPremium && result.recommendations.length > 3 && (
                  <li className="flex items-center text-primary font-medium">
                    <Lock className="h-3 w-3 mr-1.5" />
                    <span>{result.recommendations.length - 3} more recommendations with Premium</span>
                  </li>
                )}
              </ul>
            </div>
            
            {!isPremium && (
              <div className="mt-6">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full text-sm group">
                      <Lock className="h-3 w-3 mr-1 group-hover:hidden" />
                      <Crown className="h-3 w-3 mr-1 hidden group-hover:block text-amber-500" />
                      <span className="group-hover:text-amber-500">Unlock All Metrics</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upgrade to Premium</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="mb-4">Upgrade to Premium to unlock all SEO metrics, unlimited domain analysis, and detailed recommendations.</p>
                      <Button 
                        className="w-full bg-amber-500 hover:bg-amber-600"
                        onClick={handleGetPremium}
                      >
                        <Crown className="mr-2 h-4 w-4" />
                        Get Premium
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <Button
                variant="ghost"
                className="w-full justify-between mb-2 bg-muted/40"
                onClick={() => setIsStrengthsOpen(!isStrengthsOpen)}
              >
                <span className="font-medium">Strengths</span>
                {isStrengthsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </Button>
              
              {isStrengthsOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-md border p-4 space-y-3"
                >
                  {visibleStrengths.map((strength, index) => (
                    <div key={index} className="space-y-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between p-2 h-auto text-left font-normal"
                        onClick={() => toggleStrengthExpansion(strength)}
                      >
                        <span>{strength}</span>
                        {expandedStrength === strength ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </Button>
                      
                      {expandedStrength === strength && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-sm text-muted-foreground p-2 pl-3 border-l-2 ml-2"
                        >
                          {result.strengthDetails[strength]}
                        </motion.div>
                      )}
                    </div>
                  ))}
                  
                  {!isPremium && hiddenStrengthsCount > 0 && (
                    <div className="flex items-center justify-center py-2 border-t border-dashed">
                      <span className="text-sm text-primary flex items-center">
                        <Lock className="h-3 w-3 mr-1.5" />
                        {hiddenStrengthsCount} more strengths with Premium
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            <div>
              <Button
                variant="ghost"
                className="w-full justify-between mb-2 bg-muted/40"
                onClick={() => setIsWeaknessesOpen(!isWeaknessesOpen)}
              >
                <span className="font-medium">Weaknesses</span>
                {isWeaknessesOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </Button>
              
              {isWeaknessesOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-md border p-4 space-y-3"
                >
                  {visibleWeaknesses.map((weakness, index) => (
                    <div key={index} className="space-y-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between p-2 h-auto text-left font-normal"
                        onClick={() => toggleWeaknessExpansion(weakness)}
                      >
                        <span>{weakness}</span>
                        {expandedWeakness === weakness ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </Button>
                      
                      {expandedWeakness === weakness && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-sm text-muted-foreground p-2 pl-3 border-l-2 ml-2"
                        >
                          {result.weaknessDetails[weakness]}
                        </motion.div>
                      )}
                    </div>
                  ))}
                  
                  {!isPremium && hiddenWeaknessesCount > 0 && (
                    <div className="flex items-center justify-center py-2 border-t border-dashed">
                      <span className="text-sm text-primary flex items-center">
                        <Lock className="h-3 w-3 mr-1.5" />
                        {hiddenWeaknessesCount} more weaknesses with Premium
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
            
            {/* SEO Metrics Chart moved here */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">SEO Metrics</h3>
              <SEOMetricsChart metrics={result.metrics} isPremium={isPremium} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
