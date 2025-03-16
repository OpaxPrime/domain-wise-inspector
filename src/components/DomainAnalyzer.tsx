
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { analyzeDomain, compareDomains } from "@/utils/seoAnalyzer";
import { AnalysisResult, DomainComparison } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, ArrowRight, Lock, Crown } from "lucide-react";
import { AnalysisResultView } from "./AnalysisResult";
import { useAuth } from "@/context/AuthContext";
import { PremiumBanner } from "./PremiumBanner";

export const DomainAnalyzer = () => {
  const [domains, setDomains] = useState<string[]>(['']);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [comparison, setComparison] = useState<DomainComparison | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const { user, updateUsage } = useAuth();
  
  // Check if user is in trial period
  const isInTrial = user?.trialEndDate && new Date(user.trialEndDate) > new Date();
  const isPremium = user?.tier === "premium" || isInTrial;

  const addDomainInput = () => {
    if (!isPremium && domains.length >= 2) {
      toast({
        title: "Free user limit",
        description: "Free users can compare up to 2 domains at a time. Upgrade to premium for unlimited comparisons.",
        variant: "destructive",
      });
      return;
    }
    
    if (domains.length < 5) {
      setDomains([...domains, '']);
    } else {
      toast({
        title: "Maximum reached",
        description: "You can compare up to 5 domains at a time",
        variant: "destructive",
      });
    }
  };

  const removeDomainInput = (index: number) => {
    if (domains.length > 1) {
      const newDomains = [...domains];
      newDomains.splice(index, 1);
      setDomains(newDomains);
    }
  };

  const updateDomain = (index: number, value: string) => {
    const newDomains = [...domains];
    newDomains[index] = value;
    setDomains(newDomains);
  };

  const handleAnalyze = async () => {
    // Filter out empty domains
    const validDomains = domains.filter(d => d.trim() !== '');
    
    if (validDomains.length === 0) {
      toast({
        title: "No domains to analyze",
        description: "Please enter at least one domain name",
        variant: "destructive",
      });
      return;
    }

    // Check if user can perform the analysis
    if (user) {
      const canProceed = await updateUsage();
      if (!canProceed) return;
    }

    setIsAnalyzing(true);
    setResults([]);
    setComparison(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (validDomains.length === 1) {
        const result = analyzeDomain(validDomains[0]);
        setResults([result]);
      } else {
        const comparisonResult = compareDomains(validDomains);
        setResults(comparisonResult.domains);
        setComparison(comparisonResult);
      }
      
      toast({
        title: "Analysis complete",
        description: `Successfully analyzed ${validDomains.length} domain${validDomains.length > 1 ? 's' : ''}`,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: "Please check your domain names and try again",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div id="analyzer" className="w-full max-w-5xl mx-auto px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="text-3xl font-bold text-center mb-8">Domain SEO Analysis</h2>
        
        {user && <PremiumBanner />}
        
        <Card className="glass-card p-6 md:p-8 shadow-soft">
          <div className="space-y-4">
            {domains.map((domain, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    value={domain}
                    onChange={(e) => updateDomain(index, e.target.value)}
                    placeholder="Enter domain name (e.g., example.com)"
                    className="bg-white/60 dark:bg-black/30 border-gray-200"
                  />
                </div>
                {domains.length > 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeDomainInput(index)}
                    className="text-gray-500 hover:text-red-500 hover:border-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            
            <div className="flex justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={addDomainInput}
                disabled={domains.length >= 5 || isAnalyzing || (!isPremium && domains.length >= 2)}
                className="text-sm group"
              >
                {!isPremium && domains.length >= 2 ? (
                  <>
                    <Lock className="h-3.5 w-3.5 mr-1 group-hover:hidden" />
                    <Crown className="h-3.5 w-3.5 mr-1 hidden group-hover:block text-amber-500" />
                    <span className="group-hover:text-amber-500">Premium feature</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" /> Add domain
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || domains.every(d => d.trim() === '')}
                className="relative overflow-hidden group"
              >
                {isAnalyzing ? (
                  <div className="flex items-center">
                    <div className="loading-dots flex">
                      <div className="h-2 w-2 bg-white rounded-full mx-0.5"></div>
                      <div className="h-2 w-2 bg-white rounded-full mx-0.5"></div>
                      <div className="h-2 w-2 bg-white rounded-full mx-0.5"></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    Analyze
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                )}
                <span className="absolute inset-0 h-full w-full scale-0 rounded-full bg-white/20 transition-all duration-300 group-hover:scale-100 group-active:bg-white/25"></span>
              </Button>
            </div>
            
            {!user && (
              <div className="mt-4 text-sm text-muted-foreground bg-muted/40 p-3 rounded-md">
                <p className="flex items-center">
                  <Lock className="h-3.5 w-3.5 mr-2" />
                  Sign in to analyze up to 5 domains per day, or sign up for premium for unlimited analyses.
                </p>
              </div>
            )}
          </div>
        </Card>
        
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mt-12 space-y-8"
            >
              {comparison && comparison.bestChoice && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="bg-primary/10 p-4 rounded-lg text-center"
                >
                  <p className="text-primary font-medium">
                    Recommended choice: <span className="font-bold">{comparison.bestChoice}</span>
                  </p>
                </motion.div>
              )}
              
              <div className="grid grid-cols-1 gap-8">
                {results.map((result, index) => (
                  <AnalysisResultView 
                    key={index} 
                    result={result} 
                    isPremium={isPremium}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
