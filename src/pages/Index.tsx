
import { motion } from "framer-motion";
import { Hero } from "@/components/Hero";
import { DomainAnalyzer } from "@/components/DomainAnalyzer";
import { Separator } from "@/components/ui/separator";
import { UserMenu } from "@/components/UserMenu";
import { Link } from "react-router-dom";
import { BarChart3 } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="font-semibold text-lg">Domain SEO Analyzer</div>
        <div className="flex items-center gap-4">
          <Link 
            to="/analysis" 
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            <span>Analytics</span>
          </Link>
          <UserMenu />
        </div>
      </div>
      
      <Hero />
      
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="max-w-6xl mx-auto px-6 py-4"
      >
        <Separator className="opacity-30" />
      </motion.div>
      
      <DomainAnalyzer />
      
      <footer className="py-12 px-6 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Domain SEO Analyzer. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
