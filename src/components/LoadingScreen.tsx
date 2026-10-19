import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LoadingScreenProps {
  fileName: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ fileName }) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = t.loading.steps.map((text: string) => ({
    text,
    duration: 3000 // Approximate duration
  }));

  useEffect(() => {
    // Sequential progress through steps
    const timeouts: NodeJS.Timeout[] = [];
    let elapsed = 0;

    steps.forEach((step: any, index: number) => {
      const timeout = setTimeout(() => {
        setCurrentStep(index);
      }, elapsed);
      timeouts.push(timeout);
      elapsed += step.duration;
    });

    return () => timeouts.forEach(clearTimeout);
  }, [steps]);

  return (
    <motion.div 
      key="loading"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex flex-col items-center justify-center min-h-[60vh] py-12"
    >
      <div className="bg-white/90 backdrop-blur-sm p-12 rounded-3xl shadow-xl border border-slate-100 max-w-2xl w-full text-center relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-[#009999] opacity-10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-[#009999] opacity-10 blur-3xl rounded-full pointer-events-none"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center justify-center p-4 bg-[#009999]/10 text-[#009999] rounded-2xl mb-6">
            <Sparkles className="w-10 h-10" />
          </div>
          
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            {t.loading.title}
          </h2>
          
          <p className="text-lg text-slate-600 mb-12">
            {t.loading.subtitle}
          </p>
          
          {/* Siemens "Stromimpuls" Loading Bar */}
          <div className="w-full bg-slate-100 rounded-full h-4 mb-8 overflow-hidden relative border border-slate-200 shadow-inner">
            {/* The "Current Pulse" - Sharp and fast */}
            <motion.div 
              className="h-full absolute left-0 top-0 w-32 bg-gradient-to-r from-transparent via-[#009999] via-[#00ffff] via-[#009999] to-transparent"
              animate={{ 
                left: ["-30%", "130%"],
              }}
              transition={{ 
                duration: 1.0,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            {/* Secondary faster pulse for "electrical" feel */}
            <motion.div 
              className="h-full absolute left-0 top-0 w-16 bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
              animate={{ 
                left: ["-20%", "120%"],
              }}
              transition={{ 
                duration: 0.6,
                repeat: Infinity,
                ease: "linear",
                delay: 0.1
              }}
            />
            {/* Glow effect */}
            <motion.div 
              className="absolute inset-0 bg-[#009999]/10"
              animate={{ opacity: [0.05, 0.2, 0.05] }}
              transition={{ duration: 0.4, repeat: Infinity }}
            />
          </div>
          
          <div className="flex flex-col items-center justify-center space-y-2">
            <p className="text-sm font-medium text-[#009999] animate-pulse">
              {steps[currentStep]?.text}
            </p>
            <p className="text-xs text-slate-400">
              {t.loading.analyzingFile.replace('{fileName}', fileName)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
