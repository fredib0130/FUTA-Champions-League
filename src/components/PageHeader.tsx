import React from 'react';
import { motion } from 'motion/react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  image?: string;
}

export function PageHeader({ title, subtitle, image }: PageHeaderProps) {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 blur-[120px] rounded-full" />
        {image && (
          <img 
            src={image} 
            className="absolute inset-0 w-full h-full object-cover opacity-10 grayscale" 
            alt="background"
          />
        )}
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl sm:text-7xl font-display font-black italic tracking-tighter mb-4 uppercase">
            {title}
          </h1>
          <p className="text-xl text-white/50 max-w-2xl font-medium">
            {subtitle}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
