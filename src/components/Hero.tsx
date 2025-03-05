
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;
      
      containerRef.current.style.setProperty('--mouse-x', `${x}`);
      containerRef.current.style.setProperty('--mouse-y', `${y}`);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-6xl mx-auto px-6 py-20 md:py-32 overflow-hidden"
      style={{ 
        '--mouse-x': '0.5', 
        '--mouse-y': '0.5',
      } as React.CSSProperties}
    >
      {/* Subtle background glow that follows mouse */}
      <div 
        className="absolute pointer-events-none inset-0 opacity-30 bg-gradient-radial from-primary/20 to-transparent"
        style={{ 
          background: 'radial-gradient(circle at calc(var(--mouse-x) * 100%) calc(var(--mouse-y) * 100%), rgba(var(--primary), 0.15), transparent 40%)',
        }}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-3xl mx-auto space-y-5"
      >
        <span className="inline-block py-1 px-3 text-xs font-medium tracking-wider text-primary bg-primary/10 rounded-full animate-pulse-soft">
          DOMAIN SEO ANALYZER
        </span>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
          Optimize Your 
          <span className="ml-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            Online Presence
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Analyze your domain names through the lens of search engine optimization. 
          Make data-driven decisions for your online brand.
        </p>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="pt-4"
        >
          <a 
            href="#analyzer"
            className="inline-block py-3 px-8 text-white font-medium bg-primary hover:bg-primary/90 rounded-full transition-all duration-300 shadow-lg hover:shadow-primary/20 hover:-translate-y-1"
          >
            Analyze Now
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
};
