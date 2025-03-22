
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Sparkles, Loader2 } from "lucide-react";
import { analyzeDomain } from "@/utils/seoAnalyzer";
import { getDomainSuggestions } from "@/utils/domainPricingService";
import { AnalysisResult } from "@/types";

const formSchema = z.object({
  targetAudience: z.string().min(3, { message: "Please describe your target audience" }),
  domainExtension: z.string().min(1, { message: "Please select a domain extension" }),
  brandType: z.string().min(3, { message: "Please describe your brand or business" }),
});

type DomainGeneratorFormValues = z.infer<typeof formSchema>;

export function DomainGenerator({ onDomainSelect }: { onDomainSelect: (domain: string) => void }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const { toast } = useToast();

  const form = useForm<DomainGeneratorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetAudience: "",
      domainExtension: "com",
      brandType: "",
    },
  });

  const onSubmit = async (values: DomainGeneratorFormValues) => {
    setIsGenerating(true);
    setSuggestions([]);
    setResults([]);

    try {
      const domainSuggestions = await getDomainSuggestions(
        values.targetAudience,
        values.domainExtension,
        values.brandType
      );

      setSuggestions(domainSuggestions);
      
      // Analyze the first few domains
      const analysisPromises = domainSuggestions
        .slice(0, 3)
        .map(domain => analyzeDomain(domain));
      
      const analysisResults = await Promise.all(analysisPromises);
      setResults(analysisResults);
      
      toast({
        title: "Domain suggestions generated",
        description: `Found ${domainSuggestions.length} potential domains for your brand.`,
      });
    } catch (error) {
      console.error("Error generating domains:", error);
      toast({
        title: "Generation failed",
        description: "Unable to generate domain suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">AI Domain Name Generator</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="targetAudience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Audience</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., entrepreneurs, tech enthusiasts, fashion lovers" {...field} />
                  </FormControl>
                  <FormDescription>
                    Who is your website intended for?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="domainExtension"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain Extension</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a domain extension" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="com">.com</SelectItem>
                      <SelectItem value="net">.net</SelectItem>
                      <SelectItem value="org">.org</SelectItem>
                      <SelectItem value="io">.io</SelectItem>
                      <SelectItem value="ai">.ai</SelectItem>
                      <SelectItem value="app">.app</SelectItem>
                      <SelectItem value="tech">.tech</SelectItem>
                      <SelectItem value="co">.co</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Your preferred top-level domain
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="brandType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., e-commerce store selling eco-friendly products, SaaS for project management" {...field} />
                  </FormControl>
                  <FormDescription>
                    Briefly describe your business, industry, or brand identity
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isGenerating} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Suggestions...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Domain Ideas
                </>
              )}
            </Button>
          </form>
        </Form>
      </Card>
      
      {suggestions.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Domain Suggestions</h3>
          <div className="space-y-3">
            {suggestions.map((domain, index) => {
              const analysisResult = results.find(r => r.domain === domain);
              const isPremium = analysisResult?.metrics?.overallScore >= 8;
              
              return (
                <div 
                  key={index}
                  className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {isPremium && (
                      <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                        Premium
                      </span>
                    )}
                    <span className="font-medium">{domain}</span>
                    
                    {analysisResult?.pricing && (
                      <span className={`text-sm ${analysisResult.pricing.available ? 'text-green-600' : 'text-gray-500'}`}>
                        {analysisResult.pricing.available ? 'Available' : 'Registered'} • 
                        {analysisResult.pricing.price 
                          ? ` ${analysisResult.pricing.currency || 'USD'} ${analysisResult.pricing.price}` 
                          : ' Price unavailable'}
                      </span>
                    )}
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onDomainSelect(domain)}
                  >
                    Select
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
