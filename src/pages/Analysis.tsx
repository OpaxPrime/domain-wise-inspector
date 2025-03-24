
import { motion } from "framer-motion";
import { UserMenu } from "@/components/UserMenu";
import { Separator } from "@/components/ui/separator";
import { RevenueTrafficDashboard } from "@/components/RevenueTrafficDashboard";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Analysis = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="font-semibold text-lg">Domain SEO Analyzer</div>
        <UserMenu />
      </div>
      
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-4">
        <Link 
          to="/"
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to Home</span>
        </Link>
        
        <h1 className="text-3xl font-bold mt-4 mb-2">Revenue & Traffic Analysis</h1>
        <p className="text-muted-foreground mb-6">
          Track your domain performance metrics and revenue over time
        </p>
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="max-w-6xl mx-auto px-6 py-4"
      >
        <Separator className="opacity-30" />
      </motion.div>
      
      <RevenueTrafficDashboard />
      
      <footer className="py-12 px-6 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Domain SEO Analyzer. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Analysis;
