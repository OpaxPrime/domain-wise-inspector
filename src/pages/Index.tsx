
import { motion } from "framer-motion";
import { Hero } from "@/components/Hero";
import { DomainAnalyzer } from "@/components/DomainAnalyzer";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
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
